import 'dart:async';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

import 'package:guess_up/constants/game_constants.dart';
import 'package:guess_up/services/storage_service.dart';

class TiltDetector extends StatefulWidget {
  final bool isActive;
  final VoidCallback onTiltUp;
  final VoidCallback onTiltDown;
  final Widget child;
  const TiltDetector({
    super.key,
    required this.isActive,
    required this.onTiltUp,
    required this.onTiltDown,
    required this.child,
  });
  @override
  State<TiltDetector> createState() => _TiltDetectorState();
}

class _TiltDetectorState extends State<TiltDetector> {
  StreamSubscription<AccelerometerEvent>? _subscription;
  bool isTiltAllowed = true;

  double get passThreshold {
    switch (GameStorageService().tiltSensitivity) {
      case 'Low':
        return GameConstants.tiltPassThresholdLow;
      case 'High':
        return GameConstants.tiltPassThresholdHigh;
      case 'Normal':
      default:
        return GameConstants.tiltPassThresholdNormal;
    }
  }

  double get correctThreshold {
    switch (GameStorageService().tiltSensitivity) {
      case 'Low':
        return GameConstants.tiltCorrectThresholdLow;
      case 'High':
        return GameConstants.tiltCorrectThresholdHigh;
      case 'Normal':
      default:
        return GameConstants.tiltCorrectThresholdNormal;
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.isActive) {
      _startListening();
    }
  }

  @override
  void didUpdateWidget(TiltDetector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive != oldWidget.isActive) {
      if (widget.isActive) {
        _startListening();
      } else {
        _stopListening();
      }
    }
  }

  void _startListening() {
    _stopListening();
    // Start with tilt disallowed until the device is level/flat after activation
    isTiltAllowed = false;
    _subscription = accelerometerEventStream().listen((event) {
      if (!mounted) return;
      final currentZ = event.z;
      // If tilt is not allowed (cooling down or initial setup), wait for phone to be relatively flat (reset)
      if (!isTiltAllowed) {
        // "Flat" is roughly close to 0 on Z-axis (plumb line is Y-axis in landscape)
        if (currentZ.abs() < GameConstants.tiltResetThreshold) {
          if (mounted && !isTiltAllowed) {
            setState(() {
              isTiltAllowed = true;
            });
          }
        }
        return;
      }
      final isInverted = GameStorageService().isInvertedControls;
      if (currentZ > passThreshold) {
        // Tilted towards user (Screen up / back towards head)
        if (isInverted) {
          widget.onTiltDown(); // Inverted: Tilt Up = Correct
        } else {
          widget.onTiltUp(); // Default: Tilt Up = Pass
        }
        if (mounted) {
          setState(() {
            isTiltAllowed = false;
          });
        }
      } else if (currentZ < -correctThreshold) {
        // Tilted away from user (Screen down / forehead down)
        if (isInverted) {
          widget.onTiltUp(); // Inverted: Tilt Down = Pass
        } else {
          widget.onTiltDown(); // Default: Tilt Down = Correct
        }
        if (mounted) {
          setState(() {
            isTiltAllowed = false;
          });
        }
      }
    });
  }

  void _stopListening() {
    _subscription?.cancel();
    _subscription = null;
  }

  @override
  void dispose() {
    _stopListening();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}
