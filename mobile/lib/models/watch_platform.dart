class WatchPlatform {
  final String id;
  final String name;
  final String url;
  final String type;
  final String logoUrl;

  WatchPlatform({
    required this.id,
    required this.name,
    required this.url,
    required this.type,
    required this.logoUrl,
  });

  factory WatchPlatform.fromJson(Map<String, dynamic> json) {
    return WatchPlatform(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      url: json['url'] ?? '',
      type: json['type'] ?? 'streaming',
      logoUrl: json['logo_url'] ?? '',
    );
  }
}
