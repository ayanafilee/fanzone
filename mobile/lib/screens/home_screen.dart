import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../services/notification_service.dart';
import 'my_club_tab.dart';
import 'all_news_tab.dart';
import 'highlights_tab.dart';
import 'notifications_screen.dart';
import 'language_selection_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  User? _currentUser;
  bool _isLoading = true;
  final _notificationService = NotificationService();

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent, // Transparent to overlay on app
        statusBarIconBrightness: Brightness.light, // White icons
        statusBarBrightness: Brightness.dark, // For iOS
      ),
    );
    // Make status bar overlay on app content
    SystemChrome.setEnabledSystemUIMode(
      SystemUiMode.edgeToEdge,
    );
    _loadUserPreferences();
  }

  Future<void> _loadUserPreferences() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final language = prefs.getString('language') ?? 'en';
      final favClubId = prefs.getString('favorite_club_id') ?? '';

      // Create a simple user object from preferences
      final user = User(
        id: 'local_user',
        name: 'FanZone User',
        email: '',
        language: language,
        favClubId: favClubId.isEmpty ? null : favClubId,
        profileImageUrl: '',
      );

      setState(() {
        _currentUser = user;
        _isLoading = false;
      });

      // Subscribe to notifications for user's club
      if (favClubId.isNotEmpty) {
        await _notificationService.subscribeToTopic('club_$favClubId');
      }
      // Subscribe to general news
      await _notificationService.subscribeToTopic('all_news');
    } catch (e) {
      print('Error loading preferences: $e');
      _navigateToOnboarding();
    }
  }

  void _navigateToOnboarding() {
    if (!mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LanguageSelectionScreen()),
      (route) => false,
    );
  }

  Future<void> _changeLanguage() async {
    final languages = [
      {'code': 'en', 'name': 'English', 'flag': '🇬🇧'},
      {'code': 'am', 'name': 'አማርኛ', 'flag': '🇪🇹'},
      {'code': 'om', 'name': 'Afaan Oromo', 'flag': '🇪🇹'},
    ];

    final selected = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.inputBackground,
        title: const Text('Select Language', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: languages.map((lang) {
            final isSelected = _currentUser?.language == lang['code'];
            return ListTile(
              leading: Text(lang['flag']!, style: const TextStyle(fontSize: 24)),
              title: Text(lang['name']!, style: const TextStyle(color: Colors.white)),
              trailing: isSelected ? const Icon(Icons.check, color: AppColors.buttonGreenEnd) : null,
              onTap: () => Navigator.pop(context, lang['code']),
            );
          }).toList(),
        ),
      ),
    );

    if (selected != null && selected != _currentUser?.language) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('language', selected);
      
      setState(() {
        _currentUser = User(
          id: _currentUser!.id,
          name: _currentUser!.name,
          email: _currentUser!.email,
          language: selected,
          favClubId: _currentUser!.favClubId,
          profileImageUrl: _currentUser!.profileImageUrl,
        );
      });
    }
  }

  void _showNotifications() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => NotificationsScreen(user: _currentUser!),
      ),
    );
  }

  String _getTabLabel(int index) {
    if (_currentUser == null) return '';
    
    final lang = _currentUser!.language;
    
    switch (index) {
      case 0:
        return lang == 'am' ? 'የእኔ ክለብ' : lang == 'om' ? 'Kilaba Koo' : 'My Club';
      case 1:
        return lang == 'am' ? 'ሁሉም ዜና' : lang == 'om' ? 'Oduu Hunda' : 'All News';
      case 2:
        return lang == 'am' ? 'ማጠቃለያ ቪዲዮዎች' : lang == 'om' ? 'Cuunfaa Tapha' : 'Highlights';
      default:
        return '';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Container(
          decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
          child: const Center(
            child: CircularProgressIndicator(color: AppColors.buttonGreenEnd),
          ),
        ),
      );
    }

    final List<Widget> tabs = [
      MyClubTab(user: _currentUser!),
      AllNewsTab(user: _currentUser!),
      HighlightsTab(user: _currentUser!),
    ];

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          top: false, // Don't add padding at top, let content go under status bar
          child: Column(
            children: [
              // Add padding for status bar manually with gradient
              SizedBox(height: MediaQuery.of(context).padding.top),
              // Custom Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    const Spacer(),
                    // Language Selector
                    IconButton(
                      icon: const Icon(Icons.language, color: Colors.white),
                      onPressed: _changeLanguage,
                      tooltip: 'Change Language',
                    ),
                    // Notification Icon
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                      onPressed: _showNotifications,
                      tooltip: 'Notifications',
                    ),
                  ],
                ),
              ),
              // Tab Content
              Expanded(
                child: tabs[_currentIndex],
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.darkGreen,
        selectedItemColor: AppColors.buttonGreenEnd,
        unselectedItemColor: AppColors.textGrey,
        selectedFontSize: 12,
        unselectedFontSize: 11,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.sports_soccer),
            label: _getTabLabel(0),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.article),
            label: _getTabLabel(1),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.play_circle),
            label: _getTabLabel(2),
          ),
        ],
      ),
    );
  }
}
