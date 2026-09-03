import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/result_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/game_pause_overlay.dart';
import 'package:guess_up/widgets/game_top_bar.dart';
import 'package:guess_up/widgets/tilt_detector.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:timer_controller/timer_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class GameScreen extends StatefulWidget {
  final int time;
  final List<Category> selectedCategories;
  final TeamMatchState? teamMatchState;

  const GameScreen({
    super.key,
    required this.time,
    required this.selectedCategories,
    this.teamMatchState,
  });

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> with WidgetsBindingObserver {
  // --- Game State ---
  bool isGamePaused = false;
  bool isGameFinished = false;
  bool isPlacedOnForehead = false;
  bool isCountdownRunning = false;
  bool hasStartTimerEnded = false;
  bool canDetectTilt = true;
  bool isLoadingWords = true;
  int getReadyCountdown = 3;
  int score = 0;
  int currentIndex = 0;
  int _currentStreak = 0;
  int _consecutivePasses = 0;
  List<String> wordsList = [];
  Map<String, String> scoreMap = {};

  // --- Feedback Overlay State ---
  String? _feedbackMessage;
  Color? _feedbackColor;
  IconData? _feedbackIcon;

  // --- Services & Controllers ---
  final CategoryService service = CategoryService();
  StreamSubscription<AccelerometerEvent>? _subscription;
  late TimerController gameTimerController;
  Timer? countdownTimer;
  double lastZ = 0;
  int? _lastSecondBeeped;
  bool _isStartingCountdown = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    WidgetsBinding.instance.addObserver(this);
    WakelockPlus.enable();
    gameTimerController = TimerController.seconds(widget.time);
    _subscription = accelerometerEventStream().listen(_handleAccelerometer);
    _fetchInitialWords();
    _setLandscapeOrientation();
    if (widget.teamMatchState?.isTeamMode == true) {
      AudioService().stopBackgroundMusic();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      AudioService().pauseBackgroundMusic();
      if (gameTimerController.value.status == TimerStatus.running) {
        gameTimerController.pause();
        if (mounted) {
          setState(() {
            isGamePaused = true;
          });
        }
      }
    }
  }

  void _setLandscapeOrientation() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  }

  void _setPortraitOrientation() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> _fetchInitialWords() async {
    final shuffled = service.getWordsFromSelectedCategories(
      widget.selectedCategories,
    );
    if (mounted) {
      setState(() {
        wordsList = shuffled..shuffle();
        isLoadingWords = false;
      });
    }
  }

  void _handleAccelerometer(AccelerometerEvent event) {
    lastZ = event.z;
    if (isGamePaused ||
        isGameFinished ||
        gameTimerController.value.status == TimerStatus.running) {
      return;
    }
    final isFlat = lastZ.abs() < 2.5;
    if (isFlat &&
        !isPlacedOnForehead &&
        !isCountdownRunning &&
        !_isStartingCountdown) {
      if (mounted) {
        setState(() {
          isPlacedOnForehead = true;
          isCountdownRunning = true;
          getReadyCountdown = 3;
        });
        _startGetReadyCountdown();
      }
    }
  }

  void _startGetReadyCountdown() {
    if (_isStartingCountdown) return;
    _isStartingCountdown = true;
    if (widget.teamMatchState?.isTeamMode == true) {
      AudioService().pauseBackgroundMusic();
    }
    AudioService().playStartCountdown();
    AudioService().lightImpact();

    countdownTimer?.cancel();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (getReadyCountdown > 1) {
        setState(() {
          getReadyCountdown--;
        });
        AudioService().lightImpact();
      } else {
        timer.cancel();
        _isStartingCountdown = false;
        _lastSecondBeeped = null;
        setState(() {
          isCountdownRunning = false;
          hasStartTimerEnded = true;
        });
        AudioService().heavyImpact();
        gameTimerController.start();
      }
    });
  }

  Future<void> _resetTiltDetection() async {
    setState(() {
      canDetectTilt = false;
    });
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() {
        canDetectTilt = true;
      });
    }
  }

  void handleGamePauseToggle() {
    if (isGameFinished || !isPlacedOnForehead || isCountdownRunning) return;
    HapticFeedback.mediumImpact();
    if (isGamePaused) {
      setState(() {
        isGamePaused = false;
      });
      gameTimerController.start();
    } else {
      gameTimerController.pause();
      setState(() {
        isGamePaused = true;
      });
    }
  }

  Future<void> _handleExitGamePressed() async {
    final bool wasRunning =
        gameTimerController.value.status == TimerStatus.running;
    if (wasRunning) {
      gameTimerController.pause();
    }
    AudioService().lightImpact();

    final bool? shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text("Exit Game?"),
            content: const Text(
              "Are you sure you want to leave? Your game progress will be lost.",
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(false),
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                ),
                onPressed: () => Navigator.of(dialogContext).pop(true),
                child: const Text(
                  "Exit",
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ],
          ),
    );
    if (!mounted) return;
    if (shouldExit == true) {
      if (isGamePaused) {
        setState(() {
          isGamePaused = false;
        });
      }
      _setPortraitOrientation();
      await Future.delayed(const Duration(milliseconds: 50));
      if (mounted) Navigator.of(context).pop();
    } else {
      if (wasRunning && !isGamePaused) {
        gameTimerController.start();
      }
    }
  }

  void _triggerFeedback(String status) {
    final isCorrect =
        status == "Correct" ||
        status.contains("STREAK") ||
        status.contains("FIRE") ||
        status.contains("+");
    setState(() {
      _feedbackMessage = status;
      _feedbackColor =
          isCorrect
              ? const Color(0xFF1B5E20)
              : const Color(0xFFB71C1C); // Solid Green vs Red
      _feedbackIcon =
          isCorrect ? Icons.check_circle_rounded : Icons.cancel_rounded;
    });
  }

  Future<void> _processAnswer(String status) async {
    if (currentIndex >= wordsList.length || isGameFinished || !mounted) return;
    final currentWord = wordsList[currentIndex];
    scoreMap[currentWord] = status;

    if (status == "Correct") {
      _currentStreak++;
      _consecutivePasses = 0;
      int pointsAdded = 1;

      if (_currentStreak >= 5) {
        pointsAdded = 3;
        AudioService().playStreakSound();
        _triggerFeedback("ON FIRE! 🔥🔥 +3");
      } else if (_currentStreak >= 3) {
        pointsAdded = 2;
        AudioService().playStreakSound();
        _triggerFeedback("HOT STREAK! 🔥 +2");
      } else {
        AudioService().mediumImpact();
        AudioService().playCorrect();
        _triggerFeedback("CORRECT! +1");
      }

      if (mounted) {
        setState(() => score += pointsAdded);
      }
    } else {
      _currentStreak = 0;
      _consecutivePasses++;
      AudioService().heavyImpact();
      AudioService().playPass();

      if (_consecutivePasses >= 5) {
        _consecutivePasses = 0;
        if (mounted) {
          setState(() {
            score = (score - 1).clamp(0, 9999);
          });
        }
        _triggerFeedback("5 PASSES! ⚠️ -1");
      } else {
        _triggerFeedback("PASS");
      }
    }

    // Solid curtain is active — hold next word reveal for 450ms
    await Future.delayed(const Duration(milliseconds: 450));

    if (mounted) {
      setState(() {
        currentIndex++;
        _feedbackMessage = null; // Uncover curtain after word changes
      });
      if (currentIndex < wordsList.length) {
        scoreMap[wordsList[currentIndex]] = "Pass";
      }
    }
    if (currentIndex >= wordsList.length - 3) {
      _fetchMoreWords();
    }
    if (mounted) await _resetTiltDetection();
  }

  Future<void> _fetchMoreWords() async {
    final newWords = service.getWordsFromSelectedCategories(
      widget.selectedCategories,
    );
    final existing = wordsList.toSet();
    final uniqueNew = newWords.where((w) => !existing.contains(w)).toList();
    if (uniqueNew.isNotEmpty && mounted) {
      setState(() {
        wordsList.addAll(uniqueNew..shuffle());
      });
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    WakelockPlus.disable();
    _subscription?.cancel();
    countdownTimer?.cancel();
    gameTimerController.dispose();
    AudioService().playBackgroundMusic();
    _setPortraitOrientation();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        _handleExitGamePressed();
      },
      child: TimerControllerListener(
        controller: gameTimerController,
        listener: (context, value) {
          final rem = value.remaining;
          if (rem <= 3 &&
              rem > 0 &&
              isPlacedOnForehead &&
              !isGameFinished &&
              !isCountdownRunning) {
            if (_lastSecondBeeped != rem) {
              _lastSecondBeeped = rem;
              // AudioService().playStartCountdown();
              AudioService().lightImpact();
            }
          }
          if (rem == 0 && !isGameFinished) {
            if (!mounted) return;
            AudioService().playEndingCountdown();
            AudioService().heavyImpact();
            setState(() => isGameFinished = true);
            _setPortraitOrientation();
            Navigator.of(context).pushReplacement(
              CupertinoPageRoute(
                builder:
                    (_) => ResultScreen(
                      score: score,
                      time: widget.time,
                      scoreMap: scoreMap,
                      selectedCategories: widget.selectedCategories,
                      teamMatchState: widget.teamMatchState,
                    ),
              ),
            );
          }
        },
        child: TimerControllerBuilder(
          controller: gameTimerController,
          builder: (context, value, child) {
            final timerProgress =
                (widget.time > 0) ? value.remaining / widget.time : 0.0;
            final isTeamMode = widget.teamMatchState?.isTeamMode == true;
            final teamColor =
                widget.teamMatchState?.currentTeamColor ?? AppTheme.teamAColor;

            return Scaffold(
              backgroundColor: const Color(
                0xFF0F0F14,
              ), // Dark gaming canvas for maximum legibility
              body: Container(
                decoration:
                    isTeamMode
                        ? BoxDecoration(
                          border: Border.all(color: teamColor, width: 5),
                          boxShadow: [
                            BoxShadow(
                              color: teamColor.withAlpha(120),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        )
                        : null,
                child: Stack(
                  children: [
                    // 1. Main Game Content
                    RepaintBoundary(
                      child: Center(child: _buildMainContent(theme)),
                    ),

                    if (!isGamePaused &&
                        !isGameFinished &&
                        isPlacedOnForehead &&
                        !isCountdownRunning)
                      Positioned.fill(
                        child: Row(
                          children: [
                            Expanded(
                              child: GestureDetector(
                                behavior: HitTestBehavior.translucent,
                                onTap: () {
                                  if (canDetectTilt) _processAnswer("Pass");
                                },
                              ),
                            ),
                            Expanded(
                              child: GestureDetector(
                                behavior: HitTestBehavior.translucent,
                                onTap: () {
                                  if (canDetectTilt) _processAnswer("Correct");
                                },
                              ),
                            ),
                          ],
                        ),
                      ),

                    // 3. Top Bar (Hidden until start timer has ended)
                    if (hasStartTimerEnded)
                      Positioned(
                        top: 10,
                        left: 20,
                        right: 20,
                        child: Padding(
                          padding: const EdgeInsets.all(8.0),
                          child: GameTopBar(
                            score: score,
                            timerProgress: timerProgress,
                            remainingTime: value.remaining,
                            isGamePaused: isGamePaused,
                            onPauseToggle: handleGamePauseToggle,
                            teamMatchState: widget.teamMatchState,
                          ),
                        ),
                      ),

                    // Exit button before start timer has ended
                    if (!hasStartTimerEnded && !isCountdownRunning)
                      Positioned(
                        top: 16,
                        left: 20,
                        child: SafeArea(
                          child: IconButton(
                            icon: const Icon(
                              Icons.arrow_back_ios_new_rounded,
                              color: Colors.white,
                              size: 22,
                            ),
                            onPressed: _handleExitGamePressed,
                          ),
                        ),
                      ),

                    // 4. Pause Overlay
                    if (isGamePaused)
                      GamePauseOverlay(
                        onResumePressed: handleGamePauseToggle,
                        onExitPressed: _handleExitGamePressed,
                        score: score,
                      ),

                    // 5. Feedback Overlay (Correct / Pass / Streak Hype)
                    if (_feedbackMessage != null) _buildFeedbackOverlay(),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFeedbackOverlay() {
    return Positioned.fill(
      child: IgnorePointer(
        child: Container(
          color:
              _feedbackColor ?? Colors.green.shade800, // 100% Solid background
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _feedbackIcon ?? Icons.check_circle_rounded,
                  color: Colors.white,
                  size: 80,
                ),
                const SizedBox(height: 16),
                Text(
                  _feedbackMessage ?? "",
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                    letterSpacing: 2,
                    shadows: [
                      Shadow(
                        color: Colors.black45,
                        blurRadius: 10,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent(ThemeData theme) {
    if (isLoadingWords) {
      return const CircularProgressIndicator();
    }

    final teamState = widget.teamMatchState;
    final isTeamMode = teamState?.isTeamMode == true;
    final teamColor = teamState?.currentTeamColor ?? AppTheme.teamAColor;

    // --- State 1: Place Phone on Forehead Pre-game Screen ---
    if (!isPlacedOnForehead) {
      final isFlat = lastZ.abs() < 2.5;

      return Center(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 16.0,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isTeamMode) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.black.withAlpha(160),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: teamColor.withAlpha(180),
                        width: 2,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.groups_rounded, color: teamColor, size: 22),
                        const SizedBox(width: 10),
                        Text(
                          "${teamState!.currentTeamName.toUpperCase()} PLAYS  •  ROUND ${teamState.currentRound}/${teamState.maxRounds}",
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                            color: Colors.white,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // Phone Forehead Graphic & Main Instruction
                Container(
                  constraints: const BoxConstraints(maxWidth: 640),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 24,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E1E28),
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                      color:
                          isTeamMode
                              ? teamColor.withAlpha(180)
                              : Colors.amber.withAlpha(180),
                      width: 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (isTeamMode ? teamColor : Colors.amber)
                            .withAlpha(40),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.phone_android_rounded,
                            size: 48,
                            color: isTeamMode ? Colors.white : Colors.amber,
                          ),
                          const SizedBox(width: 16),
                          Icon(
                            Icons.face_rounded,
                            size: 48,
                            color: isTeamMode ? Colors.white : Colors.amber,
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        "PLACE PHONE ON FOREHEAD",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w900,
                          color: isTeamMode ? Colors.white : Colors.amber,
                          letterSpacing: 1.5,
                          fontSize: 24,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        "Screen facing your friends! Countdown starts automatically when held flat.",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: Colors.white70,
                          height: 1.3,
                        ),
                        softWrap: true,
                      ),
                      if (isFlat) ...[
                        const SizedBox(height: 12),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.amber.withAlpha(50),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: Colors.amberAccent.withAlpha(140),
                            ),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.check_circle_rounded,
                                size: 14,
                                color: Colors.amberAccent,
                              ),
                              SizedBox(width: 6),
                              Text(
                                "HELD FLAT • STARTING...",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w900,
                                  color: Colors.amberAccent,
                                  letterSpacing: 1.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    // --- State 2: 3-2-1 Countdown Screen ---
    if (isCountdownRunning) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (isTeamMode) ...[
            Text(
              "${teamState!.currentTeamName.toUpperCase()} GET READY!",
              style: TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                color: teamColor,
                letterSpacing: 2,
                shadows: [
                  Shadow(color: Colors.black.withAlpha(180), blurRadius: 8),
                ],
              ),
            ),
            const SizedBox(height: 10),
          ],
          Text(
            getReadyCountdown.toString(),
            style: theme.textTheme.displayLarge?.copyWith(
              fontSize: 150,
              fontWeight: FontWeight.w900,
              color: Colors.amber,
            ),
          ),
          const Text(
            "GET READY TO GUESS!",
            style: TextStyle(
              fontWeight: FontWeight.w900,
              letterSpacing: 2,
              fontSize: 16,
              color: Colors.white70,
            ),
          ),
        ],
      );
    }

    if (wordsList.isEmpty || currentIndex >= wordsList.length) {
      return const CircularProgressIndicator();
    }

    final currentWord = wordsList[currentIndex];
    final isTimerRunning =
        gameTimerController.value.status == TimerStatus.running;

    // --- State 3: Active Gameplay Word Screen with Animated Word Flip ---
    return Container(
      width: double.infinity,
      height: double.infinity,
      alignment: Alignment.center,
      child: TiltDetector(
        isActive:
            canDetectTilt &&
            !isGamePaused &&
            !isCountdownRunning &&
            !isGameFinished &&
            isPlacedOnForehead &&
            isTimerRunning,
        onTiltDown: () => _processAnswer("Correct"),
        onTiltUp: () => _processAnswer("Pass"),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 720, maxHeight: 280),
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 20),
            child: Center(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 250),
                switchInCurve: Curves.easeOutBack,
                switchOutCurve: Curves.easeIn,
                transitionBuilder: (Widget child, Animation<double> animation) {
                  return ScaleTransition(
                    scale: animation,
                    child: FadeTransition(opacity: animation, child: child),
                  );
                },
                child: FittedBox(
                  key: ValueKey<String>(currentWord),
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.center,
                  child: Text(
                    currentWord,
                    textAlign: TextAlign.center,
                    maxLines: 3,
                    softWrap: true,
                    style: const TextStyle(
                      fontSize: 84,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.15,
                      letterSpacing: 0.5,
                      shadows: [
                        Shadow(
                          color: Colors.black,
                          blurRadius: 16,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
