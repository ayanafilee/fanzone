import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/auth_service.dart';
import '../services/club_service.dart';
import '../models/club.dart';
import '../config/app_colors.dart';
import 'my_club_screen.dart';

class ClubSelectionScreen extends StatefulWidget {
  final String name;
  final String email;
  final String password;
  final String language;

  const ClubSelectionScreen({
    super.key,
    required this.name,
    required this.email,
    required this.password,
    required this.language,
  });

  @override
  State<ClubSelectionScreen> createState() => _ClubSelectionScreenState();
}

class _ClubSelectionScreenState extends State<ClubSelectionScreen> {
  final _authService = AuthService();
  final _clubService = ClubService();
  List<Club> _clubs = [];
  String? _selectedClubId;
  bool _isLoading = true;
  bool _isRegistering = false;

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
    print('🟢 ClubSelectionScreen: Starting to load clubs...');
    try {
      // Try to fetch clubs without authentication first
      // If the endpoint requires auth, this will fail and we'll handle it
      print('🟢 ClubSelectionScreen: Calling club service...');
      final clubs = await _clubService.getClubs();
      print('🟢 ClubSelectionScreen: Received ${clubs.length} clubs');
      setState(() {
        _clubs = clubs;
        _isLoading = false;
      });
      print('🟢 ClubSelectionScreen: State updated successfully');
    } catch (e) {
      print('❌ ClubSelectionScreen: Error loading clubs = $e');
      print('❌ ClubSelectionScreen: Error type = ${e.runtimeType}');
      // If clubs endpoint requires auth, we need to register first without club
      // then update the favorite club later, or make the endpoint public
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Unable to load clubs: ${e.toString()}'),
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _register() async {
    if (_selectedClubId == null && _clubs.isNotEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select a favorite club'),
          backgroundColor: AppColors.warningYellow,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isRegistering = true);

    try {
      await _authService.register(
        name: widget.name,
        email: widget.email,
        password: widget.password,
        language: widget.language,
        favClubId: _selectedClubId ?? '',
      );

      // Auto login after registration
      await _authService.login(widget.email, widget.password);

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const MyClubScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      
      // Parse error message for user-friendly display
      String errorMessage = 'Registration failed. Please try again.';
      
      if (e.toString().contains('Email already exists') || e.toString().contains('already registered')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (e.toString().contains('Invalid club')) {
        errorMessage = 'Invalid club selection. Please try again.';
      } else if (e.toString().contains('Network') || e.toString().contains('Connection')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (e.toString().contains('timeout')) {
        errorMessage = 'Connection timeout. Please try again.';
      }
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: AppColors.errorRed,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 4),
          action: SnackBarAction(
            label: 'Dismiss',
            textColor: Colors.white,
            onPressed: () {},
          ),
        ),
      );
    } finally {
      if (mounted) setState(() => _isRegistering = false);
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
                IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
                const SizedBox(height: 40),
                const Text(
                  'Select Your Favorite Club',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Choose your favorite football club to get personalized content',
                  style: TextStyle(fontSize: 16, color: Colors.white70),
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
                                        if (club.logoUrl.isNotEmpty)
                                          Image.network(
                                            club.logoUrl,
                                            width: 60,
                                            height: 60,
                                            errorBuilder: (_, __, ___) => const Icon(
                                              Icons.sports_soccer,
                                              size: 60,
                                              color: Colors.white54,
                                            ),
                                          )
                                        else
                                          const Icon(Icons.sports_soccer, size: 60, color: Colors.white54),
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
                      onPressed: _isRegistering ? null : _register,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
                      ),
                      child: _isRegistering
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Complete Registration', style: TextStyle(fontSize: 18, color: Colors.white, fontWeight: FontWeight.bold)),
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
