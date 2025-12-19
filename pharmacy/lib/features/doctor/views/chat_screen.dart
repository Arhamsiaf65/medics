import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../data/models/chat_message.dart'; 
import '../data/models/doctor_model.dart';
import '../../auth/data/repositories/auth_repository.dart';
import '../services/chat_service.dart';

class ChatScreen extends StatefulWidget {
  final Doctor doctor;

  const ChatScreen({
    super.key, 
    required this.doctor, 
  });

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ChatService _chatService = ChatService();
  final List<dynamic> _messages = []; 
  String? currentUserId;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initializeChat();
  }

  Future<void> _initializeChat() async {
    final authRepo = Provider.of<AuthRepository>(context, listen: false);
    final user = await authRepo.getCurrentUser();
    
    if (user != null && user.id != null) {
      if (mounted) {
        setState(() {
          currentUserId = user.id;
        });
        
        _chatService.connect(user.id!);

        // Fetch initial messages
        try {
          final history = await _chatService.fetchMessages(widget.doctor.id);
          if (mounted) {
            setState(() {
              _messages.addAll(history);
              _isLoading = false;
            });
          }
        } catch (e) {
          print("Error loading chat history: $e");
          if (mounted) setState(() => _isLoading = false);
        }

        // Listen to messages
        _chatService.messageStream.listen((message) {
          if (mounted) {
            setState(() {
               // Avoid duplicates if we loaded history and socket sends same
               // Logic: check ID?
               if (!_messages.any((m) => m.id == message.id)) {
                  _messages.add(message);
               }
            });
          }
        });
      }
    } else {
      // Handle unauthenticated case
      if (mounted) {
         setState(() => _isLoading = false);
         ScaffoldMessenger.of(context).showSnackBar(
           const SnackBar(content: Text("Error: User not found. Please log in.")),
         );
      }
    }
  }

  @override
  void dispose() {
    _chatService.dispose();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty || currentUserId == null) return;
    
    final text = _controller.text;
    _controller.clear();
    
    try {
      await _chatService.sendMessage(text, widget.doctor.id);
      // We don't manually add to _messages list here if we trust the socket event will come back
      // OR we can add it safely if we know the socket event might be delayed.
      // The backend emits 'new_message' to the sender as well (see console logs). 
      // If we add it here AND listen to socket, we get duplicates unless we deduplicate by ID.
      // But the message ID is created on backend.
      // So best practice: 
      // 1. Optimistic update with temp ID?
      // 2. Or just wait for socket (fast enough for local).
      // Let's rely on socket for now to avoid duplication logic complexity.
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send message: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    
    if (currentUserId == null) {
       return const Scaffold(body: Center(child: Text("Please log in to chat.")));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Chat with ${widget.doctor.name}'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                // Assuming msg has isFromUser property
                final isMe = msg.isFromUser; 
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isMe ? Colors.blue : Colors.grey[300],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      msg.text,
                      style: TextStyle(color: isMe ? Colors.white : Colors.black),
                    ),
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
