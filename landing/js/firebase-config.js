// landing/js/firebase-config.js
// Shared Firebase initialization for landing page + admin panel
// ⚠️  Fill in your Firebase web app config from the Firebase Console:
//     Project Settings → General → Your apps → Web app → Config

const firebaseConfig = {
  apiKey: "AIzaSyDLiAp2sQllxdjuB16-POjt4_ryhwSX438",
  authDomain: "guess-up-646e0.firebaseapp.com",
  projectId: "guess-up-646e0",
  storageBucket: "guess-up-646e0.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:411267723186:android:fe7e50c4a041739a113eab",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Exports for global use
const db = firebase.firestore();
const auth = firebase.auth();
