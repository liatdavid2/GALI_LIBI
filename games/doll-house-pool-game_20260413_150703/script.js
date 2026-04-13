// Doll House Pool Game script

const pool = document.getElementById('pool');
const scoreSpan = document.getElementById('score');
const messageDiv = document.getElementById('message');
const startButton = document.getElementById('start-button');

let score = 0;
let balls = [];
let gameDuration = 20000; // 20 seconds
let ballAppearInterval = 1000; // every 1 second a ball appears
let gameTimer = null;
let ballTimer = null;
let gameRunning = false;

// Clear all balls from the pool
function clearBalls() {
    balls.forEach(ball => {
        ball.removeEventListener('click', onBallClick);
        pool.removeChild(ball);
    });
    balls = [];
}

// Create a ball at random position inside the pool
function createBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');

    // Calculate random position inside pool boundaries
    const poolRect = pool.getBoundingClientRect();
    // pool width and height in px
    const poolWidth = pool.clientWidth;
    const poolHeight = pool.clientHeight;

    // ball size is 30px
    const maxX = poolWidth - 30;
    const maxY = poolHeight - 30;

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    ball.style.left = x + 'px';
    ball.style.top = y + 'px';

    ball.addEventListener('click', onBallClick);

    pool.appendChild(ball);
    balls.push(ball);
}

// When a ball is clicked
function onBallClick(event) {
    if (!gameRunning) return;

    const ball = event.target;
    // Remove ball
    ball.removeEventListener('click', onBallClick);
    pool.removeChild(ball);
    balls = balls.filter(b => b !== ball);

    // Increase score
    score += 1;
    scoreSpan.textContent = score;

    // Check if player wins (e.g. 10 balls caught)
    if (score >= 10) {
        endGame(true);
    }
}

// Start the game
function startGame() {
    score = 0;
    scoreSpan.textContent = score;
    messageDiv.textContent = '';
    clearBalls();
    gameRunning = true;
    startButton.disabled = true;

    // Create balls repeatedly
    ballTimer = setInterval(() => {
        if (balls.length < 5) { // max 5 balls at once
            createBall();
        }
    }, ballAppearInterval);

    // End game after duration
    gameTimer = setTimeout(() => {
        endGame(false);
    }, gameDuration);
}

// End the game
function endGame(won) {
    gameRunning = false;
    clearInterval(ballTimer);
    clearTimeout(gameTimer);
    clearBalls();
    startButton.disabled = false;

    if (won) {
        messageDiv.textContent = 'You Win! Great job!';
        messageDiv.style.color = '#2a7f2a';
    } else {
        messageDiv.textContent = 'Time is up! Try again!';
        messageDiv.style.color = '#b33a3a';
    }
}

startButton.addEventListener('click', startGame);
