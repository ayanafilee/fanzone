import 'package:flutter/material.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../config/app_colors.dart';
import '../models/reaction.dart';
import 'telegram_reaction_bar.dart';

class HighlightCard extends StatelessWidget {
  final dynamic highlight;
  final bool isBookmarked;
  final VoidCallback onBookmarkToggle;
  final Function(ReactionType) onReactionTap;
  final VoidCallback onRemoveReaction;

  const HighlightCard({
    super.key,
    required this.highlight,
    required this.isBookmarked,
    required this.onBookmarkToggle,
    required this.onReactionTap,
    required this.onRemoveReaction,
  });

  Future<void> _openYouTubeVideo(BuildContext context, String videoUrl) async {
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
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open video: ${e.toString()}'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    }
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

  @override
  Widget build(BuildContext context) {
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
        onTap: () => _openYouTubeVideo(context, highlight.videoUrl),
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
                      color: Colors.black87,
                      child: const Center(
                        child: Icon(Icons.play_circle_outline, size: 80, color: Colors.white54),
                      ),
                    ),
                  )
                else
                  Container(
                    height: 200,
                    color: Colors.black87,
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
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.youtubeRed,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.play_arrow,
                          size: 48,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ),
                // YouTube badge
                Positioned(
                  top: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.youtubeRed,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.play_arrow, color: Colors.white, size: 18),
                        SizedBox(width: 2),
                        Text(
                          'YouTube',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            // Title, actions, and timestamp
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          highlight.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 12),
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
                          onPressed: onBookmarkToggle,
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
                              '${highlight.title}\n\nWatch: ${highlight.videoUrl}\n\nShared from FanZone',
                              subject: highlight.title,
                            );
                          },
                          padding: const EdgeInsets.all(8),
                          constraints: const BoxConstraints(),
                          tooltip: 'Share',
                        ),
                      ),
                    ],
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
                  const SizedBox(height: 12),
                  // Telegram-Style Reaction Bar
                  TelegramReactionBar(
                    counts: highlight.reactions,
                    userReaction: highlight.userReaction,
                    onReactionTap: onReactionTap,
                    onRemoveReaction: onRemoveReaction,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
