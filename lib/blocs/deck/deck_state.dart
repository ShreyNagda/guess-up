import 'package:equatable/equatable.dart';
import 'package:guess_up/models/category.dart';

abstract class DeckState extends Equatable {
  const DeckState();

  @override
  List<Object?> get props => [];
}

class DeckLoadingState extends DeckState {}

class DeckLoadedState extends DeckState {
  final List<Category> decks;
  final Set<String> selectedDeckIds;
  final int focusedIndex;

  const DeckLoadedState({
    required this.decks,
    required this.selectedDeckIds,
    required this.focusedIndex,
  });

  @override
  List<Object?> get props => [decks, selectedDeckIds, focusedIndex];
}
