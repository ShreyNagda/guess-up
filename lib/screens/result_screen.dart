import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';

class ResultScreen extends StatelessWidget {
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
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    // Filter out unanswered words
    final answeredWords =
        scoreMap.entries
            .where((e) => e.value == "Correct" || e.value == "Pass")
            .toList();

    return Scaffold(
      // appBar: AppBar(
      //   title: const Text("Game Results"),
      //   centerTitle: true,
      //   automaticallyImplyLeading: false,
      //   shape: const RoundedRectangleBorder(
      //     borderRadius: BorderRadius.vertical(bottom: Radius.circular(16)),
      //   ),
      // ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              Text(
                score > 3 ? "Congratulations!" : "Game Over",
                style: theme.textTheme.displayLarge!.copyWith(
                  color: theme.colorScheme.secondary,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              // Score
              Text(
                "Score: $score",
                style: theme.textTheme.headlineMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              // Wrap with colored cards
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    child: Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      alignment: WrapAlignment.center,
                      children:
                          answeredWords.map((entry) {
                            final word = entry.key;
                            final result = entry.value;

                            final isCorrect = result == "Correct";
                            final bgColor =
                                isCorrect
                                    ? Colors.greenAccent.withOpacity(0.3)
                                    : Colors.redAccent.withOpacity(0.3);
                            final icon = isCorrect ? Icons.check : Icons.close;

                            return Card(
                              color: bgColor,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 12,
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(
                                      word,
                                      style: theme.textTheme.bodyLarge!
                                          .copyWith(
                                            fontWeight: FontWeight.w600,
                                          ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      icon,
                                      color: theme.colorScheme.onSurface,
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

              const SizedBox(height: 20),

              // Back to home button
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50),
                      ),
                      elevation: 8,
                    ),
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        CupertinoPageRoute(
                          builder:
                              (_) => GameScreen(
                                time: time,
                                selectedCategories: selectedCategories!,
                              ),
                        ),
                      );
                    },
                    icon: Icon(Icons.replay),
                    label: const Text("Replay"),
                  ),
                  SizedBox(width: 20),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        CupertinoPageRoute(builder: (_) => HomeScreen()),
                      );
                    },
                    icon: const Icon(Icons.home),
                    label: const Text("Back to Home"),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32,
                        vertical: 16,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(50),
                      ),
                      elevation: 8,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
