import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';

class OnboardingScreen extends StatefulWidget {
  final bool isRevisiting;

  const OnboardingScreen({super.key, this.isRevisiting = false});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with SingleTickerProviderStateMixin {
  final PageController _pageController = PageController();
  final CategoryService _categoryService = CategoryService();
  final StorageService _storageService = StorageService();

  int _currentPage = 0;
  List<Category> _loadedCategories = [];
  List<Category> _selectedCategories = [];

  int _selectedDuration = 60;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    _selectedDuration = _storageService.gameDuration;

    try {
      final cats = await _categoryService.getAllCategories();
      if (mounted) {
        setState(() {
          _loadedCategories = cats;
          _selectedCategories = List.from(cats);
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _handleSkip() async {
    await _storageService.setOnboardingSeen(true);
    if (!mounted) return;
    if (widget.isRevisiting) {
      Navigator.of(context).pop();
    } else {
      Navigator.of(
        context,
      ).pushReplacement(CupertinoPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  void _startFirstGame() async {
    await _storageService.setOnboardingSeen(true);
    if (!mounted) return;

    final categoriesToPlay =
        _selectedCategories.isNotEmpty
            ? _selectedCategories
            : _loadedCategories;

    // Save preferences
    await _storageService.setLastCategoryIds(
      categoriesToPlay.map((c) => c.id).toList(),
    );

    if (!mounted) return;
    final nav = Navigator.of(context);

    nav.pushReplacement(CupertinoPageRoute(builder: (_) => const HomeScreen()));
    if (!widget.isRevisiting) {
      nav.push(
        CupertinoPageRoute(
          builder:
              (_) => GameScreen(
                time: _selectedDuration,
                selectedCategories: categoriesToPlay,
              ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor = theme.colorScheme.primary;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading:
            widget.isRevisiting
                ? IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                )
                : null,
        actions: [
          if (_currentPage < 4)
            TextButton(
              onPressed: _handleSkip,
              child: Text(
                "Skip",
                style: TextStyle(
                  color: isDark ? primaryColor : theme.hintColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: (idx) => setState(() => _currentPage = idx),
                children: [
                  _buildForeheadSlide(theme, isDark, primaryColor),
                  _buildFriendsCluesSlide(theme, isDark, primaryColor),
                  _buildTiltDownSlide(theme, isDark, primaryColor),
                  _buildTiltUpSlide(theme, isDark, primaryColor),
                  _buildReadyToPlaySlide(theme, isDark, primaryColor),
                ],
              ),
            ),

            // Navigation Controls
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 24.0,
                vertical: 16.0,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Page Indicators
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      5,
                      (index) => AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 4.0),
                        height: 8.0,
                        width: _currentPage == index ? 24.0 : 8.0,
                        decoration: BoxDecoration(
                          color:
                              _currentPage == index
                                  ? primaryColor
                                  : theme.dividerColor.withAlpha(60),
                          borderRadius: BorderRadius.circular(4.0),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Bottom Button
                  SizedBox(
                    width: double.infinity,
                    height: 56,
                    child: ElevatedButton(
                      onPressed: () {
                        if (_currentPage < 4) {
                          _pageController.nextPage(
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                          );
                        } else {
                          _startFirstGame();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        elevation: 3,
                      ),
                      child: Text(
                        _currentPage == 4
                            ? widget.isRevisiting
                                ? "START GUESSING"
                                : "START FIRST GAME NOW"
                            : "NEXT",
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.0,
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
    );
  }

  // --- VISUAL SLIDE 1: Phone on Forehead Vector Graphic ---
  Widget _buildForeheadSlide(ThemeData theme, bool isDark, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Transparent Vector Illustration Container
          Container(
            height: 220,
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/onboarding/1.webp',
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "1. Place Phone on Forehead",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            "Hold your phone horizontally against your forehead with the screen facing outward towards your friends.\nDon't look at the screen—only your friends can see the word!",
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.4,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- VISUAL SLIDE 2: Friends Act & Give Clues Vector Graphic ---
  Widget _buildFriendsCluesSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
  ) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Transparent Vector Illustration Container
          Container(
            height: 220,
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/onboarding/2.webp',
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "2. Friends Act & Shout Clues",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            "Your friends must act, mime, hum, dance, or describe hints to help you guess the word on your forehead.\nNo saying the actual word!",
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.4,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- VISUAL SLIDE 3: Tilt Down = Correct! Vector Graphic ---
  Widget _buildTiltDownSlide(ThemeData theme, bool isDark, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Transparent Vector Illustration Container
          Container(
            height: 220,
            width: 300,
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/onboarding/3.webp',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "3. Tilt Down for Correct (+1)",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            "Guessed the word right? Tilt your phone screen DOWN towards the floor to score +1 point and load the next word!",
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.4,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- VISUAL SLIDE 4: Tilt Up = Pass Word! Vector Graphic ---
  Widget _buildTiltUpSlide(ThemeData theme, bool isDark, Color primaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Transparent Vector Illustration Container
          Container(
            height: 220,
            width: 300,
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/onboarding/4.webp',
              fit: BoxFit.cover,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "4. Tilt Up to Pass Word",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            "Stuck or word too difficult? Tilt your phone screen UP towards the ceiling to pass with no point penalty!",
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.4,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- VISUAL SLIDE 5: Ready to Play Vector Graphic ---
  Widget _buildReadyToPlaySlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Transparent Vector Illustration Container
          Container(
            height: 200,
            padding: const EdgeInsets.all(8),
            child: Image.asset(
              'assets/images/onboarding/5.webp',
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            "5. You're Ready to Guess Up!",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            "Your round timer and selected category decks are all set up. Gather your friends and start playing now!",
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.4,
              color: theme.hintColor,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),

          // Setup Summary Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: theme.cardColor,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: theme.dividerColor),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Selected Decks:",
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      "${_selectedCategories.length} Decks Selected",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const Divider(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      "Round Timer:",
                      style: TextStyle(fontWeight: FontWeight.w600),
                    ),
                    Text(
                      "$_selectedDuration Seconds",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pushReplacement(
                CupertinoPageRoute(builder: (_) => const ConfigScreen()),
              );
            },
            child: Text("Change config"),
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }
}
