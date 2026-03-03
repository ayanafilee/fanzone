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
import '../widgets/cached_image.dart';
import '../utils/page_transitions.dart';
import 'news_detail_screen.dart';

class AllNewsTab extends StatefulWidget {
  final User user;

  const AllNewsTab({super.key, required this.user});

  @override
  State<AllNewsTab> createState() => _AllNewsTabState();
}

class _AllNewsTabState extends State<AllNewsTab> {
  final _feedService = FeedService();
  final _reactionService = ReactionService();
  List<FeedItem> _feedItems = [];
  List<FeedItem> _filteredItems = [];
  bool _isLoading = true;
  String? _error;
  String _filterType = 'all'; // 'all', 'news', 'highlight'
  Set<String> _bookmarkedIds = {};
  final TextEditingController _searchController = TextEditingController();
  final Map<String, ReactionCounts> _reactionCounts = {};
  final Map<String, ReactionType?> _userReactions = {};

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
    _loadFeed();
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
      _filteredItems = _feedItems.where((item) {
        // Filter by type
        if (_filterType != 'all' && item.type != _filterType) {
          return false;
        }
        
        // Filter by search query
        if (_searchController.text.isNotEmpty) {
          final query = _searchController.text.toLowerCase();
          if (item.type == 'news' && item.news != null) {
            final title = item.news!.getTitle(widget.user.language).toLowerCase();
            final body = item.news!.getBody(widget.user.language).toLowerCase();
            return title.contains(query) || body.contains(query);
          } else if (item.type == 'highlight' && item.highlight != null) {
            final title = item.highlight!.title.toLowerCase();
            return title.contains(query);
          }
        }
        
        return true;
      }).toList();
    });
  }

  Future<void> _loadFeed() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final items = await _feedService.getAllFeed();
      setState(() {
        _feedItems = items;
        _filteredItems = items;
        _isLoading = false;
      });
      _applyFilters();
    } catch (e) {
      print('Error loading all news: $e');
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
    if (lang == 'am') return 'ምንም ዜና የለም';
    if (lang == 'om') return 'Oduu hin jiru';
    return 'No news yet';
  }

  String _getEmptySubtitle() {
    final lang = widget.user.language;
    if (lang == 'am') return 'በቅርቡ ይመለሳል';
    if (lang == 'om') return 'Dhiyootti deebi\'a';
    return 'Check back soon';
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
      child: Column(
        children: [
          // Search and Filter Bar
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
            child: Column(
              children: [
                // Search Bar
                Container(
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
                          ? 'ፈልግ...'
                          : widget.user.language == 'om'
                              ? 'Barbaadi...'
                              : 'Search...',
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
                const SizedBox(height: 12),
                // Filter Chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildFilterChip(
                        'all',
                        widget.user.language == 'am'
                            ? 'ሁሉም'
                            : widget.user.language == 'om'
                                ? 'Hunda'
                                : 'All',
                        Icons.grid_view,
                      ),
                      const SizedBox(width: 10),
                      _buildFilterChip(
                        'news',
                        widget.user.language == 'am'
                            ? 'ዜና'
                            : widget.user.language == 'om'
                                ? 'Oduu'
                                : 'News',
                        Icons.article,
                      ),
                      const SizedBox(width: 10),
                      _buildFilterChip(
                        'highlight',
                        widget.user.language == 'am'
                            ? 'ቪዲዮ'
                            : widget.user.language == 'om'
                                ? 'Viidiyoo'
                                : 'Videos',
                        Icons.play_circle,
                      ),
                    ],
                  ),
                ),
              ],
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
                              'Failed to load news',
                              style: TextStyle(color: Colors.white, fontSize: 18),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Please check your connection',
                              style: TextStyle(color: AppColors.textGrey),
                            ),
                            const SizedBox(height: 24),
                            ElevatedButton(
                              onPressed: _loadFeed,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.accentGreen,
                              ),
                              child: const Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _filteredItems.isEmpty
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
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadFeed,
                            color: AppColors.buttonGreenEnd,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredItems.length,
                              itemBuilder: (context, index) {
                                final item = _filteredItems[index];
                                return _buildFeedCard(item);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String type, String label, IconData icon) {
    final isSelected = _filterType == type;
    return InkWell(
      onTap: () {
        setState(() {
          _filterType = type;
        });
        _applyFilters();
      },
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: isSelected
              ? LinearGradient(
                  colors: [AppColors.accentGreen, AppColors.buttonGreenEnd.withOpacity(0.8)],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                )
              : null,
          color: isSelected ? null : AppColors.inputBackground.withOpacity(0.6),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppColors.buttonGreenEnd : AppColors.inputBorder.withOpacity(0.4),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.buttonGreenEnd.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 18,
              color: isSelected ? Colors.white : Colors.white70,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ],
        ),
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
      
      if (!mounted) return;
      
      setState(() {
        // Update the feed items with new reaction counts
        _feedItems = _feedItems.map((item) {
          if (contentType == 'news' && item.news?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              news: item.news?.copyWith(reactions: counts, userReaction: type),
            );
          } else if (contentType == 'highlight' && item.highlight?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              highlight: item.highlight?.copyWith(reactions: counts, userReaction: type),
            );
          }
          return item;
        }).toList();
        
        // Also update filtered items
        _filteredItems = _filteredItems.map((item) {
          if (contentType == 'news' && item.news?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              news: item.news?.copyWith(reactions: counts, userReaction: type),
            );
          } else if (contentType == 'highlight' && item.highlight?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              highlight: item.highlight?.copyWith(reactions: counts, userReaction: type),
            );
          }
          return item;
        }).toList();
      });
    } catch (e) {
      print('Error adding reaction: $e');
    }
  }
  
  Future<void> _handleRemoveReaction(String contentId, String contentType) async {
    try {
      final counts = await _reactionService.removeReaction(
        contentType: contentType,
        contentId: contentId,
      );
      
      if (!mounted) return;
      
      setState(() {
        // Update the feed items with new reaction counts
        _feedItems = _feedItems.map((item) {
          if (contentType == 'news' && item.news?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              news: item.news?.copyWith(reactions: counts, clearUserReaction: true),
            );
          } else if (contentType == 'highlight' && item.highlight?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              highlight: item.highlight?.copyWith(reactions: counts, clearUserReaction: true),
            );
          }
          return item;
        }).toList();
        
        // Also update filtered items
        _filteredItems = _filteredItems.map((item) {
          if (contentType == 'news' && item.news?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              news: item.news?.copyWith(reactions: counts, clearUserReaction: true),
            );
          } else if (contentType == 'highlight' && item.highlight?.id == contentId) {
            return FeedItem(
              id: item.id,
              type: item.type,
              createdAt: item.createdAt,
              highlight: item.highlight?.copyWith(reactions: counts, clearUserReaction: true),
            );
          }
          return item;
        }).toList();
      });
    } catch (e) {
      print('Error removing reaction: $e');
    }
  }

  Widget _buildFeedCard(FeedItem item) {
    if (item.type == 'news' && item.news != null) {
      return _buildNewsCard(item.news!);
    } else if (item.type == 'highlight' && item.highlight != null) {
      return _buildHighlightCard(item.highlight!);
    }
    return const SizedBox.shrink();
  }

  Widget _buildNewsCard(news) {
    final title = news.getTitle(widget.user.language);
    final body = news.getBody(widget.user.language);
    final itemId = 'news_${news.id}';
    final isBookmarked = _bookmarkedIds.contains(itemId);

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: AppColors.newsCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () {
          navigateToPage(
            context,
            NewsDetailScreen(
              news: news,
              user: widget.user,
            ),
          ).then((_) {
            // Reload bookmarks when returning from detail screen
            _loadBookmarks();
          });
        },
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
          if (news.imageUrl.isNotEmpty)
            CachedImage(
              imageUrl: news.imageUrl,
              width: double.infinity,
              height: 200,
              fit: BoxFit.cover,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentGreen,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        news.category.toUpperCase(),
                        style: const TextStyle(
                          color: AppColors.buttonGreenEnd,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(Icons.public, size: 14, color: AppColors.textGrey),
                    const SizedBox(width: 4),
                    Text(
                      widget.user.language == 'am'
                          ? 'ሁሉም ክለቦች'
                          : widget.user.language == 'om'
                              ? 'Kilaboota hunda'
                              : 'All Clubs',
                      style: const TextStyle(
                        color: AppColors.textGrey,
                        fontSize: 10,
                      ),
                    ),
                    const Spacer(),
                    // Bookmark button
                    Container(
                      decoration: BoxDecoration(
                        color: isBookmarked 
                            ? AppColors.buttonGreenEnd.withOpacity(0.2) 
                            : AppColors.inputBackground.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: IconButton(
                        icon: Icon(
                          isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                          color: isBookmarked ? AppColors.buttonGreenEnd : Colors.white,
                          size: 22,
                        ),
                        onPressed: () => _toggleBookmark(itemId),
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(),
                        tooltip: isBookmarked ? 'Remove bookmark' : 'Bookmark',
                      ),
                    ),
                    const SizedBox(width: 8),
                    // Share button
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.inputBackground.withOpacity(0.5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.share, color: Colors.white, size: 22),
                        onPressed: () {
                          Share.share(
                            '$title\n\n$body\n\nShared from FanZone',
                            subject: title,
                          );
                        },
                        padding: const EdgeInsets.all(8),
                        constraints: const BoxConstraints(),
                        tooltip: 'Share',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  body,
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 14),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                // Telegram-Style Reaction Bar
                TelegramReactionBar(
                  counts: news.reactions,
                  userReaction: news.userReaction,
                  onReactionTap: (type) => _handleReaction(news.id, 'news', type),
                  onRemoveReaction: () => _handleRemoveReaction(news.id, 'news'),
                ),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatDate(news.createdAt),
                      style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                    ),
                    // Read More button
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppColors.accentGreen, AppColors.buttonGreenEnd],
                        ),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            widget.user.language == 'am'
                                ? 'ተጨማሪ አንብብ'
                                : widget.user.language == 'om'
                                    ? 'Dabalata Dubbisi'
                                    : 'Read More',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward,
                            color: Colors.white,
                            size: 14,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
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
