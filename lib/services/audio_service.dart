import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  bool _initialized = false;
  double _volume = 1.0; // Default volume

  // Separate player instances for each sound
  late final AudioPlayer _startPlayer;
  late final AudioPlayer _correctPlayer;
  late final AudioPlayer _passPlayer;
  late final AudioPlayer _endingPlayer;

  double get volume => _volume;

  /// Call once (e.g. in initState)
  Future<void> init() async {
    if (_initialized) return;
    _initialized = true;

    _startPlayer = AudioPlayer(playerId: 'start');
    _correctPlayer = AudioPlayer(playerId: 'correct');
    _passPlayer = AudioPlayer(playerId: 'pass');
    _endingPlayer = AudioPlayer(playerId: 'ending');

    try {
      // Preload sources to avoid lag
      await Future.wait([
        _startPlayer.setSource(AssetSource('sounds/start_beep.wav')),
        _correctPlayer.setSource(AssetSource('sounds/correct_sound.wav')),
        _passPlayer.setSource(AssetSource('sounds/pass_sound.wav')),
        _endingPlayer.setSource(AssetSource('sounds/end_beep.wav')),
      ]);

      // Set initial volume
      _startPlayer.setVolume(_volume);
      _correctPlayer.setVolume(_volume);
      _passPlayer.setVolume(_volume);
      _endingPlayer.setVolume(_volume);
    } catch (e) {
      debugPrint('sounds preload error: $e');
    }
  }

  /// Update volume dynamically
  void setVolume(double value) {
    _volume = value.clamp(0.0, 1.0);
    _startPlayer.setVolume(_volume);
    _correctPlayer.setVolume(_volume);
    _passPlayer.setVolume(_volume);
    _endingPlayer.setVolume(_volume);
    debugPrint('AudioService volume set to $_volume');
  }

  /// Internal safe play wrapper
  Future<void> _safePlay(AudioPlayer player, AssetSource source) async {
    try {
      await player.stop();
      await player.setSource(source);
      await player.setVolume(_volume); // ensure current volume
      await player.resume();
    } catch (e) {
      debugPrint('sounds playback error: $e');
    }
  }

  // Play methods
  Future<void> playStartCountdown() async =>
      _safePlay(_startPlayer, AssetSource('sounds/start_beep.wav'));

  Future<void> playCorrect() async =>
      _safePlay(_correctPlayer, AssetSource('sounds/correct_sound.wav'));

  Future<void> playPass() async =>
      _safePlay(_passPlayer, AssetSource('sounds/pass_sound.wav'));

  Future<void> playEndingCountdown() async =>
      _safePlay(_endingPlayer, AssetSource('sounds/end_beep.wav'));

  /// Dispose all players
  Future<void> dispose() async {
    try {
      await _startPlayer.dispose();
      await _correctPlayer.dispose();
      await _passPlayer.dispose();
      await _endingPlayer.dispose();
    } catch (_) {}
    _initialized = false;
  }
}
