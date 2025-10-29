import 'package:flutter/material.dart';
import 'storage_service.dart'; // Ensure StorageService is imported

class ThemeService extends ChangeNotifier {
  static final ThemeService _instance = ThemeService._internal();
  factory ThemeService() => _instance;
  ThemeService._internal();

  // Replace _isDark with _themeMode
  ThemeMode _themeMode = ThemeMode.system; // Default to system

  // Keep the getter for themeMode
  ThemeMode get themeMode => _themeMode;

  // Remove the isDark getter
  // bool get isDark => _isDark;

  // Load the saved ThemeMode from StorageService
  Future<void> loadTheme() async {
    // Call the new method in StorageService
    _themeMode = await StorageService().getThemeMode();
    notifyListeners(); // Notify listeners after loading
  }

  // Replace toggleTheme with setThemeMode
  Future<void> setThemeMode(ThemeMode mode) async {
    // No need to check if it's the same, just update
    _themeMode = mode;
    // Call the new method in StorageService
    await StorageService().setThemeMode(mode);
    notifyListeners(); // Notify listeners about the change
  }

  // --- Old toggleTheme method removed ---
  // Future<void> toggleTheme(bool value) async {
  //   _isDark = value;
  //   await StorageService().setTheme(value);
  //   notifyListeners();
  // }
}
