class DoctorSchedule {
  final String doctorId;
  final String doctorName;
  final List<String> availableDates;
  final List<ScheduleItem> schedules;
  final PaymentDetails paymentDetails;

  DoctorSchedule({
    required this.doctorId,
    required this.doctorName,
    required this.availableDates,
    required this.schedules,
    required this.paymentDetails,
  });

  factory DoctorSchedule.fromJson(Map<String, dynamic> json) {
    return DoctorSchedule(
      doctorId: json['doctorId'],
      doctorName: json['doctorName'],
      availableDates: List<String>.from(json['availableDates']),
      schedules: (json['schedules'] as List<dynamic>)
          .map((item) => ScheduleItem.fromJson(item))
          .toList(),
      paymentDetails: PaymentDetails.fromJson(json['paymentDetails']),
    );
  }
}

class ScheduleItem {
  final String date;
  final List<String> timeSlots;

  ScheduleItem({
    required this.date,
    required this.timeSlots,
  });

  factory ScheduleItem.fromJson(Map<String, dynamic> json) {
    return ScheduleItem(
      date: json['date'],
      timeSlots: List<String>.from(json['timeSlots']),
    );
  }
}

class PaymentDetails {
  final double consultationFee;
  final double adminFee;
  final double discount;

  PaymentDetails({
    required this.consultationFee,
    required this.adminFee,
    required this.discount,
  });

  factory PaymentDetails.fromJson(Map<String, dynamic> json) {
    return PaymentDetails(
      consultationFee: (json['consultationFee'] as num).toDouble(),
      adminFee: (json['adminFee'] as num).toDouble(),
      discount: (json['discount'] as num).toDouble(),
    );
  }
}
