let starPosition;
let score = 0;

const closedImg = "https://cdn-icons-png.flaticon.com/512/565/565547.png";
const starImg = "https://cdn-icons-png.flaticon.com/512/616/616490.png";
const wrongImg = "https://cdn-icons-png.flaticon.com/512/463/463612.png";

function setupBoard() {
  starPosition = Math.floor(Math.random() * 6);

  for (let i = 0; i < 6; i++) {
    document.getElementById("img" + i).src = closedImg;
  }

  document.getElementById("message").textContent = "";
}

function checkStar(index) {
  const message = document.getElementById("message");

  if (index === starPosition) {
    document.getElementById("img" + index).src = starImg;
    message.textContent = "כל הכבוד! מצאת את הכוכב!";
    message.style.color = "green";
    score++;
  } else {
    document.getElementById("img" + index).src = wrongImg;
    message.textContent = "לא נכון, נסי שוב";
    message.style.color = "crimson";
  }

  document.getElementById("score").textContent = "ניקוד: " + score;
}

function restartGame() {
  score = 0;
  document.getElementById("score").textContent = "ניקוד: 0";
  setupBoard();
}

setupBoard();
