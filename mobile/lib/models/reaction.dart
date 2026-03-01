enum ReactionType {
  like,
  love,
  wow,
  sad,
  angry;
  
  String get emoji {
    switch (this) {
      case ReactionType.like:
        return '👍';
      case ReactionType.love:
        return '❤️';
      case ReactionType.wow:
        return '😮';
      case ReactionType.sad:
        return '😢';
      case ReactionType.angry:
        return '😠';
    }
  }
  
  String get label {
    switch (this) {
      case ReactionType.like:
        return 'Like';
      case ReactionType.love:
        return 'Love';
      case ReactionType.wow:
        return 'Wow';
      case ReactionType.sad:
        return 'Sad';
      case ReactionType.angry:
        return 'Angry';
    }
  }
}

class ReactionCounts {
  final int like;
  final int love;
  final int wow;
  final int sad;
  final int angry;
  final int total;
  
  ReactionCounts({
    this.like = 0,
    this.love = 0,
    this.wow = 0,
    this.sad = 0,
    this.angry = 0,
    this.total = 0,
  });
  
  factory ReactionCounts.fromJson(Map<String, dynamic> json) {
    return ReactionCounts(
      like: json['like'] ?? 0,
      love: json['love'] ?? 0,
      wow: json['wow'] ?? 0,
      sad: json['sad'] ?? 0,
      angry: json['angry'] ?? 0,
      total: json['total'] ?? 0,
    );
  }
  
  int getCount(ReactionType type) {
    switch (type) {
      case ReactionType.like:
        return like;
      case ReactionType.love:
        return love;
      case ReactionType.wow:
        return wow;
      case ReactionType.sad:
        return sad;
      case ReactionType.angry:
        return angry;
    }
  }
  
  Map<String, dynamic> toJson() {
    return {
      'like': like,
      'love': love,
      'wow': wow,
      'sad': sad,
      'angry': angry,
      'total': total,
    };
  }
}

class UserReaction {
  final bool hasReacted;
  final ReactionType? reactionType;
  final DateTime? createdAt;
  
  UserReaction({
    required this.hasReacted,
    this.reactionType,
    this.createdAt,
  });
  
  factory UserReaction.fromJson(Map<String, dynamic> json) {
    return UserReaction(
      hasReacted: json['has_reacted'] ?? false,
      reactionType: json['reaction_type'] != null
          ? ReactionType.values.firstWhere(
              (e) => e.name == json['reaction_type'],
              orElse: () => ReactionType.like,
            )
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }
}
