import 'package:flutter/material.dart';

/// Tactile spring button widget with visual squash and stretch scale compression
class BouncyGameButton extends StatefulWidget {
  final Widget child;
  final VoidCallback onTap;
  final double targetScale;
  final Duration pressDuration;

  const BouncyGameButton({
    super.key,
    required this.child,
    required this.onTap,
    this.targetScale = 0.92,
    this.pressDuration = const Duration(milliseconds: 100),
  });

  @override
  State<BouncyGameButton> createState() => _BouncyGameButtonState();
}

class _BouncyGameButtonState extends State<BouncyGameButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.pressDuration,
      reverseDuration: const Duration(milliseconds: 250),
    );

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.targetScale,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
        reverseCurve: Curves.elasticOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTapDown: (_) => _controller.forward(),
      onTapUp: (_) {
        _controller.reverse();
        widget.onTap();
      },
      onTapCancel: () => _controller.reverse(),
      child: ScaleTransition(
        scale: _scaleAnimation,
        child: widget.child,
      ),
    );
  }
}
