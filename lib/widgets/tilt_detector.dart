import 'dart:async';
import 'package:flutter/material.dart';
import 'package:sensors_plus/sensors_plus.dart';

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
  static const double threshold = 7.0;

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
    _subscription = accelerometerEventStream().listen((event) {
      if (!mounted) return;
      final currentZ = event.z;
      // If tilt is not allowed (cooling down), wait for phone to be relatively flat (reset)
      if (!isTiltAllowed) {
        // "Flat" is roughly close to 0 on Z-axis (plumb line is Y-axis in landscape)
        // Allowing a small range like < 2.5 to consider it "reset"
        if (currentZ.abs() < 2.5) {
          setState(() {
            isTiltAllowed = true;
          });
        }
        return;
      }
      // Trigger tilt events and disable further tilt until reset
      if (currentZ > threshold) {
        // Tilted towards user (Screen up/back towards head) -> Usually "Pass"
        widget.onTiltUp();
        setState(() {
          isTiltAllowed = false;
        });
      } else if (currentZ < -threshold) {
        // Tilted away from user (Screen down/forehead down) -> Usually "Correct"
        widget.onTiltDown();
        setState(() {
          isTiltAllowed = false;
        });
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
