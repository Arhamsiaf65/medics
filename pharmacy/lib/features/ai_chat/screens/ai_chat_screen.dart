import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:provider/provider.dart';
import '../viewmodels/ai_chat_viewmodel.dart';

class AIChatScreen extends StatefulWidget {
  const AIChatScreen({super.key});

  @override
  State<AIChatScreen> createState() => _AIChatScreenState();
}

class _AIChatScreenState extends State<AIChatScreen> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Health Assistant AI'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<AIChatViewModel>().clearChat();
            },
          )
        ],
      ),
      body: Consumer<AIChatViewModel>(
        builder: (context, viewModel, child) {
          // Scroll to bottom when messages change
          WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: viewModel.messages.length + (viewModel.isLoading ? 1 : 0),
                  itemBuilder: (context, index) {
                    if (index == viewModel.messages.length) {
                      return _buildLoadingIndicator();
                    }

                    final msg = viewModel.messages[index];
                    final isUser = msg['role'] == 'user';
                    final isSystem = msg['role'] == 'system';

                    return Align(
                      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: isSystem 
                              ? Colors.red.shade100 
                              : (isUser ? Theme.of(context).primaryColor : Colors.grey.shade200),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        constraints: BoxConstraints(
                          maxWidth: MediaQuery.of(context).size.width * 0.75,
                        ),
                        child: isUser 
                            ? Text(msg['content']!, style: const TextStyle(color: Colors.white))
                            : MarkdownBody(data: msg['content']!),
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
                        decoration: InputDecoration(
                          hintText: 'Ask about your health...',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(24),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                        ),
                        onSubmitted: (value) {
                           if (value.isNotEmpty) {
                            viewModel.sendMessage(value);
                            _controller.clear();
                          }
                        },
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.send),
                      onPressed: () {
                        if (_controller.text.isNotEmpty) {
                          viewModel.sendMessage(_controller.text);
                          _controller.clear();
                        }
                      },
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return const Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: CircularProgressIndicator(strokeWidth: 2),
      ),
    );
  }
}
