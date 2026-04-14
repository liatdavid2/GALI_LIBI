// Cat and Dog Chase Game

// Get references to DOM elements
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const collectible = document.getElementById('collectible');
const scoreSpan = document.getElementById('score');
const messageDiv = document.getElementById('message');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');

// Game settings
const gameWidth = 600;
const gameHeight = 400;
const playerSpeed = 10; // pixels per key press
const enemySpeed = 2; // pixels per frame
const collectibleSize = 50;
const playerSize = 50;
const enemySize = 50;
const maxScore = 5; // Score needed to win

// Game state
let score = 0;
let gameRunning = false;
let keysPressed = {};
let enemyDirection = { x: 1, y: 1 };

// Positions
let playerPos = { x: 0, y: 0 };
let enemyPos = { x: 0, y: 0 };
let collectiblePos = { x: 0, y: 0 };

// Initialize positions
function resetPositions() {
    // Place player at bottom-left
    playerPos.x = 10;
    playerPos.y = gameHeight - playerSize - 10;
    updateElementPosition(player, playerPos);

    // Place enemy at top-right
    enemyPos.x = gameWidth - enemySize - 10;
    enemyPos.y = 10;
    updateElementPosition(enemy, enemyPos);

    // Place collectible randomly
    placeCollectible();
}

// Update element position on screen
function updateElementPosition(element, pos) {
    element.style.left = pos.x + 'px';
    element.style.top = pos.y + 'px';
}

// Place collectible at a random position within game bounds
function placeCollectible() {
    const padding = 10;
    collectiblePos.x = Math.floor(Math.random() * (gameWidth - collectibleSize - 2 * padding)) + padding;
    collectiblePos.y = Math.floor(Math.random() * (gameHeight - collectibleSize - 2 * padding)) + padding;
    updateElementPosition(collectible, collectiblePos);
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

// Handle player movement based on keys pressed
function movePlayer() {
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
        playerPos.y -= playerSpeed;
    }
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
        playerPos.y += playerSpeed;
    }
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        playerPos.x -= playerSpeed;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        playerPos.x += playerSpeed;
    }
    // Keep player inside game bounds
    playerPos.x = Math.max(0, Math.min(gameWidth - playerSize, playerPos.x));
    playerPos.y = Math.max(0, Math.min(gameHeight - playerSize, playerPos.y));
    updateElementPosition(player, playerPos);
}

// Move enemy towards player
function moveEnemy() {
    // Calculate direction vector from enemy to player
    const dx = playerPos.x - enemyPos.x;
    const dy = playerPos.y - enemyPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return;

    // Normalize and move enemy
    const moveX = (dx / distance) * enemySpeed;
    const moveY = (dy / distance) * enemySpeed;

    enemyPos.x += moveX;
    enemyPos.y += moveY;

    // Keep enemy inside bounds
    enemyPos.x = Math.max(0, Math.min(gameWidth - enemySize, enemyPos.x));
    enemyPos.y = Math.max(0, Math.min(gameHeight - enemySize, enemyPos.y));

    updateElementPosition(enemy, enemyPos);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    movePlayer();
    moveEnemy();

    // Check collision: player and collectible
    if (isColliding(playerPos, playerSize, collectiblePos, collectibleSize)) {
        score++;
        scoreSpan.textContent = score;
        placeCollectible();
    }

    // Check collision: player and enemy
    if (isColliding(playerPos, playerSize, enemyPos, enemySize)) {
        endGame(false);
        return;
    }

    // Check win condition
    if (score >= maxScore) {
        endGame(true);
        return;
    }

    requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    score = 0;
    scoreSpan.textContent = score;
    messageDiv.style.display = 'none';
    startButton.style.display = 'none';
    gameRunning = true;
    resetPositions();
    requestAnimationFrame(gameLoop);
}

// End the game with win or lose
function endGame(won) {
    gameRunning = false;
    messageDiv.textContent = won ? 'You Win! 🎉' : 'You Lose! 😿';
    messageDiv.style.display = 'block';
    startButton.textContent = 'Restart Game';
    startButton.style.display = 'block';
}

// Event listeners for keyboard input
window.addEventListener('keydown', (e) => {
    keysPressed[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keysPressed[e.key] = false;
});

// Start button click
startButton.addEventListener('click', () => {
    startGame();
});

// Initialize game elements positions for initial display
resetPositions();
