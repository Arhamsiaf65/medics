const { sendNotification } = require('../src/services/notificationService');

const run = async () => {
    // Replace with a valid user ID from your database or use a test ID
    const sampleUserId = 'test_user_123';

    console.log(`Sending test notification to ${sampleUserId}...`);

    try {
        const notificationId = await sendNotification(
            sampleUserId,
            'Test Notification',
            'This is a test notification from the backend script.',
            'system_test'
        );
        console.log('Successfully sent notification. ID:', notificationId);
        process.exit(0);
    } catch (error) {
        console.error('Failed to send notification:', error);
        process.exit(1);
    }
};

run();
