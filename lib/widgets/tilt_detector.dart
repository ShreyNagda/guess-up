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

  int threshold = 8;

  void _startListening() {
    _subscription = accelerometerEvents.listen((event) {
      final currentZ = event.z;

      // If tilt is not allowed, wait for phone to be straightened
      if (!isTiltAllowed) {
        if (currentZ.abs() < 2) {
          setState(() {
            isTiltAllowed = true;
          });
        }
        return;
      }

      // Trigger tilt events and disable further tilt until reset
      if (currentZ > threshold) {
        widget.onTiltUp();
        setState(() {
          isTiltAllowed = false;
        });
      } else if (currentZ < -threshold) {
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
  void didUpdateWidget(TiltDetector oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && _subscription == null) {
      _startListening();
    } else if (!widget.isActive && _subscription != null) {
      _stopListening();
    }
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
