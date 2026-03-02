import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../services/club_service.dart';
import '../models/club.dart';
import 'home_screen.dart';

class LanguageSelectionScreen extends StatefulWidget {
  const LanguageSelectionScreen({super.key});

  @override
  State<LanguageSelectionScreen> createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  String? _selectedLanguage;
  String? _selectedClubId;
  final _clubService = ClubService();
  List<Club> _clubs = [];
  bool _isLoadingClubs = false;

  final List<Map<String, String>> _languages = [
    {'code': 'en', 'name': 'English'},
    {'code': 'am', 'name': 'Amharic'},
    {'code': 'om', 'name': 'Afaan Oromo'},
  ];

  @override
  void initState() {
    super.initState();
    // Set status bar to light icons
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
        statusBarBrightness: Brightness.dark,
      ),
    );
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

  String _getTitle() {
    if (_selectedLanguage == 'am') return 'ቋንቋ እና ክለብ ይምረጡ';
    if (_selectedLanguage == 'om') return 'Afaan fi Kilaba filadhaa';
    return 'Select Language & Club';
  }

  String _getSubtitle() {
    if (_selectedLanguage == 'am') return 'የእርስዎን ቋንቋ እና የሚደግፉትን ክለብ ይምረጡ';
    if (_selectedLanguage == 'om') return 'Afaan fi kilaba deeggartan filadhaa';
    return 'Choose your language and favorite club';
  }

  String _getLanguageLabel() {
    if (_selectedLanguage == 'am') return 'ቋንቋ';
    if (_selectedLanguage == 'om') return 'Afaan';
    return 'Language';
  }

  String _getClubLabel() {
    if (_selectedLanguage == 'am') return 'ክለብ';
    if (_selectedLanguage == 'om') return 'Kilaba';
    return 'Club';
  }

  String _getSelectClubPlaceholder() {
    if (_selectedLanguage == 'am') return 'ክለብ ይምረጡ';
    if (_selectedLanguage == 'om') return 'Kilaba filadhaa';
    return 'Select a club';
  }

  String _getContinueButton() {
    if (_selectedLanguage == 'am') return 'ቀጥል';
    if (_selectedLanguage == 'om') return 'Itti fufi';
    return 'Continue';
  }

  String _getSelectLanguageMessage() {
    if (_selectedLanguage == 'am') return 'እባክዎ ቋንቋ ይምረጡ';
    if (_selectedLanguage == 'om') return 'Maaloo afaan filadhaa';
    return 'Please select a language';
  }

  String _getSelectClubMessage() {
    if (_selectedLanguage == 'am') return 'እባክዎ ክለብ ይምረጡ';
    if (_selectedLanguage == 'om') return 'Maaloo kilaba filadhaa';
    return 'Please select a club';
  }

  Future<void> _continue() async {
    if (_selectedLanguage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getSelectLanguageMessage()),
          backgroundColor: AppColors.warningYellow,
        ),
      );
      return;
    }

    if (_selectedClubId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getSelectClubMessage()),
          backgroundColor: AppColors.warningYellow,
        ),
      );
      return;
    }

    try {
      // Save preferences locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('language', _selectedLanguage!);
      await prefs.setString('favorite_club_id', _selectedClubId!);
      await prefs.setBool('onboarding_complete', true);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Error saving preferences. Please try again.'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 40),
                Text(
                  _getTitle(),
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(
                  _getSubtitle(),
                  style: const TextStyle(fontSize: 16, color: Colors.white70),
                ),
                const SizedBox(height: 40),
                Expanded(
                  child: SingleChildScrollView(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Language Section
                        Text(
                          _getLanguageLabel(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...List.generate(_languages.length, (index) {
                          final lang = _languages[index];
                          final isSelected = _selectedLanguage == lang['code'];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12.0),
                            child: InkWell(
                              onTap: () => setState(() => _selectedLanguage = lang['code']),
                              child: Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.accentGreen : AppColors.inputBackground,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSelected ? AppColors.buttonGreenEnd : Colors.transparent,
                                    width: 2,
                                  ),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                                      color: isSelected ? Colors.white : Colors.white54,
                                    ),
                                    const SizedBox(width: 12),
                                    Text(
                                      lang['name']!,
                                      style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                        const SizedBox(height: 32),
                        // Club Section
                        Text(
                          _getClubLabel(),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.inputBackground,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _selectedClubId != null 
                                  ? AppColors.buttonGreenEnd 
                                  : AppColors.inputBorder.withOpacity(0.3),
                              width: _selectedClubId != null ? 2 : 1,
                            ),
                          ),
                          child: _isLoadingClubs
                              ? const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: Center(
                                    child: CircularProgressIndicator(
                                      color: AppColors.buttonGreenEnd,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                )
                              : DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _selectedClubId,
                                    hint: Text(
                                      _getSelectClubPlaceholder(),
                                      style: const TextStyle(color: Colors.white54),
                                    ),
                                    isExpanded: true,
                                    dropdownColor: AppColors.darkGreen,
                                    icon: const Icon(Icons.arrow_drop_down, color: Colors.white),
                                    menuMaxHeight: 300,
                                    borderRadius: BorderRadius.circular(12),
                                    onChanged: (String? newValue) {
                                      setState(() => _selectedClubId = newValue);
                                    },
                                    items: _clubs.map((Club club) {
                                      return DropdownMenuItem<String>(
                                        value: club.id,
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.sports_soccer,
                                              color: AppColors.buttonGreenEnd,
                                              size: 20,
                                            ),
                                            const SizedBox(width: 12),
                                            Expanded(
                                              child: Text(
                                                club.name,
                                                style: const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 15,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    }).toList(),
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppColors.buttonGradient,
                      borderRadius: BorderRadius.circular(28),
                    ),
                    child: ElevatedButton(
                      onPressed: _continue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                      ),
                      child: Text(_getContinueButton(), style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
