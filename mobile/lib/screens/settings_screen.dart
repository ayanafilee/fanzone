import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/club.dart';
import '../services/club_service.dart';
import '../services/notification_service.dart';
import 'language_selection_screen.dart';
import 'saved_for_later_screen.dart';

class SettingsScreen extends StatefulWidget {
  final User user;

  const SettingsScreen({
    super.key,
    required this.user,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _clubService = ClubService();
  final _notificationService = NotificationService();
  List<Club> _clubs = [];
  String? _selectedClubId;
  bool _isLoading = true;
  bool _isSaving = false;

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
    _selectedClubId = widget.user.favClubId;
    _loadClubs();
  }

  Future<void> _loadClubs() async {
    try {
      final clubs = await _clubService.getClubsPublic();
      setState(() {
        _clubs = clubs;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading clubs: $e');
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_getText('error_loading_clubs')),
            backgroundColor: AppColors.errorRed,
          ),
        );
      }
    }
  }

  String _getText(String key) {
    final lang = widget.user.language;
    
    final texts = {
      'settings': {
        'en': 'Settings',
        'am': 'ቅንብሮች',
        'om': 'Qindaa\'ina',
      },
      'my_club': {
        'en': 'My Club',
        'am': 'የእኔ ክለብ',
        'om': 'Kilaba Koo',
      },
      'change_club': {
        'en': 'Change Club',
        'am': 'ክለብ ቀይር',
        'om': 'Kilaba Jijjiiri',
      },
      'select_club': {
        'en': 'Select your favorite club',
        'am': 'የሚወዱትን ክለብ ይምረጡ',
        'om': 'Kilaba jaallattu filadhaa',
      },
      'language': {
        'en': 'Language',
        'am': 'ቋንቋ',
        'om': 'Afaan',
      },
      'save_changes': {
        'en': 'Save Changes',
        'am': 'ለውጦችን አስቀምጥ',
        'om': 'Jijjiirama Olkaa\'i',
      },
      'select_club_message': {
        'en': 'Please select a club',
        'am': 'እባክዎ ክለብ ይምረጡ',
        'om': 'Maaloo kilaba filadhaa',
      },
      'changes_saved': {
        'en': 'Changes saved successfully',
        'am': 'ለውጦች በተሳካ ሁኔታ ተቀምጠዋል',
        'om': 'Jijjiiramni milkaa\'inaan olkaa\'ame',
      },
      'error_saving': {
        'en': 'Error saving changes',
        'am': 'ለውጦችን በማስቀመጥ ላይ ስህተት',
        'om': 'Jijjiirama olkaa\'uutti dogoggora',
      },
      'error_loading_clubs': {
        'en': 'Unable to load clubs',
        'am': 'ክለቦችን መጫን አልተቻለም',
        'om': 'Kilabota fe\'uun hin danda\'amne',
      },
      'no_clubs': {
        'en': 'No clubs available',
        'am': 'ምንም ክለቦች የሉም',
        'om': 'Kilabonni hin jiran',
      },
      'logout': {
        'en': 'Logout',
        'am': 'ውጣ',
        'om': 'Ba\'i',
      },
      'logout_confirm': {
        'en': 'Are you sure you want to logout?',
        'am': 'መውጣት ይፈልጋሉ?',
        'om': 'Dhugumatti ba\'uu barbaadduu?',
      },
      'cancel': {
        'en': 'Cancel',
        'am': 'ሰርዝ',
        'om': 'Dhiisi',
      },
      'saved_for_later': {
        'en': 'Saved for Later',
        'am': 'ለኋላ የተቀመጠ',
        'om': 'Booda\'aaf Olkaa\'ame',
      },
      'view_saved': {
        'en': 'View items you saved from notifications',
        'am': 'ከማሳወቂያዎች የቀመጧቸውን ነገሮች ይመልከቱ',
        'om': 'Wantoota beeksisa irraa olkaa\'ame ilaali',
      },
    };
    
    return texts[key]?[lang] ?? texts[key]?['en'] ?? key;
  }

  Future<void> _saveChanges() async {
    if (_selectedClubId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getText('select_club_message')),
          backgroundColor: AppColors.warningYellow,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final oldClubId = widget.user.favClubId;
      
      // Unsubscribe from old club if it exists
      if (oldClubId != null && oldClubId.isNotEmpty && oldClubId != _selectedClubId) {
        await _notificationService.unsubscribeFromClub(oldClubId);
      }
      
      // Save new club preference
      await prefs.setString('favorite_club_id', _selectedClubId!);
      
      // Subscribe to new club
      await _notificationService.subscribeToClub(_selectedClubId!);

      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getText('changes_saved')),
          backgroundColor: AppColors.buttonGreenEnd,
        ),
      );
      
      // Return to home screen with refresh
      Navigator.of(context).pop(true);
    } catch (e) {
      print('Error saving changes: $e');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getText('error_saving')),
          backgroundColor: AppColors.errorRed,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.darkGreen,
        title: Text(
          _getText('logout'),
          style: const TextStyle(color: Colors.white),
        ),
        content: Text(
          _getText('logout_confirm'),
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              _getText('cancel'),
              style: const TextStyle(color: AppColors.textGrey),
            ),
          ),
          TextButton(
            onPressed: () async {
              final prefs = await SharedPreferences.getInstance();
              await prefs.clear();
              
              if (!mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const LanguageSelectionScreen()),
                (route) => false,
              );
            },
            child: Text(
              _getText('logout'),
              style: const TextStyle(color: AppColors.errorRed),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
        child: SafeArea(
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back, color: Colors.white),
                      onPressed: () => Navigator.pop(context),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _getText('settings'),
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Club Section
                      Text(
                        _getText('my_club'),
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _getText('select_club'),
                        style: const TextStyle(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                      const SizedBox(height: 16),
                      
                      // Clubs Grid
                      _isLoading
                          ? const Center(
                              child: Padding(
                                padding: EdgeInsets.all(32.0),
                                child: CircularProgressIndicator(
                                  color: AppColors.buttonGreenEnd,
                                ),
                              ),
                            )
                          : _clubs.isEmpty
                              ? Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(32.0),
                                    child: Column(
                                      children: [
                                        const Icon(
                                          Icons.sports_soccer,
                                          size: 48,
                                          color: Colors.white54,
                                        ),
                                        const SizedBox(height: 16),
                                        Text(
                                          _getText('no_clubs'),
                                          style: const TextStyle(
                                            color: Colors.white,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                )
                              : GridView.builder(
                                  shrinkWrap: true,
                                  physics: const NeverScrollableScrollPhysics(),
                                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    crossAxisSpacing: 12,
                                    mainAxisSpacing: 12,
                                    childAspectRatio: 1.1,
                                  ),
                                  itemCount: _clubs.length,
                                  itemBuilder: (context, index) {
                                    final club = _clubs[index];
                                    final isSelected = _selectedClubId == club.id;
                                    return InkWell(
                                      onTap: () => setState(() => _selectedClubId = club.id),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: isSelected
                                              ? AppColors.accentGreen
                                              : AppColors.inputBackground,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(
                                            color: isSelected
                                                ? AppColors.buttonGreenEnd
                                                : Colors.transparent,
                                            width: 2,
                                          ),
                                        ),
                                        child: Column(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            Container(
                                              width: 50,
                                              height: 50,
                                              decoration: BoxDecoration(
                                                color: isSelected
                                                    ? AppColors.buttonGreenEnd
                                                    : AppColors.accentGreen,
                                                borderRadius: BorderRadius.circular(25),
                                              ),
                                              child: Icon(
                                                Icons.sports_soccer,
                                                size: 30,
                                                color: isSelected
                                                    ? AppColors.darkGreen
                                                    : Colors.white,
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            Padding(
                                              padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                              child: Text(
                                                club.name,
                                                textAlign: TextAlign.center,
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: isSelected
                                                      ? FontWeight.bold
                                                      : FontWeight.normal,
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    );
                                  },
                                ),
                      
                      const SizedBox(height: 32),
                      
                      // Saved for Later Section
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.accentGreen,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(
                            Icons.bookmark,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        title: Text(
                          _getText('saved_for_later'),
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        subtitle: Text(
                          _getText('view_saved'),
                          style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                        trailing: const Icon(
                          Icons.arrow_forward_ios,
                          color: Colors.white54,
                          size: 16,
                        ),
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SavedForLaterScreen(user: widget.user),
                            ),
                          );
                        },
                      ),
                      
                      const SizedBox(height: 32),
                      
                      // Logout Button
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: _showLogoutDialog,
                          icon: const Icon(Icons.logout, color: AppColors.errorRed),
                          label: Text(
                            _getText('logout'),
                            style: const TextStyle(
                              color: AppColors.errorRed,
                              fontSize: 16,
                            ),
                          ),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            side: const BorderSide(color: AppColors.errorRed),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              // Save Button
              Container(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppColors.buttonGradient,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: ElevatedButton(
                      onPressed: _isSaving ? null : _saveChanges,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(28),
                        ),
                      ),
                      child: _isSaving
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(
                              _getText('save_changes'),
                              style: const TextStyle(
                                fontSize: 18,
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
