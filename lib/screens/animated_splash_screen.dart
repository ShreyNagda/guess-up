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
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    // Setup smooth scale & fade animations
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );

    _scaleAnimation = Tween<double>(begin: 0.6, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutBack),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );

    // Remove native splash and start animation + async initialization
    WidgetsBinding.instance.addPostFrameCallback((_) {
      FlutterNativeSplash.remove();
      _animationController.forward();
      _initializeAppAndNavigate();
    });
  }

  Future<void> _initializeAppAndNavigate() async {
    final startTime = DateTime.now();

    try {
      // 1. Initialize Firebase
      await Firebase.initializeApp();
      FirebaseFirestore.instance.settings = const Settings(
        persistenceEnabled: true,
        sslEnabled: true,
      );

      // 2. Pre-load Storage & Audio Services
      final storageService = StorageService();
      await storageService.init();

      final audioService = AudioService();
      await audioService.init();

      // 3. Warmup Category Cache in background
      await CategoryService().getAllCategories();

      // Ensure minimum splash duration for smooth visual handoff (min 1500ms)
      final elapsedTime = DateTime.now().difference(startTime);
      const minDuration = Duration(milliseconds: 1500);
      if (elapsedTime < minDuration) {
        await Future.delayed(minDuration - elapsedTime);
      }

      if (!mounted) return;

      final bool hasSeenOnboarding = storageService.hasSeenOnboarding;
      final Widget targetScreen =
          hasSeenOnboarding ? const HomeScreen() : const OnboardingScreen();

      // Smooth PageRouteBuilder fade transition into main app
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 600),
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
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final backgroundColor =
        isDark ? const Color(0xFF000000) : const Color(0xFFFFFFFF);
    final avatarColor =
        isDark ? const Color(0xFF000000) : const Color(0xFFFFFFFF);
    const logoAsset = "assets/images/logo-transparent.png";
    final titleColor = isDark ? Colors.white : const Color(0xFF212121);
    final subtitleColor = isDark ? Colors.white70 : const Color(0xFF64748B);
    final progressColor =
        isDark ? const Color(0xFFFFD600) : const Color(0xFFFFC107);

    return Scaffold(
      backgroundColor: backgroundColor,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 140,
                  height: 140,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: avatarColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(isDark ? 80 : 20),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Image.asset(logoAsset, fit: BoxFit.contain),
                ),
                const SizedBox(height: 32),
                Text(
                  "GUESS UP",
                  style: TextStyle(
                    fontSize: 40,
                    fontWeight: FontWeight.w900,
                    color: titleColor,
                    letterSpacing: 3,
                    shadows:
                        isDark
                            ? const [
                              Shadow(
                                color: Colors.black45,
                                offset: Offset(3, 3),
                                blurRadius: 4,
                              ),
                            ]
                            : null,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  "The Ultimate Charades Party Game",
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: subtitleColor,
                    letterSpacing: 1.5,
                  ),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: 32,
                  height: 32,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(progressColor),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
