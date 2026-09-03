import 'package:flutter/material.dart';

/// Diegetic arcade canvas route transition with scale and fade animations
class ArcadePageRoute<T> extends PageRouteBuilder<T> {
  final Widget? page;
  final WidgetBuilder? builder;

  ArcadePageRoute({this.page, this.builder})
    : super(
        pageBuilder:
            (context, animation, secondaryAnimation) =>
                page ??
                (builder != null ? builder(context) : const SizedBox.shrink()),
        transitionDuration: const Duration(milliseconds: 450),
        reverseTransitionDuration: const Duration(milliseconds: 350),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          final scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeOutBack),
          );

          final fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
            CurvedAnimation(parent: animation, curve: Curves.easeInOut),
          );

          return ScaleTransition(
            scale: scaleAnimation,
            child: FadeTransition(opacity: fadeAnimation, child: child),
          );
        },
      );
}
