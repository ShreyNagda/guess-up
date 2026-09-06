import 'package:flutter/material.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/rolling_score_ticker.dart';

class GameTopBar extends StatelessWidget {
  final int score;
  final double timerProgress;
  final int remainingTime;
  final bool isGamePaused;
  final VoidCallback onPauseToggle;
  final TeamMatchState? teamMatchState;

  const GameTopBar({
    super.key,
    required this.score,
    required this.timerProgress,
    required this.remainingTime,
    required this.isGamePaused,
    required this.onPauseToggle,
    this.teamMatchState,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    // Increased width for the timer circle
    final double timerSize = 70.0;

    final isDark = theme.brightness == Brightness.dark;
    final topBarTextColor = isDark ? Colors.white : const Color(0xFF0F0C1C);
    final topBarSubtextColor = isDark ? Colors.white70 : const Color(0xFF5A6072);

    final bool isLowTime = remainingTime <= 10;
    final bool isCriticalTime = remainingTime <= 5;

    Color timerColor = isLowTime
        ? Colors.redAccent
        : (isDark ? theme.colorScheme.primary : const Color(0xFFD97700));

    final isTeamMode = teamMatchState?.isTeamMode == true;
    final teamColor = teamMatchState?.currentTeamColor ?? AppTheme.teamAColor;

    return SizedBox(
      height: timerSize,
      child: Stack(
        alignment: Alignment.center,
        children: [
          RepaintBoundary(
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isCriticalTime ? timerSize + 6 : timerSize,
              height: isCriticalTime ? timerSize + 6 : timerSize,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow:
                    isCriticalTime
                        ? [
                          BoxShadow(
                            color: Colors.redAccent.withAlpha(180),
                            blurRadius: 16,
                            spreadRadius: 2,
                          ),
                        ]
                        : [],
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: timerSize,
                    height: timerSize,
                    child: CircularProgressIndicator(
                      value: timerProgress,
                      strokeWidth:
                          isCriticalTime ? (timerSize / 8) : (timerSize / 10),
                      valueColor: AlwaysStoppedAnimation<Color>(timerColor),
                      backgroundColor: isDark ? Colors.grey.withAlpha(77) : Colors.black.withAlpha(30),
                      strokeCap: StrokeCap.round,
                    ),
                  ),
                  Text(
                    "$remainingTime",
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.w900,
                      fontSize: isCriticalTime ? 32 : 28,
                      color: timerColor,
                      height: 1.0,
                    ),
                  ),
                ],
              ),
            ),
          ),

          Align(
            alignment: Alignment.centerLeft,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      "SCORE",
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: topBarSubtextColor,
                        fontSize: 11,
                        letterSpacing: 1.5,
                      ),
                    ),
                    RollingScoreTicker(
                      targetScore: score,
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 36,
                        color: topBarTextColor,
                        height: 1.0,
                        shadows: [
                          Shadow(
                            color: isDark ? Colors.black87 : Colors.black12,
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (isTeamMode) ...[
                  const SizedBox(width: 14),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color:
                          teamMatchState!.isTiebreaker
                              ? Colors.deepOrangeAccent.withAlpha(45)
                              : teamColor.withAlpha(45),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color:
                            teamMatchState!.isTiebreaker
                                ? Colors.deepOrangeAccent
                                : teamColor,
                        width: 1.5,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          teamMatchState!.isTiebreaker
                              ? Icons.bolt_rounded
                              : Icons.shield_outlined,
                          size: 14,
                          color:
                              teamMatchState!.isTiebreaker
                                  ? Colors.deepOrangeAccent
                                  : teamColor,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          teamMatchState!.isTiebreaker
                              ? "TIEBREAKER: ${teamMatchState!.currentTeamName}"
                              : teamMatchState!.currentTeamName,
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 12,
                            color:
                                teamMatchState!.isTiebreaker
                                    ? Colors.deepOrangeAccent
                                    : teamColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              icon: Icon(
                isGamePaused ? Icons.play_arrow_rounded : Icons.pause_rounded,
                size: 44,
                color: topBarTextColor,
              ),
              padding: const EdgeInsets.all(12),
              constraints: const BoxConstraints(minWidth: 52, minHeight: 52),
              onPressed: onPauseToggle,
            ),
          ),
        ],
      ),
    );
  }
}
