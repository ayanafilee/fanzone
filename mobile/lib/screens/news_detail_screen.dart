import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_colors.dart';
import '../models/news.dart';
import '../models/user.dart';
import '../models/reaction.dart';
import '../services/reaction_service.dart';
import '../widgets/telegram_reaction_bar.dart';
import '../widgets/floating_reaction_animation.dart';
import '../widgets/recent_reactions_display.dart';

class NewsDetailScreen extends StatefulWidget {
  final News news;
  final User user;

  const NewsDetailScreen({
    super.key,
    required this.news,
    required this.user,
  });

  @override
  State<NewsDetailScreen> createState() => _NewsDetailScreenState();
}

class _NewsDetailScreenState extends State<NewsDetailScreen> {
  bool _isBookmarked = false;
  final ScrollController _scrollController = ScrollController();
  bool _showTitle = false;
  final _reactionService = ReactionService();
  ReactionCounts _reactionCounts = ReactionCounts();
  ReactionType? _userReaction;
  final GlobalKey<RecentReactionsDisplayState> _recentReactionsKey = GlobalKey();

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
    _loadBookmarkStatus();
    _loadReactions();
    _scrollController.addListener(_onScroll);
  }
  
  Future<void> _loadReactions() async {
    // Initialize with data from news object
    setState(() {
      _reactionCounts = widget.news.reactions;
      _userReaction = widget.news.userReaction;
    });
    
    // Optionally fetch fresh data from server
    try {
      final counts = await _reactionService.getReactionCounts(
        contentType: 'news',
        contentId: widget.news.id,
      );
      
      setState(() {
        _reactionCounts = counts;
      });
    } catch (e) {
      print('Error loading reactions: $e');
    }
  }
  
  Future<void> _handleReaction(ReactionType type) async {
    try {
      // Show in recent reactions display
      _recentReactionsKey.currentState?.addReaction(type);
      
      final counts = await _reactionService.addReaction(
        contentType: 'news',
        contentId: widget.news.id,
        reactionType: type,
      );
      
      setState(() {
        _reactionCounts = counts;
        _userReaction = type;
      });
    } catch (e) {
      print('Error adding reaction: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_getText('reaction_error')),
            backgroundColor: AppColors.errorRed,
          ),
        );
      }
    }
  }
  
  Future<void> _handleRemoveReaction() async {
    try {
      final counts = await _reactionService.removeReaction(
        contentType: 'news',
        contentId: widget.news.id,
      );
      
      setState(() {
        _reactionCounts = counts;
        _userReaction = null;
      });
    } catch (e) {
      print('Error removing reaction: $e');
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.offset > 200 && !_showTitle) {
      setState(() => _showTitle = true);
    } else if (_scrollController.offset <= 200 && _showTitle) {
      setState(() => _showTitle = false);
    }
  }

  Future<void> _loadBookmarkStatus() async {
    final prefs = await SharedPreferences.getInstance();
    final bookmarks = prefs.getStringList('bookmarks') ?? [];
    setState(() {
      _isBookmarked = bookmarks.contains('news_${widget.news.id}');
    });
  }

  Future<void> _toggleBookmark() async {
    final prefs = await SharedPreferences.getInstance();
    final bookmarks = prefs.getStringList('bookmarks') ?? [];
    final itemId = 'news_${widget.news.id}';

    setState(() {
      if (_isBookmarked) {
        bookmarks.remove(itemId);
        _isBookmarked = false;
      } else {
        bookmarks.add(itemId);
        _isBookmarked = true;
      }
    });

    await prefs.setStringList('bookmarks', bookmarks);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          _isBookmarked
              ? _getText('bookmarked')
              : _getText('removed'),
        ),
        duration: const Duration(seconds: 2),
        backgroundColor: AppColors.accentGreen,
      ),
    );
  }

  void _shareNews() {
    final title = widget.news.getTitle(widget.user.language);
    final body = widget.news.getBody(widget.user.language);
    Share.share(
      '$title\n\n$body\n\nShared from FanZone',
      subject: title,
    );
  }

  String _getText(String key) {
    final lang = widget.user.language;
    
    final texts = {
      'bookmarked': {
        'en': 'Bookmarked',
        'am': 'ተቀምጧል',
        'om': 'Kuufameera',
      },
      'removed': {
        'en': 'Bookmark removed',
        'am': 'ተወግዷል',
        'om': 'Haqameera',
      },
      'published': {
        'en': 'Published',
        'am': 'ታትሟል',
        'om': 'Maxxanfameera',
      },
      'reaction_error': {
        'en': 'Failed to add reaction',
        'am': 'ምላሽ መስጠት አልተሳካም',
        'om': 'Deebii kennuun hin milkoofne',
      },
    };
    
    return texts[key]?[lang] ?? texts[key]?['en'] ?? key;
  }

  String _formatDate(DateTime date) {
    final months = widget.user.language == 'am'
        ? ['ጃንዩ', 'ፌብሩ', 'ማርች', 'ኤፕሪ', 'ሜይ', 'ጁን', 'ጁላይ', 'ኦገስ', 'ሴፕቴ', 'ኦክቶ', 'ኖቬም', 'ዲሴም']
        : widget.user.language == 'om'
            ? ['Ama', 'Gur', 'Bit', 'Elb', 'Cam', 'Wax', 'Ado', 'Hag', 'Ful', 'Onk', 'Sad', 'Mud']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.news.getTitle(widget.user.language);
    final body = widget.news.getBody(widget.user.language);

    return FloatingReactionsOverlay(
      child: Scaffold(
        body: Container(
        decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
        child: CustomScrollView(
          controller: _scrollController,
          slivers: [
            // App Bar with Image
            SliverAppBar(
              expandedHeight: 300,
              pinned: true,
              backgroundColor: AppColors.darkGreen,
              leading: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              actions: [
                Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: Icon(
                      _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      color: _isBookmarked ? AppColors.buttonGreenEnd : Colors.white,
                    ),
                    onPressed: _toggleBookmark,
                  ),
                ),
                Container(
                  margin: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.share, color: Colors.white),
                    onPressed: _shareNews,
                  ),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                title: _showTitle
                    ? Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          shadows: [
                            Shadow(
                              offset: Offset(0, 1),
                              blurRadius: 3,
                              color: Colors.black54,
                            ),
                          ],
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      )
                    : null,
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (widget.news.imageUrl.isNotEmpty)
                      Image.network(
                        widget.news.imageUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.accentGreen,
                          child: const Icon(
                            Icons.article,
                            size: 80,
                            color: Colors.white54,
                          ),
                        ),
                      )
                    else
                      Container(
                        color: AppColors.accentGreen,
                        child: const Icon(
                          Icons.article,
                          size: 80,
                          color: Colors.white54,
                        ),
                      ),
                    // Gradient overlay
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content
            SliverToBoxAdapter(
              child: Container(
                decoration: BoxDecoration(
                  gradient: AppColors.backgroundGradient,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category Badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  AppColors.accentGreen,
                                  AppColors.buttonGreenEnd,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              widget.news.category.toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Title
                          Text(
                            title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 16),

                          // Date and Reading Time
                          Row(
                            children: [
                              const Icon(
                                Icons.calendar_today,
                                size: 16,
                                color: AppColors.textGrey,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                _formatDate(widget.news.createdAt),
                                style: const TextStyle(
                                  color: AppColors.textGrey,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(width: 16),
                              const Icon(
                                Icons.access_time,
                                size: 16,
                                color: AppColors.textGrey,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                '${_estimateReadingTime(body)} min read',
                                style: const TextStyle(
                                  color: AppColors.textGrey,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          // Divider
                          Container(
                            height: 1,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  AppColors.inputBorder.withOpacity(0.5),
                                  Colors.transparent,
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Body Content
                          Text(
                            body,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 17,
                              height: 1.8,
                              letterSpacing: 0.3,
                            ),
                          ),
                          const SizedBox(height: 32),
                          
                          // Recent Reactions Display (Telegram-style)
                          RecentReactionsDisplay(
                            key: _recentReactionsKey,
                            contentId: widget.news.id,
                            contentType: 'news',
                          ),
                          
                          // Telegram-Style Reaction Bar
                          TelegramReactionBar(
                            counts: _reactionCounts,
                            userReaction: _userReaction,
                            onReactionTap: _handleReaction,
                            onRemoveReaction: _handleRemoveReaction,
                          ),
                          const SizedBox(height: 24),

                          // Action Buttons
                          Row(
                            children: [
                              Expanded(
                                child: Container(
                                  decoration: BoxDecoration(
                                    gradient: AppColors.buttonGradient,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: ElevatedButton.icon(
                                    onPressed: _shareNews,
                                    icon: const Icon(Icons.share, size: 20),
                                    label: Text(
                                      widget.user.language == 'am'
                                          ? 'አጋራ'
                                          : widget.user.language == 'om'
                                              ? 'Qoodi'
                                              : 'Share',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.transparent,
                                      shadowColor: Colors.transparent,
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 16,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Container(
                                decoration: BoxDecoration(
                                  color: _isBookmarked
                                      ? AppColors.buttonGreenEnd.withOpacity(0.2)
                                      : AppColors.inputBackground,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _isBookmarked
                                        ? AppColors.buttonGreenEnd
                                        : AppColors.inputBorder,
                                    width: 1,
                                  ),
                                ),
                                child: IconButton(
                                  onPressed: _toggleBookmark,
                                  icon: Icon(
                                    _isBookmarked
                                        ? Icons.bookmark
                                        : Icons.bookmark_border,
                                    color: _isBookmarked
                                        ? AppColors.buttonGreenEnd
                                        : Colors.white,
                                  ),
                                  iconSize: 28,
                                  padding: const EdgeInsets.all(12),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }

  int _estimateReadingTime(String text) {
    // Average reading speed: 200 words per minute
    final wordCount = text.split(RegExp(r'\s+')).length;
    final minutes = (wordCount / 200).ceil();
    return minutes < 1 ? 1 : minutes;
  }
}
