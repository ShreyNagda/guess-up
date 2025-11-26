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
    // --- 1. Configure Audio Context (The Fix) ---
    // This tells the OS: "Mix my sounds together, don't stop music for SFX"
    final AudioContext audioContext = AudioContext(
      iOS: AudioContextIOS(
        category:
            AVAudioSessionCategory.multiRoute, // Ambient = Mix with others
        options: {
          AVAudioSessionOptions.mixWithOthers, // Crucial for iOS mixing
        },
      ),
      android: AudioContextAndroid(
        isSpeakerphoneOn: true,
        stayAwake: true,
        contentType: AndroidContentType.music,
        usageType: AndroidUsageType.game,
        audioFocus:
            AndroidAudioFocus.none, // 'None' prevents SFX from killing Music
      ),
    );

    // Apply this context globally to all players
    await AudioPlayer.global.setAudioContext(audioContext);

    // Configure players
    await _musicPlayer.setReleaseMode(ReleaseMode.loop); // Loop music
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
      // App went to background (or screen locked) -> Pause Music
      _musicPlayer.pause();
    } else if (state == AppLifecycleState.resumed) {
      // App came back -> Resume Music (if user wants it)
      if (StorageService().isMusicEnabled) {
        _musicPlayer.resume();
      }
    }
  }

  // --- Music Control ---
  Future<void> playBackgroundMusic() async {
    if (!StorageService().isMusicEnabled) return;

    try {
      if (_musicPlayer.state == PlayerState.playing) return;
      if (_musicPlayer.state == PlayerState.paused) await _musicPlayer.resume();
      await _musicPlayer.play(
        AssetSource('sounds/background_music.wav'),
        volume: 0.6, // Keep low to not distract
      );
    } catch (e) {
      print("Error playing music: $e");
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

  void playCorrect() => _playSfx('sounds/correct_sound.wav');
  void playPass() => _playSfx('sounds/pass_sound.wav');
  void playStartCountdown() => _playSfx('sounds/start_beep.wav');
  void playEndingCountdown() => _playSfx('sounds/end_beep.wav');

  // --- Haptics Control ---
  Future<void> vibrate(int duration) async {
    if (!StorageService().isHapticsEnabled) return;

    bool? hasVibrator = await Vibration.hasVibrator();
    if (hasVibrator == true) {
      Vibration.vibrate(duration: duration);
    }
  }

  void heavyImpact() => vibrate(500);
  void mediumImpact() => vibrate(200);
  void lightImpact() => vibrate(100);

  // Dispose observer
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
  }
}
