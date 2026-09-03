import 'package:equatable/equatable.dart';

abstract class GameState extends Equatable {
  const GameState();

  @override
  List<Object?> get props => [];
}

class GameInitialState extends GameState {}

class GamePrePositioningState extends GameState {
  final bool isFlat;
  const GamePrePositioningState({required this.isFlat});

  @override
  List<Object?> get props => [isFlat];
}

class GameCountdownState extends GameState {
  final int secondsRemaining;
  const GameCountdownState(this.secondsRemaining);

  @override
  List<Object?> get props => [secondsRemaining];
}

class GamePlayingState extends GameState {
  final String currentWord;
  final int score;
  final int currentStreak;
  final int remainingSeconds;
  final double timerProgress;
  final String? feedbackMessage;
  final bool isPaused;

  const GamePlayingState({
    required this.currentWord,
    required this.score,
    required this.currentStreak,
    required this.remainingSeconds,
    required this.timerProgress,
    this.feedbackMessage,
    this.isPaused = false,
  });

  @override
  List<Object?> get props => [
        currentWord,
        score,
        currentStreak,
        remainingSeconds,
        timerProgress,
        feedbackMessage,
        isPaused,
      ];
}

class GameOverState extends GameState {
  final int finalScore;
  final Map<String, String> scoreMap;

  const GameOverState({
    required this.finalScore,
    required this.scoreMap,
  });

  @override
  List<Object?> get props => [finalScore, scoreMap];
}
