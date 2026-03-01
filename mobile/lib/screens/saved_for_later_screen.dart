import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../config/app_colors.dart';
import '../models/user.dart';

class SavedForLaterScreen extends StatefulWidget {
  final User user;

  const SavedForLaterScreen({
    super.key,
    required this.user,
  });

  @override
  State<SavedForLaterScreen> createState() => _SavedForLaterScreenState();
}

class _SavedForLaterScreenState extends State<SavedForLaterScreen> {
  List<Map<String, dynamic>> _savedItems = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadSavedItems();
  }

  Future<void> _loadSavedItems() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedStrings = prefs.getStringList('saved_for_later') ?? [];
      
      setState(() {
        _savedItems = savedStrings
            .map((str) => jsonDecode(str) as Map<String, dynamic>)
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading saved items: $e');
      setState(() => _isLoading = false);
    }
  }

  Future<void> _removeItem(int index) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedStrings = prefs.getStringList('saved_for_later') ?? [];
      savedStrings.removeAt(index);
      await prefs.setStringList('saved_for_later', savedStrings);
      
      setState(() {
        _savedItems.removeAt(index);
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Item removed'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      print('Error removing item: $e');
    }
  }

  String _getText(String key) {
    final lang = widget.user.language;
    
    final texts = {
      'saved_for_later': {
        'en': 'Saved for Later',
        'am': 'ለኋላ የተቀመጠ',
        'om': 'Booda\'aaf Olkaa\'ame',
      },
      'no_saved_items': {
        'en': 'No saved items',
        'am': 'ምንም የተቀመጠ ነገር የለም',
        'om': 'Wanti olkaa\'ame hin jiru',
      },
      'tap_watch_later': {
        'en': 'Tap "Watch Later" or "Read Later" on notifications to save items here',
        'am': 'ነገሮችን እዚህ ለማስቀመጥ በማሳወቂያዎች ላይ "በኋላ ተመልከት" ወይም "በኋላ አንብብ" የሚለውን ይንኩ',
        'om': 'Wantoota asitti olkaa\'uuf beeksisa irratti "Booda Ilaali" ykn "Booda Dubbisi" tuqi',
      },
      'open': {
        'en': 'Open',
        'am': 'ክፈት',
        'om': 'Bani',
      },
      'remove': {
        'en': 'Remove',
        'am': 'አስወግድ',
        'om': 'Haqi',
      },
    };
    
    return texts[key]?[lang] ?? texts[key]?['en'] ?? key;
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
                      _getText('saved_for_later'),
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
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.buttonGreenEnd,
                        ),
                      )
                    : _savedItems.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(32.0),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.bookmark_border,
                                    size: 64,
                                    color: Colors.white54,
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    _getText('no_saved_items'),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _getText('tap_watch_later'),
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _savedItems.length,
                            itemBuilder: (context, index) {
                              final item = _savedItems[index];
                              final type = item['type'];
                              final title = type == 'highlight'
                                  ? item['match_title'] ?? 'Highlight'
                                  : item['title'] ?? 'News';
                              
                              return Card(
                                color: AppColors.inputBackground,
                                margin: const EdgeInsets.only(bottom: 12),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: ListTile(
                                  contentPadding: const EdgeInsets.all(12),
                                  leading: Container(
                                    width: 60,
                                    height: 60,
                                    decoration: BoxDecoration(
                                      color: AppColors.accentGreen,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Icon(
                                      type == 'highlight'
                                          ? Icons.play_circle
                                          : Icons.article,
                                      color: Colors.white,
                                      size: 32,
                                    ),
                                  ),
                                  title: Text(
                                    title,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  subtitle: Text(
                                    type == 'highlight' ? 'Highlight' : 'News',
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                    ),
                                  ),
                                  trailing: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      IconButton(
                                        icon: const Icon(
                                          Icons.open_in_new,
                                          color: AppColors.buttonGreenEnd,
                                        ),
                                        onPressed: () {
                                          // TODO: Open content
                                          ScaffoldMessenger.of(context).showSnackBar(
                                            SnackBar(
                                              content: Text(_getText('open')),
                                            ),
                                          );
                                        },
                                        tooltip: _getText('open'),
                                      ),
                                      IconButton(
                                        icon: const Icon(
                                          Icons.delete_outline,
                                          color: AppColors.errorRed,
                                        ),
                                        onPressed: () => _removeItem(index),
                                        tooltip: _getText('remove'),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
