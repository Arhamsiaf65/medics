import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:pharmacy/database/dbhelper.dart';

class ApiService {
  static const String baseUrl = "http://10.0.2.2:3000/api";
  // static const String baseUrl = "http://192.168.76.20:3000/api";



  static Future<Map<String, String>> _getHeaders() async {
    final headers = {"Content-Type": "application/json"};
    try {
      final user = await DBHelper().getFirstUser();
      if (user != null && user['token'] != null) {
        headers['Authorization'] = 'Bearer ${user['token']}';
      }
    } catch (e) {
      print("⚠️ Error fetching token for headers: $e");
    }
    return headers;
  }

  // ********** GET Request **********
  static Future<dynamic> get(String endpoint) async {
    final url = Uri.parse("$baseUrl/$endpoint");
    final headers = await _getHeaders();

    final response = await http.get(url, headers: headers);

    return jsonDecode(response.body);
  }

  // ********** POST Request **********
  static Future<dynamic> post(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse("$baseUrl/$endpoint");
    final headers = await _getHeaders();

    final response = await http.post(
      url,
      headers: headers,
      body: jsonEncode(data),
    );

    return jsonDecode(response.body);
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> data) async {
    final url = Uri.parse("$baseUrl/$endpoint");
    final headers = await _getHeaders();

    final response = await http.put(
      url,
      headers: headers,
      body: jsonEncode(data),
    );

    return jsonDecode(response.body);
  }

  static Future<dynamic> delete(String endpoint) async {
    final url = Uri.parse("$baseUrl/$endpoint");
    final headers = await _getHeaders();

    final response = await http.delete(url, headers: headers);

    return jsonDecode(response.body);
  }
}
