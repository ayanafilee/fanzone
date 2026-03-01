import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/notification_service.dart';
import 'screens/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp();
  
  // Initialize notifications
  await NotificationService().initialize();
  
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
