import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../data/models/chat_message.dart'; 
import '../../../../services/services/api_service.dart';

class ChatService {
  late IO.Socket socket;
  final String _baseUrl = 'https://medics-two.vercel.app'; // Production URL

  final _messageController = StreamController<ChatMessage>.broadcast();
  Stream<ChatMessage> get messageStream => _messageController.stream;

  void connect(String userId) {
    socket = IO.io(_baseUrl, IO.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .build()
    );

    socket.connect();

    socket.onConnect((_) {

      socket.emit('join', userId);
    });

    socket.on('new_message', (data) {

      if (data != null) {
        _messageController.add(ChatMessage.fromJson(data));
      }
    });


  }



  Future<void> sendMessage(String text, String doctorId) async {
    try {
      final response = await ApiService.post('chat/$doctorId', {
        'text': text,
      });
      // Optionally handle response, but we rely on socket for incoming "new_message"
      // or we can manually add it to stream if we want strictly optimistic + confirmation
      // The screen already does optimistic update. 
    } catch (e) {

      throw e;
    }
  }

  Future<List<ChatMessage>> fetchMessages(String doctorId) async {
    try {
      final response = await ApiService.get('chat/$doctorId');
      if (response['success'] == true) {
        final List<dynamic> data = response['data'];
        return data.map((json) => ChatMessage.fromJson(json)).toList();
      } else {
        throw Exception(response['message'] ?? 'Failed to fetch messages');
      }
    } catch (e) {

      throw e;
    }
  }

  void disconnect() {
    socket.disconnect();
  }
  
  void dispose() {
    _messageController.close();
    socket.dispose();
  }
}
