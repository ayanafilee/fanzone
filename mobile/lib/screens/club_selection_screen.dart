import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/club_service.dart';
import '../models/club.dart';
import '../config/app_colors.dart';
import 'home_screen.dart';

class ClubSelectionScreen extends StatefulWidget {
  final String language;

  const ClubSelectionScreen({
    super.key,
    required this.language,
  });

  @override
  State<ClubSelectionScreen> createState() => _ClubSelectionScreenState();
}

class _ClubSelectionScreenState extends State<ClubSelectionScreen> {
  final _clubService = ClubService();
  List<Club> _clubs = [];
  String? _selectedClubId;
  bool _isLoading = true;
  bool _isSaving = false;

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
            content: Text('Unable to load clubs. Please check your connection.'),
            backgroundColor: AppColors.errorRed,
          ),
        );
      }
    }
  }

  String _getTitle() {
    final lang = widget.language;
    if (lang == 'am') return 'የሚደግፉትን ክለብ ይምረጡ';
    if (lang == 'om') return 'Kilaba deeggartan filadhaa';
    return 'Select the club you support';
  }

  String _getSubtitle() {
    final lang = widget.language;
    if (lang == 'am') return 'የእርስዎን ተወዳጅ የእግር ኳስ ክለብ ይምረጡ';
    if (lang == 'om') return 'Kilaba kubbaa miilaa jaallattu filadhaa';
    return 'Choose your favorite football club';
  }

  String _getContinueButton() {
    final lang = widget.language;
    if (lang == 'am') return 'ቀጥል';
    if (lang == 'om') return 'Itti fufi';
    return 'Continue';
  }

  String _getSelectClubMessage() {
    final lang = widget.language;
    if (lang == 'am') return 'እባክዎ ክለብ ይምረጡ';
    if (lang == 'om') return 'Maaloo kilaba filadhaa';
    return 'Please select a club';
  }

  Future<void> _continue() async {
    if (_selectedClubId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_getSelectClubMessage()),
          backgroundColor: AppColors.warningYellow,
        ),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      // Save preferences locally
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('language', widget.language);
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
          content: Text('Error saving preferences. Please try again.'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    } finally {
      if (mounted) setState(() => _isSaving = false);
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
                  child: _isLoading
                      ? const Center(child: CircularProgressIndicator(color: AppColors.buttonGreenEnd))
                      : _clubs.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.sports_soccer, size: 64, color: Colors.white54),
                                  const SizedBox(height: 16),
                                  const Text(
                                    'No clubs available',
                                    style: TextStyle(color: Colors.white, fontSize: 18),
                                  ),
                                  const SizedBox(height: 8),
                                  const Text(
                                    'You can still complete registration\nand select a club later',
                                    textAlign: TextAlign.center,
                                    style: TextStyle(color: Colors.white70, fontSize: 14),
                                  ),
                                ],
                              ),
                            )
                          : GridView.builder(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                                childAspectRatio: 1,
                              ),
                              itemCount: _clubs.length,
                              itemBuilder: (context, index) {
                                final club = _clubs[index];
                                final isSelected = _selectedClubId == club.id;
                                return InkWell(
                                  onTap: () => setState(() => _selectedClubId = club.id),
                                  child: Container(
                                    decoration: BoxDecoration(
                                      color: isSelected ? AppColors.accentGreen : AppColors.inputBackground,
                                      borderRadius: BorderRadius.circular(16),
                                      border: Border.all(
                                        color: isSelected ? AppColors.buttonGreenEnd : Colors.transparent,
                                        width: 2,
                                      ),
                                    ),
                                    child: Column(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        // Generic football icon instead of club logo
                                        Container(
                                          width: 60,
                                          height: 60,
                                          decoration: BoxDecoration(
                                            color: isSelected ? AppColors.buttonGreenEnd : AppColors.accentGreen,
                                            borderRadius: BorderRadius.circular(30),
                                          ),
                                          child: Icon(
                                            Icons.sports_soccer,
                                            size: 36,
                                            color: isSelected ? AppColors.darkGreen : Colors.white,
                                          ),
                                        ),
                                        const SizedBox(height: 12),
                                        Padding(
                                          padding: const EdgeInsets.symmetric(horizontal: 8.0),
                                          child: Text(
                                            club.name,
                                            textAlign: TextAlign.center,
                                            maxLines: 2,
                                            overflow: TextOverflow.ellipsis,
                                            style: TextStyle(
                                              fontSize: 14,
                                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
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
                      onPressed: _isSaving ? null : _continue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                      ),
                      child: _isSaving
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(_getContinueButton(), style: const TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
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
