import 'package:flutter/material.dart';

class AppTheme {
  // Shared color palette
  static const Color primaryColor = Color(0xFF4DB050); // lively green
  static const Color accentColor = Color(0xFFFFC107); // bright amber
  // Light theme specific
  static const Color lightScaffoldBackground = Color(0xFFF8F9FA); // Off-white
  static const Color lightSurfaceColor = Colors.white;
  static const Color lightTextColor = Colors.black87;
  static const Color lightHintColor = Colors.grey;
  static const Color lightBorderColor = Color(0xFFDEE2E6); // Light gray border

  // Dark theme specific
  static const Color darkScaffoldBackground = Color(
    0xFF121212,
  ); // Very dark gray
  static const Color darkSurfaceColor = Color(
    0xFF1E1E1E,
  ); // Slightly lighter dark gray
  static const Color darkTextColor = Colors.white;
  static const Color darkHintColor = Colors.grey;
  static const Color darkBorderColor = Color(0xFF495057); // Darker gray border

  // Light theme
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      // scaffoldBackgroundColor: lightScaffoldBackground,
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: accentColor,
        surface: lightSurfaceColor,
        onSurface: lightTextColor, // Text color on surface
        onPrimary: Colors.white, // Text color on primary background
        onSecondary:
            Colors
                .black87, // Text color on secondary background// Text color on scaffold background
        error: Colors.redAccent,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
        ),
      ),
      iconTheme: const IconThemeData(color: accentColor, size: 28),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: lightTextColor,
          fontSize: 40,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: lightTextColor,
          fontSize: 32,
          fontWeight: FontWeight.w600,
        ),
        displaySmall: TextStyle(
          color: primaryColor,
          fontSize: 28,
          fontWeight: FontWeight.w500,
        ),
        headlineMedium: TextStyle(
          color: lightTextColor,
          fontSize: 24,
          fontWeight: FontWeight.w500,
        ),
        headlineSmall: TextStyle(
          color: accentColor,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: TextStyle(
          color: lightTextColor,
          fontSize: 22,
          fontWeight: FontWeight.w500,
        ),
        titleMedium: TextStyle(
          color: lightTextColor,
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
        titleSmall: TextStyle(
          color: lightTextColor,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        bodyLarge: TextStyle(color: lightTextColor, fontSize: 18),
        bodyMedium: TextStyle(color: lightTextColor, fontSize: 16),
        bodySmall: TextStyle(color: lightTextColor, fontSize: 14),
        labelLarge: TextStyle(
          color: primaryColor,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        labelMedium: TextStyle(color: lightTextColor, fontSize: 12),
        labelSmall: TextStyle(color: lightHintColor, fontSize: 10),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          elevation: 5,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          shape: const StadiumBorder(),
          side: const BorderSide(color: primaryColor, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      cardTheme: CardThemeData(
        color: lightSurfaceColor,
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        clipBehavior: Clip.antiAlias,
      ),
      chipTheme: ChipThemeData(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        labelStyle: const TextStyle(
          color: lightTextColor,
          fontWeight: FontWeight.w600,
        ),
        // Changed from withOpacity(0.3)
        checkmarkColor: primaryColor.withAlpha(250),
        selectedColor: primaryColor.withAlpha(77),
        // Changed from withOpacity(0.05)
        backgroundColor: Colors.black.withAlpha(13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        // Changed from withOpacity(0.04)
        fillColor: Colors.black.withAlpha(10),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2.0),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        // Changed from withOpacity(0.8)
        hintStyle: TextStyle(color: lightHintColor.withAlpha(204)),
      ),
      useMaterial3: true,
    );
  }

  // --- Dark theme ---
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      // scaffoldBackgroundColor: darkScaffoldBackground,
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: accentColor,
        surface: darkSurfaceColor,
        onSurface: darkTextColor,
        onPrimary: Colors.white,
        onSecondary: Colors.black87,
        error: Colors.redAccent,
        onError: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        iconTheme: IconThemeData(color: darkTextColor),
        titleTextStyle: TextStyle(
          color: darkTextColor,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
        ),
      ),
      iconTheme: const IconThemeData(color: accentColor, size: 28),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: darkTextColor,
          fontSize: 40,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: darkTextColor,
          fontSize: 32,
          fontWeight: FontWeight.w600,
        ),
        displaySmall: TextStyle(
          color: accentColor,
          fontSize: 28,
          fontWeight: FontWeight.w500,
        ),
        headlineMedium: TextStyle(
          color: darkTextColor,
          fontSize: 24,
          fontWeight: FontWeight.w500,
        ),
        headlineSmall: TextStyle(
          color: accentColor,
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        titleLarge: TextStyle(
          color: darkTextColor,
          fontSize: 22,
          fontWeight: FontWeight.w500,
        ),
        titleMedium: TextStyle(
          color: darkTextColor,
          fontSize: 18,
          fontWeight: FontWeight.w500,
        ),
        titleSmall: TextStyle(
          color: darkTextColor,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        bodyLarge: TextStyle(color: darkTextColor, fontSize: 18),
        bodyMedium: TextStyle(color: darkTextColor, fontSize: 16),
        bodySmall: TextStyle(color: darkTextColor, fontSize: 14),
        labelLarge: TextStyle(
          color: accentColor,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
        labelMedium: TextStyle(color: darkTextColor, fontSize: 12),
        labelSmall: TextStyle(color: darkHintColor, fontSize: 10),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          elevation: 5,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          shape: const StadiumBorder(),
          side: const BorderSide(color: primaryColor, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600),
          padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      ),
      cardTheme: CardThemeData(
        color: darkSurfaceColor,
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        clipBehavior: Clip.antiAlias,
      ),
      chipTheme: ChipThemeData(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        labelStyle: const TextStyle(
          color: darkTextColor,
          fontWeight: FontWeight.w600,
        ),
        // Changed from withOpacity(0.4)
        checkmarkColor: primaryColor.withAlpha(250),
        selectedColor: primaryColor.withAlpha(102),
        // Changed from withOpacity(0.08)
        backgroundColor: Colors.white.withAlpha(20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        // Changed from withOpacity(0.06)
        fillColor: Colors.white.withAlpha(15),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryColor, width: 2.0),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        // Changed from withOpacity(0.8)
        hintStyle: TextStyle(color: darkHintColor.withAlpha(204)),
      ),
      useMaterial3: true,
    );
  }
}
