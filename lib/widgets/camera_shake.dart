import 'package:flutter/material.dart';

/// Camera shake visual effect widget for tilt feedback and impact responses
class CameraShake extends StatefulWidget {
  final Widget child;
  final bool trigger;
  final double intensity;

  const CameraShake({
    super.key,
    required this.child,
    required this.trigger,
    this.intensity = 12.0,
  });

  @override
  State<CameraShake> createState() => _CameraShakeState();
}

class _CameraShakeState extends State<CameraShake>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void didUpdateWidget(CameraShake oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.trigger && !oldWidget.trigger) {
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final progress = _controller.value;
        final offset = (1.0 - progress) *
            widget.intensity *
            ((progress * 20).floor() % 2 == 0 ? 1 : -1);

        return Transform.translate(
          offset: Offset(offset, 0),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
