import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/feed_item.dart';
import '../services/feed_service.dart';

class HighlightsTab extends StatefulWidget {
  final User user;

  const HighlightsTab({super.key, required this.user});

  @override
  State<HighlightsTab> createState() => _HighlightsTabState();
}

class _HighlightsTabState extends State<HighlightsTab> {
  final _feedService = FeedService();
  List<FeedItem> _highlights = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadHighlights();
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
        _isLoading = false;
      });
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
              : _highlights.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.play_circle_outline, size: 80, color: AppColors.textGrey),
                          const SizedBox(height: 16),
                          Text(
                            _getEmptyMessage(),
                            style: const TextStyle(color: Colors.white, fontSize: 18),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _getEmptySubtitle(),
                            style: const TextStyle(color: AppColors.textGrey),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadHighlights,
                      color: AppColors.buttonGreenEnd,
                      child: GridView.builder(
                        padding: const EdgeInsets.all(16),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 1,
                          childAspectRatio: 16 / 12,
                          mainAxisSpacing: 16,
                        ),
                        itemCount: _highlights.length,
                        itemBuilder: (context, index) {
                          final item = _highlights[index];
                          if (item.highlight != null) {
                            return _buildHighlightCard(item.highlight!);
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
    );
  }

  Widget _buildHighlightCard(highlight) {
    final videoId = YoutubePlayer.convertUrlToId(highlight.videoUrl);
    final thumbnailUrl = videoId != null
        ? 'https://img.youtube.com/vi/$videoId/maxresdefault.jpg'
        : '';

    return Card(
      color: AppColors.highlightCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _openYouTubeVideo(highlight.videoUrl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Full-width video thumbnail
            Expanded(
              child: Stack(
                children: [
                  if (thumbnailUrl.isNotEmpty)
                    Positioned.fill(
                      child: Image.network(
                        thumbnailUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => Container(
                          color: AppColors.accentGreen,
                          child: const Center(
                            child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white54),
                          ),
                        ),
                      ),
                    )
                  else
                    Positioned.fill(
                      child: Container(
                        color: AppColors.accentGreen,
                        child: const Center(
                          child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white54),
                        ),
                      ),
                    ),
                  // Gradient overlay
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
                    ),
                  ),
                  // Play button overlay
                  const Positioned.fill(
                    child: Center(
                      child: Icon(
                        Icons.play_circle_filled,
                        size: 72,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  // Duration badge (optional - can be added if available)
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.play_arrow, color: Colors.white, size: 14),
                          SizedBox(width: 4),
                          Text(
                            'WATCH',
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
            ),
            // Title and info
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
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.errorRed,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'HIGHLIGHT',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
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
