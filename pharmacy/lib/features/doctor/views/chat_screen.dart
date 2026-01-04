import 'package:flutter/material.dart';
import 'dart:async'; // For Timer
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
  Timer? _pollingTimer;

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

          if (mounted) setState(() => _isLoading = false);
        }

        // Listen to messages
        _chatService.messageStream.listen((message) {
          if (mounted) {
            setState(() {
               // Check for optimistic message (null ID) with same text to replace
               final index = _messages.indexWhere((m) => m.id == null && m.text == message.text && m.isFromUser == message.isFromUser);
               
               if (index != -1) {
                 // Replace optimistic with real
                 _messages[index] = message;
               } else if (!_messages.any((m) => m.id == message.id)) {
                 // Add if not exists
                  _messages.add(message);
               }
            });
          }
        });

        // Start Polling (Vercel Fallback)
        _startPolling();

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

  void _startPolling() {
    // Poll every 3 seconds
    _pollingTimer = Timer.periodic(const Duration(seconds: 3), (timer) async {
      if (!mounted || currentUserId == null) {
        timer.cancel();
        return;
      }
      try {
        final newMessages = await _chatService.fetchMessages(widget.doctor.id);
        if (mounted) {
          setState(() {
            for (var message in newMessages) {
               // Deduplicate based on ID
               if (!_messages.any((m) => m.id == message.id)) {
                 // Also check if we have an optimistic version of this message
                 // If so, replace it. 
                 // Optimistic match: same text, same user, null ID
                 final optimisticIndex = _messages.indexWhere((m) => 
                    m.id == null && 
                    m.text == message.text && 
                    m.isFromUser == message.isFromUser
                 );

                 if (optimisticIndex != -1) {
                   _messages[optimisticIndex] = message;
                 } else {
                   _messages.add(message);
                 }
               }
            }
          });
        }
      } catch (e) {
        // Silent error on polling
      }
    });
  }

  @override
  void dispose() {
    _pollingTimer?.cancel();
    _chatService.dispose();
    _controller.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    if (_controller.text.trim().isEmpty || currentUserId == null) return;
    
    final text = _controller.text;
    _controller.clear();

    // OPTIMISTIC UPDATE: Add message immediately to list
    final tempMessage = ChatMessage(
      userId: currentUserId!, 
      doctorId: widget.doctor.id, 
      text: text, 
      isFromUser: true, 
      createdAt: DateTime.now()
    );

    setState(() {
      _messages.add(tempMessage);
    });
    
    try {
      await _chatService.sendMessage(text, widget.doctor.id);
      // Success - duplication logic in listener handles the rest
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to send message: $e')),
      );
      // Optional: Remove message on failure
      setState(() {
        _messages.remove(tempMessage);
      });
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
