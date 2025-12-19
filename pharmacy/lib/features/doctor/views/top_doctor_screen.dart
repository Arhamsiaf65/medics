import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:path/path.dart';
import 'package:provider/provider.dart';

import '../data/models/doctor_model.dart';
import '../viewmodels/doctors_viewmodel.dart';
import 'doctor_detail_screen.dart';

// Colors
const Color primaryTeal = Color(0xFF00B7B7);

// Placeholder text style
const TextStyle customTextStyle = TextStyle(
  fontFamily: 'CustomFontFamily',
);

// -------------------------------------------------------
// ❌ REMOVE THIS — It was WRONG and causing syntax error
// Doctor({name =..., specialty=...})
// -------------------------------------------------------

// -------------------------------------------------------
// ✅ Correct Doctor List
// -------------------------------------------------------
// final List<Doctor> allDoctors = [
//   Doctor(
//     name: "dsfksdf",
//     specialty: "dsfksdf",
//     rating: 4.7,
//     distance: "800m away",
//     imageUrl: "assets/images/doctor_marcus.jpg",
//   ),
//   Doctor(
//     name: 'Dr. Maria Elena',
//     specialty: 'Psychologist',
//     rating: 4.7,
//     distance: '800m away',
//     imageUrl: 'assets/images/doctor_maria.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Stefi Jessi',
//     specialty: 'Orthopedist',
//     rating: 4.7,
//     distance: '800m away',
//     imageUrl: 'assets/images/doctor_stevi.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Gerty Cori',
//     specialty: 'Orthopedist',
//     rating: 4.7,
//     distance: '800m away',
//     imageUrl: 'assets/images/doctor_marcus.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Diandra',
//     specialty: 'Orthopedist',
//     rating: 4.7,
//     distance: '800m away',
//     imageUrl: 'assets/images/doctor_keth.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Jack',
//     specialty: 'Dermatologist',
//     rating: 4.7,
//     distance: '90km away',
//     imageUrl: 'assets/images/doctor_jack.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Keth',
//     specialty: 'Nepherologist',
//     rating: 4.7,
//     distance: '80km away',
//     imageUrl: 'assets/images/doctor_keth.jpg',
//   ),
// ];

// -------------------------------------------------------
// Doctor Cards
// -------------------------------------------------------
class DoctorCard extends StatelessWidget {
  final Doctor doctor;
  final VoidCallback onTap;

  const DoctorCard({
    required this.doctor,
    required this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        padding: const EdgeInsets.all(12),
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: Image.asset(
                doctor.imageUrl,
                width: 70,
                height: 70,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 15),

            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    doctor.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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
            ),
          ],
        ),
      ),
    );
  }
}


class TopDoctorScreen extends StatelessWidget {
   TopDoctorScreen({super.key});

   List<Doctor> allDoctors = [];

  void _navigateToDoctorProfile(BuildContext context, Doctor doctor) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => DoctorDetailScreen(doctor: doctor),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewModel =  Provider.of<DoctorsViewModel>(context);
    allDoctors = viewModel.doctors;
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

        title: Text(
          'Top Doctor',
          style: customTextStyle.copyWith(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),

        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert, color: Colors.black),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Opening options menu...')),
              );
            },
          ),
        ],
      ),

      body: ListView.builder(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 20),
        itemCount: allDoctors.length,
        itemBuilder: (context, index) {
          final doctor = allDoctors[index];
          return DoctorCard(
            doctor: doctor,
            onTap: () => _navigateToDoctorProfile(context, doctor),
          );
        },
      ),
    );
  }
}
