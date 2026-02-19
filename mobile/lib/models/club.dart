class Club {
  final String id;
  final String name;
  final String logoUrl;
  final String? leagueId;

  Club({
    required this.id,
    required this.name,
    required this.logoUrl,
    this.leagueId,
  });

  factory Club.fromJson(Map<String, dynamic> json) {
    print('🟡 Club.fromJson: Parsing club data...');
    print('🟡 Club.fromJson: Raw JSON = $json');
    
    final club = Club(
      id: json['id'] ?? json['_id'] ?? '',
      name: json['name'] ?? '',
      logoUrl: json['logo_url'] ?? '',
      leagueId: json['league_id'],
    );
    
    print('🟡 Club.fromJson: Parsed club = ${club.name} (${club.id})');
    return club;
  }
}


