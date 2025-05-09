import 'dart:async';
// import 'package:audioplayers/audioplayers.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/result_screen.dart';
import 'package:guess_up/widgets/tilt_detector.dart';
// import 'package:just_audio/just_audio.dart';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:timer_controller/timer_controller.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

class GameScreen extends StatefulWidget {
  final int time;
  final List<String> words;

  const GameScreen({super.key, required this.time, required this.words});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  bool isGamePaused = false;
  bool isGameFinished = false;
  bool isPlacedOnForehead = false;
  bool isCountdownRunning = false;
  int getReadyCountdown = 3;

  int score = 0;
  int currentIndex = 0;

  late List<String> wordsList;

  final player = AudioPlayer();

  StreamSubscription<AccelerometerEvent>? _subscription;
  late TimerController gameTimerController;
  Timer? countdownTimer;

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();
    wordsList = widget.words;
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    gameTimerController = TimerController.seconds(widget.time);
    _subscription = accelerometerEvents.listen(_handleAccelerometer);
  }

  Future<void> playSound(String assetPath) async {
    try {
      await player.play(AssetSource(assetPath));
      // await player.play();
    } catch (e) {
      print(e);
    }
  }

  void _handleAccelerometer(AccelerometerEvent event) {
    final z = event.z;

    final isFlat = z.abs() < 2;

    final detected = isFlat;

    if (detected && !isPlacedOnForehead && !isCountdownRunning) {
      setState(() {
        isPlacedOnForehead = true;
        isCountdownRunning = true;
        getReadyCountdown = 3;
      });

      _startGetReadyCountdown();
    }
  }

  void _startGetReadyCountdown() {
    playSound("sounds/timer_sound.mp3");
    HapticFeedback.heavyImpact();
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (getReadyCountdown == 1) {
        timer.cancel();
        setState(() {
          isCountdownRunning = false;
        });
        gameTimerController.start(); // Start main game timer
      } else {
        setState(() {
          getReadyCountdown--;
        });
      }
    });
  }

  void handleGamePause() {
    if (isGamePaused) {
      gameTimerController.start();
    } else {
      gameTimerController.pause();
    }
    setState(() {
      isGamePaused = !isGamePaused;
    });
  }

  void showTiltDialog(BuildContext context, String message) {
    showGeneralDialog(
      context: context,
      barrierDismissible: false,
      barrierLabel: "TiltDialog",
      // barrierColor: Colors.black54, // semi-transparent background
      transitionDuration: Duration(milliseconds: 200),
      pageBuilder: (context, animation, secondaryAnimation) {
        return Scaffold(
          backgroundColor: Colors.transparent,
          body: Center(
            child: Container(
              width: double.infinity,
              height: double.infinity,
              color:
                  message == "Correct" ? Colors.greenAccent : Colors.redAccent,
              alignment: Alignment.center,
              child: Text(
                message,
                style: TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
        );
      },
    );

    Future.delayed(Duration(milliseconds: 500), () {
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
    });
  }

  void incrementIndex(String status) {
    setState(() {
      currentIndex++;
      if (status == "Correct") {
        score++;
      }
    });
    showTiltDialog(context, status);
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _subscription?.cancel();
    countdownTimer?.cancel();
    // SystemChrome.setPreferredOrientations([
    //   DeviceOrientation.portraitUp,
    //   DeviceOrientation.portraitDown,
    // ]);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: TimerControllerListener(
        controller: gameTimerController,
        listener: (context, value) {
          if (value.remaining == 4) {
            playSound("sounds/timer_sound.mp3");
          }
          if (value.remaining == 0) {
            print("Game Finished");
            isGameFinished = true;
            Navigator.of(context).pushReplacement(
              CupertinoPageRoute(
                builder: (context) => ResultScreen(score: score),
              ),
            );
          }
        },
        child: TimerControllerBuilder(
          controller: gameTimerController,
          builder: (context, value, child) {
            return Scaffold(
              body: Center(
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
                                Text("$getReadyCountdown"),
                              ],
                            )
                            : TiltDetector(
                              isActive: !isGamePaused && !isGameFinished,
                              onTiltUp: () async {
                                await playSound("sounds/pass_sound.mp3");
                                await HapticFeedback.heavyImpact();
                                incrementIndex("Pass");
                              },
                              onTiltDown: () async {
                                await playSound("sounds/correct_sound.mp3");
                                await HapticFeedback.heavyImpact();
                                incrementIndex("Correct");
                              },
                              child: Stack(
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      IconButton(
                                        onPressed: () {
                                          Navigator.of(context).pop();
                                        },
                                        icon: Icon(Icons.close_rounded),
                                      ),
                                      Column(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            "${value.remaining} seconds",
                                            style:
                                                Theme.of(
                                                  context,
                                                ).textTheme.headlineMedium,
                                          ),
                                          Text(
                                            "Score: $score",
                                            style:
                                                Theme.of(
                                                  context,
                                                ).textTheme.headlineSmall,
                                          ),
                                        ],
                                      ),
                                      if (!isCountdownRunning &&
                                          isPlacedOnForehead)
                                        IconButton(
                                          onPressed: handleGamePause,
                                          icon: Icon(
                                            isGamePaused
                                                ? Icons.play_arrow_rounded
                                                : Icons.pause_rounded,
                                          ),
                                        ),
                                    ],
                                  ),
                                  Center(
                                    child:
                                        !isGamePaused
                                            ? Text(
                                              widget.words[currentIndex],
                                              style:
                                                  Theme.of(
                                                    context,
                                                  ).textTheme.displaySmall,
                                            )
                                            : Text(
                                              "Paused",
                                              style:
                                                  Theme.of(
                                                    context,
                                                  ).textTheme.displaySmall,
                                            ),
                                  ),
                                ],
                              ),
                            )),
              ),
            );
          },
        ),
      ),
    );
  }
}
