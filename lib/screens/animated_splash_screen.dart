import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/screens/onboarding_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';

class AnimatedSplashScreen extends StatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  State<AnimatedSplashScreen> createState() => _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends State<AnimatedSplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _mainController;
  late AnimationController _glowController;
  late AnimationController _slideEmojiController;

  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _glowAnimation;

  static const List<String> _categoryEmojis = [
    '🎬',
    '🍕',
    '😎',
    '🔥',
    '🎵',
    '✈️',
    '🏏',
    '⚽',
    '🚀',
  ];

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    _mainController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );

    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3500),
    )..repeat(reverse: true);

    _slideEmojiController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 30000),
    )..repeat();

    _scaleAnimation = Tween<double>(begin: 0.3, end: 1.0).animate(
      CurvedAnimation(parent: _mainController, curve: Curves.elasticOut),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _mainController,
        curve: const Interval(0.0, 0.6, curve: Curves.easeIn),
      ),
    );

    _glowAnimation = Tween<double>(begin: 12.0, end: 32.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      FlutterNativeSplash.remove();
      _mainController.forward();
      _initializeAppAndNavigate();
    });
  }

  Future<void> _initializeAppAndNavigate() async {
    final startTime = DateTime.now();

    try {
      await Firebase.initializeApp();
      FirebaseFirestore.instance.settings = const Settings(
        persistenceEnabled: true,
        sslEnabled: true,
      );

      final storageService = StorageService();
      await storageService.init();

      final audioService = AudioService();
      await audioService.init();

      await CategoryService().getAllCategories();

      final elapsedTime = DateTime.now().difference(startTime);
      const minDuration = Duration(milliseconds: 2800);
      if (elapsedTime < minDuration) {
        await Future.delayed(minDuration - elapsedTime);
      }

      if (!mounted) return;

      final bool hasSeenOnboarding = storageService.hasSeenOnboarding;
      final Widget targetScreen =
          hasSeenOnboarding ? const HomeScreen() : const OnboardingScreen();

      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 700),
        ),
      );
    } catch (e) {
      debugPrint("Error initializing app during splash: $e");
      if (!mounted) return;
      Navigator.of(
        context,
      ).pushReplacement(CupertinoPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  @override
  void dispose() {
    _mainController.dispose();
    _glowController.dispose();
    _slideEmojiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor =
        isDark ? const Color(0xFF0F0F12) : const Color(0xFFFAF9F6);
    final accentGlow =
        isDark ? const Color(0xFFFFD600) : const Color(0xFFFFC107);
    final titleColor = isDark ? Colors.white : const Color(0xFF1E1E1E);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Stack(
        children: [
          // 1. Animated Diagonal Category Emoji Marquee Background
          _DiagonalEmojiBackground(
            emojis: _categoryEmojis,
            controller: _slideEmojiController,
            isDark: isDark,
            accentGlow: accentGlow,
          ),

          // 2. Ambient Central Radial Glow
          AnimatedBuilder(
            animation: _glowController,
            builder: (context, child) {
              return Center(
                child: Container(
                  width: 260 + (_glowAnimation.value * 2),
                  height: 260 + (_glowAnimation.value * 2),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        accentGlow.withAlpha(isDark ? 55 : 35),
                        accentGlow.withAlpha(0),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),

          // 3. Foreground Logo & Title Content
          Center(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo with elastic spring & pulsating glow
                  AnimatedBuilder(
                    animation: _glowController,
                    builder: (context, child) {
                      return ScaleTransition(
                        scale: _scaleAnimation,
                        child: Container(
                          width: 135,
                          height: 135,
                          padding: const EdgeInsets.all(22),
                          decoration: BoxDecoration(
                            color:
                                isDark ? const Color(0xFF1E1E24) : Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: accentGlow.withAlpha(140),
                              width: 3.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: accentGlow.withAlpha(isDark ? 110 : 70),
                                blurRadius: _glowAnimation.value,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Image.asset(
                            "assets/images/logo-transparent.png",
                            fit: BoxFit.contain,
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 32),

                  // Title
                  Text(
                    "GUESS UP",
                    style: TextStyle(
                      fontSize: 42,
                      fontWeight: FontWeight.w900,
                      color: titleColor,
                      letterSpacing: 4,
                      fontFamily: 'Manrope',
                      shadows: [
                        Shadow(
                          color: accentGlow.withAlpha(150),
                          blurRadius: 18,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 8),

                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 18,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: accentGlow.withAlpha(30),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: accentGlow.withAlpha(70)),
                    ),
                    child: Text(
                      "THE ULTIMATE PARTY CHARADES",
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color:
                            isDark
                                ? Colors.amberAccent
                                : const Color(0xFFD97706),
                        letterSpacing: 2.0,
                      ),
                    ),
                  ),

                  const SizedBox(height: 56),

                  // Loader Pill
                  SizedBox(
                    width: 52,
                    height: 6,
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(3),
                      child: LinearProgressIndicator(
                        backgroundColor: accentGlow.withAlpha(40),
                        valueColor: AlwaysStoppedAnimation<Color>(accentGlow),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DiagonalEmojiBackground extends StatelessWidget {
  final List<String> emojis;
  final AnimationController controller;
  final bool isDark;
  final Color accentGlow;

  const _DiagonalEmojiBackground({
    required this.emojis,
    required this.controller,
    required this.isDark,
    required this.accentGlow,
  });

  static const List<String> _defaultFallbackEmojis = [
    '🎬',
    '🍕',
    '😎',
    '🔥',
    '🎵',
    '✈️',
    '🏏',
    '🎉',
    '⚽',
    '🚀',
  ];

  @override
  Widget build(BuildContext context) {
    // 1. Filter valid emojis & fallback if empty
    final List<String> activeEmojis =
        emojis.where((e) => e.trim().isNotEmpty).toList();
    final List<String> effectiveEmojis =
        activeEmojis.isEmpty ? _defaultFallbackEmojis : activeEmojis;

    // 2. Pad list to ensure pleasant minimum pattern variation
    List<String> patternEmojis = List<String>.from(effectiveEmojis);
    while (patternEmojis.length < 6) {
      patternEmojis.addAll(effectiveEmojis);
    }

    const int rowCount = 28;
    const double fontSize = 28.0;
    const double horizontalPadding = 26.0;
    const double verticalPadding = 22.0;
    const double itemWidth = fontSize + (horizontalPadding * 2); // 80.0

    final int patternLength = patternEmojis.length;
    final double sequenceWidth = patternLength * itemWidth;

    const double targetSpan = 4000.0;
    final int leftExtraCycles = (targetSpan / 2 / sequenceWidth).ceil() + 2;
    final double leftOffset = leftExtraCycles * sequenceWidth;
    final int repeatCount =
        (leftExtraCycles * 2) + (targetSpan / sequenceWidth).ceil() + 4;

    return IgnorePointer(
      child: ClipRect(
        child: OverflowBox(
          minWidth: 0.0,
          maxWidth: double.infinity,
          minHeight: 0.0,
          maxHeight: double.infinity,
          child: Transform.rotate(
            angle: -0.32, // Diagonal angle ~18 degrees
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(rowCount, (rowIndex) {
                final bool isEven = rowIndex % 2 == 0;
                final double direction = isEven ? 1.0 : -1.0;
                final double baseOffset = (rowIndex * 75.0);

                // Rotate emoji list per row for diagonal variety
                final int shift = rowIndex % patternLength;
                final List<String> shiftedEmojis = [
                  ...patternEmojis.sublist(shift),
                  ...patternEmojis.sublist(0, shift),
                ];

                return _EmojiRow(
                  key: ValueKey('emoji_row_$rowIndex'),
                  controller: controller,
                  shiftedEmojis: shiftedEmojis,
                  repeatCount: repeatCount,
                  sequenceWidth: sequenceWidth,
                  leftOffset: leftOffset,
                  direction: direction,
                  baseOffset: baseOffset,
                  fontSize: fontSize,
                  horizontalPadding: horizontalPadding,
                  verticalPadding: verticalPadding,
                  isDark: isDark,
                  accentGlow: accentGlow,
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmojiRow extends StatefulWidget {
  final AnimationController controller;
  final List<String> shiftedEmojis;
  final int repeatCount;
  final double sequenceWidth;
  final double leftOffset;
  final double direction;
  final double baseOffset;
  final double fontSize;
  final double horizontalPadding;
  final double verticalPadding;
  final bool isDark;
  final Color accentGlow;

  const _EmojiRow({
    super.key,
    required this.controller,
    required this.shiftedEmojis,
    required this.repeatCount,
    required this.sequenceWidth,
    required this.leftOffset,
    required this.direction,
    required this.baseOffset,
    required this.fontSize,
    required this.horizontalPadding,
    required this.verticalPadding,
    required this.isDark,
    required this.accentGlow,
  });

  @override
  State<_EmojiRow> createState() => _EmojiRowState();
}

class _EmojiRowState extends State<_EmojiRow> {
  late Widget _staticRowWidget;

  @override
  void initState() {
    super.initState();
    _buildStaticRowWidget();
  }

  @override
  void didUpdateWidget(covariant _EmojiRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.shiftedEmojis != widget.shiftedEmojis ||
        oldWidget.repeatCount != widget.repeatCount ||
        oldWidget.horizontalPadding != widget.horizontalPadding ||
        oldWidget.verticalPadding != widget.verticalPadding ||
        oldWidget.isDark != widget.isDark ||
        oldWidget.accentGlow != widget.accentGlow) {
      _buildStaticRowWidget();
    }
  }

  void _buildStaticRowWidget() {
    _staticRowWidget = RepaintBoundary(
      child: UnconstrainedBox(
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: widget.verticalPadding),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: List.generate(widget.repeatCount, (repeatIndex) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children:
                    widget.shiftedEmojis.map((emoji) {
                      return Padding(
                        padding: EdgeInsets.symmetric(
                          horizontal: widget.horizontalPadding,
                        ),
                        child: Text(
                          emoji,
                          style: TextStyle(
                            fontFamily: 'NotoEmoji',
                            fontSize: widget.fontSize,
                            color: (widget.isDark ? Colors.white : Colors.black)
                                .withAlpha(widget.isDark ? 45 : 30),
                            shadows: [
                              Shadow(
                                color: widget.accentGlow.withAlpha(
                                  widget.isDark ? 40 : 20,
                                ),
                                blurRadius: 10,
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
              );
            }),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      child: _staticRowWidget,
      builder: (context, child) {
        final double translation =
            (widget.controller.value *
                widget.sequenceWidth *
                widget.direction) +
            widget.baseOffset;
        final double wrappedOffset =
            (translation % widget.sequenceWidth) - widget.leftOffset;

        return Transform.translate(
          offset: Offset(wrappedOffset, 0),
          child: child,
        );
      },
    );
  }
}
