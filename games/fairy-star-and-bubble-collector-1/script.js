// Fairy Star and Bubble Collector Game Script

const gameArea = document.getElementById('gameArea');
const fairy = document.getElementById('fairy');
const star = document.getElementById('star');
const bubble = document.getElementById('bubble');
const scoreSpan = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const messageDiv = document.getElementById('message');

const gameWidth = 400;
const gameHeight = 400;
const fairySize = 40;
const collectibleSize = 30;

let score = 0;
let gameRunning = false;
let moveSpeed = 10; // pixels per key press

// Position objects
function setPosition(element, x, y) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

// Generate random position inside game area for collectibles
function randomPosition() {
    const x = Math.floor(Math.random() * (gameWidth - collectibleSize));
    const y = Math.floor(Math.random() * (gameHeight - collectibleSize));
    return { x, y };
}

// Check collision between fairy and collectible
function isColliding(fairyX, fairyY, objX, objY) {
    // Simple box collision
    return !(
        fairyX + fairySize < objX ||
        fairyX > objX + collectibleSize ||
        fairyY + fairySize < objY ||
        fairyY > objY + collectibleSize
    );
}

// Update positions of star and bubble randomly every 3 seconds
let collectibleMoveInterval;
function moveCollectiblesRandomly() {
    if (!gameRunning) return;
    const starPos = randomPosition();
    setPosition(star, starPos.x, starPos.y);

    const bubblePos = randomPosition();
    // Ensure bubble and star do not overlap
    if (isColliding(starPos.x, starPos.y, bubblePos.x, bubblePos.y)) {
        // Move bubble again
        const newBubblePos = randomPosition();
        setPosition(bubble, newBubblePos.x, newBubblePos.y);
    } else {
        setPosition(bubble, bubblePos.x, bubblePos.y);
    }
}

// Initialize game
function startGame() {
    score = 0;
    scoreSpan.textContent = score;
    messageDiv.textContent = '';
    gameRunning = true;

    // Place fairy in center
    setPosition(fairy, (gameWidth - fairySize) / 2, (gameHeight - fairySize) / 2);

    // Place collectibles randomly
    moveCollectiblesRandomly();

    // Start moving collectibles every 3 seconds
    collectibleMoveInterval = setInterval(moveCollectiblesRandomly, 3000);

    startBtn.disabled = true;
}

// End game with message
function endGame(win) {
    gameRunning = false;
    clearInterval(collectibleMoveInterval);
    messageDiv.textContent = win ? 'You Win! 🎉' : 'Game Over! 😢';
    startBtn.disabled = false;
}

// Handle keyboard controls for fairy
window.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    const fairyX = parseInt(fairy.style.left) || (gameWidth - fairySize) / 2;
    const fairyY = parseInt(fairy.style.top) || (gameHeight - fairySize) / 2;

    let newX = fairyX;
    let newY = fairyY;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newY = Math.max(0, fairyY - moveSpeed);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newY = Math.min(gameHeight - fairySize, fairyY + moveSpeed);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newX = Math.max(0, fairyX - moveSpeed);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newX = Math.min(gameWidth - fairySize, fairyX + moveSpeed);
            break;
        default:
            return; // Ignore other keys
    }

    setPosition(fairy, newX, newY);

    // Check for collisions with star
    const starX = parseInt(star.style.left);
    const starY = parseInt(star.style.top);
    if (isColliding(newX, newY, starX, starY)) {
        score += 1;
        scoreSpan.textContent = score;
        moveCollectiblesRandomly();
    }

    // Check for collisions with bubble
    const bubbleX = parseInt(bubble.style.left);
    const bubbleY = parseInt(bubble.style.top);
    if (isColliding(newX, newY, bubbleX, bubbleY)) {
        // Lose condition
        endGame(false);
    }

    // Win condition: collect 5 stars
    if (score >= 5) {
        endGame(true);
    }
});

startBtn.addEventListener('click', () => {
    startGame();
});