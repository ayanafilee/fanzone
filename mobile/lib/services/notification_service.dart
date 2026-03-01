import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:typed_data';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  // Navigation key for handling notification taps
  static GlobalKey<NavigatorState>? navigatorKey;

  Future<void> initialize() async {
    // Request permission for iOS and Android 13+
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    print('📱 FCM Token: $token');
    
    // Save token to preferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('fcm_token', token ?? '');

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Handle notification tap when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    
    // Check for initial message (app opened from terminated state)
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    // Create notification channel for Android
    const androidChannel = AndroidNotificationChannel(
      'fanzone_channel',
      'FanZone Notifications',
      description: 'Notifications for news and highlights',
      importance: Importance.high,
      playSound: true,
      enableVibration: true,
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  void _onNotificationTapped(NotificationResponse response) {
    print('📱 Local notification tapped: ${response.payload}');
    print('📱 Action ID: ${response.actionId}');
    
    if (response.payload == null) return;
    
    try {
      final data = jsonDecode(response.payload!);
      final type = data['type'];
      final actionId = response.actionId;
      
      // Handle action buttons
      if (actionId == 'watch' || actionId == 'read') {
        // Open the content immediately
        _handleContentOpen(data);
      } else if (actionId == 'watch_later' || actionId == 'read_later') {
        // Save for later
        _saveForLater(data);
        _showNavigationMessage('Saved for later');
      } else if (actionId == 'turn_off') {
        // Just dismiss - notification is already cancelled
        print('🔕 Notification dismissed');
      } else {
        // Default tap (no action button) - open content
        _handleContentOpen(data);
      }
    } catch (e) {
      print('❌ Error handling notification tap: $e');
    }
  }

  void _handleContentOpen(Map<String, dynamic> data) {
    final type = data['type'];
    final contentId = data['content_id'];
    final highlightId = data['highlight_id'];
    
    if (navigatorKey?.currentContext != null) {
      if (type == 'news' && contentId != null) {
        _showNavigationMessage('Opening news: $contentId');
        // TODO: Navigate to news detail screen
      } else if (type == 'highlight' && highlightId != null) {
        _showNavigationMessage('Opening highlight: $highlightId');
        // TODO: Navigate to highlight detail screen
      }
    }
  }

  Future<void> _saveForLater(Map<String, dynamic> data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedItems = prefs.getStringList('saved_for_later') ?? [];
      savedItems.add(jsonEncode(data));
      await prefs.setStringList('saved_for_later', savedItems);
      print('💾 Saved item for later');
    } catch (e) {
      print('❌ Error saving for later: $e');
    }
  }

  Future<void> _handleForegroundMessage(RemoteMessage message) async {
    print('📬 Foreground message received!');
    print('📬 Title: ${message.notification?.title}');
    print('📬 Body: ${message.notification?.body}');
    print('📬 Data: ${message.data}');
    
    // Display notification using local notifications
    await _showLocalNotification(message);
  }

  void _handleNotificationTap(RemoteMessage message) {
    print('📱 Notification tapped: ${message.notification?.title}');
    print('📱 Data: ${message.data}');
    
    // Get data from notification (backend format)
    final data = message.data;
    final type = data['type']; // 'news' or 'highlight'
    final contentId = data['content_id']; // for news
    final highlightId = data['highlight_id']; // for highlights
    final clubId = data['club_id'];
    
    // Navigate based on type
    if (navigatorKey?.currentContext != null) {
      if (type == 'news' && contentId != null) {
        // Navigate to news detail screen
        // For now, just show a snackbar
        _showNavigationMessage('Opening news: $contentId');
      } else if (type == 'highlight' && highlightId != null) {
        // Navigate to highlight detail screen
        _showNavigationMessage('Opening highlight: $highlightId');
      }
    }
  }

  Future<void> _showLocalNotification(RemoteMessage message) async {
    final notification = message.notification;
    final data = message.data;
    
    if (notification == null) {
      print('⚠️ No notification payload found');
      return;
    }

    print('🔔 Showing local notification: ${notification.title}');

    final type = data['type']; // 'news' or 'highlight'
    final imageUrl = data['image_url'] ?? notification.android?.imageUrl;
    
    // Download image for big picture style
    BigPictureStyleInformation? bigPictureStyle;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      try {
        print('📸 Loading notification image: $imageUrl');
        final response = await http.get(Uri.parse(imageUrl));
        if (response.statusCode == 200) {
          final Uint8List bytes = response.bodyBytes;
          final bigPicture = ByteArrayAndroidBitmap(bytes);
          bigPictureStyle = BigPictureStyleInformation(
            bigPicture,
            contentTitle: notification.title,
            summaryText: notification.body,
            largeIcon: bigPicture,
          );
          print('✅ Image loaded successfully');
        }
      } catch (e) {
        print('⚠️ Error loading notification image: $e');
      }
    }

    // Create action buttons based on type
    final actions = _createNotificationActions(type, data);

    final androidDetails = AndroidNotificationDetails(
      'fanzone_channel',
      'FanZone Notifications',
      channelDescription: 'Notifications for news and highlights',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
      enableVibration: true,
      icon: '@mipmap/ic_launcher',
      styleInformation: bigPictureStyle,
      actions: actions,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final notificationDetails = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title,
      notification.body,
      notificationDetails,
      payload: jsonEncode(data),
    );
    
    print('✅ Local notification displayed successfully');
  }

  List<AndroidNotificationAction> _createNotificationActions(String? type, Map<String, dynamic> data) {
    if (type == 'highlight') {
      return [
        const AndroidNotificationAction(
          'watch',
          'Watch',
          icon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
          showsUserInterface: true,
        ),
        const AndroidNotificationAction(
          'watch_later',
          'Watch Later',
          showsUserInterface: false,
        ),
        const AndroidNotificationAction(
          'turn_off',
          'Turn Off',
          showsUserInterface: false,
          cancelNotification: true,
        ),
      ];
    } else if (type == 'news') {
      return [
        const AndroidNotificationAction(
          'read',
          'Read',
          icon: DrawableResourceAndroidBitmap('@mipmap/ic_launcher'),
          showsUserInterface: true,
        ),
        const AndroidNotificationAction(
          'read_later',
          'Read Later',
          showsUserInterface: false,
        ),
        const AndroidNotificationAction(
          'turn_off',
          'Turn Off',
          showsUserInterface: false,
          cancelNotification: true,
        ),
      ];
    }
    
    return [];
  }
  
  void _showNavigationMessage(String message) {
    if (navigatorKey?.currentContext != null) {
      ScaffoldMessenger.of(navigatorKey!.currentContext!).showSnackBar(
        SnackBar(
          content: Text(message),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<String?> getToken() async {
    return await _firebaseMessaging.getToken();
  }

  Future<void> subscribeToTopic(String topic) async {
    try {
      await _firebaseMessaging.subscribeToTopic(topic);
      print('✅ Subscribed to topic: $topic');
    } catch (e) {
      print('❌ Error subscribing to topic $topic: $e');
    }
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _firebaseMessaging.unsubscribeFromTopic(topic);
      print('❌ Unsubscribed from topic: $topic');
    } catch (e) {
      print('❌ Error unsubscribing from topic $topic: $e');
    }
  }
  
  // Subscribe to club topic (backend format: club_{club_id})
  Future<void> subscribeToClub(String clubId) async {
    await subscribeToTopic('club_$clubId');
  }
  
  // Unsubscribe from club topic
  Future<void> unsubscribeFromClub(String clubId) async {
    await unsubscribeFromTopic('club_$clubId');
  }
  
  // Subscribe to all users topic
  Future<void> subscribeToAllUsers() async {
    await subscribeToTopic('all_users');
  }
}

// Top-level function for background message handling
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('📬 Background message: ${message.notification?.title}');
  print('📬 Data: ${message.data}');
}
