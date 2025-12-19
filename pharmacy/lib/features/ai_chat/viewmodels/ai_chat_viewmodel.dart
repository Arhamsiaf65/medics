import 'package:flutter/material.dart';
import '../services/ai_service.dart';

class AIChatViewModel extends ChangeNotifier {
  final AIService _aiService;
  
  AIChatViewModel(this._aiService);

  List<Map<String, String>> messages = []; // {role: 'user'|'model', content: '...'}
  bool isLoading = false;
  String? errorMessage;
  String? sessionId;

  Future<void> sendMessage(String text) async {
    if (text.trim().isEmpty) return;

    final userMessage = {'role': 'user', 'content': text};
    messages.add(userMessage);
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      final response = await _aiService.sendMessage(text, sessionId);
      
      // Update session ID if returned (for the first time)
      if (response['sessionId'] != null) {
        sessionId = response['sessionId'];
      }

      final aiMessage = {
        'role': 'model', 
        'content': (response['response'] as String?) ?? 'No response received.'
      };
      messages.add(aiMessage);
    } catch (e) {
      errorMessage = e.toString().replaceAll('Exception: ', '');
      messages.add({'role': 'system', 'content': 'Error: $errorMessage'});
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  void clearChat() {
    messages.clear();
    sessionId = null;
    notifyListeners();
  }
}
