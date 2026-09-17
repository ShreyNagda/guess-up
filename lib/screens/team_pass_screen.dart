import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/bouncy_game_button.dart';

class TeamPassScreen extends StatefulWidget {
  final TeamMatchState teamState;
  final int lastRoundScore;
  final int time;
  final List<Category> selectedCategories;

  const TeamPassScreen({
    super.key,
    required this.teamState,
    required this.lastRoundScore,
    required this.time,
    required this.selectedCategories,
  });

  @override
  State<TeamPassScreen> createState() => _TeamPassScreenState();
}

class _TeamPassScreenState extends State<TeamPassScreen>
    with SingleTickerProviderStateMixin {
  int _countdown = 0; // 0 = inactive, 3, 2, 1, -1 for GO!
  Timer? _timer;
  late AnimationController _animController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    GameAudioEngine().extraLightImpact();

    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    _scaleAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.elasticOut,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeIn,
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    _animController.dispose();
    super.dispose();
  }

  void _triggerCountdownTick(int count) {
    _animController.reset();
    _animController.forward();

    final audio = GameAudioEngine();
    audio.playStartBeep();

    if (count == 3) {
      audio.lightImpact();
      HapticFeedback.lightImpact();
    } else if (count == 2) {
      audio.mediumImpact();
      HapticFeedback.mediumImpact();
    } else if (count == 1) {
      audio.heavyImpact();
      HapticFeedback.heavyImpact();
    } else if (count == -1) {
      audio.heavyImpact();
      audio.vibrate(400);
      HapticFeedback.vibrate();
    }
  }

  void _onStartTurnPressed() {
    if (_countdown != 0) return;

    setState(() {
      _countdown = 3;
    });

    _triggerCountdownTick(3);

    _timer = Timer.periodic(const Duration(milliseconds: 850), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }

      if (_countdown == 3) {
        setState(() => _countdown = 2);
        _triggerCountdownTick(2);
      } else if (_countdown == 2) {
        setState(() => _countdown = 1);
        _triggerCountdownTick(1);
      } else if (_countdown == 1) {
        setState(() => _countdown = -1); // GO!
        _triggerCountdownTick(-1);
      } else if (_countdown == -1) {
        timer.cancel();
        _navigateToGameScreen();
      }
    });
  }

  void _navigateToGameScreen() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(
        builder:
            (_) => GameScreen(
              time: widget.time,
              selectedCategories: widget.selectedCategories,
              teamMatchState: widget.teamState,
            ),
      ),
    );
  }

  String get _countdownText {
    if (_countdown == 3) return '3';
    if (_countdown == 2) return '2';
    if (_countdown == 1) return '1';
    if (_countdown == -1) return 'GO!';
    return '';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = widget.teamState;
    final nextTeamColor = state.currentTeamColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: Stack(
        children: [
          AmbientBackground(
            ambientColor: nextTeamColor,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24.0,
                  vertical: 20.0,
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),

                    // Round End Header
                    Text(
                      state.isTiebreaker
                          ? "SUDDEN DEATH TIEBREAKER!"
                          : "ROUND ${state.currentRound} COMPLETE!",
                      style: theme.textTheme.labelMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                        color:
                            state.isTiebreaker
                                ? Colors.deepOrangeAccent
                                : theme.hintColor,
                      ),
                    ),
                    const SizedBox(height: 10),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        "+${widget.lastRoundScore} POINTS!",
                        style: theme.textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.w900,
                          fontSize: 36,
                          color: Colors.amber,
                        ),
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Match Scoreboard Card
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: theme.dividerColor.withAlpha(50),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(isDark ? 50 : 20),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            state.isTiebreaker
                                ? "MATCH STANDINGS (TIEBREAKER OVERTIME)"
                                : "MATCH STANDINGS (ROUND ${state.currentRound}/${state.maxRounds})",
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.5,
                              color: theme.hintColor,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              // Team A Card (Cyan)
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: AppTheme.teamAColor.withAlpha(30),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(
                                      color:
                                          state.currentTeam == TeamColor.cyan
                                              ? AppTheme.teamAColor
                                              : Colors.transparent,
                                      width: 2,
                                    ),
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        state.teamCyanDisplayName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        "${state.teamCyanScore}",
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 32,
                                          color: AppTheme.teamAColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Team B Card (Magenta)
                              Expanded(
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color: AppTheme.teamBColor.withAlpha(30),
                                    borderRadius: BorderRadius.circular(18),
                                    border: Border.all(
                                      color:
                                          state.currentTeam == TeamColor.magenta
                                              ? AppTheme.teamBColor
                                              : Colors.transparent,
                                      width: 2,
                                    ),
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        state.teamMagentaDisplayName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        "${state.teamMagentaScore}",
                                        style: TextStyle(
                                          fontWeight: FontWeight.w900,
                                          fontSize: 32,
                                          color: AppTheme.teamBColor,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),

                    const Spacer(),

                    // Interactive Phone Pass Banner
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 20,
                        vertical: 16,
                      ),
                      decoration: BoxDecoration(
                        color: nextTeamColor.withAlpha(35),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: nextTeamColor.withAlpha(120),
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: nextTeamColor.withAlpha(40),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                state.currentTeamOnlyEmoji,
                                style: const TextStyle(fontSize: 28),
                              ),
                              const SizedBox(width: 10),
                              const Icon(
                                CupertinoIcons.device_phone_portrait,
                                size: 26,
                              ),
                              const SizedBox(width: 10),
                              Flexible(
                                child: Text(
                                  "PASS PHONE TO ${state.currentTeamOnlyName.toUpperCase()}",
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 16,
                                    color: nextTeamColor,
                                    letterSpacing: 0.5,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            "Get ready to hold device against forehead!",
                            style: TextStyle(
                              fontSize: 12,
                              color: theme.hintColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Action CTA Button
                    SizedBox(
                      width: double.infinity,
                      height: 64,
                      child: BouncyGameButton(
                        onTap: _onStartTurnPressed,
                        child: Container(
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: nextTeamColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: nextTeamColor.withAlpha(120),
                                blurRadius: 12,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Text(
                            state.isTiebreaker
                                ? "I HAVE THE PHONE! (START TIEBREAKER) ⚡"
                                : "I HAVE THE PHONE! (START TURN) ⚡",
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              color: Colors.white,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // --- Interactive Full-Screen Countdown Overlay ---
          if (_countdown != 0)
            AnimatedBuilder(
              animation: _animController,
              builder: (context, child) {
                return Container(
                  color: Colors.black.withAlpha(220),
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          state.currentTeamName,
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w900,
                            color: nextTeamColor,
                            letterSpacing: 1.5,
                          ),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          "GET READY!",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Colors.white70,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 30),
                        Transform.scale(
                          scale: _scaleAnimation.value,
                          child: FadeTransition(
                            opacity: _fadeAnimation,
                            child: Container(
                              width: 160,
                              height: 160,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: nextTeamColor.withAlpha(40),
                                border: Border.all(
                                  color: nextTeamColor,
                                  width: 4,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: nextTeamColor.withAlpha(160),
                                    blurRadius: 30,
                                    spreadRadius: 5,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Text(
                                  _countdownText,
                                  style: TextStyle(
                                    fontSize: _countdown == -1 ? 48 : 72,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    shadows: [
                                      Shadow(
                                        color: nextTeamColor,
                                        blurRadius: 20,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}
