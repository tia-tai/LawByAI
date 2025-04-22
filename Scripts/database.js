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
import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

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

const createSampleData = (ip) => {
  return {
    BMessage1: "Hello world!",
    BMessage2: "Hello world!",
    BMessage3: "Hello world!",
    BMessage4: "Hello world!",
    BMessage5: "Hello world!",
    BResult: "Hello world!",
    UMessage1: "Hello world!",
    UMessage2: "Hello world!",
    UMessage3: "Hello world!",
    UMessage4: "Hello world!",
    UMessage5: "Hello world!",
    Ranking: 0,
    Score: 0,
    Share: false,
    ReplyCount: 0,
    Date: serverTimestamp(),
    User: "Anonymous",
    IP: ip,
  };
};



const addDataToFirestore = async () => {
  try {
    // Fetch the IP address
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

    const docData = createSampleData(ip);

    // Add the document to Firestore
    const docRef = await addDoc(collection(db, "leaderboard"), docData);

    return docRef.id;
  } catch (error) {
    console.error("Error adding data to Firestore:", error);
    return null;
  }
};

const updateFirestoreData = async (documentId, updatedFields) => {
  console.log(documentId);

  try {
    const docRef = doc(db, "leaderboard", documentId);

    await updateDoc(docRef, updatedFields);

    console.log("Document successfully updated!");
    return true;
  } catch (error) {
    console.error("Error updating document: ", error);
    return false;
  }
};

// And update the query syntax:
async function rankTodaysDocumentsByScore() {
  try {
    // Step 1: Create a query with the modular syntax
    const leaderboardRef = collection(db, "leaderboard");

    const now = new Date();

    // Get start of today
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get start of tomorrow
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const startTimestamp = Timestamp.fromDate(start);
    const endTimestamp = Timestamp.fromDate(end);

    const q = query(
      leaderboardRef,
      where("Date", ">=", startTimestamp),
      where("Date", "<", endTimestamp),
      orderBy("Score", "desc")
    );

    // Execute the query
    const snapshot = await getDocs(q);

    // Step 2: Create an array of documents with their IDs and scores
    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    console.log(
      `Found ${documents.length} documents with today's date for ranking.`
    );

    if (documents.length === 0) {
      return {
        success: true,
        message: "No documents found with today's date. Nothing to rank.",
      };
    }

    // Step 3: Batch updates for better performance
    const batchSize = 500; // Firestore allows up to 500 operations per batch
    let batchCount = 0;
    let batch = writeBatch(db);

    // Step 4: Update each document with its rank
    documents.forEach((document, index) => {
      const rank = index + 1; // Ranking starts from 1
      const docRef = doc(db, "leaderboard", document.id);

      batch.update(docRef, { Ranking: rank });

      // If we've reached the batch size limit, commit and create a new batch
      if ((index + 1) % batchSize === 0) {
        console.log(`Committing batch ${batchCount + 1}...`);
        batch.commit();
        batch = writeBatch(db);
        batchCount++;
      }
    });

    // Commit any remaining operations
    if (documents.length % batchSize !== 0) {
      console.log(`Committing final batch...`);
      await batch.commit();
    }

    console.log(
      `Ranking complete. Updated ${documents.length} documents with today's date.`
    );

    return {
      success: true,
      message: `Ranked ${documents.length} documents with today's date.`,
    };
  } catch (error) {
    console.error("Error ranking documents:", error);
    return { success: false, message: error.message };
  }
}

// Function to run the ranking process on demand
function updateTodaysRankings() {
  rankTodaysDocumentsByScore()
    .then((result) => {
      console.log(result.message);
    })
    .catch((error) => {
      console.error("Failed to update rankings:", error);
    });
}

function extractScoreValues(text) {
  // Look for any number that appears immediately before "/30"
  const scoreRegex = /(\d+)\/30/;
  const match = text.match(scoreRegex);

  if (match && match[1]) {
    return parseInt(match[1]); // Return the number before /30
  } else {
    return 0; // Return 0 if no match found
  }
}

const weeklyPrompts = [
  {
    prompt: `You’re a freelance graphic designer in Texas, and business has been good lately. One day, a startup client asks if you can design promotional graphics for their new product. They send over a few images they want incorporated into the work—some of which feature a celebrity wearing the product. You complete the project, they pay you, and the client publishes the designs across their social media.

Two weeks later, you receive a cease-and-desist letter from the celebrity’s legal team. They’re claiming unauthorized use of their likeness for commercial purposes and are threatening to sue for misappropriation of identity. You contact the client, but they’ve gone silent. You're now worried you could be held legally responsible.

What do you do next?`,
    date: "2025-04-15",
  },
  {
    prompt: `You're driving through Arizona on a road trip with a friend. It’s late, you're both tired, and you spot an empty rest area. Your friend suggests pulling over to sleep in the car for a few hours. You agree and park in a well-lit corner of the lot. Around 2 AM, a police officer knocks on your window. He says sleeping in your car is “suspicious,” asks for your ID, and starts questioning you about where you’re going and whether there are any drugs or weapons in the car.

Then he asks if he can search the vehicle. You’re confident you haven’t done anything wrong and want to get this over with quickly.

What do you do?`,
    date: "2025-04-16",
  },
  {
    prompt: `You run a popular YouTube channel based in California that does gadget reviews. One day, you get a leaked prototype of a smartphone from an anonymous viewer who mails it to your P.O. box. You unbox and review the device in a video, which quickly goes viral.

A few days later, you receive a legal notice from the tech company demanding you take down the video and return the prototype. They claim the phone was stolen property and that your possession and publication of it constitutes unlawful handling of stolen goods and misappropriation of trade secrets.

You didn’t know it was stolen, and the anonymous sender gave no info. But you’re now being warned of potential civil and criminal liability.

What do you do?`,
    date: "2025-04-17",
  },
  {
    prompt: `You work remotely as a software developer in Florida. You recently discovered that your employer has been misclassifying you and others as independent contractors, even though they control your hours, require daily check-ins, and provide all your equipment. Because of this, you’ve been denied overtime, benefits, and employer-paid taxes.

You bring it up to HR, but they dismiss your concerns, saying the classification is standard company policy. Later that week, your access to company systems is revoked, and you receive a termination email with no explanation.

You suspect this was retaliation for speaking up.

What do you do?`,
    date: "2025-04-18",
  },
  {
    prompt: `You're a college student in Illinois who just started selling custom T-shirts on Etsy. A few designs parody well-known logos from major brands, tweaking them humorously. One day, you receive a cease-and-desist letter from a major corporation, accusing you of trademark infringement and threatening legal action if you don't remove the products and compensate for damages.

You thought parody was protected under fair use, so you’re surprised. The Etsy listing is already taken down, and your account is under review.

What do you do?`,
    date: "2025-04-19",
  },
  {
    prompt: `You’re a tenant in New York City, renting a small apartment under a 12-month lease. One month, your landlord shows up unannounced, lets himself in with a spare key while you’re home, and says he’s just “checking the plumbing.” He doesn’t give notice or ask permission, and this happens twice more over the next few weeks.

You tell him it’s not okay, but he insists he has the right to inspect the property whenever he wants. He then threatens to raise your rent or terminate your lease early if you “make a fuss.”

You're feeling uncomfortable and unsafe.

What do you do?`,
    date: "2025-04-20",
  },
  {
    prompt: `You’re an aspiring photographer in Oregon who loves using drones to capture scenic footage. One weekend, you fly your drone over a coastal wedding at a public beach. You stay at a reasonable distance but record sweeping shots of the area, including parts of the ceremony. You later post a short video montage to your YouTube channel.

A week later, you receive a letter from an attorney representing the couple, stating you violated their privacy and are being threatened with a lawsuit. They demand you take the video down and pay damages for emotional distress and unauthorized use of their likeness.

What do you do?`,
    date: "2025-04-21",
  },
  {
    prompt: `You're a freelance journalist based in Washington state. You recently wrote an investigative piece on a local government official’s alleged misconduct, relying heavily on anonymous sources. The article goes viral, and soon you receive a subpoena demanding you reveal your sources in a defamation lawsuit filed by the official.

You're worried about legal consequences if you don’t comply, but revealing the sources could destroy your credibility—and their lives.

What do you do?`,
    date: "2025-04-22",
  },
  {
    prompt: `You’re an Uber driver in Nevada. One evening, a passenger leaves a backpack in your car. You try contacting them via the app, but get no response. Later, you open the bag to look for ID and find what appears to be a large amount of cash and a suspicious white powder.

Before you can decide what to do, someone starts messaging you from a blocked number asking for the bag back—no questions asked.

What do you do?`,
    date: "2025-04-23",
  },
  {
    prompt: `You're a schoolteacher in Georgia, and one of your students confides in you about witnessing something potentially criminal at home. You’re concerned for their safety, but they beg you not to tell anyone, fearing things will get worse.

You’re unsure whether this qualifies as mandated reporting under state law, and your principal advises you to “wait and see.”

What do you do?`,
    date: "2025-04-24",
  },
  {
    prompt: `You’re a dog walker in Colorado and recently posted videos of your clients’ dogs doing tricks on your TikTok. One of your videos goes viral, gaining sponsorship offers. But a client contacts you angrily, saying you never got their consent to post footage of their dog and that you’re using their pet for personal gain.

They’re threatening to sue unless you take it down and split the revenue.

What do you do?`,
    date: "2025-04-25",
  },
  {
    prompt: `You’re a barista in a busy Los Angeles café. One day, a regular customer leaves behind a flash drive. You plug it into the café’s computer to check for contact info and accidentally discover confidential corporate documents that seem to implicate a major company in environmental violations.

You’re torn between returning the drive quietly or going public.

What do you do?`,
    date: "2025-04-26",
  },
  {
    prompt: `You run a fitness coaching business in Pennsylvania, offering virtual classes. A client claims they were injured while following your workout and is demanding compensation. You had them sign a digital waiver, but they argue it’s unenforceable because it wasn’t notarized or clearly worded.

They’re threatening legal action unless you settle.

What do you do?`,
    date: "2025-04-27",
  },
  {
    prompt: `You work part-time at a retail store in Michigan. One day, your manager asks you to clock in a co-worker who’s running late, saying “it’s no big deal.” You do it, but later, the HR department finds out and you’re the one under investigation for timesheet fraud.

You explain the situation, but they say policy is policy.

What do you do?`,
    date: "2025-04-28",
  },
  {
    prompt: `You’re a makeup artist in North Carolina with a popular Instagram following. A beauty brand sends you free products and asks you to post positive reviews, but never mentions a contract or payment. You post a glowing review—and weeks later find out the product is being recalled due to a harmful ingredient.

Now followers are blaming you, and the brand has ghosted you.

What do you do?`,
    date: "2025-04-29",
  },
  {
    prompt: `You’re a grad student in Massachusetts researching AI ethics. You find an internal document from a major tech company online that wasn’t meant for public release. It contains data that could be groundbreaking for your thesis—and damaging to the company.

Publishing it could spark important debate, but you’re unsure about the legal risks of using or citing it.

What do you do?`,
    date: "2025-04-30",
  },
];

function getTodaysPrompt() {
  const today = new Date();
  const options = { timeZone: "America/New_York" };
  const estDate = new Intl.DateTimeFormat("en-US", options).format(today);

  const [month, day, year] = estDate.split("/");
  const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
    2,
    "0"
  )}`;

  const todayPrompt = weeklyPrompts.find((p) => p.date === formattedDate);

  if (todayPrompt) {
    return todayPrompt.prompt;
  } else {
    return "No prompt found for today.";
  }
}

let isFirstUserMessage = true;
let conversationHistory = "";
let docID;
let msgCount = 0;

window.sendMessage = async function () {
  let input = document.getElementById("userInput");
  let messageText = input.value.trim();
  if (messageText === "") return;

  let messages = document.getElementById("messages");
  let userMessage = document.createElement("div");
  userMessage.classList.add("message", "user");
  userMessage.textContent = messageText;
  messages.appendChild(userMessage);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;

  if (isFirstUserMessage) {
    docID = await addDataToFirestore();
    messageText =
      messageText +
      `Generate a 250 word scenario that involves some kind of legal problem and ask me what I would do to face it. If my answer isn't right, give me a brief correction and cite what US federal law/act (or if specified, state law) that supports the correction, then generate the consequences scenario of my answer. Repeat this until I reach a good ending. Then, generate a score out of 30:

      SCORING CATEGORIES:
      Exceeding Expectations: 8/10 or higher
      Meeting Expectations: 6-7/10
      Approaching Expectations: 4/5-10
      Does Not Meet Expectations: 0-3/10


      Knowledge (10 pts): Exceeding Expectations: User demonstrates clear understanding of local, state, or federal law. They have prior knowledge or have done research on specific laws. A full 10/10 if they refer to an existing law correctly.
      Meeting Expectations: User has adequate knowledge of US law and does a good job handling/de-escalating the situation. They do not need to be a lawyer or master specific laws, but must generally understand what is legal and what is illegal.
      Approaching Expectations: If user fails to use legal jargon entirely, the max score they can receive is a 5/10. If a user uses harassing language towards scenario, such as unnecessarily insulting the characters, deduct points.
      Does Not Meet Expectations: If user fails to de-escalate the situation or fails to attempt to. If user is hostile towards AI or the generated characters for five responses, end the game. The user will then be disqualified.

      Application (10 pts): Exceeding Expectations: User does not make any mistakes, or only makes one or two and learns quickly. They do not make the same mistakes.
      Meeting Expectations: User learns quickly from their mistakes when given corrections. They do not repeat the same mistakes and is able to prove their understanding.
      Approaching Expectations: If user inputs a similar response or same action despite given feedback, deduct 2 points for each instance.
      Does Not Meet Expectations: User makes the same mistakes repeatedly.

      Process (10 pts): User is able to reach a good ending in as few responses as possible. 1 response, 10 points. 2 responses, 9 points, 3 responses, 8 points, and so forth. The cut off is 5 replies. If a user fails to reach a good ending within 5 replies, they have failed and will receive a 3/10. End the game here and give them their score.

      Be educational and the main goal is helping the user learn their rights
      Keep responses to 100 words`;
    isFirstUserMessage = false;
  }

  conversationHistory += "User: " + messageText + "\n";

  let botMessage = document.createElement("div");
  botMessage.classList.add("bot");
  botMessage.textContent = "Thinking...";
  messages.appendChild(botMessage);
  messages.scrollTop = messages.scrollHeight;

  try {
    let response;
    if (msgCount == 0) {
      response = getTodaysPrompt();
    } else {
      const genAI = new GoogleGenerativeAI(
        "AIzaSyAm6dOUWqVzfDnnWPWgBwtERjkLT44ekYQ"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(conversationHistory);
      response = await result.response.text();
    }

    botMessage.textContent = response;

    conversationHistory += "AI: " + response + "\n";

    const scoreData = extractScoreValues(response);

    if (msgCount == 0) {
      updateFirestoreData(docID, {
        BMessage1: response,
        Score: scoreData,
      });
    } else if (msgCount == 1) {
      updateFirestoreData(docID, {
        BMessage2: response,
        UMessage1: messageText,
        ReplyCount: msgCount,
        Score: scoreData,
      });
    } else if (msgCount == 2) {
      updateFirestoreData(docID, {
        BMessage3: response,
        UMessage2: messageText,
        ReplyCount: msgCount,
        Score: scoreData,
      });
    } else if (msgCount == 3) {
      updateFirestoreData(docID, {
        BMessage4: response,
        UMessage3: messageText,
        ReplyCount: msgCount,
        Score: scoreData,
      });
    } else if (msgCount == 4) {
      updateFirestoreData(docID, {
        BMessage5: response,
        UMessage4: messageText,
        ReplyCount: msgCount,
        Score: scoreData,
      });
      conversationHistory +=
        "Send score after the next user reply. Please don't continue to communicate after the next reply.";
    } else if (msgCount == 5) {
      updateFirestoreData(docID, {
        BResult: response,
        UMessage5: messageText,
        ReplyCount: msgCount,
        Score: scoreData,
      });
    }

    if (scoreData != 0) {
      updateTodaysRankings();
      document.getElementById("ShareScreen").style.display = "flex";
      conversationHistory +=
        "Conversation has ended, no more reply is accepted";
    } else {
      msgCount++;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    botMessage.textContent = "Sorry, I couldn't generate a response.";
  }

  setTimeout(() => {
    messages.scrollTop = messages.scrollHeight;
  }, 50);
};

document
  .getElementById("userInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
    }
  });

document
  .getElementById("shareForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get the values of the form fields
    const username = document.getElementById("name").value;
    const agreed = document.getElementById("agree").checked;

    const updateData = {};
    if (username && username.trim() !== "") {
      updateData.User = username;
    }
    if (agreed) {
      updateData.Share = true;
    }
    alert(`Username: ${username}\nAgreed to share: ${agreed}`);
    if (Object.keys(updateData).length > 0) {
      updateFirestoreData(docID, updateData);
    }
    window.location.href = "leaderboard.html";
  });
