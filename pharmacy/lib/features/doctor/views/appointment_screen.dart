import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';
import 'package:pharmacy/core/constants/app_constants.dart';
import 'package:pharmacy/features/doctor/viewmodels/doctors_viewmodel.dart';

class AppointmentScreen extends StatefulWidget {
  final Doctor doctor;
  final String selectedDate; // e.g., "2025-02-10, Mon" or "2025-02-10"
  final String selectedTime;
  final Map<String, double> paymentDetails;
  final double totalPayment;
  final String reason; // optional

  const AppointmentScreen({
    super.key,
    required this.doctor,
    required this.selectedDate,
    required this.selectedTime,
    required this.paymentDetails,
    required this.totalPayment,
    this.reason = 'General Consultation',
  });

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  bool _isLoading = false;

  void _handleBooking() async {
    setState(() => _isLoading = true);

    try {
      final viewModel = Provider.of<DoctorsViewModel>(context, listen: false);
      
      // Parse date to YYYY-MM-DD
      // selectedDate might be "2025-02-10, Mon"
      final datePart = widget.selectedDate.split(',')[0].trim();

      await viewModel.bookAppointment(
        doctorId: widget.doctor.id,
        date: datePart,
        time: widget.selectedTime,
        reason: widget.reason,
      );

      if (mounted) {
        _showPaymentSuccessDialog(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Booking Failed: ${e.toString().replaceAll("Exception:", "")}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showPaymentSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Payment Successful'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 60),
              const SizedBox(height: 16),
              Text('Your appointment with ${widget.doctor.name} has been booked successfully!'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(); // close dialog
                Navigator.of(context).pop(); // close appointment screen
                Navigator.of(context).pop(); // close detail screen (optional, depending on flow)
              },
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  String getFormattedDate() {
    final parts = widget.selectedDate.split(',');
    if (parts.isEmpty) return widget.selectedDate;
    try {
      final dt = DateTime.parse(parts[0].trim());
      // If original had "Mon", keep it, else fetch new
      final dayOfWeek = parts.length > 1 ? parts[1].trim() : DateFormat('EEE').format(dt);
      final dateFormatted = DateFormat('d MMM yyyy').format(dt);
      return '$dayOfWeek, $dateFormatted | ${widget.selectedTime}';
    } catch (_) {
      return widget.selectedDate + ' | ' + widget.selectedTime;
    }
  }

  @override
  Widget build(BuildContext context) {
    final fullAppointmentDateTime = getFormattedDate();

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
          'Appointment',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.black),
        ),
      ),
      body: Stack(
        children: [
          Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildDoctorInfoCard(context, widget.doctor),
                      const SizedBox(height: 25),

                      _buildSectionHeader('Date', () {}),
                      const SizedBox(height: 15),
                      _buildInfoRow(icon: Icons.calendar_today_outlined, text: fullAppointmentDateTime),
                      const SizedBox(height: 25),

                      _buildSectionHeader('Reason', () {}),
                      const SizedBox(height: 15),
                      _buildInfoRow(icon: Icons.edit_note_outlined, text: widget.reason),
                      const SizedBox(height: 25),

                      const Text(
                        'Payment Detail',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black),
                      ),
                      const SizedBox(height: 15),

                      // dynamically show payment rows
                      ...widget.paymentDetails.entries.map((e) {
                        bool isDiscount = e.key.toLowerCase().contains('discount');
                        return _buildPaymentRow(e.key, e.value, isDiscount: isDiscount);
                      }).toList(),

                      const SizedBox(height: 10),
                      const Divider(color: Colors.grey, height: 1),
                      const SizedBox(height: 10),

                      _buildPaymentRow('Total', widget.totalPayment, isTotal: true),
                      const SizedBox(height: 25),

                      _buildSectionHeader('Payment Method', () {}),
                      const SizedBox(height: 15),
                      _buildPaymentMethodCard(context, 'VISA'),
                      const SizedBox(height: 50),
                    ],
                  ),
                ),
              ),

              _buildBottomBookingBar(context),
            ],
          ),
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.3),
              child: const Center(child: CircularProgressIndicator()),
            ),
        ],
      ),
    );
  }

  Widget _buildDoctorInfoCard(BuildContext context, Doctor doctor) {
    return Container(
      padding: const EdgeInsets.all(12),
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), spreadRadius: 1, blurRadius: 5, offset: const Offset(0, 3))],
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Image.network(doctor.imageUrl, width: 90, height: 90, fit: BoxFit.cover,
             errorBuilder: (context, error, stackTrace) => Container(width: 90, height: 90, color: Colors.grey, child: Icon(Icons.person)),
            ),
          ),
          const SizedBox(width: 15),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black)),
              const SizedBox(height: 4),
              Text(doctor.specialty, style: TextStyle(color: Colors.grey.shade600, fontSize: 14)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.star, color: primaryTeal, size: 14),
                  const SizedBox(width: 4),
                  Text('${doctor.rating}', style: const TextStyle(fontSize: 13, color: primaryTeal)),
                  const SizedBox(width: 10),
                  const Icon(Icons.location_on, color: Colors.grey, size: 14),
                  const SizedBox(width: 4),
                  Text(doctor.distance, style: TextStyle(fontSize: 13, color: Colors.grey.shade600)),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, VoidCallback onChangeTap) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.black)),
        GestureDetector(
          onTap: onChangeTap,
          child: Text('Change', style: TextStyle(fontSize: 14, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
        ),
      ],
    );
  }

  Widget _buildInfoRow({required IconData icon, required String text}) {
    return Row(
      children: [
        Icon(icon, color: Colors.black, size: 28),
        const SizedBox(width: 15),
        Expanded(
          child: Text(text, style: const TextStyle(fontSize: 16, color: Colors.black, fontWeight: FontWeight.w500)),
        ),
      ],
    );
  }

  Widget _buildPaymentRow(String label, double? amount, {bool isTotal = false, bool isDiscount = false}) {
    String amountText = amount != null ? '\$${amount.toStringAsFixed(2)}' : (isDiscount ? '-' : '');
    Color textColor = isTotal ? primaryTeal : Colors.black;
    FontWeight fontWeight = isTotal ? FontWeight.bold : FontWeight.normal;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontSize: 15, color: Colors.grey.shade600)),
          Text(amountText, style: TextStyle(fontSize: 15, fontWeight: fontWeight, color: textColor)),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodCard(BuildContext context, String method) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: Colors.grey.shade300, width: 1),
      ),
      child: Row(
        children: [
          const Icon(FontAwesomeIcons.ccVisa, color: Colors.blue, size: 28),
          const SizedBox(width: 15),
          Expanded(
            child: Text(method, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black)),
          ),
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Text('Change', style: TextStyle(fontSize: 14, color: Colors.grey.shade500, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomBookingBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), spreadRadius: 1, blurRadius: 10, offset: const Offset(0, -1))],
      ),
      child: Row(
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Total', style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
              const SizedBox(height: 3),
              Text('\$${widget.totalPayment.toStringAsFixed(2)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.black)),
            ],
          ),
          const SizedBox(width: 20),
          Expanded(
            child: ElevatedButton(
              onPressed: _isLoading ? null : _handleBooking,
              style: ElevatedButton.styleFrom(
                backgroundColor: primaryTeal,
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              child: _isLoading 
                ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('Confirm Payment', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18)),
            ),
          ),
        ],
      ),
    );
  }
}
