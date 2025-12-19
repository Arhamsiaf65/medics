const { db } = require('../config/firebase');

/**
 * Sends a notification to a specific user by adding it to Firestore.
 * @param {string} userId - The ID of the recipient user.
 * @param {string} title - The title of the notification.
 * @param {string} message - The body/message of the notification.
 * @param {string} type - Type of notification (e.g., 'booking', 'article', 'general').
 * @param {object} [metadata] - Optional additional data.
 * @returns {Promise<string>} - The ID of the created notification document.
 */
const sendNotification = async (userId, title, message, type = 'general', metadata = {}) => {
    if (!userId) {
        throw new Error('UserId is required to send notification');
    }

    try {
        const notificationData = {
            userId: userId, // Ensure we can query by userId
            title,
            message,
            type,
            metadata,
            isRead: false,
            createdAt: new Date().toISOString(), // Use ISO string for consistency
            // Firestore ServerTimestamp could also be used: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('notifications').add(notificationData);
        console.log(`Notification sent to user ${userId}, Doc ID: ${docRef.id}`);
        return docRef.id;
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
};

module.exports = {
    sendNotification
};
