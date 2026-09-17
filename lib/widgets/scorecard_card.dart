import 'package:flutter/cupertino.dart';
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
    final answeredWords =
        scoreMap?.entries
            .where((e) => e.value == "Correct" || e.value == "Pass")
            .toList() ??
        [];

    return Container(
      width: 360,
      height: 640, // 9:16 aspect ratio (360x640 rendered at 3.0x = 1080x1920 Instagram Story resolution)
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        color: const Color(0xFF0B0F19),
        borderRadius: BorderRadius.circular(32),
        border: Border.all(
          color: (isTeamMode ? effectiveWinnerColor : AppTheme.darkPrimaryColor)
              .withAlpha(204),
          width: 2.5,
        ),
      ),
      child: Stack(
        children: [
          // Ambient Glow Spot Top-Center
          Positioned(
            top: -50,
            left: 60,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (isTeamMode
                            ? effectiveWinnerColor
                            : AppTheme.darkPrimaryColor)
                        .withAlpha(64),
                    blurRadius: 75,
                    spreadRadius: 20,
                  ),
                ],
              ),
            ),
          ),
          // Ambient Glow Spot Bottom-Right
          Positioned(
            bottom: -40,
            right: -40,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: (isTeamMode ? AppTheme.teamBColor : Colors.amber)
                        .withAlpha(51),
                    blurRadius: 65,
                    spreadRadius: 15,
                  ),
                ],
              ),
            ),
          ),

          // Main 9:16 Vertical Content Layout
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 24.0,
              vertical: 26.0,
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // 1. TOP BRANDING HEADER
                Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.darkPrimaryColor,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.darkPrimaryColor.withAlpha(128),
                            blurRadius: 14,
                            spreadRadius: 1,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(6),
                            child: Image.asset(
                              'assets/images/bujho-icon.png',
                              width: 20,
                              height: 20,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'BUJHO',
                            style: TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              letterSpacing: 2.0,
                              fontFamily: AppTheme.fontFamily,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'INSTAGRAM STORY SCORECARD',
                      style: TextStyle(
                        color: Colors.white.withAlpha(230),
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2.2,
                      ),
                    ),
                  ],
                ),

                // 2. HERO DISPLAY (TEAM OR SOLO)
                if (isTeamMode) ...[
                  // TEAM MATCH STORY DISPLAY
                  Column(
                    children: [
                      // Winner Avatar Icon
                      Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: effectiveWinnerColor.withAlpha(64),
                          border: Border.all(
                            color: effectiveWinnerColor,
                            width: 3.5,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: effectiveWinnerColor.withAlpha(128),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            winnerEmoji,
                            style: const TextStyle(fontSize: 40),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        winnerName.toUpperCase(),
                        style: TextStyle(
                          color: effectiveWinnerColor,
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          fontFamily: AppTheme.fontFamily,
                          letterSpacing: 1.0,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161C2B),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: effectiveWinnerColor.withAlpha(204),
                          ),
                        ),
                        child: const Text(
                          'MATCH CHAMPIONS 🏆',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Side-by-side Scores Standings Box
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161C2B),
                          borderRadius: BorderRadius.circular(24),
                          border: Border.all(
                            color: Colors.white.withAlpha(51),
                            width: 1.5,
                          ),
                        ),
                        child: Row(
                          children: [
                            // Cyan Team Box
                            Expanded(
                              child: Column(
                                children: [
                                  Text(
                                    '$teamCyanEmoji $teamCyanName',
                                    style: TextStyle(
                                      color: AppTheme.teamAColor,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$teamCyanScore',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 32,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    'POINTS',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(217),
                                      fontSize: 9,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: 1,
                              height: 50,
                              color: Colors.white.withAlpha(77),
                            ),
                            // Magenta Team Box
                            Expanded(
                              child: Column(
                                children: [
                                  Text(
                                    '$teamMagentaEmoji $teamMagentaName',
                                    style: TextStyle(
                                      color: AppTheme.teamBColor,
                                      fontWeight: FontWeight.w900,
                                      fontSize: 13,
                                    ),
                                    textAlign: TextAlign.center,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '$teamMagentaScore',
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 32,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                  Text(
                                    'POINTS',
                                    style: TextStyle(
                                      color: Colors.white.withAlpha(217),
                                      fontSize: 9,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.5,
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
                ] else ...[
                  // SOLO MATCH STORY DISPLAY
                  Column(
                    children: [
                      // Star Rating
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(3, (index) {
                          int stars =
                              soloScore >= 12
                                  ? 3
                                  : (soloScore >= 6 ? 2 : (soloScore >= 1 ? 1 : 0));
                          final isEarned = index < stars;
                          return Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4.0,
                            ),
                            child: Icon(
                              CupertinoIcons.star_fill,
                              size: 30,
                              color: isEarned
                                  ? Colors.amber
                                  : const Color(0xFF4A5264),
                            ),
                          );
                        }),
                      ),
                      const SizedBox(height: 12),

                      // Score Circle
                      Container(
                        width: 136,
                        height: 136,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppTheme.darkPrimaryColor.withAlpha(46),
                          border: Border.all(
                            color: AppTheme.darkPrimaryColor,
                            width: 4.0,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppTheme.darkPrimaryColor.withAlpha(115),
                              blurRadius: 24,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              '$soloScore',
                              style: const TextStyle(
                                color: AppTheme.darkPrimaryColor,
                                fontSize: 48,
                                fontWeight: FontWeight.w900,
                                height: 1.0,
                              ),
                            ),
                            const Text(
                              'POINTS',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2.0,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // Score Tagline Pill
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E1708),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.amberAccent,
                            width: 1.5,
                          ),
                        ),
                        child: Text(
                          _getScoreTagline(soloScore),
                          style: const TextStyle(
                            color: Colors.amberAccent,
                            fontWeight: FontWeight.w900,
                            fontSize: 13,
                            letterSpacing: 1.0,
                          ),
                        ),
                      ),

                      // Answered Word Chips Preview
                      if (answeredWords.isNotEmpty) ...[
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          alignment: WrapAlignment.center,
                          children:
                              answeredWords.take(5).map((entry) {
                                final isCorrect = entry.value == "Correct";
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 6,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        isCorrect
                                            ? const Color(0xFF0F3A22)
                                            : const Color(0xFF4A151B),
                                    borderRadius: BorderRadius.circular(10),
                                    border: Border.all(
                                      color:
                                          isCorrect
                                              ? const Color(0xFF20BF6B)
                                              : const Color(0xFFEB4D4B),
                                      width: 1.2,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isCorrect
                                            ? CupertinoIcons.checkmark_alt
                                            : CupertinoIcons.xmark,
                                        size: 13,
                                        color:
                                            isCorrect
                                                ? const Color(0xFF20BF6B)
                                                : const Color(0xFFEB4D4B),
                                      ),
                                      const SizedBox(width: 5),
                                      Text(
                                        entry.key,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                        ),
                      ],
                    ],
                  ),
                ],

                // 3. BOTTOM CALL-TO-ACTION & WATERMARK
                Column(
                  children: [
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(
                        vertical: 10,
                        horizontal: 12,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF161C2B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: AppTheme.darkPrimaryColor.withAlpha(102),
                          width: 1.5,
                        ),
                      ),
                      child: Column(
                        children: [
                          const Text(
                            'CAN YOU BEAT THIS SCORE? 🔥',
                            style: TextStyle(
                              color: AppTheme.darkPrimaryColor,
                              fontWeight: FontWeight.w900,
                              fontSize: 12,
                              letterSpacing: 1.2,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Play Bujho Party Game on iOS & Android',
                            style: TextStyle(
                              color: Colors.white.withAlpha(242),
                              fontWeight: FontWeight.w700,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: Image.asset(
                            'assets/images/bujho-icon.png',
                            width: 14,
                            height: 14,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          '#BujhoGame • bujho.vercel.app',
                          style: TextStyle(
                            color: Colors.white.withAlpha(230),
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _getScoreTagline(int score) {
    if (score >= 40) return "LEGEND STATUS 👑";
    if (score >= 25) return "PARTY STARTERS 🔥";
    if (score >= 15) return "CHARADES PROS ⚡";
    if (score >= 5) return "WARMUP MODE ☕";
    return "NEEDS PRACTICE 🦥";
  }
}
