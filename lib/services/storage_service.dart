import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  static final StorageService _instance = StorageService._internal();
  factory StorageService() => _instance;
  StorageService._internal();

  Future<SharedPreferences> get _prefs async =>
      await SharedPreferences.getInstance();

  // Theme
  Future<bool> getTheme() async {
    final prefs = await _prefs;
    return prefs.getBool('isDarkTheme') ?? false;
  }

  Future<void> setTheme(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool('isDarkTheme', value);
  }

  // Volume
  Future<bool> getVolume() async {
    final prefs = await _prefs;
    return prefs.getBool('isVolumeOn') ?? true;
  }

  Future<void> setVolume(bool value) async {
    final prefs = await _prefs;
    await prefs.setBool('isVolumeOn', value);
  }

  // Custom Words
  Future<List<String>> getCustomWords() async {
    final prefs = await _prefs;
    return prefs.getStringList('customWords') ?? [];
  }

  Future<void> setCustomWords(List<String> words) async {
    final prefs = await _prefs;
    await prefs.setStringList('customWords', words);
  }

  Future<void> addCustomWords(List<String> words) async {
    final current = await getCustomWords();
    current.addAll(words);
    await setCustomWords(current);
  }

  Future<List<String>> getWordsFromLocalFile() async {
    try {
      final jsonString = await rootBundle.loadString('assets/data.json');
      final Map<String, dynamic> jsonMap = json.decode(jsonString);
      final List<dynamic> wordsDynamic = jsonMap['words'] ?? [];
      return wordsDynamic.map((e) => e.toString()).toList();
    } catch (e) {
      print("Error loading local words: $e");
      return [];
    }
  }
}
