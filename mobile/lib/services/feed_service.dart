import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/feed_item.dart';

class FeedService {
  Future<List<FeedItem>> getMyClubFeed(String clubId) async {
    print('🔵 FeedService: Fetching my club feed for club: $clubId');
    
    // Use /api/feed/club/{club_id} endpoint
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/feed/club/$clubId'),
    );

    print('🔵 FeedService: Response status = ${response.statusCode}');

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> feedData = data['feed'] ?? [];
      print('🔵 FeedService: Received ${feedData.length} feed items');
      return feedData.map((json) => FeedItem.fromJson(json)).toList();
    } else {
      print('❌ FeedService: Error = ${response.body}');
      throw Exception('Failed to load feed');
    }
  }

  Future<List<FeedItem>> getAllFeed() async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/feed/all'),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> feedData = data['feed'] ?? [];
      return feedData.map((json) => FeedItem.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load all feed');
    }
  }
}
