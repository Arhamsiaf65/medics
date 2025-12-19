import 'package:pharmacy/features/articles/data/models/health_article_model.dart';
import 'package:pharmacy/services/services/api_service.dart';



class HealthArticle_Repository {
  Future<List<HealthArticle>> getArticles() async {
    try {
      print("running getarticle in repo");
      final response = ApiService.get("articles");
      final Map<String, dynamic> body = await response;
      if (body['success'] == false) {
        throw Exception(body['error'] ?? "Unknown error");
      }

      final List<dynamic> articlesData = body["data"];
      print(articlesData);
      return articlesData
          .map<HealthArticle>((article) => HealthArticle.fromJson(article))
          .toList();
    } catch (e) {
      print(e);
      throw Exception("Failed to fetch articles: $e");
    }
  }

}