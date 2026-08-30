import 'package:flutter/material.dart';
import 'package:guess_up/theme/app_theme.dart';

enum TeamColor { cyan, magenta }

class TeamMatchState {
  final bool isTeamMode;
  TeamColor currentTeam;
  int teamCyanScore;
  int teamMagentaScore;
  int currentRound;
  int maxRounds;
  bool isMatchFinished;
  bool isTiebreaker;

  TeamMatchState({
    this.isTeamMode = false,
    this.currentTeam = TeamColor.cyan,
    this.teamCyanScore = 0,
    this.teamMagentaScore = 0,
    this.currentRound = 1,
    this.maxRounds = 3,
    this.isMatchFinished = false,
    this.isTiebreaker = false,
  });

  String get currentTeamName =>
      currentTeam == TeamColor.cyan
          ? "${AppTheme.teamAName} ${AppTheme.teamAEmoji}"
          : "${AppTheme.teamBName} ${AppTheme.teamBEmoji}";

  String get nextTeamName =>
      currentTeam == TeamColor.cyan
          ? "${AppTheme.teamBName} ${AppTheme.teamBEmoji}"
          : "${AppTheme.teamAName} ${AppTheme.teamAEmoji}";

  Color get currentTeamColor =>
      currentTeam == TeamColor.cyan ? AppTheme.teamAColor : AppTheme.teamBColor;

  Color get nextTeamColor =>
      currentTeam == TeamColor.cyan ? AppTheme.teamBColor : AppTheme.teamAColor;

  void recordRoundScore(int score) {
    if (currentTeam == TeamColor.cyan) {
      teamCyanScore += score;
    } else {
      teamMagentaScore += score;
    }
  }

  void startTiebreaker() {
    isTiebreaker = true;
    maxRounds = currentRound + 1;
    currentRound = maxRounds;
    currentTeam = TeamColor.cyan;
    isMatchFinished = false;
  }

  void advanceTurn() {
    if (currentTeam == TeamColor.magenta) {
      if (currentRound >= maxRounds) {
        isMatchFinished = true;
      } else {
        currentRound++;
        currentTeam = TeamColor.cyan;
      }
    } else {
      currentTeam = TeamColor.magenta;
    }
  }

  bool get isTie => teamCyanScore == teamMagentaScore;

  TeamColor get winningTeam {
    if (teamCyanScore > teamMagentaScore) return TeamColor.cyan;
    return TeamColor.magenta;
  }

  void resetMatch({int? newMaxRounds}) {
    currentTeam = TeamColor.cyan;
    teamCyanScore = 0;
    teamMagentaScore = 0;
    currentRound = 1;
    if (newMaxRounds != null) {
      maxRounds = newMaxRounds;
    }
    isMatchFinished = false;
    isTiebreaker = false;
  }
}
