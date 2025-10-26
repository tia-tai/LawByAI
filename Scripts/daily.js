window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
  }, 3000);
});

const userInput = document.getElementById("userInput");
const charCount = document.getElementById("charCount");

userInput.addEventListener("input", () => {
  const max = userInput.getAttribute("maxlength");
  charCount.textContent = `${userInput.value.length} / ${max}`;
});

