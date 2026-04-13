// Princess Blue Catcher Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const messageDiv = document.getElementById('message');
const startBtn = document.getElementById('startBtn');

const princess = {
  x: 180,
  y: 440,
  width: 40,
  height: 48,
  speed: 6
};

const itemTypes = [
  { type: 'star', color: 'yellow', good: false },
  { type: 'star', color: 'blue', good: true },
  { type: 'star', color: 'pink', good: false },
  { type: 'flower', color: 'red', good: false },
  { type: 'flower', color: 'blue', good: true },
  { type: 'flower', color: 'purple', good: false }
];

let items = [];
let score = 0;
let gameRunning = false;
let gameOver = false;
let winScore = 10;
let animationId;

function resetGame() {
  score = 0;
  items = [];
  princess.x = 180;
  messageDiv.textContent = '';
  updateScore();
  gameOver = false;
}

function startGame() {
  resetGame();
  gameRunning = true;
  startBtn.style.display = 'none';
  spawnItem();
  gameLoop();
}

function endGame(win) {
  gameRunning = false;
  gameOver = true;
  cancelAnimationFrame(animationId);
  startBtn.textContent = 'Restart';
  startBtn.style.display = 'inline-block';
  if (win) {
    messageDiv.textContent = 'You Win! 🎉';
  } else {
    messageDiv.textContent = 'Oops! Wrong color!';
  }
}

function updateScore() {
  scoreDiv.textContent = `Score: ${score}`;
}

function drawPrincess() {
  // Draw princess dress (pink)
  ctx.fillStyle = '#ff7eb9';
  ctx.beginPath();
  ctx.ellipse(princess.x + 20, princess.y + 38, 20, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  // Draw face
  ctx.fillStyle = '#fff0b3';
  ctx.beginPath();
  ctx.arc(princess.x + 20, princess.y + 18, 12, 0, Math.PI * 2);
  ctx.fill();
  // Draw crown
  ctx.fillStyle = '#ffe066';
  ctx.beginPath();
  ctx.moveTo(princess.x + 10, princess.y + 7);
  ctx.lineTo(princess.x + 20, princess.y - 5);
  ctx.lineTo(princess.x + 30, princess.y + 7);
  ctx.closePath();
  ctx.fill();
  // Draw eyes
  ctx.fillStyle = '#4d194d';
  ctx.beginPath();
  ctx.arc(princess.x + 16, princess.y + 20, 2, 0, Math.PI * 2);
  ctx.arc(princess.x + 24, princess.y + 20, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawItem(item) {
  if (item.type === 'star') {
    drawStar(item.x, item.y, 12, item.color);
  } else if (item.type === 'flower') {
    drawFlower(item.x, item.y, 10, item.color);
  }
}

function drawStar(cx, cy, spikes, color) {
  let outerRadius = 12;
  let innerRadius = 5;
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.shadowColor = '#fff';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

function drawFlower(cx, cy, petals, color) {
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.ellipse(0, 8, 4, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
  // center
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#fffbe7';
  ctx.fill();
  ctx.restore();
}

function spawnItem() {
  if (!gameRunning) return;
  // Randomly pick item type
  const item = Object.assign({}, itemTypes[Math.floor(Math.random() * itemTypes.length)]);
  item.x = Math.random() * (canvas.width - 24) + 12;
  item.y = -20;
  item.size = 24;
  item.speed = Math.random() * 1.5 + 2.5;
  items.push(item);
  // Next spawn in 700-1200ms
  setTimeout(spawnItem, Math.random() * 500 + 700);
}

function movePrincess(dir) {
  if (!gameRunning) return;
  if (dir === 'left') {
    princess.x -= princess.speed;
    if (princess.x < 0) princess.x = 0;
  } else if (dir === 'right') {
    princess.x += princess.speed;
    if (princess.x > canvas.width - princess.width) princess.x = canvas.width - princess.width;
  }
}

function checkCollisions() {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    // Simple bounding box collision
    if (
      item.x + item.size / 2 > princess.x &&
      item.x - item.size / 2 < princess.x + princess.width &&
      item.y + item.size / 2 > princess.y &&
      item.y - item.size / 2 < princess.y + princess.height
    ) {
      if (item.color === 'blue') {
        // Good catch
        score++;
        updateScore();
        if (score >= winScore) {
          endGame(true);
        }
      } else {
        // Bad catch
        endGame(false);
      }
      items.splice(i, 1);
    }
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPrincess();
  // Move and draw items
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    item.y += item.speed;
    drawItem(item);
    // Remove if off screen
    if (item.y > canvas.height + 20) {
      items.splice(i, 1);
    }
  }
  checkCollisions();
  if (gameRunning) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

// Controls
window.addEventListener('keydown', function(e) {
  if (!gameRunning) return;
  if (e.key === 'ArrowLeft') movePrincess('left');
  if (e.key === 'ArrowRight') movePrincess('right');
});

canvas.addEventListener('touchstart', function(e) {
  if (!gameRunning) return;
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  if (x < princess.x + princess.width / 2) movePrincess('left');
  else movePrincess('right');
});

startBtn.addEventListener('click', function() {
  startGame();
});

// Initial state
ctx.font = '20px Comic Sans MS';
ctx.fillStyle = '#e754b1';
ctx.fillText('Help the princess catch only blue stars and flowers!', 20, 250);
ctx.fillText('Use  or tap to move.', 100, 280);
