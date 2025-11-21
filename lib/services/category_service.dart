import 'dart:convert'; // For jsonEncode/Decode
import 'package:flutter/services.dart' show rootBundle; // For rootBundle
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import
import 'package:connectivity_plus/connectivity_plus.dart'; // Import connectivity
import '../models/category.dart';
import 'dart:math';

class CategoryService {
  final _categoryRef = FirebaseFirestore.instance.collection('categories');
  static const String _cacheKey =
      'categories_cache'; // Key for shared_preferences
  static const String _cacheTimestampKey =
      'categories_cache_timestamp'; // Key for timestamp
  static final Duration _cacheDuration = const Duration(
    hours: 24,
  ); // How long cache is valid

  // In-memory cache
  List<Category>? _cachedCategories;

  // Helper to get SharedPreferences instance
  Future<SharedPreferences> get _prefs async =>
      await SharedPreferences.getInstance();

  /// Clears both in-memory and SharedPreferences cache
  Future<void> clearCache() async {
    _cachedCategories = null;
    final prefs = await _prefs;
    await prefs.remove(_cacheKey);
    await prefs.remove(_cacheTimestampKey);
    print("Category cache cleared."); // Changed to print
  }

  /// Fetches categories from cache or Firestore
  Future<List<Category>> getAllCategories() async {
    // 1. Check in-memory cache
    if (_cachedCategories != null) {
      print("✅ [CACHE] Returning categories from IN-MEMORY cache."); // ADDED
      return List<Category>.from(_cachedCategories!); // Return a copy
    }

    final prefs = await _prefs;
    final now = DateTime.now();

    // 2. Check SharedPreferences cache validity
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
            print(
              "✅ [CACHE] Returning categories from SHARED PREFS cache.",
            ); // ADDED
            return List<Category>.from(_cachedCategories!); // Return a copy
          } catch (e) {
            print("Error decoding cached categories: $e"); // Changed
            await clearCache(); // Clear corrupted cache
          }
        }
      } else {
        print("ℹ️ [CACHE] SharedPreferences cache expired."); // Changed
      }
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
        final fetchedCategories =
            snapshot.docs.map((doc) => Category.fromDocument(doc)).toList();

        // Update in-memory cache
        _cachedCategories = List<Category>.from(
          fetchedCategories,
        ); // Store a copy

        // Save to SharedPreferences
        final List<Map<String, dynamic>> jsonList =
            fetchedCategories.map((category) => category.toJson()).toList();
        await prefs.setString(_cacheKey, jsonEncode(jsonList));
        await prefs.setInt(_cacheTimestampKey, now.millisecondsSinceEpoch);
        print(
          "✅ [NETWORK] Categories fetched from FIRESTORE and cached.",
        ); // Changed

        return fetchedCategories; // Return the fresh list
      } catch (e) {
        print(
          "❌ [NETWORK] Error fetching from Firestore (server error?): $e",
        ); // Changed
        // Don't return. Fall through to the offline fallback logic.
      }
    }

    // 5. Fallback: No internet OR Firebase failed
    print(
      "ℹ️ [FALLBACK] No internet or Firebase failed. Loading from LOCAL ASSETS...",
    ); // Changed
    try {
      final localWords = await _getWordsFromLocalFile();
      if (localWords.isNotEmpty) {
        // Create a single "dummy" category for these local words
        final localCategory = Category(
          id: "local_fallback", // Special ID to identify this
          name: "Local Words",
          icon: "📦",
          words: localWords,
        );
        print(
          "✅ [FALLBACK] Returning categories from LOCAL ASSETS (data.json).",
        ); // ADDED
        return [localCategory];
      } else {
        // Absolute last resort
        print(
          "❌ [FALLBACK] No local words found. Returning empty list.",
        ); // ADDED
        return [];
      }
    } catch (e) {
      print("❌ [FALLBACK] Error loading local fallback words: $e"); // Changed
      return []; // Return empty if local file also fails
    }
  }

  /// (NEW) Helper to load words from local assets
  Future<List<String>> _getWordsFromLocalFile() async {
    try {
      final jsonString = await rootBundle.loadString('assets/data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      final List<dynamic> wordsDynamic = jsonMap['words'] ?? [];
      return wordsDynamic.map((e) => e.toString()).toList();
    } catch (e) {
      print("Error loading local words from data.json: $e"); // Changed
      return [];
    }
  }

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
}
