import 'package:flutter_test/flutter_test.dart';
import 'package:guess_up/constants/game_constants.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/deck_randomizer.dart';
import 'package:guess_up/utils/deck_validation.dart';

void main() {
  group('DeckValidation Tests', () {
    test('Validates complete custom deck successfully', () {
      final res = DeckValidation.validateDeck(
        name: 'Bollywood Stars',
        description: 'Iconic actors and films',
        words: ['Shah Rukh Khan', 'Amitabh Bachchan', 'Deepika', 'Ranbir', 'Alia'],
      );
      expect(res.isValid, isTrue);
      expect(res.errors, isEmpty);
    });

    test('Fails on empty deck name', () {
      final res = DeckValidation.validateDeck(
        name: '   ',
        description: 'Test',
        words: ['Word1', 'Word2', 'Word3', 'Word4', 'Word5'],
      );
      expect(res.isValid, isFalse);
      expect(res.errors, contains('Deck name is required'));
    });

    test('Fails when words count is below minimum', () {
      final res = DeckValidation.validateDeck(
        name: 'Short Deck',
        description: 'Too few words',
        words: ['One', 'Two'],
      );
      expect(res.isValid, isFalse);
      expect(res.errors.first, contains('at least ${GameConstants.minDeckWords} words'));
    });

    test('Fails on overly long deck name', () {
      final longName = 'A' * (GameConstants.maxDeckNameLength + 1);
      final res = DeckValidation.validateDeck(
        name: longName,
        description: 'Test',
        words: ['Word1', 'Word2', 'Word3', 'Word4', 'Word5'],
      );
      expect(res.isValid, isFalse);
      expect(res.errors.first, contains('under ${GameConstants.maxDeckNameLength} characters'));
    });
  });

  group('DeckRandomizer Tests', () {
    final cat1 = Category(
      id: 'cat_1',
      name: 'Animals',
      icon: '🦁',
      words: ['Lion', 'Tiger', 'Bear', 'Elephant', 'Giraffe'],
    );
    final cat2 = Category(
      id: 'cat_2',
      name: 'Food',
      icon: '🍕',
      words: ['Pizza', 'Burger', 'Taco', 'Pasta', 'Sushi'],
    );

    test('Returns empty list when no categories selected', () {
      final words = DeckRandomizer.getShuffledWords([]);
      expect(words, isEmpty);
    });

    test('Shuffles single deck and retains all words', () {
      final words = DeckRandomizer.getShuffledWords([cat1]);
      expect(words.length, equals(cat1.words.length));
      expect(words.toSet(), equals(cat1.words.toSet()));
    });

    test('Interleaves multiple decks without duplicate words', () {
      final words = DeckRandomizer.getShuffledWords([cat1, cat2]);
      expect(words.length, equals(cat1.words.length + cat2.words.length));
      expect(words.toSet().length, equals(words.length));
    });
  });

  group('GameConstants Integrity Tests', () {
    test('Ensures logical threshold relationships', () {
      expect(GameConstants.tiltPassThresholdHigh < GameConstants.tiltPassThresholdNormal, isTrue);
      expect(GameConstants.tiltPassThresholdNormal < GameConstants.tiltPassThresholdLow, isTrue);
      expect(GameConstants.tiltCorrectThresholdHigh < GameConstants.tiltCorrectThresholdNormal, isTrue);
      expect(GameConstants.tiltCorrectThresholdNormal < GameConstants.tiltCorrectThresholdLow, isTrue);
      expect(GameConstants.streakThresholdHot < GameConstants.streakThresholdFire, isTrue);
      expect(GameConstants.pointsForCorrect < GameConstants.pointsForStreak3, isTrue);
      expect(GameConstants.pointsForStreak3 < GameConstants.pointsForStreak5, isTrue);
    });
  });
}
