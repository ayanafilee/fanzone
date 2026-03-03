import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/constants.dart';
import '../models/feed_item.dart';

class FeedService {
  static const String _userIdKey = 'reaction_user_id';
  static const String _myClubFeedCacheKey = 'my_club_feed_cache_';
  static const String _allFeedCacheKey = 'all_feed_cache';
  static const String _cacheTimestampKey = 'feed_cache_timestamp_';
  static const int _cacheValidityMinutes = 5; // Cache valid for 5 minutes
  
  // In-memory cache
  static final Map<String, List<FeedItem>> _memoryCache = {};
  static final Map<String, DateTime> _memoryCacheTimestamp = {};
  
  // Get user ID for reactions
  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_userIdKey);
  }
  
  // Check if cache is still valid
  bool _isCacheValid(DateTime? cacheTime) {
    if (cacheTime == null) return false;
    final now = DateTime.now();
    final difference = now.difference(cacheTime);
    return difference.inMinutes < _cacheValidityMinutes;
  }
  
  // Get cached feed from disk
  Future<List<FeedItem>?> _getCachedFeed(String cacheKey) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString(cacheKey);
      final timestampMs = prefs.getInt('$_cacheTimestampKey$cacheKey');
      
      if (cachedData != null && timestampMs != null) {
        final cacheTime = DateTime.fromMillisecondsSinceEpoch(timestampMs);
        
        if (_isCacheValid(cacheTime)) {
          print('📦 Using cached feed from disk: $cacheKey');
          final List<dynamic> feedData = jsonDecode(cachedData);
          return feedData.map((json) => FeedItem.fromJson(json)).toList();
        } else {
          print('⏰ Cache expired for: $cacheKey');
        }
      }
    } catch (e) {
      print('❌ Error reading cache: $e');
    }
    return null;
  }
  
  // Save feed to disk cache
  Future<void> _saveFeedToCache(String cacheKey, List<FeedItem> feed) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final feedJson = feed.map((item) => {
        'id': item.id,
        'type': item.type,
        'created_at': item.createdAt.toIso8601String(),
        if (item.news != null) 'news': item.news,
        if (item.highlight != null) 'highlight': item.highlight,
      }).toList();
      
      await prefs.setString(cacheKey, jsonEncode(feedJson));
      await prefs.setInt('$_cacheTimestampKey$cacheKey', DateTime.now().millisecondsSinceEpoch);
      print('💾 Saved feed to cache: $cacheKey');
    } catch (e) {
      print('❌ Error saving cache: $e');
    }
  }
  
  Future<List<FeedItem>> getMyClubFeed(String clubId, {bool forceRefresh = false}) async {
    print('🔵 FeedService: Fetching my club feed for club: $clubId');
    
    final cacheKey = '$_myClubFeedCacheKey$clubId';
    
    // Check memory cache first
    if (!forceRefresh && _memoryCache.containsKey(cacheKey)) {
      final cacheTime = _memoryCacheTimestamp[cacheKey];
      if (_isCacheValid(cacheTime)) {
        print('⚡ Using memory cache for: $cacheKey');
        return _memoryCache[cacheKey]!;
      }
    }
    
    // Check disk cache
    if (!forceRefresh) {
      final cachedFeed = await _getCachedFeed(cacheKey);
      if (cachedFeed != null) {
        // Update memory cache
        _memoryCache[cacheKey] = cachedFeed;
        _memoryCacheTimestamp[cacheKey] = DateTime.now();
        return cachedFeed;
      }
    }
    
    // Fetch from network
    final userId = await _getUserId();
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
      
      final feed = feedData.map((json) => FeedItem.fromJson(json)).toList();
      
      // Save to both caches
      _memoryCache[cacheKey] = feed;
      _memoryCacheTimestamp[cacheKey] = DateTime.now();
      await _saveFeedToCache(cacheKey, feed);
      
      return feed;
    } else {
      print('❌ FeedService: Error = ${response.body}');
      throw Exception('Failed to load feed');
    }
  }

  Future<List<FeedItem>> getAllFeed({bool forceRefresh = false}) async {
    final cacheKey = _allFeedCacheKey;
    
    // Check memory cache first
    if (!forceRefresh && _memoryCache.containsKey(cacheKey)) {
      final cacheTime = _memoryCacheTimestamp[cacheKey];
      if (_isCacheValid(cacheTime)) {
        print('⚡ Using memory cache for all feed');
        return _memoryCache[cacheKey]!;
      }
    }
    
    // Check disk cache
    if (!forceRefresh) {
      final cachedFeed = await _getCachedFeed(cacheKey);
      if (cachedFeed != null) {
        // Update memory cache
        _memoryCache[cacheKey] = cachedFeed;
        _memoryCacheTimestamp[cacheKey] = DateTime.now();
        return cachedFeed;
      }
    }
    
    // Fetch from network
    final userId = await _getUserId();
    var url = '${AppConstants.baseUrl}/feed/all';
    if (userId != null) {
      url += '?user_id=$userId';
    }
    
    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final List<dynamic> feedData = data['feed'] ?? [];
      
      final feed = feedData.map((json) => FeedItem.fromJson(json)).toList();
      
      // Save to both caches
      _memoryCache[cacheKey] = feed;
      _memoryCacheTimestamp[cacheKey] = DateTime.now();
      await _saveFeedToCache(cacheKey, feed);
      
      return feed;
    } else {
      throw Exception('Failed to load all feed');
    }
  }
  
  // Clear all caches
  static Future<void> clearCache() async {
    _memoryCache.clear();
    _memoryCacheTimestamp.clear();
    
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys();
    for (final key in keys) {
      if (key.startsWith(_myClubFeedCacheKey) || 
          key.startsWith(_allFeedCacheKey) ||
          key.startsWith(_cacheTimestampKey)) {
        await prefs.remove(key);
      }
    }
    print('🗑️ All feed caches cleared');
  }
}
