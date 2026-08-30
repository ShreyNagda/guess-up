import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/constants/app_info.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/theme/app_theme.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _scrollController;
  bool _isPlayPressed = false;

  final List<String> _deckEmojis = [
    "🏏",
    "🎬",
    "🍔",
    "🗻",
    "🎧",
    "🅰️",
    "📺",
    "🚀",
    "👑",
  ];

  @override
  void initState() {
    super.initState();
    _setPortraitOnly();
    AudioService().playBackgroundMusic();

    _scrollController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 25),
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

  void _navigateToConfig() {
    AudioService().extraLightImpact();
    Navigator.of(
      context,
    ).push(CupertinoPageRoute(builder: (_) => const ConfigScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          // --- 1. Dynamic Floating Party Icons Background Canvas ---
          Positioned.fill(
            child: Opacity(
              opacity: 0.12,
              child: AnimatedBuilder(
                animation: _scrollController,
                builder: (context, child) {
                  return CustomPaint(
                    painter: FloatingPatternPainter(
                      scrollValue: _scrollController.value,
                      emojis: _deckEmojis,
                      textColor: textColor,
                    ),
                    size: Size.infinite,
                  );
                },
              ),
            ),
          ),

          // --- 2. Bounded Foreground Content ---
          Positioned.fill(
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24.0,
                  vertical: 12.0,
                ),
                child: Column(
                  children: [
                    // Top Navigation Bar (Rules & Settings Icons)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        IconButton(
                          icon: Icon(
                            Icons.help_outline_rounded,
                            size: 30,
                            color: primaryColor,
                          ),
                          tooltip: "How to Play",
                          onPressed: () {
                            AudioService().extraLightImpact();
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder:
                                    (_) => const OnboardingScreen(
                                      isRevisiting: true,
                                    ),
                              ),
                            );
                          },
                        ),
                        IconButton(
                          icon: Icon(
                            Icons.settings_outlined,
                            size: 30,
                            color: primaryColor,
                          ),
                          tooltip: "Settings",
                          onPressed: () {
                            AudioService().extraLightImpact();
                            Navigator.of(context).push(
                              CupertinoPageRoute(
                                builder: (_) => const SettingsScreen(),
                              ),
                            );
                          },
                        ),
                      ],
                    ),

                    // Center Content
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Spacer(),

                          // Title Badge
                          FittedBox(
                            fit: BoxFit.scaleDown,
                            child: Text(
                              "GUESS\nUP",
                              textAlign: TextAlign.center,
                              style: theme.textTheme.displayLarge?.copyWith(
                                fontSize: 88,
                                height: 0.82,
                                fontWeight: FontWeight.w900,
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
                          ),
                          const SizedBox(height: 14),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: primaryColor.withAlpha(40),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: primaryColor.withAlpha(100),
                              ),
                            ),
                            child: Text(
                              "ARCADE PARTY GAME 🎉",
                              textAlign: TextAlign.center,
                              style: theme.textTheme.titleSmall?.copyWith(
                                letterSpacing: 3,
                                fontWeight: FontWeight.w900,
                                color: primaryColor,
                              ),
                            ),
                          ),

                          const Spacer(),

                          // --- 3D Chunky Hero PLAY Button ---
                          GestureDetector(
                            onTapDown:
                                (_) => setState(() => _isPlayPressed = true),
                            onTapUp: (_) {
                              setState(() => _isPlayPressed = false);
                              _navigateToConfig();
                            },
                            onTapCancel:
                                () => setState(() => _isPlayPressed = false),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 100),
                              height: 74,
                              width: double.infinity,
                              transform: Matrix4.translationValues(
                                0,
                                _isPlayPressed ? 6 : 0,
                                0,
                              ),
                              decoration: BoxDecoration(
                                color: primaryColor,
                                borderRadius: BorderRadius.circular(24),
                                boxShadow:
                                    _isPlayPressed
                                        ? []
                                        : [
                                          BoxShadow(
                                            color: Colors.amber.shade900,
                                            offset: const Offset(0, 8),
                                            blurRadius: 0,
                                          ),
                                          BoxShadow(
                                            color: primaryColor.withAlpha(150),
                                            blurRadius: 20,
                                            offset: const Offset(0, 6),
                                          ),
                                        ],
                              ),
                              child: Center(
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      "PLAY",
                                      style: theme.textTheme.headlineMedium
                                          ?.copyWith(
                                            fontWeight: FontWeight.w900,
                                            color: Colors.black,
                                            letterSpacing: 4,
                                            fontSize: 32,
                                          ),
                                    ),
                                    const SizedBox(width: 12),
                                    const Icon(
                                      Icons.play_arrow_rounded,
                                      size: 44,
                                      color: Colors.black,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),

                          const Spacer(),
                        ],
                      ),
                    ),

                    // Version Footer
                    InkWell(
                      onTap:
                          () => Navigator.of(context).push(
                            CupertinoPageRoute(
                              builder: (_) => const SettingsScreen(),
                            ),
                          ),
                      child: Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Text(
                          AppInfo.displayVersion,
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
            ),
          ),
        ],
      ),
    );
  }
}

// --- Animated Floating Pattern Painter ---
class FloatingPatternPainter extends CustomPainter {
  final double scrollValue;
  final List<String> emojis;
  final Color textColor;

  FloatingPatternPainter({
    required this.scrollValue,
    required this.emojis,
    required this.textColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final textStyle = TextStyle(fontSize: 48, color: textColor);
    final textPainter = TextPainter(textDirection: TextDirection.ltr);

    const double spacing = 130.0;
    final int cols = (size.width / spacing).ceil() + 2;
    final int rows = (size.height / spacing).ceil() + 2;

    final double offsetX = scrollValue * spacing;
    final double offsetY = scrollValue * spacing;

    for (int i = 0; i < cols; i++) {
      for (int j = 0; j < rows; j++) {
        final int emojiIndex = (i * 3 + j) % emojis.length;
        textPainter.text = TextSpan(text: emojis[emojiIndex], style: textStyle);
        textPainter.layout();

        double x = (i * spacing) + offsetX - spacing;
        double y = (j * spacing) + offsetY - spacing;

        x = x % (cols * spacing) - spacing;
        y = y % (rows * spacing) - spacing;

        textPainter.paint(canvas, Offset(x, y));
      }
    }
  }

  @override
  bool shouldRepaint(covariant FloatingPatternPainter oldDelegate) {
    return oldDelegate.scrollValue != scrollValue ||
        oldDelegate.textColor != textColor;
  }
}
