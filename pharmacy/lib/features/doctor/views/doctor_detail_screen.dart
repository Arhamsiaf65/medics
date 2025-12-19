// lib/features/doctor/views/doctor_detail_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../data/models/doctor_model.dart';
import '../viewmodels/doctors_viewmodel.dart';
import '../views/appointment_screen.dart';
import '../widgets/doctor_widgets.dart';

class DoctorDetailScreen extends StatefulWidget {
  final Doctor doctor;

  const DoctorDetailScreen({required this.doctor, super.key});

  @override
  State<DoctorDetailScreen> createState() => _DoctorDetailScreenState();
}

class _DoctorDetailScreenState extends State<DoctorDetailScreen> {
  String? selectedDate;
  String? selectedTime;
  late DoctorsViewModel viewModel;
  final TextEditingController _reasonController = TextEditingController();

  @override
  void dispose() {
    _reasonController.dispose();
    super.dispose();
  }


  @override
  void initState() {
    super.initState();
    final viewModel = Provider.of<DoctorsViewModel>(context, listen: false);
    viewModel.getDoctorScheduleById(widget.doctor.id);

    final dates = viewModel.availableDates;
    // final slots = viewModel.availableSlots; // Not needed here as viewModel notifies listeners
    if (dates.isNotEmpty) {
      selectedDate = dates.first; // select first available date by default
      final slots = viewModel.availableSlots;
      if (slots.isNotEmpty) {
        selectedTime = slots.first; // select first slot by default
      }
    }
  }

  void _handleBookAppointment() {
    if (selectedDate != null && selectedTime != null) {
      final paymentDetails = viewModel.getPaymentDetails(widget.doctor);
      final totalPayment = viewModel.getTotalPayment(widget.doctor);

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => AppointmentScreen(
            doctor: widget.doctor,
            selectedDate: selectedDate!,
            selectedTime: selectedTime!,
            paymentDetails: paymentDetails,
            totalPayment: totalPayment,
            reason: _reasonController.text.isNotEmpty 
                ? _reasonController.text 
                : 'General Consultation',
          ),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a date and time to book.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    viewModel = Provider.of<DoctorsViewModel>(context);

    // dynamically fetch dates and slots
    final availableDates = viewModel.availableDates;
    final availableSlots = selectedDate != null
        ? viewModel.availableSlots
        : <String>[];

    // if previously selectedTime is no longer available, reset
    if (selectedTime != null && !availableSlots.contains(selectedTime)) {
      selectedTime = availableSlots.isNotEmpty ? availableSlots.first : null;
    }

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Doctor Detail',
          style: TextStyle(
            fontFamily: 'CustomFontFamily',
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  buildDoctorInfo(widget.doctor),
                  const SizedBox(height: 25),
                  const DoctorAboutSection(about: ''), // Info isn't in model yet, usage default text
                  const SizedBox(height: 30),
                  buildDateSelector(
                    selectedDate: selectedDate,
                    dates: availableDates,
                    onSelectDate: (value) {
                      setState(() {
                        selectedDate = value;
                        // update time slot when date changes
                        viewModel.updateSlotsForDate(value);
                        
                        // After viewModel updates slots, we get them newly
                        final slots = viewModel.availableSlots;
                        selectedTime = slots.isNotEmpty ? slots.first : null;
                      });
                    },
                  ),

                  const SizedBox(height: 30),
                  buildTimeSlotSelector(
                    selectedTime: selectedTime,
                    availableTimeSlots: availableSlots
                        .map((slot) => {"time": slot, "available": "true"})
                        .toList(),
                    onSelectTime: (value) {
                      setState(() => selectedTime = value);
                    },
                  ),
                  const SizedBox(height: 30),
                  // Reason for Appointment
                  const Text(
                    'Reason for Appointment',
                    style: TextStyle(
                      fontFamily: 'CustomFontFamily',
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _reasonController,
                    decoration: InputDecoration(
                      hintText: 'Enter reason (e.g., General checkup, Chest pain)',
                      hintStyle: TextStyle(color: Colors.grey.shade400),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey.shade300),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFF00B7B7), width: 2),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    ),
                    maxLines: 2,
                  ),
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ),
          buildBottomBookBar(
            context: context,
            onBook: _handleBookAppointment,
            onChat: () {
              Navigator.pushNamed(
                context,
                '/chat',
                arguments: widget.doctor,
              );
            },
          ),
        ],
      ),
    );
  }
}
