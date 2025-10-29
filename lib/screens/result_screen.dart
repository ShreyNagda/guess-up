import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart'; // Import for SystemChrome
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';

// Convert to StatefulWidget to manage orientation
class ResultScreen extends StatefulWidget {
  final int score;
  final int time;
  final Map<String, String> scoreMap;
  final List<Category>? selectedCategories;

  const ResultScreen({
    super.key,
    required this.score,
    required this.time,
    required this.scoreMap,
    this.selectedCategories,
  });

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  int _correctCount = 0;
  int _passCount = 0;

  @override
  void initState() {
    super.initState();
    _setLandscapeOrientation(); // Enforce landscape on entry
    _calculateStats(); // Calculate stats
  }

  // Calculate Correct/Pass counts
  void _calculateStats() {
    int correct = 0;
    int passed = 0;
    widget.scoreMap.forEach((key, value) {
      if (value == "Correct") {
        correct++;
      } else if (value == "Pass") {
        passed++;
      }
    });
    // Use setState only if needed, here we can assign directly before build
    _correctCount = correct;
    _passCount = passed;
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

  // Optional: Reset orientation if needed when leaving this screen
  // @override
  // void dispose() {
  //   SystemChrome.setPreferredOrientations([
  //     DeviceOrientation.portraitUp,
  //     DeviceOrientation.portraitDown,
  //     DeviceOrientation.landscapeLeft,
  //     DeviceOrientation.landscapeRight,
  //   ]);
  //   super.dispose();
  // }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Filter out unanswered words (using widget property)
    final answeredWords =
        widget.scoreMap.entries
            .where((e) => e.value == "Correct" || e.value == "Pass")
            .toList();

    return Scaffold(
      // Keep AppBar commented out unless you decide you need it
      body: SafeArea(
        // Use SafeArea to avoid overlaps
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 16.0,
            ), // Adjust padding for landscape
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center, // Center vertically
              children: [
                // Header Text
                Text(
                  widget.score > 3 ? "Congratulations!" : "Game Over",
                  style: theme.textTheme.displayLarge!.copyWith(
                    color: theme.colorScheme.secondary,
                    fontWeight: FontWeight.bold,
                    fontSize: 48, // Adjust size for landscape if needed
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8), // Reduced space
                // Score
                Text(
                  "Score: ${widget.score}",
                  style: theme.textTheme.headlineMedium!.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                // Optional: Add Correct/Pass statistics
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Correct: $_correctCount",
                      style: theme.textTheme.titleMedium,
                    ),
                    const SizedBox(width: 16),
                    Text(
                      "Passed: $_passCount",
                      style: theme.textTheme.titleMedium,
                    ),
                  ],
                ),
                const SizedBox(height: 16), // Space before word list
                // Word List Section (scrollable)
                Expanded(
                  child: Center(
                    // Center the scroll view if content is less than full height
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(
                        vertical: 8.0,
                      ), // Padding for scroll content
                      child: Wrap(
                        spacing: 12, // Horizontal space
                        runSpacing: 12, // Vertical space
                        alignment: WrapAlignment.center,
                        children:
                            answeredWords.map((entry) {
                              final word = entry.key;
                              final result = entry.value;
                              final isCorrect = result == "Correct";
                              final bgColor =
                                  isCorrect
                                      ? Colors.green.withAlpha(
                                        80,
                                      ) // Slightly adjusted colors
                                      : Colors.red.withAlpha(80);
                              final icon =
                                  isCorrect
                                      ? Icons.check_circle_outline
                                      : Icons
                                          .highlight_off; // Different icons?// Darker text for contrast

                              return Card(
                                color: bgColor,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                elevation:
                                    1, // Reduce elevation for a flatter look in the list
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                    vertical: 10,
                                  ), // Adjust padding
                                  child: Row(
                                    mainAxisSize:
                                        MainAxisSize.min, // Keep cards tight
                                    children: [
                                      Text(
                                        word,
                                        style: theme.textTheme.bodyLarge!.copyWith(
                                          fontWeight:
                                              FontWeight
                                                  .w600, // Make text bolder
                                          // color: textColor, // Optional: Explicit text color for contrast
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Icon(
                                        icon,
                                        color:
                                            isCorrect
                                                ? Colors.green.shade700
                                                : Colors
                                                    .red
                                                    .shade700, // Icon color matching status
                                        size: 18, // Slightly smaller icon
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }).toList(),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20), // Space before buttons
                // Action Buttons Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Replay Button (Primary Action)
                    ElevatedButton.icon(
                      onPressed: () {
                        // Ensure it remains landscape for replay
                        _setLandscapeOrientation();
                        Navigator.of(context).pushReplacement(
                          CupertinoPageRoute(
                            builder:
                                (_) => GameScreen(
                                  time: widget.time,
                                  // Pass non-nullable list or handle null case appropriately
                                  selectedCategories:
                                      widget.selectedCategories ?? [],
                                ),
                          ),
                        );
                      },
                      icon: const Icon(Icons.replay),
                      label: const Text("Replay"),
                    ),
                    const SizedBox(width: 20),

                    // Back to Home Button (Secondary Action)
                    OutlinedButton.icon(
                      onPressed: () {
                        _setPortraitOrientation(); // Set orientation BEFORE navigating
                        Navigator.of(context).pushReplacement(
                          CupertinoPageRoute(
                            builder: (_) => const HomeScreen(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.home_outlined), // Outlined icon
                      label: const Text("Back to Home"),
                    ),
                  ],
                ),
                const SizedBox(height: 16), // Padding at the bottom
              ],
            ),
          ),
        ),
      ),
    );
  }
}
