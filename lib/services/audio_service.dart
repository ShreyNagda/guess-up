import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/services/storage_service.dart';

class AudioService {
  // Singleton pattern
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  final AudioPlayer _musicPlayer = AudioPlayer();
  final AudioPlayer _sfxPlayer = AudioPlayer();

  // We don't need to store the instance if we access the singleton directly,
  // but keeping a reference is fine if we want to support dependency injection later.
  // For now, we'll access StorageService() directly to solve your scope issue.

  // Initialize audio players
  Future<void> init() async {
    // Configure players
    await _musicPlayer.setReleaseMode(ReleaseMode.loop); // Loop music
    await _sfxPlayer.setReleaseMode(ReleaseMode.stop);

    // Start music if enabled
    if (StorageService().isMusicEnabled) {
      await playBackgroundMusic();
    }
  }

  // --- Music Control ---
  Future<void> playBackgroundMusic() async {
    // Access singleton directly
    if (!StorageService().isMusicEnabled) return;

    try {
      if (_musicPlayer.state == PlayerState.playing) return;

      // FIX: Remove 'assets/' prefix.
      // AssetSource automatically adds 'assets/' to the path.
      await _musicPlayer.play(
        AssetSource('sounds/background_music.mp3'),
        volume: 0.3,
      );
    } catch (e) {
      print("Error playing music (Did you add background_music.mp3?): $e");
    }
  }

  Future<void> stopBackgroundMusic() async {
    await _musicPlayer.stop();
  }

  Future<void> toggleMusic(bool isEnabled) async {
    if (isEnabled) {
      // We manually call play here because the flag in storage might have just been set
      // but we want to force start now.
      await playBackgroundMusic();
    } else {
      await stopBackgroundMusic();
    }
  }

  // --- SFX Control ---
  Future<void> _playSfx(String path) async {
    // Access singleton directly
    if (!StorageService().isSfxEnabled) return;

    try {
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
  void vibrate(Function() feedbackFunction) {
    if (StorageService().isHapticsEnabled) {
      feedbackFunction();
    }
  }

  void heavyImpact() => vibrate(HapticFeedback.heavyImpact);
  void mediumImpact() => vibrate(HapticFeedback.mediumImpact);
  void lightImpact() => vibrate(HapticFeedback.lightImpact);
}
