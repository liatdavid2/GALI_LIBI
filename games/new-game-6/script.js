// Cat Chases Mouse Game
// Player: Cat (images/player.png)
// Enemy: Mouse (images/enemy.png)

const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');

const gameWidth = gameContainer.clientWidth;
const gameHeight = gameContainer.clientHeight;
const playerSize = 60; // width and height
const enemySize = 60;

let score = 0;
let gameRunning = false;
let enemySpeed = 2; // pixels per frame
let animationFrameId = null;

// Positions
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 0, y: 0 };

// Movement directions for enemy
let enemyDirection = { x: 1, y: 1 };

function resetPositions() {
    // Player starts at bottom-left corner
    playerPos.x = 20;
    playerPos.y = gameHeight - playerSize - 20;
    updateElementPosition(player, playerPos);

    // Enemy starts at top-right corner
    enemyPos.x = gameWidth - enemySize - 20;
    enemyPos.y = 20;
    updateElementPosition(enemy, enemyPos);
}

function updateElementPosition(element, pos) {
    element.style.left = pos.x + 'px';
    element.style.top = pos.y + 'px';
}

function updateScore() {
    scoreDisplay.textContent = 'Score: ' + score;
}

function showMessage(text) {
    messageDisplay.textContent = text;
}

function clearMessage() {
    messageDisplay.textContent = '';
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Move player with arrow keys
function onKeyDown(event) {
    if (!gameRunning) return;

    const step = 15;
    switch (event.key) {
        case 'ArrowUp':
            playerPos.y -= step;
            break;
        case 'ArrowDown':
            playerPos.y += step;
            break;
        case 'ArrowLeft':
            playerPos.x -= step;
            break;
        case 'ArrowRight':
            playerPos.x += step;
            break;
    }

    // Keep player inside the game area
    playerPos.x = clamp(playerPos.x, 0, gameWidth - playerSize);
    playerPos.y = clamp(playerPos.y, 0, gameHeight - playerSize);

    updateElementPosition(player, playerPos);
}

// Enemy chases player
function moveEnemy() {
    // Calculate vector from enemy to player
    let dx = playerPos.x - enemyPos.x;
    let dy = playerPos.y - enemyPos.y;

    // Calculate distance
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 1) return; // Already on player

    // Normalize vector
    let nx = dx / distance;
    let ny = dy / distance;

    // Move enemy towards player
    enemyPos.x += nx * enemySpeed;
    enemyPos.y += ny * enemySpeed;

    // Clamp enemy inside game area
    enemyPos.x = clamp(enemyPos.x, 0, gameWidth - enemySize);
    enemyPos.y = clamp(enemyPos.y, 0, gameHeight - enemySize);

    updateElementPosition(enemy, enemyPos);
}

function checkCollision() {
    // Simple AABB collision
    if (playerPos.x < enemyPos.x + enemySize &&
        playerPos.x + playerSize > enemyPos.x &&
        playerPos.y < enemyPos.y + enemySize &&
        playerPos.y + playerSize > enemyPos.y) {
        return true;
    }
    return false;
}

function gameLoop() {
    if (!gameRunning) return;

    moveEnemy();

    if (checkCollision()) {
        // Player caught by enemy - lose
        gameOver(false);
        return;
    }

    // Increase score over time
    score += 1;
    updateScore();

    // Win condition: survive 60 seconds (score >= 600)
    if (score >= 600) {
        gameOver(true);
        return;
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver(won) {
    gameRunning = false;
    clearMessage();
    if (won) {
        showMessage('You Win! 🎉');
    } else {
        showMessage('You Lose! 😿');
    }
    startButton.textContent = 'Restart Game';
    startButton.disabled = false;
}

function startGame() {
    score = 0;
    updateScore();
    clearMessage();
    resetPositions();
    gameRunning = true;
    startButton.disabled = true;

    // Start game loop
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

startButton.addEventListener('click', startGame);
document.addEventListener('keydown', onKeyDown);