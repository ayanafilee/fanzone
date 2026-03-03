import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:async';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/club.dart';
import '../services/notification_service.dart';
import '../services/club_service.dart';
import '../widgets/floating_reaction_animation.dart';
import '../utils/page_transitions.dart';
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

class _HomeScreenState extends State<HomeScreen> with WidgetsBindingObserver {
  int _currentIndex = 0;
  User? _currentUser;
  bool _isLoading = true;
  final _notificationService = NotificationService();
  final _clubService = ClubService();
  List<Club> _clubs = [];
  bool _isLoadingClubs = false;
  int _unreadNotificationCount = 0;
  StreamSubscription? _unreadCountTimer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons
        statusBarBrightness: Brightness.dark, // For iOS
      ),
    );
    
    // Set up callback for notification count changes
    NotificationService.onUnreadCountChanged = (int newCount) {
      print('🔔 Callback received: new count = $newCount');
      if (mounted) {
        setState(() {
          _unreadNotificationCount = newCount;
        });
      }
    };
    
    _loadUserPreferences();
    _loadClubs();
    _loadUnreadCount();
    
    // Set up periodic check for unread count (every 30 seconds)
    _startUnreadCountTimer();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _unreadCountTimer?.cancel();
    NotificationService.onUnreadCountChanged = null;
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    // Reload count when app comes to foreground
    if (state == AppLifecycleState.resumed) {
      print('🔔 App resumed, reloading unread count');
      _loadUnreadCount();
    }
  }

  void _startUnreadCountTimer() {
    _unreadCountTimer = Stream.periodic(const Duration(seconds: 30)).listen((_) {
      _loadUnreadCount();
    });
  }

  Future<void> _loadUnreadCount() async {
    final prefs = await SharedPreferences.getInstance();
    final lastReadTimestamp = prefs.getInt('last_read_notification_timestamp') ?? 0;
    final lastReadDateTime = DateTime.fromMillisecondsSinceEpoch(lastReadTimestamp);
    
    // Count notifications newer than last read time
    // For now, we'll use a simple counter that gets updated when new notifications arrive
    final count = prefs.getInt('unread_notification_count') ?? 0;
    
    print('🔔 Loading unread count: $count');
    print('🔔 Last read timestamp: $lastReadTimestamp');
    
    if (mounted) {
      setState(() {
        _unreadNotificationCount = count;
      });
      print('🔔 Updated UI with count: $_unreadNotificationCount');
    }
  }

  Future<void> _markAllAsRead() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('last_read_notification_timestamp', DateTime.now().millisecondsSinceEpoch);
    await prefs.setInt('unread_notification_count', 0);
    
    print('🔔 Marked all as read, count reset to 0');
    
    if (mounted) {
      setState(() {
        _unreadNotificationCount = 0;
      });
    }
  }

  // Test method to simulate notifications (for development/testing)
  Future<void> _simulateNotification() async {
    final prefs = await SharedPreferences.getInstance();
    final currentCount = prefs.getInt('unread_notification_count') ?? 0;
    await prefs.setInt('unread_notification_count', currentCount + 1);
    
    print('🔔 Simulated notification, new count: ${currentCount + 1}');
    
    await _loadUnreadCount();
  }

  Future<void> _loadClubs() async {
    setState(() => _isLoadingClubs = true);
    try {
      final clubs = await _clubService.getClubsPublic();
      setState(() {
        _clubs = clubs;
        _isLoadingClubs = false;
      });
    } catch (e) {
      print('Error loading clubs: $e');
      setState(() => _isLoadingClubs = false);
    }
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

      // Subscribe to notifications (backend format)
      // Subscribe to all_users topic for general notifications
      await _notificationService.subscribeToAllUsers();
      
      // Subscribe to user's club topic (format: club_{club_id})
      if (favClubId.isNotEmpty) {
        print('🔔 Subscribing to club notifications for club ID: $favClubId');
        print('🔔 Topic name: club_$favClubId');
        await _notificationService.subscribeToClub(favClubId);
      } else {
        print('⚠️ No favorite club selected, skipping club subscription');
      }
    } catch (e) {
      print('Error loading preferences: $e');
      _navigateToOnboarding();
    }
  }

  void _navigateToOnboarding() {
    if (!mounted) return;
    navigateAndRemoveUntil(context, const LanguageSelectionScreen());
  }

  void _showNotifications() {
    // Mark all as read when opening notifications
    _markAllAsRead();
    
    navigateToPage(
      context,
      NotificationsScreen(user: _currentUser!),
    ).then((_) {
      // Reload count when returning
      _loadUnreadCount();
    });
  }

  String _getTabLabel(int index) {
    if (_currentUser == null) return '';
    
    final lang = _currentUser!.language;
    
    switch (index) {
      case 0:
        // Get the selected club name
        if (_currentUser!.favClubId != null && _clubs.isNotEmpty) {
          try {
            final selectedClub = _clubs.firstWhere(
              (club) => club.id == _currentUser!.favClubId,
            );
            return selectedClub.name;
          } catch (e) {
            // If club not found, show default label
            return lang == 'am' ? 'የእኔ ክለብ' : lang == 'om' ? 'Kilaba Koo' : 'My Club';
          }
        }
        return lang == 'am' ? 'የእኔ ክለብ' : lang == 'om' ? 'Kilaba Koo' : 'My Club';
      case 1:
        return lang == 'am' ? 'ሁሉም ክለቦች' : lang == 'om' ? 'Kilaboota Hunda' : 'All Clubs';
      case 2:
        return lang == 'am' ? 'ማጠቃለያ ቪዲዮዎች' : lang == 'om' ? 'Cuunfaa Tapha' : 'Highlights';
      default:
        return '';
    }
  }

  String _getCurrentLanguageName() {
    if (_currentUser == null) return 'English';
    
    switch (_currentUser!.language) {
      case 'am':
        return 'አማርኛ';
      case 'om':
        return 'Afaan Oromo';
      default:
        return 'English';
    }
  }

  String _getCurrentLanguageFlag() {
    if (_currentUser == null) return '🇬🇧';
    
    switch (_currentUser!.language) {
      case 'am':
      case 'om':
        return '🇪🇹';
      default:
        return '🇬🇧';
    }
  }

  Widget _buildLanguageDropdown() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.inputBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.inputBorder.withOpacity(0.3)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _currentUser?.language ?? 'en',
          dropdownColor: AppColors.darkGreen,
          icon: const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
          isDense: true,
          menuMaxHeight: 300,
          borderRadius: BorderRadius.circular(12),
          selectedItemBuilder: (BuildContext context) {
            return [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('🇬🇧', style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  const Text('English', style: TextStyle(color: Colors.white, fontSize: 13)),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('🇪🇹', style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  const Text('አማርኛ', style: TextStyle(color: Colors.white, fontSize: 13)),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('🇪🇹', style: const TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  const Text('Afaan Oromo', style: TextStyle(color: Colors.white, fontSize: 13)),
                ],
              ),
            ];
          },
          onChanged: (String? newValue) async {
            if (newValue != null && newValue != _currentUser?.language) {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('language', newValue);
              
              setState(() {
                _currentUser = User(
                  id: _currentUser!.id,
                  name: _currentUser!.name,
                  email: _currentUser!.email,
                  language: newValue,
                  favClubId: _currentUser!.favClubId,
                  profileImageUrl: _currentUser!.profileImageUrl,
                );
              });
            }
          },
          items: [
            DropdownMenuItem(
              value: 'en',
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentUser?.language == 'en' 
                      ? AppColors.buttonGreenEnd.withOpacity(0.2) 
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text('🇬🇧', style: TextStyle(fontSize: 16)),
                    SizedBox(width: 6),
                    Text('English', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
            DropdownMenuItem(
              value: 'am',
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentUser?.language == 'am' 
                      ? AppColors.buttonGreenEnd.withOpacity(0.2) 
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text('🇪🇹', style: TextStyle(fontSize: 16)),
                    SizedBox(width: 6),
                    Text('አማርኛ', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
            DropdownMenuItem(
              value: 'om',
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                decoration: BoxDecoration(
                  color: _currentUser?.language == 'om' 
                      ? AppColors.buttonGreenEnd.withOpacity(0.2) 
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: const [
                    Text('🇪🇹', style: TextStyle(fontSize: 16)),
                    SizedBox(width: 6),
                    Text('Afaan Oromo', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w500)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClubDropdown() {
    if (_isLoadingClubs) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.inputBackground.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.inputBorder.withOpacity(0.3)),
        ),
        child: const SizedBox(
          width: 20,
          height: 20,
          child: CircularProgressIndicator(
            color: AppColors.buttonGreenEnd,
            strokeWidth: 2,
          ),
        ),
      );
    }

    if (_clubs.isEmpty) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.inputBackground.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.inputBorder.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(Icons.sports_soccer, color: AppColors.buttonGreenEnd, size: 16),
            SizedBox(width: 6),
            Text(
              'No clubs',
              style: TextStyle(color: Colors.white54, fontSize: 13),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.inputBackground.withOpacity(0.5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.inputBorder.withOpacity(0.3)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _currentUser?.favClubId,
          hint: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.sports_soccer, color: AppColors.buttonGreenEnd, size: 16),
              const SizedBox(width: 6),
              Text(
                _getSelectClubPlaceholder(),
                style: const TextStyle(color: Colors.white54, fontSize: 13),
              ),
            ],
          ),
          dropdownColor: AppColors.darkGreen,
          icon: const Icon(Icons.arrow_drop_down, color: Colors.white, size: 18),
          isDense: true,
          menuMaxHeight: 300,
          borderRadius: BorderRadius.circular(12),
          selectedItemBuilder: (BuildContext context) {
            return _clubs.map((Club club) {
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.sports_soccer, color: AppColors.buttonGreenEnd, size: 16),
                  const SizedBox(width: 6),
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 100),
                    child: Text(
                      club.name,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              );
            }).toList();
          },
          onChanged: (String? newValue) async {
            if (newValue != null && newValue != _currentUser?.favClubId) {
              // Unsubscribe from old club
              if (_currentUser?.favClubId != null && _currentUser!.favClubId!.isNotEmpty) {
                await _notificationService.unsubscribeFromClub(_currentUser!.favClubId!);
              }
              
              // Subscribe to new club
              await _notificationService.subscribeToClub(newValue);
              
              // Update user with new club
              final updatedUser = User(
                id: _currentUser!.id,
                name: _currentUser!.name,
                email: _currentUser!.email,
                language: _currentUser!.language,
                favClubId: newValue,
                profileImageUrl: _currentUser!.profileImageUrl,
              );
              
              // Save preference
              final prefs = await SharedPreferences.getInstance();
              await prefs.setString('favorite_club_id', newValue);
              
              // Update state - this will rebuild all tabs with new user
              setState(() {
                _currentUser = updatedUser;
                _currentIndex = 0; // Switch to MyClubTab
              });
            }
          },
          items: _clubs.map((Club club) {
            final isSelected = _currentUser?.favClubId == club.id;
            return DropdownMenuItem<String>(
              value: club.id,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                decoration: BoxDecoration(
                  color: isSelected
                      ? AppColors.buttonGreenEnd.withOpacity(0.2)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.sports_soccer, color: AppColors.buttonGreenEnd, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        club.name,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isSelected)
                      const Icon(
                        Icons.check_circle,
                        color: AppColors.buttonGreenEnd,
                        size: 18,
                      ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  String _getSelectClubPlaceholder() {
    final lang = _currentUser?.language ?? 'en';
    if (lang == 'am') return 'ክለብ ይምረጡ';
    if (lang == 'om') return 'Kilaba filadhaa';
    return 'Select Club';
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
      MyClubTab(
        key: ValueKey(_currentUser!.favClubId ?? 'no_club'),
        user: _currentUser!,
      ),
      AllNewsTab(user: _currentUser!),
      HighlightsTab(user: _currentUser!),
    ];

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons for dark background
        statusBarBrightness: Brightness.dark, // For iOS
      ),
      child: FloatingReactionsOverlay(
        child: Scaffold(
          body: Container(
          decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
          child: SafeArea(
            child: Column(
              children: [
                // Custom Header
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: [
                      // Club Dropdown (Left side)
                      _buildClubDropdown(),
                      const Spacer(),
                      // Language Dropdown
                      _buildLanguageDropdown(),
                      const SizedBox(width: 4),
                      // Notification Icon with Badge
                      Stack(
                        clipBehavior: Clip.none,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                            onPressed: _showNotifications,
                            onLongPress: _simulateNotification, // Long press to test
                            tooltip: 'Notifications (Long press to test)',
                            padding: const EdgeInsets.all(8),
                            constraints: const BoxConstraints(),
                          ),
                          if (_unreadNotificationCount > 0)
                            Positioned(
                              right: 2,
                              top: 2,
                              child: Container(
                                padding: EdgeInsets.all(_unreadNotificationCount > 9 ? 3 : 4),
                                decoration: BoxDecoration(
                                  color: AppColors.errorRed,
                                  shape: BoxShape.circle,
                                  border: Border.all(color: AppColors.darkGreen, width: 1.5),
                                  boxShadow: [
                                    BoxShadow(
                                      color: AppColors.errorRed.withOpacity(0.5),
                                      blurRadius: 4,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                                constraints: BoxConstraints(
                                  minWidth: _unreadNotificationCount > 9 ? 20 : 18,
                                  minHeight: _unreadNotificationCount > 9 ? 20 : 18,
                                ),
                                child: Center(
                                  child: Text(
                                    _unreadNotificationCount > 99 ? '99+' : '$_unreadNotificationCount',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: _unreadNotificationCount > 9 ? 9 : 10,
                                      fontWeight: FontWeight.bold,
                                      height: 1.1,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Tab Content
                Expanded(
                  child: AnimatedSwitcher(
                    duration: const Duration(milliseconds: 300),
                    switchInCurve: Curves.easeInOut,
                    switchOutCurve: Curves.easeInOut,
                    transitionBuilder: (Widget child, Animation<double> animation) {
                      return FadeTransition(
                        opacity: animation,
                        child: SlideTransition(
                          position: Tween<Offset>(
                            begin: const Offset(0.05, 0),
                            end: Offset.zero,
                          ).animate(animation),
                          child: child,
                        ),
                      );
                    },
                    child: Container(
                      key: ValueKey<int>(_currentIndex),
                      child: tabs[_currentIndex],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        bottomNavigationBar: Theme(
          data: Theme.of(context).copyWith(
            splashColor: Colors.transparent,
            highlightColor: Colors.transparent,
          ),
          child: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) => setState(() => _currentIndex = index),
            type: BottomNavigationBarType.fixed,
            backgroundColor: AppColors.darkGreen,
            selectedItemColor: AppColors.buttonGreenEnd,
            unselectedItemColor: AppColors.textGrey,
            selectedFontSize: 12,
            unselectedFontSize: 11,
            elevation: 0,
            enableFeedback: false,
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
        ),
      ),
      ),
    );
  }
}
