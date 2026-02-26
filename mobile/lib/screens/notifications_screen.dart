import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/feed_item.dart';
import '../services/feed_service.dart';

class NotificationsScreen extends StatefulWidget {
  final User user;

  const NotificationsScreen({super.key, required this.user});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _feedService = FeedService();
  List<FeedItem> _notifications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Get recent feed items as notifications
      final allFeed = await _feedService.getAllFeed();
      
      // Sort by newest first and take only recent items (last 24 hours or latest 20)
      final now = DateTime.now();
      final recentItems = allFeed.where((item) {
        final createdAt = item.type == 'news' 
            ? item.news?.createdAt 
            : item.highlight?.createdAt;
        if (createdAt == null) return false;
        final difference = now.difference(createdAt);
        return difference.inHours < 24; // Last 24 hours
      }).toList();

      // If less than 5 items in last 24h, show latest 20
      final notifications = recentItems.length >= 5 
          ? recentItems 
          : allFeed.take(20).toList();

      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading notifications: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  String _getTitle() {
    final lang = widget.user.language;
    if (lang == 'am') return 'ማሳወቂያዎች';
    if (lang == 'om') return 'Beeksisoota';
    return 'Notifications';
  }

  String _getEmptyMessage() {
    final lang = widget.user.language;
    if (lang == 'am') return 'ምንም አዲስ ማሳወቂያ የለም';
    if (lang == 'om') return 'Beeksisa haaraa hin jiru';
    return 'No new notifications';
  }

  String _getNewLabel() {
    final lang = widget.user.language;
    if (lang == 'am') return 'አዲስ';
    if (lang == 'om') return 'Haaraa';
    return 'NEW';
  }

  Future<void> _openYouTubeVideo(String videoUrl) async {
    final uri = Uri.parse(videoUrl);
    
    try {
      final youtubeAppUrl = videoUrl.replaceFirst('https://www.youtube.com', 'youtube://');
      final youtubeAppUri = Uri.parse(youtubeAppUrl);
      
      if (await canLaunchUrl(youtubeAppUri)) {
        await launchUrl(youtubeAppUri, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(uri)) {
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

  String _formatTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inMinutes < 1) return 'Just now';
    if (difference.inHours < 1) return '${difference.inMinutes}m ago';
    if (difference.inDays < 1) return '${difference.inHours}h ago';
    if (difference.inDays < 7) return '${difference.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        title: Text(_getTitle()),
        backgroundColor: AppColors.accentGreen,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
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
                          'Failed to load notifications',
                          style: TextStyle(color: Colors.white, fontSize: 18),
                        ),
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loadNotifications,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentGreen,
                          ),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _notifications.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.notifications_none, size: 64, color: AppColors.textGrey),
                            const SizedBox(height: 16),
                            Text(
                              _getEmptyMessage(),
                              style: const TextStyle(color: Colors.white, fontSize: 18),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadNotifications,
                        color: AppColors.buttonGreenEnd,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: _notifications.length,
                          itemBuilder: (context, index) {
                            final item = _notifications[index];
                            return _buildNotificationItem(item);
                          },
                        ),
                      ),
      ),
    );
  }

  Widget _buildNotificationItem(FeedItem item) {
    if (item.type == 'news' && item.news != null) {
      return _buildNewsNotification(item.news!);
    } else if (item.type == 'highlight' && item.highlight != null) {
      return _buildHighlightNotification(item.highlight!);
    }
    return const SizedBox.shrink();
  }

  Widget _buildNewsNotification(news) {
    final title = news.getTitle(widget.user.language);
    final isRecent = DateTime.now().difference(news.createdAt).inHours < 2;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: AppColors.newsCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.accentGreen,
                borderRadius: BorderRadius.circular(20),
              ),
              child: const Icon(Icons.article, color: Colors.white, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (isRecent) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.buttonGreenEnd,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _getNewLabel(),
                            style: const TextStyle(
                              color: AppColors.darkGreen,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(news.createdAt),
                    style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHighlightNotification(highlight) {
    final isRecent = DateTime.now().difference(highlight.createdAt).inHours < 2;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: AppColors.highlightCardBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _openYouTubeVideo(highlight.videoUrl),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.errorRed,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(Icons.play_arrow, color: Colors.white, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            highlight.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isRecent) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.buttonGreenEnd,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _getNewLabel(),
                              style: const TextStyle(
                                color: AppColors.darkGreen,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatTime(highlight.createdAt),
                      style: const TextStyle(color: AppColors.textGrey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: AppColors.textGrey, size: 20),
            ],
          ),
        ),
      ),
    );
  }
}
