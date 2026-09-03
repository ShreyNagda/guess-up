import 'dart:math';
import 'package:flutter/material.dart';

/// An Industry-Level 2D Arcade Game Ambient Background
/// Features dynamic floating arcade particles, animated glow blobs, and diagonal mesh grid canvas.
class AmbientBackground extends StatefulWidget {
  final Color ambientColor;
  final Widget child;
  final Alignment center;
  final double radius;

  const AmbientBackground({
    super.key,
    required this.ambientColor,
    required this.child,
    this.center = const Alignment(0.0, -0.3),
    this.radius = 0.95,
  });

  @override
  State<AmbientBackground> createState() => _AmbientBackgroundState();
}

class _AmbientBackgroundState extends State<AmbientBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _particleController;
  final List<_ArcadeParticle> _particles = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    )..repeat();

    // Generate 14 floating arcade particles (stars, diamonds, dots)
    for (int i = 0; i < 14; i++) {
      _particles.add(
        _ArcadeParticle(
          x: _random.nextDouble(),
          y: _random.nextDouble(),
          speed: 0.15 + (_random.nextDouble() * 0.25),
          size: 6 + (_random.nextDouble() * 12),
          opacity: 0.25 + (_random.nextDouble() * 0.45),
          isStar: i % 2 == 0,
        ),
      );
    }
  }

  @override
  void dispose() {
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final Color baseBackgroundColor =
        isDark ? const Color(0xFF0E0C1C) : const Color(0xFFF0F3F9);

    return RepaintBoundary(
      child: Stack(
        children: [
          // 1. Base Arcade Deep Canvas Color
          Container(color: baseBackgroundColor),

          // 2. Dynamic Radial Color Aura
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            decoration: BoxDecoration(
              gradient: RadialGradient(
                center: widget.center,
                radius: widget.radius,
                colors: [
                  widget.ambientColor.withAlpha(isDark ? 110 : 65),
                  widget.ambientColor.withAlpha(isDark ? 40 : 15),
                  Colors.transparent,
                ],
                stops: const [0.0, 0.55, 1.0],
              ),
            ),
          ),

          // 3. Diagonal Arcade Mesh Pattern Overlay
          Positioned.fill(
            child: CustomPaint(
              painter: _ArcadeGridPainter(isDark: isDark),
            ),
          ),

          // 4. Floating Animated Arcade Particles
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _particleController,
              builder: (context, _) {
                return CustomPaint(
                  painter: _ArcadeParticlePainter(
                    particles: _particles,
                    progress: _particleController.value,
                    particleColor: isDark ? Colors.amberAccent : widget.ambientColor,
                  ),
                );
              },
            ),
          ),

          // 5. Child Foreground Content
          widget.child,
        ],
      ),
    );
  }
}

class _ArcadeParticle {
  double x;
  double y;
  final double speed;
  final double size;
  final double opacity;
  final bool isStar;

  _ArcadeParticle({
    required this.x,
    required this.y,
    required this.speed,
    required this.size,
    required this.opacity,
    required this.isStar,
  });
}

class _ArcadeParticlePainter extends CustomPainter {
  final List<_ArcadeParticle> particles;
  final double progress;
  final Color particleColor;

  _ArcadeParticlePainter({
    required this.particles,
    required this.progress,
    required this.particleColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final double currentY = (p.y - (progress * p.speed)) % 1.0;
      final double px = p.x * size.width;
      final double py = currentY * size.height;

      final paint = Paint()
        ..color = particleColor.withAlpha((p.opacity * 255).toInt())
        ..style = PaintingStyle.fill;

      if (p.isStar) {
        // Draw 4-point Star
        final path = Path();
        final double s = p.size;
        path.moveTo(px, py - s);
        path.quadraticBezierTo(px, py, px + s, py);
        path.quadraticBezierTo(px, py, px, py + s);
        path.quadraticBezierTo(px, py, px - s, py);
        path.quadraticBezierTo(px, py, px, py - s);
        canvas.drawPath(path, paint);
      } else {
        // Draw Soft Glowing Circle
        canvas.drawCircle(Offset(px, py), p.size * 0.4, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _ArcadeParticlePainter oldDelegate) => true;
}

class _ArcadeGridPainter extends CustomPainter {
  final bool isDark;

  _ArcadeGridPainter({required this.isDark});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = (isDark ? Colors.white : Colors.black).withAlpha(isDark ? 8 : 12)
      ..strokeWidth = 1.2;

    const double step = 28.0;
    for (double i = -size.height; i < size.width + size.height; i += step) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i + size.height, size.height),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _ArcadeGridPainter oldDelegate) => false;
}
