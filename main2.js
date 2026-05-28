window.onload = function () {
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

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  console.log("Tap2Chat: Firebase connected!");

  const auth = firebase.auth();
  const db = firebase.database();
  const storage = firebase.storage();

  const messagesDiv = document.getElementById("messages");
  const messageInput = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");
  const fileInput = document.getElementById("fileInput");
  const channelSelect = document.getElementById("channelSelect");

  const profileToggle = document.getElementById("profileToggle");
  const profilePanel = document.getElementById("profilePanel");
  const closeProfile = document.getElementById("closeProfile");
  const profileName = document.getElementById("profileName");
  const accentColor = document.getElementById("accentColor");
  const saveProfile = document.getElementById("saveProfile");

  const currentUserLabel = document.getElementById("currentUserLabel");
  const roleLabel = document.getElementById("roleLabel");
  const channelLabel = document.getElementById("channelLabel");

  const superPanel = document.getElementById("superPanel");
  const superMessages = document.getElementById("superMessages");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentUser = null;
  let currentRole = "user";
  let currentAccent = "#87CEEB";
  let currentUid = null;

  auth.onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    currentUid = user.uid;
    const email = user.email || "";
    const usernameFromEmail = email.split("@")[0];

    const userRef = db.ref("users/" + currentUid);
    const snap = await userRef.get();

    if (snap.exists()) {
      const data = snap.val();
      currentUser = data.username || usernameFromEmail;
      currentRole = data.role || "user";
      currentAccent = data.accent || "#87CEEB";
    } else {
      currentUser = usernameFromEmail;
      currentRole = usernameFromEmail === "superintendent" ? "superintendent" : "user";
      currentAccent = "#87CEEB";
      await userRef.set({
        username: currentUser,
        role: currentRole,
        accent: currentAccent
      });
    }

    currentUserLabel.textContent = currentUser;
    roleLabel.textContent = currentRole === "superintendent" ? "Superintendent" : "User";
    document.documentElement.style.setProperty("--accent", currentAccent);

    if (currentRole === "superintendent") {
      superPanel.classList.remove("hidden");
    }

    initChat();
  });

  function initChat() {
    profileName.value = currentUser;
    accentColor.value = currentAccent;

    profileToggle.onclick = () => profilePanel.classList.remove("hidden");
    closeProfile.onclick = () => profilePanel.classList.add("hidden");

    saveProfile.onclick = async () => {
      const newName = profileName.value.trim();
      const newAccent = accentColor.value || "#87CEEB";

      if (newName) {
        currentUser = newName;
        currentUserLabel.textContent = currentUser;
      }
      currentAccent = newAccent;
      document.documentElement.style.setProperty("--accent", currentAccent);

      if (currentUid) {
        await db.ref("users/" + currentUid).update({
          username: currentUser,
          accent: currentAccent
        });
      }

      profilePanel.classList.add("hidden");
    };

    logoutBtn.onclick = () => {
      auth.signOut();
    };

    channelSelect.onchange = () => {
      if (channelSelect.value === "agent") {
        channelLabel.textContent = "Tap2Chat Agent (broadcast to everyone)";
      } else {
        channelLabel.textContent = "Everyone";
      }
    };

    sendBtn.onclick = sendMessage;
    messageInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    const messagesRef = db.ref("messages");

    messagesRef.on("child_added", (snapshot) => {
      const msg = snapshot.val();
      const key = snapshot.key;
      renderMessage(msg, key);
      if (currentRole === "superintendent") {
        renderSuperMessage(msg, key);
      }
    });

    messagesRef.on("child_removed", (snapshot) => {
      const key = snapshot.key;
      const bubble = document.querySelector(`[data-key="${key}"]`);
      if (bubble) bubble.remove();
      const superItem = document.querySelector(`[data-super-key="${key}"]`);
      if (superItem) superItem.remove();
    });
  }

  function sendMessage() {
    const text = messageInput.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) return;

    const channel = channelSelect.value === "agent" ? "agent" : "normal";

    const baseMessage = {
      text: text || "",
      sender: currentUser,
      senderUid: currentUid,
      timestamp: Date.now(),
      channel: channel,
      accent: currentAccent
    };

    const messagesRef = db.ref("messages");

    if (file) {
      const fileRef = storage.ref("attachments/" + Date.now() + "_" + file.name);
      fileRef.put(file).then(() => fileRef.getDownloadURL())
        .then((url) => {
          baseMessage.attachmentUrl = url;
          messagesRef.push(baseMessage);
        })
        .catch((err) => {
          console.error("Upload error:", err);
          messagesRef.push(baseMessage);
        });
    } else {
      messagesRef.push(baseMessage);
    }

    messageInput.value = "";
    fileInput.value = "";
  }

  function renderMessage(msg, key) {
    const isMe = msg.senderUid === currentUid;

    const row = document.createElement("div");
    row.className = "message-row " + (isMe ? "me" : "other");

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.dataset.key = key;

    if (msg.accent && isMe) {
      bubble.style.background = msg.accent;
    }

    const textEl = document.createElement("div");
    textEl.textContent = msg.text || "";

    const meta = document.createElement("div");
    meta.className = "message-meta";

    const date = new Date(msg.timestamp || Date.now());
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    let channelTag = "";
    if (msg.channel === "agent") {
      channelTag = " • Tap2Chat Agent";
    }

    meta.textContent = `${msg.sender} • ${timeStr}${channelTag}`;

    bubble.appendChild(textEl);

    if (msg.attachmentUrl) {
      const att = document.createElement("div");
      att.className = "message-attachment";
      const link = document.createElement("a");
      link.href = msg.attachmentUrl;
      link.target = "_blank";
      link.textContent = "Attachment";
      att.appendChild(link);
      bubble.appendChild(att);
    }

    bubble.appendChild(meta);

    if (isMe || currentRole === "superintendent") {
      const del = document.createElement("button");
      del.className = "delete-btn";
      del.textContent = "×";
      del.onclick = () => {
        db.ref("messages").child(key).remove();
      };
      bubble.appendChild(del);
    }

    row.appendChild(bubble);
    messagesDiv.appendChild(row);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function renderSuperMessage(msg, key) {
    const item = document.createElement("div");
    item.className = "super-msg-item";
    item.dataset.superKey = key;

    const date = new Date(msg.timestamp || Date.now());
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    item.innerHTML = `
      <div><strong>${msg.sender}</strong> (${msg.channel === "agent" ? "Agent" : "Normal"})</div>
      <div>${msg.text || ""}</div>
      <div style="font-size:11px;color:#6b7280;">${timeStr}</div>
    `;

    superMessages.appendChild(item);
    superMessages.scrollTop = superMessages.scrollHeight;
  }
};
