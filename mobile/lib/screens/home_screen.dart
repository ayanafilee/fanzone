import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/club.dart';
import '../services/notification_service.dart';
import '../services/club_service.dart';
import '../widgets/floating_reaction_animation.dart';
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
  final _clubService = ClubService();
  List<Club> _clubs = [];
  bool _isLoadingClubs = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light, // White icons
        statusBarBrightness: Brightness.dark, // For iOS
      ),
    );
    _loadUserPreferences();
    _loadClubs();
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
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LanguageSelectionScreen()),
      (route) => false,
    );
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
                      // Notification Icon
                      IconButton(
                        icon: const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                        onPressed: _showNotifications,
                        tooltip: 'Notifications',
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(),
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
      ),
      ),
    );
  }
}
