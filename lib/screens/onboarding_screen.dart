import 'dart:math' as math;

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/config_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:provider/provider.dart';

class OnboardingScreen extends StatefulWidget {
  final bool isRevisiting;

  const OnboardingScreen({super.key, this.isRevisiting = false});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final PageController _pageController = PageController();
  final CategoryService _categoryService = CategoryService();
  int _currentPage = 0;
  List<Category> _loadedCategories = [];
  bool _categoriesLoaded = false;
  late AnimationController _countdownController;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _loadCategories();
    _countdownController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
  }

  Future<void> _loadCategories() async {
    try {
      final categories = await _categoryService.getAllCategories();
      if (mounted) {
        setState(() {
          _loadedCategories = categories;
          _categoriesLoaded = true;
        });
      }
    } catch (e) {
      debugPrint("Error loading categories for onboarding: $e");
      if (mounted) {
        setState(() {
          _categoriesLoaded = true;
        });
      }
    }
  }

  void _triggerCountdownAnimation() {
    if (_currentPage == 2) {
      _countdownController.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    _countdownController.dispose();
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentPage = index;
    });
    _triggerCountdownAnimation();
  }

  void _startGame(StorageService storage) async {
    if (widget.isRevisiting) {
      Navigator.of(context).pushReplacement(
        CupertinoPageRoute(builder: (_) => const ConfigScreen()),
      );
    } else {
      await storage.setOnboardingSeen(true);
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
        Navigator.of(context).push(
          CupertinoPageRoute(builder: (_) => const ConfigScreen()),
        );
      }
    }
  }

  void _handleNext(StorageService storage) async {
    if (_currentPage < 6) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _startGame(storage);
    }
  }

  void _handleSkip(StorageService storage) async {
    if (widget.isRevisiting) {
      Navigator.of(context).pop();
    } else {
      await storage.setOnboardingSeen(true);
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final storage = Provider.of<StorageService>(context, listen: false);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor = theme.colorScheme.primary;
    final textColor = theme.colorScheme.onSurface;
    final accentColor = theme.colorScheme.secondary;

    final List<Widget> slides = [
      _buildWelcomeSlide(theme, isDark, primaryColor, textColor),
      _buildDecksSlide(theme, isDark, primaryColor, textColor),
      _buildPlacementSlide(theme, isDark, primaryColor, textColor),
      _buildTiltDownSlide(theme, isDark, primaryColor, textColor),
      _buildTiltUpSlide(theme, isDark, primaryColor, textColor),
      _buildResultsSlide(theme, isDark, primaryColor, textColor),
      _buildCTASlide(theme, isDark, primaryColor, textColor, storage),
    ];

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Column(
          children: [
            // Top Bar with Skip Button
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 16.0,
                vertical: 8.0,
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Back button if revisiting, otherwise spacer
                  widget.isRevisiting
                      ? IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded),
                        onPressed: () => Navigator.of(context).pop(),
                      )
                      : const SizedBox(width: 48),

                  // Skip button (hide on the last page)
                  _currentPage < 6
                      ? TextButton(
                        onPressed: () => _handleSkip(storage),
                        child: Text(
                          "Skip",
                          style: theme.textTheme.labelLarge?.copyWith(
                            color: isDark ? primaryColor : theme.hintColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      )
                      : const SizedBox(width: 48),
                ],
              ),
            ),

            // Page View for slides
            Expanded(
              child: PageView(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                children: slides,
              ),
            ),

            // Bottom Navigation Area
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Indicator Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      slides.length,
                      (index) => _buildIndicator(index, theme, primaryColor),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Action Button
                  SizedBox(
                    width: double.infinity,
                    height: 60,
                    child: ElevatedButton(
                      onPressed: () => _handleNext(storage),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: primaryColor,
                        foregroundColor: accentColor,
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
                      child: Text(
                        _currentPage == 6
                            ? (widget.isRevisiting ? "Got it!" : "Let's Play!")
                            : "Next",
                        style: const TextStyle(
                          fontSize: 18,
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
    );
  }

  Widget _buildIndicator(int index, ThemeData theme, Color primaryColor) {
    final isSelected = _currentPage == index;
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      margin: const EdgeInsets.symmetric(horizontal: 4.0),
      height: 8.0,
      width: isSelected ? 24.0 : 8.0,
      decoration: BoxDecoration(
        color: isSelected ? primaryColor : theme.dividerColor.withAlpha(50),
        borderRadius: BorderRadius.circular(4.0),
      ),
    );
  }

  // --- SLIDE 1: Welcome ---
  Widget _buildWelcomeSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          CircleAvatar(
            radius: 80,
            backgroundImage: AssetImage("assets/images/logo.png"),
          ),
          const SizedBox(height: 48),
          Text(
            "GUESS UP",
            style: theme.textTheme.displayLarge?.copyWith(
              fontSize: 48,
              fontWeight: FontWeight.w900,
              letterSpacing: -1,
              color: isDark ? primaryColor : textColor,
              shadows: [
                Shadow(
                  color: isDark ? Colors.black54 : primaryColor.withAlpha(120),
                  offset: const Offset(3, 3),
                  blurRadius: 0,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Text(
            "The Ultimate Party Charades Game!",
            style: theme.textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: isDark ? textColor.withAlpha(200) : textColor,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Put the phone on your forehead and guess the words based on your friends' funny descriptions, actions, or sounds!",
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- SLIDE 2: Choose Decks ---
  Widget _buildDecksSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.start,
        children: [
          const SizedBox(height: 24),
          Text(
            "1. Choose Your Decks",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Pick one or mix multiple fun decks! You can also head over to Settings to create your own custom word decks.",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          // Display actual category cards
          Expanded(
            child:
                _categoriesLoaded && _loadedCategories.isNotEmpty
                    ? GridView.builder(
                      shrinkWrap: true,
                      physics: const BouncingScrollPhysics(),
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 3,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                            childAspectRatio: 0.85,
                          ),
                      itemCount:
                          _loadedCategories.length > 6
                              ? 6
                              : _loadedCategories.length,
                      itemBuilder: (context, index) {
                        final category = _loadedCategories[index];
                        return _buildOnboardingCategoryCard(
                          category,
                          theme,
                          primaryColor,
                        );
                      },
                    )
                    : _buildMockDecksPlaceholder(theme, primaryColor),
          ),
        ],
      ),
    );
  }

  Widget _buildOnboardingCategoryCard(
    Category category,
    ThemeData theme,
    Color primaryColor,
  ) {
    return Container(
      decoration: BoxDecoration(
        color: primaryColor.withAlpha(20),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: primaryColor.withAlpha(100), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(category.icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Text(
              category.name,
              textAlign: TextAlign.center,
              style: theme.textTheme.labelMedium?.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMockDecksPlaceholder(ThemeData theme, Color primaryColor) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.dividerColor.withAlpha(30), width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(15),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildMockDeck("🏏 Cricket", true, theme, primaryColor),
          _buildMockDeck("🎬 Bollywood", true, theme, primaryColor),
          _buildMockDeck("🍔 Food", false, theme, primaryColor),
        ],
      ),
    );
  }

  Widget _buildMockDeck(
    String title,
    bool isSelected,
    ThemeData theme,
    Color primaryColor,
  ) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      width: 90,
      decoration: BoxDecoration(
        color: isSelected ? primaryColor.withAlpha(60) : theme.cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSelected ? primaryColor : theme.dividerColor.withAlpha(40),
          width: 2,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title.split(' ')[0], style: const TextStyle(fontSize: 24)),
          const SizedBox(height: 8),
          Text(
            title.split(' ')[1],
            style: theme.textTheme.labelMedium?.copyWith(
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          Icon(
            isSelected
                ? Icons.check_circle_rounded
                : Icons.radio_button_unchecked_rounded,
            color: isSelected ? primaryColor : theme.hintColor,
            size: 16,
          ),
        ],
      ),
    );
  }

  // --- SLIDE 3: Placement ---
  Widget _buildPlacementSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Placement high-fidelity mockup inside device frame
          _buildDeviceFrame(
            isLandscape: true,
            child: _buildCountdownMockup(theme),
          ),
          const SizedBox(height: 36),
          Text(
            "2. Place on Forehead",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Hold the phone horizontal and place it against your forehead, facing your friends. A 3-second countdown will start to prepare you!",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- SLIDE 4: Tilt Down for Correct ---
  Widget _buildTiltDownSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(width: 16),
              _buildDeviceFrame(
                isLandscape: true,
                child: Image.asset(
                  "assets/images/correct_mockup.png",
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
            ],
          ),
          const SizedBox(height: 24),
          _buildTiltIndicator(isTiltDown: true, color: const Color(0xFF4CAF50)),
          const SizedBox(height: 24),
          Text(
            "3. Got it Right? Tilt Down!",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "When you guess the word correctly, tilt the phone screen down towards the ground. You'll gain 1 point and load the next word!",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- SLIDE 5: Tilt Up to Pass ---
  Widget _buildTiltUpSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(width: 16),
              _buildDeviceFrame(
                isLandscape: true,
                child: Image.asset(
                  "assets/images/pass_mockup.png",
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 16),
            ],
          ),
          const SizedBox(height: 24),
          _buildTiltIndicator(
            isTiltDown: false,
            color: const Color(0xFFFF5252),
          ),
          const SizedBox(height: 24),
          Text(
            "4. Need to Pass? Tilt Up!",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Don't waste time on hard words! Tilt the screen up towards the sky to pass the word. No points are lost, and you move on quickly.",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- SLIDE 6: Results ---
  Widget _buildResultsSlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // Game Over portrait mockup inside phone frame
          _buildDeviceFrame(child: _buildResultsMockup(theme, isDark)),
          const SizedBox(height: 36),
          Text(
            "5. Beat the Timer!",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Guess as many words as you can before the time runs out. At the end, look through the scoreboard to see who ruled the game!",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  // --- DEVICE FRAME HELPER ---
  Widget _buildDeviceFrame({
    required Widget child,
    bool isLandscape = true,
    double angle = 0.0,
  }) {
    return Center(
      child: Transform.rotate(
        angle: angle,
        child: Container(
          width: isLandscape ? 300 : 180,
          height: isLandscape ? 150 : 280,
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFF2C2C2C), width: 5),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(50),
                blurRadius: 16,
                spreadRadius: 2,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(19),
            child: child,
          ),
        ),
      ),
    );
  }

  // --- MOCKUPS CREATION ---

  Widget _buildCountdownMockup(ThemeData theme) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Score
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    "SCORE",
                    style: TextStyle(
                      fontSize: 5,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[600],
                      letterSpacing: 0.5,
                    ),
                  ),
                  const Text(
                    "0",
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                      height: 1.0,
                    ),
                  ),
                ],
              ),
              // Timer
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFFFD600), width: 2),
                ),
                alignment: Alignment.center,
                child: const Text(
                  "45",
                  style: TextStyle(
                    fontSize: 8,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFFFFD600),
                  ),
                ),
              ),
              // Pause
              const Icon(Icons.pause_rounded, size: 10, color: Colors.black),
            ],
          ),
          const Spacer(),
          const Text(
            "Get Ready!",
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          const Text(
            "3",
            style: TextStyle(
              fontSize: 42,
              fontWeight: FontWeight.w900,
              color: Colors.black,
              height: 1.0,
            ),
          ),
          const Spacer(),
        ],
      ),
    );
  }

  Widget _buildResultsMockup(ThemeData theme, bool isDark) {
    return Container(
      color: isDark ? const Color(0xFF121212) : const Color(0xFFFAFAFA),
      padding: const EdgeInsets.all(12),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Text(
            "Game Over",
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w900,
              color: isDark ? Colors.white : Colors.black,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            "Score: 2",
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: isDark ? Colors.white : Colors.black,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            "Correct: 2  Passed: 4",
            style: TextStyle(
              fontSize: 7,
              fontWeight: FontWeight.w500,
              color: isDark ? Colors.white60 : Colors.black54,
            ),
          ),
          const Spacer(),
          // Chips wrap
          Wrap(
            spacing: 4,
            runSpacing: 4,
            alignment: WrapAlignment.center,
            children: [
              _buildMiniMockBadge("Stree", false, isDark),
              _buildMiniMockBadge("Veer-Zaara", true, isDark),
              _buildMiniMockBadge("Singham", false, isDark),
              _buildMiniMockBadge("Om Shanti...", false, isDark),
              _buildMiniMockBadge("Tanu Weds...", true, isDark),
              _buildMiniMockBadge("Taare Zam...", false, isDark),
            ],
          ),
          const Spacer(),
          // Replay & Home Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFD600),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.black, width: 0.8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.replay_rounded, size: 7, color: Colors.black),
                    SizedBox(width: 2),
                    Text(
                      "Replay",
                      style: TextStyle(
                        fontSize: 6,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: Colors.black, width: 0.8),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.home_outlined, size: 7, color: Colors.black),
                    SizedBox(width: 2),
                    Text(
                      "Back to Home",
                      style: TextStyle(
                        fontSize: 6,
                        fontWeight: FontWeight.bold,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }

  Widget _buildMiniMockBadge(String text, bool isCorrect, bool isDark) {
    final bgColor =
        isCorrect ? const Color(0xFFE8F5E9) : const Color(0xFFFFEBEE);
    final textColor =
        isCorrect ? const Color(0xFF2E7D32) : const Color(0xFFC62828);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: textColor.withAlpha(80), width: 0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            text,
            style: TextStyle(
              fontSize: 5.5,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(width: 1),
          Icon(
            isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded,
            size: 6,
            color: textColor,
          ),
        ],
      ),
    );
  }

  Widget _buildTiltIndicator({required bool isTiltDown, required Color color}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: color.withAlpha(20),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withAlpha(80), width: 2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Transform.rotate(
            angle: math.pi / 2,
            child: Icon(Icons.phone_android_rounded, color: color, size: 28),
          ),
          const SizedBox(width: 8),
          Icon(
            isTiltDown
                ? Icons.arrow_downward_rounded
                : Icons.arrow_upward_rounded,
            color: color,
            size: 24,
          ),
          const SizedBox(width: 8),
          Text(
            isTiltDown ? "TILT DOWN" : "TILT UP",
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 14,
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCTASlide(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
    StorageService storage,
  ) {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Spacer(),
          // 3D stacked deck visual
          Container(
            height: 200,
            width: double.infinity,
            alignment: Alignment.center,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Left card (Pass / Red)
                Transform.translate(
                  offset: const Offset(-55, 15),
                  child: Transform.rotate(
                    angle: -0.15,
                    child: _buildCTAMiniCard("🎬", "Bollywood", const Color(0xFFFF5252)),
                  ),
                ),
                // Right card (Correct / Green)
                Transform.translate(
                  offset: const Offset(55, 15),
                  child: Transform.rotate(
                    angle: 0.15,
                    child: _buildCTAMiniCard("🏏", "Cricket", const Color(0xFF4CAF50)),
                  ),
                ),
                // Middle card (Primary / Gold)
                Transform.translate(
                  offset: const Offset(0, -10),
                  child: Container(
                    width: 110,
                    height: 155,
                    decoration: BoxDecoration(
                      color: primaryColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white, width: 3),
                      boxShadow: [
                        BoxShadow(
                          color: primaryColor.withAlpha(80),
                          blurRadius: 24,
                          spreadRadius: 3,
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("🔥", style: TextStyle(fontSize: 36)),
                        const SizedBox(height: 10),
                        Text(
                          "READY?",
                          style: theme.textTheme.labelLarge?.copyWith(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: theme.colorScheme.secondary,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 40),
          Text(
            "Ready to Guess Up?",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          Text(
            "Choose your favorite categories, place the phone on your forehead, and let the laughter begin with your friends!",
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.hintColor,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const Spacer(flex: 2),
        ],
      ),
    );
  }

  Widget _buildCTAMiniCard(String emoji, String title, Color color) {
    return Container(
      width: 100,
      height: 140,
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(50),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 32)),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w900,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
