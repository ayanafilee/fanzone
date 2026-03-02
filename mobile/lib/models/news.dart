import 'reaction.dart';

class News {
  final String id;
  final String type;
  final Map<String, String> title;
  final Map<String, String> body;
  final String imageUrl;
  final String category;
  final String clubId;
  final DateTime createdAt;
  final ReactionCounts reactions;
  final ReactionType? userReaction;

  News({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.imageUrl,
    required this.category,
    required this.clubId,
    required this.createdAt,
    ReactionCounts? reactions,
    this.userReaction,
  }) : reactions = reactions ?? ReactionCounts();

  factory News.fromJson(Map<String, dynamic> json) {
    return News(
      id: json['id'] ?? '',
      type: json['type'] ?? 'news',
      title: Map<String, String>.from(json['title'] ?? {}),
      body: Map<String, String>.from(json['body'] ?? {}),
      imageUrl: json['image_url'] ?? '',
      category: json['category'] ?? '',
      clubId: json['club_id'] ?? '',
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      reactions: json['reactions'] != null
          ? ReactionCounts.fromJson(json['reactions'])
          : ReactionCounts(),
      userReaction: json['user_reaction'] != null
          ? ReactionType.values.firstWhere(
              (e) => e.name == json['user_reaction'],
              orElse: () => ReactionType.like,
            )
          : null,
    );
  }

  News copyWith({
    ReactionCounts? reactions,
    ReactionType? userReaction,
    bool clearUserReaction = false,
  }) {
    return News(
      id: id,
      type: type,
      title: title,
      body: body,
      imageUrl: imageUrl,
      category: category,
      clubId: clubId,
      createdAt: createdAt,
      reactions: reactions ?? this.reactions,
      userReaction: clearUserReaction ? null : (userReaction ?? this.userReaction),
    );
  }

  String getTitle(String language) {
    return title[language] ?? title['en'] ?? '';
  }

  String getBody(String language) {
    return body[language] ?? body['en'] ?? '';
  }
}
