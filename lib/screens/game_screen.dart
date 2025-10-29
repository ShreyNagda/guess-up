import 'dart:async';
import 'dart:convert';
import 'dart:ui'; // For BackdropFilter
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
    if (widget.selectedCategories.any((c) => c.id == "-1")) {
      final offlineCat = widget.selectedCategories.firstWhere(
        (c) => c.id == "-1",
      );
      initialWords = List<String>.from(offlineCat.words);
    } else {
      // Fetch words using the service method (which might be cached or from Firestore)
      initialWords = service.getWordsFromSelectedCategories(
        widget.selectedCategories,
      );
      // Always add local words from data.json
      final localWords = await _getWordsFromLocalFile(); // Use helper
      initialWords.addAll(localWords);
    }

    // Ensure widget is still mounted before calling setState
    if (mounted) {
      setState(() {
        // Filter out duplicates just in case and shuffle
        wordsList = initialWords.toSet().toList()..shuffle();
      });
    }
  }

  // Helper for loading local file words
  Future<List<String>> _getWordsFromLocalFile() async {
    try {
      final jsonStr = await rootBundle.loadString("assets/data.json");
      final data = json.decode(jsonStr);
      // Assuming data.json structure is {"words": ["Word1", "Word2", ...]}
      if (data is Map && data.containsKey('words') && data['words'] is List) {
        return List<String>.from(data['words']);
      }
      // Or if it's just a List ["Word1", "Word2", ...]
      if (data is List) {
        return data.map((e) => e.toString()).toList();
      }
      return []; // Return empty if structure is unexpected
    } catch (e) {
      return [];
    }
  }

  void _handleAccelerometer(AccelerometerEvent event) {
    lastZ = event.z;
    // Only trigger countdown if game hasn't started/isn't paused/finished
    final isFlat = lastZ.abs() < 2; // Threshold for flat
    if (isFlat &&
        !isPlacedOnForehead &&
        !isCountdownRunning &&
        gameTimerController.value.status !=
            TimerStatus.running && // Check timer status correctly
        !isGamePaused &&
        !isGameFinished) {
      if (mounted) {
        // Guard setState
        setState(() {
          isPlacedOnForehead = true; // Mark as placed
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

    countdownTimer?.cancel(); // Cancel any existing timer
    countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      // Guard against calling setState or accessing controller if disposed
      if (!mounted) {
        timer.cancel();
        return;
      }
      if (getReadyCountdown == 1) {
        timer.cancel();
        setState(() {
          isCountdownRunning = false; // Countdown finished
        });
        gameTimerController.start(); // Start the actual game timer
      } else {
        setState(() {
          getReadyCountdown--;
        });
      }
    });
  }

  // Prevents multiple tilts registering before phone is straightened
  Future<void> _resetTiltDetection() async {
    if (!mounted) return;
    setState(() => canDetectTilt = false); // Disable detection immediately
    await Future.delayed(const Duration(milliseconds: 700)); // Cooldown period

    // Wait until phone is roughly flat again
    while (mounted && lastZ.abs() > 2.5) {
      // Check mounted within loop
      // Slightly larger threshold for reset
      await Future.delayed(const Duration(milliseconds: 100));
    }

    if (mounted) setState(() => canDetectTilt = true); // Re-enable detection
  }

  void handleGamePauseToggle() {
    if (isGameFinished) return; // Don't allow pause after finish
    if (!mounted) return; // Guard before accessing context

    if (isGamePaused) {
      // Only allow resume if phone is flat (to prevent resuming mid-tilt)
      final isFlat = lastZ.abs() < 2;
      if (!isFlat) {
        // Check mounted before using ScaffoldMessenger
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
      gameTimerController.start(); // Resume timer
    } else {
      gameTimerController.pause(); // Pause timer
    }
    // Guard setState
    if (mounted) {
      setState(() {
        isGamePaused = !isGamePaused; // Toggle pause state
      });
    }
  }

  // Using the full screen dialog feedback
  void showTiltDialog(String message) {
    // context use is safe here (before await)
    showGeneralDialog(
      context: context,
      barrierDismissible: false, // Prevents dismissing by tapping outside
      barrierLabel: "TiltFeedbackDialog",
      transitionDuration: const Duration(
        milliseconds: 150,
      ), // Faster transition
      pageBuilder:
          (_, __, ___) => Scaffold(
            // Use Scaffold for structure
            backgroundColor: Colors.transparent, // Make scaffold transparent
            body: Center(
              child: Container(
                width: double.infinity,
                height: double.infinity,
                color:
                    message == "Correct"
                        ? Colors.green.withAlpha(220)
                        : Colors.redAccent.withAlpha(220),
                alignment: Alignment.center,
                child: Text(
                  message,
                  style: const TextStyle(
                    fontSize: 60, // Larger text
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    decoration:
                        TextDecoration
                            .none, // Remove underline from Scaffold default
                  ),
                ),
              ),
            ),
          ),
    );

    // Automatically dismiss the dialog after a short duration
    Future.delayed(const Duration(milliseconds: 500), () {
      // <<< Guard context use after delay >>>
      if (!mounted) return;
      // Check if the dialog is still the top route before popping
      // Navigator.of(context) use is now guarded by the mounted check
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
    });
  }

  void _processAnswer(String status) async {
    if (currentIndex >= wordsList.length || isGameFinished || !mounted) {
      return; // Prevent processing if out of bounds, finished, or disposed
    }

    final currentWord = wordsList[currentIndex];
    scoreMap[currentWord] = status; // Log the result

    if (status == "Correct") {
      AudioService().playCorrect();
      HapticFeedback.mediumImpact();
      // Guard setState
      if (mounted) {
        setState(() => score++); // Increment score only if correct and mounted
      }
    } else {
      // Pass
      AudioService().playPass();
      HapticFeedback.lightImpact();
    }

    // Show feedback (dialog uses context before await, so it's okay here)
    showTiltDialog(status);

    // Move to next word immediately (guard setState)
    if (mounted) {
      setState(() {
        currentIndex++;
      });
    }

    // Reset tilt detection *after* processing and showing feedback
    await _resetTiltDetection();

    // <<< Guard before calling _fetchMoreWords >>>
    if (!mounted) return;

    // Fetch more words if running low (check after incrementing index)
    if (currentIndex >= wordsList.length - 3) {
      _fetchMoreWords(); // This call is now guarded
    }
  }

  // Separate function to fetch more words
  Future<void> _fetchMoreWords() async {
    List<String> newWords = [];
    if (widget.selectedCategories.any((c) => c.id == "-1")) {
      final offlineCat = widget.selectedCategories.firstWhere(
        (c) => c.id == "-1",
      );
      newWords = List<String>.from(offlineCat.words);
    } else {
      // Assume service method handles its own potential async gaps if needed
      newWords = service.getWordsFromSelectedCategories(
        widget.selectedCategories,
      );
      // <<< await requires check after >>>
      final localWords = await _getWordsFromLocalFile();
      // <<< Guard after await >>>
      if (!mounted) return;
      newWords.addAll(localWords);
    }

    // Filter out words already in the list or already answered
    final existingWords = wordsList.toSet();
    final filteredNewWords =
        newWords.where((w) => !existingWords.contains(w)).toList();

    if (filteredNewWords.isNotEmpty && mounted) {
      // Check mounted before setState
      setState(() {
        wordsList.addAll(filteredNewWords..shuffle());
      });
    }
  }

  Future<bool> _showExitDialog() async {
    // Pause the game timer if it's running when dialog is shown
    bool wasRunning = gameTimerController.value.status == TimerStatus.running;
    if (wasRunning) {
      gameTimerController.pause();
    }

    // context use is safe here (before await)
    bool? shouldExit = await showDialog<bool>(
      context: context,
      barrierDismissible: false, // User must choose an action
      builder:
          (dialogContext) => AlertDialog(
            // Use dialogContext inside builder
            title: const Text("Exit Game?"),
            content: const Text(
              "Are you sure? Your current score will be lost.",
            ),
            actions: [
              TextButton(
                onPressed: () {
                  // Check mounted before accessing gameTimerController or state
                  if (mounted) {
                    // If game was running, resume it before closing dialog
                    if (wasRunning) {
                      gameTimerController.start();
                      if (isGamePaused) {
                        setState(
                          () => isGamePaused = false,
                        ); // Reset pause state if needed
                      }
                    }
                  }
                  Navigator.of(
                    dialogContext,
                  ).pop(false); // Don't exit, use dialogContext
                },
                child: const Text("Cancel"),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.redAccent,
                  foregroundColor: Colors.white, // Text color
                ),
                onPressed: () {
                  _setPortraitOrientation(); // Set back to portrait before leaving
                  Navigator.of(
                    dialogContext,
                  ).pop(true); // Confirm exit, use dialogContext
                },
                child: const Text("Exit"),
              ),
            ],
          ),
    );

    // If the dialog is dismissed by other means (e.g. back button), resume if needed
    // <<< Guard after await showDialog >>>
    if (mounted) {
      if (shouldExit == null && wasRunning) {
        gameTimerController.start();
        if (isGamePaused) setState(() => isGamePaused = false);
      }
    }

    return shouldExit ?? false; // Return true if confirmed, false otherwise
  }

  @override
  void dispose() {
    WakelockPlus.disable();
    _subscription?.cancel();
    countdownTimer?.cancel();
    gameTimerController.dispose(); // Dispose the timer controller
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Show loading indicator until words are loaded
    if (wordsList.isEmpty && !isGameFinished) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return PopScope(
      canPop: false, // Prevent accidental back navigation
      onPopInvokedWithResult: (bool didPop, dynamic result) async {
        if (didPop) return; // If already popped by other means, do nothing
        // <<< await requires check after >>>
        final shouldExit = await _showExitDialog();
        // <<< Guard context use after await >>>
        if (!mounted) return;
        if (shouldExit) {
          Navigator.of(context).pop(); // context use is now guarded
        }
      },
      child: SafeArea(
        // Ensures content avoids notches/status bars
        child: TimerControllerListener(
          controller: gameTimerController,
          listener: (context, value) {
            // Play sound effects based on remaining time
            if (value.remaining == 3) {
              AudioService().playEndingCountdown(); // Start sound a bit earlier
            }
            if (value.remaining == 0 && !isGameFinished) {
              // <<< Guard context use within listener (considered async gap) >>>
              if (!mounted) return;
              // Check !isGameFinished to prevent multiple navigations
              setState(() {
                isGameFinished = true;
              }); // Mark game as finished
              _setLandscapeOrientation(); // Ensure landscape for results screen
              // context use is now guarded
              Navigator.of(context).pushReplacement(
                CupertinoPageRoute(
                  builder:
                      (_) => ResultScreen(
                        score: score,
                        time: widget.time, // Pass original total time
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
              // Calculate timer progress (0.0 to 1.0)
              double timerProgress =
                  (value.remaining > 0 && widget.time > 0)
                      ? value.remaining / widget.time
                      : 0.0;

              // Determine timer color based on remaining time
              Color timerColor =
                  (value.remaining <= 10)
                      ? Colors.redAccent
                      : theme.colorScheme.primary;

              return Scaffold(
                body: Stack(
                  children: [
                    // --- Main Content Area ---
                    Center(
                      child: _buildMainContent(
                        theme,
                      ), // Use helper for main content
                    ),

                    // --- Top Overlay (Controls & Info) ---
                    Positioned(
                      top: 10, // Adjusted padding
                      left: 10,
                      right: 10,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment:
                            CrossAxisAlignment.center, // Align items vertically
                        children: [
                          // --- Score Display (Moved to Left) ---
                          Padding(
                            padding: const EdgeInsets.only(left: 8.0),
                            child: Text(
                              "Score: $score",
                              style: theme.textTheme.headlineSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),

                          // --- Timer Display (Center) ---
                          SizedBox(
                            width: 55, // Size of the indicator
                            height: 55,
                            child: Stack(
                              alignment: Alignment.center,
                              children: [
                                CircularProgressIndicator(
                                  value: timerProgress,
                                  strokeWidth: 5,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    timerColor,
                                  ),
                                  backgroundColor: Colors.grey.withAlpha(100),
                                ),
                                Text(
                                  "${value.remaining}",
                                  style: theme.textTheme.titleMedium?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // --- Pause Button (Right) ---
                          IconButton(
                            icon: Icon(
                              isGamePaused
                                  ? Icons.play_arrow_rounded
                                  : Icons.pause_rounded,
                              size: 32,
                            ),
                            padding: const EdgeInsets.all(12),
                            onPressed: handleGamePauseToggle,
                          ),
                        ],
                      ),
                    ),

                    // --- Pause Overlay ---
                    if (isGamePaused) _buildPauseOverlay(theme),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  // Helper method to build the main content based on game state
  Widget _buildMainContent(ThemeData theme) {
    // ... (This function doesn't have async gaps, remains the same) ...
    if (!isPlacedOnForehead) {
      // Initial Instruction
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
              style: theme.textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    } else if (isCountdownRunning) {
      // "Get Ready!" Countdown
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
      // Handle case where words run out temporarily
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text("Loading more words...", style: theme.textTheme.headlineSmall),
        ],
      );
    } else if (isGameFinished) {
      // Optional: Show a "Finished!" message briefly before navigating
      return Center(
        child: Text("Finished!", style: theme.textTheme.displayMedium),
      );
    } else {
      // Active Gameplay - Word Display
      return TiltDetector(
        isActive: !isGamePaused && !isGameFinished && canDetectTilt,
        onTiltUp: () => _processAnswer("Pass"), // Tilt Up = Pass
        onTiltDown: () => _processAnswer("Correct"), // Tilt Down = Correct
        child: Center(
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 200), // Quick fade
            transitionBuilder: (Widget child, Animation<double> animation) {
              return FadeTransition(opacity: animation, child: child);
            },
            child: Text(
              // Use a Key based on the index to trigger the animation
              // Ensure currentIndex is within bounds before accessing
              (currentIndex < wordsList.length)
                  ? wordsList[currentIndex]
                  : "...",
              key: ValueKey<int>(currentIndex),
              textAlign: TextAlign.center,
              style: theme.textTheme.displayLarge!.copyWith(
                fontWeight: FontWeight.bold,
                fontSize: 64, // Slightly smaller for potentially longer words
              ),
            ),
          ),
        ),
      );
    }
  }

  // Helper method to build the pause overlay
  Widget _buildPauseOverlay(ThemeData theme) {
    // ... (This function doesn't have async gaps, remains the same) ...
    return Positioned.fill(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          color: Colors.black.withAlpha(100), // Darker overlay
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  "Paused",
                  style: theme.textTheme.displayLarge!.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 60,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  "Current Score: $score", // Show current score
                  style: theme.textTheme.headlineMedium!.copyWith(
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),
                // Resume Button
                ElevatedButton.icon(
                  onPressed: handleGamePauseToggle, // Resume the game
                  icon: const Icon(Icons.play_arrow_rounded, size: 28),
                  label: const Text("Resume", style: TextStyle(fontSize: 18)),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(50),
                    ),
                    backgroundColor: theme.colorScheme.primary, // Match theme
                    foregroundColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                // Exit Game Button
                TextButton.icon(
                  onPressed: () async {
                    // <<< await requires check after >>>
                    final shouldExit = await _showExitDialog();
                    // <<< Guard context use after await >>>
                    if (!mounted) return;
                    // If exit confirmed from pause menu, pop the GameScreen
                    if (shouldExit) {
                      Navigator.of(context).pop(); // context use is guarded
                    }
                  },
                  icon: const Icon(Icons.exit_to_app, size: 24),
                  label: const Text(
                    "Exit Game",
                    style: TextStyle(fontSize: 16),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white.withAlpha(
                      200,
                    ), // Less prominent color
                    padding: const EdgeInsets.symmetric(
                      horizontal: 24,
                      vertical: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
