import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';

class OnboardingScreen extends StatefulWidget {
  final bool isRevisiting;
  final List<Category>? selectedCategories;
  final int? gameTime;
  final TeamMatchState? teamMatchState;

  const OnboardingScreen({
    super.key,
    this.isRevisiting = false,
    this.selectedCategories,
    this.gameTime,
    this.teamMatchState,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final StorageService _storageService = StorageService();
  final PageController _pageController = PageController();
  int _currentPage = 0;
  static const int _totalPages = 4;
  bool _dontShowAgain = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    _dontShowAgain = _storageService.dontShowHowToPlay;
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _handleStartPlay() async {
    await _storageService.setDontShowHowToPlay(_dontShowAgain);
    await _storageService.setOnboardingSeen(true);

    if (!mounted) return;

    if (widget.selectedCategories != null) {
      final time = widget.gameTime ?? _storageService.gameDuration;
      Navigator.of(context).pushReplacement(
        CupertinoPageRoute(
          builder:
              (_) => GameScreen(
                time: time,
                selectedCategories: widget.selectedCategories!,
                teamMatchState: widget.teamMatchState,
              ),
        ),
      );
    } else if (widget.isRevisiting && Navigator.canPop(context)) {
      Navigator.of(context).pop();
    } else {
      Navigator.of(
        context,
      ).pushReplacement(CupertinoPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOutCubic,
      );
    } else {
      _handleStartPlay();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final textColor =
        isDark ? AppTheme.darkTextColor : AppTheme.lightAccentColor;
    final cardBgColor =
        isDark ? AppTheme.darkSurfaceColor : AppTheme.lightSurfaceColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: AmbientBackground(
        ambientColor: primaryColor,
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar Header
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16.0,
                  vertical: 8.0,
                ),
                child: Row(
                  children: [
                    if (widget.isRevisiting || Navigator.canPop(context))
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded),
                        onPressed: () {
                          if (Navigator.canPop(context)) {
                            Navigator.of(context).pop();
                          } else {
                            Navigator.of(context).pushReplacement(
                              CupertinoPageRoute(
                                builder: (_) => const HomeScreen(),
                              ),
                            );
                          }
                        },
                      )
                    else
                      const SizedBox(width: 48),

                    Expanded(
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: primaryColor.withAlpha(30),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: primaryColor.withAlpha(80),
                            ),
                          ),
                          child: Text(
                            "STEP ${_currentPage + 1} OF $_totalPages",
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: primaryColor,
                              letterSpacing: 1.5,
                            ),
                          ),
                        ),
                      ),
                    ),

                    if (_currentPage < _totalPages - 1)
                      TextButton(
                        onPressed: _handleStartPlay,
                        child: Text(
                          "SKIP",
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            color: textColor.withAlpha(180),
                            letterSpacing: 1,
                          ),
                        ),
                      )
                    else
                      const SizedBox(width: 48),
                  ],
                ),
              ),

              // Multi-Slide PageView Carousel
              Expanded(
                child: PageView(
                  controller: _pageController,
                  onPageChanged: (index) {
                    setState(() => _currentPage = index);
                  },
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // Slide 1: Forehead Placement
                    _buildSlide1(
                      theme,
                      isDark,
                      primaryColor,
                      textColor,
                      cardBgColor,
                    ),

                    // Slide 2: Tilt Controls
                    _buildSlide2(
                      theme,
                      isDark,
                      primaryColor,
                      textColor,
                      cardBgColor,
                    ),

                    // Slide 3: Game Modes
                    _buildSlide3(
                      theme,
                      isDark,
                      primaryColor,
                      textColor,
                      cardBgColor,
                    ),

                    // Slide 4: Pro Tips & Ready
                    _buildSlide4(
                      theme,
                      isDark,
                      primaryColor,
                      textColor,
                      cardBgColor,
                    ),
                  ],
                ),
              ),

              // Bottom Control Section
              Padding(
                padding: const EdgeInsets.fromLTRB(20.0, 8.0, 20.0, 16.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Page Indicator Dots
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_totalPages, (index) {
                        final isActive = index == _currentPage;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          width: isActive ? 28 : 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color:
                                isActive
                                    ? primaryColor
                                    : textColor.withAlpha(40),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 12),

                    // Don't show again toggle
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SizedBox(
                          height: 24,
                          width: 24,
                          child: Checkbox(
                            value: _dontShowAgain,
                            onChanged: (val) {
                              if (val != null) {
                                setState(() => _dontShowAgain = val);
                              }
                            },
                            activeColor: primaryColor,
                            checkColor: AppTheme.darkAccentColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            setState(() => _dontShowAgain = !_dontShowAgain);
                          },
                          child: Text(
                            "Don't show this again",
                            style: theme.textTheme.bodySmall?.copyWith(
                              fontWeight: FontWeight.w600,
                              color: textColor.withAlpha(200),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 12),

                    // Primary CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        onPressed: _nextPage,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: primaryColor,
                          foregroundColor: AppTheme.darkAccentColor,
                          elevation: 6,
                          shadowColor: primaryColor.withAlpha(100),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              _currentPage == _totalPages - 1
                                  ? (widget.isRevisiting
                                      ? "GOT IT!"
                                      : "LET'S PLAY! 🎉")
                                  : "NEXT",
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.5,
                              ),
                            ),
                            if (_currentPage < _totalPages - 1) ...[
                              const SizedBox(width: 8),
                              const Icon(Icons.arrow_forward_rounded, size: 20),
                            ],
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // --- SLIDE 1: PLACE ON FOREHEAD ---
  Widget _buildSlide1(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
    Color cardBgColor,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: (constraints.maxHeight - 24).clamp(0, double.infinity),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Graphic Container
                Container(
                  height: 180,
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardBgColor,
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                      color: primaryColor.withAlpha(90),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: primaryColor.withAlpha(isDark ? 40 : 20),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Image.asset(
                      'assets/images/onboarding/1.webp',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                Text(
                  "PLACE ON FOREHEAD",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: primaryColor,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  "Hold your phone against your forehead with the screen facing your friends. You can't see the word!",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor.withAlpha(220),
                    height: 1.4,
                  ),
                ),

                const SizedBox(height: 20),

                // Feature Grid
                Row(
                  children: [
                    Expanded(
                      child: _buildMiniFeatureCard(
                        icon: Icons.record_voice_over_rounded,
                        title: "Friends Give Clues",
                        description: "They act, dance, or shout out clues!",
                        primaryColor: primaryColor,
                        cardBgColor: cardBgColor,
                        textColor: textColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildMiniFeatureCard(
                        icon: Icons.visibility_off_rounded,
                        title: "No Peeking!",
                        description: "Keep the screen facing away from you.",
                        primaryColor: primaryColor,
                        cardBgColor: cardBgColor,
                        textColor: textColor,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- SLIDE 2: TILT CONTROLS ---
  Widget _buildSlide2(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
    Color cardBgColor,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: (constraints.maxHeight - 24).clamp(0, double.infinity),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "TILT TO SCORE",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: primaryColor,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  "No need to touch the screen! Use motion gestures to mark answers.",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor.withAlpha(220),
                    height: 1.3,
                  ),
                ),

                const SizedBox(height: 20),

                // Tilt Down Card (Green)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color:
                        isDark ? const Color(0xFF0F2B1D) : Colors.green.shade50,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.greenAccent, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.greenAccent.withAlpha(isDark ? 50 : 30),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.greenAccent.withAlpha(40),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.south_rounded,
                          color: Colors.greenAccent,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  "TILT DOWN",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.greenAccent,
                                    letterSpacing: 1,
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.greenAccent,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    "CORRECT +1",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.black,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "Tilt your phone face-down towards the floor when you guess correctly!",
                              style: TextStyle(
                                fontSize: 12,
                                color:
                                    isDark
                                        ? Colors.green.shade200
                                        : Colors.green.shade900,
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Tilt Up Card (Red)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color:
                        isDark ? const Color(0xFF331518) : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.redAccent, width: 2.5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.redAccent.withAlpha(isDark ? 50 : 30),
                        blurRadius: 14,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: Colors.redAccent.withAlpha(40),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.north_rounded,
                          color: Colors.redAccent,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  "TILT UP",
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.redAccent,
                                    letterSpacing: 1,
                                  ),
                                ),
                                const Spacer(),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.redAccent,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text(
                                    "PASS (0)",
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              "Tilt your phone face-up towards the ceiling to pass if you get stuck!",
                              style: TextStyle(
                                fontSize: 12,
                                color:
                                    isDark
                                        ? Colors.red.shade200
                                        : Colors.red.shade900,
                                height: 1.3,
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
          ),
        );
      },
    );
  }

  // --- SLIDE 3: GAME MODES ---
  Widget _buildSlide3(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
    Color cardBgColor,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: (constraints.maxHeight - 24).clamp(0, double.infinity),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "GAME MODES",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: primaryColor,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  "Flexible modes for casual quick games or intense team showdowns!",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor.withAlpha(220),
                    height: 1.3,
                  ),
                ),

                const SizedBox(height: 20),

                // Solo Mode Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cardBgColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: primaryColor.withAlpha(90), width: 2),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: primaryColor.withAlpha(40),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.bolt_rounded,
                              color: primaryColor,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            "⚡ Solo Mode",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        "Mix & Match ANY number of decks together to build your custom mixed party word pool!",
                        style: TextStyle(
                          fontSize: 12,
                          color: textColor.withAlpha(200),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // Team Battle Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: cardBgColor,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: AppTheme.teamAColor.withAlpha(90),
                      width: 2,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.teamAColor.withAlpha(40),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.groups_rounded,
                              color: AppTheme.teamAColor,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            "⚔️ Team Battle Mode",
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        "Split into Team A vs Team B. Exactly 1 deck is locked for both teams to ensure 100% fair head-to-head competition!",
                        style: TextStyle(
                          fontSize: 12,
                          color: textColor.withAlpha(200),
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // --- SLIDE 4: PRO TIPS ---
  Widget _buildSlide4(
    ThemeData theme,
    bool isDark,
    Color primaryColor,
    Color textColor,
    Color cardBgColor,
  ) {
    return LayoutBuilder(
      builder: (context, constraints) {
        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: (constraints.maxHeight - 24).clamp(0, double.infinity),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  "PRO PARTY TIPS",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    color: primaryColor,
                    letterSpacing: 1.5,
                  ),
                ),

                const SizedBox(height: 8),

                Text(
                  "Keep the game fun, energetic, and fair for everyone!",
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: textColor.withAlpha(220),
                    height: 1.3,
                  ),
                ),

                const SizedBox(height: 20),

                _buildTipTile(
                  number: "1",
                  title: "Act & Clue, No Spelling!",
                  subtitle:
                      "No rhyming, no spelling letters, and no pointing at objects in the room!",
                  primaryColor: primaryColor,
                  cardBgColor: cardBgColor,
                  textColor: textColor,
                ),

                const SizedBox(height: 12),

                _buildTipTile(
                  number: "2",
                  title: "Shout Out Loud!",
                  subtitle:
                      "Team members can all give clues at the same time for max chaos!",
                  primaryColor: primaryColor,
                  cardBgColor: cardBgColor,
                  textColor: textColor,
                ),

                const SizedBox(height: 12),

                _buildTipTile(
                  number: "3",
                  title: "Beat the Clock!",
                  subtitle:
                      "Score as many correct guesses as you can before time expires!",
                  primaryColor: primaryColor,
                  cardBgColor: cardBgColor,
                  textColor: textColor,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildMiniFeatureCard({
    required IconData icon,
    required String title,
    required String description,
    required Color primaryColor,
    required Color cardBgColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primaryColor.withAlpha(60)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: primaryColor, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w900,
              color: textColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: TextStyle(
              fontSize: 11,
              color: textColor.withAlpha(180),
              height: 1.3,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTipTile({
    required String number,
    required String title,
    required String subtitle,
    required Color primaryColor,
    required Color cardBgColor,
    required Color textColor,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: cardBgColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: primaryColor.withAlpha(60)),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: primaryColor,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                number,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: AppTheme.darkAccentColor,
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: textColor.withAlpha(180),
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
