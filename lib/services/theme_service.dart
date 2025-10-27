import 'package:flutter/material.dart';
import 'storage_service.dart';

class ThemeService extends ChangeNotifier {
  static final ThemeService _instance = ThemeService._internal();
  factory ThemeService() => _instance;
  ThemeService._internal();

  bool _isDark = false;
  bool get isDark => _isDark;

  ThemeMode get themeMode => _isDark ? ThemeMode.dark : ThemeMode.light;

  Future<void> loadTheme() async {
    _isDark = await StorageService().getTheme();
    notifyListeners();
  }

  Future<void> toggleTheme(bool value) async {
    _isDark = value;
    await StorageService().setTheme(value);
    notifyListeners();
  }
}
