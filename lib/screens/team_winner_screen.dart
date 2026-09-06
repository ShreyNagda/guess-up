import 'dart:io';
import 'dart:math';
import 'dart:ui' as ui;
import 'package:confetti/confetti.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/screens/settings_screen.dart';
import 'package:guess_up/screens/team_pass_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';
import 'package:guess_up/widgets/scorecard_card.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';

class TeamWinnerScreen extends StatefulWidget {
  final TeamMatchState teamState;
  final List<Category> selectedCategories;
  final int time;
  final Map<String, String>? lastRoundScoreMap;
  final int? lastRoundScore;

  const TeamWinnerScreen({
    super.key,
    required this.teamState,
    required this.selectedCategories,
    required this.time,
    this.lastRoundScoreMap,
    this.lastRoundScore,
  });

  @override
  State<TeamWinnerScreen> createState() => _TeamWinnerScreenState();
}

class _TeamWinnerScreenState extends State<TeamWinnerScreen>
    with SingleTickerProviderStateMixin {
  late ConfettiController _confettiController;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;
  final GlobalKey _scorecardKey = GlobalKey();
  bool _isSharing = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);

    _confettiController = ConfettiController(
      duration: const Duration(seconds: 6),
    );
    _confettiController.play();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.06).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    GameAudioEngine().heavyImpact();
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _handleShareScorecard() async {
    if (_isSharing) return;
    setState(() => _isSharing = true);
    GameAudioEngine().lightImpact();

    try {
      final boundary =
          _scorecardKey.currentContext?.findRenderObject()
              as RenderRepaintBoundary?;
      if (boundary != null) {
        final image = await boundary.toImage(pixelRatio: 3.0);
        final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
        if (byteData != null) {
          final pngBytes = byteData.buffer.asUint8List();
          final tempDir = await getTemporaryDirectory();
          final file =
              await File(
                '${tempDir.path}/guessup_scorecard_${DateTime.now().millisecondsSinceEpoch}.png',
              ).create();
          await file.writeAsBytes(pngBytes);
          final xFile = XFile(file.path);
          await SharePlus.instance.share(
            ShareParams(
              files: [xFile],
              text:
                  widget.teamState.isTeamMode
                      ? '🏆 ${widget.teamState.winningTeamOnlyName} won in Guess Up! Final Score: ${widget.teamState.teamCyanScore} - ${widget.teamState.teamMagentaScore}'
                      : '🎉 Scored ${widget.lastRoundScore ?? 0} pts in Guess Up!',
            ),
          );
        }
      }
    } catch (e) {
      debugPrint("Error sharing scorecard: $e");
    } finally {
      if (mounted) setState(() => _isSharing = false);
    }
  }

  void _handleStartTiebreaker() {
    GameAudioEngine().extraLightImpact();
    widget.teamState.startTiebreaker();
    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(
        builder:
            (_) => TeamPassScreen(
              teamState: widget.teamState,
              lastRoundScore: widget.lastRoundScore ?? 0,
              time: 30, // 30-second rapid sudden death showdown!
              selectedCategories: widget.selectedCategories,
            ),
      ),
    );
  }

  void _handleRematch() {
    GameAudioEngine().extraLightImpact();
    widget.teamState.resetMatch();
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(
        builder:
            (_) => GameScreen(
              time: widget.time,
              selectedCategories: widget.selectedCategories,
              teamMatchState: widget.teamState,
            ),
      ),
    );
  }

  void _handleChangeSettings() {
    GameAudioEngine().lightImpact();
    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(builder: (_) => const SettingsScreen()),
    );
  }

  void _handleGoHome() {
    GameAudioEngine().lightImpact();
    Navigator.of(
      context,
    ).pushReplacement(CupertinoPageRoute(builder: (_) => const HomeScreen()));
  }

  void _showWordBreakdownModal(BuildContext context) {
    GameAudioEngine().lightImpact();
    final answeredWords =
        widget.lastRoundScoreMap?.entries
            .where((e) => e.value == "Correct" || e.value == "Pass")
            .toList() ??
        [];

    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    showModalBottomSheet(
      context: context,
      backgroundColor: theme.cardColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (modalCtx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 20.0,
              vertical: 20.0,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      "FINAL ROUND WORDS",
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded),
                      onPressed: () => Navigator.of(modalCtx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                if (answeredWords.isEmpty)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 24.0),
                    child: Center(
                      child: Text(
                        "No words were answered in this turn",
                        style: TextStyle(
                          color: theme.hintColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  )
                else
                  ConstrainedBox(
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.45,
                    ),
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children:
                            answeredWords.map((entry) {
                              final word = entry.key;
                              final isCorrect = entry.value == "Correct";
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 8,
                                ),
                                decoration: BoxDecoration(
                                  color:
                                      isCorrect
                                          ? Colors.green.withAlpha(
                                            isDark ? 50 : 35,
                                          )
                                          : Colors.red.withAlpha(
                                            isDark ? 50 : 35,
                                          ),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color:
                                        isCorrect
                                            ? Colors.greenAccent.withAlpha(120)
                                            : Colors.redAccent.withAlpha(120),
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      isCorrect
                                          ? Icons.check_circle_rounded
                                          : Icons.cancel_rounded,
                                      size: 16,
                                      color:
                                          isCorrect
                                              ? Colors.greenAccent
                                              : Colors.redAccent,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      word,
                                      style: TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 15,
                                        color:
                                            theme.textTheme.bodyMedium?.color,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                      ),
                    ),
                  ),
                const SizedBox(height: 12),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = widget.teamState;
    final isTie = state.isTie;

    final TeamColor? winningColor = isTie ? null : state.winningTeam;
    final String winnerName = isTie ? 'TIED' : state.winningTeamOnlyName;
    final String winnerEmoji = isTie ? '🤝' : state.winningTeamOnlyEmoji;
    final Color winnerAccentColor =
        isTie
            ? Colors.amber
            : (winningColor == TeamColor.cyan
                ? AppTheme.teamAColor
                : AppTheme.teamBColor);

    final scoreDiff = (state.teamCyanScore - state.teamMagentaScore).abs();

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: AmbientBackground(
        ambientColor: winnerAccentColor,
        child: Stack(
          children: [
            // Hidden RepaintBoundary widget for PNG Scorecard export
            Offstage(
              offstage: true,
              child: SingleChildScrollView(
                child: RepaintBoundary(
                  key: _scorecardKey,
                  child: ScorecardCard(
                    isTeamMode: state.isTeamMode,
                    teamCyanName: state.teamCyanName,
                    teamCyanEmoji: state.teamCyanEmoji,
                    teamCyanScore: state.teamCyanScore,
                    teamMagentaName: state.teamMagentaName,
                    teamMagentaEmoji: state.teamMagentaEmoji,
                    teamMagentaScore: state.teamMagentaScore,
                    winnerName: winnerName,
                    winnerEmoji: winnerEmoji,
                    winnerColor: winnerAccentColor,
                    soloScore: widget.lastRoundScore ?? 0,
                    totalRounds: state.currentRound,
                  ),
                ),
              ),
            ),
            SafeArea(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24.0,
                  vertical: 16.0,
                ),
                child: Column(
                  children: [
                    const SizedBox(height: 12),

                    // ==========================================
                    // 1. HERO WINNER ANNOUNCEMENT
                    // ==========================================
                    ScaleTransition(
                      scale: _pulseAnimation,
                      child: Container(
                        width: 90,
                        height: 90,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: winnerAccentColor.withAlpha(isDark ? 45 : 35),
                          border: Border.all(
                            color: winnerAccentColor,
                            width: 3,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: winnerAccentColor.withAlpha(120),
                              blurRadius: 28,
                              spreadRadius: 4,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Icon(
                            isTie
                                ? Icons.groups_rounded
                                : Icons.emoji_events_rounded,
                            size: 46,
                            color: winnerAccentColor,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Title Tag
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 14,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: winnerAccentColor.withAlpha(30),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: winnerAccentColor.withAlpha(90),
                        ),
                      ),
                      child: Text(
                        isTie ? "MATCH TIED" : "MATCH CHAMPIONS",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 2.0,
                          color: winnerAccentColor,
                        ),
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Big Headline Announcement
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        isTie
                            ? "IT'S A DEAD TIE!"
                            : "${winnerName.toUpperCase()} $winnerEmoji WINS!",
                        textAlign: TextAlign.center,
                        style: theme.textTheme.headlineLarge?.copyWith(
                          fontWeight: FontWeight.w900,
                          fontSize: 34,
                          letterSpacing: -0.5,
                          color:
                              isDark
                                  ? (isTie
                                      ? Colors.amber
                                      : (winningColor == TeamColor.cyan
                                          ? AppTheme.teamAColor
                                          : AppTheme.teamBColor))
                                  : theme.colorScheme.secondary,
                        ),
                      ),
                    ),

                    const SizedBox(height: 6),

                    Text(
                      isTie
                          ? "Both teams fought valiantly with identical scores!"
                          : (scoreDiff == 1
                              ? "A nail-biting 1-point victory!"
                              : "Sensational performance and teamwork!"),
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: theme.hintColor,
                        fontWeight: FontWeight.w600,
                      ),
                    ),

                    const SizedBox(height: 24),

                    // ==========================================
                    // 2. HEAD-TO-HEAD STANDINGS CARD
                    // ==========================================
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: theme.cardColor,
                        borderRadius: BorderRadius.circular(26),
                        border: Border.all(
                          color: theme.dividerColor.withAlpha(50),
                          width: 1.5,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(isDark ? 60 : 25),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          Text(
                            "FINAL MATCH SCOREBOARD",
                            style: theme.textTheme.labelSmall?.copyWith(
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.6,
                              color: theme.hintColor,
                            ),
                          ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              // Team A (Cyan)
                              Expanded(
                                child: _buildTeamScoreCard(
                                  theme: theme,
                                  isDark: isDark,
                                  name: state.teamCyanName,
                                  emoji: state.teamCyanEmoji,
                                  score: state.teamCyanScore,
                                  color: AppTheme.teamAColor,
                                  isWinner:
                                      !isTie && winningColor == TeamColor.cyan,
                                  isTie: isTie,
                                ),
                              ),
                              const SizedBox(width: 12),
                              // Team B (Magenta)
                              Expanded(
                                child: _buildTeamScoreCard(
                                  theme: theme,
                                  isDark: isDark,
                                  name: state.teamMagentaName,
                                  emoji: state.teamMagentaEmoji,
                                  score: state.teamMagentaScore,
                                  color: AppTheme.teamBColor,
                                  isWinner:
                                      !isTie &&
                                      winningColor == TeamColor.magenta,
                                  isTie: isTie,
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: 14),

                          // Match Summary Pill
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: theme.scaffoldBackgroundColor.withAlpha(
                                140,
                              ),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.sports_score_rounded,
                                  size: 18,
                                  color: theme.hintColor,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  isTie
                                      ? "Deadlock after ${state.currentRound} rounds"
                                      : "Margin of Victory: $scoreDiff ${scoreDiff == 1 ? 'Point' : 'Points'}",
                                  style: theme.textTheme.bodySmall?.copyWith(
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.3,
                                    color: theme.hintColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Optional: Review Last Round Words Button
                    if (widget.lastRoundScoreMap != null &&
                        widget.lastRoundScoreMap!.isNotEmpty)
                      TextButton.icon(
                        onPressed: () => _showWordBreakdownModal(context),
                        icon: const Icon(Icons.list_alt_rounded, size: 20),
                        label: const Text(
                          "Review Final Round Words",
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        style: TextButton.styleFrom(
                          foregroundColor:
                              isDark ? Colors.amber : theme.colorScheme.primary,
                        ),
                      ),

                    const SizedBox(height: 16),

                    // ==========================================
                    // 3. ACTION BUTTONS
                    // ==========================================
                    if (isTie) ...[
                      // Tiebreaker Button
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton.icon(
                          onPressed: _handleStartTiebreaker,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.deepOrangeAccent,
                            foregroundColor: Colors.white,
                            elevation: 4,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(18),
                            ),
                          ),
                          icon: const Icon(Icons.bolt_rounded, size: 26),
                          label: const Text(
                            "SUDDEN DEATH TIEBREAKER (30s)",
                            style: TextStyle(
                              fontWeight: FontWeight.w900,
                              fontSize: 15,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],

                    // Share Scorecard Graphic Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _isSharing ? null : _handleShareScorecard,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6C5CE7),
                          foregroundColor: Colors.white,
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        icon:
                            _isSharing
                                ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                                : const Icon(Icons.share_rounded, size: 22),
                        label: Text(
                          _isSharing
                              ? "GENERATING CARD..."
                              : "SHARE SCORECARD 📸",
                          style: const TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 15,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Play Again (Rematch) Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton.icon(
                        onPressed: _handleRematch,
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                              isDark ? Colors.amber : theme.colorScheme.primary,
                          foregroundColor:
                              isDark ? Colors.black : Colors.black87,
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(18),
                          ),
                        ),
                        icon: const Icon(Icons.replay_rounded, size: 24),
                        label: const Text(
                          "PLAY AGAIN (REMATCH)",
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 16,
                            letterSpacing: 0.8,
                          ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Bottom Row: Settings & Home
                    Row(
                      children: [
                        Expanded(
                          child: SizedBox(
                            height: 50,
                            child: OutlinedButton.icon(
                              onPressed: _handleChangeSettings,
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(
                                  color: theme.dividerColor.withAlpha(100),
                                  width: 1.8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.tune_rounded, size: 20),
                              label: const Text(
                                "SETTINGS",
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SizedBox(
                            height: 50,
                            child: OutlinedButton.icon(
                              onPressed: _handleGoHome,
                              style: OutlinedButton.styleFrom(
                                side: BorderSide(
                                  color: theme.dividerColor.withAlpha(100),
                                  width: 1.8,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              icon: const Icon(Icons.home_rounded, size: 20),
                              label: const Text(
                                "MAIN MENU",
                                style: TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 13,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),

            // ==========================================
            // 4. CONFETTI CELEBRATION SHOWER
            // ==========================================
            Align(
              alignment: Alignment.topCenter,
              child: ConfettiWidget(
                confettiController: _confettiController,
                blastDirectionality: BlastDirectionality.explosive,
                shouldLoop: true,
                numberOfParticles: 35,
                gravity: 0.2,
                colors: [
                  AppTheme.teamAColor,
                  AppTheme.teamBColor,
                  Colors.amber,
                  Colors.greenAccent,
                  Colors.orangeAccent,
                  Colors.white,
                ],
              ),
            ),
            Align(
              alignment: Alignment.topLeft,
              child: ConfettiWidget(
                confettiController: _confettiController,
                blastDirection: pi / 4,
                emissionFrequency: 0.05,
                numberOfParticles: 15,
                gravity: 0.18,
              ),
            ),
            Align(
              alignment: Alignment.topRight,
              child: ConfettiWidget(
                confettiController: _confettiController,
                blastDirection: 3 * pi / 4,
                emissionFrequency: 0.05,
                numberOfParticles: 15,
                gravity: 0.18,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTeamScoreCard({
    required ThemeData theme,
    required bool isDark,
    required String name,
    required String emoji,
    required int score,
    required Color color,
    required bool isWinner,
    required bool isTie,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      decoration: BoxDecoration(
        color: color.withAlpha(isWinner ? 45 : 18),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isWinner ? color : color.withAlpha(60),
          width: isWinner ? 2.5 : 1.2,
        ),
        boxShadow:
            isWinner
                ? [
                  BoxShadow(
                    color: color.withAlpha(90),
                    blurRadius: 14,
                    spreadRadius: 1,
                  ),
                ]
                : null,
      ),
      child: Column(
        children: [
          // Winner/Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color:
                  isWinner
                      ? color
                      : (isTie
                          ? Colors.amber.withAlpha(40)
                          : Colors.black.withAlpha(25)),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              isWinner ? "WINNER" : (isTie ? "TIED" : "RUNNER UP"),
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w900,
                letterSpacing: 0.5,
                color: isWinner ? Colors.black : theme.hintColor,
              ),
            ),
          ),
          const SizedBox(height: 10),

          // Team Name & Emoji
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(emoji, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                    color: theme.textTheme.bodyLarge?.color,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Score
          Text(
            "$score",
            style: TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 40,
              letterSpacing: -1,
              color: color,
            ),
          ),

          Text(
            score == 1 ? "POINT" : "POINTS",
            style: TextStyle(
              fontWeight: FontWeight.w800,
              fontSize: 11,
              letterSpacing: 1.0,
              color: theme.hintColor,
            ),
          ),
        ],
      ),
    );
  }
}
