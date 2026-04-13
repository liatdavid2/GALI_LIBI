// Fairy Star Collector Game with bubbles and stars

const player = document.getElementById('player');
const bubble = document.getElementById('bubble');
const scoreSpan = document.getElementById('score');
const messageDiv = document.getElementById('message');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');

const gameWidth = 400;
const gameHeight = 300;
const playerWidth = 50;
const playerHeight = 50;
const bubbleSize = 30;

let score = 0;
let gameInterval = null;
let bubbleSpeed = 3;
let isGameRunning = false;

// Player horizontal position
let playerX = (gameWidth - playerWidth) / 2;
// Bubble position
let bubbleX = Math.floor(Math.random() * (gameWidth - bubbleSize));
let bubbleY = 0;

// Create background stars for twinkling effect
const starCount = 20;
const stars = [];

function createStars() {
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.top = Math.random() * (gameHeight - 10) + 'px';
    star.style.left = Math.random() * (gameWidth - 10) + 'px';
    star.style.animationDelay = (Math.random() * 3) + 's';
    star.style.fontSize = (8 + Math.random() * 8) + 'px';
    star.textContent = '\u2729'; // sparkle star
    gameContainer.appendChild(star);
    stars.push(star);
  }
}

createStars();

// Move player left or right within boundaries
function movePlayer(direction) {
  if (!isGameRunning) return;
  if (direction === 'left') {
    playerX = Math.max(0, playerX - 20);
  } else if (direction === 'right') {
    playerX = Math.min(gameWidth - playerWidth, playerX + 20);
  }
  player.style.left = playerX + 'px';
}

// Reset bubble to top with random horizontal position
function resetBubble() {
  bubbleX = Math.floor(Math.random() * (gameWidth - bubbleSize));
  bubbleY = 0;
  bubble.style.left = bubbleX + 'px';
  bubble.style.top = bubbleY + 'px';
}

// Check collision between two rectangles
function isColliding(rect1, rect2) {
  return !(
    rect1.x > rect2.x + rect2.width ||
    rect1.x + rect1.width < rect2.x ||
    rect1.y > rect2.y + rect2.height ||
    rect1.y + rect1.height < rect2.y
  );
}

// Update game frame
function updateGame() {
  // Move bubble down
  bubbleY += bubbleSpeed;
  if (bubbleY > gameHeight) {
    // Missed bubble, reset
    resetBubble();
  }
  bubble.style.top = bubbleY + 'px';

  // Player rectangle
  const playerRect = { x: playerX, y: gameHeight - playerHeight - 10, width: playerWidth, height: playerHeight };
  // Bubble rectangle
  const bubbleRect = { x: bubbleX, y: bubbleY, width: bubbleSize, height: bubbleSize };

  // Check collision with bubble
  if (isColliding(playerRect, bubbleRect)) {
    score += 1;
    scoreSpan.textContent = score;
    messageDiv.textContent = 'Great catch! 389';
    resetBubble();
    // Increase speed every 3 points
    if (score % 3 === 0) {
      bubbleSpeed += 0.5;
    }
    if (score >= 15) {
      endGame(true);
    }
  }
}

// Start or restart the game
function startGame() {
  score = 0;
  scoreSpan.textContent = score;
  messageDiv.textContent = '';
  isGameRunning = true;
  bubbleSpeed = 3;
  playerX = (gameWidth - playerWidth) / 2;
  player.style.left = playerX + 'px';
  resetBubble();
  startButton.disabled = true;
  startButton.textContent = 'Game Running...';

  if (gameInterval) {
    clearInterval(gameInterval);
  }
  gameInterval = setInterval(updateGame, 30);
}

// End game with win or lose
function endGame(won) {
  isGameRunning = false;
  clearInterval(gameInterval);
  if (won) {
    messageDiv.textContent = 'You won! You caught 15 star bubbles! 38A';
  } else {
    messageDiv.textContent = 'Game over!';
  }
  startButton.disabled = false;
  startButton.textContent = 'Restart Game';
}

// Keyboard controls for player
window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    movePlayer('left');
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    movePlayer('right');
  }
});

// Button click to start/restart
startButton.addEventListener('click', () => {
  startGame();
});

// Initialize player position
player.style.left = playerX + 'px';
player.style.bottom = '10px';
