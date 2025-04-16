window.addEventListener("load", function () {
  setTimeout(function () {
    document.getElementById("loadingScreen").style.display = "none";
    document.getElementById("mainContent").style.display = "block";

    positionClickZones();
  }, 3000);

  window.addEventListener("resize", positionClickZones);
});

function positionClickZones() {
  const image = document.getElementById("scalesImage");
  const dailyZone = document.getElementById("dailyZone");
  const freeZone = document.getElementById("freeZone");

  if (!image || !dailyZone || !freeZone) return;

  const imgRect = image.getBoundingClientRect();
  const imgWidth = imgRect.width;
  const imgHeight = imgRect.height;

  // Position daily zone
  dailyZone.style.width = imgWidth * 0.35 + "px";
  dailyZone.style.height = imgHeight * 0.15 + "px";
  dailyZone.style.left = imgRect.left + imgWidth * 0.075 + "px";
  dailyZone.style.top = imgRect.top + imgHeight * 0.54 + "px";

  // Position free zone
  freeZone.style.width = imgWidth * 0.35 + "px";
  freeZone.style.height = imgHeight * 0.15 + "px";
  freeZone.style.left = imgRect.left + imgWidth * 0.585 + "px";
  freeZone.style.top = imgRect.top + imgHeight * 0.415 + "px";
}

document.addEventListener("DOMContentLoaded", function () {
  const dailyZone = document.querySelector(".daily-zone");
  const freeZone = document.querySelector(".free-zone");

  if (dailyZone) {
    dailyZone.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Daily Challenge clicked");
      window.location.href = "daily.html";
    });
  }

  if (freeZone) {
    freeZone.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("Free Play clicked");
      window.location.href = "freeplay.html";
    });
  }
});
