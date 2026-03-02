import 'package:flutter/material.dart';

/// Smooth page transition for navigation
class SmoothPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  
  SmoothPageRoute({required this.page})
      : super(
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionDuration: const Duration(milliseconds: 300),
          reverseTransitionDuration: const Duration(milliseconds: 250),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Fade + Slide transition
            const begin = Offset(0.03, 0);
            const end = Offset.zero;
            const curve = Curves.easeInOut;

            var tween = Tween(begin: begin, end: end).chain(
              CurveTween(curve: curve),
            );
            var offsetAnimation = animation.drive(tween);

            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: offsetAnimation,
                child: child,
              ),
            );
          },
        );
}

/// Helper function for smooth navigation
Future<T?> navigateToPage<T>(BuildContext context, Widget page) {
  return Navigator.push<T>(
    context,
    SmoothPageRoute<T>(page: page),
  );
}

/// Helper function for smooth navigation with replacement
Future<T?> navigateAndReplace<T>(BuildContext context, Widget page) {
  return Navigator.pushReplacement<T, void>(
    context,
    SmoothPageRoute<T>(page: page),
  );
}

/// Helper function for smooth navigation removing all previous routes
Future<T?> navigateAndRemoveUntil<T>(BuildContext context, Widget page) {
  return Navigator.pushAndRemoveUntil<T>(
    context,
    SmoothPageRoute<T>(page: page),
    (route) => false,
  );
}
