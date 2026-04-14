// Cat and Milk Game Script

const gameContainer = document.getElementById('game-container');
const cat = document.getElementById('cat');
const milk = document.getElementById('milk');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('start-btn');
const message = document.getElementById('message');

let score = 0;
let gameActive = false;
const gameWidth = gameContainer.clientWidth;
const gameHeight = gameContainer.clientHeight;
const catSize = 60;
const milkWidth = 40;
const milkHeight = 50;
const maxScore = 5; // Win after 5 milk catches

// Place milk at random position inside the game area
function placeMilkRandom() {
    const x = Math.floor(Math.random() * (gameWidth - milkWidth));
    const y = Math.floor(Math.random() * (gameHeight - milkHeight));
    milk.style.left = x + 'px';
    milk.style.top = y + 'px';
}

// Place cat at center initially
function placeCatCenter() {
    const x = (gameWidth - catSize) / 2;
    const y = (gameHeight - catSize) / 2;
    cat.style.left = x + 'px';
    cat.style.top = y + 'px';
}

// Check if cat and milk overlap (collision detection)
function isCatOnMilk() {
    const catRect = cat.getBoundingClientRect();
    const milkRect = milk.getBoundingClientRect();

    // Because getBoundingClientRect returns absolute positions, we adjust relative to viewport
    // Instead, compare relative positions inside game container

    const catX = parseInt(cat.style.left, 10);
    const catY = parseInt(cat.style.top, 10);
    const milkX = parseInt(milk.style.left, 10);
    const milkY = parseInt(milk.style.top, 10);

    return !(catX + catSize < milkX ||
             catX > milkX + milkWidth ||
             catY + catSize < milkY ||
             catY > milkY + milkHeight);
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
}

// Show message
function showMessage(text) {
    message.textContent = text;
}

// Reset game state
function resetGame() {
    score = 0;
    updateScore();
    showMessage('');
    placeCatCenter();
    placeMilkRandom();
    gameActive = true;
    startBtn.textContent = 'Restart Game';
}

// Move cat with arrow keys
function handleKeyDown(event) {
    if (!gameActive) return;

    const step = 20; // pixels per key press
    let x = parseInt(cat.style.left, 10);
    let y = parseInt(cat.style.top, 10);

    switch(event.key) {
        case 'ArrowUp':
            y = Math.max(0, y - step);
            break;
        case 'ArrowDown':
            y = Math.min(gameHeight - catSize, y + step);
            break;
        case 'ArrowLeft':
            x = Math.max(0, x - step);
            break;
        case 'ArrowRight':
            x = Math.min(gameWidth - catSize, x + step);
            break;
        default:
            return; // ignore other keys
    }

    cat.style.left = x + 'px';
    cat.style.top = y + 'px';

    // Check if cat caught the milk
    if (isCatOnMilk()) {
        score++;
        updateScore();

        if (score >= maxScore) {
            showMessage('You win! The cat drank all the milk!');
            gameActive = false;
        } else {
            showMessage('Yummy! Milk caught!');
            placeMilkRandom();
        }
    } else {
        showMessage('');
    }
}

// Initialize
startBtn.addEventListener('click', () => {
    resetGame();
});

window.addEventListener('keydown', handleKeyDown);

// Initially place cat and milk but game inactive
placeCatCenter();
placeMilkRandom();
