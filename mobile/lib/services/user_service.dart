import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/constants.dart';
import '../models/user.dart';

class UserService {
  Future<User> getMyProfile(String token) async {
    final response = await http.get(
      Uri.parse('${AppConstants.baseUrl}/users/me'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return User.fromJson(data);
    } else {
      throw Exception('Failed to load profile');
    }
  }
}
