const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const endScreen = document.getElementById("endScreen");
const scoreEl = document.getElementById("score");
const itemsContainer = document.getElementById("itemsContainer");

let score = 0;
let gameInterval;

// פריטים במשחק
const items = ["🎁", "🎈", "🎂", "⭐"];

document.getElementById("startBtn").onclick = () => {
  startScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  startGame();
};

function startGame() {
  score = 0;
  scoreEl.textContent = score;

  gameInterval = setInterval(createItem, 800);
}

function createItem() {
  const item = document.createElement("div");
  item.classList.add("item");
  item.innerText = items[Math.floor(Math.random() * items.length)];

  item.style.left = Math.random() * 90 + "%";

  item.onclick = () => {
    score++;
    scoreEl.textContent = score;

    // אנימציה קטנה
    item.style.transform = "scale(1.5)";
    item.style.opacity = "0";

    setTimeout(() => item.remove(), 200);

    // סיום משחק אחרי 10
    if (score >= 10) {
      endGame();
    }
  };

  itemsContainer.appendChild(item);

  // הסרה אוטומטית
  setTimeout(() => item.remove(), 3000);
}

function endGame() {
  clearInterval(gameInterval);
  gameScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
}

function restartGame() {
  endScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");
}


// התחלה אוטומטית
startScreen.classList.add("hidden");
gameScreen.classList.remove("hidden");
startGame();