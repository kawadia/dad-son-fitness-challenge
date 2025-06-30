// Firebase configuration template
// Copy this file to config.js and replace with your actual Firebase credentials
// Get these values from: https://console.firebase.google.com/ > Project Settings > General > Your apps

export const firebaseConfig = {
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.firebasestorage.app",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id" // Optional for Analytics
};

// Setup Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General tab
// 4. Scroll down to "Your apps" section
// 5. Click "Web" icon (</>) to add a web app
// 6. Register your app with a nickname
// 7. Copy the firebaseConfig object values
// 8. Create Firestore Database in "Test mode"
// 9. Replace the values above with your actual credentials
// 10. Save this file as "config.js" (without .example)