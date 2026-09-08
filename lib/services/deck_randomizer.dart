import 'dart:math';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/storage_service.dart';

class DeckRandomizer {
  static final Random _random = Random();

  /// Async shuffled word generator respecting GameStorageService word cooldowns
  static Future<List<String>> getShuffledWordsAsync(
    List<Category> selectedCategories,
  ) async {
    if (selectedCategories.isEmpty) return [];

    final Map<String, List<String>> categoryWordPools = {};
    int maxCategoryWordCount = 0;

    for (final category in selectedCategories) {
      final cooldown = GameStorageService().getWordCooldown(category.id);
      final unplayed =
          category.words.where((w) => !cooldown.contains(w)).toList();
      final wordsToUse = unplayed.isNotEmpty ? unplayed : category.words;
      if (wordsToUse.isNotEmpty) {
        final shuffled = List<String>.from(wordsToUse)..shuffle(_random);
        categoryWordPools[category.id] = shuffled;
        if (shuffled.length > maxCategoryWordCount) {
          maxCategoryWordCount = shuffled.length;
        }
      }
    }

    if (categoryWordPools.isEmpty) return [];

    // Single Deck
    if (categoryWordPools.length == 1) {
      final words = categoryWordPools.values.first;
      return words.toSet().toList();
    }

    // Multi-Deck: Round-Robin Interleaving with Localized Jitter
    final List<String> interleavedResult = [];
    final Set<String> seenWords = {};

    for (int step = 0; step < maxCategoryWordCount; step++) {
      final categoryIds = categoryWordPools.keys.toList()..shuffle(_random);
      for (final catId in categoryIds) {
        final pool = categoryWordPools[catId]!;
        if (step < pool.length) {
          final word = pool[step].trim();
          if (word.isNotEmpty && !seenWords.contains(word)) {
            seenWords.add(word);
            interleavedResult.add(word);
          }
        }
      }
    }

    // Localized jitter swap (window = 3)
    for (int i = 0; i < interleavedResult.length - 1; i++) {
      int j = i + _random.nextInt(min(3, interleavedResult.length - i));
      if (i != j) {
        final temp = interleavedResult[i];
        interleavedResult[i] = interleavedResult[j];
        interleavedResult[j] = temp;
      }
    }

    return interleavedResult;
  }

  /// Generates a fairly balanced and randomized word sequence from selected categories.
  /// Handles single category as well as multi-deck round-robin interleaving.
  static List<String> getShuffledWords(List<Category> selectedCategories) {
    if (selectedCategories.isEmpty) return [];

    // Single Deck: Direct Fisher-Yates Shuffle
    if (selectedCategories.length == 1) {
      final words = List<String>.from(selectedCategories.first.words);
      words.shuffle(_random);
      return words.toSet().toList();
    }

    // Multi-Deck: Round-Robin Interleaving with Localized Jitter
    final Map<String, List<String>> categoryWordPools = {};
    int maxCategoryWordCount = 0;

    for (final category in selectedCategories) {
      if (category.words.isNotEmpty) {
        final shuffledCategoryWords = List<String>.from(category.words)
          ..shuffle(_random);
        categoryWordPools[category.id] = shuffledCategoryWords;
        if (shuffledCategoryWords.length > maxCategoryWordCount) {
          maxCategoryWordCount = shuffledCategoryWords.length;
        }
      }
    }

    final List<String> interleavedResult = [];
    final Set<String> seenWords = {};

    // Round-Robin extraction pass
    for (int step = 0; step < maxCategoryWordCount; step++) {
      // Shuffle category IDs for each round-robin pass to randomize deck order
      final categoryIds = categoryWordPools.keys.toList()..shuffle(_random);
      for (final catId in categoryIds) {
        final pool = categoryWordPools[catId]!;
        if (step < pool.length) {
          final word = pool[step].trim();
          if (word.isNotEmpty && !seenWords.contains(word)) {
            seenWords.add(word);
            interleavedResult.add(word);
          }
        }
      }
    }

    // Apply minor localized jitter swap (window = 3) to keep gameplay spontaneous
    for (int i = 0; i < interleavedResult.length - 1; i++) {
      int j = i + _random.nextInt(min(3, interleavedResult.length - i));
      if (i != j) {
        final temp = interleavedResult[i];
        interleavedResult[i] = interleavedResult[j];
        interleavedResult[j] = temp;
      }
    }

    return interleavedResult;
  }

  /// Picks a weighted random deck that excludes decks played in the last 2 games.
  static Category pickWeightedRandomDeck(List<Category> availableDecks) {
    if (availableDecks.isEmpty) {
      throw ArgumentError("availableDecks cannot be empty");
    }
    if (availableDecks.length == 1) return availableDecks.first;

    final recentHistory = GameStorageService().getRecentDeckHistory();

    // 1. Strict filter: exclude decks played in the last 2 games
    List<Category> candidates =
        availableDecks.where((d) => !recentHistory.contains(d.id)).toList();

    // 2. Soft fallback if strict filter leaves no candidates (e.g. only 2 total decks)
    if (candidates.isEmpty && recentHistory.isNotEmpty) {
      final lastPlayedId = recentHistory.first;
      candidates = availableDecks.where((d) => d.id != lastPlayedId).toList();
    }

    // 3. Absolute fallback
    if (candidates.isEmpty) {
      candidates = List.from(availableDecks);
    }

    candidates.shuffle(_random);
    return candidates.first;
  }
}
