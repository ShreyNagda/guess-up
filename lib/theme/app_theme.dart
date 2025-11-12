import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart'; // Import Google Fonts

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

  // --- 1. COMMON TEXT TYPESCALE (Sizes & Weights) ---
  // This is our single source of truth for all font sizes and weights.
  // It is based on your previous file and uses GoogleFonts.
  static final TextTheme _baseTextTheme = GoogleFonts.manropeTextTheme(
    const TextTheme(
      displayLarge: TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
      displayMedium: TextStyle(fontSize: 32, fontWeight: FontWeight.w600),
      displaySmall: TextStyle(fontSize: 28, fontWeight: FontWeight.w500),
      headlineLarge: TextStyle(fontSize: 28, fontWeight: FontWeight.w700),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w500),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
      titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.w500),
      titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w500),
      titleSmall: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
      bodyLarge: TextStyle(fontSize: 18),
      bodyMedium: TextStyle(fontSize: 16),
      bodySmall: TextStyle(fontSize: 14),
      labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      labelMedium: TextStyle(fontSize: 12),
      labelSmall: TextStyle(fontSize: 10),
    ),
  );

  // --- 2. NEW FUNCTION TO APPLY COLORS ---
  /// Creates the final TextTheme by applying mode-specific colors
  /// to the base typescale.
  static TextTheme _buildTextTheme(ThemeMode themeMode) {
    // Determine which colors to use
    bool isDark = themeMode == ThemeMode.dark;

    Color defaultTextColor = isDark ? darkTextColor : lightTextColor;
    Color hintColor = isDark ? darkHintColor : lightHintColor;
    Color headlineColor = accentColor; // Same for both themes in your original
    // Color labelLargeColor = isDark ? accentColor : primaryColor;

    // Apply the colors to the base theme
    return _baseTextTheme
        .apply(
          displayColor: defaultTextColor, // Default for display/headline
          bodyColor: defaultTextColor, // Default for body/title
        )
        .copyWith(
          headlineLarge: _baseTextTheme.headlineLarge?.copyWith(
            color: headlineColor,
          ),
          headlineMedium: _baseTextTheme.headlineMedium?.copyWith(
            color: headlineColor,
          ),
          headlineSmall: _baseTextTheme.headlineSmall?.copyWith(
            color: headlineColor,
          ),
          labelLarge: _baseTextTheme.labelLarge?.copyWith(color: hintColor),
          labelSmall: _baseTextTheme.labelSmall?.copyWith(color: hintColor),
        );
  }

  // --- 3. Light theme ---
  static ThemeData get lightTheme {
    return ThemeData(
      brightness: Brightness.light,
      primaryColor: primaryColor,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: accentColor,
        surface: lightSurfaceColor,
        onSurface: lightTextColor,
        onPrimary: Colors.white,
        onSecondary: Colors.black87,
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

      // Use the new function to build the TextTheme
      textTheme: _buildTextTheme(ThemeMode.light),

      // (All other theme properties remain)
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          shape: const StadiumBorder(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          elevation: 5,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: primaryColor,
          shape: const StadiumBorder(),
          side: const BorderSide(color: primaryColor, width: 1.5),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          textStyle: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: primaryColor,
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
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
        checkmarkColor: primaryColor.withAlpha(250),
        selectedColor: primaryColor.withAlpha(77),
        backgroundColor: Colors.black.withAlpha(13),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
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
        hintStyle: TextStyle(color: lightHintColor.withAlpha(204)),
      ),
      useMaterial3: true,
    );
  }

  // --- 4. Dark theme ---
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
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

      // Use the new function to build the TextTheme
      textTheme: _buildTextTheme(ThemeMode.dark),

      // (All other theme properties remain)
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
        checkmarkColor: primaryColor.withAlpha(250),
        selectedColor: primaryColor.withAlpha(102),
        backgroundColor: Colors.white.withAlpha(20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
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
        hintStyle: TextStyle(color: darkHintColor.withAlpha(204)),
      ),
      useMaterial3: true,
    );
  }
}
