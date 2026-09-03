import 'dart:ui';
import 'package:flutter/material.dart';

/// A reusable, theme-aware animated ambient background widget with soft blurred color patches.
class AmbientBackground extends StatelessWidget {
  final Color ambientColor;
  final Widget child;
  final Alignment center;
  final double radius;
  final Duration duration;

  const AmbientBackground({
    super.key,
    required this.ambientColor,
    required this.child,
    this.center = const Alignment(0.0, -0.4),
    this.radius = 0.85,
    this.duration = const Duration(milliseconds: 250),
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final Color baseBackgroundColor =
        isDark ? const Color(0xFF121212) : const Color(0xFFF6F7FA);

    return TweenAnimationBuilder<Color?>(
      tween: ColorTween(begin: ambientColor, end: ambientColor),
      duration: duration,
      curve: Curves.easeInOut,
      builder: (context, animatedColor, builtChild) {
        final currentColor = animatedColor ?? ambientColor;
        final int primaryAlpha = isDark ? 65 : 30;
        final int secondaryAlpha = isDark ? 45 : 18;

        return Stack(
          children: [
            // Solid Base Color
            Container(color: baseBackgroundColor),

            // Top-Right Soft Ambient Blob
            Positioned(
              top: -60,
              right: -60,
              child: _AmbientBlob(
                color: currentColor.withAlpha(primaryAlpha),
                size: 300,
              ),
            ),

            // Bottom-Left Secondary Blob
            Positioned(
              bottom: -80,
              left: -80,
              child: _AmbientBlob(
                color: currentColor.withAlpha(secondaryAlpha),
                size: 300,
              ),
            ),

            // Central Soft Radial Aura
            Container(
              decoration: BoxDecoration(
                gradient: RadialGradient(
                  center: center,
                  radius: isDark ? radius : (radius + 0.10),
                  colors: [
                    currentColor.withAlpha(isDark ? 80 : 45),
                    Colors.transparent,
                  ],
                  stops: const [0.0, 0.75],
                ),
              ),
            ),

            // Child Content
            builtChild ?? const SizedBox.shrink(),
          ],
        );
      },
      child: child,
    );
  }
}

class _AmbientBlob extends StatelessWidget {
  final Color color;
  final double size;

  const _AmbientBlob({required this.color, required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
        child: Container(color: Colors.transparent),
      ),
    );
  }
}
