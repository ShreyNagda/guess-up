import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/models/category.dart';
import 'package:guess_up/models/team_match_state.dart';
import 'package:guess_up/screens/game_screen.dart';
import 'package:guess_up/services/audio_service.dart';
import 'package:guess_up/theme/app_theme.dart';

class TeamPassScreen extends StatefulWidget {
  final TeamMatchState teamState;
  final int lastRoundScore;
  final int time;
  final List<Category> selectedCategories;

  const TeamPassScreen({
    super.key,
    required this.teamState,
    required this.lastRoundScore,
    required this.time,
    required this.selectedCategories,
  });

  @override
  State<TeamPassScreen> createState() => _TeamPassScreenState();
}

class _TeamPassScreenState extends State<TeamPassScreen> {
  @override
  void initState() {
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    AudioService().extraLightImpact();
  }

  void _startNextTurn() {
    AudioService().extraLightImpact();
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

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final state = widget.teamState;

    final nextTeamColor = state.currentTeamColor;

    return Scaffold(
      backgroundColor: theme.scaffoldBackgroundColor,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Spacer(),

              // Round End Header
              Text(
                state.isTiebreaker
                    ? "⚡ SUDDEN DEATH TIEBREAKER! ⚡"
                    : "ROUND ${state.currentRound} COMPLETE!",
                style: theme.textTheme.labelMedium?.copyWith(
                  fontWeight: FontWeight.w900,
                  letterSpacing: 2,
                  color:
                      state.isTiebreaker
                          ? Colors.deepOrangeAccent
                          : theme.hintColor,
                ),
              ),
              const SizedBox(height: 10),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  "+${widget.lastRoundScore} POINTS! 💥",
                  style: theme.textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w900,
                    fontSize: 36,
                    color: Colors.amber,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Match Scoreboard Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: theme.cardColor,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: theme.dividerColor.withAlpha(50)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(isDark ? 50 : 20),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Text(
                      state.isTiebreaker
                          ? "MATCH STANDINGS (TIEBREAKER OVERTIME)"
                          : "MATCH STANDINGS (ROUND ${state.currentRound}/${state.maxRounds})",
                      style: theme.textTheme.labelSmall?.copyWith(
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.5,
                        color: theme.hintColor,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        // Team A Card (Cyan)
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.teamAColor.withAlpha(30),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color:
                                    state.currentTeam == TeamColor.cyan
                                        ? AppTheme.teamAColor
                                        : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  "${AppTheme.teamAName} ${AppTheme.teamAEmoji}",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  "${state.teamCyanScore}",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 32,
                                    color: AppTheme.teamAColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        // Team B Card (Magenta)
                        Expanded(
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: AppTheme.teamBColor.withAlpha(30),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color:
                                    state.currentTeam == TeamColor.magenta
                                        ? AppTheme.teamBColor
                                        : Colors.transparent,
                                width: 2,
                              ),
                            ),
                            child: Column(
                              children: [
                                Text(
                                  "${AppTheme.teamBName} ${AppTheme.teamBEmoji}",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  "${state.teamMagentaScore}",
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 32,
                                    color: AppTheme.teamBColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Pass Prompt Banner
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: nextTeamColor.withAlpha(40),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: nextTeamColor.withAlpha(100)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.phonelink_ring_rounded, size: 24),
                    const SizedBox(width: 10),
                    Text(
                      "PASS PHONE TO ${state.currentTeamName.toUpperCase()}",
                      style: TextStyle(
                        fontWeight: FontWeight.w900,
                        fontSize: 14,
                        color: nextTeamColor,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              // Action CTA Button
              SizedBox(
                width: double.infinity,
                height: 62,
                child: ElevatedButton(
                  onPressed: _startNextTurn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: nextTeamColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                    elevation: 6,
                  ),
                  child: Text(
                    state.isTiebreaker
                        ? "START ${state.currentTeamName.toUpperCase()}'S TIEBREAKER"
                        : "START ${state.currentTeamName.toUpperCase()}'S TURN",
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
