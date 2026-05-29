// auth.js — Login logic for Tap2Chat (Firebase v8 compat)

const firebaseConfig = {
  apiKey: "AIzaSyC4RxS1VpdyP3oMPtiJH2nqlA7Y7OM5t-A",
  authDomain: "tap2chat-13249.firebaseapp.com",
  databaseURL: "https://tap2chat-13249-default-rtdb.firebaseio.com",
  projectId: "tap2chat-13249",
  storageBucket: "tap2chat-13249.firebasestorage.app",
  messagingSenderId: "109302813848",
  appId: "1:109302813848:web:7cb0386f29598ec27e2ced"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

const loginBtn = document.getElementById("loginBtn");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

// If already logged in, go straight to chat
auth.onAuthStateChanged((user) => {
  if (user) {
    window.location.href = "index.html";
  }
});

loginBtn.onclick = async () => {
  if (loginError) loginError.textContent = "";

  const usernameOrEmail = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  if (!usernameOrEmail || !password) {
    if (loginError) loginError.textContent = "Please enter your username and password.";
    return;
  }

  // Support both username-only and full email login
  const email = usernameOrEmail.includes("@")
    ? usernameOrEmail
    : usernameOrEmail + "@tap2chat.com";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "index.html";
  } catch (e) {
    if (loginError) loginError.textContent = "Invalid username or password.";
    console.error("Login error:", e);
  }
};

// Allow pressing Enter to log in
loginPassword.addEventListener("keydown", (e) => {
  if (e.key === "Enter") loginBtn.click();
});
