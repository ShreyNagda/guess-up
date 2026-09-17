import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:sensors_plus/sensors_plus.dart';

class SensorService {
  static final SensorService _instance = SensorService._internal();
  factory SensorService() => _instance;
  SensorService._internal();

  bool? _isAccelerometerAvailable;
  bool get isAccelerometerAvailable => _isAccelerometerAvailable ?? true;

  /// Checks if device accelerometer streams events within given timeout
  Future<bool> checkAccelerometerAvailability({
    Duration timeout = const Duration(milliseconds: 500),
  }) async {
    if (_isAccelerometerAvailable != null) {
      return _isAccelerometerAvailable!;
    }

    final completer = Completer<bool>();
    StreamSubscription<AccelerometerEvent>? subscription;

    try {
      subscription = accelerometerEventStream().listen(
        (event) {
          if (!completer.isCompleted) {
            completer.complete(true);
          }
        },
        onError: (e) {
          if (!completer.isCompleted) {
            completer.complete(false);
          }
        },
        cancelOnError: true,
      );

      Timer(timeout, () {
        if (!completer.isCompleted) {
          completer.complete(false);
        }
      });
    } catch (e) {
      debugPrint("⚠️ Accelerometer hardware check error: $e");
      if (!completer.isCompleted) {
        completer.complete(false);
      }
    }

    final result = await completer.future;
    await subscription?.cancel();
    _isAccelerometerAvailable = result;
    debugPrint("📱 [SENSOR-CHECK] Device Accelerometer hardware available: $result");
    return result;
  }
}
