import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/result_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/services/category_service.dart';
import 'package:guess_up/widgets/game_pause_overlay.dart';
import 'package:guess_up/widgets/game_top_bar.dart';
import 'package:guess_up/widgets/tilt_detector.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:timer_controller/timer_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class GameScreen extends StatefulWidget {
  final int time;
  final List<Category> selectedCategories;
  const GameScreen({
    super.key,
    required this.time,
    required this.selectedCategories,
  });
  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  // --- Game State ---
  bool isGamePaused = false;
  bool isGameFinished = false;
  bool isPlacedOnForehead = false;
  bool isCountdownRunning = false;
  bool canDetectTilt = true;
  bool isLoadingWords = true;
  int getReadyCountdown = 3;
  int score = 0;
  int currentIndex = 0;
  List<String> wordsList = [];
  Map<String, String> scoreMap = {}; // word -> "Correct"/"Pass"
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

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    gameTimerController = TimerController.seconds(widget.time);
    _subscription = accelerometerEventStream().listen(_handleAccelerometer);
    _fetchInitialWords();
    _setLandscapeOrientation();
  }

  void _setLandscapeOrientation() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  void _setPortraitOrientation() {
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  Future<void> _fetchInitialWords() async {
    // Simulate async fetch if needed, or just process
    // In a real scenario, this might await a DB cal
    final initialWords = service.getWordsFromSelectedCategories(
      widget.selectedCategories,
    );
    if (mounted) {
      setState(() {
        wordsList = initialWords.toSet().toList()..shuffle();
        isLoadingWords = false;
      });
    }
  }

  void _handleAccelerometer(AccelerometerEvent event) {
    lastZ = event.z;
    // Ignore if game hasn't started or is paused
    if (isGamePaused ||
        isGameFinished ||
        gameTimerController.value.status == TimerStatus.running) {
      return;
    }
    // Logic to start the game when phone is placed on forehead (vertical)
    // Z-axis close to 0 means the screen is vertical (landscape mode)
    final isFlat = lastZ.abs() < 2.5;
    if (isFlat && !isPlacedOnForehead && !isCountdownRunning) {
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
    AudioService().playStartCountdown();
    HapticFeedback.heavyImpact();
    countdownTimer?.cancel();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (getReadyCountdown == 1) {
        timer.cancel();
        setState(() {
          isCountdownRunning = false;
        });
        gameTimerController.start();
      } else {
        setState(() {
          getReadyCountdown--;
        });
      }
    });
  }

  // --- Tilt Cooldown Logic ---
  Future<void> _resetTiltDetection() async {
    if (!mounted) return;
    setState(() => canDetectTilt = false);
    // Debounce time
    await Future.delayed(const Duration(milliseconds: 700));
    // Check mounted after await
    if (!mounted) return;
    // Wait for user to bring phone back to neutral (vertical) position
    while (mounted && lastZ.abs() > 4.0) {
      // Increased threshold slightly for easier reset
      await Future.delayed(const Duration(milliseconds: 100));
    }
    if (mounted) {
      setState(() => canDetectTilt = true);
    }
  }

  void handleGamePauseToggle() {
    if (isGameFinished || !mounted || isCountdownRunning) return;
    if (isGamePaused) {
      // Resume
      gameTimerController.start();
    } else {
      // Pause
      gameTimerController.pause();
    }
    setState(() {
      isGamePaused = !isGamePaused;
    });
  }

  Future<void> _handleExitGamePressed() async {
    // Pause timer while showing dialog
    final wasRunning = gameTimerController.value.status == TimerStatus.running;
    if (wasRunning) gameTimerController.pause();
    final shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text("Exit Game?"),
            content: const Text("Your current score will be lost."),
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
      _setPortraitOrientation();
      Navigator.of(context).pop();
    } else {
      if (wasRunning && !isGamePaused) {
        gameTimerController.start();
      }
    }
  }

  void _triggerFeedback(String status) {
    final isCorrect = status == "Correct";
    setState(() {
      _feedbackMessage = status;
      _feedbackColor =
          isCorrect
              ? Colors.green
              : Colors.redAccent; // Changed Pass color to redAccent
      _feedbackIcon = isCorrect ? Icons.check_circle : Icons.refresh_rounded;
    });
    Future.delayed(const Duration(milliseconds: 800), () {
      if (mounted) {
        setState(() {
          _feedbackMessage = null;
        });
      }
    });
  }

  Future<void> _processAnswer(String status) async {
    if (currentIndex >= wordsList.length || isGameFinished || !mounted) return;
    final currentWord = wordsList[currentIndex];
    scoreMap[currentWord] = status;
    if (status == "Correct") {
      AudioService().playCorrect();
      HapticFeedback.mediumImpact();
      if (mounted) setState(() => score++);
    } else {
      AudioService().playPass();
      HapticFeedback.lightImpact();
    }
    if (mounted) _triggerFeedback(status);
    if (mounted) {
      setState(() {
        currentIndex++;
      });
    }
    if (currentIndex >= wordsList.length - 3) {
      _fetchMoreWords(); // Fire and forget
    }
    // Ensure mounted before calling async logic that touches state
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
    WakelockPlus.disable();
    _subscription?.cancel();
    countdownTimer?.cancel();
    gameTimerController.dispose();
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
          if (value.remaining == 3) {
            AudioService().playEndingCountdown();
          }
          if (value.remaining == 0 && !isGameFinished) {
            if (!mounted) return;
            setState(() => isGameFinished = true);
            _setLandscapeOrientation();
            Navigator.of(context).pushReplacement(
              CupertinoPageRoute(
                builder:
                    (_) => ResultScreen(
                      score: score,
                      time: widget.time,
                      scoreMap: scoreMap,
                      selectedCategories: widget.selectedCategories,
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
            return Scaffold(
              backgroundColor: theme.scaffoldBackgroundColor,
              // Removed padding from body
              body: Stack(
                children: [
                  // 1. Main Game Content
                  Center(child: _buildMainContent(theme)),
                  // 2. Top Bar (Centered horizontally now, but visually acts as top bar)
                  Positioned(
                    top: 20, // Adjusted top spacing
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
                      ),
                    ),
                  ),
                  // 3. Pause Overlay
                  if (isGamePaused)
                    GamePauseOverlay(
                      score: score,
                      onResumePressed: handleGamePauseToggle,
                      onExitPressed: _handleExitGamePressed,
                    ),
                  // 4. Feedback Overlay (Correct/Pass) - Replaces Dialog
                  if (_feedbackMessage != null) _buildFeedbackOverlay(),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFeedbackOverlay() {
    return Positioned.fill(
      child: Container(
        decoration: BoxDecoration(
          color: _feedbackColor?.withAlpha(225),
          // No borderRadius for fullscreen overlay
        ),
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(_feedbackIcon, size: 100, color: Colors.white),
              const SizedBox(height: 20),
              Text(
                _feedbackMessage?.toUpperCase() ?? "",
                style: const TextStyle(
                  fontSize: 50,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 4,
                  decoration: TextDecoration.none,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMainContent(ThemeData theme) {
    if (isLoadingWords) {
      return const CircularProgressIndicator();
    }
    if (!isPlacedOnForehead) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.phone_android_outlined,
              size: 60,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(height: 16),
            Text(
              "Place Phone on Forehead\nto Start!",
              style: theme.textTheme.displaySmall,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    } else if (isCountdownRunning) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Get Ready!", style: theme.textTheme.headlineLarge),
          const SizedBox(height: 8),
          Text(
            "$getReadyCountdown",
            style: theme.textTheme.displayLarge?.copyWith(
              fontSize: 120,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      );
    } else if (currentIndex >= wordsList.length && !isGameFinished) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text("Loading more words...", style: theme.textTheme.headlineSmall),
        ],
      );
    } else if (isGameFinished) {
      return Center(
        child: Text("Finished!", style: theme.textTheme.displayMedium),
      );
    } else {
      // The Active Game Word - No Card Container
      return TiltDetector(
        isActive: !isGamePaused && !isGameFinished && canDetectTilt,
        onTiltUp: () => _processAnswer("Pass"),
        onTiltDown: () => _processAnswer("Correct"),
        child: Center(
          // Ensure it's centered
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (Widget child, Animation<double> animation) {
              return ScaleTransition(scale: animation, child: child);
            },
            child: Text(
              (currentIndex < wordsList.length)
                  ? wordsList[currentIndex]
                  : "...",
              key: ValueKey<int>(currentIndex),
              textAlign: TextAlign.center,
              softWrap: true,
              style: theme.textTheme.displayLarge!.copyWith(
                fontWeight: FontWeight.w900,
                fontSize: 90, // Even Bigger text since no card constraints
                // Using primary/accent color based on theme for text color directly
                color: theme.textTheme.displayLarge?.color,
                letterSpacing: -2.0,
              ),
            ),
          ),
        ),
      );
    }
  }
}
