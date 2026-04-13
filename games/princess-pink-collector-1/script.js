// Princess Pink Collector Game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const messageDiv = document.getElementById('message');

// Game constants
const GAME_WIDTH = 400;
const GAME_HEIGHT = 500;
const PRINCESS_WIDTH = 50;
const PRINCESS_HEIGHT = 60;
const ITEM_RADIUS = 18;
const ITEM_TYPES = [
  { name: 'star', color: '#ff69b4' }, // Pink Star
  { name: 'bubble', color: '#ffb6d5' }, // Pink Bubble
  { name: 'flower', color: '#e75480' } // Pink Flower
];
const ITEM_FALL_SPEED = 2.5;
const PRINCESS_SPEED = 6;
const GAME_TIME = 30; // seconds
const WIN_SCORE = 15;

// Game state
let princess = null;
let items = [];
let leftPressed = false;
let rightPressed = false;
let score = 0;
let gameActive = false;
let gameTimer = 0;
let timeLeft = GAME_TIME;
let spawnCooldown = 0;

function resetGame() {
  princess = {
    x: GAME_WIDTH / 2 - PRINCESS_WIDTH / 2,
    y: GAME_HEIGHT - PRINCESS_HEIGHT - 10,
    width: PRINCESS_WIDTH,
    height: PRINCESS_HEIGHT
  };
  items = [];
  score = 0;
  timeLeft = GAME_TIME;
  spawnCooldown = 0;
  scoreDiv.textContent = 'Score: 0';
  messageDiv.textContent = '';
}

function drawPrincess() {
  // Draw princess dress (pink)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(princess.x + PRINCESS_WIDTH / 2, princess.y + 10);
  ctx.lineTo(princess.x + 10, princess.y + PRINCESS_HEIGHT);
  ctx.lineTo(princess.x + PRINCESS_WIDTH - 10, princess.y + PRINCESS_HEIGHT);
  ctx.closePath();
  ctx.fillStyle = '#ff69b4';
  ctx.fill();
  // Draw head
  ctx.beginPath();
  ctx.arc(princess.x + PRINCESS_WIDTH / 2, princess.y, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#ffe6f2';
  ctx.fill();
  // Draw crown
  ctx.beginPath();
  ctx.moveTo(princess.x + PRINCESS_WIDTH/2 - 10, princess.y - 10);
  ctx.lineTo(princess.x + PRINCESS_WIDTH/2 - 5, princess.y - 18);
  ctx.lineTo(princess.x + PRINCESS_WIDTH/2, princess.y - 10);
  ctx.lineTo(princess.x + PRINCESS_WIDTH/2 + 5, princess.y - 18);
  ctx.lineTo(princess.x + PRINCESS_WIDTH/2 + 10, princess.y - 10);
  ctx.closePath();
  ctx.fillStyle = '#ffd700';
  ctx.fill();
  ctx.restore();
}

function drawItem(item) {
  ctx.save();
  ctx.translate(item.x, item.y);
  // Draw different shapes for each item
  if (item.type === 'star') {
    drawStar(0, 0, ITEM_RADIUS, 5, 0.5, item.color);
  } else if (item.type === 'bubble') {
    ctx.beginPath();
    ctx.arc(0, 0, ITEM_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = item.color;
    ctx.globalAlpha = 0.7;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  } else if (item.type === 'flower') {
    drawFlower(0, 0, ITEM_RADIUS, item.color);
  }
  ctx.restore();
}

function drawStar(cx, cy, outer, points, inset, color) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outer);
  for (let i = 0; i < points * 2; i++) {
    const angle = Math.PI / points * i;
    const r = i % 2 === 0 ? outer : outer * inset;
    ctx.lineTo(cx + Math.sin(angle) * r, cy - Math.cos(angle) * r);
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 5;
  ctx.fill();
  ctx.restore();
}

function drawFlower(cx, cy, r, color) {
  ctx.save();
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    const angle = (Math.PI * 2 / 6) * i;
    ctx.ellipse(
      cx + Math.cos(angle) * r * 0.6,
      cy + Math.sin(angle) * r * 0.6,
      r * 0.45, r * 0.18, angle, 0, Math.PI * 2
    );
    ctx.fillStyle = color;
    ctx.fill();
  }
  // Center
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#fff0f8';
  ctx.fill();
  ctx.restore();
}

function spawnItem() {
  const typeIdx = Math.floor(Math.random() * ITEM_TYPES.length);
  const type = ITEM_TYPES[typeIdx];
  const x = Math.random() * (GAME_WIDTH - ITEM_RADIUS * 2) + ITEM_RADIUS;
  items.push({
    x: x,
    y: -ITEM_RADIUS,
    type: type.name,
    color: type.color
  });
}

function updateItems() {
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].y += ITEM_FALL_SPEED;
    // Remove if off screen
    if (items[i].y - ITEM_RADIUS > GAME_HEIGHT) {
      items.splice(i, 1);
    }
  }
}

function checkCollisions() {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (
      item.x > princess.x &&
      item.x < princess.x + PRINCESS_WIDTH &&
      item.y + ITEM_RADIUS > princess.y &&
      item.y - ITEM_RADIUS < princess.y + PRINCESS_HEIGHT
    ) {
      // Collect!
      items.splice(i, 1);
      score++;
      scoreDiv.textContent = 'Score: ' + score;
    }
  }
}

function drawAll() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawPrincess();
  for (const item of items) {
    drawItem(item);
  }
}

function updatePrincess() {
  if (leftPressed) {
    princess.x -= PRINCESS_SPEED;
    if (princess.x < 0) princess.x = 0;
  }
  if (rightPressed) {
    princess.x += PRINCESS_SPEED;
    if (princess.x + PRINCESS_WIDTH > GAME_WIDTH) princess.x = GAME_WIDTH - PRINCESS_WIDTH;
  }
}

function gameLoop() {
  if (!gameActive) return;
  updatePrincess();
  if (spawnCooldown <= 0) {
    spawnItem();
    spawnCooldown = Math.random() * 30 + 20; // Randomize spawn rate
  } else {
    spawnCooldown--;
  }
  updateItems();
  checkCollisions();
  drawAll();
  // Timer
  if (gameTimer % 60 === 0 && timeLeft > 0) {
    timeLeft--;
  }
  if (timeLeft <= 0) {
    endGame();
    return;
  }
  gameTimer++;
  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameActive = false;
  if (score >= WIN_SCORE) {
    messageDiv.textContent = 'You win! The princess is happy!';
  } else {
    messageDiv.textContent = 'Oh no! Try again to collect more pink!';
  }
  startBtn.textContent = 'Restart';
  startBtn.style.display = 'inline-block';
}

function startGame() {
  resetGame();
  gameActive = true;
  gameTimer = 0;
  startBtn.style.display = 'none';
  messageDiv.textContent = '';
  drawAll();
  requestAnimationFrame(gameLoop);
}

// Controls
window.addEventListener('keydown', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = true;
  if (e.code === 'ArrowRight') rightPressed = true;
});
window.addEventListener('keyup', function(e) {
  if (e.code === 'ArrowLeft') leftPressed = false;
  if (e.code === 'ArrowRight') rightPressed = false;
});

startBtn.addEventListener('click', startGame);

// Initial state
resetGame();
drawAll();
