
import 'package:flutter/cupertino.dart';
import 'package:pharmacy/features/articles/data/article_repository/article_repository.dart';
import 'package:pharmacy/features/articles/data/models/health_article_model.dart';

class ArcticleViewModel extends ChangeNotifier {
  final HealthArticle_Repository _repo;

  ArcticleViewModel(this._repo){
    loadArticles();
  }
  
  List<HealthArticle> articles = [];
  bool isLoading = false;
  
  List<String> categories = ["All"];
  String selectedCategory = "All";

  Future<void> loadArticles() async {
    isLoading = true;
    notifyListeners();
    try{
      articles = await _repo.getArticles();
      
      final uniqueCategories = articles
          .map((a) => a.category)
          .where((c) => c != null && c.isNotEmpty)
          .toSet()
          .cast<String>()
          .toList();
      categories = ["All", ...uniqueCategories];
      
    } catch (e) {
      print("Error loading articles: $e");
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void selectCategory(String category) {
    selectedCategory = category;
    notifyListeners();
  }

  List<HealthArticle> get filteredArticles {
    if (selectedCategory == "All") {
      return articles;
    }
    return articles.where((a) => a.category == selectedCategory).toList();
  }

}