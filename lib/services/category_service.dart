// lib/services/category_service.dart
import 'dart:convert'; // For jsonEncode/Decode
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import
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
    print("Category cache cleared.");
  }

  /// Fetches categories from cache or Firestore
  Future<List<Category>> getAllCategories() async {
    // 1. Check in-memory cache
    if (_cachedCategories != null) {
      print("Returning categories from memory cache.");
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
            print("Returning categories from SharedPreferences cache.");
            return List<Category>.from(_cachedCategories!); // Return a copy
          } catch (e) {
            print("Error decoding cached categories: $e");
            // Clear corrupted cache
            await clearCache();
          }
        }
      } else {
        print("SharedPreferences cache expired.");
        // Don't clear cache yet, Firestore fetch might fail
      }
    }

    // 3. Fetch from Firestore if cache is invalid, missing, or corrupt
    print("Fetching categories from Firestore...");
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
      print("Categories fetched from Firestore and cached.");

      return fetchedCategories; // Return the fresh list
    } catch (e) {
      print("Error fetching from Firestore: $e");
      // If Firestore fails, try returning expired cache data if available
      if (_cachedCategories != null) {
        print(
          "Firestore fetch failed, returning potentially expired cache data.",
        );
        return List<Category>.from(_cachedCategories!);
      }
      // If no cache and Firestore fails, return empty or throw error
      return []; // Or throw Exception('Failed to load categories');
    }
  }

  // --- Other methods (addCategory, getCategoryById, updateCategory, etc.) ---
  // Consider adding cache clearing logic to methods that modify data (add, update, delete)
  // For example, in addCategory, updateCategory, deleteCategory:
  // await clearCache(); // To ensure next fetch gets fresh data

  Future<void> addCategory(Category category) async {
    await _categoryRef.doc(category.id).set(category.toMap());
    await clearCache(); // Invalidate cache after adding
  }

  Future<void> updateCategory(Category category) async {
    await _categoryRef.doc(category.id).update(category.toMap());
    await clearCache(); // Invalidate cache after updating
  }

  Future<void> deleteCategory(String id) async {
    // ... (delete subcollection logic) ...
    await _categoryRef.doc(id).delete();
    await clearCache(); // Invalidate cache after deleting
  }

  // getWordsFromSelectedCategories remains the same, as it operates on the fetched list
  List<String> getWordsFromSelectedCategories(
    List<Category> selectedCategories,
  ) {
    // ... (existing logic) ...
    final random = Random();
    List<String> allWords = [];

    if (selectedCategories.length > 5) {
      // Combine all words from all categories
      allWords =
          selectedCategories
              .expand((category) => List<String>.from(category.words))
              .toList();
      allWords.shuffle(random);

      return allWords.take(30).toList(); // Pick any 30 words
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

  // Methods like getWordsFromCategory, getRandomWords, etc., might need adjustment
  // if they were previously fetching directly from Firestore subcollections.
  // It's often simpler to just use the words list from the cached Category object.
  Future<List<String>> getWordsFromCategory(String categoryId) async {
    // Option 1: Use cached data (assumes getAllCategories was called)
    final category = _cachedCategories?.firstWhere(
      (cat) => cat.id == categoryId,
      orElse: () => Category(id: '', name: '', icon: '', words: []),
    );
    if (category != null && category.id.isNotEmpty) {
      return category.words;
    }
    // Option 2: Fallback to Firestore if not found in cache (adds complexity and reads)
    // print("Fetching words directly for category $categoryId (cache miss or not loaded)");
    // final snapshot = await _categoryRef.doc(categoryId).collection('words').get();
    // return snapshot.docs.map((doc) => (doc.data())['text'] as String).toList();
    return []; // Return empty if not found in cache (simpler)
  }

  Future<List<String>> getRandomWords(String categoryId, int n) async {
    final allWords = await getWordsFromCategory(
      categoryId,
    ); // Uses the updated method above
    allWords.shuffle();
    return allWords.take(n).toList();
  }

  // ... (addWordToCategory, deleteWordFromCategory might also need clearCache())
  Future<void> addWordToCategory(String categoryId, String word) async {
    // Assuming your Firestore structure stores words directly in the category doc array
    await _categoryRef.doc(categoryId).update({
      'words': FieldValue.arrayUnion([word]),
    });
    await clearCache();
  }

  Future<void> deleteWordFromCategory(String categoryId, String word) async {
    // Assuming words are in the category doc array
    await _categoryRef.doc(categoryId).update({
      'words': FieldValue.arrayRemove([word]),
    });
    await clearCache();
  }
}
