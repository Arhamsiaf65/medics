import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:pharmacy/features/auth/data/repositories/auth_repository.dart';

class AIService {
  final AuthRepository authRepository;
  // Base URL for API
  final String baseUrl = 'https://medics-two.vercel.app/api/ai'; // Production URL

  AIService(this.authRepository);

  Future<Map<String, dynamic>> sendMessage(String message, String? sessionId) async {
    try {
      final user = await authRepository.retrieveLocalUser();
      final token = user?.token;
      
      if (token == null) {
        throw Exception('User not logged in');
      }
      
      final response = await http.post(
        Uri.parse('$baseUrl/chat'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'message': message,
          'sessionId': sessionId,
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to get AI response: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error communicating with AI: $e');
    }
  }
}
