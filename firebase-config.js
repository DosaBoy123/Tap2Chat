// firebase-config.js

// Import Firebase (Modular v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC4RxS1VpdyP3oMPtiJH2nqlA7Y7OM5t-A",
  authDomain: "tap2chat-13249.firebaseapp.com",
  databaseURL: "https://tap2chat-13249-default-rtdb.firebaseio.com",
  projectId: "tap2chat-13249",
  storageBucket: "tap2chat-13249.firebasestorage.app",
  messagingSenderId: "109302813848",
  appId: "1:109302813848:web:7cb0386f29598ec27e2ced",
  measurementId: "G-YDVJ2P3LNN"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
