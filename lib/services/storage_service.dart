import 'dart:convert';
import 'package:flutter/material.dart'; // Import for ThemeMode
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  // --- Constants for Keys ---
  static const String _themeModeKey = 'themeMode'; // New key for ThemeMode
  static const String _volumeKey = 'isVolumeOn';
  static const String _customWordsKey = 'customWords';

  Future<SharedPreferences> get _prefs async =>
      await SharedPreferences.getInstance();

  // Get the saved ThemeMode
  Future<ThemeMode> getThemeMode() async {
    final prefs = await _prefs;
    final themeString = prefs.getString(_themeModeKey);
    switch (themeString) {
      case 'light':
        return ThemeMode.light;
      case 'dark':
        return ThemeMode.dark;
      case 'system':
      default: // Default to system if null or unknown value
        return ThemeMode.system;
    }
  }

  // Save the selected ThemeMode
  Future<void> setThemeMode(ThemeMode mode) async {
    final prefs = await _prefs;
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
    await prefs.setString(_themeModeKey, themeString);
  }

  // --- Volume ---
  Future<bool> getVolume() async {
    final prefs = await _prefs;
    // Use the constant key
    return prefs.getBool(_volumeKey) ?? true; // Default to true (sound on)
  }

  Future<void> setVolume(bool value) async {
    final prefs = await _prefs;
    // Use the constant key
    await prefs.setBool(_volumeKey, value);
  }

  // --- Custom Words ---
  Future<List<String>> getCustomWords() async {
    final prefs = await _prefs;
    // Use the constant key
    return prefs.getStringList(_customWordsKey) ?? [];
  }

  Future<void> setCustomWords(List<String> words) async {
    final prefs = await _prefs;
    // Use the constant key
    // Ensure uniqueness before saving
    await prefs.setStringList(_customWordsKey, words.toSet().toList());
  }

  // Note: addCustomWords might add duplicates temporarily,
  // but setCustomWords now saves only unique words.
  Future<void> addCustomWords(List<String> words) async {
    final current = await getCustomWords();
    // Add only new words to avoid unnecessary list growth before saving
    current.addAll(words.where((word) => !current.contains(word)));
    await setCustomWords(current); // This will save the unique list
  }

  // --- Local File Words --- (No changes needed here)
  Future<List<String>> getWordsFromLocalFile() async {
    try {
      final jsonString = await rootBundle.loadString('assets/data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      final List<dynamic> wordsDynamic = jsonMap['words'] ?? [];
      return wordsDynamic.map((e) => e.toString()).toList();
    } catch (e) {
      print("Error loading local words from data.json: $e");
      return [];
    }
  }
}
