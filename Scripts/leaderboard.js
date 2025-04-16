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
  getDocs,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

const leaderboardBody = document.getElementById("leaderboardBody");
const loadingScreen = document.getElementById("loadingScreen");
const mainContent = document.getElementById("mainContent");

window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.style.display = "none";
    mainContent.style.display = "block";
    loadLeaderboard();
  }, 3000);
});

const loadLeaderboard = async () => {
  try {
    let ip = "";

    const response6 = await fetch("https://api64.ipify.org?format=json");
    const data6 = await response6.json();

    if (data6.ip) {
      ip = data6.ip;
    } else {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      ip = data.ip;
    }

    const now = new Date();

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const topQuery = query(
      collection(db, "leaderboard"),
      where("Date", ">=", startTimestamp),
      where("Date", "<", endTimestamp),
      orderBy("Score", "desc")
    );
    const topSnapshot = await getDocs(topQuery);

    const leaderboardData = [];
    let userEntry = null;
    let currentRank = 1;

    topSnapshot.forEach((doc) => {
      const data = doc.data();
      data.id = doc.id;
      data.rank = currentRank++;

      if (data.rank <= 10) leaderboardData.push(data);
      if (data.IP === ip) userEntry = data;
    });

    leaderboardData.forEach((entry) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${entry.rank}</td>
        <td>${entry.User || "Anonymous"}</td>
        <td>${entry.Score}</td>
      `;

      if (entry.Share === true) {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
          window.location.href = `sample.html?id=${entry.id}`;
        });
      }

      leaderboardBody.appendChild(row);
    });

    if (userEntry && userEntry.rank > 10) {
      const spacer = document.createElement("tr");
      spacer.innerHTML = `<td colspan="3" style="text-align:center;">...</td>`;
      leaderboardBody.appendChild(spacer);

      const row = document.createElement("tr");
      row.classList.add("highlight");

      row.innerHTML = `
        <td>${userEntry.rank}</td>
        <td>${userEntry.User || "You"}</td>
        <td>${userEntry.Score}</td>
      `;

      if (userEntry.Share === true) {
        row.style.cursor = "pointer";
        row.addEventListener("click", () => {
          window.location.href = `sample.html?id=${userEntry.id}`;
        });
      }

      leaderboardBody.appendChild(row);
    }
  } catch (error) {
    console.error("Error loading leaderboard:", error);
  }
};
