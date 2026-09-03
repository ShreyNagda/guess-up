import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/theme/theme_state.dart';
import 'package:guess_up/services/storage_service.dart';

class ThemeCubit extends Cubit<ThemeState> {
  final GameStorageService storageService;

  ThemeCubit(this.storageService)
      : super(ThemeState(storageService.themeMode));

  void setThemeMode(ThemeMode mode) async {
    await storageService.setThemeMode(mode);
    emit(ThemeState(mode));
  }

  void toggleTheme() {
    final next =
        state.themeMode == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    setThemeMode(next);
  }
}
