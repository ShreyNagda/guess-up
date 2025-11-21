import 'package:flutter/material.dart';
import 'package:guess_up/services/storage_service.dart';

class ThemeService with ChangeNotifier {
  ThemeMode _themeMode = ThemeMode.system;
  ThemeMode get themeMode => _themeMode;
  ThemeService() {
    _loadTheme();
  }
  Future<void> _loadTheme() async {
    // Ensure StorageService is ready (it's a singleton, so we can access it directly)
    // Or better, just read the synchronous value if init() has run in main.dart
    _themeMode = StorageService().themeMode;
    notifyListeners();
  }

  void setThemeMode(ThemeMode mode) {
    if (_themeMode == mode) return;

    _themeMode = mode;
    notifyListeners(); // This triggers MaterialApp to rebuild

    // Persist the change
    StorageService().setThemeMode(mode);
  }
}
