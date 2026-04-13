// Doll House Dress Up Game Script

// Elements
const startBtn = document.getElementById('start-btn');
const messageEl = document.getElementById('message');
const scoreEl = document.getElementById('score');
const optionButtons = document.querySelectorAll('.option-btn');

// Doll layers
const dollLayers = {
  hair: document.getElementById('hair'),
  dress: document.getElementById('dress'),
  shoes: document.getElementById('shoes'),
  accessory: document.getElementById('accessory')
};

// Game state
let gameStarted = false;
let score = 0;

// Target outfit for winning
// Player must match this outfit exactly to win
const targetOutfit = {
  hair: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400'><circle cx='100' cy='80' r='50' fill='%23f9d5b3'/><rect x='50' y='130' width='100' height='200' fill='%23f9d5b3'/><ellipse cx='100' cy='50' rx='70' ry='60' fill='%23a0522d'/></svg>", // Brown Hair
  dress: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400'><circle cx='100' cy='80' r='50' fill='%23f9d5b3'/><rect x='50' y='130' width='100' height='200' fill='%23f9d5b3'/><rect x='60' y='130' width='80' height='150' fill='%23ff69b4'/></svg>", // Pink Dress
  shoes: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400'><circle cx='100' cy='80' r='50' fill='%23f9d5b3'/><rect x='50' y='130' width='100' height='200' fill='%23f9d5b3'/><rect x='70' y='320' width='30' height='20' fill='%23ff4500'/><rect x='100' y='320' width='30' height='20' fill='%23ff4500'/></svg>", // Red Shoes
  accessory: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='400'><circle cx='100' cy='80' r='50' fill='%23f9d5b3'/><rect x='50' y='130' width='100' height='200' fill='%23f9d5b3'/><circle cx='140' cy='120' r='15' fill='%23ff6347'/></svg>" // Red Flower
};

// Current selected outfit
const currentOutfit = {
  hair: "",
  dress: "",
  shoes: "",
  accessory: ""
};

// Reset doll images
function resetDoll() {
  for (let part in dollLayers) {
    dollLayers[part].src = "";
  }
}

// Reset selection buttons
function resetSelections() {
  optionButtons.forEach(btn => btn.classList.remove('selected'));
}

// Update doll layer image
function updateDollLayer(type, src) {
  dollLayers[type].src = src;
  currentOutfit[type] = src;
}

// Check if player won
function checkWin() {
  for (let part in targetOutfit) {
    if (targetOutfit[part] !== currentOutfit[part]) {
      return false;
    }
  }
  return true;
}

// Handle option button click
optionButtons.forEach(button => {
  button.addEventListener('click', () => {
    if (!gameStarted) return; // ignore if game not started

    const type = button.getAttribute('data-type');
    const src = button.getAttribute('data-src');

    // Update doll layer
    updateDollLayer(type, src);

    // Update button selection style
    // Remove selected from all buttons of same type
    optionButtons.forEach(btn => {
      if (btn.getAttribute('data-type') === type) {
        btn.classList.remove('selected');
      }
    });
    button.classList.add('selected');

    // Increase score by 1 for each change
    score++;
    scoreEl.textContent = score;

    // Check win condition
    if (checkWin()) {
      messageEl.textContent = "You Win! You dressed the doll perfectly!";
      gameStarted = false;
      startBtn.textContent = "Play Again";
    } else {
      messageEl.textContent = "";
    }
  });
});

// Start or restart game
startBtn.addEventListener('click', () => {
  gameStarted = true;
  score = 0;
  scoreEl.textContent = score;
  messageEl.textContent = "Dress the doll to match the target outfit!";
  resetDoll();
  resetSelections();
  startBtn.textContent = "Restart";

  // Clear current outfit
  for (let part in currentOutfit) {
    currentOutfit[part] = "";
  }
});
