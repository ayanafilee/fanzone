class User {
  final String id;
  final String name;
  final String email;
  final String language;
  final String? favClubId;
  final String? profileImageUrl;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.language,
    this.favClubId,
    this.profileImageUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      language: json['language'] ?? 'en',
      favClubId: json['fav_club_id'],
      profileImageUrl: json['profile_image_url'],
    );
  }
}
