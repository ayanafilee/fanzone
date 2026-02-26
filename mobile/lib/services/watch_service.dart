import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/watch_platform.dart';

class WatchService {
  Future<List<WatchPlatform>> getWatchPlatforms() async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/watch-platforms'),
    );

    if (response.statusCode == 200) {
      final dynamic data = jsonDecode(response.body);
      
      // Handle both array response and object with 'links' field
      List<dynamic> platformsData;
      if (data is List) {
        platformsData = data;
      } else if (data is Map && data['links'] != null) {
        platformsData = data['links'];
      } else {
        platformsData = [];
      }
      
      return platformsData.map((json) => WatchPlatform.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load watch platforms');
    }
  }
}
