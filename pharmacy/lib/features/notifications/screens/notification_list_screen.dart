import 'package:flutter/material.dart';
import 'package:provider/provider.dart'; // Assuming provider is used, or just direct service usage
import '../services/notification_service.dart';
import '../models/notification_model.dart';
// You might need to adjust how you get the current userId. 
// For now I'll assume it's passed or available globally/via provider.
// If not, I'll put a placeholder.

class NotificationListScreen extends StatelessWidget {
  final String userId;

  const NotificationListScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final notificationService = NotificationService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: StreamBuilder<List<NotificationModel>>(
        stream: notificationService.getUserNotifications(userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
             // It's common to get permission errors if rules aren't set up or user not logged in
            return Center(child: Text('Error: ${snapshot.error}'));
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return const Center(child: Text('No notifications yet.'));
          }

          final notifications = snapshot.data!;

          return ListView.builder(
            itemCount: notifications.length,
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return ListTile(
                leading: Icon(
                  notification.isRead ? Icons.notifications_none : Icons.notifications_active,
                  color: notification.isRead ? Colors.grey : Colors.blue,
                ),
                title: Text(
                  notification.title,
                  style: TextStyle(
                    fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
                  ),
                ),
                subtitle: Text(notification.message),
                trailing: Text(
                  _formatDate(notification.createdAt),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                ),
                onTap: () {
                  if (!notification.isRead) {
                    notificationService.markAsRead(notification.id);
                  }
                  // Handle navigation or other actions based on notification.type if needed
                },
              );
            },
          );
        },
      ),
    );
  }

  String _formatDate(DateTime date) {
    // Simple formatter, you might want to use intl package
    return "${date.day}/${date.month} ${date.hour}:${date.minute}"; 
  }
}
