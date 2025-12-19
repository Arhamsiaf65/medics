class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final DateTime createdAt;
  final Map<String, dynamic> metadata;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
    this.metadata = const {},
  });

  factory NotificationModel.fromFirestore(Map<String, dynamic> data, String id) {
    return NotificationModel(
      id: id,
      title: data['title'] ?? '',
      message: data['message'] ?? '',
      type: data['type'] ?? 'general',
      isRead: data['isRead'] ?? false,
      createdAt: data['createdAt'] != null 
          ? DateTime.tryParse(data['createdAt']) ?? DateTime.now() 
          : DateTime.now(),
      metadata: data['metadata'] ?? {},
    );
  }
}
