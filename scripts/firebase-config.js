// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your web app's Firebase configuration
// TODO: Replace with your project's config object from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAfbOtFG45uuXIY9gcocHwcobe3XOHxZww",
  authDomain: "join-4e7df.firebaseapp.com",
  databaseURL:
    "https://join-4e7df-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "join-4e7df",
  storageBucket: "join-4e7df.firebasestorage.app",
  messagingSenderId: "85484207303",
  appId: "1:85484207303:web:8f485a2c16639e487552e2",
  measurementId: "G-S3H4P42ML7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
