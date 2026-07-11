import 'dart:convert'; // For jsonEncode/Decode
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import
import 'package:connectivity_plus/connectivity_plus.dart'; //
import '../models/category.dart';
import 'dart:math';

class CategoryService {
  // Singleton Pattern
  static final CategoryService _instance = CategoryService._internal();
  factory CategoryService() => _instance;
  CategoryService._internal();

  final _categoryRef = FirebaseFirestore.instance.collection('categories');
  static const String _cacheKey =
      'categories_cache'; // Key for shared_preferences
  static const String _cacheTimestampKey =
      'categories_cache_timestamp'; // Key for timestamp
  static const Duration _cacheDuration = Duration(
    hours: 24,
  ); // How long cache is valid
  // In-memory cache
  List<Category>? _cachedCategories;
  DateTime? _lastFirestoreFetch; // Track last successful fetch
  static const Duration _refreshCooldown = Duration(
    minutes: 10,
  ); // Cooldown for forceRefresh

  // Helper to get SharedPreferences instance
  Future<SharedPreferences> get _prefs async =>
      await SharedPreferences.getInstance();

  /// Clears both in-memory and SharedPreferences cache
  Future<void> clearCache() async {
    _cachedCategories = null;
    _lastFirestoreFetch = null;
    final prefs = await _prefs;
    await prefs.remove(_cacheKey);
    await prefs.remove(_cacheTimestampKey);
    print("Category cache cleared.");
  }

  /// Fetches categories from cache or Firestore.
  /// Set [forceRefresh] to true to bypass cache and fetch fresh from Firestore.
  Future<List<Category>> getAllCategories({bool forceRefresh = false}) async {
    // 1. Check in-memory cache (only if not forcing refresh)
    if (_cachedCategories != null && !forceRefresh) {
      print("✅ [CACHE] Returning categories from IN-MEMORY cache.");
      return List<Category>.from(_cachedCategories!);
    }

    final prefs = await _prefs;
    final now = DateTime.now();

    // 2. Check refresh cooldown if forcing refresh
    if (forceRefresh && _lastFirestoreFetch != null) {
      final timeSinceLastFetch = now.difference(_lastFirestoreFetch!);
      if (timeSinceLastFetch < _refreshCooldown) {
        print(
          "ℹ️ [FETCH] Cooldown active (${_refreshCooldown.inMinutes - timeSinceLastFetch.inMinutes}m left). Returning cache to save reads.",
        );
        if (_cachedCategories != null) {
          return List<Category>.from(_cachedCategories!);
        }
        // If in-memory is null, try SharedPreferences before hitting Firestore
        forceRefresh = false;
      }
    }

    // 3. Check SharedPreferences cache validity (only if not forcing refresh)
    if (!forceRefresh) {
      final cacheTimestampMillis = prefs.getInt(_cacheTimestampKey);
      if (cacheTimestampMillis != null) {
        final cacheTime = DateTime.fromMillisecondsSinceEpoch(
          cacheTimestampMillis,
        );
        if (now.difference(cacheTime) < _cacheDuration) {
          final cachedJsonString = prefs.getString(_cacheKey);
          if (cachedJsonString != null) {
            try {
              final List<dynamic> jsonList = jsonDecode(cachedJsonString);
              _cachedCategories =
                  jsonList.map((json) => Category.fromJson(json)).toList();
              _lastFirestoreFetch =
                  cacheTime; // Sync last fetch with cache time
              print("✅ [CACHE] Returning categories from SHARED PREFS cache.");
              return List<Category>.from(_cachedCategories!);
            } catch (e) {
              print("⚠️ [CACHE] Error decoding cached categories: $e");
              await clearCache(); // Clear corrupted cache
            }
          }
        } else {
          print("ℹ️ [CACHE] SharedPreferences cache expired.");
        }
      }
    } else {
      print("ℹ️ [FETCH] Force refresh requested. Bypassing cache.");
    }

    // 3. No valid cache. Check for internet.
    List<ConnectivityResult> connectivityResult;
    try {
      connectivityResult = await Connectivity().checkConnectivity();
    } catch (e) {
      connectivityResult = [
        ConnectivityResult.none,
      ]; // Default to none if check fails
    }

    final bool hasInternet =
        !connectivityResult.contains(ConnectivityResult.none);

    // 4. Fetch from Firestore if internet is available
    if (hasInternet) {
      print(
        "ℹ️ [NETWORK] No valid cache. Fetching from FIRESTORE...",
      ); // Changed
      try {
        final snapshot = await _categoryRef.get();
        debugLogCategoryFetch("Firestore fetch successful", {
          'docCount': snapshot.docs.length,
          'hasInternet': hasInternet,
        });

        final fetchedCategories =
            snapshot.docs.map((doc) => Category.fromDocument(doc)).toList();

        // Update in-memory cache and last fetch time
        _cachedCategories = List<Category>.from(fetchedCategories);
        _lastFirestoreFetch = now;

        // Save to SharedPreferences
        final List<Map<String, dynamic>> jsonList =
            fetchedCategories.map((category) => category.toJson()).toList();
        await prefs.setString(_cacheKey, jsonEncode(jsonList));
        await prefs.setInt(_cacheTimestampKey, now.millisecondsSinceEpoch);
        print("✅ [NETWORK] Categories fetched from FIRESTORE and cached.");

        return fetchedCategories; // Return the fresh list
      } on FirebaseException catch (e) {
        debugLogCategoryFetch("FirebaseException during Firestore fetch", {
          'code': e.code,
          'message': e.message,
          'plugin': e.plugin,
          'stackTrace': e.toString(),
        });
        print("❌ [NETWORK] FirebaseException: ${e.code} - ${e.message}");
        // Don't return. Fall through to the offline fallback logic.
      } catch (e) {
        debugLogCategoryFetch("Exception during Firestore fetch", {
          'error': e.toString(),
          'errorType': e.runtimeType.toString(),
        });
        print(
          "❌ [NETWORK] Error fetching from Firestore (server error?): $e",
        ); // Changed
        // Don't return. Fall through to the offline fallback logic.
      }
    } else {
      debugLogCategoryFetch("No internet connection", {
        'hasInternet': hasInternet,
      });
    }

    // 5. If we reach here, we couldn't get online data.
    // Try to return the cached categories from SharedPreferences even if expired
    final cachedJsonString = prefs.getString(_cacheKey);
    if (cachedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(cachedJsonString);
        final fallbackCategories =
            jsonList.map((json) => Category.fromJson(json)).toList();
        _cachedCategories = List<Category>.from(fallbackCategories);
        print("✅ [CACHE-FALLBACK] Returning expired SHARED PREFS cache because network fetch failed/unavailable.");
        return List<Category>.from(_cachedCategories!);
      } catch (e) {
        print("⚠️ [CACHE-FALLBACK] Error decoding cached categories: $e");
      }
    }

    print("ℹ️ [FETCH] No categories fetched from Firestore.");
    return [];
  }

  // /// (NEW) Helper to load words from local assets
  // Future<List<String>> _getWordsFromLocalFile() async {
  //   try {
  //     final jsonString = await rootBundle.loadString('assets/data.json');
  //     final Map<String, dynamic> jsonMap = json.decode(jsonString);
  //     final List<dynamic> wordsDynamic = jsonMap['words'] ?? [];
  //     return wordsDynamic.map((e) => e.toString()).toList();
  //   } catch (e) {
  //     print("Error loading local words from data.json: $e"); // Changed
  //     return [];
  //   }
  // }

  // --- Other methods (addCategory, getCategoryById, updateCategory, etc.) ---

  Future<void> addCategory(Category category) async {
    await _categoryRef.doc(category.id).set(category.toMap());
    await clearCache(); // Invalidate cache after adding
  }

  Future<void> updateCategory(Category category) async {
    await _categoryRef.doc(category.id).update(category.toMap());
    await clearCache(); // Invalidate cache after updating
  }

  Future<void> deleteCategory(String id) async {
    await _categoryRef.doc(id).delete();
    await clearCache(); // Invalidate cache after deleting
  }

  // getWordsFromSelectedCategories remains the same, as it operates on the fetched list
  List<String> getWordsFromSelectedCategories(
    List<Category> selectedCategories,
  ) {
    final random = Random();
    List<String> allWords = [];

    if (selectedCategories.length > 5) {
      allWords =
          selectedCategories
              .expand((category) => List<String>.from(category.words))
              .toList();
      allWords.shuffle(random);
      return allWords.take(30).toList();
    } else {
      for (var category in selectedCategories) {
        final words = List<String>.from(category.words);
        words.shuffle(random);
        allWords.addAll(words.take(10)); // Pick up to 10 from each
      }
      allWords.shuffle(random);
      return allWords;
    }
  }

  Future<List<String>> getWordsFromCategory(String categoryId) async {
    final category = _cachedCategories?.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => Category(id: '', name: '', icon: '', words: []),
    );
    if (category != null && category.id.isNotEmpty) {
      return category.words;
    }
    return [];
  }

  Future<List<String>> getRandomWords(String categoryId, int n) async {
    final allWords = await getWordsFromCategory(categoryId);
    allWords.shuffle();
    return allWords.take(n).toList();
  }

  Future<void> addWordToCategory(String categoryId, String word) async {
    await _categoryRef.doc(categoryId).update({
      'words': FieldValue.arrayUnion([word]),
    });
    await clearCache();
  }

  Future<void> deleteWordFromCategory(String categoryId, String word) async {
    await _categoryRef.doc(categoryId).update({
      'words': FieldValue.arrayRemove([word]),
    });
    await clearCache();
  }

  /// Retrieve cached categories directly from SharedPreferences (even if expired)
  Future<List<Category>> getCachedCategories() async {
    final prefs = await _prefs;
    final cachedJsonString = prefs.getString(_cacheKey);
    if (cachedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(cachedJsonString);
        final cached = jsonList.map((json) => Category.fromJson(json)).toList();
        _cachedCategories = List<Category>.from(cached);
        return cached;
      } catch (e) {
        print("⚠️ [CACHE-FALLBACK] Error decoding cached categories: $e");
      }
    }
    return [];
  }

  /// Debug method to log category fetching errors in a structured way
  void debugLogCategoryFetch(String message, Map<String, dynamic> details) {
    final timestamp = DateTime.now().toIso8601String();
    final formattedDetails = details.entries
        .map((e) => '  ${e.key}: ${e.value}')
        .join('\n');
    print('🔍 [DEBUG] [$timestamp] $message\n$formattedDetails');
  }

  /// Helper method to get detailed error information for category fetching
  Future<Map<String, dynamic>> getDebugInfo() async {
    final prefs = await _prefs;
    final connectivityResult = await Connectivity().checkConnectivity();
    final hasInternet = !connectivityResult.contains(ConnectivityResult.none);
    final cacheTimestampMillis = prefs.getInt(_cacheTimestampKey);
    final cacheExists = prefs.containsKey(_cacheKey);

    return {
      'timestamp': DateTime.now().toIso8601String(),
      'hasInternet': hasInternet,
      'connectivityStatus': connectivityResult.toString(),
      'inMemoryCacheExists': _cachedCategories != null,
      'inMemoryCacheSize': _cachedCategories?.length ?? 0,
      'sharedPrefsCacheExists': cacheExists,
      'cacheTimestamp':
          cacheTimestampMillis != null
              ? DateTime.fromMillisecondsSinceEpoch(
                cacheTimestampMillis,
              ).toIso8601String()
              : 'null',
      'lastFirestoreFetch': _lastFirestoreFetch?.toIso8601String() ?? 'null',
      'cacheValid':
          cacheTimestampMillis != null &&
          DateTime.now().difference(
                DateTime.fromMillisecondsSinceEpoch(cacheTimestampMillis),
              ) <
              _cacheDuration,
    };
  }
}
