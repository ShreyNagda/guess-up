import 'dart:async';
import 'dart:convert';
import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/result_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/widgets/tilt_detector.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:timer_controller/timer_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/services/category_service.dart';

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
  bool canDetectTilt = true;

  int getReadyCountdown = 3;
  int score = 0;
  int currentIndex = 0;

  List<String> wordsList = [];
  Map<String, String> scoreMap = {}; // word -> "Correct"/"Pass"

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
    _subscription = accelerometerEvents.listen(_handleAccelerometer);
    _fetchInitialWords();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  Future<void> _fetchInitialWords() async {
    List<String> initialWords = [];

    // Offline mode (custom words from StorageService or first category with id -1)
    if (widget.selectedCategories.any((c) => c.id == "-1")) {
      final offlineCat = widget.selectedCategories.firstWhere(
        (c) => c.id == "-1",
      );
      initialWords = List<String>.from(offlineCat.words);
    } else {
      // Online categories
      initialWords = await service.getWordsFromSelectedCategories(
        widget.selectedCategories,
      );

      // Also include local file words (data.json)
      final localWords = await getWordsFromLocalFile();
      initialWords.addAll(localWords);
    }

    print(initialWords);

    setState(() {
      wordsList = initialWords..shuffle();
    });
  }

  Future<List<String>> getWordsFromLocalFile() async {
    try {
      final jsonStr = await rootBundle.loadString("assets/data.json");
      final data = json.decode(jsonStr) as List<dynamic>;
      return data.map((e) => e.toString()).toList();
    } catch (_) {
      return [];
    }
  }

  void _handleAccelerometer(AccelerometerEvent event) {
    lastZ = event.z;
    final isFlat = lastZ.abs() < 2;

    if (isFlat && !isPlacedOnForehead && !isCountdownRunning) {
      setState(() {
        isPlacedOnForehead = true;
        isCountdownRunning = true;
        getReadyCountdown = 3;
      });
      _startGetReadyCountdown();
    }
  }

  void _startGetReadyCountdown() {
    AudioService().playStartCountdown();
    HapticFeedback.heavyImpact();

    countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
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
    setState(() => canDetectTilt = false);
    await Future.delayed(const Duration(seconds: 1));

    while (lastZ.abs() > 2) {
      await Future.delayed(const Duration(milliseconds: 100));
    }

    if (mounted) setState(() => canDetectTilt = true);
  }

  void handleGamePause() {
    if (isGamePaused) {
      final isFlat = lastZ.abs() < 2;
      if (!isFlat) return;
      gameTimerController.start();
    } else {
      gameTimerController.pause();
    }
    setState(() {
      isGamePaused = !isGamePaused;
    });
  }

  void showTiltDialog(String message) {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierLabel: "TiltDialog",
      transitionDuration: const Duration(milliseconds: 200),
      pageBuilder:
          (_, __, ___) => Scaffold(
            backgroundColor: Colors.transparent,
            body: Center(
              child: Container(
                width: double.infinity,
                height: double.infinity,
                color:
                    message == "Correct"
                        ? Colors.greenAccent
                        : Colors.redAccent,
                alignment: Alignment.center,
                child: Text(
                  message,
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
    );

    Future.delayed(const Duration(milliseconds: 500), () {
      if (Navigator.of(context).canPop()) Navigator.of(context).pop();
    });
  }

  void incrementIndex(String status) async {
    if (currentIndex >= wordsList.length) return;

    final currentWord = wordsList[currentIndex];
    scoreMap[currentWord] = status;

    setState(() {
      currentIndex++;
      if (status == "Correct") score++;
    });

    showTiltDialog(status);

    // Fetch more words dynamically if near the end
    if (currentIndex >= wordsList.length - 3) {
      List<String> newWords = [];

      if (widget.selectedCategories.any((c) => c.id == "-1")) {
        final offlineCat = widget.selectedCategories.firstWhere(
          (c) => c.id == "-1",
        );
        newWords = List<String>.from(offlineCat.words);
      } else {
        newWords = await service.getWordsFromSelectedCategories(
          widget.selectedCategories,
        );
        final localWords = await getWordsFromLocalFile();
        newWords.addAll(localWords);
      }

      final filtered = newWords.where((w) => !wordsList.contains(w)).toList();

      if (filtered.isNotEmpty) {
        setState(() {
          wordsList.addAll(filtered..shuffle());
        });
      }
    }
  }

  Future<bool> _showExitDialog() async {
    handleGamePause();
    return await showDialog<bool>(
          context: context,
          builder:
              (context) => AlertDialog(
                title: const Text("Exit Game?"),
                content: const Text(
                  "Are you sure you want to quit? Your score will be lost.",
                ),
                actions: [
                  TextButton(
                    onPressed: () {
                      handleGamePause();
                      Navigator.of(context).pop(false);
                    },
                    child: const Text("Cancel"),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.redAccent,
                    ),
                    onPressed: () {
                      SystemChrome.setPreferredOrientations([
                        DeviceOrientation.portraitUp,
                      ]);
                      Navigator.of(context).pop(true);
                    },
                    child: const Text("Exit"),
                  ),
                ],
              ),
        ) ??
        false;
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _subscription?.cancel();
    countdownTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (wordsList.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return PopScope(
      canPop: false,
      child: SafeArea(
        child: TimerControllerListener(
          controller: gameTimerController,
          listener: (context, value) {
            if (value.remaining == 2) AudioService().playEndingCountdown();
            if (value.remaining == 0) {
              isGameFinished = true;
              SystemChrome.setPreferredOrientations([
                DeviceOrientation.landscapeLeft,
                DeviceOrientation.landscapeRight,
              ]);
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
              return Scaffold(
                body: Stack(
                  children: [
                    Center(
                      child:
                          !isPlacedOnForehead
                              ? Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: const [
                                  Icon(Icons.phone_android, size: 48),
                                  SizedBox(height: 10),
                                  Text("Hold phone on your forehead to start"),
                                ],
                              )
                              : (isCountdownRunning
                                  ? Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      const Text("Get Ready!"),
                                      Text(
                                        "$getReadyCountdown",
                                        style: theme.textTheme.displayLarge,
                                      ),
                                    ],
                                  )
                                  : TiltDetector(
                                    isActive:
                                        !isGamePaused &&
                                        !isGameFinished &&
                                        canDetectTilt,
                                    onTiltUp: () async {
                                      if (!canDetectTilt) return;
                                      AudioService().playPass();
                                      await HapticFeedback.heavyImpact();
                                      incrementIndex("Pass");
                                      _resetTiltDetection();
                                    },
                                    onTiltDown: () async {
                                      if (!canDetectTilt) return;
                                      AudioService().playCorrect();
                                      await HapticFeedback.heavyImpact();
                                      incrementIndex("Correct");
                                      _resetTiltDetection();
                                    },
                                    child: Center(
                                      child: Text(
                                        wordsList[currentIndex],
                                        textAlign: TextAlign.center,
                                        style: theme.textTheme.displayLarge!
                                            .copyWith(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 72,
                                            ),
                                      ),
                                    ),
                                  )),
                    ),
                    Positioned(
                      top: 16,
                      left: 16,
                      right: 16,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          IconButton(
                            icon: const Icon(
                              Icons.chevron_left_rounded,
                              size: 36,
                            ),
                            onPressed: () async {
                              if (await _showExitDialog())
                                Navigator.of(context).pop();
                            },
                          ),
                          Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                "${value.remaining} sec",
                                style: theme.textTheme.headlineMedium,
                              ),
                              Text(
                                "Score: $score",
                                style: theme.textTheme.headlineSmall,
                              ),
                            ],
                          ),
                          IconButton(
                            icon: Icon(
                              isGamePaused
                                  ? Icons.play_arrow_rounded
                                  : Icons.pause_rounded,
                            ),
                            onPressed: handleGamePause,
                          ),
                        ],
                      ),
                    ),
                    if (isGamePaused)
                      Positioned.fill(
                        child: Stack(
                          children: [
                            BackdropFilter(
                              filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
                              child: Container(
                                color: Colors.black.withOpacity(0.4),
                              ),
                            ),
                            Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    "Paused",
                                    style: theme.textTheme.displayLarge!
                                        .copyWith(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 60,
                                        ),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    "Score: $score",
                                    style: theme.textTheme.headlineMedium!
                                        .copyWith(color: Colors.white),
                                  ),
                                  const SizedBox(height: 32),
                                  ElevatedButton.icon(
                                    onPressed: handleGamePause,
                                    icon: const Icon(Icons.play_arrow_rounded),
                                    label: const Text("Resume"),
                                    style: ElevatedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 32,
                                        vertical: 16,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(50),
                                      ),
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
            },
          ),
        ),
      ),
    );
  }
}
