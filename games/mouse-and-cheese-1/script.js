// Mouse and Cheese Game
// The player moves the mouse with arrow keys to catch the cheese

const mouse = document.getElementById('mouse');
const cheese = document.getElementById('cheese');
const scoreSpan = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const message = document.getElementById('message');
const gameArea = document.getElementById('game');

// Game settings
const gameWidth = 400;
const gameHeight = 300;
const mouseSize = 40;
const cheeseSize = 30;
const moveStep = 20; // pixels per arrow key press
const winScore = 5;

let score = 0;
let gameRunning = false;

// Position of mouse and cheese
let mousePos = { x: 10, y: 130 };
let cheesePos = { x: 0, y: 0 };

// Place cheese randomly inside game area
function placeCheese() {
  const maxX = gameWidth - cheeseSize - 5;
  const maxY = gameHeight - cheeseSize - 5;
  cheesePos.x = Math.floor(Math.random() * maxX);
  cheesePos.y = Math.floor(Math.random() * maxY);
  cheese.style.left = cheesePos.x + 'px';
  cheese.style.top = cheesePos.y + 'px';
}

// Update mouse position on screen
function updateMouse() {
  mouse.style.left = mousePos.x + 'px';
  mouse.style.top = mousePos.y + 'px';
}

// Check if mouse caught cheese
function checkCatch() {
  const mouseRect = {
    left: mousePos.x,
    right: mousePos.x + mouseSize,
    top: mousePos.y,
    bottom: mousePos.y + mouseSize
  };
  const cheeseRect = {
    left: cheesePos.x,
    right: cheesePos.x + cheeseSize,
    top: cheesePos.y,
    bottom: cheesePos.y + cheeseSize
  };

  const overlap = !(mouseRect.right < cheeseRect.left ||
                    mouseRect.left > cheeseRect.right ||
                    mouseRect.bottom < cheeseRect.top ||
                    mouseRect.top > cheeseRect.bottom);
  return overlap;
}

// Handle key presses to move mouse
function handleKey(e) {
  if (!gameRunning) return;

  switch(e.key) {
    case 'ArrowUp':
      mousePos.y = Math.max(0, mousePos.y - moveStep);
      break;
    case 'ArrowDown':
      mousePos.y = Math.min(gameHeight - mouseSize, mousePos.y + moveStep);
      break;
    case 'ArrowLeft':
      mousePos.x = Math.max(0, mousePos.x - moveStep);
      break;
    case 'ArrowRight':
      mousePos.x = Math.min(gameWidth - mouseSize, mousePos.x + moveStep);
      break;
    default:
      return; // ignore other keys
  }

  updateMouse();

  if (checkCatch()) {
    score++;
    scoreSpan.textContent = score;
    if (score >= winScore) {
      endGame(true);
    } else {
      placeCheese();
    }
  }
}

// Start the game
function startGame() {
  score = 0;
  scoreSpan.textContent = score;
  message.textContent = '';
  gameRunning = true;
  startBtn.disabled = true;
  mousePos = { x: 10, y: 130 };
  updateMouse();
  placeCheese();
  mouse.focus();
}

// End the game
function endGame(win) {
  gameRunning = false;
  startBtn.disabled = false;
  if (win) {
    message.textContent = 'You win! You caught all the cheese!';
    message.style.color = 'green';
  } else {
    message.textContent = 'Game over!';
    message.style.color = 'red';
  }
}

// Initialize
startBtn.addEventListener('click', startGame);
window.addEventListener('keydown', handleKey);

// Make mouse focusable for keyboard control
mouse.setAttribute('tabindex', '0');