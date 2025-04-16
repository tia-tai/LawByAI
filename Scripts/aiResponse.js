import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

function containsEvaluation(text) {
  const evaluationRegex = /Score/i;
  return evaluationRegex.test(text);
}

let isFirstUserMessage = true;
let conversationHistory = "";

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

  if (messageText === "Reset" || messageText === "reset") {
    let botMessage = document.createElement("div");
    botMessage.classList.add("bot");
    botMessage.textContent = "I'm ready for a new scenario!";
    messages.appendChild(botMessage);
    messages.scrollTop = messages.scrollHeight;

    isFirstUserMessage = true;
    conversationHistory = "";
  } else {
    if (isFirstUserMessage) {
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
      const genAI = new GoogleGenerativeAI(
        "AIzaSyAm6dOUWqVzfDnnWPWgBwtERjkLT44ekYQ"
      );
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const result = await model.generateContent(conversationHistory);
      const response = await result.response.text();

      botMessage.textContent = response;

      const hasEvaluation = containsEvaluation(response);
      if (hasEvaluation) {
        isFirstUserMessage = true;
        conversationHistory = "";
      }

      conversationHistory += "AI: " + response + "\n";
    } catch (error) {
      console.error("An error occurred:", error);
      botMessage.textContent = "Sorry, I couldn't generate a response.";
    }
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
