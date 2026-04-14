// Dog Chases Cat Game

const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const message = document.getElementById('message');
const gameContainer = document.getElementById('gameContainer');

const gameWidth = gameContainer.clientWidth;
const gameHeight = gameContainer.clientHeight;
const playerSize = 60; // width and height
const enemySize = 60;

let score = 0;
let gameInterval = null;
let enemyInterval = null;
let gameRunning = false;

// Positions
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 0, y: 0 };

// Movement speed
const playerSpeed = 10; // pixels per key press
const enemySpeed = 3; // pixels per frame

// Initialize positions
function resetPositions() {
  // Player starts bottom-left
  playerPos.x = 20;
  playerPos.y = gameHeight - playerSize - 20;
  updatePosition(player, playerPos);

  // Enemy starts top-right
  enemyPos.x = gameWidth - enemySize - 20;
  enemyPos.y = 20;
  updatePosition(enemy, enemyPos);
}

// Update element position
function updatePosition(element, pos) {
  element.style.left = pos.x + 'px';
  element.style.top = pos.y + 'px';
}

// Check collision between player and enemy
function isCollision() {
  return !(
    playerPos.x + playerSize < enemyPos.x ||
    playerPos.x > enemyPos.x + enemySize ||
    playerPos.y + playerSize < enemyPos.y ||
    playerPos.y > enemyPos.y + enemySize
  );
}

// Move enemy towards player
function moveEnemy() {
  let dx = playerPos.x - enemyPos.x;
  let dy = playerPos.y - enemyPos.y;
  let dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;
  let moveX = (dx / dist) * enemySpeed;
  let moveY = (dy / dist) * enemySpeed;

  enemyPos.x += moveX;
  enemyPos.y += moveY;

  // Keep enemy inside game area
  enemyPos.x = Math.min(Math.max(enemyPos.x, 0), gameWidth - enemySize);
  enemyPos.y = Math.min(Math.max(enemyPos.y, 0), gameHeight - enemySize);

  updatePosition(enemy, enemyPos);
}

// Game loop
function gameLoop() {
  moveEnemy();

  if (isCollision()) {
    endGame(false);
  }
}

// Start the game
function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  message.textContent = '';
  score = 0;
  scoreDisplay.textContent = score;
  resetPositions();

  // Listen for player movement
  window.addEventListener('keydown', handleKeyDown);

  // Start game loop
  gameInterval = setInterval(() => {
    gameLoop();
    // Increase score every second
  }, 30);

  // Increase score every second
  enemyInterval = setInterval(() => {
    if (!gameRunning) return;
    score++;
    scoreDisplay.textContent = score;
    // Win condition: score reaches 30
    if (score >= 30) {
      endGame(true);
    }
  }, 1000);
}

// End the game
function endGame(win) {
  gameRunning = false;
  clearInterval(gameInterval);
  clearInterval(enemyInterval);
  window.removeEventListener('keydown', handleKeyDown);

  if (win) {
    message.textContent = 'You Win! The dog caught the cat!';
    message.style.color = '#2e7d32';
  } else {
    message.textContent = 'You Lose! The cat escaped!';
    message.style.color = '#c62828';
  }
}

// Handle player movement
function handleKeyDown(e) {
  if (!gameRunning) return;

  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      playerPos.y -= playerSpeed;
      break;
    case 'ArrowDown':
    case 's':
    case 'S':
      playerPos.y += playerSpeed;
      break;
    case 'ArrowLeft':
    case 'a':
    case 'A':
      playerPos.x -= playerSpeed;
      break;
    case 'ArrowRight':
    case 'd':
    case 'D':
      playerPos.x += playerSpeed;
      break;
  }

  // Keep player inside game area
  playerPos.x = Math.min(Math.max(playerPos.x, 0), gameWidth - playerSize);
  playerPos.y = Math.min(Math.max(playerPos.y, 0), gameHeight - playerSize);

  updatePosition(player, playerPos);
}

// Restart button
startBtn.addEventListener('click', () => {
  if (gameRunning) {
    endGame(false);
  }
  startGame();
});

// Initial setup
resetPositions();
message.textContent = 'Press Start to play!';
message.style.color = '#004d40';