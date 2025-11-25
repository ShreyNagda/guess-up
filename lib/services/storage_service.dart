import 'dart:convert';
import 'package:flutter/material.dart'; // For ThemeMode
import 'package:flutter/services.dart'; // For rootBundle
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

  late SharedPreferences _prefs;
  bool _isInitialized = false;

  // --- In-Memory Cache ---
  bool _isMusicEnabled = true;
  bool _isSfxEnabled = true;
  bool _isHapticsEnabled = true;
  int _gameDuration = 60; // Default to 60 seconds
  ThemeMode _themeMode = ThemeMode.system;

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

    // 4. Load Theme
    final themeString = _prefs.getString(_themeModeKey);
    switch (themeString) {
      case 'light':
        _themeMode = ThemeMode.light;
        break;
      case 'dark':
        _themeMode = ThemeMode.dark;
        break;
      default:
        _themeMode = ThemeMode.system;
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
