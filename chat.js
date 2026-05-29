// =========================
// Cloudinary Config
// =========================
const CLOUD_NAME = "debgn5yle";
const UPLOAD_PRESET = "tap2chat";

async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(url, {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.secure_url;
}

// =========================
// Firebase Setup
// =========================
import {
  getFirestore, collection, addDoc, doc, getDoc,
  onSnapshot, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

let currentUser = null;
let currentRoomId = null;

// =========================
// Auth Listener
// =========================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    console.log("Logged in:", user.uid);
  } else {
    window.location.href = "login.html";
  }
});

// =========================
// Load Messages
// =========================
function loadMessages(roomId) {
  currentRoomId = roomId;

  const messagesRef = collection(db, "rooms", roomId, "messages");
  const q = query(messagesRef, orderBy("createdAt"));

  onSnapshot(q, (snapshot) => {
    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = "";

    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement("div");

      if (msg.type === "image") {
        div.innerHTML = `
          <div class="message">
            <img src="${msg.mediaURL}" class="chat-image">
            <p>${msg.senderName}</p>
          </div>
        `;
      } else if (msg.type === "file") {
        div.innerHTML = `
          <div class="message">
            <a href="${msg.mediaURL}" target="_blank">${msg.fileName}</a>
            <p>${msg.senderName}</p>
          </div>
        `;
      } else {
        div.innerHTML = `
          <div class="message">
            <p>${msg.text}</p>
            <span>${msg.senderName}</span>
          </div>
        `;
      }

      chatBox.appendChild(div);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

// =========================
// Send Text Message
// =========================
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentRoomId || !currentUser) return;

  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const u = userSnap.data();

  await addDoc(collection(db, "rooms", currentRoomId, "messages"), {
    text,
    type: "text",
    mediaURL: "",
    senderId: currentUser.uid,
    senderName: u.username,
    senderPhoto: u.photoURL,
    createdAt: serverTimestamp(),
    edited: false,
    deleted: false,
    readBy: [currentUser.uid]
  });

  input.value = "";
}

// =========================
// Send File / Image Message
// =========================
async function sendFileMessage(file) {
  if (!currentRoomId || !currentUser) return;

  const userSnap = await getDoc(doc(db, "users", currentUser.uid));
  const u = userSnap.data();

  // Upload to Cloudinary
  const url = await uploadToCloudinary(file);

  const type = file.type.startsWith("image/") ? "image" : "file";

  await addDoc(collection(db, "rooms", currentRoomId, "messages"), {
    text: "",
    type,
    mediaURL: url,
    fileName: file.name,
    senderId: currentUser.uid,
    senderName: u.username,
    senderPhoto: u.photoURL,
    createdAt: serverTimestamp(),
    edited: false,
    deleted: false,
    readBy: [currentUser.uid]
  });
}

// =========================
// File Input Listener
// =========================
document.getElementById("fileInput").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) sendFileMessage(file);
});
