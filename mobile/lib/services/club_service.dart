import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/club.dart';

class ClubService {
  // Public method without authentication
  Future<List<Club>> getClubsPublic() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/clubs'),
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        return data.map((json) => Club.fromJson(json)).toList();
      } else {
        throw Exception('Failed to load clubs');
      }
    } catch (e) {
      print('Error loading clubs: $e');
      rethrow;
    }
  }

  // Method with optional authentication
  Future<List<Club>> getClubs([String? token]) async {
    print('🔵 ClubService: Starting to fetch clubs...');
    print('🔵 ClubService: URL = ${AppConstants.baseUrl}/clubs');
    
    final headers = <String, String>{};
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
      print('🔵 ClubService: Using token authentication');
    } else {
      print('🔵 ClubService: No token provided, trying without auth');
    }

    try {
      final response = await http.get(
        Uri.parse('${AppConstants.baseUrl}/clubs'),
        headers: headers,
      );

      print('🔵 ClubService: Response status code = ${response.statusCode}');
      print('🔵 ClubService: Response body = ${response.body}');

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);
        print('🔵 ClubService: Successfully parsed ${data.length} clubs');
        final clubs = data.map((json) => Club.fromJson(json)).toList();
        print('🔵 ClubService: Converted to Club objects successfully');
        return clubs;
      } else {
        print('❌ ClubService: Failed with status ${response.statusCode}');
        print('❌ ClubService: Error body = ${response.body}');
        throw Exception('Failed to load clubs: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      print('❌ ClubService: Exception occurred = $e');
      rethrow;
    }
  }
}
