import 'package:flutter/material.dart';

class AppTheme {
  // Shared color palette
  static const Color primaryColor = Color(0xFF4DB050); // lively green
  static const Color accentColor = Color(0xFFFFC107); // bright amber
  static const Color backgroundColor = Color(0xFF101820);
  static const Color surfaceColor = Color(0xFF1C2833);
  static const Color textColor = Colors.white;

  // Light theme
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: Colors.grey[50],
      primaryColor: primaryColor,
      colorScheme: ColorScheme.light(
        primary: primaryColor,
        secondary: accentColor,
        surface: Colors.white,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor, // changed to primary green
        iconTheme: IconThemeData(color: Colors.white),
        titleTextStyle: TextStyle(
          color: Colors.white,
          fontSize: 22,
          fontWeight: FontWeight.bold,
        ),
        elevation: 4,
      ),
      iconTheme: const IconThemeData(color: accentColor, size: 28),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: Colors.black87,
          fontSize: 40,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: Colors.black87,
          fontSize: 32,
          fontWeight: FontWeight.w600,
        ),
        displaySmall: TextStyle(
          color: primaryColor, // highlight primary in titles
          fontSize: 28,
          fontWeight: FontWeight.w500,
        ),
        headlineMedium: TextStyle(
          color: Colors.black87,
          fontSize: 24,
          fontWeight: FontWeight.w500,
        ),
        headlineSmall: TextStyle(
          color: accentColor, // match dark theme
          fontSize: 20,
          fontWeight: FontWeight.w600,
        ),
        bodyLarge: TextStyle(color: Colors.black87, fontSize: 18),
        bodyMedium: TextStyle(color: Colors.black87, fontSize: 16),
        labelLarge: TextStyle(
          color: primaryColor,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: accentColor, // more punchy
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 8, // subtle lift
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ), // soft colored shadow
      ),
      useMaterial3: true,
    );
  }

  // Dark theme
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundColor,
      primaryColor: const Color(0xFF4CAF50),
      colorScheme: const ColorScheme.dark(
        primary: primaryColor,
        secondary: accentColor,
        surface: surfaceColor,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryColor,
        iconTheme: IconThemeData(color: textColor),
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
      iconTheme: const IconThemeData(color: accentColor, size: 28),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          color: textColor,
          fontSize: 40,
          fontWeight: FontWeight.bold,
        ),
        displayMedium: TextStyle(
          color: textColor,
          fontSize: 32,
          fontWeight: FontWeight.w600,
        ),
        displaySmall: TextStyle(
          color: textColor,
          fontSize: 28,
          fontWeight: FontWeight.w500,
        ),
        headlineMedium: TextStyle(
          color: textColor,
          fontSize: 24,
          fontWeight: FontWeight.w500,
        ),
        headlineSmall: TextStyle(
          color: accentColor,
          fontSize: 20,
          fontWeight: FontWeight.w400,
        ),
        bodyLarge: TextStyle(color: textColor, fontSize: 18),
        bodyMedium: TextStyle(color: textColor, fontSize: 16),
        labelLarge: TextStyle(
          color: accentColor,
          fontSize: 16,
          fontWeight: FontWeight.w600,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: textColor,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      useMaterial3: true,
    );
  }
}
