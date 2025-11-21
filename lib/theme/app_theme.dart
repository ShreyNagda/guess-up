import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // --- 1. VIBRANT COLOR PALETTE (Yellow & Black) ---

  // Light Theme Palette (High Energy)
  static const Color lightPrimaryColor = Color(0xFFFFD600); // Electric Yellow
  static const Color lightAccentColor = Color(0xFF212121); // Deep Black
  static const Color lightScaffoldBackground = Color(
    0xFFFAFAFA,
  ); // Crisp White/Grey
  static const Color lightSurfaceColor = Colors.white;
  static const Color lightTextColor = Color(0xFF212121); // Almost Black

  // Dark Theme Palette (Toned Down)
  static const Color darkPrimaryColor = Color(
    0xFFFFC107,
  ); // Amber (Duller Yellow)
  static const Color darkAccentColor = Color(0xFF121212); // Very Dark Grey
  static const Color darkScaffoldBackground = Color(
    0xFF121212,
  ); // Deep Dark Grey
  static const Color darkSurfaceColor = Color(0xFF1E1E1E); // Lighter Dark Grey
  static const Color darkTextColor = Color(0xFFEEEEEE); // Off-White

  // Shared/Utility Colors
  static const Color errorColor = Color(0xFFD32F2F);
  static const Color hintColor = Color(0xFF9E9E9E);

  // --- 2. MODERN TYPESCALE ---
  static final TextTheme _baseTextTheme = GoogleFonts.manropeTextTheme(
    const TextTheme(
      // Massive text for the Game Word
      displayLarge: TextStyle(
        fontSize: 56,
        fontWeight: FontWeight.w900,
        letterSpacing: -1.5,
      ),
      displayMedium: TextStyle(
        fontSize: 42,
        fontWeight: FontWeight.w800,
        letterSpacing: -0.5,
      ),
      displaySmall: TextStyle(fontSize: 32, fontWeight: FontWeight.w700),

      // Headlines
      headlineLarge: TextStyle(fontSize: 30, fontWeight: FontWeight.w900),
      headlineMedium: TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
      headlineSmall: TextStyle(fontSize: 22, fontWeight: FontWeight.w700),

      // Standard UI text
      titleLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w700),
      titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
      titleSmall: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),

      // Body text
      bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w500),

      // Buttons & Labels
      labelLarge: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w900,
        letterSpacing: 0.5,
      ),
      labelMedium: TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
      labelSmall: TextStyle(fontSize: 10, fontWeight: FontWeight.w800),
    ),
  );

  // --- 3. DYNAMIC TEXT COLORING ---
  static TextTheme _buildTextTheme(ThemeMode mode) {
    final isDark = mode == ThemeMode.dark;
    final textColor = isDark ? darkTextColor : lightTextColor;
    final primaryColor = isDark ? darkPrimaryColor : lightPrimaryColor;

    return _baseTextTheme.copyWith(
      displayLarge: _baseTextTheme.displayLarge?.copyWith(
        color: isDark ? primaryColor : lightAccentColor,
      ),
      displayMedium: _baseTextTheme.displayMedium?.copyWith(color: textColor),
      displaySmall: _baseTextTheme.displaySmall?.copyWith(color: textColor),

      headlineLarge: _baseTextTheme.headlineLarge?.copyWith(color: textColor),
      headlineMedium: _baseTextTheme.headlineMedium?.copyWith(color: textColor),
      headlineSmall: _baseTextTheme.headlineSmall?.copyWith(color: textColor),

      titleLarge: _baseTextTheme.titleLarge?.copyWith(color: textColor),
      titleMedium: _baseTextTheme.titleMedium?.copyWith(color: textColor),
      titleSmall: _baseTextTheme.titleSmall?.copyWith(color: textColor),

      bodyLarge: _baseTextTheme.bodyLarge?.copyWith(color: textColor),
      bodyMedium: _baseTextTheme.bodyMedium?.copyWith(color: textColor),
      bodySmall: _baseTextTheme.bodySmall?.copyWith(color: hintColor),

      labelLarge: _baseTextTheme.labelLarge?.copyWith(
        color: isDark ? lightAccentColor : lightAccentColor,
      ), // Button text is usually black on yellow
    );
  }

  // --- 4. LIGHT THEME OBJECT ---
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: lightPrimaryColor,
      scaffoldBackgroundColor: lightScaffoldBackground,

      colorScheme: const ColorScheme.light(
        primary: lightPrimaryColor,
        secondary: lightAccentColor,
        surface: lightSurfaceColor,
        onSurface: lightTextColor,
        onPrimary: lightAccentColor, // Black text on Yellow
        onSecondary: Colors.white,
        error: errorColor,
      ),

      textTheme: _buildTextTheme(ThemeMode.light),
      appBarTheme: const AppBarTheme(
        backgroundColor: lightPrimaryColor,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: lightAccentColor),
        titleTextStyle: TextStyle(
          color: lightAccentColor,
          fontSize: 24,
          fontFamily: 'Manrope',
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: lightPrimaryColor,
          foregroundColor: lightAccentColor, // Black text
          elevation: 4,
          shadowColor: Colors.black.withAlpha(60),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: _baseTextTheme.labelLarge,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: lightAccentColor,
          side: const BorderSide(color: lightAccentColor, width: 2.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: _baseTextTheme.labelLarge?.copyWith(
            color: lightAccentColor,
          ),
        ),
      ),

      cardTheme: CardThemeData(
        color: lightSurfaceColor,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFFEEEEEE), width: 2),
        ),
      ),

      iconTheme: const IconThemeData(color: lightAccentColor, size: 30),

      dividerTheme: DividerThemeData(
        color: lightAccentColor.withAlpha(30),
        thickness: 1.5,
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: lightAccentColor,
        foregroundColor: lightPrimaryColor,
        elevation: 6,
      ),
      chipTheme: ChipThemeData(
        selectedColor: lightPrimaryColor,
        checkmarkColor: lightTextColor,
        labelStyle: TextStyle(color: lightTextColor),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadiusGeometry.circular(15),
        ),
      ),
    );
  }

  // --- 5. DARK THEME OBJECT ---
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: darkPrimaryColor,
      scaffoldBackgroundColor: darkScaffoldBackground,

      colorScheme: const ColorScheme.dark(
        primary: darkPrimaryColor,
        secondary: darkAccentColor, // Black/Dark Grey
        surface: darkSurfaceColor,
        onSurface: darkTextColor,
        onPrimary: darkAccentColor, // Black text on Amber
        onSecondary: Colors.white,
        error: errorColor,
      ),

      textTheme: _buildTextTheme(ThemeMode.dark),

      appBarTheme: const AppBarTheme(
        backgroundColor: darkSurfaceColor,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: darkPrimaryColor), // Amber icons
        titleTextStyle: TextStyle(
          color: darkPrimaryColor, // Amber title
          fontSize: 24,
          fontFamily: 'Manrope',
          fontWeight: FontWeight.w900,
          letterSpacing: -0.5,
        ),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: darkPrimaryColor,
          foregroundColor: darkAccentColor, // Black text on Amber button
          elevation: 2,
          shadowColor: Colors.black.withAlpha(110),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: _baseTextTheme.labelLarge,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: darkPrimaryColor, // Amber text
          side: const BorderSide(color: darkPrimaryColor, width: 2.0),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: _baseTextTheme.labelLarge?.copyWith(
            color: darkPrimaryColor,
          ),
        ),
      ),

      cardTheme: CardThemeData(
        color: darkSurfaceColor,
        elevation: 4,
        shadowColor: Colors.black.withAlpha(150),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),

      iconTheme: const IconThemeData(color: darkPrimaryColor, size: 30),

      dividerTheme: DividerThemeData(
        color: Colors.white.withAlpha(30),
        thickness: 1.5,
      ),

      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: darkPrimaryColor,
        foregroundColor: darkAccentColor,
        elevation: 6,
      ),
      chipTheme: ChipThemeData(
        selectedColor: lightPrimaryColor.withAlpha(50),
        labelStyle: TextStyle(color: darkTextColor),
      ),
    );
  }
}
