import 'reaction.dart';

class Highlight {
  final String id;
  final String type;
  final String title;
  final String videoUrl;
  final List<String> clubIds;
  final DateTime createdAt;
  final ReactionCounts reactions;
  final ReactionType? userReaction;

  Highlight({
    required this.id,
    required this.type,
    required this.title,
    required this.videoUrl,
    required this.clubIds,
    required this.createdAt,
    ReactionCounts? reactions,
    this.userReaction,
  }) : reactions = reactions ?? ReactionCounts();

  factory Highlight.fromJson(Map<String, dynamic> json) {
    return Highlight(
      id: json['id'] ?? '',
      type: json['type'] ?? 'highlight',
      title: json['title'] ?? json['match_title'] ?? '',
      videoUrl: json['video_url'] ?? json['youtube_url'] ?? '',
      clubIds: List<String>.from(json['club_ids'] ?? []),
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

  Highlight copyWith({
    ReactionCounts? reactions,
    ReactionType? userReaction,
    bool clearUserReaction = false,
  }) {
    return Highlight(
      id: id,
      type: type,
      title: title,
      videoUrl: videoUrl,
      clubIds: clubIds,
      createdAt: createdAt,
      reactions: reactions ?? this.reactions,
      userReaction: clearUserReaction ? null : (userReaction ?? this.userReaction),
    );
  }
}
