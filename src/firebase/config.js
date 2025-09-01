// src/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDN2CAcZEQZmtgT3053MyYzYrAWF-7K3Is",
  authDomain: "fungame-9df84.firebaseapp.com",
  databaseURL: 'https://fungame-9df84-default-rtdb.firebaseio.com', // ADD THIS LINE
  projectId: "fungame-9df84",
  storageBucket: "fungame-9df84.firebasestorage.app",
  messagingSenderId: "802503923109",
  appId: "1:802503923109:web:28f7d78507b7473782444c"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);