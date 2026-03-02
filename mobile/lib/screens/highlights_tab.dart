import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/feed_item.dart';
import '../models/reaction.dart';
import '../services/feed_service.dart';
import '../services/reaction_service.dart';
import '../widgets/telegram_reaction_bar.dart';
import '../widgets/highlight_card.dart';

class HighlightsTab extends StatefulWidget {
  final User user;

  const HighlightsTab({super.key, required this.user});

  @override
  State<HighlightsTab> createState() => _HighlightsTabState();
}

class _HighlightsTabState extends State<HighlightsTab> {
  final _feedService = FeedService();
  final _reactionService = ReactionService();
  List<FeedItem> _highlights = [];
  List<FeedItem> _filteredHighlights = [];
  bool _isLoading = true;
  String? _error;
  Set<String> _bookmarkedIds = {};
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
    _loadHighlights();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadBookmarks() async {
    final prefs = await SharedPreferences.getInstance();
    final bookmarks = prefs.getStringList('bookmarks') ?? [];
    setState(() {
      _bookmarkedIds = bookmarks.toSet();
    });
  }

  Future<void> _toggleBookmark(String itemId) async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      if (_bookmarkedIds.contains(itemId)) {
        _bookmarkedIds.remove(itemId);
      } else {
        _bookmarkedIds.add(itemId);
      }
    });
    await prefs.setStringList('bookmarks', _bookmarkedIds.toList());
    
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _bookmarkedIds.contains(itemId)
              ? (widget.user.language == 'am' ? 'ተቀምጧል' : widget.user.language == 'om' ? 'Kuufameera' : 'Bookmarked')
              : (widget.user.language == 'am' ? 'ተወግዷል' : widget.user.language == 'om' ? 'Haqameera' : 'Removed'),
        ),
        duration: const Duration(seconds: 1),
        backgroundColor: AppColors.accentGreen,
      ),
    );
  }

  void _applyFilters() {
    setState(() {
      _filteredHighlights = _highlights.where((item) {
        // Filter by search query
        if (_searchController.text.isNotEmpty) {
          final query = _searchController.text.toLowerCase();
          if (item.highlight != null) {
            final title = item.highlight!.title.toLowerCase();
            return title.contains(query);
          }
        }
        return true;
      }).toList();
    });
  }

  Future<void> _loadHighlights() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Get all feed and filter for highlights only
      final allFeed = await _feedService.getAllFeed();
      final highlights = allFeed.where((item) => item.type == 'highlight').toList();
      
      setState(() {
        _highlights = highlights;
        _filteredHighlights = highlights;
        _isLoading = false;
      });
      _applyFilters();
    } catch (e) {
      print('Error loading highlights: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _openYouTubeVideo(String videoUrl) async {
    final uri = Uri.parse(videoUrl);
    
    try {
      // Try to open in YouTube app first
      final youtubeAppUrl = videoUrl.replaceFirst('https://www.youtube.com', 'youtube://');
      final youtubeAppUri = Uri.parse(youtubeAppUrl);
      
      if (await canLaunchUrl(youtubeAppUri)) {
        await launchUrl(youtubeAppUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(uri)) {
        // Fallback to browser
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw Exception('Could not launch video');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open video: ${e.toString()}'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    }
  }

  String _getEmptyMessage() {
    final lang = widget.user.language;
    if (lang == 'am') return 'ምንም ማጠቃለያ ቪዲዮ የለም';
    if (lang == 'om') return 'Cuunfaan hin jiru';
    return 'No highlights yet';
  }

  String _getEmptySubtitle() {
    final lang = widget.user.language;
    if (lang == 'am') return 'በቅርቡ ይመለሳል';
    if (lang == 'om') return 'Dhiyootti deebi\'a';
    return 'Check back soon for match highlights';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
      child: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.darkGreen.withOpacity(0.3),
              border: Border(
                bottom: BorderSide(
                  color: AppColors.inputBorder.withOpacity(0.2),
                  width: 1,
                ),
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                color: AppColors.inputBackground.withOpacity(0.8),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppColors.inputBorder.withOpacity(0.5),
                  width: 1,
                ),
              ),
              child: TextField(
                controller: _searchController,
                style: const TextStyle(color: Colors.white, fontSize: 15),
                cursorColor: Colors.white,
                decoration: InputDecoration(
                  hintText: widget.user.language == 'am'
                      ? 'ቪዲዮ ፈልግ...'
                      : widget.user.language == 'om'
                          ? 'Viidiyoo barbaadi...'
                          : 'Search videos...',
                  hintStyle: TextStyle(color: AppColors.textGrey.withOpacity(0.7), fontSize: 15),
                  prefixIcon: const Icon(Icons.search, color: Colors.white70, size: 22),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: const Icon(Icons.clear, color: Colors.white70, size: 20),
                          onPressed: () {
                            _searchController.clear();
                            _applyFilters();
                          },
                        )
                      : null,
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                onChanged: (value) {
                  _applyFilters();
                },
              ),
            ),
          ),
          // Content
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(color: AppColors.buttonGreenEnd),
                  )
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.error_outline, size: 64, color: AppColors.errorRed),
                            const SizedBox(height: 16),
                            const Text(
                              'Failed to load highlights',
                              style: TextStyle(color: Colors.white, fontSize: 18),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Please check your connection',
                              style: TextStyle(color: AppColors.textGrey),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: _loadHighlights,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentGreen,
                              ),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _filteredHighlights.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.search_off, size: 64, color: AppColors.textGrey),
                                const SizedBox(height: 16),
                                Text(
                                  widget.user.language == 'am'
                                      ? 'ምንም አልተገኘም'
                                      : widget.user.language == 'om'
                                          ? 'Homaa hin argamne'
                                          : 'No results found',
                                  style: const TextStyle(color: Colors.white, fontSize: 18),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  widget.user.language == 'am'
                                      ? 'ሌላ ፍለጋ ይሞክሩ'
                                      : widget.user.language == 'om'
                                          ? 'Barbaadii biraa yaali'
                                          : 'Try a different search',
                                  style: const TextStyle(color: AppColors.textGrey),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadHighlights,
                            color: AppColors.buttonGreenEnd,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredHighlights.length,
                              itemBuilder: (context, index) {
                                final item = _filteredHighlights[index];
                                if (item.highlight != null) {
                                  return _buildHighlightCard(item.highlight!);
                                }
                                return const SizedBox.shrink();
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
  
  Future<void> _handleReaction(String contentId, String contentType, ReactionType type) async {
    try {
      final counts = await _reactionService.addReaction(
        contentType: contentType,
        contentId: contentId,
        reactionType: type,
      );
      
      setState(() {
        // Update would reflect in UI on next load
        // For immediate feedback, you could maintain local state
      });
    } catch (e) {
      print('Error adding reaction: $e');
    }
  }
  
  Future<void> _handleRemoveReaction(String contentId, String contentType) async {
    try {
      await _reactionService.removeReaction(
        contentType: contentType,
        contentId: contentId,
      );
      
      setState(() {
        // Update would reflect in UI on next load
      });
    } catch (e) {
      print('Error removing reaction: $e');
    }
  }

  Widget _buildHighlightCard(highlight) {
    final itemId = 'highlight_${highlight.id}';
    final isBookmarked = _bookmarkedIds.contains(itemId);

    return HighlightCard(
      highlight: highlight,
      isBookmarked: isBookmarked,
      onBookmarkToggle: () => _toggleBookmark(itemId),
      onReactionTap: (type) => _handleReaction(highlight.id, 'highlight', type),
      onRemoveReaction: () => _handleRemoveReaction(highlight.id, 'highlight'),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes}m ago';
      }
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return '${date.day}/${date.month}/${date.year}';
    }
  }
}
