// Fairy Star Collector Game

const fairy = document.getElementById('fairy');
const star = document.getElementById('star');
const cloud = document.getElementById('cloud');
const scoreSpan = document.getElementById('score');
const livesSpan = document.getElementById('lives');
const messageDiv = document.getElementById('message');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');

const gameWidth = 400;
const gameHeight = 300;
const fairyWidth = 40;
const fairyHeight = 40;
const starSize = 30;
const cloudWidth = 60;
const cloudHeight = 40;

let score = 0;
let lives = 3;
let gameInterval = null;
let cloudSpeed = 2;
let starSpeed = 3; // increased initial star speed
let isGameRunning = false;

// Positions
let fairyX = 180; // initial horizontal position
let starX = 50;
let starY = 20;
let cloudX = 300;
let cloudY = 50;

// Move fairy left or right within boundaries
function moveFairy(direction) {
  if (!isGameRunning) return;
  if (direction === 'left') {
    fairyX = Math.max(0, fairyX - 20);
  } else if (direction === 'right') {
    fairyX = Math.min(gameWidth - fairyWidth, fairyX + 20);
  }
  fairy.style.left = fairyX + 'px';
}

// Random position helper
function randomPosition(maxX, maxY) {
  return {
    x: Math.floor(Math.random() * maxX),
    y: Math.floor(Math.random() * maxY),
  };
}

// Reset star to a random top position and left at right edge
function resetStar() {
  starX = gameWidth;
  starY = Math.floor(Math.random() * (gameHeight - starSize));
  star.style.left = starX + 'px';
  star.style.top = starY + 'px';
}

// Reset cloud to a random top position and left at right edge
function resetCloud() {
  cloudX = gameWidth;
  cloudY = Math.floor(Math.random() * (gameHeight - cloudHeight));
  cloud.style.left = cloudX + 'px';
  cloud.style.top = cloudY + 'px';
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
  // Move star left
  starX -= starSpeed;
  if (starX + starSize < 0) {
    resetStar();
  }
  star.style.left = starX + 'px';

  // Move cloud left
  cloudX -= cloudSpeed;
  if (cloudX + cloudWidth < 0) {
    resetCloud();
  }
  cloud.style.left = cloudX + 'px';
  cloud.style.top = cloudY + 'px';

  // Fairy rectangle
  const fairyRect = { x: fairyX, y: gameHeight - fairyHeight - 10, width: fairyWidth, height: fairyHeight };

  // Star rectangle
  const starRect = { x: starX, y: starY, width: starSize, height: starSize };

  // Cloud rectangle
  const cloudRect = { x: cloudX, y: cloudY, width: cloudWidth, height: cloudHeight };

  // Check collision with star
  if (isColliding(fairyRect, starRect)) {
    score += 1;
    scoreSpan.textContent = score;
    resetStar();
    // Increase speed slightly every 5 points
    if (score % 5 === 0) {
      cloudSpeed += 0.5;
      starSpeed += 0.3;
    }
    if (score >= 10) {
      endGame(true);
    }
  }

  // Check collision with cloud
  if (isColliding(fairyRect, cloudRect)) {
    lives -= 1;
    livesSpan.textContent = lives;
    if (lives <= 0) {
      endGame(false);
    } else {
      messageDiv.textContent = `Ouch! The fairy hit a cloud! Lives left: ${lives}`;
      resetCloud();
    }
  }
}

// Start or restart the game
function startGame() {
  score = 0;
  lives = 3;
  scoreSpan.textContent = score;
  livesSpan.textContent = lives;
  messageDiv.textContent = '';
  isGameRunning = true;
  cloudSpeed = 2;
  starSpeed = 3; // faster initial speed
  fairyX = 180;
  fairy.style.left = fairyX + 'px';
  resetStar();
  resetCloud();
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
    messageDiv.textContent = 'You won! The fairy collected 10 stars! 🌟';
  } else {
    messageDiv.textContent = 'Oh no! The fairy lost all lives! Game over. ☁️';
  }
  startButton.disabled = false;
  startButton.textContent = 'Restart Game';
}

// Keyboard controls for fairy
window.addEventListener('keydown', (e) => {
  if (!isGameRunning) return;
  if (e.key === 'ArrowLeft' || e.key === 'a') {
    moveFairy('left');
  } else if (e.key === 'ArrowRight' || e.key === 'd') {
    moveFairy('right');
  }
});

// Button click to start/restart
startButton.addEventListener('click', () => {
  startGame();
});

// Initialize fairy position
fairy.style.left = fairyX + 'px';
fairy.style.bottom = '10px';
