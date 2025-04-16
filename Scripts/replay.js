import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  query,
  where,
  orderBy,
  getDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
  }, 3000);
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const firebaseConfig = {
  apiKey: "AIzaSyBKJT-A3KHH_hoJV-6-84mO3vJ3Rh4wzW4",
  authDomain: "iste-d7d9f.firebaseapp.com",
  projectId: "iste-d7d9f",
  storageBucket: "iste-d7d9f.firebasestorage.app",
  messagingSenderId: "1053664417480",
  appId: "1:1053664417480:web:fc3e94d1f086d6844b37fd",
  measurementId: "G-VFPY8G17P3",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const fetchUserData = async (userId) => {
  const userDoc = await getDoc(doc(db, "leaderboard", userId));
  if (userDoc.exists()) {
    const data = userDoc.data();
    document.getElementById("userInfo").textContent = `${data.User} Response`;
    if (data.ReplyCount >= 1) {
      let messages = document.getElementById("messages");
      let botMessage = document.createElement("div");
      botMessage.classList.add("bot");
      botMessage.textContent = data.BMessage1;
      messages.appendChild(botMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = data.UMessage1;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      if (data.ReplyCount == 1) {
        let messages = document.getElementById("messages");
        let botMessage = document.createElement("div");
        botMessage.classList.add("bot");
        botMessage.textContent = data.BMessage2;
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
        await delay(2000);
      }
    }
    if (data.ReplyCount >= 2) {
      let messages = document.getElementById("messages");
      let botMessage = document.createElement("div");
      botMessage.classList.add("bot");
      botMessage.textContent = data.BMessage2;
      messages.appendChild(botMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = data.UMessage2;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);
      if (data.ReplyCount == 2) {
        let messages = document.getElementById("messages");
        let botMessage = document.createElement("div");
        botMessage.classList.add("bot");
        botMessage.textContent = data.BMessage3;
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
        await delay(2000);
      }
    }
    if (data.ReplyCount >= 3) {
      let messages = document.getElementById("messages");
      let botMessage = document.createElement("div");
      botMessage.classList.add("bot");
      botMessage.textContent = data.BMessage3;
      messages.appendChild(botMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = data.UMessage3;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);
      if (data.ReplyCount == 3) {
        let messages = document.getElementById("messages");
        let botMessage = document.createElement("div");
        botMessage.classList.add("bot");
        botMessage.textContent = data.BMessage4;
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
        await delay(2000);
      }
    }
    if (data.ReplyCount >= 4) {
      let messages = document.getElementById("messages");
      let botMessage = document.createElement("div");
      botMessage.classList.add("bot");
      botMessage.textContent = data.BMessage4;
      messages.appendChild(botMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = data.UMessage4;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);
      if (data.ReplyCount == 4) {
        let messages = document.getElementById("messages");
        let botMessage = document.createElement("div");
        botMessage.classList.add("bot");
        botMessage.textContent = data.BMessage5;
        messages.appendChild(botMessage);
        messages.scrollTop = messages.scrollHeight;
        await delay(2000);
      }
    }
    if (data.ReplyCount >= 5) {
      let messages = document.getElementById("messages");
      let botMessage = document.createElement("div");
      botMessage.classList.add("bot");
      botMessage.textContent = data.BMessage5;
      messages.appendChild(botMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let userMessage = document.createElement("div");
      userMessage.classList.add("message", "user");
      userMessage.textContent = data.UMessage5;
      messages.appendChild(userMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);

      let RbotMessage = document.createElement("div");
      RbotMessage.classList.add("bot");
      RbotMessage.textContent = data.BResult;
      messages.appendChild(RbotMessage);
      messages.scrollTop = messages.scrollHeight;
      await delay(2000);
    }
    setTimeout(() => {
      messages.scrollTop = messages.scrollHeight;
    }, 50);
  } else {
    console.log("No such user!");
  }
};

if (userId) {
  fetchUserData(userId);
}
