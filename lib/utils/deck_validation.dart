import 'package:guess_up/constants/game_constants.dart';

class ValidationResult {
  final bool isValid;
  final List<String> errors;

  const ValidationResult(this.isValid, [this.errors = const []]);
}

class DeckValidation {
  static ValidationResult validateDeck({
    required String name,
    required String description,
    required List<String> words,
  }) {
    final errors = <String>[];
    final trimmedName = name.trim();

    if (trimmedName.isEmpty) {
      errors.add('Deck name is required');
    } else if (trimmedName.length > GameConstants.maxDeckNameLength) {
      errors.add(
        'Deck name must be under ${GameConstants.maxDeckNameLength} characters',
      );
    }

    if (description.trim().length > GameConstants.maxDeckDescriptionLength) {
      errors.add(
        'Description must be under ${GameConstants.maxDeckDescriptionLength} characters',
      );
    }

    final cleanWords =
        words
            .map((w) => w.replaceAll('"', '').trim())
            .where((w) => w.isNotEmpty)
            .toList();

    if (cleanWords.length < GameConstants.minDeckWords) {
      errors.add('Deck requires at least ${GameConstants.minDeckWords} words');
    } else if (cleanWords.length > GameConstants.maxDeckWords) {
      errors.add('Deck cannot exceed ${GameConstants.maxDeckWords} words');
    }

    for (final word in cleanWords) {
      if (word.length > GameConstants.maxWordLength) {
        errors.add(
          'Word "$word" exceeds maximum length of ${GameConstants.maxWordLength}',
        );
        break;
      }
    }

    return ValidationResult(errors.isEmpty, errors);
  }
}
