import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/arcade_page_route.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

/// 5-Page Arcade Onboarding & Game Tutorial Slider
class OnboardingScreen extends StatefulWidget {
  final bool isRevisiting;
  final bool isFirstAppLaunch;
  final List<Category>? selectedCategories;
  final int? gameTime;
  final TeamMatchState? teamMatchState;

  const OnboardingScreen({
    super.key,
    this.isRevisiting = false,
    this.isFirstAppLaunch = false,
    this.selectedCategories,
    this.gameTime,
    this.teamMatchState,
  });

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final GameStorageService _storageService = GameStorageService();
  final GameAudioEngine _audioEngine = GameAudioEngine();

  late PageController _pageController;
  int _currentPage = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _setPortraitOnly();
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _handleStartGame() async {
    _audioEngine.mediumImpact();
    await _storageService.setDontShowHowToPlay(true);
    await _storageService.setOnboardingSeen(true);

    if (!mounted) return;

    if (widget.isFirstAppLaunch) {
      Navigator.of(context).pushReplacement(
        ArcadePageRoute(page: const HomeScreen()),
      );
      return;
    }

    if (widget.selectedCategories != null &&
        widget.selectedCategories!.isNotEmpty) {
      final time = widget.gameTime ?? _storageService.gameDuration;
      Navigator.of(context).pushReplacement(
        ArcadePageRoute(
          page: GameScreen(
            time: time,
            selectedCategories: widget.selectedCategories!,
            teamMatchState: widget.teamMatchState,
          ),
        ),
      );
    } else {
      Navigator.of(context).pop();
    }
  }

  void _handleExitRules() {
    _audioEngine.lightImpact();
    _storageService.setDontShowHowToPlay(true);
    Navigator.of(context).pop();
  }

  List<_OnboardingPageData> _getPages(bool isDark) {
    return [
      _OnboardingPageData(
        badgeText: "DECK & GAME MODES",
        title: "CHOOSE YOUR FAVORITE DECK",
        description:
            "Select from dozens of hilarious party decks or build your own custom category! Play Solo or launch intense Team Battles.",
        iconEmoji: "🎴",
        themeColor: const Color(0xFFFF9100),
      ),
      _OnboardingPageData(
        badgeText: "GAME MECHANICS",
        title: "PLACE PHONE ON FOREHEAD",
        description:
            "Hold your phone vertically against your forehead with the screen facing your friends so they can see the word!",
        iconEmoji: "📱",
        themeColor: const Color(0xFF29B6F6),
      ),
      _OnboardingPageData(
        badgeText: "FRIENDS CLUES",
        title: "FRIENDS SHOUT & ACT CLUES",
        description:
            "Your friends act out, mime, dance, or shout clues without saying the hidden word before the timer runs out!",
        iconEmoji: "🗣️",
        themeColor: const Color(0xFFAB47BC),
      ),
      _OnboardingPageData(
        badgeText: "TILT GESTURES",
        title: "TILT DOWN TO SCORE, UP TO PASS",
        description:
            "Tilt your phone DOWN towards the floor for Correct (+1 pt)! Tilt UP towards the ceiling to Pass on a word.",
        themeColor: const Color(0xFF00E676),
        customGraphic: _build3DTiltGestureDemo(isDark),
      ),
      _OnboardingPageData(
        badgeText: "HOT STREAKS & SCORECARDS",
        title: "HOT STREAKS & SOCIAL CARDS",
        description:
            "Rack up 3+ correct answers in a row for STREAK MULTIPLIERS (+2, +3 pts)! Share stylized scorecard graphics directly to Instagram & WhatsApp.",
        iconEmoji: "🔥",
        themeColor: const Color(0xFFFFEA00),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final pages = _getPages(isDark);
    final activeColor = pages[_currentPage].themeColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: AmbientBackground(
        ambientColor: activeColor,
        child: SafeArea(
          child: Column(
            children: [
              // 1. TOP BAR CONTROL HEADER
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (widget.isRevisiting)
                      BouncyGameButton(
                        onTap: _handleExitRules,
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color:
                                isDark
                                    ? const Color(0xFF261F47)
                                    : Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color:
                                  isDark
                                      ? Colors.white.withAlpha(40)
                                      : Colors.black12,
                            ),
                          ),
                          child: Icon(
                            Icons.arrow_back_rounded,
                            size: 20,
                            color: isDark ? Colors.white : Colors.black,
                          ),
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: activeColor.withAlpha(isDark ? 50 : 35),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: activeColor.withAlpha(180),
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          "STEP ${_currentPage + 1} OF ${pages.length}",
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 11,
                            color: isDark ? Colors.white : Colors.black,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),

                    // SKIP BUTTON
                    if (!widget.isRevisiting)
                      BouncyGameButton(
                        onTap: _handleStartGame,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color:
                                isDark
                                    ? Colors.white.withAlpha(20)
                                    : Colors.black.withAlpha(15),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color:
                                  isDark
                                      ? Colors.white.withAlpha(40)
                                      : Colors.black26,
                            ),
                          ),
                          child: Text(
                            "SKIP",
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                              color: isDark ? Colors.white70 : Colors.black87,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // 2. PAGEVIEW SLIDER CONTENT
              Expanded(
                child: PageView.builder(
                  controller: _pageController,
                  onPageChanged: (index) {
                    _audioEngine.extraLightImpact();
                    setState(() {
                      _currentPage = index;
                    });
                  },
                  itemCount: pages.length,
                  itemBuilder: (context, index) {
                    return _buildOnboardingPageCard(
                      context,
                      pages[index],
                      isDark,
                    );
                  },
                ),
              ),

              // 3. BOTTOM NAVIGATION BAR (DOTS & BUTTONS)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // PREV BUTTON
                    SizedBox(
                      width: 80,
                      child:
                          _currentPage > 0
                              ? BouncyGameButton(
                                onTap: () {
                                  _pageController.previousPage(
                                    duration: const Duration(
                                      milliseconds: 300,
                                    ),
                                    curve: Curves.easeOutCubic,
                                  );
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        isDark
                                            ? const Color(0xFF1E1938)
                                            : Colors.white,
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color:
                                          isDark
                                              ? Colors.white24
                                              : Colors.black12,
                                    ),
                                  ),
                                  child: Center(
                                    child: Text(
                                      "PREV",
                                      style: TextStyle(
                                        fontWeight: FontWeight.w900,
                                        fontSize: 11,
                                        color:
                                            isDark
                                                ? Colors.white
                                                : Colors.black,
                                      ),
                                    ),
                                  ),
                                ),
                              )
                              : const SizedBox.shrink(),
                    ),

                    // PAGE INDICATOR DOTS
                    Row(
                      children: List.generate(pages.length, (dotIndex) {
                        final isSelected = dotIndex == _currentPage;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: const EdgeInsets.symmetric(horizontal: 4),
                          height: 9,
                          width: isSelected ? 24 : 9,
                          decoration: BoxDecoration(
                            color:
                                isSelected
                                    ? activeColor
                                    : (isDark
                                        ? Colors.white.withAlpha(50)
                                        : Colors.black.withAlpha(40)),
                            borderRadius: BorderRadius.circular(5),
                            boxShadow:
                                isSelected
                                    ? [
                                      BoxShadow(
                                        color: activeColor.withAlpha(160),
                                        blurRadius: 8,
                                      ),
                                    ]
                                    : null,
                          ),
                        );
                      }),
                    ),

                    // NEXT / START GAME BUTTON
                    SizedBox(
                      width: 110,
                      child: BouncyGameButton(
                        onTap: () {
                          if (_currentPage < pages.length - 1) {
                            _pageController.nextPage(
                              duration: const Duration(milliseconds: 300),
                              curve: Curves.easeOutCubic,
                            );
                          } else {
                            _handleStartGame();
                          }
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors:
                                  _currentPage == pages.length - 1
                                      ? [
                                        const Color(0xFFFFEA00),
                                        const Color(0xFFFF9100),
                                      ]
                                      : [
                                        activeColor,
                                        activeColor.withAlpha(200),
                                      ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white, width: 2),
                            boxShadow: [
                              BoxShadow(
                                color: activeColor.withAlpha(120),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Center(
                            child: FittedBox(
                              fit: BoxFit.scaleDown,
                              child: Text(
                                _currentPage == pages.length - 1
                                    ? (widget.isFirstAppLaunch
                                        ? "GET STARTED"
                                        : (widget.isRevisiting
                                            ? "GOT IT!"
                                            : "LET'S PLAY!"))
                                    : "NEXT",
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  fontSize: 12,
                                  color: Colors.black,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
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
      ),
    );
  }

  Widget _buildOnboardingPageCard(
    BuildContext context,
    _OnboardingPageData data,
    bool isDark,
  ) {
    return Center(
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 28.0, vertical: 16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Badge Pill
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 7,
                ),
                decoration: BoxDecoration(
                  color: data.themeColor.withAlpha(isDark ? 55 : 35),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: data.themeColor.withAlpha(200),
                    width: 1.5,
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: data.themeColor.withAlpha(90),
                      blurRadius: 14,
                    ),
                  ],
                ),
                child: Text(
                  data.badgeText,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: isDark ? Colors.white : const Color(0xFF1E1938),
                    letterSpacing: 1.6,
                  ),
                ),
              ),
              const SizedBox(height: 32),

              // Hero Graphic / Icon
              if (data.customGraphic != null)
                data.customGraphic!
              else
                Container(
                  width: 116,
                  height: 116,
                  decoration: BoxDecoration(
                    color: data.themeColor.withAlpha(isDark ? 45 : 35),
                    shape: BoxShape.circle,
                    border: Border.all(color: data.themeColor, width: 3.0),
                    boxShadow: [
                      BoxShadow(
                        color: data.themeColor.withAlpha(120),
                        blurRadius: 32,
                        spreadRadius: 3,
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      data.iconEmoji,
                      style: const TextStyle(fontSize: 60),
                    ),
                  ),
                ),

              const SizedBox(height: 32),

              // Headline Title
              Text(
                data.title,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 25,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : const Color(0xFF0F0C1C),
                  letterSpacing: 1.0,
                  height: 1.25,
                  shadows: [
                    Shadow(
                      color: isDark ? Colors.black54 : Colors.black12,
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Description
              Text(
                data.description,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isDark ? Colors.white70 : const Color(0xFF332F4C),
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _build3DTiltGestureDemo(bool isDark) {
    return Column(
      children: [
        // Tilt Pass Section
        _buildTiltBar(
          label: "PASS",
          subtitle: "Tilt Phone UP",
          screenColor: const Color(0xFFFF3567),
          isUp: true,
          isDark: isDark,
        ),
        const SizedBox(height: 14),

        // Tilt Correct Section
        _buildTiltBar(
          label: "CORRECT!",
          subtitle: "Tilt Phone DOWN",
          screenColor: const Color(0xFF00E676),
          isUp: false,
          isDark: isDark,
        ),
      ],
    );
  }

  Widget _buildTiltBar({
    required String label,
    required String subtitle,
    required Color screenColor,
    required bool isUp,
    required bool isDark,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: screenColor.withAlpha(isDark ? 40 : 25),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: screenColor, width: 2),
      ),
      child: Row(
        children: [
          Icon(
            isUp ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded,
            color: screenColor,
            size: 28,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: screenColor,
                    letterSpacing: 1,
                  ),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white70 : Colors.black87,
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

class _OnboardingPageData {
  final String badgeText;
  final String title;
  final String description;
  final String iconEmoji;
  final Color themeColor;
  final Widget? customGraphic;

  const _OnboardingPageData({
    required this.badgeText,
    required this.title,
    required this.description,
    this.iconEmoji = "",
    required this.themeColor,
    this.customGraphic,
  });
}
