import 'package:flutter/material.dart';

class GameTopBar extends StatelessWidget {
  final int score;
  final double timerProgress;
  final int remainingTime;
  final bool isGamePaused;
  final VoidCallback onPauseToggle;

  const GameTopBar({
    super.key,
    required this.score,
    required this.timerProgress,
    required this.remainingTime,
    required this.isGamePaused,
    required this.onPauseToggle,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    Color timerColor =
        (remainingTime <= 10) ? Colors.redAccent : theme.colorScheme.primary;
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // --- Score Display ---
        Padding(
          padding: const EdgeInsets.only(left: 8.0),
          child: Text(
            "Score: $score",
            style: theme.textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.w900,
            ),
          ),
        ),

        // --- Timer Display ---
        SizedBox(
          width: 55,
          height: 55,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CircularProgressIndicator(
                value: timerProgress,
                strokeWidth: 5,
                valueColor: AlwaysStoppedAnimation<Color>(timerColor),
                // I noticed your snippet had 77, but the original file had 100.
                // I'll use 100 to match the file, but 77 is fine too.
                backgroundColor: Colors.grey.withAlpha(77),
              ),
              Text(
                "$remainingTime",
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),

        // --- Pause Button ---
        IconButton(
          icon: Icon(
            isGamePaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
            size: 35,
          ),
          padding: const EdgeInsets.all(12),
          onPressed: onPauseToggle,
        ),
      ],
    );
  }
}
