import 'package:flutter/material.dart';
import 'package:guess_up/theme/app_theme.dart';

enum TeamColor { cyan, magenta }

class TeamMatchState {
  final bool isTeamMode;
  TeamColor _currentTeam;
  TeamColor? _lastPlayingTeam;
  int _teamCyanScore;
  int _teamMagentaScore;
  int _currentRound;
  int _maxRounds;
  bool _isMatchFinished;
  bool _isTiebreaker;

  TeamMatchState({
    this.isTeamMode = false,
    TeamColor currentTeam = TeamColor.cyan,
    int teamCyanScore = 0,
    int teamMagentaScore = 0,
    int currentRound = 1,
    int maxRounds = 3,
    bool isMatchFinished = false,
    bool isTiebreaker = false,
    TeamColor? lastPlayingTeam,
  })  : _currentTeam = currentTeam,
        _teamCyanScore = teamCyanScore,
        _teamMagentaScore = teamMagentaScore,
        _currentRound = currentRound,
        _maxRounds = maxRounds,
        _isMatchFinished = isMatchFinished,
        _isTiebreaker = isTiebreaker,
        _lastPlayingTeam = lastPlayingTeam;

  // Getters
  TeamColor get currentTeam => _currentTeam;
  TeamColor? get lastPlayingTeam => _lastPlayingTeam;
  int get teamCyanScore => _teamCyanScore;
  int get teamMagentaScore => _teamMagentaScore;
  int get currentRound => _currentRound;
  int get maxRounds => _maxRounds;
  bool get isMatchFinished => _isMatchFinished;
  bool get isTiebreaker => _isTiebreaker;

  String get currentTeamName =>
      _currentTeam == TeamColor.cyan
          ? "${AppTheme.teamAName} ${AppTheme.teamAEmoji}"
          : "${AppTheme.teamBName} ${AppTheme.teamBEmoji}";

  String get nextTeamName =>
      _currentTeam == TeamColor.cyan
          ? "${AppTheme.teamBName} ${AppTheme.teamBEmoji}"
          : "${AppTheme.teamAName} ${AppTheme.teamAEmoji}";

  Color get currentTeamColor =>
      _currentTeam == TeamColor.cyan ? AppTheme.teamAColor : AppTheme.teamBColor;

  Color get nextTeamColor =>
      _currentTeam == TeamColor.cyan ? AppTheme.teamBColor : AppTheme.teamAColor;

  void recordRoundScore(int score) {
    _lastPlayingTeam = _currentTeam;
    if (_currentTeam == TeamColor.cyan) {
      _teamCyanScore += score;
    } else {
      _teamMagentaScore += score;
    }
  }

  /// Adjust score of the team that played the last round (or current team if not recorded yet)
  void adjustLastTeamScore(int scoreDiff) {
    final targetTeam = _lastPlayingTeam ?? _currentTeam;
    if (targetTeam == TeamColor.cyan) {
      _teamCyanScore = (_teamCyanScore + scoreDiff).clamp(0, 9999);
    } else {
      _teamMagentaScore = (_teamMagentaScore + scoreDiff).clamp(0, 9999);
    }
  }

  void startTiebreaker() {
    _isTiebreaker = true;
    _maxRounds = _currentRound + 1;
    _currentRound = _maxRounds;
    _currentTeam = TeamColor.cyan;
    _isMatchFinished = false;
  }

  void advanceTurn() {
    if (_currentTeam == TeamColor.magenta) {
      if (_currentRound >= _maxRounds) {
        _isMatchFinished = true;
      } else {
        _currentRound++;
        _currentTeam = TeamColor.cyan;
      }
    } else {
      _currentTeam = TeamColor.magenta;
    }
  }

  bool get isTie => _teamCyanScore == _teamMagentaScore;

  TeamColor get winningTeam {
    if (_teamCyanScore > _teamMagentaScore) return TeamColor.cyan;
    return TeamColor.magenta;
  }

  void resetMatch({int? newMaxRounds}) {
    _currentTeam = TeamColor.cyan;
    _lastPlayingTeam = null;
    _teamCyanScore = 0;
    _teamMagentaScore = 0;
    _currentRound = 1;
    if (newMaxRounds != null) {
      _maxRounds = newMaxRounds;
    }
    _isMatchFinished = false;
    _isTiebreaker = false;
  }
}
