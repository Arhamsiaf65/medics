class HealthArticle {
  final String id;
  final String title;
  final String source;
  final String readTime;
  final String imageUrl;
  final String? content;
  final String? category;
  final String? authorId;
  final ArticleAuthor? author;

  HealthArticle({
    required this.id,
    required this.title,
    required this.source,
    required this.readTime,
    required this.imageUrl,
    this.content,
    this.category,
    this.authorId,
    this.author,
  });

  // Factory constructor for JSON deserialization
  factory HealthArticle.fromJson(Map<String, dynamic> json) {
    return HealthArticle(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      source: json['source'] ?? '',
      readTime: json['readTime'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      content: json['content'],
      category: json['category'],
      authorId: json['authorId'],
      author: json['author'] != null ? ArticleAuthor.fromJson(json['author']) : null,
    );
  }

  // Method for JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'source': source,
      'readTime': readTime,
      'imageUrl': imageUrl,
      'content': content,
      'category': category,
      'authorId': authorId,
      'author': author?.toJson(),
    };
  }
}

class ArticleAuthor {
  final String id;
  final String name;
  final String? imageUrl;
  final String? specialty;

  ArticleAuthor({
    required this.id,
    required this.name,
    this.imageUrl,
    this.specialty,
  });

  factory ArticleAuthor.fromJson(Map<String, dynamic> json) {
    return ArticleAuthor(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown Author',
      imageUrl: json['imageUrl'],
      specialty: json['specialty'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'imageUrl': imageUrl,
      'specialty': specialty,
    };
  }
}
