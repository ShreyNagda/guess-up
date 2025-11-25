import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/about_screen.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/how_to_play_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scrollController;

  // The pattern sequence (repeated in the grid)
  final List<String> _deckEmojis = ["🏏", "🎬", "🍔", "🗻", "🎧", "🅰️"];

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();

    _scrollController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 30), // Speed of the scroll
    )..repeat();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final buttonTextColor =
        isDark ? AppTheme.darkAccentColor : AppTheme.lightAccentColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // --- 1. Structured Pattern Background ---
          Positioned.fill(
            child: Opacity(
              opacity: 0.15, // Subtle background transparency
              child: AnimatedBuilder(
                animation: _scrollController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: PatternPainter(
                      scrollValue: _scrollController.value,
                      emojis: _deckEmojis,
                      textColor: textColor, // Use theme color for emojis
                    ),
                    size: Size.infinite,
                  );
                },
              ),
            ),
          ),

          // --- 2. Foreground UI (Unchanged) ---
          SafeArea(
            child: Stack(
              children: [
                // Title Section
                Positioned(
                  top: size.height * 0.15,
                  left: 0,
                  right: 0,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "GUESS\nUP",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.displayLarge?.copyWith(
                          fontSize: 90,
                          height: 0.85,
                          color: textColor,
                          shadows: [
                            Shadow(
                              color: primaryColor,
                              offset: const Offset(6, 6),
                              blurRadius: 0,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        "The Party Game",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.titleMedium?.copyWith(
                          letterSpacing: 4,
                          fontWeight: FontWeight.bold,
                          color: textColor.withAlpha(150),
                        ),
                      ),
                    ],
                  ),
                ),

                // Actions Section
                Positioned(
                  bottom: size.height * 0.1,
                  left: 24,
                  right: 24,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        height: 80,
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const ConfigScreen(),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: buttonTextColor,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                              side: BorderSide(
                                color:
                                    isDark
                                        ? Colors.transparent
                                        : AppTheme.lightAccentColor,
                                width: isDark ? 0 : 3,
                              ),
                            ),
                            shadowColor: Colors.transparent,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "PLAY NOW",
                                style: theme.textTheme.headlineMedium?.copyWith(
                                  fontWeight: FontWeight.w900,
                                  color: buttonTextColor,
                                  letterSpacing: 1.5,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Icon(
                                Icons.play_arrow_rounded,
                                size: 40,
                                color: buttonTextColor,
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Row(
                        children: [
                          Expanded(
                            child: _buildMenuButton(
                              context,
                              "How to Play",
                              Icons.help_outline_rounded,
                              () => Navigator.of(context).push(
                                CupertinoPageRoute(
                                  builder: (_) => const HowToPlayScreen(),
                                ),
                              ),
                              isDark,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildMenuButton(
                              context,
                              "Settings",
                              Icons.settings_outlined,
                              () => Navigator.of(context).push(
                                CupertinoPageRoute(
                                  builder: (_) => const SettingsScreen(),
                                ),
                              ),
                              isDark,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),
                      InkWell(
                        onTap:
                            () => Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const AboutScreen(),
                              ),
                            ),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: Text(
                            "v1.0.0",
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: textColor.withAlpha(100),
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuButton(
    BuildContext context,
    String label,
    IconData icon,
    VoidCallback onTap,
    bool isDark,
  ) {
    final borderColor =
        isDark
            ? AppTheme.darkPrimaryColor.withAlpha(130)
            : AppTheme.lightAccentColor.withAlpha(60);
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final iconColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightAccentColor;
    final bgColor =
        isDark ? AppTheme.darkSurfaceColor : AppTheme.lightSurfaceColor;

    return OutlinedButton(
      onPressed: onTap,
      style: OutlinedButton.styleFrom(
        padding: const EdgeInsets.symmetric(vertical: 20),
        side: BorderSide(color: borderColor, width: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        backgroundColor: bgColor,
        foregroundColor: textColor,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: iconColor, size: 28),
          const SizedBox(height: 8),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: textColor,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}

// --- Custom Painter for the Grid Pattern ---
class PatternPainter extends CustomPainter {
  final double scrollValue;
  final List<String> emojis;
  final Color textColor;

  PatternPainter({
    required this.scrollValue,
    required this.emojis,
    required this.textColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textStyle = TextStyle(
      fontSize: 50, // Fixed size for cleanliness
      color: textColor, // Monochrome look
    );
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    // Grid Settings
    const double spacing = 140.0; // Space between icons
    final int cols = (size.width / spacing).ceil() + 2;
    final int rows = (size.height / spacing).ceil() + 2;

    // Diagonal Scroll Offset
    final double offsetX = scrollValue * spacing;
    final double offsetY = scrollValue * spacing;

    for (int i = 0; i < cols; i++) {
      for (int j = 0; j < rows; j++) {
        // Use modulo to pick emoji consistently
        final int emojiIndex = (i + j) % emojis.length;
        textPainter.text = TextSpan(text: emojis[emojiIndex], style: textStyle);
        textPainter.layout();

        // Calculate position with wrap-around
        // We subtract spacing to start drawing slightly off-screen (top-left)
        double x = (i * spacing) + offsetX - spacing;
        double y = (j * spacing) + offsetY - spacing;

        // Wrap logic: If it goes off-screen, move it back to the start
        // This mimics infinite scrolling
        x = x % (cols * spacing) - spacing;
        y = y % (rows * spacing) - spacing;

        textPainter.paint(canvas, Offset(x, y));
      }
    }
  }

  @override
  bool shouldRepaint(covariant PatternPainter oldDelegate) {
    return oldDelegate.scrollValue != scrollValue ||
        oldDelegate.textColor != textColor;
  }
}
