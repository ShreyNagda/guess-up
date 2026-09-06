import 'package:flame_audio/flame_audio.dart';
import 'package:flutter/material.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:vibration/vibration.dart';

class GameAudioEngine with WidgetsBindingObserver {
  static final GameAudioEngine _instance = GameAudioEngine._internal();
  factory GameAudioEngine() => _instance;

  GameAudioEngine._internal() {
    WidgetsBinding.instance.addObserver(this);
  }

  bool _isInitialized = false;
  bool _bgmInitialized = false;
  bool _shouldPlayMusic = true;
  bool _wasMusicPlayingBeforePause = false;
  bool _isBgmPlaying = false;
  bool _isGameActive = false;
  bool _hasVibrator = false;

  static const List<String> _sfxFiles = [
    'assets/sounds/correct_sound.ogg',
    'assets/sounds/pass_sound.ogg',
    'assets/sounds/start_beep.ogg',
    'assets/sounds/end_beep.ogg',
  ];

  Future<void> init() async {
    if (_isInitialized) return;
    _isInitialized = true;

    // 1. Cache vibrator hardware capability in background
    try {
      _hasVibrator = await Vibration.hasVibrator() == true;
    } catch (_) {
      _hasVibrator = false;
    }

    // 2. Pre-load SFX assets and initialize Flame BGM
    Future.microtask(() async {
      try {
        FlameAudio.audioCache.prefix = '';
        await FlameAudio.audioCache.loadAll(_sfxFiles);
      } catch (e) {
        debugPrint("Warning preloading Flame audio assets: $e");
      }

      try {
        FlameAudio.bgm.initialize();
        _bgmInitialized = true;

        if (GameStorageService().isMusicEnabled &&
            _shouldPlayMusic &&
            !_isGameActive) {
          await startBgm();
        }
      } catch (e) {
        _bgmInitialized = false;
        debugPrint("Warning initializing Flame BGM engine: $e");
      }
    });
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    try {
      if (!_bgmInitialized) return;

      if (state == AppLifecycleState.paused ||
          state == AppLifecycleState.inactive) {
        if (_wasMusicPlayingBeforePause) return;
        _wasMusicPlayingBeforePause = true;
        FlameAudio.bgm.pause();
        _isBgmPlaying = false;
      } else if (state == AppLifecycleState.resumed) {
        if (GameStorageService().isMusicEnabled &&
            _shouldPlayMusic &&
            !_isGameActive) {
          if (_wasMusicPlayingBeforePause) {
            _wasMusicPlayingBeforePause = false;
            resumeBgm();
          } else {
            startBgm();
          }
        }
      }
    } catch (e) {
      debugPrint("Warning in audio didChangeAppLifecycleState: $e");
    }
  }

  // --- Background Music ---
  Future<void> startBgm() async {
    _shouldPlayMusic = true;
    if (!GameStorageService().isMusicEnabled || !_bgmInitialized) return;
    if (_isGameActive) return;

    if (_isBgmPlaying || FlameAudio.bgm.isPlaying) {
      _isBgmPlaying = true;
      return;
    }

    try {
      await FlameAudio.bgm.play('assets/sounds/background.ogg', volume: 0.4);
      _isBgmPlaying = true;
    } catch (e) {
      debugPrint("Error starting BGM: $e");
    }
  }

  Future<void> pauseBgm() async {
    _shouldPlayMusic = false;
    _isBgmPlaying = false;
    if (!_bgmInitialized) return;
    try {
      await FlameAudio.bgm.pause();
    } catch (e) {
      debugPrint("Error pausing BGM: $e");
    }
  }

  Future<void> resumeBgm() async {
    _shouldPlayMusic = true;
    if (!GameStorageService().isMusicEnabled || !_bgmInitialized) return;
    if (_isGameActive) return;

    if (_isBgmPlaying || FlameAudio.bgm.isPlaying) {
      _isBgmPlaying = true;
      return;
    }

    try {
      await FlameAudio.bgm.resume();
      _isBgmPlaying = true;
    } catch (e) {
      await startBgm();
    }
  }

  Future<void> stopBgm() async {
    _shouldPlayMusic = false;
    _isBgmPlaying = false;
    if (!_bgmInitialized) return;
    try {
      await FlameAudio.bgm.stop();
    } catch (e) {
      debugPrint("Error stopping BGM: $e");
    }
  }

  /// Controls BGM active state according to gameplay lifecycle.
  /// When active is true (active gameplay): BGM is paused.
  /// When active is false (paused or non-game UI): BGM is resumed.
  void setGameActive(bool active) {
    _isGameActive = active;
    if (active) {
      pauseBgm();
    } else {
      if (GameStorageService().isMusicEnabled) {
        startBgm();
      }
    }
  }

  // --- Low Latency SFX ---
  void playCorrectSfx() {
    if (!GameStorageService().isSfxEnabled) return;
    try {
      FlameAudio.play('assets/sounds/correct_sound.ogg', volume: 1.0);
    } catch (e) {
      debugPrint("Error playing correct SFX: $e");
    }
  }

  void playPassSfx() {
    if (!GameStorageService().isSfxEnabled) return;
    try {
      FlameAudio.play('assets/sounds/pass_sound.ogg', volume: 1.0);
    } catch (e) {
      debugPrint("Error playing pass SFX: $e");
    }
  }

  void playStartBeep() {
    if (!GameStorageService().isSfxEnabled) return;
    try {
      FlameAudio.play('assets/sounds/start_beep.ogg', volume: 1.0);
    } catch (e) {
      debugPrint("Error playing start beep: $e");
    }
  }

  void playEndBeep() {
    if (!GameStorageService().isSfxEnabled) return;
    try {
      FlameAudio.play('assets/sounds/end_beep.ogg', volume: 1.0);
    } catch (e) {
      debugPrint("Error playing end beep: $e");
    }
  }

  void playStreakSfx() {
    playCorrectSfx();
    heavyImpact();
  }

  // --- Haptics ---
  void vibrate(int duration) {
    if (!GameStorageService().isHapticsEnabled || !_hasVibrator) return;
    try {
      Vibration.vibrate(duration: duration);
    } catch (_) {}
  }

  void heavyImpact() => vibrate(800);
  void mediumImpact() => vibrate(500);
  void lightImpact() => vibrate(300);
  void extraLightImpact() => vibrate(100);

  void dispose() {
    try {
      WidgetsBinding.instance.removeObserver(this);
      FlameAudio.bgm.dispose();
    } catch (_) {}
  }
}
