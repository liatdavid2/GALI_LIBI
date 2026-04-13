// Doll House Dress Up Game

// Images for doll and clothes layers
const dollBase = 'data:image/svg+xml;utf8,<svg width="150" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="60" r="50" fill="#fcd5b2" stroke="#b5651d" stroke-width="3"/><rect x="40" y="110" width="70" height="120" fill="#f9b5ac" stroke="#b5651d" stroke-width="3" rx="20" ry="20"/><rect x="40" y="230" width="70" height="40" fill="#f9b5ac" stroke="#b5651d" stroke-width="3" rx="15" ry="15"/></svg>';

const clothesImages = {
  hat: 'data:image/svg+xml;utf8,<svg width="150" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="60" r="50" fill="%23fcd5b2" stroke="%23b5651d" stroke-width="3"/><rect x="40" y="110" width="70" height="120" fill="%23f9b5ac" stroke="%23b5651d" stroke-width="3" rx="20" ry="20"/><rect x="40" y="230" width="70" height="40" fill="%23f9b5ac" stroke="%23b5651d" stroke-width="3" rx="15" ry="15"/><ellipse cx="75" cy="20" rx="60" ry="20" fill="%23ff69b4" stroke="%23b5651d" stroke-width="3"/></svg>',
  shirt: 'data:image/svg+xml;utf8,<svg width="150" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="60" r="50" fill="%23fcd5b2" stroke="%23b5651d" stroke-width="3"/><rect x="40" y="110" width="70" height="120" fill="%23ffb6c1" stroke="%23b5651d" stroke-width="3" rx="20" ry="20"/><rect x="40" y="230" width="70" height="40" fill="%23f9b5ac" stroke="%23b5651d" stroke-width="3" rx="15" ry="15"/></svg>',
  pants: 'data:image/svg+xml;utf8,<svg width="150" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="60" r="50" fill="%23fcd5b2" stroke="%23b5651d" stroke-width="3"/><rect x="40" y="110" width="70" height="120" fill="%23f9b5ac" stroke="%23b5651d" stroke-width="3" rx="20" ry="20"/><rect x="40" y="230" width="70" height="40" fill="%237070d0" stroke="%23b5651d" stroke-width="3" rx="15" ry="15"/></svg>',
  shoes: 'data:image/svg+xml;utf8,<svg width="150" height="320" xmlns="http://www.w3.org/2000/svg"><circle cx="75" cy="60" r="50" fill="%23fcd5b2" stroke="%23b5651d" stroke-width="3"/><rect x="40" y="110" width="70" height="120" fill="%23f9b5ac" stroke="%23b5651d" stroke-width="3" rx="20" ry="20"/><rect x="40" y="230" width="70" height="40" fill="%23ff4500" stroke="%23b5651d" stroke-width="3" rx="15" ry="15"/></svg>'
};

const requiredItems = ['hat', 'shirt', 'pants', 'shoes'];

let score = 0;
let chosenItems = {};
let gameStarted = false;

const dollImg = document.getElementById('doll');
const scoreSpan = document.getElementById('score');
const messageP = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const clothesButtons = document.querySelectorAll('.clothes-btn');

// Initialize game state
function resetGame() {
  score = 0;
  chosenItems = {};
  scoreSpan.textContent = score;
  messageP.textContent = '';
  dollImg.src = dollBase;
  clothesButtons.forEach(btn => {
    btn.disabled = false;
  });
  gameStarted = true;
  startBtn.textContent = 'Restart Game';
}

// Update doll image based on chosen clothes
function updateDollImage() {
  // Compose SVG layers by replacing doll image with combined clothes
  // For simplicity, we show the last chosen clothes image that includes all chosen items
  // We combine by layering SVGs using data URLs - but here we simplify by showing the last chosen item image

  // Build SVG with base and chosen clothes layers
  // Since we only have 4 items, we create a combined SVG string
  // We'll build SVG with base and colored layers

  // Start with base SVG
  let svgParts = [];

  // Base circle (head)
  svgParts.push('<circle cx="75" cy="60" r="50" fill="#fcd5b2" stroke="#b5651d" stroke-width="3"/>');

  // Shirt layer
  if (chosenItems.shirt) {
    svgParts.push('<rect x="40" y="110" width="70" height="120" fill="#ffb6c1" stroke="#b5651d" stroke-width="3" rx="20" ry="20"/>');
  } else {
    svgParts.push('<rect x="40" y="110" width="70" height="120" fill="#f9b5ac" stroke="#b5651d" stroke-width="3" rx="20" ry="20"/>');
  }

  // Pants layer
  if (chosenItems.pants) {
    svgParts.push('<rect x="40" y="230" width="70" height="40" fill="#7070d0" stroke="#b5651d" stroke-width="3" rx="15" ry="15"/>');
  } else {
    svgParts.push('<rect x="40" y="230" width="70" height="40" fill="#f9b5ac" stroke="#b5651d" stroke-width="3" rx="15" ry="15"/>');
  }

  // Hat layer
  if (chosenItems.hat) {
    svgParts.push('<ellipse cx="75" cy="20" rx="60" ry="20" fill="#ff69b4" stroke="#b5651d" stroke-width="3"/>');
  }

  // Shoes layer
  if (chosenItems.shoes) {
    svgParts.push('<rect x="40" y="270" width="70" height="20" fill="#ff4500" stroke="#b5651d" stroke-width="3" rx="10" ry="10"/>');
  }

  const svgContent = `<svg width=\"150\" height=\"320\" xmlns=\"http://www.w3.org/2000/svg\">${svgParts.join('')}</svg>`;

  // Encode SVG for data URI
  const encodedSVG = encodeURIComponent(svgContent).replace(/'/g, '%27').replace(/"/g, '%22');
  dollImg.src = `data:image/svg+xml,${encodedSVG}`;
}

// Handle clothes button click
function onClothesClick(e) {
  if (!gameStarted) return;
  const item = e.target.getAttribute('data-item');
  if (chosenItems[item]) return; // already chosen

  chosenItems[item] = true;
  score++;
  scoreSpan.textContent = score;

  // Disable the chosen button
  e.target.disabled = true;

  updateDollImage();

  if (score === requiredItems.length) {
    messageP.textContent = 'You dressed the doll perfectly! 🎉';
    gameStarted = false;
  }
}

startBtn.addEventListener('click', () => {
  resetGame();
});

clothesButtons.forEach(btn => {
  btn.addEventListener('click', onClothesClick);
});

// Initial state
resetGame();
