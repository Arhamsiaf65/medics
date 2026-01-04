// lib/features/home/views/home_screen.dart

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:pharmacy/core/widgets/customsearchbar.dart';

// FIX: Corrected import for Doctor model

// Health Article Model

// FIX: Constant import must correctly export primaryTeal
import 'package:pharmacy/core/constants/app_constants.dart' show primaryTeal;
import 'package:pharmacy/features/articles/widgets/articlecard.dart';
import 'package:pharmacy/features/doctor/data/models/doctor_model.dart';

import 'package:pharmacy/features/doctor/views/top_doctor_screen.dart';
import 'package:provider/provider.dart';

import '../../../routes.dart';
import '../../articles/data/models/health_article_model.dart';
import '../../articles/widgets/relatedarticlescard.dart';
import '../../doctor/viewmodels/doctors_viewmodel.dart';
import '../../articles/viewmodels/article_viewmodel.dart';
import '../../auth/data/repositories/auth_repository.dart';



// Sample Data
// final List<Doctor> topDoctors = [
//   Doctor(
//     name: 'Dr. Marcus Horiz',
//     specialty: 'Chardiologist',
//     rating: 4.7,
//     distance: '800m away',
//     imageUrl: 'assets/images/doctor_marcus.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Maria Elena',
//     specialty: 'Psychologist',
//     rating: 4.9,
//     distance: '1.5km away',
//     imageUrl: 'assets/images/doctor_maria.jpg',
//   ),
//   Doctor(
//     name: 'Dr. Stevi Jessi',
//     specialty: 'Orthopedist',
//     rating: 4.8,
//     distance: '2km away',
//     imageUrl: 'assets/images/doctor_stevi.jpg',
//   ),
// ];


class  HomeScreen extends StatelessWidget {
  HomeScreen({super.key});


  List<Doctor> topDoctors = [];
  void _navigateToTopDoctorScreen(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) =>  TopDoctorScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewModel =  Provider.of<DoctorsViewModel>(context);
    final articleViewModel = Provider.of<ArcticleViewModel>(context);
    topDoctors = viewModel.topDoctors;
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        toolbarHeight: 120,
        automaticallyImplyLeading: false,
        title: const Padding(
          padding: EdgeInsets.only(left: 8.0, top: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Find your desire',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.w400, color: Colors.black),
              ),
              Text(
                'health solution',
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
              ),
            ],
          ),
        ),
        actions: [

          Padding(
            padding: const EdgeInsets.only(right: 16.0, top: 20.0),
            child: IconButton(
              icon: const Icon(Icons.person, color: Colors.black, size: 28),
              onPressed: () => Navigator.pushNamed(context, Routes.profile),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const SizedBox(height: 10),

            CustomSearchBar(
              hintText: "Search doctors, articles...",
              readOnly: true,
              onTap: () => Navigator.pushNamed(context, Routes.search),
            ),
            const SizedBox(height: 25),


            // Category Row
            // Category Row
            Container(
              padding: const EdgeInsets.all(15),
              decoration: BoxDecoration(
                color: const Color(0xFFFBFBFB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFE8F3F1)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  CategoryIcon(
                    faIcon: FontAwesomeIcons.userDoctor,
                    label: 'Doctors',
                    onTap: () => Navigator.pushNamed(context, Routes.doctors),
                  ),
                  Container(height: 50, width: 1, color: Colors.grey.shade300), // Divider
                  CategoryIcon(
                    faIcon: FontAwesomeIcons.newspaper,
                    label: 'Articles',
                    onTap: () => Navigator.pushNamed(context, Routes.articles),
                  ),
                ],
              ),
            ),


            const SizedBox(height: 30),

            _Banner(context),
            const SizedBox(height: 30),

            // Top Doctor Section
            _buildSectionHeader(
              context,
              'Top Doctor',
              onClick: () => Navigator.pushNamed(context, Routes.topDoctors),
            ),
            const SizedBox(height: 15),
            _buildTopDoctorList(context, topDoctors),

            const SizedBox(height: 30),

            // Health Articles
            _buildSectionHeader(
              context,
              'Health Articles',
              onClick: () => Navigator.pushNamed(context, Routes.articles),
            ),
            const SizedBox(height: 15),
            _buildHealthArticleList(context, articleViewModel.articles),

            const SizedBox(height: 20),
          ],
        ),
      ),

      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, Routes.aiChat),
        backgroundColor: const Color(0xFF199A8E),
        child: const Icon(Icons.chat_bubble_outline, color: Colors.white),
      ),
    );
  }








  // PROTECTION BANNER
  Widget _Banner(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFFE6F9F9),
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Early protection for\nyour family health',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 15),
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, Routes.articles),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.teal,
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Text(
                      'Learn more',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
              ],
            ),
          ),
          ClipOval(
            child: Image.asset(
              'assets/images/doctor_banner.png',
              width: 100,
              height: 100,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => Container(
                width: 100,
                height: 100,
                color: Colors.grey.shade300,
                child: const Icon(Icons.person, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // SECTION HEADER
  Widget _buildSectionHeader(BuildContext context, String title, {required VoidCallback onClick}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        GestureDetector(
          onTap: onClick,
          child:  Text('See all', style: TextStyle(fontSize: 14, color: Colors.teal)),
        ),
      ],
    );
  }

  // TOP DOCTORS LIST
  Widget _buildTopDoctorList(BuildContext context, List<Doctor> topDoctors) {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: topDoctors.length,
        itemBuilder: (context, index) {
          final doctor = topDoctors[index];
          return Padding(
            padding: const EdgeInsets.only(right: 15.0),
            child: DoctorCard(
              doctor: doctor,
              onTap: () => {
                Navigator.pushNamed(context, Routes.doctorDetail, arguments: doctor),
              }

                  // _navigateToPage(context, 'Doctor: ${doctor.name}'),
            ),
          );
        },
      ),
    );
  }



  // HEALTH ARTICLE LIST
  Widget _buildHealthArticleList(BuildContext context, List<HealthArticle> articles) {
    // Show only top 3 or so
    final displayArticles = articles.length > 3 ? articles.sublist(0, 3) : articles;
    return Column(
      children: displayArticles.map((article) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 15.0),
          child: RelatedArticleCard(article: article),
        );
      }).toList(),
    );
  }
}

// CATEGORY ICON
class CategoryIcon extends StatelessWidget {
  final IconData faIcon;
  final String label;
  final VoidCallback onTap;

  const CategoryIcon({
    required this.faIcon,
    required this.label,
    required this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 65,
            height: 65,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(65),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.15),
                  spreadRadius: 1,
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Center(child: FaIcon(faIcon, color: Colors.teal, size: 30)),
          ),
          const SizedBox(height: 8),
          Text(label, style: TextStyle(fontSize: 14, color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}

// DOCTOR CARD
class DoctorCard extends StatelessWidget {
  final Doctor doctor;
  final VoidCallback onTap;

  const DoctorCard({required this.doctor, required this.onTap, super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 170,
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
        child: Padding(
          padding: const EdgeInsets.all(10.0),
          child: Column(
            children: [
              CircleAvatar(
                radius: 35,
                backgroundColor: Colors.grey.shade200,
                backgroundImage: NetworkImage(doctor.imageUrl),

              ),
              const SizedBox(height: 10),
              Text(doctor.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
              Text(doctor.specialty, style: const TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.star, color: Colors.amber, size: 14),
                  const SizedBox(width: 4),
                  Text('${doctor.rating}', style: const TextStyle(fontSize: 13)),
                  const SizedBox(width: 8),
                   FaIcon(FontAwesomeIcons.locationDot, color: Colors.teal, size: 14),
                  const SizedBox(width: 4),
                  Text(doctor.distance, style: const TextStyle(fontSize: 13)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}


