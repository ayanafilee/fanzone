import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize Firebase
    await Firebase.initializeApp();
    print('✅ Firebase initialized successfully');
  } catch (e) {
    print('❌ Firebase initialization failed: $e');
    // Continue anyway - app can work without Firebase
  }
  
  try {
    // Initialize notifications
    await NotificationService().initialize();
    print('✅ Notification service initialized successfully');
  } catch (e) {
    print('❌ Notification service initialization failed: $e');
    // Continue anyway - app can work without notifications
  }
  
  runApp(const FanZoneApp());
}

class FanZoneApp extends StatelessWidget {
  const FanZoneApp({super.key});
  
  // Global navigator key for notification navigation
  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  @override
  Widget build(BuildContext context) {
    // Set navigator key for notification service
    NotificationService.navigatorKey = navigatorKey;
    
    return MaterialApp(
      title: 'FanZone',
      debugShowCheckedModeBanner: false,
      navigatorKey: navigatorKey,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
      ),
      home: const SplashScreen(),
    );
  }
}
