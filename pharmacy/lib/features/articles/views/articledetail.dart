import 'package:flutter/material.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:pharmacy/features/articles/data/models/health_article_model.dart';


class ArticleDetailPage extends StatelessWidget {
  final HealthArticle article;

  const ArticleDetailPage({Key? key, required this.article}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppbar(
        leading: Icons.chevron_left,
        text: "Article",
        leadingCallBack: () => Navigator.pop(context),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Image.network(
                article.imageUrl,
                height: 200,
                width: double.infinity,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => Container(
                  height: 200,
                  width: double.infinity,
                  color: Colors.grey.shade300,
                  child: const Center(child: Icon(Icons.image_not_supported, size: 50)),
                ),
              ),
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                Text(
                  article.source,
                  style: TextStyle(fontSize: 13, color: Colors.grey[600]),
                ),
                const SizedBox(width: 8),
                Text(
                  '· ${article.readTime}',
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF199A8E),
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            Text(
              article.title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: Colors.black,
              ),
            ),

            const SizedBox(height: 16),

            // 🧾 Description / Body
            Text(
              article.content ??
                  "This is a detailed view of the article. content not available.",
              textAlign: TextAlign.justify,
              style: const TextStyle(
                fontSize: 15,
                height: 1.7,
                color: Colors.black87,
              ),
            ),

            const SizedBox(height: 20),

            Container(
              padding: const EdgeInsets.all(14),
              margin: const EdgeInsets.symmetric(vertical: 10),
              decoration: BoxDecoration(
                color: const Color(0xFF199A8E).withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF199A8E).withOpacity(0.3)),
              ),
              child: const Text(
                '"Good health is not something we can buy. However, it can be an extremely valuable savings account."',
                style: TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Color(0xFF199A8E),
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
            ),

            const SizedBox(height: 20),
            
            if (article.category != null)
              Wrap(
                spacing: 8,
                children: [
                   Chip(
                    label: Text(article.category!),
                    backgroundColor: const Color(0xFFE8F6F5),
                    labelStyle: const TextStyle(color: Color(0xFF199A8E)),
                  ),
                ],
              ),

            const SizedBox(height: 24),
            
            if (article.author != null)
             Row(
              children: [
                 CircleAvatar(
                  radius: 22,
                  backgroundImage: article.author?.imageUrl != null && article.author!.imageUrl!.isNotEmpty
                    ? NetworkImage(article.author!.imageUrl!)
                    : const NetworkImage(
                    'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=60', // Fallback
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      article.author!.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    if (article.author!.specialty != null)
                    Text(
                      article.author!.specialty!,
                      style: const TextStyle(
                        color: Colors.grey,
                        fontSize: 13,
                      ),
                    ),
                  ],
                )
              ],
            ),
          ],
        ),
      ),
    );
  }
}
