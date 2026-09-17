import 'package:flutter/material.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/schemas/category_entity.dart';
import 'package:hive_flutter/hive_flutter.dart';

class GameStorageService {
  static final GameStorageService _instance = GameStorageService._internal();
  factory GameStorageService() => _instance;
  GameStorageService._internal();

  static const String _settingsBoxName = 'settings_box';
  static const String _customDecksBoxName = 'custom_decks_box';
  static const String _wordHistoryBoxName = 'word_history_box';

  late Box _settingsBox;
  late Box<CategoryEntity> _customDecksBox;
  late Box _wordHistoryBox;
  bool _isInitialized = false;

  Future<void> init() async {
    if (_isInitialized) return;
    await Hive.initFlutter();

    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(CategoryEntityAdapter());
    }

    _settingsBox = await Hive.openBox(_settingsBoxName);
    _customDecksBox = await Hive.openBox<CategoryEntity>(_customDecksBoxName);
    _wordHistoryBox = await Hive.openBox(_wordHistoryBoxName);

    _isInitialized = true;
  }

  // --- Settings Accessors ---
  bool get isMusicEnabled =>
      _settingsBox.get('isMusicEnabled', defaultValue: true);
  Future<void> setMusicEnabled(bool val) async =>
      await _settingsBox.put('isMusicEnabled', val);

  bool get isSfxEnabled => _settingsBox.get('isSfxEnabled', defaultValue: true);
  Future<void> setSfxEnabled(bool val) async =>
      await _settingsBox.put('isSfxEnabled', val);

  bool get isHapticsEnabled =>
      _settingsBox.get('isHapticsEnabled', defaultValue: true);
  Future<void> setHapticsEnabled(bool val) async =>
      await _settingsBox.put('isHapticsEnabled', val);

  int get gameDuration => _settingsBox.get('gameDuration', defaultValue: 60);
  Future<void> setGameDuration(int seconds) async =>
      await _settingsBox.put('gameDuration', seconds);

  String get tiltSensitivity =>
      _settingsBox.get('tiltSensitivity', defaultValue: 'Normal');
  Future<void> setTiltSensitivity(String sensitivity) async =>
      await _settingsBox.put('tiltSensitivity', sensitivity);

  bool isAccelerometerSupported = true;

  String get controlMode {
    if (!isAccelerometerSupported) return 'tap';
    return _settingsBox.get('controlMode', defaultValue: 'tilt');
  }

  bool get isTapControl => controlMode == 'tap';
  Future<void> setControlMode(String mode) async {
    if (!isAccelerometerSupported && mode == 'tilt') return;
    await _settingsBox.put('controlMode', mode);
  }

  bool get isInvertedControls =>
      _settingsBox.get('isInvertedControls', defaultValue: false);
  Future<void> setInvertedControls(bool val) async =>
      await _settingsBox.put('isInvertedControls', val);

  bool get isTeamMode => _settingsBox.get('isTeamMode', defaultValue: false);
  Future<void> setTeamMode(bool val) async =>
      await _settingsBox.put('isTeamMode', val);

  int get teamRounds => _settingsBox.get('teamRounds', defaultValue: 3);
  Future<void> setTeamRounds(int rounds) async =>
      await _settingsBox.put('teamRounds', rounds);

  String get teamCyanName =>
      _settingsBox.get('teamCyanName', defaultValue: 'The Drunk Uncles');
  Future<void> setTeamCyanName(String val) async =>
      await _settingsBox.put('teamCyanName', val);

  String get teamCyanEmoji =>
      _settingsBox.get('teamCyanEmoji', defaultValue: '🍻');
  Future<void> setTeamCyanEmoji(String val) async =>
      await _settingsBox.put('teamCyanEmoji', val);

  String get teamMagentaName =>
      _settingsBox.get('teamMagentaName', defaultValue: 'Bollywood Baddies');
  Future<void> setTeamMagentaName(String val) async =>
      await _settingsBox.put('teamMagentaName', val);

  String get teamMagentaEmoji =>
      _settingsBox.get('teamMagentaEmoji', defaultValue: '💃');
  Future<void> setTeamMagentaEmoji(String val) async =>
      await _settingsBox.put('teamMagentaEmoji', val);

  // --- Hall of Fame Storage (Top 3 Scores on Device) ---
  List<Map<String, dynamic>> getHallOfFame() {
    final raw = _settingsBox.get('hallOfFame');
    if (raw is List) {
      return raw
          .map((e) {
            if (e is Map) return Map<String, dynamic>.from(e);
            return <String, dynamic>{};
          })
          .where((m) => m.containsKey('score'))
          .toList();
    }
    return [];
  }

  Future<void> saveHallOfFameScore({
    required int score,
    required String teamName,
    required String emoji,
    required String tagline,
  }) async {
    final current = getHallOfFame();
    current.add({
      'score': score,
      'teamName': teamName,
      'emoji': emoji,
      'tagline': tagline,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    });
    current.sort((a, b) => (b['score'] as int).compareTo(a['score'] as int));
    if (current.length > 3) {
      current.removeRange(3, current.length);
    }
    await _settingsBox.put('hallOfFame', current);
  }

  bool get hasSeenOnboarding =>
      _settingsBox.get('hasSeenOnboarding', defaultValue: false);
  Future<void> setOnboardingSeen(bool val) async =>
      await _settingsBox.put('hasSeenOnboarding', val);

  bool get dontShowHowToPlay =>
      _settingsBox.get('dontShowHowToPlay', defaultValue: false);
  Future<void> setDontShowHowToPlay(bool val) async =>
      await _settingsBox.put('dontShowHowToPlay', val);

  bool get hasSeenTrendingModal =>
      _settingsBox.get('hasSeenTrendingModal', defaultValue: false);
  Future<void> setHasSeenTrendingModal(bool val) async =>
      await _settingsBox.put('hasSeenTrendingModal', val);

  int get trendingRotationIndex =>
      _settingsBox.get('trendingRotationIndex', defaultValue: 0);
  Future<void> setTrendingRotationIndex(int val) async =>
      await _settingsBox.put('trendingRotationIndex', val);

  ThemeMode get themeMode {
    final str = _settingsBox.get('themeMode', defaultValue: 'system');
    switch (str) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default:
        return ThemeMode.system;
    }
  }

  Future<void> setThemeMode(ThemeMode mode) async {
    late String str;
    switch (mode) {
      case ThemeMode.light:
        str = 'light';
        break;
      case ThemeMode.dark:
        str = 'dark';
        break;
      case ThemeMode.system:
        str = 'system';
        break;
    }
    await _settingsBox.put('themeMode', str);
  }

  // --- Category Accessors & Storage ---
  List<Category> getCustomDecks() {
    return _customDecksBox.values
        .map<Category>((entity) => entity.toCategory())
        .toList();
  }

  List<String> getLastCategoryIds() {
    final ids = _settingsBox.get('lastCategoryIds');
    if (ids is List) {
      return ids.map((e) => e.toString()).toList();
    }
    return [];
  }

  Future<void> saveLastCategoryIds(List<String> ids) async {
    await _settingsBox.put('lastCategoryIds', ids);
  }

  Future<void> setLastCategoryIds(List<String> ids) async {
    await saveLastCategoryIds(ids);
  }

  Future<void> setLastDeckId(String id) async {
    await saveLastCategoryIds([id]);
  }

  Future<void> saveCustomDeck(Category deck) async {
    final entity = CategoryEntity.fromCategory(deck);
    await _customDecksBox.put(deck.id, entity);
  }

  Future<void> deleteCustomDeck(String id) async {
    await _customDecksBox.delete(id);
    await _wordHistoryBox.delete('word_history_$id');
  }

  // --- Word History Cooldown Operations ---
  List<String> getWordCooldown(String categoryId) {
    final list = _wordHistoryBox.get('word_history_$categoryId');
    if (list is List) {
      return list.map((e) => e.toString()).toList();
    }
    return [];
  }

  Future<void> saveWordCooldown(
    String categoryId,
    List<String> cooldownQueue,
  ) async {
    await _wordHistoryBox.put('word_history_$categoryId', cooldownQueue);
  }

  // --- Recent Deck Cooldown Operations (2 Games Memory) ---
  List<String> getRecentDeckHistory() {
    final list = _settingsBox.get('recentDeckHistory');
    if (list is List) {
      return list.map((e) => e.toString()).toList();
    }
    return [];
  }

  Future<void> recordDeckPlayed(String deckId) async {
    final current = getRecentDeckHistory();
    current.remove(deckId);
    current.insert(0, deckId);
    if (current.length > 2) {
      current.removeRange(2, current.length);
    }
    await _settingsBox.put('recentDeckHistory', current);
  }
}
