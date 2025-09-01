import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your Firebase config (from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyDN2CAcZEQZmtgT3053MyYzYrAWF-7K3Is",
  authDomain: "fungame-9df84.firebaseapp.com",
  projectId: "fungame-9df84",
  storageBucket: "fungame-9df84.firebasestorage.app",
  messagingSenderId: "802503923109",
  appId: "1:802503923109:web:28f7d78507b7473782444c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Database instance
export const database = getDatabase(app);