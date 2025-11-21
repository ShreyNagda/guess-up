import 'dart:math';
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
  late AnimationController _floatingController;

  // Reduced icon list for cleaner look
  final List<IconData> _icons = [
    Icons.sports_cricket,
    Icons.movie_filter_rounded,
    Icons.fastfood_rounded,
    Icons.music_note_rounded,
    Icons.lightbulb_rounded,
    Icons.travel_explore,
  ];

  final List<_FloatingIcon> _backgroundIcons = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();

    // Initialize FEWER icons (12 instead of 20) for less clutter
    for (int i = 0; i < 15; i++) {
      _backgroundIcons.add(
        _FloatingIcon(
          icon: _icons[_random.nextInt(_icons.length)],
          // Start strictly within bounds (0.1 to 0.9)
          x: 0.1 + _random.nextDouble() * 0.8,
          y: 0.1 + _random.nextDouble() * 0.8,
          // Random velocities
          dx: (_random.nextDouble() - 0.5) * 0.0005,
          dy: (_random.nextDouble() - 0.5) * 0.0005,
          size: 50 + _random.nextDouble() * 50, // Varied sizes
          opacity: 0.05 + _random.nextDouble() * 0.1, // Very subtle
        ),
      );
    }

    _floatingController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 120), // Long loop for smoothness
    )..repeat();
  }

  @override
  void dispose() {
    _floatingController.dispose();
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
          // --- 1. Animated Background Layer ---
          AnimatedBuilder(
            animation: _floatingController,
            builder: (context, child) {
              return Stack(
                children:
                    _backgroundIcons.map((iconData) {
                      // Update position
                      iconData.x += iconData.dx;
                      iconData.y += iconData.dy;

                      // Bounce off edges logic
                      // Check Left/Right edges (allowing for icon size slightly)
                      if (iconData.x < 0.05 || iconData.x > 0.95) {
                        iconData.dx = -iconData.dx;
                        // Clamp to prevent sticking
                        iconData.x = iconData.x.clamp(0.05, 0.95);
                      }

                      // Check Top/Bottom edges
                      if (iconData.y < 0.05 || iconData.y > 0.95) {
                        iconData.dy = -iconData.dy;
                        // Clamp to prevent sticking
                        iconData.y = iconData.y.clamp(0.05, 0.95);
                      }

                      return Positioned(
                        left: iconData.x * size.width,
                        top: iconData.y * size.height,
                        child: Icon(
                          iconData.icon,
                          size: iconData.size,
                          color: (isDark
                                  ? AppTheme.darkPrimaryColor
                                  : AppTheme.lightAccentColor)
                              .withAlpha((iconData.opacity * 255).round()),
                        ),
                      );
                    }).toList(),
              );
            },
          ),

          // --- 2. Foreground UI ---
          SafeArea(
            child: Stack(
              children: [
                // Title Section (Top 1/3)
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

                // Actions Section (Bottom 1/3)
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

// Data class for floating icons
class _FloatingIcon {
  IconData icon;
  double x;
  double y;
  double dx;
  double dy;
  double size;
  double opacity;

  _FloatingIcon({
    required this.icon,
    required this.x,
    required this.y,
    required this.dx,
    required this.dy,
    required this.size,
    required this.opacity,
  });
}
