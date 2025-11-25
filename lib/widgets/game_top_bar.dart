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
    // Increased width for the timer circle
    final double timerSize = 70.0;

    Color timerColor =
        (remainingTime <= 10) ? Colors.redAccent : theme.colorScheme.primary;

    return SizedBox(
      height: timerSize, // Ensure the bar has enough height for the timer
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: timerSize,
            height: timerSize,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: timerSize,
                  height: timerSize,
                  child: CircularProgressIndicator(
                    value: timerProgress,
                    strokeWidth: timerSize / 10,
                    valueColor: AlwaysStoppedAnimation<Color>(timerColor),
                    backgroundColor: Colors.grey.withAlpha(77),
                    strokeCap: StrokeCap.round,
                  ),
                ),
                Text(
                  "$remainingTime",
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 28,
                    color: timerColor,
                    height: 1.0, // Remove vertical leading
                  ),
                ),
              ],
            ),
          ),

          Align(
            alignment: Alignment.centerLeft,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "SCORE",
                  style: theme.textTheme.labelMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: theme.hintColor,
                    letterSpacing: 1.5,
                  ),
                ),
                Text(
                  "$score",
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 40,
                    height: 1.0,
                  ),
                ),
              ],
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              icon: Icon(
                isGamePaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
                size: 50,
              ),
              padding: EdgeInsets.all(10),
              constraints: const BoxConstraints(),
              onPressed: onPauseToggle,
            ),
          ),
        ],
      ),
    );
  }
}
