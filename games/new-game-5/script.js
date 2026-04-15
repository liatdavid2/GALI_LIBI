// Monkey Banana Collector Game

const player = document.getElementById('player');
const banana = document.getElementById('banana');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const message = document.getElementById('message');
const gameArea = document.getElementById('game-area');

// Game settings
const gameWidth = 600;
const gameHeight = 400;
const playerWidth = 60;
const bananaWidth = 60;
const bananaHeight = 60;
const maxScore = 10;
const playerSpeed = 15; // pixels per key press

let score = 0;
let gameRunning = false;

// Player position (horizontal only)
let playerX = (gameWidth - playerWidth) / 2;

// Banana position
let bananaX = 0;
let bananaY = 0;

// Update player position on screen
function updatePlayerPosition() {
    // Clamp position inside game area
    if (playerX < 0) playerX = 0;
    if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth;
    player.style.left = playerX + 'px';
}

// Randomly place banana inside game area (top area)
function placeBanana() {
    // Banana can appear anywhere horizontally
    bananaX = Math.floor(Math.random() * (gameWidth - bananaWidth));
    // Banana appears in top half of game area
    bananaY = Math.floor(Math.random() * ((gameHeight / 2) - bananaHeight));
    banana.style.left = bananaX + 'px';
    banana.style.top = bananaY + 'px';
}

// Check collision between player and banana
function checkCollision() {
    const playerRect = player.getBoundingClientRect();
    const bananaRect = banana.getBoundingClientRect();

    // Since gameArea is positioned, getBoundingClientRect returns absolute coords,
    // but both elements share the same offsetParent, so relative positions are comparable.

    // Simple AABB collision
    if (
        playerRect.left < bananaRect.left + bananaRect.width &&
        playerRect.left + playerRect.width > bananaRect.left &&
        playerRect.top < bananaRect.top + bananaRect.height &&
        playerRect.height + playerRect.top > bananaRect.top
    ) {
        return true;
    }
    return false;
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score;
}

// Show message
function showMessage(text, color = '#b22222') {
    message.textContent = text;
    message.style.color = color;
}

// Clear message
function clearMessage() {
    message.textContent = '';
}

// Start or restart game
function startGame() {
    score = 0;
    updateScore();
    clearMessage();
    gameRunning = true;
    playerX = (gameWidth - playerWidth) / 2;
    updatePlayerPosition();
    placeBanana();
    startButton.disabled = true;
    startButton.textContent = 'Playing...';
}

// End game
function endGame(win) {
    gameRunning = false;
    if (win) {
        showMessage('You Win! 🎉', '#2e8b57');
    } else {
        showMessage('Game Over! Try Again!', '#b22222');
    }
    startButton.disabled = false;
    startButton.textContent = 'Restart Game';
}

// Handle player movement
function handleKeyDown(event) {
    if (!gameRunning) return;
    if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
        playerX -= playerSpeed;
        updatePlayerPosition();
    } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
        playerX += playerSpeed;
        updatePlayerPosition();
    }

    // Check if player collected banana
    if (checkCollision()) {
        score++;
        updateScore();
        if (score >= maxScore) {
            endGame(true);
        } else {
            placeBanana();
        }
    }
}

// Initialize
startButton.addEventListener('click', startGame);
document.addEventListener('keydown', handleKeyDown);