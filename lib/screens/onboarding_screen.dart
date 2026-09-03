import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/arcade_page_route.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';
import 'package:sensors_plus/sensors_plus.dart';

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
  final GameStorageService _storageService = GameStorageService();
  final GameAudioEngine _audioEngine = GameAudioEngine();

  // Mode 1: Interactive Landscape Motion Practice State
  StreamSubscription<AccelerometerEvent>? _accelSubscription;
  int _practiceStage = 1; // 1: Forehead, 2: Tilt Down, 3: Tilt Up, 4: Complete
  Color _flashColor = Colors.transparent;
  bool _canDetectGesture = true;

  // Mode 2: Single-Page Rules List State
  bool _dontShowAgain = false;

  @override
  void initState() {
    super.initState();
    _dontShowAgain = _storageService.dontShowHowToPlay;

    if (widget.isRevisiting) {
      _setPortraitOnly();
    } else {
      _setLandscapeOnly();
      _startAccelerometerListener();
    }
  }

  void _setPortraitOnly() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
  }

  void _setLandscapeOnly() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  void _startAccelerometerListener() {
    _accelSubscription = accelerometerEventStream().listen((event) {
      if (!_canDetectGesture || widget.isRevisiting || _practiceStage > 3) {
        return;
      }

      final double z = event.z;

      // Stage 1: Hold Flat Vertical against Forehead (|z| < 3.5)
      if (_practiceStage == 1 && z.abs() < 3.5) {
        _advanceStage(2, Colors.blueAccent, () {
          _audioEngine.mediumImpact();
        });
      }
      // Stage 2: Tilt Down for Correct (z < -4.5 or screen down)
      else if (_practiceStage == 2 && z < -4.5) {
        _advanceStage(3, Colors.greenAccent, () {
          _audioEngine.playCorrectSfx();
        });
      }
      // Stage 3: Tilt Up to Pass (z > 4.5 or screen up)
      else if (_practiceStage == 3 && z > 4.5) {
        _advanceStage(4, Colors.redAccent, () {
          _audioEngine.playPassSfx();
        });
      }
    });
  }

  void _advanceStage(int nextStage, Color flash, VoidCallback onTrigger) async {
    setState(() {
      _canDetectGesture = false;
      _flashColor = flash;
    });
    _audioEngine.mediumImpact();
    onTrigger();

    await Future.delayed(const Duration(milliseconds: 600));

    if (mounted) {
      setState(() {
        _practiceStage = nextStage;
        _flashColor = Colors.transparent;
      });
      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted) {
        setState(() {
          _canDetectGesture = true;
        });
      }
    }
  }

  @override
  void dispose() {
    _accelSubscription?.cancel();
    super.dispose();
  }

  Future<void> _handleStartGame() async {
    await _storageService.setDontShowHowToPlay(_dontShowAgain);
    await _storageService.setOnboardingSeen(true);

    if (!mounted) return;

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
      _setPortraitOnly();
      Navigator.of(context).pop();
    }
  }

  void _handleExitRules() {
    _audioEngine.lightImpact();
    _storageService.setDontShowHowToPlay(_dontShowAgain);
    _setPortraitOnly();
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isRevisiting) {
      return _buildSinglePageRulesGuide(context);
    } else {
      return _buildInteractiveLandscapePractice(context);
    }
  }

  // =========================================================================
  // TYPE 1: INTERACTIVE LANDSCAPE MOTION PRACTICE (Shown Before Actual Game)
  // =========================================================================
  Widget _buildInteractiveLandscapePractice(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF0E0C1C) : const Color(0xFF130E26),
      body: Stack(
        children: [
          // Background Aura
          Positioned.fill(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              color: _flashColor.withAlpha(
                _flashColor == Colors.transparent ? 0 : 70,
              ),
            ),
          ),

          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Column(
                children: [
                  // Top Header Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.amberAccent,
                          borderRadius: BorderRadius.circular(14),
                        ),
                        child: const Text(
                          "PRACTICE MODE",
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                            color: Colors.black,
                            letterSpacing: 1,
                          ),
                        ),
                      ),
                      BouncyGameButton(
                        onTap: _handleStartGame,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withAlpha(25),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white38),
                          ),
                          child: const Text(
                            "SKIP TUTORIAL",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),

                  Expanded(child: Center(child: _buildStageContent(context))),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStageContent(BuildContext context) {
    switch (_practiceStage) {
      case 1:
        return _buildPracticeCard(
          stageText: "STEP 1 OF 3",
          title: "HOLD PHONE ON FOREHEAD",
          description:
              "Place your phone vertically against your forehead facing your friends!",
          icon: Icons.phone_android_rounded,
          accentColor: Colors.blueAccent,
          instructionPill: "HOLD FLAT VERTICAL",
        );
      case 2:
        return _buildPracticeCard(
          stageText: "STEP 2 OF 3",
          title: "TILT DOWN FOR CORRECT!",
          description:
              "Guess the word right? Tilt your phone DOWN towards the floor!",
          icon: Icons.arrow_downward_rounded,
          accentColor: Colors.greenAccent,
          instructionPill: "PHYSICALLY TILT PHONE DOWN NOW",
        );
      case 3:
        return _buildPracticeCard(
          stageText: "STEP 3 OF 3",
          title: "TILT UP TO PASS!",
          description:
              "Stuck on a word? Tilt your phone UP towards the ceiling to pass!",
          icon: Icons.arrow_upward_rounded,
          accentColor: Colors.redAccent,
          instructionPill: "PHYSICALLY TILT PHONE UP NOW",
        );
      case 4:
      default:
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.greenAccent,
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.greenAccent,
                    blurRadius: 20,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(
                Icons.check_rounded,
                size: 48,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              "TUTORIAL COMPLETE!",
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w900,
                color: Colors.white,
                letterSpacing: 1.5,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              "You have mastered the tilt gestures!",
              style: TextStyle(fontSize: 14, color: Colors.white70),
            ),
            const SizedBox(height: 24),
            BouncyGameButton(
              onTap: _handleStartGame,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 36,
                  vertical: 14,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white, width: 2.5),
                  boxShadow: const [
                    BoxShadow(color: Color(0xFF8E4800), offset: Offset(0, 4)),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "START GAME NOW",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        color: Colors.black,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(width: 8),
                    Icon(
                      Icons.play_arrow_rounded,
                      color: Colors.black,
                      size: 26,
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
    }
  }

  Widget _buildPracticeCard({
    required String stageText,
    required String title,
    required String description,
    required IconData icon,
    required Color accentColor,
    required String instructionPill,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1938),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: accentColor, width: 2.5),
        boxShadow: const [
          BoxShadow(
            color: Colors.black54,
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: accentColor.withAlpha(40),
              shape: BoxShape.circle,
              border: Border.all(color: accentColor, width: 2),
            ),
            child: Icon(icon, size: 40, color: accentColor),
          ),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  stageText,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: accentColor,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.white70,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(120),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: accentColor.withAlpha(120)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 12,
                        height: 12,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: accentColor,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        instructionPill,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: accentColor,
                          letterSpacing: 0.8,
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

  // =========================================================================
  // TYPE 2: SINGLE-PAGE RULES LIST OF CARDS (Shown outside game screen)
  // =========================================================================
  Widget _buildSinglePageRulesGuide(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final primaryColor =
        isDark ? AppTheme.darkPrimaryColor : AppTheme.lightPrimaryColor;
    final scaffoldBg =
        isDark ? const Color(0xFF0E0C1C) : const Color(0xFF2832FA);
    final cardBg = isDark ? const Color(0xFF1E1938) : Colors.white;
    final cardBorder =
        isDark ? Colors.white.withAlpha(25) : Colors.black.withAlpha(15);
    final textColor = isDark ? Colors.white : const Color(0xFF0F0C1C);
    final stepHeaderColor =
        isDark ? AppTheme.darkPrimaryColor : const Color(0xFF8C96C1);
    final backBtnColor =
        isDark ? const Color(0xFF261F47) : const Color(0xFF1E24AA);

    return Scaffold(
      backgroundColor: scaffoldBg,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: Padding(
          padding: const EdgeInsets.all(8.0),
          child: BouncyGameButton(
            onTap: _handleExitRules,
            child: Container(
              decoration: BoxDecoration(
                color: backBtnColor,
                shape: BoxShape.circle,
                border: Border.all(
                  color:
                      isDark
                          ? AppTheme.darkPrimaryColor.withAlpha(100)
                          : Colors.white24,
                ),
              ),
              child: Icon(
                Icons.arrow_back_rounded,
                color: isDark ? AppTheme.darkPrimaryColor : Colors.white,
                size: 22,
              ),
            ),
          ),
        ),
        title: const Text(
          "How to Play",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ),
      body: AmbientBackground(
        ambientColor: isDark ? primaryColor : const Color(0xFF2832FA),
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          physics: const BouncingScrollPhysics(),
          children: [
            // Step 1: Choose Deck
            _buildTutorialCard(
              stepText: "Step 1",
              child: _buildStep1Content(isDark: isDark, textColor: textColor),
              isDark: isDark,
              cardBg: cardBg,
              cardBorder: cardBorder,
              stepHeaderColor: stepHeaderColor,
            ),
            const SizedBox(height: 16),

            // Step 2: Forehead Placement
            _buildTutorialCard(
              stepText: "Step 2",
              child: _buildStep2Content(isDark: isDark, textColor: textColor),
              isDark: isDark,
              cardBg: cardBg,
              cardBorder: cardBorder,
              stepHeaderColor: stepHeaderColor,
            ),
            const SizedBox(height: 16),

            // Step 3: Friends Clues
            _buildTutorialCard(
              stepText: "Step 3",
              child: _buildStep3Content(isDark: isDark, textColor: textColor),
              isDark: isDark,
              cardBg: cardBg,
              cardBorder: cardBorder,
              stepHeaderColor: stepHeaderColor,
            ),
            const SizedBox(height: 16),

            // Step 4: Tilt Up Pass & Tilt Down Correct Gestures
            _buildTutorialCard(
              stepText: "Step 4",
              child: _buildStep4Content(isDark: isDark, textColor: textColor),
              isDark: isDark,
              cardBg: cardBg,
              cardBorder: cardBorder,
              stepHeaderColor: stepHeaderColor,
            ),
            const SizedBox(height: 16),

            // Step 5: Have Fun & Let's Play!
            _buildTutorialCard(
              stepText: "Step 5",
              child: _buildStep5Content(
                isDark: isDark,
                primaryColor: primaryColor,
              ),
              isDark: isDark,
              cardBg: cardBg,
              cardBorder: cardBorder,
              stepHeaderColor: stepHeaderColor,
            ),
            const SizedBox(height: 20),

            // Don't show again toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Checkbox(
                  value: _dontShowAgain,
                  activeColor:
                      isDark
                          ? AppTheme.darkPrimaryColor
                          : const Color(0xFFFF3567),
                  checkColor: isDark ? Colors.black : Colors.white,
                  side: BorderSide(
                    color: isDark ? Colors.white70 : Colors.white70,
                    width: 1.5,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(4),
                  ),
                  onChanged: (val) {
                    setState(() => _dontShowAgain = val ?? false);
                  },
                ),
                Flexible(
                  child: Text(
                    "Don't show tutorial automatically before game",
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.white70 : Colors.white,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Bottom Footer Message
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Text(
                "Thank you for being part of our family and supporting us ❤️",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.amber.shade200 : Colors.white,
                  height: 1.35,
                ),
              ),
            ),
            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildTutorialCard({
    required String stepText,
    required Widget child,
    required bool isDark,
    required Color cardBg,
    required Color cardBorder,
    required Color stepHeaderColor,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
      decoration: BoxDecoration(
        color: cardBg,
        borderRadius: BorderRadius.circular(26),
        border: Border.all(color: cardBorder, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(isDark ? 80 : 30),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            stepText,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w900,
              color: stepHeaderColor,
              letterSpacing: 0.5,
            ),
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _buildStep1Content({required bool isDark, required Color textColor}) {
    return Column(
      children: [
        Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFFF9100), Color(0xFFFF3D00)],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFFF3D00).withAlpha(80),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(Icons.style_rounded, color: Colors.white, size: 36),
        ),
        const SizedBox(height: 14),
        Text(
          "Select your favorite category deck to start playing",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: textColor,
            height: 1.35,
          ),
        ),
      ],
    );
  }

  Widget _buildStep2Content({required bool isDark, required Color textColor}) {
    return Column(
      children: [
        Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF29B6F6), Color(0xFF0288D1)],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0288D1).withAlpha(80),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.phone_android_rounded,
            color: Colors.white,
            size: 36,
          ),
        ),
        const SizedBox(height: 14),
        Text(
          "Place phone on your forehead and guess the words on the screen.",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: textColor,
            height: 1.35,
          ),
        ),
      ],
    );
  }

  Widget _buildStep3Content({required bool isDark, required Color textColor}) {
    return Column(
      children: [
        Container(
          width: 68,
          height: 68,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFFAB47BC), Color(0xFF7B1FA2)],
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF7B1FA2).withAlpha(80),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Icon(
            Icons.record_voice_over_rounded,
            color: Colors.white,
            size: 34,
          ),
        ),
        const SizedBox(height: 14),
        Text(
          "Your friends shout clues while you guess before the timer runs out!",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: textColor,
            height: 1.35,
          ),
        ),
      ],
    );
  }

  Widget _buildStep4Content({required bool isDark, required Color textColor}) {
    return Column(
      children: [
        // Pass Section
        _build3DPhoneGraphic(
          label: "Pass",
          screenColor: const Color(0xFFFF3567),
          arrowColor: const Color(0xFFFF3567),
          isUp: true,
          isDark: isDark,
        ),
        const SizedBox(height: 14),
        Text(
          "Tilt the phone up to pass the word",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
        const SizedBox(height: 20),
        Divider(
          color: isDark ? Colors.white24 : Colors.grey.shade200,
          height: 1,
          thickness: 1,
        ),
        const SizedBox(height: 20),

        // Correct Section
        _build3DPhoneGraphic(
          label: "Correct",
          screenColor: const Color(0xFF00D064),
          arrowColor: const Color(0xFF00D064),
          isUp: false,
          isDark: isDark,
        ),
        const SizedBox(height: 14),
        Text(
          "Tilt the phone down if you guess correctly",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ],
    );
  }

  Widget _buildStep5Content({
    required bool isDark,
    required Color primaryColor,
  }) {
    return Column(
      children: [
        Text(
          "Have fun 🥳",
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w900,
            color: isDark ? AppTheme.darkPrimaryColor : const Color(0xFFFFC107),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 18),
        BouncyGameButton(
          onTap: () {
            if (widget.selectedCategories != null &&
                widget.selectedCategories!.isNotEmpty) {
              _handleStartGame();
            } else {
              _handleExitRules();
            }
          },
          child: Container(
            width: double.infinity,
            height: 52,
            decoration: BoxDecoration(
              gradient:
                  isDark
                      ? const LinearGradient(
                        colors: [Color(0xFFFFEA00), Color(0xFFFF9100)],
                      )
                      : null,
              color: isDark ? null : const Color(0xFFFF3567),
              borderRadius: BorderRadius.circular(20),
              border: isDark ? Border.all(color: Colors.white, width: 2) : null,
              boxShadow: [
                BoxShadow(
                  color:
                      isDark
                          ? const Color(0xFF8E4800)
                          : const Color(0x40FF3567),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Center(
              child: Text(
                "Let's play!",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.black : Colors.white,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _build3DPhoneGraphic({
    required String label,
    required Color screenColor,
    required Color arrowColor,
    required bool isUp,
    required bool isDark,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        SizedBox(
          width: 36,
          height: 48,
          child: CustomPaint(
            painter: _CurvedArrowPainter(
              color: arrowColor,
              isUp: isUp,
              isRight: false,
            ),
          ),
        ),
        const SizedBox(width: 12),

        Container(
          width: 165,
          height: 52,
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF141026) : const Color(0xFF28216A),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color:
                  isDark
                      ? AppTheme.darkPrimaryColor.withAlpha(80)
                      : const Color(0xFF1E1854),
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: isDark ? Colors.black54 : const Color(0xFF151040),
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Center(
            child: Container(
              width: 145,
              height: 38,
              decoration: BoxDecoration(
                color: screenColor,
                borderRadius: BorderRadius.circular(10),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(40),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Center(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),

        SizedBox(
          width: 36,
          height: 48,
          child: CustomPaint(
            painter: _CurvedArrowPainter(
              color: arrowColor,
              isUp: isUp,
              isRight: true,
            ),
          ),
        ),
      ],
    );
  }
}

class _CurvedArrowPainter extends CustomPainter {
  final Color color;
  final bool isUp;
  final bool isRight;

  _CurvedArrowPainter({
    required this.color,
    required this.isUp,
    required this.isRight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint =
        Paint()
          ..color = color
          ..style = PaintingStyle.fill;

    final path = Path();
    final w = size.width;
    final h = size.height;

    if (isUp) {
      if (!isRight) {
        // Left side curving UP
        path.moveTo(w * 0.85, h * 0.95);
        path.quadraticBezierTo(w * 0.05, h * 0.7, w * 0.35, h * 0.25);
        path.lineTo(w * 0.1, h * 0.4);
        path.lineTo(w * 0.35, h * 0.05);
        path.lineTo(w * 0.65, h * 0.3);
        path.lineTo(w * 0.45, h * 0.25);
        path.quadraticBezierTo(w * 0.25, h * 0.6, w * 0.85, h * 0.95);
      } else {
        // Right side curving UP
        path.moveTo(w * 0.15, h * 0.95);
        path.quadraticBezierTo(w * 0.95, h * 0.7, w * 0.65, h * 0.25);
        path.lineTo(w * 0.35, h * 0.3);
        path.lineTo(w * 0.65, h * 0.05);
        path.lineTo(w * 0.9, h * 0.4);
        path.lineTo(w * 0.55, h * 0.25);
        path.quadraticBezierTo(w * 0.75, h * 0.6, w * 0.15, h * 0.95);
      }
    } else {
      if (!isRight) {
        // Left side curving DOWN
        path.moveTo(w * 0.85, h * 0.05);
        path.quadraticBezierTo(w * 0.05, h * 0.3, w * 0.35, h * 0.75);
        path.lineTo(w * 0.1, h * 0.6);
        path.lineTo(w * 0.35, h * 0.95);
        path.lineTo(w * 0.65, h * 0.7);
        path.lineTo(w * 0.45, h * 0.75);
        path.quadraticBezierTo(w * 0.25, h * 0.4, w * 0.85, h * 0.05);
      } else {
        // Right side curving DOWN
        path.moveTo(w * 0.15, h * 0.05);
        path.quadraticBezierTo(w * 0.95, h * 0.3, w * 0.65, h * 0.75);
        path.lineTo(w * 0.35, h * 0.7);
        path.lineTo(w * 0.65, h * 0.95);
        path.lineTo(w * 0.9, h * 0.6);
        path.lineTo(w * 0.55, h * 0.75);
        path.quadraticBezierTo(w * 0.75, h * 0.4, w * 0.15, h * 0.05);
      }
    }

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _CurvedArrowPainter oldDelegate) => false;
}
