const admin = require("firebase-admin");
const path = require("path");

// Load the service account key
// The file is expected to be in the root of the backend directory (medics_backend/serviceAccountKey.json)
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccountKey.json');

try {
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: "https://healt-4312.firebaseio.com" // Optional for Firestore, required for Realtime DB
    });

    console.log("Firebase Admin Initialized successfully.");
} catch (error) {
    console.error("Error initializing Firebase Admin:", error.message);
    console.error("Please ensure 'serviceAccountKey.json' is present in the medics_backend root directory.");
}

const db = admin.firestore();

module.exports = { admin, db };
