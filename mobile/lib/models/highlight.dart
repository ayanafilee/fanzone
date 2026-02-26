class Highlight {
  final String id;
  final String type;
  final String title;
  final String videoUrl;
  final List<String> clubIds;
  final DateTime createdAt;

  Highlight({
    required this.id,
    required this.type,
    required this.title,
    required this.videoUrl,
    required this.clubIds,
    required this.createdAt,
  });

  factory Highlight.fromJson(Map<String, dynamic> json) {
    return Highlight(
      id: json['id'] ?? '',
      type: json['type'] ?? 'highlight',
      title: json['title'] ?? json['match_title'] ?? '',
      videoUrl: json['video_url'] ?? json['youtube_url'] ?? '',
      clubIds: List<String>.from(json['club_ids'] ?? []),
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    );
  }
}
