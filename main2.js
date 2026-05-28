// main2.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  ref,
  push,
  onChildAdded
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


// ===============================
// LOGIN PAGE LOGIC
// ===============================
const loginBtn = document.getElementById("login-btn");

if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const pass = document.getElementById("login-password").value;

    signInWithEmailAndPassword(auth, email, pass)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(err => alert(err.message));
  });
}


// ===============================
// SIGNUP PAGE LOGIC
// ===============================
const signupBtn = document.getElementById("signup-btn");

if (signupBtn) {
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value;
    const pass = document.getElementById("signup-password").value;

    createUserWithEmailAndPassword(auth, email, pass)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch(err => alert(err.message));
  });
}


// ===============================
// AUTH PROTECTION FOR CHAT PAGE
// ===============================
onAuthStateChanged(auth, user => {
  const onChatPage = window.location.pathname.includes("index.html");

  if (onChatPage && !user) {
    window.location.href = "login.html";
  }
});


// ===============================
// CHAT PAGE LOGIC
// ===============================
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const messagesDiv = document.getElementById("messages");

if (sendBtn) {
  sendBtn.addEventListener("click", sendMessage);
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "") return;

  const user = auth.currentUser;
  if (!user) return;

  const msgRef = ref(db, "messages");

  push(msgRef, {
    text: text,
    uid: user.uid,
    time: Date.now()
  });

  messageInput.value = "";
}


// ===============================
// LOAD MESSAGES IN REALTIME
// ===============================
if (messagesDiv) {
  const msgRef = ref(db, "messages");

  onChildAdded(msgRef, snapshot => {
    const data = snapshot.val();
    const user = auth.currentUser;

    const div = document.createElement("div");
    div.classList.add("message");

    if (user && data.uid === user.uid) {
      div.classList.add("me");
    } else {
      div.classList.add("them");
    }

    div.textContent = data.text;
    messagesDiv.appendChild(div);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}


// ===============================
// GOOGLE MEET CALL BUTTONS
// ===============================
function createMeetLink() {
  const link = "https://meet.google.com/" + Math.random().toString(36).substring(2, 7);
  alert("Your Meet link:\n" + link);
}

// Top bar button
const topCallBtn = document.getElementById("top-call-btn");
if (topCallBtn) {
  topCallBtn.addEventListener("click", createMeetLink);
}

// Floating hexagon button
const hexCallBtn = document.getElementById("hex-call-btn");
if (hexCallBtn) {
  hexCallBtn.addEventListener("click", createMeetLink);
}
