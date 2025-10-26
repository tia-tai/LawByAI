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
  apiKey: "AIzaSyCVSIyd87yBjvyqEaBUJdPChDvgtm5YzXc",
  authDomain: "iste2-1a0da.firebaseapp.com",
  projectId: "iste2-1a0da",
  storageBucket: "iste2-1a0da.firebasestorage.app",
  messagingSenderId: "887233895961",
  appId: "1:887233895961:web:622601660f71749c8f1488",
  measurementId: "G-8PSN1E8NH9"
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

document.addEventListener("DOMContentLoaded", async function () {
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

  // Query for existing document with that IP
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
    where("IP", "==", ip)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    window.location.href = "leaderboard.html";
  } else {
    let messages = document.getElementById("messages");
    let Message = document.createElement("div");
    Message.classList.add("bot");
    Message.textContent = `Welcome to the Daily Puzzle! Read the AI's prompt and craft the best response. Find the best scenario in the least amount of responses and shoot for the highest score!\n 

Type 'hello' to get started!`;
    messages.appendChild(Message);

    input.value = "";
    messages.scrollTop = messages.scrollHeight;
  }
});

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
    prompt: `You’re a freelance web developer in Missouri. A client hires you to redesign their e-commerce site. While reviewing their backend, you discover they've stored customer passwords in plain text and are violating basic data security protocols. You warn them, but they refuse to fix it, saying it’s too expensive.

You worry that staying silent makes you complicit—and that your name is on the project.

What do you do?`,
    date: "2025-10-26",
  },
  {
    prompt: `You're a nurse in Ohio working at a private clinic. A patient confides that they’re undocumented and afraid to seek further medical care. Your supervisor later asks for that patient’s file “for reporting purposes,” but you suspect it’s related to their immigration status—not medical care.

You fear they’ll be reported if you comply.

What do you do?`,
    date: "2025-10-27",
  },
  {
    prompt: `You're a college RA in Vermont and find a student's laptop open during a routine dorm check. On the screen is what appears to be illegal file sharing software and a folder labeled “exam answers.” You’re unsure whether the search would violate privacy or if you're required to report it.

What do you do?`,
    date: "2025-10-28",
  },
  {
    prompt: `You’re a contractor in Utah, and during a renovation project you find what looks like asbestos behind an old wall. Your client insists you keep working and “pretend you didn’t see it” because reporting it would halt construction and increase costs.

You’re worried about health and liability.

What do you do?`,
    date: "2025-10-29",
  },
  {
    prompt: `You're a social media manager in Louisiana and are asked by your boss to log into a former employee’s company account to delete “unprofessional” DMs they sent while employed. The former employee is in the process of suing the company for wrongful termination.

You're not sure if this is legal—or ethical.

What do you do?`,
    date: "2025-10-30",
  },
  {
    prompt: `You’re a delivery driver in Kentucky using your own vehicle. One day, your manager asks you to keep working past your legal shift hours to finish a large order. When you say you’re too tired, they threaten to dock your pay and give you fewer shifts.

You’re worried about safety and labor law violations.

What do you do?`,
    date: "2025-10-31",
  },
  {
    prompt: `You’re a nonprofit intern in Minnesota, helping compile a public report. Your supervisor tells you to “massage the data” to make the organization’s impact look better than it really is. They imply it’s just “PR,” not deception.

You're uncomfortable falsifying numbers but unsure if it's illegal.

What do you do?`,
    date: "2025-11-01",
  },
  {
    prompt: `You’re a wedding photographer in New Mexico. After an event, the couple asks for all raw photos. Your contract says only edited images will be delivered, and the raws remain your intellectual property. They threaten to post negative reviews unless you hand over everything.

You’re worried about damage to your reputation.

What do you do?`,
    date: "2025-11-02",
  },
  {
    prompt: `You're an accountant in Idaho and discover your employer has been quietly misclassifying political donations under “community outreach.” You flag it to your boss, who tells you not to worry about it and just “focus on the numbers.”

You’re unsure whether you're obligated to report this.

What do you do?`,
    date: "2025-11-03",
  },
  {
    prompt: `You’re a real estate agent in South Carolina. During a home tour, a client makes discriminatory comments and asks you to only show them homes in “white neighborhoods.” You're uncomfortable, but fear losing your commission if you push back.

You wonder what your legal obligations are.

What do you do?`,
    date: "2025-11-04",
  },
  {
    prompt: `You’re a high school teacher in Alaska. A student writes a concerning essay implying they may harm themselves. When you bring it up to the school counselor, they say the student’s grades are fine and not to overreact.

You’re worried for their safety and unsure what action you're allowed to take.

What do you do?`,
    date: "2025-11-05",
  },
  {
    prompt: `You’re a bartender in Rhode Island. A clearly intoxicated customer insists on driving home. Your manager says to keep serving them—they're a regular and tip well. You consider taking their keys or calling police but worry about overstepping.

What do you do?`,
    date: "2025-11-06",
  },
  {
    prompt: `You work for a tech startup in Washington D.C. During a product launch, you're told to exclude accessibility features from the demo because they slow down the app. You know this violates internal policy and likely federal disability law.

What do you do?`,
    date: "2025-11-07",
  },
  {
    prompt: `You’re a substitute teacher in Nevada. A student shows you a text thread suggesting their classmate is being abused at home. You want to report it, but administration tells you substitutes aren’t “mandated reporters.”

You’re unsure whether this is true—or if you should report anyway.

What do you do?`,
    date: "2025-11-08",
  },
  {
    prompt: `You’re a property manager in Wisconsin and overhear your maintenance staff making discriminatory jokes about tenants. When you bring it up to HR, they laugh it off and say “that’s just their sense of humor.”

You’re concerned it could escalate into a legal liability.

What do you do?`,
    date: "2025-11-09",
  },
  {
    prompt: `You’re an app developer in Georgia. A client asks you to build a feature that secretly tracks users’ locations without asking for permission. You push back, but they claim it’s legal if the users “agree” by installing the app.

You're not so sure.

What do you do?`,
    date: "2025-11-10",
  },
  {
    prompt: `You’re a freelance editor in Hawaii. A self-published author hires you to help with a memoir, but you notice several passages that clearly defame a real person without evidence. The author says “that’s their problem.”

You’re worried about being legally liable as the editor.

What do you do?`,
    date: "2025-11-11",
  },
  {
    prompt: `You work for a manufacturing company in Indiana. You discover your employer is dumping waste in violation of EPA guidelines. When you raise concerns, you're told to “be a team player” or risk your job.

You want to report it but fear retaliation.

What do you do?`,
    date: "2025-11-12",
  },
  {
    prompt: `You're a tattoo artist in North Dakota. A client asks for a tattoo that includes hate speech. You’re uncomfortable doing it, but they argue it’s protected free expression and threaten to sue if you refuse.

You’re not sure if you’re allowed to say no.

What do you do?`,
    date: "2025-11-13",
  },
  {
    prompt: `You're a high school coach in New Jersey. A parent offers to “donate” new gear to the team if you guarantee their child a starting spot. You politely decline, but they escalate—calling administrators and threatening to go to the media.

What do you do?`,
    date: "2025-11-14",
  },
  {
    prompt: `You’re an event organizer in Montana. A speaker at your upcoming panel is accused of serious misconduct. There’s no official legal action, but the allegations are spreading online. The client wants you to keep the speaker or risk breaching the contract.

What do you do?`,
    date: "2025-11-15",
  },
  {
    prompt: `You're a delivery worker in Arkansas. Your employer uses facial recognition to monitor drivers but doesn’t inform employees or customers. You only found out through a colleague—and now you're worried it’s violating state or federal privacy laws.

What do you do?`,
    date: "2025-11-16",
  },
  {
    prompt: `You're a bookstore owner in Connecticut. A customer asks you to remove LGBTQ+ books from your display. When you refuse, they film your response and post it online, falsely claiming you discriminated against them. You’re getting threats and bad reviews.

What do you do?`,
    date: "2025-11-17",
  },
  {
    prompt: `You’re a software tester in Delaware and accidentally gain access to a list of employees' salaries, revealing massive wage gaps. When you mention it to a coworker, HR accuses you of breaching confidentiality—even though you never signed an NDA.

You’re unsure what rights you have.

What do you do?`,
    date: "2025-11-18",
  },
  {
    prompt: `You're an independent contractor in Wyoming. A company hires you and gives you detailed work instructions, strict hours, and requires daily check-ins. But they insist you’re “not an employee,” so you’re denied benefits.

You're starting to wonder if this is legal misclassification.

What do you do?`,
    date: "2025-11-19",
  },
  {
    prompt: `You’re a college intern at a biotech firm in Nebraska. You witness a lead researcher falsifying lab results to secure grant funding. You’re just an intern and fear the consequences of whistleblowing.

What do you do?`,
    date: "2025-11-20",
  },
  {
    prompt: `You're a part-time cashier in Maine. A customer drops a wallet and walks away. You give it to your manager, but later hear they kept the cash inside. You're not sure if you should report it—or to whom.

What do you do?`,
    date: "2025-11-21",
  },
  {
    prompt: `You're a paralegal in West Virginia. Your supervising attorney asks you to shred documents that were requested in a pending subpoena. You ask twice if they’re sure, and they say it’s “privileged anyway.”

You’re unsure if complying could get *you* in trouble.

What do you do?`,
    date: "2025-11-22",
  },
  {
    prompt: `You're a librarian in New Hampshire. A local group demands the removal of several books they say are “inappropriate.” They claim they’ll sue the library if you don’t comply. The board is panicking and asking for your input.

What do you do?`,
    date: "2025-11-23",
  },
  {
    prompt: `You work at a biotech lab in Iowa. A journalist asks you for anonymous comments on a product you believe is unsafe. Your contract has a strict non-disclosure clause, but you feel morally compelled to speak up.

What do you do?`,
    date: "2025-11-24",
  },
  {
    prompt: `You're a gig worker in Tennessee using multiple apps to make ends meet. One app suddenly bans you, claiming “fraudulent activity,” with no explanation. You’ve lost your main source of income—and there's no clear appeals process.

What do you do?`,
    date: "2025-11-25",
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
        "AIzaSyC8d-9lOYZ0GUZJdcSq5VmAjxl2F8w7PJQ"
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
