// Fairy Star & Bubble Collector Game
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById('score');
const missedDiv = document.getElementById('missed');
const startBtn = document.getElementById('start-btn');
const messageDiv = document.getElementById('message');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Load fairy image
const fairyImg = new Image();
fairyImg.src = 'https://image.similarpng.com/file/similarpng/very-thumbnail/2021/05/Cute-little-fairy-with-beautiful-long-braided-hairstyle-holding-a-lantern-on-transparent-background-PNG.png';

// Fairy settings
const fairy = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT - 60,
  width: 60,
  height: 80,
  speed: 5,
  dx: 0
};

let stars = [];
let bubbles = [];
let score = 0;
let missed = 0;
let gameActive = false;
let gameOver = false;
let winScore = 10;
// User request: allow missing many stars and bubbles, do not count missed
let maxMissed = 999999; // Effectively disables losing by missing
let animationId;

function drawFairy() {
  // Draw the fairy image centered at fairy.x, fairy.y
  if (fairyImg.complete) {
    ctx.drawImage(fairyImg, fairy.x - fairy.width / 2, fairy.y - fairy.height / 2, fairy.width, fairy.height);
  } else {
    // If image not loaded yet, draw a placeholder circle
    ctx.fillStyle = '#fff8c6';
    ctx.beginPath();
    ctx.arc(fairy.x, fairy.y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
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
  ctx.fill();
  ctx.restore();
}

function drawBubble(b) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#b7e4fb';
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawFallingStar(s) {
  drawStar(ctx, s.x, s.y, 5, s.radius, s.radius / 2, '#ffe066');
}

function clearCanvas() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function moveFairy() {
  fairy.x += fairy.dx;
  // Keep inside bounds
  if (fairy.x < fairy.width / 2) fairy.x = fairy.width / 2;
  if (fairy.x > GAME_WIDTH - fairy.width / 2) fairy.x = GAME_WIDTH - fairy.width / 2;
}

function moveObjects() {
  for (let s of stars) s.y += s.speed;
  for (let b of bubbles) b.y += b.speed;
}

function spawnStar() {
  let x = Math.random() * (GAME_WIDTH - 30) + 15;
  let speed = 2 + Math.random() * 1.5;
  stars.push({ x, y: -20, radius: 13, speed });
}

function spawnBubble() {
  let x = Math.random() * (GAME_WIDTH - 30) + 15;
  let speed = 1.5 + Math.random();
  let radius = 12 + Math.random() * 7;
  bubbles.push({ x, y: -20, radius, speed });
}

function checkCollisions() {
  // Star collision
  for (let i = stars.length - 1; i >= 0; i--) {
    let s = stars[i];
    if (isColliding(fairy, s)) {
      score++;
      stars.splice(i, 1);
      continue;
    }
    // Missed star: do not count missed anymore
    if (s.y - s.radius > GAME_HEIGHT) {
      // Do not increment missed
      stars.splice(i, 1);
    }
  }
  // Bubble collision
  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (isColliding(fairy, b)) {
      score++;
      bubbles.splice(i, 1);
      continue;
    }
    // Missed bubble: do not count missed anymore
    if (b.y - b.radius > GAME_HEIGHT) {
      // Do not increment missed
      bubbles.splice(i, 1);
    }
  }
}

function isColliding(fairy, obj) {
  // Simple circle-rectangle collision
  let distX = Math.abs(obj.x - fairy.x);
  let distY = Math.abs(obj.y - fairy.y);
  if (distX > (fairy.width / 2 + obj.radius)) return false;
  if (distY > (fairy.height / 2 + obj.radius)) return false;
  if (distX <= (fairy.width / 2)) return true;
  if (distY <= (fairy.height / 2)) return true;
  let dx = distX - fairy.width / 2;
  let dy = distY - fairy.height / 2;
  return (dx * dx + dy * dy <= obj.radius * obj.radius);
}

function updateScore() {
  scoreDiv.textContent = `Score: ${score}`;
  missedDiv.textContent = `Missed: ${missed}`;
}

let starTimer = 0;
let bubbleTimer = 0;

function gameLoop() {
  clearCanvas();
  drawFairy();
  // Draw and move objects
  for (let s of stars) drawFallingStar(s);
  for (let b of bubbles) drawBubble(b);
  moveFairy();
  moveObjects();
  checkCollisions();
  updateScore();
  // Spawn new objects
  starTimer++;
  bubbleTimer++;
  if (starTimer > 50) { // ~every 0.8s
    spawnStar();
    starTimer = 0;
  }
  if (bubbleTimer > 90) { // ~every 1.5s
    spawnBubble();
    bubbleTimer = 0;
  }
  // Win condition
  if (score >= winScore) {
    endGame(true);
    return;
  }
  // Lose condition: missed too many (never happens now)
  if (missed >= maxMissed) {
    endGame(false);
    return;
  }
  if (gameActive) {
    animationId = requestAnimationFrame(gameLoop);
  }
}

function startGame() {
  // Reset all
  stars = [];
  bubbles = [];
  score = 0;
  missed = 0;
  fairy.x = GAME_WIDTH / 2;
  fairy.y = GAME_HEIGHT - 60;
  fairy.dx = 0;
  gameActive = true;
  gameOver = false;
  starTimer = 0;
  bubbleTimer = 30;
  messageDiv.textContent = '';
  updateScore();
  startBtn.style.display = 'none';
  gameLoop();
}

function endGame(win) {
  gameActive = false;
  gameOver = true;
  cancelAnimationFrame(animationId);
  if (win) {
    messageDiv.textContent = 'You Win! The fairy is happy! ✨';
  } else {
    messageDiv.textContent = 'Oh no! You missed too many! Try again!';
  }
  startBtn.textContent = 'Restart';
  startBtn.style.display = 'inline-block';
}

// Controls
window.addEventListener('keydown', function(e) {
  if (!gameActive) return;
  if (e.key === 'ArrowLeft') fairy.dx = -fairy.speed;
  if (e.key === 'ArrowRight') fairy.dx = fairy.speed;
});
window.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') fairy.dx = 0;
});

startBtn.addEventListener('click', startGame);

// Draw initial fairy
clearCanvas();
drawFairy();
missedDiv.textContent = 'Missed: 0';
