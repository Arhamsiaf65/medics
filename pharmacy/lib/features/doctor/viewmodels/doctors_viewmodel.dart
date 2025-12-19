import 'package:flutter/material.dart';
import 'package:pharmacy/features/doctor/data/doctor_repository/doctors_repository.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';

import '../data/models/doctor_schedule.dart';

class DoctorsViewModel extends ChangeNotifier {
  final DoctorsRepository _repo;

  DoctorsViewModel(this._repo) {
    loadDoctors();
  }

  List<String> specialities = [];
  List<Doctor> doctors = [];
  List<Doctor> topDoctors = [];
  List<String> availableDates = [];
  List<String> availableSlots = [];


  Future<void> loadDoctors() async {
    doctors = await _repo.getDoctors();
    topDoctors = _repo.getTopDoctors();
    // Derive specialities from the actual doctors list + "All"
    specialities = ["All", ...doctors.map((d) => d.specialty).toSet().toList()];
    notifyListeners();
  }

  List<String> getSpecialities() {
    return _repo.getSpecialities();
  }

  DoctorSchedule? _fullSchedule; // Store the full schedule object

  Future<void> getDoctorScheduleById(String doctorId) async {
    try {
      // Clear old data
      availableDates = [];
      availableSlots = [];
      _fullSchedule = null;
      notifyListeners();

      // Load new schedule
      final schedule = await _repo.getDoctorSchedule(doctorId);
      _fullSchedule = schedule;

      // Set dates
      availableDates = schedule.availableDates;

      // Load first date slots
      if (schedule.availableDates.isNotEmpty) {
        updateSlotsForDate(schedule.availableDates.first);
      } else {
        notifyListeners();
      }

    } catch (e) {
      print("❌ Error in ViewModel getDoctorScheduleById: $e");
    }
  }

  void updateSlotsForDate(String date) {
    if (_fullSchedule == null) return;
    
    // Find the schedule item for the selected date
    // Note: The date string from UI might need trimming or matching format
    try {
      final scheduleItem = _fullSchedule!.schedules.firstWhere(
        (item) => item.date.trim() == date.trim(),
        orElse: () => ScheduleItem(date: date, timeSlots: []),
      );
      
      availableSlots = scheduleItem.timeSlots;
      notifyListeners();
    } catch (e) {
      print("Error updating slots: $e");
      availableSlots = [];
      notifyListeners();
    }
  }

  Future<void> bookAppointment({
    required String doctorId,
    required String date,
    required String time,
    required String reason,
  }) async {
    await _repo.bookAppointment(
      doctorId: doctorId,
      date: date,
      time: time,
      reason: reason,
    );
    // Refresh schedule to reflect removed slot
    await getDoctorScheduleById(doctorId);
  }

  Map<String, double> getPaymentDetails(Doctor doctor) {
    return _repo.getPaymentDetails(doctor);
  }

  double getTotalPayment(Doctor doctor) {
    final details = getPaymentDetails(doctor);
    return details.values.fold(0.0, (sum, val) => sum + val);
  }

  // ---------------------------
  // CHAT FUNCTIONS
  // ---------------------------

  /// Get chat messages for a specific doctor
  List<Map<String, dynamic>> getChatMessages(Doctor doctor) {
    return _repo.getChatMessages(doctor);
  }

  /// Send a message to a doctor
  void sendMessage(Doctor doctor, String text) {
    _repo.sendMessage(doctor, text);
    notifyListeners();
    
    // Schedule a notification for auto-reply
    Future.delayed(const Duration(milliseconds: 1100), () {
      notifyListeners();
    });
  }
}
