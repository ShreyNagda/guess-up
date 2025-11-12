import 'dart:async';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/result_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/widgets/game_top_bar.dart';
import 'package:guess_up/widgets/tilt_detector.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:timer_controller/timer_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/category_service.dart';

import '../widgets/game_pause_overlay.dart';

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
  bool isGamePaused = false;
  bool isGameFinished = false;
  bool isPlacedOnForehead = false;
  bool isCountdownRunning = false;
  bool canDetectTilt = true; // Renamed from isTiltAllowed for clarity

  int getReadyCountdown = 3;
  int score = 0;
  int currentIndex = 0;

  List<String> wordsList = [];
  Map<String, String> scoreMap = {}; // word -> "Correct"/"Pass"

  final CategoryService service = CategoryService();
  StreamSubscription<AccelerometerEvent>? _subscription;
  late TimerController gameTimerController;
  Timer? countdownTimer;
  double lastZ = 0; // Keep track of Z-axis for tilt reset logic

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
    List<String> initialWords = [];
    // Online mode: Only get words from the selected Firestore categories
    initialWords = service.getWordsFromSelectedCategories(
      widget.selectedCategories,
    );

    if (mounted) {
      setState(() {
        // Use toSet() to ensure all words (especially in offline) are unique
        wordsList = initialWords.toSet().toList()..shuffle();
      });
    }
  }

  // // Helper for loading local file words
  // Future<List<String>> _getWordsFromLocalFile() async {
  //   try {
  //     final jsonStr = await rootBundle.loadString("assets/data.json");
  //     final data = json.decode(jsonStr);
  //     // Assuming data.json structure is {"words": ["Word1", "Word2", ...]}
  //     if (data is Map && data.containsKey('words') && data['words'] is List) {
  //       return List<String>.from(data['words']);
  //     }
  //     if (data is List) {
  //       return data.map((e) => e.toString()).toList();
  //     }
  //     return [];
  //   } catch (e) {
  //     print("Error loading local words: $e");
  //     return [];
  //   }
  // }

  void _handleAccelerometer(AccelerometerEvent event) {
    lastZ = event.z;
    final isFlat = lastZ.abs() < 2;
    if (isFlat &&
        !isPlacedOnForehead &&
        !isCountdownRunning &&
        gameTimerController.value.status != TimerStatus.running &&
        !isGamePaused &&
        !isGameFinished) {
      if (mounted) {
        // Guard setState
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

  Future<void> _resetTiltDetection() async {
    if (!mounted) return;
    setState(() => canDetectTilt = false);
    await Future.delayed(const Duration(milliseconds: 700));

    while (mounted && lastZ.abs() > 2.5) {
      await Future.delayed(const Duration(milliseconds: 100));
    }

    if (mounted) setState(() => canDetectTilt = true);
  }

  void handleGamePauseToggle() {
    if (isGameFinished) return;
    if (!mounted) return;

    if (isGamePaused) {
      final isFlat = lastZ.abs() < 2;
      if (!isFlat) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text("Place phone flat to resume"),
              duration: Duration(seconds: 1),
            ),
          );
        }
        return;
      }
      gameTimerController.start();
    } else {
      gameTimerController.pause();
    }
    if (mounted) {
      setState(() {
        isGamePaused = !isGamePaused;
      });
    }
  }

  void _handleExitGamePressed() async {
    final shouldExit = await _showExitDialog();
    if (!mounted) return;
    if (shouldExit) {
      _setPortraitOrientation(); // Set back to portrait before leaving
      Navigator.of(context).pop();
    }
  }

  void showTiltDialog(String message) {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierLabel: "TiltFeedbackDialog",
      transitionDuration: const Duration(milliseconds: 150),
      pageBuilder:
          (_, __, ___) => Scaffold(
            backgroundColor: Colors.transparent,
            body: Center(
              child: Container(
                width: double.infinity,
                height: double.infinity,
                color: message == "Correct" ? Colors.green : Colors.redAccent,
                alignment: Alignment.center,
                child: Text(
                  message,
                  style: const TextStyle(
                    fontSize: 60,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    decoration: TextDecoration.none,
                  ),
                ),
              ),
            ),
          ),
    );

    Future.delayed(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
    });
  }

  void _processAnswer(String status) async {
    if (currentIndex >= wordsList.length || isGameFinished || !mounted) {
      return;
    }

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

    showTiltDialog(status);

    if (mounted) {
      setState(() {
        currentIndex++;
      });
    }

    await _resetTiltDetection();

    if (!mounted) return;

    if (currentIndex >= wordsList.length - 3) {
      _fetchMoreWords();
    }
  }

  Future<void> _fetchMoreWords() async {
    List<String> newWords = [];
    // Online mode: Only get words from the selected Firestore categories
    newWords = service.getWordsFromSelectedCategories(
      widget.selectedCategories,
    );

    final existingWords = wordsList.toSet();
    final filteredNewWords =
        newWords.where((w) => !existingWords.contains(w)).toList();

    if (filteredNewWords.isNotEmpty && mounted) {
      setState(() {
        wordsList.addAll(filteredNewWords..shuffle());
      });
    }
  }

  Future<bool> _showExitDialog() async {
    bool wasRunning = gameTimerController.value.status == TimerStatus.running;
    if (wasRunning) {
      gameTimerController.pause();
    }

    bool? shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder:
          (dialogContext) => AlertDialog(
            title: const Text("Exit Game?"),
            content: const Text(
              "Are you sure? Your current score will be lost.",
            ),
            actions: [
              TextButton(
                onPressed: () {
                  if (mounted) {
                    if (wasRunning) {
                      gameTimerController.start();
                      if (isGamePaused) setState(() => isGamePaused = false);
                    }
                  }
                  Navigator.of(dialogContext).pop(false);
                },
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white,
                ),
                onPressed: () {
                  _setPortraitOrientation();
                  Navigator.of(dialogContext).pop(true);
                },
                child: const Text("Exit"),
              ),
            ],
          ),
    );

    if (mounted) {
      if (shouldExit == null && wasRunning) {
        gameTimerController.start();
        if (isGamePaused) setState(() => isGamePaused = false);
      }
    }

    return shouldExit ?? false;
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

    if (wordsList.isEmpty && !isGameFinished) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, dynamic result) async {
        if (didPop) return;
        final shouldExit = await _showExitDialog();
        if (!mounted) return;
        if (shouldExit) {
          Navigator.of(context).pop();
        }
      },
      child: TimerControllerListener(
        controller: gameTimerController,
        listener: (context, value) {
          if (value.remaining == 3) {
            AudioService().playEndingCountdown();
          }
          if (value.remaining == 0 && !isGameFinished) {
            if (!mounted) return;
            setState(() {
              isGameFinished = true;
            });
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
            double timerProgress =
                (value.remaining > 0 && widget.time > 0)
                    ? value.remaining / widget.time
                    : 0.0;

            return Scaffold(
              body: Padding(
                padding: const EdgeInsets.all(20.0),
                child: Stack(
                  children: [
                    Center(child: _buildMainContent(theme)),
                    Positioned(
                      top: 10,
                      left: 10,
                      right: 10,
                      child: GameTopBar(
                        score: score,
                        timerProgress: timerProgress,
                        remainingTime: value.remaining,
                        isGamePaused: isGamePaused,
                        onPauseToggle: handleGamePauseToggle,
                      ),
                    ),
                    if (isGamePaused)
                      GamePauseOverlay(
                        score: score,
                        onResumePressed: handleGamePauseToggle,
                        onExitPressed: _handleExitGamePressed,
                      ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildMainContent(ThemeData theme) {
    if (!isPlacedOnForehead) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.phone_android_outlined,
              size: 60,
              color: theme.colorScheme.secondary,
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
      return TiltDetector(
        isActive: !isGamePaused && !isGameFinished && canDetectTilt,
        onTiltUp: () => _processAnswer("Pass"),
        onTiltDown: () => _processAnswer("Correct"),
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200),
            transitionBuilder: (Widget child, Animation<double> animation) {
              return FadeTransition(opacity: animation, child: child);
            },
            child: Text(
              (currentIndex < wordsList.length)
                  ? wordsList[currentIndex]
                  : "...",
              key: ValueKey<int>(currentIndex),
              textAlign: TextAlign.center,
              style: theme.textTheme.displayLarge!.copyWith(
                fontWeight: FontWeight.w900,
                fontSize: 70,
              ),
            ),
          ),
        ),
      );
    }
  }
}
