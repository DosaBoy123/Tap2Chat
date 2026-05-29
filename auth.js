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
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore, doc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const auth = getAuth();
const db = getFirestore();

// =========================
// Signup
// =========================
async function signup() {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;
  const username = document.getElementById("signupUsername").value;
  const file = document.getElementById("signupPfp").files[0];

  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = userCred.user.uid;

  let photoURL = "";

  if (file) {
    photoURL = await uploadToCloudinary(file);
  }

  await updateProfile(userCred.user, {
    displayName: username,
    photoURL
  });

  await setDoc(doc(db, "users", uid), {
    username,
    email,
    photoURL,
    uid
  });

  window.location.href = "chat.html";
}

// =========================
// Login
// =========================
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  await signInWithEmailAndPassword(auth, email, password);
  window.location.href = "chat.html";
}
