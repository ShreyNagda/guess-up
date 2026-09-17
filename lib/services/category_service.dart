import 'dart:convert';
import 'dart:math';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart' show debugPrint;
import 'package:flutter/services.dart' show rootBundle;
import 'package:hive_flutter/hive_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/category.dart';
import 'storage_service.dart';

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

  // Client Device Storage Keys (Hive Box Storage)
  static const String _categoriesCacheBoxName = 'categories_cache_box';
  static const String _deviceStorageKey = 'categories_device_storage';
  static const String _deviceStorageTimestampKey =
      'categories_device_storage_timestamp';

  // Legacy SharedPreferences keys for seamless one-time migration
  static const String _legacyCacheKey = 'categories_cache';
  static const String _legacyCacheTimestampKey = 'categories_cache_timestamp';

  Box? _cacheBox;

  Future<Box> get _box async {
    if (_cacheBox != null && _cacheBox!.isOpen) {
      return _cacheBox!;
    }
    _cacheBox = await Hive.openBox(_categoriesCacheBoxName);
    await _migrateSharedPreferencesIfNeeded(_cacheBox!);
    return _cacheBox!;
  }

  Future<void> _migrateSharedPreferencesIfNeeded(Box box) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (prefs.containsKey(_deviceStorageKey) ||
          prefs.containsKey(_legacyCacheKey)) {
        final oldData =
            prefs.getString(_deviceStorageKey) ??
            prefs.getString(_legacyCacheKey);
        final oldTimestamp =
            prefs.getInt(_deviceStorageTimestampKey) ??
            prefs.getInt(_legacyCacheTimestampKey);
        if (oldData != null) {
          await box.put(_deviceStorageKey, oldData);
          if (oldTimestamp != null) {
            await box.put(_deviceStorageTimestampKey, oldTimestamp);
          }
          debugPrint(
            "📦 [MIGRATION] Migrated SharedPreferences category cache to Hive box '$_categoriesCacheBoxName'.",
          );
        }
        await prefs.remove(_deviceStorageKey);
        await prefs.remove(_deviceStorageTimestampKey);
        await prefs.remove(_legacyCacheKey);
        await prefs.remove(_legacyCacheTimestampKey);
      }
    } catch (e) {
      debugPrint("⚠️ Migration check error: $e");
    }
  }

  // In-memory reference
  List<Category>? _cachedCategories;
  List<Category> get cachedCategories => _cachedCategories ?? [];
  DateTime? _lastFirestoreFetch; // Track last successful fetch

  /// Persists categories permanently to Hive client device storage
  Future<void> _saveToDeviceStorage(List<Category> categories) async {
    try {
      _cachedCategories = List<Category>.from(categories);
      final box = await _box;
      final List<Map<String, dynamic>> jsonList =
          categories.map((c) => c.toJson()).toList();
      await box.put(_deviceStorageKey, jsonEncode(jsonList));
      await box.put(
        _deviceStorageTimestampKey,
        DateTime.now().millisecondsSinceEpoch,
      );
      _lastFirestoreFetch = DateTime.now();
      debugPrint(
        "✅ [HIVE-STORAGE] Saved ${categories.length} categories permanently to Hive box.",
      );
    } catch (e) {
      debugPrint("⚠️ Error saving categories to Hive storage: $e");
    }
  }

  /// Clears in-memory and Hive client device storage
  Future<void> clearDeviceStorage() async {
    _cachedCategories = null;
    _lastFirestoreFetch = null;
    final box = await _box;
    await box.delete(_deviceStorageKey);
    await box.delete(_deviceStorageTimestampKey);
    debugPrint("🧹 Permanent Hive client device storage cleared.");
  }

  /// Alias for backward compatibility
  Future<void> clearCache() async => clearDeviceStorage();

  /// Load offline fallback categories directly from bundled assets/data.json
  Future<List<Category>> loadCategoriesFromDataJson() async {
    try {
      final jsonString = await rootBundle.loadString('assets/data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);

      if (jsonMap.containsKey('categories') && jsonMap['categories'] is List) {
        final List<dynamic> catList = jsonMap['categories'];
        return catList
            .map((c) => Category.fromJson(c as Map<String, dynamic>))
            .toList();
      } else if (jsonMap.containsKey('words') && jsonMap['words'] is List) {
        final List<dynamic> words = jsonMap['words'];
        return [
          Category(
            id: 'classic_party',
            name: 'Classic Party',
            icon: '🎉',
            words: words.map((e) => e.toString()).toList(),
          ),
        ];
      }
    } catch (e) {
      debugPrint("⚠️ Error reading offline fallback from data.json: $e");
    }
    return [];
  }

  /// Live real-time stream of categories/decks from Firestore or offline device storage
  Stream<List<Category>> streamDecks() {
    try {
      if (_categoryRef == null) {
        return Stream.fromFuture(getAllCategories());
      }
      return _categoryRef!
          .snapshots()
          .asyncMap((snapshot) async {
            if (snapshot.docs.isNotEmpty) {
              final categories =
                  snapshot.docs
                      .map((doc) => Category.fromDocument(doc))
                      .where((d) => d.isAvailable)
                      .toList();
              // Persist stream update to local device storage in background
              _saveToDeviceStorage(categories);
              return categories;
            }
            return await getAllCategories();
          })
          .handleError((e) async {
            debugPrint("Error streaming categories from Firestore: $e");
            return await getAllCategories();
          });
    } catch (e) {
      debugPrint("Firestore initialization error in streamDecks: $e");
      return Stream.fromFuture(getAllCategories());
    }
  }

  /// Invalidates in-memory category caches
  Future<void> invalidateCache() async {
    _cachedCategories = null;
    _lastFirestoreFetch = null;
  }

  /// Gets all categories using Hive client device storage first
  Future<List<Category>> getAllCategories({bool forceRefresh = false}) async {
    // 1. Check in-memory cache (if not forcing refresh)
    if (_cachedCategories != null && !forceRefresh) {
      debugPrint("✅ [HIVE-STORAGE] Returning categories from IN-MEMORY list.");
      return List<Category>.from(_cachedCategories!);
    }

    final box = await _box;

    if (forceRefresh) {
      debugPrint(
        "ℹ️ [HIVE-STORAGE] Force refresh requested. Querying Firestore to update Hive storage...",
      );
      _cachedCategories = null;
    }

    final storedJsonString = box.get(_deviceStorageKey) as String?;

    // 2. Read from permanent local Hive storage if available (and not forcing refresh)
    if (!forceRefresh && storedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(storedJsonString);
        _cachedCategories =
            jsonList.map((json) => Category.fromJson(json)).toList();
        final storedTimestamp = box.get(_deviceStorageTimestampKey) as int?;
        if (storedTimestamp != null) {
          _lastFirestoreFetch = DateTime.fromMillisecondsSinceEpoch(
            storedTimestamp,
          );
        }
        debugPrint(
          "✅ [HIVE-STORAGE] Returning ${_cachedCategories!.length} categories from PERMANENT HIVE DEVICE STORAGE.",
        );
        return List<Category>.from(_cachedCategories!);
      } catch (e) {
        debugPrint("⚠️ [HIVE-STORAGE] Error decoding stored categories: $e");
      }
    }

    // 3. Connectivity check for network update
    List<ConnectivityResult> connectivityResult;
    try {
      connectivityResult = await Connectivity().checkConnectivity();
    } catch (e) {
      connectivityResult = [ConnectivityResult.none];
    }

    final bool hasInternet =
        !connectivityResult.contains(ConnectivityResult.none);

    // 4. Fetch from Firestore if internet is available
    if (hasInternet) {
      debugPrint(
        "ℹ️ [NETWORK] Fetching game data from Firestore to save/update Hive storage...",
      );
      try {
        final snapshot = await _categoryRef?.get();
        if (snapshot != null && snapshot.docs.isNotEmpty) {
          final fetchedCategories =
              snapshot.docs.map((doc) => Category.fromDocument(doc)).toList();

          await _saveToDeviceStorage(fetchedCategories);
          return fetchedCategories;
        }
      } on FirebaseException catch (e) {
        debugLogCategoryFetch("FirebaseException during Firestore fetch", {
          'code': e.code,
          'message': e.message,
          'plugin': e.plugin,
        });
        debugPrint("❌ [NETWORK] FirebaseException: ${e.code} - ${e.message}");
      } catch (e) {
        debugLogCategoryFetch("Exception during Firestore fetch", {
          'error': e.toString(),
        });
        debugPrint("❌ [NETWORK] Error fetching from Firestore: $e");
      }
    } else {
      debugLogCategoryFetch("No internet connection", {
        'hasInternet': hasInternet,
      });
    }

    // 5. Fallback Level 1: Hive storage if network check/fetch failed
    if (storedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(storedJsonString);
        final fallbackCategories =
            jsonList.map((json) => Category.fromJson(json)).toList();
        if (fallbackCategories.isNotEmpty) {
          _cachedCategories = List<Category>.from(fallbackCategories);
          debugPrint(
            "✅ [HIVE-STORAGE] Loaded ${fallbackCategories.length} categories from HIVE STORAGE (Offline/Network fallback).",
          );
          return List<Category>.from(_cachedCategories!);
        }
      } catch (e) {
        debugPrint("⚠️ [HIVE-STORAGE] Error decoding stored categories: $e");
      }
    }

    // 6. Fallback Level 2: Seed Hive storage from bundled assets/data.json
    try {
      final offlineCategories = await loadCategoriesFromDataJson();
      if (offlineCategories.isNotEmpty) {
        await _saveToDeviceStorage(offlineCategories);
        debugPrint(
          "✅ [HIVE-STORAGE] Seeded HIVE DEVICE STORAGE with ${offlineCategories.length} categories from bundled assets/data.json.",
        );
        return List<Category>.from(_cachedCategories!);
      }
    } catch (e) {
      debugPrint("⚠️ [HIVE-STORAGE] Error reading local data.json: $e");
    }

    debugPrint(
      "ℹ️ [HIVE-STORAGE] No categories found on Hive storage or network.",
    );
    return [];
  }

  Future<void> addCategory(Category category) async {
    try {
      await _categoryRef?.doc(category.id).set(category.toMap());
    } catch (e) {
      debugPrint("⚠️ Error adding category to Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  Future<void> updateCategory(Category category) async {
    try {
      await _categoryRef?.doc(category.id).update(category.toMap());
    } catch (e) {
      debugPrint("⚠️ Error updating category in Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  Future<void> updateCategoryStatusAndColor(
    String categoryId, {
    bool? isAvailable,
    String? color,
  }) async {
    try {
      final updates = <String, dynamic>{};
      if (isAvailable != null) {
        updates['isAvailable'] = isAvailable;
      }
      if (color != null) {
        updates['color'] = color;
      }
      if (updates.isNotEmpty) {
        await _categoryRef?.doc(categoryId).update(updates);
      }
    } catch (e) {
      debugPrint("⚠️ Error updating category status/color in Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  Future<void> deleteCategory(String id) async {
    try {
      await _categoryRef?.doc(id).delete();
    } catch (e) {
      debugPrint("⚠️ Error deleting category from Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  List<String> getWordsFromSelectedCategories(
    List<Category> selectedCategories,
  ) {
    if (selectedCategories.isEmpty) return [];
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
        allWords.addAll(words.take(10));
      }
      allWords.shuffle(random);
      return allWords;
    }
  }

  List<Category> _mergeCustomDecks(List<Category> categories) {
    final customDecks = GameStorageService().getCustomDecks();
    if (customDecks.isEmpty) return categories;

    final existingIds = categories.map((c) => c.id).toSet();
    final merged = List<Category>.from(categories);
    for (final custom in customDecks) {
      if (!existingIds.contains(custom.id)) {
        merged.add(custom);
      }
    }
    return merged;
  }

  /// Returns categories merged with custom user decks stored in GameStorageService
  Future<List<Category>> getCategories({bool forceRefresh = false}) async {
    final categories = await getAllCategories(forceRefresh: forceRefresh);
    return _mergeCustomDecks(categories);
  }

  Future<List<String>> getWordsFromCategory(String categoryId) async {
    if (_cachedCategories != null) {
      for (final cat in _cachedCategories!) {
        if (cat.id == categoryId) return cat.words;
      }
    }
    final categories = await getAllCategories();
    for (final cat in categories) {
      if (cat.id == categoryId) return cat.words;
    }
    final customDecks = GameStorageService().getCustomDecks();
    for (final custom in customDecks) {
      if (custom.id == categoryId) return custom.words;
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
      debugPrint("⚠️ Error adding word to category in Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  Future<void> deleteWordFromCategory(String categoryId, String word) async {
    try {
      await _categoryRef?.doc(categoryId).update({
        'words': FieldValue.arrayRemove([word]),
      });
    } catch (e) {
      debugPrint("⚠️ Error deleting word from category in Firestore: $e");
    }
    await getAllCategories(forceRefresh: true);
  }

  /// Retrieve stored categories directly from Hive client device storage
  Future<List<Category>> getStoredCategories() async {
    final box = await _box;
    final storedJsonString = box.get(_deviceStorageKey) as String?;
    if (storedJsonString != null) {
      try {
        final List<dynamic> jsonList = jsonDecode(storedJsonString);
        final stored = jsonList.map((json) => Category.fromJson(json)).toList();
        _cachedCategories = List<Category>.from(stored);
        return stored;
      } catch (e) {
        debugPrint("⚠️ [HIVE-STORAGE] Error decoding stored categories: $e");
      }
    }
    return [];
  }

  /// Alias for backward compatibility
  Future<List<Category>> getCachedCategories() async => getStoredCategories();

  /// Debug method to log category fetching errors in a structured way
  void debugLogCategoryFetch(String message, Map<String, dynamic> details) {
    final timestamp = DateTime.now().toIso8601String();
    final formattedDetails = details.entries
        .map((e) => '  ${e.key}: ${e.value}')
        .join('\n');
    debugPrint('🔍 [DEBUG] [$timestamp] $message\n$formattedDetails');
  }

  /// Helper method to get detailed debug info on Hive client device storage status
  Future<Map<String, dynamic>> getDebugInfo() async {
    final box = await _box;
    final connectivityResult = await Connectivity().checkConnectivity();
    final hasInternet = !connectivityResult.contains(ConnectivityResult.none);
    final deviceStorageTimestamp = box.get(_deviceStorageTimestampKey) as int?;
    final storageExists = box.containsKey(_deviceStorageKey);

    return {
      'timestamp': DateTime.now().toIso8601String(),
      'hasInternet': hasInternet,
      'connectivityStatus': connectivityResult.toString(),
      'inMemoryCacheExists': _cachedCategories != null,
      'inMemoryCacheSize': _cachedCategories?.length ?? 0,
      'deviceStorageExists': storageExists,
      'deviceStorageTimestamp':
          deviceStorageTimestamp != null
              ? DateTime.fromMillisecondsSinceEpoch(
                deviceStorageTimestamp,
              ).toIso8601String()
              : 'null',
      'lastFirestoreFetch': _lastFirestoreFetch?.toIso8601String() ?? 'null',
    };
  }
}
