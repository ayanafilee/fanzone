import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/feed_item.dart';
import '../services/feed_service.dart';

class AllNewsTab extends StatefulWidget {
  final User user;

  const AllNewsTab({super.key, required this.user});

  @override
  State<AllNewsTab> createState() => _AllNewsTabState();
}

class _AllNewsTabState extends State<AllNewsTab> {
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
      final items = await _feedService.getAllFeed();
      setState(() {
        _feedItems = items;
        _isLoading = false;
      });
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
              : _feedItems.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.article, size: 64, color: AppColors.textGrey),
                          const SizedBox(height: 16),
                          Text(
                            _getEmptyMessage(),
                            style: const TextStyle(color: Colors.white, fontSize: 18),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _getEmptySubtitle(),
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
                    const Spacer(),
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
