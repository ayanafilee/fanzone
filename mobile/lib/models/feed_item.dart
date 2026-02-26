import 'news.dart';
import 'highlight.dart';

class FeedItem {
  final String id;
  final String type;
  final DateTime createdAt;
  final News? news;
  final Highlight? highlight;

  FeedItem({
    required this.id,
    required this.type,
    required this.createdAt,
    this.news,
    this.highlight,
  });

  factory FeedItem.fromJson(Map<String, dynamic> json) {
    final type = json['type'] ?? 'news';
    
    if (type == 'news') {
      final news = News.fromJson(json);
      return FeedItem(
        id: news.id,
        type: type,
        createdAt: news.createdAt,
        news: news,
      );
    } else {
      final highlight = Highlight.fromJson(json);
      return FeedItem(
        id: highlight.id,
        type: type,
        createdAt: highlight.createdAt,
        highlight: highlight,
      );
    }
  }
}
