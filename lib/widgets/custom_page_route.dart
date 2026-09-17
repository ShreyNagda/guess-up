import 'package:flutter/material.dart';

/// Diegetic 3D arcade canvas route transition with playful spring scale-pop and fade
class CustomPageRoute<T> extends PageRouteBuilder<T> {
  final Widget? page;
  final WidgetBuilder? builder;

  CustomPageRoute({this.page, this.builder})
      : super(
          pageBuilder:
              (context, animation, secondaryAnimation) =>
                  page ??
                  (builder != null
                      ? builder(context)
                      : const SizedBox.shrink()),
          transitionDuration: const Duration(milliseconds: 420),
          reverseTransitionDuration: const Duration(milliseconds: 320),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Spring scale animation with energetic arcade pop (0.75 -> 1.0)
            final scaleAnimation = Tween<double>(begin: 0.75, end: 1.0).animate(
              CurvedAnimation(
                parent: animation,
                curve: const ElasticOutCurve(0.72),
              ),
            );

            // Fast opacity fade
            final fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
              CurvedAnimation(
                parent: animation,
                curve: const Interval(0.0, 0.55, curve: Curves.easeOut),
              ),
            );

            // Subtle arcade tilt pop (-0.035 rad -> 0.0)
            final tiltAnimation = Tween<double>(begin: -0.035, end: 0.0).animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutBack,
              ),
            );

            return AnimatedBuilder(
              animation: animation,
              builder: (context, childWidget) {
                return Transform(
                  transform: Matrix4.identity()
                    ..setEntry(3, 2, 0.001)
                    ..rotateZ(tiltAnimation.value),
                  alignment: Alignment.center,
                  child: ScaleTransition(
                    scale: scaleAnimation,
                    child: FadeTransition(
                      opacity: fadeAnimation,
                      child: childWidget,
                    ),
                  ),
                );
              },
              child: child,
            );
          },
        );
}

// Backwards-compatibility typedef alias
typedef ArcadePageRoute<T> = CustomPageRoute<T>;
