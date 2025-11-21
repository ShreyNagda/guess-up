import 'dart:ui'; // For ImageFilter
import 'package:flutter/material.dart';

class GamePauseOverlay extends StatelessWidget {
  final int score;
  final VoidCallback onResumePressed;
  final VoidCallback onExitPressed;

  const GamePauseOverlay({
    super.key,
    required this.score,
    required this.onResumePressed,
    required this.onExitPressed,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // This widget now contains the Positioned.fill and all its contents
    return Positioned.fill(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          color: Colors.black.withAlpha(128), // Using your specified alpha
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
                  "Current Score: $score", // Use the 'score' parameter
                  style: theme.textTheme.headlineMedium!.copyWith(
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 32),
                ElevatedButton.icon(
                  onPressed: onResumePressed, // Use the callback
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
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                  ),
                ),
                const SizedBox(height: 16),
                TextButton.icon(
                  onPressed: onExitPressed, // Use the callback
                  icon: const Icon(Icons.exit_to_app, size: 24),
                  label: const Text(
                    "Exit Game",
                    style: TextStyle(fontSize: 16),
                  ),
                  style: TextButton.styleFrom(
                    foregroundColor: Colors.white.withAlpha(
                      204,
                    ), // ~0.8 opacity
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
