import 'package:flutter/material.dart';

class AppColors {
  // Dark green gradient colors
  static const Color darkGreen = Color(0xFF0A1F1A);
  static const Color mediumGreen = Color(0xFF1A3A2E);
  static const Color accentGreen = Color(0xFF2D5F4C);
  
  // Button gradient colors
  static const Color buttonGreenStart = Color(0xFF2D5F4C);
  static const Color buttonGreenEnd = Color(0xFFB8D96E);
  
  // Text colors
  static const Color textWhite = Colors.white;
  static const Color textGrey = Color(0xFFB0B0B0);
  static const Color errorRed = Color(0xFFFF6B6B);
  static const Color warningYellow = Color(0xFFFFD93D);
  
  // Input field colors
  static const Color inputBackground = Color(0xFF1A3A2E);
  static const Color inputBorder = Color(0xFF2D5F4C);
  
  // Background gradient
  static LinearGradient backgroundGradient = const LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [
      Color(0xFF0A1F1A),
      Color(0xFF0F2820),
      Color(0xFF0A1F1A),
    ],
  );
  
  // Button gradient
  static LinearGradient buttonGradient = const LinearGradient(
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
    colors: [
      Color(0xFF2D5F4C),
      Color(0xFF4A8B6F),
      Color(0xFFB8D96E),
    ],
  );
}
