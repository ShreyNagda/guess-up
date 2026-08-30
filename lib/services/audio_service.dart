import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:guess_up/services/storage_service.dart';
import 'package:vibration/vibration.dart';

class AudioService with WidgetsBindingObserver {
  // Singleton pattern
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;

  AudioService._internal() {
    // Register lifecycle observer to handle background/foreground changes
    WidgetsBinding.instance.addObserver(this);
  }

  final AudioPlayer _musicPlayer = AudioPlayer();
  final AudioPlayer _sfxPlayer = AudioPlayer();

  // Initialize audio players
  Future<void> init() async {
    final AudioContext audioContext = AudioContext(
      iOS: AudioContextIOS(
        category: AVAudioSessionCategory.playback,
        options: {AVAudioSessionOptions.mixWithOthers},
      ),
      android: AudioContextAndroid(
        isSpeakerphoneOn: true,
        stayAwake: true,
        contentType: AndroidContentType.music,
        usageType: AndroidUsageType.game,
        audioFocus: AndroidAudioFocus.none,
      ),
    );

    // Apply context to global and player instances
    await AudioPlayer.global.setAudioContext(audioContext);
    await _musicPlayer.setAudioContext(audioContext);
    await _sfxPlayer.setAudioContext(audioContext);

    // Configure release modes
    await _musicPlayer.setReleaseMode(ReleaseMode.loop);
    await _sfxPlayer.setReleaseMode(ReleaseMode.stop);

    // Start music if enabled
    if (StorageService().isMusicEnabled) {
      await playBackgroundMusic();
    }
  }

  // --- Lifecycle Handling (Pause on Background) ---
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      _musicPlayer.pause();
    } else if (state == AppLifecycleState.resumed) {
      if (StorageService().isMusicEnabled) {
        playBackgroundMusic();
      }
    }
  }

  // --- Music Control ---
  Future<void> playBackgroundMusic({bool forceRestart = false}) async {
    if (!StorageService().isMusicEnabled) return;

    try {
      if (_musicPlayer.state == PlayerState.playing && !forceRestart) return;

      await _musicPlayer.setReleaseMode(ReleaseMode.loop);
      await _musicPlayer.setVolume(0.4);
      await _musicPlayer.play(AssetSource('sounds/background.ogg'));
    } catch (e) {
      debugPrint("Error playing background music: $e");
    }
  }

  Future<void> pauseBackgroundMusic() async {
    await _musicPlayer.pause();
  }

  Future<void> stopBackgroundMusic() async {
    await _musicPlayer.stop();
  }

  Future<void> toggleMusic(bool isEnabled) async {
    if (isEnabled) {
      await playBackgroundMusic();
    } else {
      await stopBackgroundMusic();
    }
  }

  // --- SFX Control ---
  Future<void> _playSfx(String path) async {
    if (!StorageService().isSfxEnabled) return;

    try {
      // We don't strictly need to stop() for overlapping SFX,
      // but it keeps it clean.
      if (_sfxPlayer.state == PlayerState.playing) {
        await _sfxPlayer.stop();
      }
      await _sfxPlayer.play(AssetSource(path), volume: 1.0);
    } catch (e) {
      print("Error playing SFX: $e");
    }
  }

  void playCorrect() => _playSfx('sounds/correct_sound.ogg');
  void playPass() => _playSfx('sounds/pass_sound.ogg');
  void playStartCountdown() => _playSfx('sounds/start_beep.ogg');
  void playEndingCountdown() => _playSfx('sounds/end_beep.ogg');
  void playStreakSound() {
    _playSfx('sounds/correct_sound.ogg');
    heavyImpact();
  }

  // --- Haptics Control ---
  Future<void> vibrate(int duration) async {
    if (!StorageService().isHapticsEnabled) return;

    bool? hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(duration: duration);
    }
  }

  void heavyImpact() => vibrate(800);
  void mediumImpact() => vibrate(500);
  void lightImpact() => vibrate(300);
  void extraLightImpact() => vibrate(100);

  // Dispose observer
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
  }
}
