import 'dart:async';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/arcade_page_route.dart';

/// Option A: Supercell Game Engine Bounce Splash Screen
/// Features 3D Elastic Logo Drop + Dynamic 0% -> 100% Progress Bar + Floating Particles
class AnimatedSplashScreen extends StatefulWidget {
  const AnimatedSplashScreen({super.key});

  @override
  State<AnimatedSplashScreen> createState() => _AnimatedSplashScreenState();
}

class _AnimatedSplashScreenState extends State<AnimatedSplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _bounceController;
  late Animation<double> _logoScaleAnimation;
  late Animation<double> _logoTranslateAnimation;

  double _loadingProgress = 0.0;
  String _statusText = "INITIALIZING GAME ENGINE...";
  bool _isInitializationComplete = false;

  @override
  void initState() {
    super.initState();
    _setTransparentStatusBar();

    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _logoScaleAnimation = Tween<double>(begin: 0.2, end: 1.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    _logoTranslateAnimation = Tween<double>(begin: -150.0, end: 0.0).animate(
      CurvedAnimation(parent: _bounceController, curve: Curves.elasticOut),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      FlutterNativeSplash.remove();
      _bounceController.forward();
      _startLoadingSequence();
    });
  }

  void _setTransparentStatusBar() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
        systemNavigationBarColor: Colors.transparent,
      ),
    );
  }

  Future<void> _startLoadingSequence() async {
    // Step 1: Initialize Firebase & Storage (0% -> 40%)
    _updateProgress(0.15, "INITIALIZING GAME ENGINE...");
    await Future.delayed(const Duration(milliseconds: 300));

    try {
      await Firebase.initializeApp();
      FirebaseFirestore.instance.settings = const Settings(
        persistenceEnabled: true,
        sslEnabled: true,
      );

      final storageService = GameStorageService();
      await storageService.init();

      final audioEngine = GameAudioEngine();
      await audioEngine.init();

      _updateProgress(0.55, "LOADING DECK CATALOG...");
      await Future.delayed(const Duration(milliseconds: 400));

      final categoryService = CategoryService();
      await categoryService.getAllCategories();

      _updateProgress(0.88, "BUILDING ARCADE CANVAS...");
      await Future.delayed(const Duration(milliseconds: 400));

      _updateProgress(1.0, "READY TO PLAY!");
      await Future.delayed(const Duration(milliseconds: 300));

      _navigateToHome(storageService);
    } catch (e) {
      debugPrint("Initialization warning: $e");
      _updateProgress(1.0, "READY!");
      await Future.delayed(const Duration(milliseconds: 300));
      _navigateToHome(GameStorageService());
    }
  }

  void _updateProgress(double progress, String status) {
    if (mounted) {
      setState(() {
        _loadingProgress = progress;
        _statusText = status;
      });
    }
  }

  void _navigateToHome(GameStorageService storageService) {
    if (!mounted || _isInitializationComplete) return;
    _isInitializationComplete = true;

    Navigator.of(
      context,
    ).pushReplacement(ArcadePageRoute(page: const HomeScreen()));
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF0E0C1C) : const Color(0xFF130E26),
      body: AmbientBackground(
        ambientColor: Colors.amberAccent,
        child: SafeArea(
          child: Column(
            children: [
              const Spacer(flex: 2),

              // 1. 3D Elastic Logo Drop Emblem
              AnimatedBuilder(
                animation: _bounceController,
                builder: (context, child) {
                  return Transform.translate(
                    offset: Offset(0, _logoTranslateAnimation.value),
                    child: Transform.scale(
                      scale: _logoScaleAnimation.value,
                      child: child,
                    ),
                  );
                },
                child: Column(
                  children: [
                    // Main Title Card
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.circular(28),
                        border: Border.all(color: Colors.white, width: 3.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0xFF8E4800),
                            offset: Offset(0, 7),
                          ),
                          BoxShadow(
                            color: Colors.amberAccent,
                            blurRadius: 30,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            "GUESS UP",
                            style: TextStyle(
                              fontFamily: 'Manrope',
                              fontSize: 36,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 4.0,
                              color: Colors.black,
                              shadows: [
                                Shadow(
                                  color: Colors.white70,
                                  offset: Offset(0, 1.5),
                                ),
                              ],
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            "PARTY CHARADES",
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 3.0,
                              color: Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(flex: 2),

              // 2. Supercell 3D Progress Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 40),
                child: Column(
                  children: [
                    // Progress Track Container
                    Container(
                      height: 24,
                      padding: const EdgeInsets.all(3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A0814),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white24, width: 1.5),
                        boxShadow: const [
                          BoxShadow(
                            color: Colors.black87,
                            blurRadius: 8,
                            offset: Offset(0, 3),
                          ),
                        ],
                      ),
                      child: TweenAnimationBuilder<double>(
                        tween: Tween<double>(begin: 0, end: _loadingProgress),
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeOutCubic,
                        builder: (context, value, child) {
                          return Stack(
                            children: [
                              FractionallySizedBox(
                                widthFactor: value.clamp(0.0, 1.0),
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: const LinearGradient(
                                      colors: [
                                        Color(0xFFFFD600),
                                        Color(0xFFFF9100),
                                      ],
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: const [
                                      BoxShadow(
                                        color: Colors.amberAccent,
                                        blurRadius: 10,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              Center(
                                child: Text(
                                  "${(value * 100).toInt()}%",
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: 1,
                                    shadows: [
                                      Shadow(
                                        color: Colors.black,
                                        blurRadius: 4,
                                        offset: Offset(0, 1),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Live Status Text
                    Text(
                      _statusText,
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w900,
                        color: Colors.white70,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}
