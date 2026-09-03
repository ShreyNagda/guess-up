import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:guess_up/blocs/game/game_state.dart';

class GameCubit extends Cubit<GameState> {
  final int initialTimeSeconds;
  final List<String> words;

  int _score = 0;
  int _currentIndex = 0;
  int _streak = 0;
  int _consecutivePasses = 0;
  int _remainingTime;
  Timer? _timer;
  Timer? _countdownTimer;
  final Map<String, String> _scoreMap = {};

  GameCubit({
    required this.initialTimeSeconds,
    required this.words,
  })  : _remainingTime = initialTimeSeconds,
        super(GameInitialState());

  void setPrePositioning({required bool isFlat}) {
    if (state is GameInitialState || state is GamePrePositioningState) {
      emit(GamePrePositioningState(isFlat: isFlat));
    }
  }

  void startPreGameCountdown() {
    if (state is GameCountdownState || state is GamePlayingState) return;

    int countdown = 3;
    emit(GameCountdownState(countdown));

    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      countdown--;
      if (countdown > 0) {
        emit(GameCountdownState(countdown));
      } else {
        timer.cancel();
        _startGameLoop();
      }
    });
  }

  void _startGameLoop() {
    _emitPlaying();
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _remainingTime--;
      if (_remainingTime <= 0) {
        timer.cancel();
        emit(GameOverState(finalScore: _score, scoreMap: _scoreMap));
      } else {
        _emitPlaying();
      }
    });
  }

  void answerCorrect() {
    if (state is! GamePlayingState || _currentIndex >= words.length) return;

    final currentWord = words[_currentIndex];
    _scoreMap[currentWord] = "Correct";
    _streak++;
    _consecutivePasses = 0;

    int points = 1;
    String feedback = "CORRECT! +1";
    if (_streak >= 5) {
      points = 3;
      feedback = "ON FIRE! 🔥🔥 +3";
    } else if (_streak >= 3) {
      points = 2;
      feedback = "HOT STREAK! 🔥 +2";
    }

    _score += points;
    _currentIndex++;

    _emitPlaying(feedback: feedback);
  }

  void answerPass() {
    if (state is! GamePlayingState || _currentIndex >= words.length) return;

    final currentWord = words[_currentIndex];
    _scoreMap[currentWord] = "Pass";
    _streak = 0;
    _consecutivePasses++;

    String feedback = "PASS";
    if (_consecutivePasses >= 5) {
      _consecutivePasses = 0;
      _score = (_score - 1).clamp(0, 9999);
      feedback = "5 PASSES! ⚠️ -1";
    }

    _currentIndex++;
    _emitPlaying(feedback: feedback);
  }

  void togglePause() {
    if (state is! GamePlayingState) return;
    final currentState = state as GamePlayingState;

    if (currentState.isPaused) {
      _startGameLoop();
    } else {
      _timer?.cancel();
      emit(GamePlayingState(
        currentWord: currentState.currentWord,
        score: currentState.score,
        currentStreak: currentState.currentStreak,
        remainingSeconds: currentState.remainingSeconds,
        timerProgress: currentState.timerProgress,
        isPaused: true,
      ));
    }
  }

  void _emitPlaying({String? feedback}) {
    if (_currentIndex >= words.length) {
      emit(GameOverState(finalScore: _score, scoreMap: _scoreMap));
      return;
    }

    emit(GamePlayingState(
      currentWord: words[_currentIndex],
      score: _score,
      currentStreak: _streak,
      remainingSeconds: _remainingTime,
      timerProgress: initialTimeSeconds > 0 ? _remainingTime / initialTimeSeconds : 0.0,
      feedbackMessage: feedback,
      isPaused: false,
    ));
  }

  @override
  Future<void> close() {
    _timer?.cancel();
    _countdownTimer?.cancel();
    return super.close();
  }
}
