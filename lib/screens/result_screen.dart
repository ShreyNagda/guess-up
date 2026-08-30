import 'package:confetti/confetti.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/screens/home_screen.dart';
import 'package:guess_up/screens/team_pass_screen.dart';
import 'package:guess_up/screens/team_winner_screen.dart';
import 'package:guess_up/services/word_history_service.dart';
import 'package:guess_up/theme/app_theme.dart';
import 'package:guess_up/widgets/ambient_background.dart';

class ResultScreen extends StatefulWidget {
  final int score;
  final int time;
  final Map<String, String> scoreMap;
  final List<Category>? selectedCategories;
  final TeamMatchState? teamMatchState;

  const ResultScreen({
    super.key,
    required this.score,
    required this.time,
    required this.scoreMap,
    this.selectedCategories,
    this.teamMatchState,
  });

  @override
  State<ResultScreen> createState() => _ResultScreenState();
}

class _ResultScreenState extends State<ResultScreen> {
  late ConfettiController _confettiController;
  int _correctCount = 0;
  int _passCount = 0;
  bool _hasRecordedTeamTurn = false;

  @override
  void initState() {
    super.initState();
    _setPortraitOrientation();
    _confettiController = ConfettiController(
      duration: const Duration(seconds: 4),
    );

    _calculateStatsAndSaveHistory();

    final isTeam = widget.teamMatchState != null;
    final shouldPlayConfetti =
        isTeam ? (widget.teamMatchState!.isMatchFinished) : (widget.score >= 3);

    if (shouldPlayConfetti) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Future.delayed(const Duration(milliseconds: 250), () {
          if (mounted) {
            _confettiController.play();
          }
        });
      });
    }
  }

  void _calculateStatsAndSaveHistory() {
    int correct = 0;
    int passed = 0;
    final List<String> shownWords = [];

    widget.scoreMap.forEach((key, value) {
      shownWords.add(key);
      if (value == "Correct") {
        correct++;
      } else if (value == "Pass") {
        passed++;
      }
    });
    _correctCount = correct;
    _passCount = passed;

    if (widget.selectedCategories != null && shownWords.isNotEmpty) {
      for (final cat in widget.selectedCategories!) {
        final relevantWords =
            shownWords.where((w) => cat.words.contains(w)).toList();
        if (relevantWords.isNotEmpty) {
          WordHistoryService.markWordsAsPlayed(
            cat.id,
            relevantWords,
            totalDeckWords: cat.words.length,
          );
        }
      }
    }

    if (widget.teamMatchState != null && !_hasRecordedTeamTurn) {
      _hasRecordedTeamTurn = true;
      widget.teamMatchState!.recordRoundScore(widget.score);
      widget.teamMatchState!.advanceTurn();
    }
  }

  void _setLandscapeOrientation() {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
  }

  void _setPortraitOrientation() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _setLandscapeOrientation();
    super.dispose();
  }

  void _handleShowWinnerScreen() {
    final teamState = widget.teamMatchState;
    if (teamState == null) return;
    _setPortraitOrientation();
    Navigator.of(context).pushReplacement(
      CupertinoPageRoute(
        builder:
            (_) => TeamWinnerScreen(
              teamState: teamState,
              selectedCategories: widget.selectedCategories ?? [],
              time: widget.time,
              lastRoundScoreMap: widget.scoreMap,
              lastRoundScore: widget.score,
            ),
      ),
    );
  }

  void _handleNextAction() {
    final teamState = widget.teamMatchState;

    if (teamState != null) {
      if (teamState.isMatchFinished) {
        _handleShowWinnerScreen();
      } else {
        _setPortraitOrientation();
        Navigator.of(context).pushReplacement(
          CupertinoPageRoute(
            builder:
                (_) => TeamPassScreen(
                  teamState: teamState,
                  lastRoundScore: widget.score,
                  time: widget.time,
                  selectedCategories: widget.selectedCategories ?? [],
                ),
          ),
        );
      }
    } else {
      _setLandscapeOrientation();
      Navigator.of(context).pushReplacement(
        CupertinoPageRoute(
          builder:
              (_) => GameScreen(
                time: widget.time,
                selectedCategories: widget.selectedCategories ?? [],
                teamMatchState: null,
              ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final teamState = widget.teamMatchState;
    final isTeamMatchComplete = teamState?.isMatchFinished == true;

    final answeredWords =
        widget.scoreMap.entries
            .where((e) => e.value == "Correct" || e.value == "Pass")
            .toList();

    String titleText = "GREAT JOB!";
    if (isTeamMatchComplete && teamState != null) {
      titleText = "FINAL ROUND COMPLETE!";
    } else if (teamState != null) {
      titleText = "ROUND ${teamState.currentRound} COMPLETE!";
    } else if (widget.score <= 3) {
      titleText = "GAME OVER";
    }

    return Scaffold(
      body: AmbientBackground(
        ambientColor: isDark ? Colors.amber : theme.colorScheme.primary,
        child: Stack(
          children: [
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20.0,
                  vertical: 12.0,
                ),
              child: Column(
                children: [
                  // ==========================================
                  // 1. TOP PART: Title, Score & Stat Badges
                  // ==========================================
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Title
                      Flexible(
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text(
                            titleText,
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w900,
                              fontSize: 24,
                              color:
                                  isDark
                                      ? Colors.amber
                                      : theme.colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),

                      // Score & Stat Pill Badge
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: theme.cardColor,
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: (isDark
                                    ? Colors.amber
                                    : theme.colorScheme.primary)
                                .withAlpha(90),
                            width: 2,
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              isTeamMatchComplete && teamState != null
                                  ? "MATCH: ${teamState.teamCyanScore} - ${teamState.teamMagentaScore}"
                                  : "SCORE: ${widget.score}",
                              style: theme.textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w900,
                                fontSize: 19,
                                letterSpacing: 0.5,
                              ),
                            ),
                            const SizedBox(width: 14),

                            // Green ✓ Stat Pill
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.green.withAlpha(45),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                "✓ $_correctCount",
                                style: const TextStyle(
                                  color: Colors.greenAccent,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                            const SizedBox(width: 8),

                            // Red ✗ Stat Pill
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.red.withAlpha(45),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                "✗ $_passCount",
                                style: const TextStyle(
                                  color: Colors.redAccent,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // ==========================================
                  // 2. MIDDLE PART: Answered Words (Larger & Clearer)
                  // ==========================================
                  Expanded(
                    child: Container(
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: theme.cardColor.withAlpha(isDark ? 100 : 200),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: theme.dividerColor.withAlpha(50),
                          width: 1.5,
                        ),
                      ),
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.only(
                              left: 4.0,
                              bottom: 10.0,
                            ),
                            child: Text(
                              "WORD BREAKDOWN (${answeredWords.length})",
                              style: theme.textTheme.labelSmall?.copyWith(
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.8,
                                fontSize: 12,
                                color: theme.hintColor,
                              ),
                            ),
                          ),
                          Expanded(
                            child:
                                answeredWords.isEmpty
                                    ? const Center(
                                      child: Text(
                                        "No words answered",
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 16,
                                        ),
                                      ),
                                    )
                                    : SingleChildScrollView(
                                      physics: const BouncingScrollPhysics(),
                                      child: Wrap(
                                        spacing: 10,
                                        runSpacing: 10,
                                        children:
                                            answeredWords.map((entry) {
                                              final word = entry.key;
                                              final isCorrect =
                                                  entry.value == "Correct";
                                              return Container(
                                                padding:
                                                    const EdgeInsets.symmetric(
                                                      horizontal: 14,
                                                      vertical: 9,
                                                    ),
                                                decoration: BoxDecoration(
                                                  color:
                                                      isCorrect
                                                          ? Colors.green
                                                              .withAlpha(45)
                                                          : Colors.red
                                                              .withAlpha(45),
                                                  borderRadius:
                                                      BorderRadius.circular(14),
                                                  border: Border.all(
                                                    color:
                                                        isCorrect
                                                            ? Colors.greenAccent
                                                                .withAlpha(140)
                                                            : Colors.redAccent
                                                                .withAlpha(140),
                                                    width: 1.5,
                                                  ),
                                                ),
                                                child: Row(
                                                  mainAxisSize:
                                                      MainAxisSize.min,
                                                  children: [
                                                    Icon(
                                                      isCorrect
                                                          ? Icons
                                                              .check_circle_rounded
                                                          : Icons
                                                              .cancel_rounded,
                                                      size: 20,
                                                      color:
                                                          isCorrect
                                                              ? Colors
                                                                  .greenAccent
                                                              : Colors
                                                                  .redAccent,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Flexible(
                                                      child: Text(
                                                        word,
                                                        maxLines: 1,
                                                        overflow:
                                                            TextOverflow
                                                                .ellipsis,
                                                        style: TextStyle(
                                                          fontWeight:
                                                              FontWeight.w800,
                                                          fontSize: 17,
                                                          letterSpacing: 0.3,
                                                          color:
                                                              theme
                                                                  .textTheme
                                                                  .bodyMedium
                                                                  ?.color,
                                                        ),
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                              );
                                            }).toList(),
                                      ),
                                    ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  // ==========================================
                  // 3. BOTTOM PART: Action Buttons & Controls
                  // ==========================================
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: SizedBox(
                          height: 52,
                          child: ElevatedButton.icon(
                            onPressed: _handleNextAction,
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  isTeamMatchComplete && teamState != null
                                      ? (teamState.isTie
                                          ? Colors.deepOrangeAccent
                                          : (teamState.winningTeam ==
                                                  TeamColor.cyan
                                              ? AppTheme.teamAColor
                                              : AppTheme.teamBColor))
                                      : (isDark
                                          ? Colors.amber
                                          : theme.colorScheme.primary),
                              foregroundColor:
                                  isTeamMatchComplete && teamState != null
                                      ? (teamState.isTie
                                          ? Colors.white
                                          : Colors.black87)
                                      : (isDark ? Colors.black : Colors.white),
                              elevation: 2,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            icon: Icon(
                              isTeamMatchComplete
                                  ? Icons.emoji_events_rounded
                                  : (teamState != null &&
                                          !teamState.isMatchFinished
                                      ? Icons.phone_forwarded_rounded
                                      : Icons.replay_rounded),
                              size: 22,
                            ),
                            label: Text(
                              isTeamMatchComplete
                                  ? "ANNOUNCE WINNER"
                                  : (teamState != null &&
                                          !teamState.isMatchFinished
                                      ? "PASS PHONE"
                                      : "PLAY AGAIN"),
                              style: const TextStyle(
                                fontWeight: FontWeight.w900,
                                fontSize: 15,
                                letterSpacing: 1.1,
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        flex: 2,
                        child: SizedBox(
                          height: 52,
                          child: OutlinedButton(
                            onPressed: () {
                              _setPortraitOrientation();
                              Navigator.of(context).pushReplacement(
                                CupertinoPageRoute(
                                  builder: (_) => const HomeScreen(),
                                ),
                              );
                            },
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(
                                color: (isDark
                                        ? Colors.amber
                                        : theme.colorScheme.primary)
                                    .withAlpha(120),
                                width: 2,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(16),
                              ),
                            ),
                            child: const Icon(Icons.home_rounded, size: 22),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // --- Confetti Celebration Overlay ---
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              shouldLoop: false,
              numberOfParticles: 30,
              gravity: 0.2,
            ),
          ),
        ],
      ),
    ),
    );
  }
}
