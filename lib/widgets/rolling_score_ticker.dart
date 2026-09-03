import 'package:flutter/material.dart';

/// Animated rolling score count-up ticker with pop scale keyframe
class RollingScoreTicker extends StatelessWidget {
  final int targetScore;
  final TextStyle? style;
  final Duration duration;

  const RollingScoreTicker({
    super.key,
    required this.targetScore,
    this.style,
    this.duration = const Duration(milliseconds: 450),
  });

  @override
  Widget build(BuildContext context) {
    final defaultStyle = const TextStyle(
      fontWeight: FontWeight.w900,
      fontSize: 36,
      color: Colors.white,
      shadows: [
        Shadow(color: Colors.amber, blurRadius: 12, offset: Offset(0, 2)),
      ],
    );

    return TweenAnimationBuilder<double>(
      tween: Tween<double>(begin: 0, end: targetScore.toDouble()),
      duration: duration,
      curve: Curves.easeOutBack,
      builder: (context, value, child) {
        final currentVal = value.floor();
        final isPulsing = (value % 1.0) > 0.1;
        final scaleFactor = isPulsing ? 1.0 + ((value % 1.0) * 0.12) : 1.0;

        return Transform.scale(
          scale: scaleFactor,
          child: Text(
            "$currentVal",
            style: style ?? defaultStyle,
          ),
        );
      },
    );
  }
}
