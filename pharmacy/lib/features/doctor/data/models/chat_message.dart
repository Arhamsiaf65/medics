class ChatMessage {
  final String? id;
  final String userId;
  final String doctorId;
  final String text;
  final bool isFromUser;
  final DateTime createdAt;

  ChatMessage({
    this.id,
    required this.userId,
    required this.doctorId,
    required this.text,
    required this.isFromUser,
    required this.createdAt,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] as String?, // Prisma might return id or _id
      userId: json['userId'] as String,
      doctorId: json['doctorId'] as String,
      text: json['text'] as String,
      isFromUser: json['isFromUser'] as bool,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'doctorId': doctorId,
      'text': text,
      'isFromUser': isFromUser,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
