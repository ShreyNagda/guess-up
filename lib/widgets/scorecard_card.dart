import 'package:flutter/material.dart';
import 'package:guess_up/theme/app_theme.dart';

class ScorecardCard extends StatelessWidget {
  final bool isTeamMode;
  final String teamCyanName;
  final String teamCyanEmoji;
  final int teamCyanScore;
  final String teamMagentaName;
  final String teamMagentaEmoji;
  final int teamMagentaScore;
  final String winnerName;
  final String winnerEmoji;
  final Color? winnerColor;
  final int soloScore;
  final int totalRounds;
  final Map<String, String>? scoreMap;

  const ScorecardCard({
    super.key,
    required this.isTeamMode,
    this.teamCyanName = 'Team Cyan',
    this.teamCyanEmoji = '⚡',
    this.teamCyanScore = 0,
    this.teamMagentaName = 'Team Magenta',
    this.teamMagentaEmoji = '🔥',
    this.teamMagentaScore = 0,
    this.winnerName = 'Team Cyan',
    this.winnerEmoji = '⚡',
    this.winnerColor,
    this.soloScore = 0,
    this.totalRounds = 3,
    this.scoreMap,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveWinnerColor = winnerColor ?? AppTheme.teamAColor;

    return Container(
      width: 360,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1E2638), Color(0xFF0F1420)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(
          color: AppTheme.darkPrimaryColor.withAlpha(150),
          width: 3,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.darkPrimaryColor.withAlpha(50),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Logo & Branding
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppTheme.darkPrimaryColor,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('✨ ', style: TextStyle(fontSize: 14)),
                    Text(
                      'GUESS UP',
                      style: TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.w900,
                        fontSize: 16,
                        letterSpacing: 1.5,
                        fontFamily: 'Manrope',
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Main Winner / Score Display
          if (isTeamMode) ...[
            Text(
              'VICTORY SCORECARD',
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              decoration: BoxDecoration(
                color: effectiveWinnerColor.withAlpha(40),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: effectiveWinnerColor, width: 2),
              ),
              child: Column(
                children: [
                  Text(winnerEmoji, style: const TextStyle(fontSize: 48)),
                  const SizedBox(height: 6),
                  Text(
                    winnerName.toUpperCase(),
                    style: TextStyle(
                      color: effectiveWinnerColor,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      fontFamily: 'Manrope',
                      letterSpacing: 0.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'MATCH CHAMPIONS 🏆',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Team Scores Breakdown
            Row(
              children: [
                // Cyan Team Box
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.teamAColor.withAlpha(25),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppTheme.teamAColor.withAlpha(100),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '$teamCyanName $teamCyanEmoji',
                          style: TextStyle(
                            color: AppTheme.teamAColor,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '$teamCyanScore',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    'VS',
                    style: TextStyle(
                      color: Colors.white54,
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                    ),
                  ),
                ),
                // Magenta Team Box
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.teamBColor.withAlpha(25),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppTheme.teamBColor.withAlpha(100),
                      ),
                    ),
                    child: Column(
                      children: [
                        Text(
                          '$teamMagentaName $teamMagentaEmoji',
                          style: TextStyle(
                            color: AppTheme.teamBColor,
                            fontWeight: FontWeight.w800,
                            fontSize: 14,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 6),
                        Text(
                          '$teamMagentaScore',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Text(
              'SOLO MATCH SCORE',
              style: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 12,
                fontWeight: FontWeight.w800,
                letterSpacing: 2,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
              decoration: BoxDecoration(
                color: AppTheme.darkPrimaryColor.withAlpha(30),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppTheme.darkPrimaryColor, width: 2),
              ),
              child: Column(
                children: [
                  const Text('🎉', style: TextStyle(fontSize: 48)),
                  const SizedBox(height: 8),
                  Text(
                    '$soloScore PTS',
                    style: const TextStyle(
                      color: AppTheme.darkPrimaryColor,
                      fontSize: 40,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 20),

          // Footer Watermark
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.stars_rounded,
                color: AppTheme.darkPrimaryColor.withAlpha(180),
                size: 16,
              ),
              const SizedBox(width: 6),
              Text(
                'Guess Up • Party Charades Game 📱',
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
