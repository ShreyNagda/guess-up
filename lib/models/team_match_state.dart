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

  String teamCyanName;
  String teamCyanEmoji;
  String teamMagentaName;
  String teamMagentaEmoji;

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
    String? teamCyanName,
    String? teamCyanEmoji,
    String? teamMagentaName,
    String? teamMagentaEmoji,
  })  : _currentTeam = currentTeam,
        _teamCyanScore = teamCyanScore,
        _teamMagentaScore = teamMagentaScore,
        _currentRound = currentRound,
        _maxRounds = maxRounds,
        _isMatchFinished = isMatchFinished,
        _isTiebreaker = isTiebreaker,
        _lastPlayingTeam = lastPlayingTeam,
        teamCyanName = teamCyanName ?? AppTheme.teamAName,
        teamCyanEmoji = teamCyanEmoji ?? AppTheme.teamAEmoji,
        teamMagentaName = teamMagentaName ?? AppTheme.teamBName,
        teamMagentaEmoji = teamMagentaEmoji ?? AppTheme.teamBEmoji;

  // Getters
  TeamColor get currentTeam => _currentTeam;
  TeamColor? get lastPlayingTeam => _lastPlayingTeam;
  int get teamCyanScore => _teamCyanScore;
  int get teamMagentaScore => _teamMagentaScore;
  int get currentRound => _currentRound;
  int get maxRounds => _maxRounds;
  bool get isMatchFinished => _isMatchFinished;
  bool get isTiebreaker => _isTiebreaker;

  String get teamCyanDisplayName => "$teamCyanName $teamCyanEmoji".trim();
  String get teamMagentaDisplayName => "$teamMagentaName $teamMagentaEmoji".trim();

  String get currentTeamName =>
      _currentTeam == TeamColor.cyan
          ? teamCyanDisplayName
          : teamMagentaDisplayName;

  String get currentTeamOnlyName =>
      _currentTeam == TeamColor.cyan ? teamCyanName : teamMagentaName;

  String get currentTeamOnlyEmoji =>
      _currentTeam == TeamColor.cyan ? teamCyanEmoji : teamMagentaEmoji;

  String get nextTeamName =>
      _currentTeam == TeamColor.cyan
          ? teamMagentaDisplayName
          : teamCyanDisplayName;

  String get nextTeamOnlyName =>
      _currentTeam == TeamColor.cyan ? teamMagentaName : teamCyanName;

  String get nextTeamOnlyEmoji =>
      _currentTeam == TeamColor.cyan ? teamMagentaEmoji : teamCyanEmoji;

  String get winningTeamName =>
      winningTeam == TeamColor.cyan
          ? teamCyanDisplayName
          : teamMagentaDisplayName;

  String get winningTeamOnlyName =>
      winningTeam == TeamColor.cyan ? teamCyanName : teamMagentaName;

  String get winningTeamOnlyEmoji =>
      winningTeam == TeamColor.cyan ? teamCyanEmoji : teamMagentaEmoji;

  Color get currentTeamColor =>
      _currentTeam == TeamColor.cyan ? AppTheme.teamAColor : AppTheme.teamBColor;

  Color get nextTeamColor =>
      _currentTeam == TeamColor.cyan ? AppTheme.teamBColor : AppTheme.teamAColor;

  void updateTeamDetails({
    String? cyanName,
    String? cyanEmoji,
    String? magentaName,
    String? magentaEmoji,
  }) {
    if (cyanName != null && cyanName.trim().isNotEmpty) {
      teamCyanName = cyanName.trim();
    }
    if (cyanEmoji != null && cyanEmoji.trim().isNotEmpty) {
      teamCyanEmoji = cyanEmoji.trim();
    }
    if (magentaName != null && magentaName.trim().isNotEmpty) {
      teamMagentaName = magentaName.trim();
    }
    if (magentaEmoji != null && magentaEmoji.trim().isNotEmpty) {
      teamMagentaEmoji = magentaEmoji.trim();
    }
  }

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

