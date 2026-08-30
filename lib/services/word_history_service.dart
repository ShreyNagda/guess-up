import 'dart:math';
import 'package:flutter/foundation.dart' show debugPrint;
import 'package:guess_up/models/category.dart';
import 'package:shared_preferences/shared_preferences.dart';

class WordHistoryService {
  static const String _prefix = 'word_cooldown_v2_';

  /// Calculate the maximum cooldown capacity for a deck.
  /// Holds up to ~65% of the deck on cooldown, leaving at least 35% fresh.
  static int _calculateMaxCooldownCapacity(int totalWords) {
    if (totalWords <= 5) return max(0, totalWords - 2);
    if (totalWords <= 12) return max(1, totalWords - 4);
    final cap = (totalWords * 0.65).floor();
    return min(cap, totalWords - 5);
  }

  /// Returns unplayed words for a category, cycling out oldest words from cooldown if needed.
  static Future<List<String>> getUnplayedWords(Category category) async {
    final prefs = await SharedPreferences.getInstance();
    final key = '$_prefix${category.id}';
    final List<String> cooldownQueue = prefs.getStringList(key) ?? [];

    final unplayed =
        category.words.where((w) => !cooldownQueue.contains(w)).toList();

    final minFreshPool =
        category.words.length >= 10
            ? 5
            : max(1, (category.words.length * 0.3).floor());

    // If remaining unplayed pool is too small, cycle oldest words out of cooldown (FIFO)
    if (unplayed.length < minFreshPool && cooldownQueue.isNotEmpty) {
      debugPrint(
        "ℹ️ [WORD-COOLDOWN] Cycling oldest words out of cooldown for '${category.name}' (${unplayed.length} remaining)",
      );
      final needed = minFreshPool - unplayed.length;
      final trimmedQueue = List<String>.from(cooldownQueue);

      for (int i = 0; i < needed && trimmedQueue.isNotEmpty; i++) {
        trimmedQueue.removeAt(0);
      }

      await prefs.setStringList(key, trimmedQueue);
      final refreshed =
          category.words.where((w) => !trimmedQueue.contains(w)).toList();
      return refreshed.isNotEmpty
          ? refreshed
          : List<String>.from(category.words);
    }

    return unplayed.isNotEmpty ? unplayed : List<String>.from(category.words);
  }

  /// Mark words as recently played, adding them to the cooldown queue in FIFO order.
  static Future<void> markWordsAsPlayed(
    String categoryId,
    List<String> words, {
    int totalDeckWords = 50,
  }) async {
    if (words.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final key = '$_prefix$categoryId';
    final List<String> currentQueue = prefs.getStringList(key) ?? [];

    final maxCap = _calculateMaxCooldownCapacity(totalDeckWords);
    final updatedQueue = List<String>.from(currentQueue);

    for (final word in words) {
      // Remove previous occurrence so it moves to newest position
      updatedQueue.remove(word);
      updatedQueue.add(word);
    }

    // Trim from beginning (oldest) if capacity exceeded
    while (updatedQueue.length > maxCap && updatedQueue.isNotEmpty) {
      updatedQueue.removeAt(0);
    }

    await prefs.setStringList(key, updatedQueue);
  }

  /// Clear played history for a specific deck
  static Future<void> clearDeckHistory(String categoryId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('$_prefix$categoryId');
  }
}
