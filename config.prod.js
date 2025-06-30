// Production Firebase configuration
// This file is safe to commit as it uses environment variables

// For GitHub Pages, you can set these in repository settings
export const firebaseConfig = {
    apiKey: window.ENV?.FIREBASE_API_KEY || "AIzaSyCEqCtIKf6jBd0-bamD3zf8Jze4G_AV7Z4",
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || "dad-v-son-fitness-challenge.firebaseapp.com",
    projectId: window.ENV?.FIREBASE_PROJECT_ID || "dad-v-son-fitness-challenge",
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || "dad-v-son-fitness-challenge.firebasestorage.app",
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || "1007734733222",
    appId: window.ENV?.FIREBASE_APP_ID || "1:1007734733222:web:96698a7aa2303425033767",
    measurementId: window.ENV?.FIREBASE_MEASUREMENT_ID || "G-Z55FT3W2VC"
};