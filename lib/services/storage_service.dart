import 'dart:convert';
import 'package:flutter/material.dart'; // For ThemeMode
import 'package:flutter/services.dart'; // For rootBundle
import 'package:guess_up/models/category.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  // Singleton pattern
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  // --- Constants for Keys ---
  static const String _themeModeKey = 'themeMode';
  static const String _musicKey = 'isMusicEnabled';
  static const String _sfxKey = 'isSfxEnabled';
  static const String _hapticsKey = 'isHapticsEnabled';
  static const String _customWordsKey = 'customWords';
  // [NEW] Key for game duration
  static const String _gameDurationKey = 'gameDuration';
  static const String _onboardingSeenKey = 'hasSeenOnboarding';
  static const String _dontShowHowToPlayKey = 'dontShowHowToPlay';
  static const String _lastCategoryIdsKey = 'lastCategoryIds';
  static const String _isTeamModeKey = 'isTeamMode';
  static const String _teamRoundsKey = 'teamRounds';
  static const String _lastDeckIdKey = 'lastDeckId';
  static const String _tiltSensitivityKey = 'tiltSensitivity';

  late SharedPreferences _prefs;
  bool _isInitialized = false;

  // --- In-Memory Cache ---
  bool _isMusicEnabled = true;
  bool _isSfxEnabled = true;
  bool _isHapticsEnabled = true;
  int _gameDuration = 60; // Default to 60 seconds
  int _teamRounds = 3; // Default to 3 rounds
  ThemeMode _themeMode = ThemeMode.system;
  bool _hasSeenOnboarding = false;
  bool _dontShowHowToPlay = false;
  bool _isTeamMode = false;
  String? _lastDeckId;
  String _tiltSensitivity = 'Normal';

  /// Initialize the service and pre-load critical settings
  Future<void> init() async {
    if (_isInitialized) return;
    _prefs = await SharedPreferences.getInstance();

    // 1. Load Music & SFX
    _isMusicEnabled = _prefs.getBool(_musicKey) ?? true;
    _isSfxEnabled = _prefs.getBool(_sfxKey) ?? true;

    // 2. Load Haptics
    _isHapticsEnabled = _prefs.getBool(_hapticsKey) ?? true;

    // 3. Load Game Duration [NEW]
    _gameDuration = _prefs.getInt(_gameDurationKey) ?? 60;

    // 4. Load Onboarding Seen State
    _hasSeenOnboarding = _prefs.getBool(_onboardingSeenKey) ?? false;
    _dontShowHowToPlay = _prefs.getBool(_dontShowHowToPlayKey) ?? false;
    _isTeamMode = _prefs.getBool(_isTeamModeKey) ?? false;
    _teamRounds = _prefs.getInt(_teamRoundsKey) ?? 3;
    _lastDeckId = _prefs.getString(_lastDeckIdKey);
    _tiltSensitivity = _prefs.getString(_tiltSensitivityKey) ?? 'Normal';

    // 5. Load Theme (Defaults to Dark Theme across all screens)
    final themeString = _prefs.getString(_themeModeKey);
    switch (themeString) {
      case 'light':
        _themeMode = ThemeMode.light;
        break;
      case 'system':
        _themeMode = ThemeMode.system;
        break;
      case 'dark':
      default:
        _themeMode = ThemeMode.dark;
    }

    _isInitialized = true;
  }

  // --- Music Settings ---
  bool get isMusicEnabled => _isMusicEnabled;
  Future<void> setMusicEnabled(bool value) async {
    _isMusicEnabled = value;
    await _prefs.setBool(_musicKey, value);
  }

  // --- SFX Settings ---
  bool get isSfxEnabled => _isSfxEnabled;
  Future<void> setSfxEnabled(bool value) async {
    _isSfxEnabled = value;
    await _prefs.setBool(_sfxKey, value);
  }

  // --- Haptics Settings ---
  bool get isHapticsEnabled => _isHapticsEnabled;
  Future<void> setHapticsEnabled(bool value) async {
    _isHapticsEnabled = value;
    await _prefs.setBool(_hapticsKey, value);
  }

  // --- Tilt Sensitivity Setting ---
  String get tiltSensitivity => _tiltSensitivity;
  Future<void> setTiltSensitivity(String sensitivity) async {
    _tiltSensitivity = sensitivity;
    await _prefs.setString(_tiltSensitivityKey, sensitivity);
  }

  // --- Theme Mode ---
  ThemeMode get themeMode => _themeMode;
  Future<void> setThemeMode(ThemeMode mode) async {
    _themeMode = mode;
    String themeString;
    switch (mode) {
      case ThemeMode.light:
        themeString = 'light';
        break;
      case ThemeMode.dark:
        themeString = 'dark';
        break;
      case ThemeMode.system:
        themeString = 'system';
        break;
    }
    await _prefs.setString(_themeModeKey, themeString);
  }

  // --- [NEW] Game Duration Settings ---
  int get gameDuration => _gameDuration;

  Future<void> setGameDuration(int seconds) async {
    _gameDuration = seconds;
    await _prefs.setInt(_gameDurationKey, seconds);
  }

  // --- Last Played Game Preferences ---
  String? get lastDeckId => _lastDeckId ?? (_prefs.getString(_lastDeckIdKey));

  Future<void> setLastDeckId(String deckId) async {
    _lastDeckId = deckId;
    await _prefs.setString(_lastDeckIdKey, deckId);
  }

  List<String> getLastCategoryIds() {
    return _prefs.getStringList(_lastCategoryIdsKey) ?? [];
  }

  Future<void> setLastCategoryIds(List<String> categoryIds) async {
    await _prefs.setStringList(_lastCategoryIdsKey, categoryIds);
  }

  static const String _customDecksKey = 'customDecks_v2';

  // --- Custom Decks ---
  List<Category> getCustomDecks() {
    final String? jsonStr = _prefs.getString(_customDecksKey);
    if (jsonStr == null || jsonStr.isEmpty) {
      // Migrate legacy customWords list if available
      final legacyWords = getCustomWords();
      if (legacyWords.isNotEmpty) {
        final legacyDeck = Category(
          id: 'custom_legacy',
          name: 'My Words',
          icon: '✏️',
          colorHex: '#FFC107',
          words: legacyWords,
        );
        saveCustomDeck(legacyDeck);
        return [legacyDeck];
      }
      return [];
    }
    try {
      return Category.decode(jsonStr);
    } catch (e) {
      debugPrint("Error decoding custom decks: $e");
      return [];
    }
  }

  Future<void> saveCustomDeck(Category deck) async {
    final decks = getCustomDecks();
    final index = decks.indexWhere((d) => d.id == deck.id);
    if (index >= 0) {
      decks[index] = deck;
    } else {
      decks.add(deck);
    }
    await _prefs.setString(_customDecksKey, Category.encode(decks));
  }

  Future<void> deleteCustomDeck(String id) async {
    final decks = getCustomDecks();
    decks.removeWhere((d) => d.id == id);
    await _prefs.setString(_customDecksKey, Category.encode(decks));
  }

  // --- Custom Words ---
  List<String> getCustomWords() {
    return _prefs.getStringList(_customWordsKey) ?? [];
  }

  Future<void> setCustomWords(List<String> words) async {
    await _prefs.setStringList(_customWordsKey, words.toSet().toList());
  }

  Future<void> addCustomWords(List<String> words) async {
    final current = getCustomWords();
    current.addAll(words.where((word) => !current.contains(word)));
    await setCustomWords(current);
  }

  // --- Onboarding & How-To-Play ---
  bool get hasSeenOnboarding => _hasSeenOnboarding;

  Future<void> setOnboardingSeen(bool value) async {
    _hasSeenOnboarding = value;
    await _prefs.setBool(_onboardingSeenKey, value);
  }

  bool get dontShowHowToPlay => _dontShowHowToPlay;

  Future<void> setDontShowHowToPlay(bool value) async {
    _dontShowHowToPlay = value;
    await _prefs.setBool(_dontShowHowToPlayKey, value);
  }

  // --- Team Mode Setting ---
  bool get isTeamMode => _isTeamMode;

  Future<void> setTeamMode(bool value) async {
    _isTeamMode = value;
    await _prefs.setBool(_isTeamModeKey, value);
  }

  int get teamRounds => _teamRounds;

  Future<void> setTeamRounds(int rounds) async {
    _teamRounds = rounds;
    await _prefs.setInt(_teamRoundsKey, rounds);
  }

  // --- Local File Words ---
  Future<List<String>> getWordsFromLocalFile() async {
    try {
      final jsonString = await rootBundle.loadString('assets/data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      final List<dynamic> wordsDynamic = jsonMap['words'] ?? [];
      return wordsDynamic.map((e) => e.toString()).toList();
    } catch (e) {
      debugPrint("Error loading local words from data.json: $e");
      return [];
    }
  }
}
