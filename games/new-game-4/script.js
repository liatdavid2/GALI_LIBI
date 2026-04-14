// Diamond Collector Game Script

// Select DOM elements
const player = document.getElementById('player');
const collectible = document.getElementById('collectible');
const enemy = document.getElementById('enemy');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');

// Game constants
const gameWidth = 400;
const gameHeight = 400;
const playerSize = 40;
const collectibleSize = 40;
const enemySize = 40;
const maxScore = 5; // Win after collecting 5 diamonds
const enemySpeed = 2; // pixels per frame

// Game state
let score = 0;
let gameRunning = false;
let keysPressed = {};
let enemyDirection = 1; // 1 = moving right, -1 = moving left

// Positions
let playerPos = { x: 180, y: 180 };
let collectiblePos = { x: 0, y: 0 };
let enemyPos = { x: 0, y: 0 };

// Helper function to get random position inside game area
function getRandomPosition(size) {
    const x = Math.floor(Math.random() * (gameWidth - size));
    const y = Math.floor(Math.random() * (gameHeight - size));
    return { x, y };
}

// Place collectible at random position
function placeCollectible() {
    collectiblePos = getRandomPosition(collectibleSize);
    collectible.style.left = collectiblePos.x + 'px';
    collectible.style.top = collectiblePos.y + 'px';
}

// Place enemy at random vertical position, start at left edge
function placeEnemy() {
    const y = Math.floor(Math.random() * (gameHeight - enemySize));
    enemyPos = { x: 0, y };
    enemy.style.left = enemyPos.x + 'px';
    enemy.style.top = enemyPos.y + 'px';
    enemyDirection = 1;
}

// Update player position in DOM
function updatePlayerPosition() {
    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';
}

// Check collision between two rectangles
function isColliding(pos1, size1, pos2, size2) {
    return !(
        pos1.x + size1 < pos2.x ||
        pos1.x > pos2.x + size2 ||
        pos1.y + size1 < pos2.y ||
        pos1.y > pos2.y + size2
    );
}

// Reset game state
function resetGame() {
    score = 0;
    scoreDisplay.textContent = 'Score: ' + score;
    messageDisplay.textContent = '';
    playerPos = { x: 180, y: 180 };
    updatePlayerPosition();
    placeCollectible();
    placeEnemy();
    gameRunning = true;
    startBtn.textContent = 'Restart Game';
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    // Move player based on keys pressed
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
        playerPos.y -= 5;
        if (playerPos.y < 0) playerPos.y = 0;
    }
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
        playerPos.y += 5;
        if (playerPos.y > gameHeight - playerSize) playerPos.y = gameHeight - playerSize;
    }
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        playerPos.x -= 5;
        if (playerPos.x < 0) playerPos.x = 0;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        playerPos.x += 5;
        if (playerPos.x > gameWidth - playerSize) playerPos.x = gameWidth - playerSize;
    }

    updatePlayerPosition();

    // Move enemy horizontally
    enemyPos.x += enemySpeed * enemyDirection;
    if (enemyPos.x <= 0) {
        enemyDirection = 1;
    } else if (enemyPos.x >= gameWidth - enemySize) {
        enemyDirection = -1;
    }
    enemy.style.left = enemyPos.x + 'px';

    // Check collisions
    if (isColliding(playerPos, playerSize, collectiblePos, collectibleSize)) {
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        placeCollectible();
        // Optional: move enemy to new random vertical position when collectible collected
        const newEnemyY = Math.floor(Math.random() * (gameHeight - enemySize));
        enemyPos.y = newEnemyY;
        enemy.style.top = enemyPos.y + 'px';
    }

    if (isColliding(playerPos, playerSize, enemyPos, enemySize)) {
        // Player hit enemy - lose
        gameRunning = false;
        messageDisplay.style.color = 'red';
        messageDisplay.textContent = 'You Lose! Try Again.';
    }

    if (score >= maxScore) {
        // Player wins
        gameRunning = false;
        messageDisplay.style.color = 'green';
        messageDisplay.textContent = 'You Win! Congratulations!';
    }

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Event listeners for controls
window.addEventListener('keydown', e => {
    if (!gameRunning) return;
    keysPressed[e.key] = true;
});

window.addEventListener('keyup', e => {
    keysPressed[e.key] = false;
});

// Start button
startBtn.addEventListener('click', () => {
    resetGame();
    requestAnimationFrame(gameLoop);
});