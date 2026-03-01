import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/feed_item.dart';

class FeedService {
  static const String _userIdKey = 'reaction_user_id';
  
  // Get user ID for reactions
  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userIdKey);
  }
  
  Future<List<FeedItem>> getMyClubFeed(String clubId) async {
    print('🔵 FeedService: Fetching my club feed for club: $clubId');
    
    // Get user_id to include in request
    final userId = await _getUserId();
    
    // Build URL with optional user_id parameter
    var url = '${AppConstants.baseUrl}/feed/club/$clubId';
    if (userId != null) {
      url += '?user_id=$userId';
    }
    
    final response = await http.get(Uri.parse(url));

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
    // Get user_id to include in request
    final userId = await _getUserId();
    
    // Build URL with optional user_id parameter
    var url = '${AppConstants.baseUrl}/feed/all';
    if (userId != null) {
      url += '?user_id=$userId';
    }
    
    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> feedData = data['feed'] ?? [];
      return feedData.map((json) => FeedItem.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load all feed');
    }
  }
}
