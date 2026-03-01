import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import '../config/constants.dart';
import '../models/reaction.dart';

class ReactionService {
  static const String _userIdKey = 'reaction_user_id';
  
  // Get or create a unique user ID for reactions
  Future<String> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? userId = prefs.getString(_userIdKey);
    
    if (userId == null) {
      // Generate a new UUID for this user
      userId = const Uuid().v4();
      await prefs.setString(_userIdKey, userId);
      print('Generated new reaction user ID: $userId');
    }
    
    return userId;
  }
  
  // Add or update reaction
  Future<ReactionCounts> addReaction({
    required String contentType,
    required String contentId,
    required ReactionType reactionType,
    String? token, // Kept for backward compatibility but not used
  }) async {
    try {
      final userId = await _getUserId();
      
      final headers = <String, String>{
        'Content-Type': 'application/json',
      };
      
      final response = await http.post(
        Uri.parse('${AppConstants.baseUrl}/reactions'),
        headers: headers,
        body: jsonEncode({
          'user_id': userId,
          'content_type': contentType,
          'content_id': contentId,
          'reaction_type': reactionType.name,
        }),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ReactionCounts.fromJson(data['counts']);
      } else {
        throw Exception('Failed to add reaction: ${response.statusCode}');
      }
    } catch (e) {
      print('Error adding reaction: $e');
      rethrow;
    }
  }
  
  // Remove reaction
  Future<ReactionCounts> removeReaction({
    required String contentType,
    required String contentId,
    String? token, // Kept for backward compatibility but not used
  }) async {
    try {
      final userId = await _getUserId();
      
      final response = await http.delete(
        Uri.parse('${AppConstants.baseUrl}/reactions/$contentType/$contentId?user_id=$userId'),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ReactionCounts.fromJson(data['counts']);
      } else {
        throw Exception('Failed to remove reaction: ${response.statusCode}');
      }
    } catch (e) {
      print('Error removing reaction: $e');
      rethrow;
    }
  }
  
  // Get user's reaction
  Future<UserReaction> getUserReaction({
    required String contentType,
    required String contentId,
    String? token, // Kept for backward compatibility but not used
  }) async {
    try {
      final userId = await _getUserId();
      
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/reactions/$contentType/$contentId/me?user_id=$userId'),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return UserReaction.fromJson(data);
      } else {
        return UserReaction(hasReacted: false);
      }
    } catch (e) {
      print('Error getting user reaction: $e');
      return UserReaction(hasReacted: false);
    }
  }
  
  // Get reaction counts
  Future<ReactionCounts> getReactionCounts({
    required String contentType,
    required String contentId,
  }) async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/reactions/$contentType/$contentId/counts'),
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return ReactionCounts.fromJson(data['counts'] ?? data);
      } else {
        return ReactionCounts();
      }
    } catch (e) {
      print('Error getting reaction counts: $e');
      return ReactionCounts();
    }
  }
}

