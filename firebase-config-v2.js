// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your real Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC4RxS1VpdyP3oMPtiJH2nqlA7Y7OM5t-A",
  authDomain: "tap2chat-13249.firebaseapp.com",
  projectId: "tap2chat-13249",
  storageBucket: "tap2chat-13249.firebasestorage.app",
  messagingSenderId: "109302813848",
  appId: "1:109302813848:web:7cb0386f29598ec27e2ced"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
