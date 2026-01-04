// lib/features/doctor/widgets/doctor_detail_widgets.dart

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../data/models/doctor_model.dart';

const Color primaryTeal = Color(0xFF00B7B7);
const Color primaryGrey = Color(0xFFEFEFEF);

const TextStyle customTextStyle = TextStyle(
  fontFamily: 'CustomFontFamily',
);

// Dummy available time slots
final List<Map<String, String>> availableTimeSlots = [
  {'time': '09:00 AM', 'available': 'false'},
  {'time': '10:00 AM', 'available': 'true'},
  {'time': '11:00 AM', 'available': 'false'},
  {'time': '01:00 PM', 'available': 'false'},
  {'time': '02:00 PM', 'available': 'true'},
  {'time': '03:00 PM', 'available': 'true'},
  {'time': '04:00 PM', 'available': 'true'},
  {'time': '07:00 PM', 'available': 'true'},
  {'time': '08:00 PM', 'available': 'false'},
];

// ------------------ Doctor Info ------------------
Widget buildDoctorInfo(Doctor doctor) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
          doctor.imageUrl,
          width: 90,
          height: 90,
          fit: BoxFit.cover,
        ),
      ),
      const SizedBox(width: 15),
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            doctor.name,
            style: customTextStyle.copyWith(
              fontWeight: FontWeight.bold,
              fontSize: 18,
              color: Colors.black,
            ),
          ),
          Text(
            doctor.specialty,
            style: customTextStyle.copyWith(
              color: Colors.grey.shade600,
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.star, color: primaryTeal, size: 14),
              const SizedBox(width: 4),
              Text(
                '${doctor.rating}',
                style: customTextStyle.copyWith(
                  fontSize: 13,
                  color: primaryTeal,
                ),
              ),
              const SizedBox(width: 10),
              const Icon(Icons.location_on, color: Colors.grey, size: 14),
              const SizedBox(width: 4),
              Text(
                doctor.distance,
                style: customTextStyle.copyWith(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

// ------------------ About Section ------------------
// ------------------ About Section ------------------
class DoctorAboutSection extends StatefulWidget {
  final String about;
  const DoctorAboutSection({Key? key, required this.about}) : super(key: key);

  @override
  State<DoctorAboutSection> createState() => _DoctorAboutSectionState();
}

class _DoctorAboutSectionState extends State<DoctorAboutSection> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    // Default text if null/empty (though in this logical block we expect a string)
    final text = widget.about.isNotEmpty ? widget.about : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
    
    // Determine if text is long enough to need truncation
    const int truncateLength = 100;
    final bool isLongText = text.length > truncateLength;
    
    final displayText = isExpanded || !isLongText 
        ? text 
        : '${text.substring(0, truncateLength)}...';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'About',
          style: customTextStyle.copyWith(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
        const SizedBox(height: 8),
        RichText(
          text: TextSpan(
            style: customTextStyle.copyWith(
              fontSize: 14,
              height: 1.5,
              color: Colors.grey.shade600,
            ),
            children: [
              TextSpan(text: displayText),
              if (isLongText)
                WidgetSpan(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        isExpanded = !isExpanded;
                      });
                    },
                    child: Text(
                      isExpanded ? ' Read less' : ' Read more',
                      style: customTextStyle.copyWith(
                        color: primaryTeal,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

// ------------------ Date Selector ------------------


Widget buildDateSelector({
  required String? selectedDate,
  required Function(String) onSelectDate,
  required List<String> dates,
}) {
  return SizedBox(
    height: 90,
    child: ListView.separated(
      scrollDirection: Axis.horizontal,
      itemCount: dates.length,
      separatorBuilder: (_, __) => const SizedBox(width: 10),
      itemBuilder: (context, index) {
        final dateStr = dates[index]; // e.g. "2025-02-10, Mon"
        final parts = dateStr.split(',');

        // Correct check: parts must have 2 elements
        final day = parts.length > 1 ? parts[1].trim() : '';

        // Date string
        String dateFormatted = '';
        if (parts.isNotEmpty) {
          final datePart = parts[0].trim(); // "2025-02-10"
          try {
            final dt = DateTime.parse(datePart);
            dateFormatted = DateFormat('d MMM').format(dt);

            // "10 Feb"
          } catch (_) {
            dateFormatted = datePart; // fallback
          }
        }

        return DateCard(
          day: day,
          date: dateFormatted,
          isSelected: selectedDate == dateStr,
          onTap: () => onSelectDate(dateStr),
        );
      },
    ),
  );
}




// ------------------ Time Slot Selector ------------------
Widget buildTimeSlotSelector({
  required String? selectedTime,
  required Function(String) onSelectTime,
  required List<Map<String, String>> availableTimeSlots,
}) {
  return Wrap(
    spacing: 10,
    runSpacing: 15,
    children: availableTimeSlots.map<Widget>((slot) {   // <-- explicitly <Widget>
      final time = slot['time']!;
      return TimeSlot(
        time: time,
        isAvailable: slot['available'] == 'true',
        isSelected: selectedTime == time,
        onTap: slot['available'] == 'true' ? () => onSelectTime(time) : null,
      );
    }).toList(),
  );
}


// ------------------ Bottom Book Bar ------------------
Widget buildBottomBookBar({
  required BuildContext context,
  required VoidCallback onBook,
  VoidCallback? onChat,
}) {
  return Container(
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
    decoration: BoxDecoration(
      color: Colors.white,
      boxShadow: [
        BoxShadow(
          color: Colors.grey.withOpacity(0.1),
          spreadRadius: 1,
          blurRadius: 10,
          offset: const Offset(0, -1),
        ),
      ],
    ),
    child: Row(
      children: [
        GestureDetector(
          onTap: onChat,
          child: Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: primaryGrey,
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(Icons.chat_bubble_outline,
                color: primaryTeal, size: 24),
          ),
        ),
        const SizedBox(width: 15),
        Expanded(
          child: ElevatedButton(
            onPressed: onBook,
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryTeal,
              minimumSize: const Size(double.infinity, 50),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
            child: Text(
              'Book Appointment',
              style: customTextStyle.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
        ),
      ],
    ),
  );
}

// ------------------ DateCard ------------------
class DateCard extends StatelessWidget {
  final String day;
  final String date;
  final bool isSelected;
  final VoidCallback onTap;

  const DateCard({
    required this.day,
    required this.date,
    required this.isSelected,
    required this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        // width: 60, // fixed width for consistency
        padding: const EdgeInsets.symmetric( horizontal: 10),
        decoration: BoxDecoration(
          color: isSelected ? primaryTeal : Colors.white,
          borderRadius: BorderRadius.circular(15),
          border: Border.all(
            color: isSelected ? primaryTeal : Colors.grey.shade300,
            width: 1,
          ),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: primaryTeal.withOpacity(0.3),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              day,
              style: customTextStyle.copyWith(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: isSelected ? Colors.white : Colors.grey.shade600,
              ),
            ),
            // const SizedBox(height: 6),
            Text(
              date,
              style: customTextStyle.copyWith(
                fontSize: 15,
                // fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ------------------ TimeSlot ------------------
class TimeSlot extends StatelessWidget {
  final String time;
  final bool isAvailable;
  final bool isSelected;
  final VoidCallback? onTap;

  const TimeSlot({
    required this.time,
    required this.isAvailable,
    required this.isSelected,
    this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor = Colors.white;
    Color textColor = Colors.black;
    Color borderColor = Colors.grey.shade300;

    if (isSelected) {
      bgColor = primaryTeal;
      textColor = Colors.white;
      borderColor = primaryTeal;
    } else if (!isAvailable) {
      bgColor = primaryGrey;
      textColor = Colors.grey.shade400;
      borderColor = primaryGrey;
    }

    return GestureDetector(
      onTap: isAvailable ? onTap : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: borderColor, width: 1),
        ),
        child: Text(
          time,
          style: customTextStyle.copyWith(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textColor,
          ),
        ),
      ),
    );
  }
}
