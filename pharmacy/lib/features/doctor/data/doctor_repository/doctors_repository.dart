import 'dart:convert';

import 'package:intl/intl.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';

import '../../../../services/services/api_service.dart';
import '../models/doctor_schedule.dart';

class DoctorsRepository {

  // Dummy doctors list
  final List<Doctor> dummyDoctors = [
    Doctor(
      id: '1',
      name: "Dr. Ayesha Khan",
      specialty: "Cardiologist",
      rating: 4.8,
      distance: "2.1 km",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0aaw2Mp8Ua2c4dE1yyAV61_4NH6Zc3gpbog&s",
      schedule: {
        "2025-02-10": ["09:00 AM", "10:00 AM", "01:00 PM"],
        "2025-02-11": ["11:00 AM", "12:30 PM"],
      },
    ),
    Doctor(
      id: '1',
      name: "Dr. Ahmed Raza",
      specialty: "Dermatologist",
      rating: 4.6,
      distance: "3.4 km",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0aaw2Mp8Ua2c4dE1yyAV61_4NH6Zc3gpbog&s",
      schedule: {
        "2025-02-10, Mon": ["08:00 AM", "09:00 AM"],
        "2025-02-12, Wed": ["01:00 PM", "03:00 PM"],
      },
    ),
  ];

  // Top doctors list
  final List<Doctor> topDoctorsList = [
    Doctor(
      id: '1',
      name: "Dr. Ayesha Khan",
      specialty: "Cardiologist",
      rating: 4.8,
      distance: "2.1 km",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0aaw2Mp8Ua2c4dE1yyAV61_4NH6Zc3gpbog&s",
      schedule: {
        "2025-02-10, Mon": ["09:00 AM", "10:00 AM", "01:00 PM"],
        "2025-02-11, Tue": ["11:00 AM", "12:30 PM"],
      },
    ),
    Doctor(
      id: '1',
      name: "Dr. Ahmed Raza",
      specialty: "Dermatologist",
      rating: 4.6,
      distance: "3.4 km",
      imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0aaw2Mp8Ua2c4dE1yyAV61_4NH6Zc3gpbog&s",
      schedule: {
        "2025-02-10, Mon": ["08:00 AM", "09:00 AM"],
        "2025-02-12, Wed": ["01:00 PM", "03:00 PM"],
      },
    ),
  ];

  // ---------------------------
  // BASIC FETCH FUNCTIONS
  // ---------------------------

  Future<List<Doctor>> getDoctors({String? specialty, String? search}) async {
    try {
      final queryParams = <String, String>{};

      if (specialty != null && specialty.isNotEmpty) {
        queryParams['specialty'] = specialty;
      }
      if (search != null && search.isNotEmpty) {
        queryParams['search'] = search;
      }

      final uri = Uri.parse("doctors").replace(queryParameters: queryParams);

      // ApiService.get returns a decoded Map
      final response = await ApiService.get(uri.toString());
      print(response);

      // No jsonDecode, response is already a Map<String, dynamic>
      final body = response;

      if (body['success'] == false) {
        throw Exception(body['message'] ?? "Unknown error");
      }

      final List<dynamic> data = body['data'];
      print("data:");
      print(data);

      return data.map((json) => Doctor.fromJson(json)).toList();
    } catch (e) {
      print("❌ Error fetching doctors: $e");
      throw Exception("Failed to fetch doctors: $e");
    }
  }

  List<Doctor> getTopDoctors() {
    return topDoctorsList;
  }


  Map<String, double> getPaymentDetails(Doctor doctor) {
    return {
      "Consultation": 60.0,
      "Admin Fee": 1.0,
      "Discount": 0.0, // default
    };
  }

  // ---------------------------
  // ADDITIONAL FUNCTIONS
  // ---------------------------

  Future<DoctorSchedule> getDoctorSchedule(String doctorId) async {
    try {
      final response = await ApiService.get("doctors/$doctorId/schedule");
      print("RAW API SCHEDULE:");
      print(response);
      final Map<String, dynamic> body = response;
      print("JSON SCHEDULE BODY:");
      print(body);

      if (body['success'] == false) {
        throw Exception(body['error'] ?? "Unknown error");
      }

      final scheduleData = body['data'];
      return DoctorSchedule.fromJson(scheduleData);

    } catch (e) {
      print("❌ Error loading schedule: $e");
      throw Exception("Failed to load doctor schedule: $e");
    }
  }



  /// Returns all specialities without duplicates
  List<String> getSpecialities() {
    return dummyDoctors
        .map((d) => d.specialty)
        .toSet()
        .toList();
  }

  /// Generates dynamic available dates starting from today
  /// Returns the next 7 days with day names
  // List<String> getAvailableDates(Doctor doctor) {
  //   final List<String> dates = [];
  //   final now = DateTime.now();
  //
  //   for (int i = 0; i < 7; i++) {
  //     final date = now.add(Duration(days: i));
  //     final dateStr = DateFormat('yyyy-MM-dd').format(date);
  //     final dayName = DateFormat('EEE').format(date);
  //     dates.add('$dateStr, $dayName');
  //   }
  //   return dates;
  // }

  /// Returns available time slots for given date
  /// Since we're using dynamic dates, return default time slots
  // List<String> getAvailableSlots(Doctor doctor, String date) {
  //   // Default available time slots for any date
  //   return ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];
  // }

  /// Books a time slot by calling the API
  Future<void> bookAppointment({
    required String doctorId,
    required String date,
    required String time,
    required String reason,
  }) async {
    try {
      final body = {
        "doctorId": doctorId,
        "date": date,
        "time": time,
        "reason": reason,
      };

      print("➡️ Booking Appointment: $body");
      final response = await ApiService.post("appointments/book", body);
      print("⬅️ Booking Response: $response");

      if (response['success'] == false) {
        throw Exception(response['error'] ?? "Booking failed");
      }
    } catch (e) {
      print("❌ Error booking appointment: $e");
      rethrow;
    }
  }

  // ---------------------------
  // CHAT FUNCTIONS
  // ---------------------------

  /// Store chat messages per doctor (keyed by doctor name for simplicity)
  final Map<String, List<Map<String, dynamic>>> _chatMessages = {};

  /// Get chat messages for a specific doctor
  List<Map<String, dynamic>> getChatMessages(Doctor doctor) {
    return _chatMessages[doctor.name] ?? [];
  }

  /// Send a message to a doctor (returns the new message)
  Map<String, dynamic> sendMessage(Doctor doctor, String text) {
    final message = {
      'id': DateTime.now().millisecondsSinceEpoch.toString(),
      'text': text,
      'isFromUser': true,
      'timestamp': DateTime.now(),
    };

    if (_chatMessages[doctor.name] == null) {
      _chatMessages[doctor.name] = [];
    }
    _chatMessages[doctor.name]!.add(message);

    // Simulate doctor auto-reply after a delay
    Future.delayed(const Duration(seconds: 1), () {
      final reply = {
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'text': _getAutoReply(text),
        'isFromUser': false,
        'timestamp': DateTime.now(),
      };
      _chatMessages[doctor.name]!.add(reply);
    });

    return message;
  }

  /// Generate auto-reply based on user message
  String _getAutoReply(String userMessage) {
    final lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.contains('hello') || lowerMessage.contains('hi')) {
      return 'Hello! How can I help you today?';
    } else if (lowerMessage.contains('appointment')) {
      return 'Sure, I can help you with your appointment. Please select a suitable date and time from the booking screen.';
    } else if (lowerMessage.contains('pain') || lowerMessage.contains('symptom')) {
      return 'I understand. Could you please describe your symptoms in more detail? This will help me better assist you.';
    } else if (lowerMessage.contains('thank')) {
      return 'You\'re welcome! Is there anything else I can help you with?';
    } else {
      return 'Thank you for your message. I\'ll review it and get back to you shortly. If this is urgent, please book an appointment.';
    }
  }
}
