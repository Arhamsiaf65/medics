import 'package:flutter/material.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:pharmacy/core/widgets/customsearchbar.dart';
import 'package:pharmacy/features/articles/viewmodels/article_viewmodel.dart';
import 'package:pharmacy/features/articles/widgets/articlecard.dart';
import 'package:pharmacy/features/articles/widgets/relatedarticlescard.dart';
import 'package:pharmacy/features/doctor/viewmodels/doctors_viewmodel.dart';
import 'package:pharmacy/features/home/views/home_screen.dart'; // For DoctorCard
import 'package:provider/provider.dart';
import 'package:iconly/iconly.dart';

import '../../../routes.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({Key? key}) : super(key: key);

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final doctorViewModel = Provider.of<DoctorsViewModel>(context);
    final articleViewModel = Provider.of<ArcticleViewModel>(context);

    final filteredDoctors = doctorViewModel.doctors.where((doctor) {
      return doctor.name.toLowerCase().contains(_query.toLowerCase()) ||
          doctor.specialty.toLowerCase().contains(_query.toLowerCase());
    }).toList();

    final filteredArticles = articleViewModel.articles.where((article) {
      return article.title.toLowerCase().contains(_query.toLowerCase()) ||
          article.category?.toLowerCase().contains(_query.toLowerCase()) == true;
    }).toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: CustomAppbar(
        leading: Icons.chevron_left,
        leadingCallBack: () => Navigator.pop(context),
        text: "Search",
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CustomSearchBar(
              hintText: "Search doctors, articles...",
              controller: _searchController,
              autofocus: true,
              onChanged: (value) {
                setState(() {
                  _query = value;
                });
              },
            ),
            const SizedBox(height: 20),

            if (_query.isNotEmpty) ...[
              if (filteredDoctors.isNotEmpty) ...[
                const Text(
                  "Doctors",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 190,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: filteredDoctors.length,
                    itemBuilder: (context, index) {
                      final doctor = filteredDoctors[index];
                      return Padding(
                        padding: const EdgeInsets.only(right: 15.0),
                        child: DoctorCard(
                          doctor: doctor,
                          onTap: () => Navigator.pushNamed(context, Routes.doctorDetail, arguments: doctor),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
              ],

              if (filteredArticles.isNotEmpty) ...[
                const Text(
                  "Articles",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),
                Column(
                  children: filteredArticles.map((article) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 15.0),
                      child: RelatedArticleCard(article: article),
                    );
                  }).toList(),
                ),
              ],

              if (filteredDoctors.isEmpty && filteredArticles.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 50.0),
                    child: Column(
                      children: [
                        Icon(IconlyLight.search, size: 50, color: Colors.grey),
                        SizedBox(height: 10),
                         Text("No results found", style: TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                ),
            ] else 
              const Center(
                  child: Padding(
                    padding: EdgeInsets.only(top: 50.0),
                    child: Text("Type to search...", style: TextStyle(color: Colors.grey)),
                  ),
                ),
          ],
        ),
      ),
    );
  }
}
