import 'dart:convert'; // For jsonEncode/Decode
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/foundation.dart' show debugPrint;
import 'package:guess_up/services/storage_service.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import
import 'package:connectivity_plus/connectivity_plus.dart'; //
import '../models/category.dart';
import 'dart:math';

class CategoryService {
  // Singleton Pattern
  static final CategoryService _instance = CategoryService._internal();
  factory CategoryService() => _instance;
  CategoryService._internal();

  CollectionReference<Map<String, dynamic>>? get _categoryRef {
    try {
      return FirebaseFirestore.instance.collection('categories');
    } catch (_) {
      return null;
    }
  }

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

    // If forceRefresh is requested, clear in-memory cache to force fresh Firestore fetch
    if (forceRefresh) {
      print(
        "ℹ️ [FETCH] User requested force refresh. Clearing cache & querying Firestore.",
      );
      _cachedCategories = null;
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
        final snapshot = await _categoryRef?.get();
        if (snapshot != null) {
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
        }
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

    // 5. Fallback Level 1: Cached categories in SharedPreferences (even if expired)
    final cachedJsonString = prefs.getString(_cacheKey);
    if (cachedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(cachedJsonString);
        final fallbackCategories =
            jsonList.map((json) => Category.fromJson(json)).toList();
        if (fallbackCategories.isNotEmpty) {
          _cachedCategories = List<Category>.from(fallbackCategories);
          print(
            "✅ [CACHE-FALLBACK] Returning SHARED PREFS cache because network fetch failed/unavailable.",
          );
          return List<Category>.from(_cachedCategories!);
        }
      } catch (e) {
        print("⚠️ [CACHE-FALLBACK] Error decoding cached categories: $e");
      }
    }

    // 6. Fallback Level 2: Local assets/data.json when no cache is present
    try {
      final localWords = await StorageService().getWordsFromLocalFile();
      if (localWords.isNotEmpty) {
        final localCategory = Category(
          id: "classic_party",
          name: "Classic Party",
          icon: "🎉",
          words: localWords,
        );
        _cachedCategories = [localCategory];
        print(
          "✅ [LOCAL-FALLBACK] Returning bundled local deck from assets/data.json.",
        );
        return [localCategory];
      }
    } catch (e) {
      print("⚠️ [LOCAL-FALLBACK] Error reading local data.json: $e");
    }

    print(
      "ℹ️ [FETCH] No categories fetched from Firestore, cache, or local assets.",
    );
    return [];
  }

  Future<void> addCategory(Category category) async {
    try {
      await _categoryRef?.doc(category.id).set(category.toMap());
    } catch (e) {
      print("⚠️ Error adding category to Firestore: $e");
    }
    await clearCache();
  }

  Future<void> updateCategory(Category category) async {
    try {
      await _categoryRef?.doc(category.id).update(category.toMap());
    } catch (e) {
      print("⚠️ Error updating category in Firestore: $e");
    }
    await clearCache();
  }

  /// Admin method to update category status (active/inactive) and hex color in Firestore
  Future<void> updateCategoryStatusAndColor(
    String categoryId, {
    bool? isAvailable,
    String? colorHex,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (isAvailable != null) {
        updates['isAvailable'] = isAvailable;
        updates['status'] = isAvailable ? 'active' : 'inactive';
      }
      if (colorHex != null) {
        updates['color'] = colorHex;
        updates['colorHex'] = colorHex;
      }
      if (updates.isNotEmpty) {
        await _categoryRef?.doc(categoryId).update(updates);
      }
    } catch (e) {
      debugPrint("⚠️ Error updating category status/color in Firestore: $e");
    }
    await clearCache();
  }

  Future<void> deleteCategory(String id) async {
    try {
      await _categoryRef?.doc(id).delete();
    } catch (e) {
      print("⚠️ Error deleting category from Firestore: $e");
    }
    await clearCache();
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
    try {
      await _categoryRef?.doc(categoryId).update({
        'words': FieldValue.arrayUnion([word]),
      });
    } catch (e) {
      print("⚠️ Error adding word to category in Firestore: $e");
    }
    await clearCache();
  }

  Future<void> deleteWordFromCategory(String categoryId, String word) async {
    try {
      await _categoryRef?.doc(categoryId).update({
        'words': FieldValue.arrayRemove([word]),
      });
    } catch (e) {
      print("⚠️ Error deleting word from category in Firestore: $e");
    }
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
