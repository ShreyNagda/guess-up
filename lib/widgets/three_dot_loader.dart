import 'package:flutter/material.dart';

/// Animated Three-Dot Pulsing Loading Screen with smooth ambient background
class ThreeDotLoader extends StatefulWidget {
  final String? label;
  final Color color;

  const ThreeDotLoader({
    super.key,
    this.label,
    this.color = const Color(0xFFFFEA00),
  });

  @override
  State<ThreeDotLoader> createState() => _ThreeDotLoaderState();
}

class _ThreeDotLoaderState extends State<ThreeDotLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final bgColor = isDark ? const Color(0xFF0F0C1C) : const Color(0xFFF5F6FA);
    final textColor = isDark ? Colors.white : const Color(0xFF1E1938);

    final showLabel = widget.label != null && widget.label!.trim().isNotEmpty;

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // 3 Staggered Pulsing Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(3, (index) {
                  final delay = index * 0.22;

                  return AnimatedBuilder(
                    animation: _controller,
                    builder: (context, child) {
                      final progress = (_controller.value - delay) % 1.0;
                      // Triangle wave: 0 -> 1 -> 0
                      final double wave = (1.0 - (progress - 0.5).abs() * 2.0)
                          .clamp(0.0, 1.0);

                      final double scale = 0.7 + (0.5 * wave);
                      final double alpha = 0.35 + (0.65 * wave);

                      return Transform.scale(
                        scale: scale,
                        child: Container(
                          margin: const EdgeInsets.symmetric(horizontal: 7),
                          width: 14,
                          height: 14,
                          decoration: BoxDecoration(
                            color: widget.color.withAlpha(
                              (255 * alpha).round(),
                            ),
                            shape: BoxShape.circle,
                            boxShadow: [
                              if (wave > 0.4)
                                BoxShadow(
                                  color: widget.color.withAlpha(
                                    (180 * wave).round(),
                                  ),
                                  blurRadius: 10,
                                  spreadRadius: 1,
                                ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                }),
              ),
              if (showLabel) ...[
                const SizedBox(height: 24),
                // Status Loading Label
                Text(
                  widget.label!.toUpperCase(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 2.2,
                    color: textColor.withAlpha(220),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
