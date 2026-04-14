// Spaceship Escape - simple child-friendly game
// Player controls a spaceship to avoid falling asteroids

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-button');
const messageDisplay = document.getElementById('message');

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Spaceship properties
const shipWidth = 40;
const shipHeight = 60;
const shipSpeed = 5;

// Asteroid properties
const asteroidMinRadius = 10;
const asteroidMaxRadius = 25;
const asteroidSpeedMin = 2;
const asteroidSpeedMax = 5;
const maxAsteroids = 6;

let shipX;
let shipY;
let leftPressed = false;
let rightPressed = false;
let asteroids = [];
let score = 0;
let gameRunning = false;
let animationId;

// Initialize spaceship position
function resetShip() {
    shipX = (canvasWidth - shipWidth) / 2;
    shipY = canvasHeight - shipHeight - 10;
}

// Asteroid class
class Asteroid {
    constructor() {
        this.radius = randomRange(asteroidMinRadius, asteroidMaxRadius);
        this.x = randomRange(this.radius, canvasWidth - this.radius);
        this.y = -this.radius - randomRange(0, 300); // start above screen
        this.speed = randomRange(asteroidSpeedMin, asteroidSpeedMax);
    }

    update() {
        this.y += this.speed;
        if (this.y - this.radius > canvasHeight) {
            // Respawn asteroid above
            this.radius = randomRange(asteroidMinRadius, asteroidMaxRadius);
            this.x = randomRange(this.radius, canvasWidth - this.radius);
            this.y = -this.radius;
            this.speed = randomRange(asteroidSpeedMin, asteroidSpeedMax);
            score += 1; // Increase score for each avoided asteroid
            updateScore();
        }
    }

    draw() {
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        // Simple craters
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 4, this.radius / 4, 0, Math.PI * 2);
        ctx.arc(this.x + this.radius / 4, this.y + this.radius / 5, this.radius / 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw spaceship as a simple triangle
function drawShip() {
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.moveTo(shipX + shipWidth / 2, shipY); // top point
    ctx.lineTo(shipX, shipY + shipHeight); // bottom left
    ctx.lineTo(shipX + shipWidth, shipY + shipHeight); // bottom right
    ctx.closePath();
    ctx.fill();

    // Windows
    ctx.fillStyle = '#4ff';
    ctx.beginPath();
    ctx.arc(shipX + shipWidth / 2, shipY + shipHeight / 3, shipWidth / 8, 0, Math.PI * 2);
    ctx.fill();
}

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
}

// Handle keyboard input
function keyDownHandler(e) {
    if (!gameRunning) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = true;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = true;
    }
}

function keyUpHandler(e) {
    if (!gameRunning) return;
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        leftPressed = false;
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        rightPressed = false;
    }
}

// Check collision between ship and asteroid (circle-rectangle collision)
function checkCollision(asteroid) {
    // Find closest point on rectangle to circle center
    const closestX = clamp(asteroid.x, shipX, shipX + shipWidth);
    const closestY = clamp(asteroid.y, shipY, shipY + shipHeight);

    const dx = asteroid.x - closestX;
    const dy = asteroid.y - closestY;

    return (dx * dx + dy * dy) < (asteroid.radius * asteroid.radius);
}

// Clamp helper
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Random number helper
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Game loop
function gameLoop() {
    clearCanvas();

    // Move ship
    if (leftPressed) {
        shipX -= shipSpeed;
        if (shipX < 0) shipX = 0;
    }
    if (rightPressed) {
        shipX += shipSpeed;
        if (shipX + shipWidth > canvasWidth) shipX = canvasWidth - shipWidth;
    }

    drawShip();

    // Update and draw asteroids
    for (let asteroid of asteroids) {
        asteroid.update();
        asteroid.draw();

        if (checkCollision(asteroid)) {
            endGame(false);
            return;
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

// Start or restart the game
function startGame() {
    score = 0;
    updateScore();
    messageDisplay.textContent = '';
    resetShip();
    asteroids = [];

    // Create initial asteroids
    for (let i = 0; i < maxAsteroids; i++) {
        let asteroid = new Asteroid();
        // Spread asteroids vertically
        asteroid.y = -randomRange(50, 600);
        asteroids.push(asteroid);
    }

    gameRunning = true;
    startButton.disabled = true;
    animationId = requestAnimationFrame(gameLoop);
}

// End the game with win or lose
function endGame(won) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    startButton.disabled = false;
    if (won) {
        messageDisplay.textContent = 'You Win!';
        messageDisplay.style.color = '#0f0';
    } else {
        messageDisplay.textContent = 'Game Over!';
        messageDisplay.style.color = '#f44';
    }
}

// Event listeners
startButton.addEventListener('click', startGame);
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// For this simple game, no win condition other than avoiding asteroids as long as possible
// But we can add a simple time-based win condition (e.g. survive 60 seconds)

let survivalTime = 60; // seconds
let survivalTimerId = null;

function startSurvivalTimer() {
    let timeLeft = survivalTime;
    survivalTimerId = setInterval(() => {
        if (!gameRunning) {
            clearInterval(survivalTimerId);
            return;
        }
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(survivalTimerId);
            endGame(true);
        }
    }, 1000);
}

// Modify startGame to start survival timer
const originalStartGame = startGame;
startGame = function() {
    originalStartGame();
    if (survivalTimerId) clearInterval(survivalTimerId);
    startSurvivalTimer();
};