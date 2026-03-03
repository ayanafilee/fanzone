import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../utils/page_transitions.dart';
import '../services/feed_service.dart';
import '../services/club_service.dart';
import 'language_selection_screen.dart';
import 'home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  String _loadingMessage = 'Loading...';
  
  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Start with minimum 2 seconds display
      final minimumDisplayTime = Future.delayed(const Duration(seconds: 2));
      
      // Check onboarding status
      final prefs = await SharedPreferences.getInstance();
      final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;
      
      if (onboardingComplete) {
        // User has completed onboarding, preload data
        await _preloadData(prefs);
      }
      
      // Wait for minimum display time to complete
      await minimumDisplayTime;
      
      if (!mounted) return;
      
      // Navigate to appropriate screen
      if (onboardingComplete) {
        navigateAndReplace(context, const HomeScreen());
      } else {
        navigateAndReplace(context, const LanguageSelectionScreen());
      }
    } catch (e) {
      print('❌ Error during initialization: $e');
      // Still navigate even if preloading fails
      await Future.delayed(const Duration(seconds: 2));
      if (!mounted) return;
      
      final prefs = await SharedPreferences.getInstance();
      final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;
      
      if (onboardingComplete) {
        navigateAndReplace(context, const HomeScreen());
      } else {
        navigateAndReplace(context, const LanguageSelectionScreen());
      }
    }
  }

  Future<void> _preloadData(SharedPreferences prefs) async {
    final feedService = FeedService();
    final clubService = ClubService();
    
    try {
      // Update loading message
      if (mounted) {
        setState(() => _loadingMessage = 'Loading clubs...');
      }
      
      // Preload clubs list
      print('🚀 Preloading clubs...');
      await clubService.getClubsPublic();
      print('✅ Clubs preloaded');
      
      // Get user's favorite club
      final favClubId = prefs.getString('favorite_club_id');
      
      if (favClubId != null && favClubId.isNotEmpty) {
        // Update loading message
        if (mounted) {
          setState(() => _loadingMessage = 'Loading your club feed...');
        }
        
        // Preload user's club feed
        print('🚀 Preloading club feed for: $favClubId');
        await feedService.getMyClubFeed(favClubId);
        print('✅ Club feed preloaded');
      }
      
      // Update loading message
      if (mounted) {
        setState(() => _loadingMessage = 'Loading all news...');
      }
      
      // Preload all feed
      print('🚀 Preloading all feed...');
      await feedService.getAllFeed();
      print('✅ All feed preloaded');
      
      // Update loading message
      if (mounted) {
        setState(() => _loadingMessage = 'Almost ready...');
      }
      
      print('✅ All data preloaded successfully');
    } catch (e) {
      print('⚠️ Error preloading data: $e');
      // Don't throw - let the app continue even if preloading fails
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 150,
                height: 150,
                decoration: BoxDecoration(
                  color: AppColors.mediumGreen,
                  borderRadius: BorderRadius.circular(30),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: Image.asset(
                    'assets/images/fanzonelogo.jpg',
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              const SizedBox(height: 40),
              const Text(
                'FanZone',
                style: TextStyle(
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Your Ultimate Football\nCompanion',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 40),
              const CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.buttonGreenEnd),
              ),
              const SizedBox(height: 16),
              Text(
                _loadingMessage,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.white60,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
