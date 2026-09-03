import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/deck/deck_state.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';

class DeckCubit extends Cubit<DeckState> {
  final CategoryService categoryService;
  final GameStorageService storageService;
  StreamSubscription<List<Category>>? _decksSubscription;

  DeckCubit({
    required this.categoryService,
    required this.storageService,
  }) : super(DeckLoadingState());

  Future<void> loadDecks() async {
    final customDecks = storageService.getCustomDecks();
    final initialDecks = await categoryService.getAllCategories();

    final combined = _mergeDecks(customDecks, initialDecks);
    final Set<String> initialSelected = {};

    if (combined.isNotEmpty) {
      initialSelected.add(combined.first.id);
    }

    emit(DeckLoadedState(
      decks: combined,
      selectedDeckIds: initialSelected,
      focusedIndex: 0,
    ));

    _decksSubscription?.cancel();
    _decksSubscription = categoryService.streamDecks().listen((remoteDecks) {
      final currentCustom = storageService.getCustomDecks();
      final updated = _mergeDecks(currentCustom, remoteDecks);

      if (state is DeckLoadedState) {
        final current = state as DeckLoadedState;
        emit(DeckLoadedState(
          decks: updated,
          selectedDeckIds: current.selectedDeckIds,
          focusedIndex: current.focusedIndex.clamp(0, updated.isNotEmpty ? updated.length - 1 : 0),
        ));
      }
    });
  }

  List<Category> _mergeDecks(List<Category> custom, List<Category> remote) {
    final list = <Category>[...custom];
    for (final r in remote) {
      if (!list.any((d) => d.id == r.id)) {
        list.add(r);
      }
    }
    list.sort((a, b) {
      if (a.isTrending != b.isTrending) return a.isTrending ? -1 : 1;
      if (a.sortOrder != b.sortOrder) return a.sortOrder.compareTo(b.sortOrder);
      return a.title.compareTo(b.title);
    });
    return list;
  }

  void setFocusedIndex(int index) {
    if (state is DeckLoadedState) {
      final current = state as DeckLoadedState;
      emit(DeckLoadedState(
        decks: current.decks,
        selectedDeckIds: current.selectedDeckIds,
        focusedIndex: index,
      ));
    }
  }

  void toggleDeckSelection(String deckId) {
    if (state is DeckLoadedState) {
      final current = state as DeckLoadedState;
      final selected = Set<String>.from(current.selectedDeckIds);

      if (selected.contains(deckId)) {
        if (selected.length > 1) selected.remove(deckId);
      } else {
        selected.add(deckId);
      }

      emit(DeckLoadedState(
        decks: current.decks,
        selectedDeckIds: selected,
        focusedIndex: current.focusedIndex,
      ));
    }
  }

  @override
  Future<void> close() {
    _decksSubscription?.cancel();
    return super.close();
  }
}
