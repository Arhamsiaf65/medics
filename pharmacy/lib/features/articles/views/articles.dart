import 'package:flutter/material.dart';
import 'package:pharmacy/features/articles/data/models/health_article_model.dart';
import 'package:pharmacy/features/home/views/home_screen.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:pharmacy/core/widgets/customsearchbar.dart';
import 'package:pharmacy/features/articles/widgets/populararticlescategorylist.dart';
import 'package:pharmacy/features/articles/widgets/articlecard.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/articles/widgets/relatedarticlescard.dart';
import 'package:iconly/iconly.dart';
import 'package:pharmacy/routes.dart';

import '../viewmodels/article_viewmodel.dart';

class ArticlesPage extends StatefulWidget {


  @override
  State<ArticlesPage> createState() => _ArticlePageState();
}

class _ArticlePageState extends State<ArticlesPage> {
  @override
  void initState() {
    super.initState();
    selectedIndex = 1;
    // Trigger load on init if empty (though VM constructor does it too, safe to do here or rely on Consumer)
  }



  var selectedIndex = 1;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        appBar: CustomAppbar(
          leading: Icons.chevron_left,
          trailing: Icons.more_vert,
          text: "Articles",
        ),
        body: Consumer<ArcticleViewModel>(
          builder: (context, viewModel, child) {
            if (viewModel.isLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            final articles = viewModel.filteredArticles;

            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(18, 25, 18, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Search Bar
                  CustomSearchBar(
                    hintText: "Search articles, news...",
                    readOnly: true,
                    onTap: () => Navigator.pushNamed(context, Routes.search),
                  ),

                  const SizedBox(height: 20),

                  // Popular Articles Section
                  Text(
                    "Popular Articles",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 10),
                  // This list scrolls horizontally inside the vertical page
                  PopularArticlesCategoryList(
                    categories: viewModel.categories,
                    selectedCategory: viewModel.selectedCategory,
                    onCategorySelected: (category) => viewModel.selectCategory(category),
                  ),

                  const SizedBox(height: 25),

                  // Trending Articles Section
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        "Trending Articles",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        "See all",
                        style: TextStyle(
                          color: Color(0xFF199A8E),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 15),
                  // Horizontal list of article cards
                  articles.isEmpty 
                  ? const Center(child: Text("No articles found"))
                  : SizedBox(
                    height: 220, // Adjusted height for ArticleCard (Fix overflow)
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: articles.length > 5 ? 5 : articles.length,
                      itemBuilder: (context, index) {
                        return ArticleCard(article: articles[index]);
                      },
                    ),
                  ),

                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text(
                        "Related Articles",
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        "See all",
                        style: TextStyle(
                          color: Color(0xFF199A8E),
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                   articles.isEmpty 
                  ? const SizedBox()
                  : ListView.builder(
                    physics: const NeverScrollableScrollPhysics(),
                    shrinkWrap: true,
                    itemCount: articles.length,
                    itemBuilder: (context, index) {
                      return RelatedArticleCard(article: articles[index]);
                    },
                  ),

                ],
              ),
            );
          }
        ),
        bottomNavigationBar: BottomNavigationBar(
            currentIndex: selectedIndex,
            onTap: (int index) {
              if (index == 0) {
                setState(() {
                  selectedIndex = 0;
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) =>  HomeScreen()),
                  );
                });
              } else if (index == 1) {
                setState(() {
                  selectedIndex = 1;
                });
              }
            },
            items: [
              BottomNavigationBarItem(
                icon: Icon(IconlyLight.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(IconlyLight.paper),
                label: 'Articles',
              ),

            ]),

      ),
    );
  }
}
