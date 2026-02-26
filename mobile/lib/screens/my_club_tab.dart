import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/feed_item.dart';
import '../services/feed_service.dart';

class MyClubTab extends StatefulWidget {
  final User user;

  const MyClubTab({super.key, required this.user});

  @override
  State<MyClubTab> createState() => _MyClubTabState();
}

class _MyClubTabState extends State<MyClubTab> {
  final _feedService = FeedService();
  List<FeedItem> _feedItems = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFeed();
  }

  Future<void> _loadFeed() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Check if user has selected a club
      if (widget.user.favClubId == null || widget.user.favClubId!.isEmpty) {
        setState(() {
          _feedItems = [];
          _isLoading = false;
          _error = 'no_club_selected';
        });
        return;
      }

      final items = await _feedService.getMyClubFeed(widget.user.favClubId!);
      setState(() {
        _feedItems = items;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading feed: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
      child: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.buttonGreenEnd),
            )
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        _error == 'no_club_selected' ? Icons.sports_soccer : Icons.error_outline,
                        size: 64,
                        color: _error == 'no_club_selected' ? AppColors.textGrey : AppColors.errorRed,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        _error == 'no_club_selected'
                            ? (widget.user.language == 'am'
                                ? 'ክለብ አልተመረጠም'
                                : widget.user.language == 'om'
                                    ? 'Kilabni hin filatamne'
                                    : 'No club selected')
                            : 'Failed to load feed',
                        style: const TextStyle(color: Colors.white, fontSize: 18),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _error == 'no_club_selected'
                            ? (widget.user.language == 'am'
                                ? 'እባክዎ ክለብ ይምረጡ'
                                : widget.user.language == 'om'
                                    ? 'Maaloo kilaba filadhaa'
                                    : 'Please select a favorite club')
                            : 'Please check your connection',
                        style: const TextStyle(color: AppColors.textGrey),
                      ),
                      if (_error != 'no_club_selected') ...[
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loadFeed,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentGreen,
                          ),
                          child: const Text('Retry'),
                        ),
                      ],
                    ],
                  ),
                )
              : _feedItems.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.sports_soccer, size: 64, color: AppColors.textGrey),
                          const SizedBox(height: 16),
                          Text(
                            widget.user.language == 'am'
                                ? 'ምንም ዜና የለም'
                                : widget.user.language == 'om'
                                    ? 'Oduu hin jiru'
                                    : 'No news yet',
                            style: const TextStyle(color: Colors.white, fontSize: 18),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            widget.user.language == 'am'
                                ? 'በቅርቡ ይመለሳል'
                                : widget.user.language == 'om'
                                    ? 'Dhiyootti deebi\'a'
                                    : 'Check back soon',
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
                        itemCount: _feedItems.length,
                        itemBuilder: (context, index) {
                          final item = _feedItems[index];
                          return _buildFeedCard(item);
                        },
                      ),
                    ),
    );
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

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: AppColors.newsCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (news.imageUrl.isNotEmpty)
            ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              child: Image.network(
                news.imageUrl,
                width: double.infinity,
                height: 200,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(
                  height: 200,
                  color: AppColors.accentGreen,
                  child: const Icon(Icons.image, size: 64, color: AppColors.textGrey),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
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
                Text(
                  _formatDate(news.createdAt),
                  style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
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

  Widget _buildHighlightCard(highlight) {
    final videoId = YoutubePlayer.convertUrlToId(highlight.videoUrl);
    final thumbnailUrl = videoId != null
        ? 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg'
        : '';

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: AppColors.highlightCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _openYouTubeVideo(highlight.videoUrl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Full-width video thumbnail
            Stack(
              children: [
                if (thumbnailUrl.isNotEmpty)
                  Image.network(
                    thumbnailUrl,
                    width: double.infinity,
                    height: 200,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 200,
                      color: AppColors.accentGreen,
                      child: const Center(
                        child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white54),
                      ),
                    ),
                  )
                else
                  Container(
                    height: 200,
                    color: AppColors.accentGreen,
                    child: const Center(
                      child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white54),
                    ),
                  ),
                // Play button overlay
                Positioned.fill(
                  child: Container(
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
                    child: const Center(
                      child: Icon(
                        Icons.play_circle_filled,
                        size: 64,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                // Highlight badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.errorRed,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.play_arrow, color: Colors.white, size: 16),
                        SizedBox(width: 4),
                        Text(
                          'HIGHLIGHT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Title and timestamp
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    highlight.title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time, size: 14, color: AppColors.textGrey),
                      const SizedBox(width: 4),
                      Text(
                        _formatDate(highlight.createdAt),
                        style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
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
