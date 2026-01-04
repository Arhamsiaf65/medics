import 'package:flutter/material.dart';
import '../../../../services/services/api_service.dart';
import '../data/models/doctor_model.dart';

class ChatConversation {
  final String doctorId;
  final String doctorName;
  final String? doctorImage;
  final String? lastMessage; 


  ChatConversation({
    required this.doctorId, 
    required this.doctorName, 
    this.doctorImage,
    this.lastMessage
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    final user = json['user'] ?? {};
    return ChatConversation(
      doctorId: json['id'], // Doctor ID
      doctorName: user['name'] ?? json['name'] ?? 'Doctor',
      doctorImage: user['avatarUrl'] ?? json['imageUrl'],
      // lastMessage: json['lastMessage'] // Not implemented in backend yet
    );
  }
}

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  List<ChatConversation> _conversations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchConversations();
  }

  Future<void> _fetchConversations() async {
    try {
      final response = await ApiService.get('chat/user/conversations');
      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        setState(() {
          _conversations = data.map((json) => ChatConversation.fromJson(json)).toList();
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {

      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Messages', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0.5,
      ),
      body: _isLoading 
          ? const Center(child: CircularProgressIndicator()) 
          : _conversations.isEmpty
              ? const Center(child: Text("No conversations yet."))
              : ListView.separated(
                  itemCount: _conversations.length,
                  separatorBuilder: (context, index) => const Divider(height: 1),
                  itemBuilder: (context, index) {
                    final chat = _conversations[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundImage: chat.doctorImage != null 
                             ? NetworkImage(chat.doctorImage!) 
                             : null,
                        child: chat.doctorImage == null ? const Icon(Icons.person) : null,
                      ),
                      title: Text(chat.doctorName, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: const Text("Tap to chat"), 
                      onTap: () {
                        // Create a minimal doctor object to pass to ChatScreen
                        final doctor = Doctor(
                          id: chat.doctorId,
                          name: chat.doctorName,
                          specialty: 'Chat', // Placeholder
                          rating: 0.0,
                          distance: '',
                          imageUrl: chat.doctorImage ?? 'https://via.placeholder.com/150', // Fallback
                          schedule: {},
                        );
                        
                        Navigator.pushNamed(
                          context, 
                          '/chat',
                          arguments: doctor,
                        );
                      },
                    );
                  },
                ),
    );
  }
}
