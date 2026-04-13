// Fairy Star Collector Game
// Player controls a fairy to collect stars and avoid bubbles

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start-button');
const messageEl = document.getElementById('message');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Fairy properties
const fairy = {
    x: WIDTH / 2,
    y: HEIGHT - 40,
    width: 30,
    height: 30,
    speed: 5
};

let stars = [];
let bubbles = [];
let score = 0;
let gameRunning = false;
let keysPressed = {};
let animationId = null;

// Game settings
const STAR_SIZE = 20;
const BUBBLE_SIZE = 25;
const MAX_STARS = 5;
const MAX_BUBBLES = 3;
const WIN_SCORE = 10;

// Draw fairy as a simple purple winged figure
function drawFairy() {
    ctx.save();
    ctx.translate(fairy.x, fairy.y);

    // Wings
    ctx.fillStyle = 'rgba(200, 162, 255, 0.7)';
    ctx.beginPath();
    ctx.ellipse(-10, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.ellipse(10, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#d8b4ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#b399ff';
    ctx.beginPath();
    ctx.arc(0, -15, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#4b0082';
    ctx.beginPath();
    ctx.arc(-3, -17, 2, 0, Math.PI * 2);
    ctx.arc(3, -17, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

// Draw star as a yellow star shape
function drawStar(x, y) {
    ctx.fillStyle = '#fffacd';
    ctx.strokeStyle = '#fff700';
    ctx.lineWidth = 2;

    ctx.beginPath();
    const spikes = 5;
    const outerRadius = STAR_SIZE / 2;
    const innerRadius = outerRadius / 2.5;
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;
    ctx.moveTo(x, y - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let sx = x + Math.cos(rot) * outerRadius;
        let sy = y + Math.sin(rot) * outerRadius;
        ctx.lineTo(sx, sy);
        rot += step;

        sx = x + Math.cos(rot) * innerRadius;
        sy = y + Math.sin(rot) * innerRadius;
        ctx.lineTo(sx, sy);
        rot += step;
    }
    ctx.lineTo(x, y - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Draw bubble as a translucent circle with highlight
function drawBubble(x, y) {
    const radius = BUBBLE_SIZE / 2;
    const gradient = ctx.createRadialGradient(x - radius / 3, y - radius / 3, radius / 5, x, y, radius);
    gradient.addColorStop(0, 'rgba(173,216,230,0.8)');
    gradient.addColorStop(1, 'rgba(173,216,230,0.2)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - radius / 3, y - radius / 3, radius / 2, 0, Math.PI * 2);
    ctx.stroke();
}

// Create a new star at a random position near the top
function createStar() {
    return {
        x: Math.random() * (WIDTH - STAR_SIZE) + STAR_SIZE / 2,
        y: -STAR_SIZE,
        speed: 2 + Math.random() * 1.5
    };
}

// Create a new bubble at a random position near the top
function createBubble() {
    return {
        x: Math.random() * (WIDTH - BUBBLE_SIZE) + BUBBLE_SIZE / 2,
        y: -BUBBLE_SIZE,
        speed: 1 + Math.random() * 1.5
    };
}

// Update positions of stars and bubbles
function updateObjects() {
    // Move stars down
    stars.forEach(star => {
        star.y += star.speed;
    });
    // Remove stars that fall out of screen
    stars = stars.filter(star => star.y < HEIGHT + STAR_SIZE);

    // Move bubbles down
    bubbles.forEach(bubble => {
        bubble.y += bubble.speed;
    });
    // Remove bubbles that fall out of screen
    bubbles = bubbles.filter(bubble => bubble.y < HEIGHT + BUBBLE_SIZE);

    // Add new stars if less than max
    while (stars.length < MAX_STARS) {
        stars.push(createStar());
    }

    // Add new bubbles if less than max
    while (bubbles.length < MAX_BUBBLES) {
        bubbles.push(createBubble());
    }
}

// Check collision between fairy and stars or bubbles
function checkCollisions() {
    // Fairy rectangle
    const fairyRect = {
        x: fairy.x - fairy.width / 2,
        y: fairy.y - fairy.height / 2,
        width: fairy.width,
        height: fairy.height
    };

    // Check stars
    stars.forEach((star, index) => {
        const starRect = {
            x: star.x - STAR_SIZE / 2,
            y: star.y - STAR_SIZE / 2,
            width: STAR_SIZE,
            height: STAR_SIZE
        };
        if (rectIntersect(fairyRect, starRect)) {
            // Collect star
            stars.splice(index, 1);
            score++;
            scoreEl.textContent = score;
            if (score >= WIN_SCORE) {
                endGame(true);
            }
        }
    });

    // Check bubbles
    bubbles.forEach((bubble, index) => {
        const bubbleRect = {
            x: bubble.x - BUBBLE_SIZE / 2,
            y: bubble.y - BUBBLE_SIZE / 2,
            width: BUBBLE_SIZE,
            height: BUBBLE_SIZE
        };
        if (rectIntersect(fairyRect, bubbleRect)) {
            // Hit bubble - lose
            endGame(false);
        }
    });
}

// Rectangle intersection helper
function rectIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
             r2.x + r2.width < r1.x ||
             r2.y > r1.y + r1.height ||
             r2.y + r2.height < r1.y);
}

// Clear canvas
function clearCanvas() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// Draw all game objects
function draw() {
    clearCanvas();
    drawFairy();
    stars.forEach(star => drawStar(star.x, star.y));
    bubbles.forEach(bubble => drawBubble(bubble.x, bubble.y));
}

// Update fairy position based on keys pressed
function updateFairy() {
    if (keysPressed['ArrowLeft'] || keysPressed['a']) {
        fairy.x -= fairy.speed;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d']) {
        fairy.x += fairy.speed;
    }
    if (keysPressed['ArrowUp'] || keysPressed['w']) {
        fairy.y -= fairy.speed;
    }
    if (keysPressed['ArrowDown'] || keysPressed['s']) {
        fairy.y += fairy.speed;
    }

    // Keep fairy inside canvas
    if (fairy.x < fairy.width / 2) fairy.x = fairy.width / 2;
    if (fairy.x > WIDTH - fairy.width / 2) fairy.x = WIDTH - fairy.width / 2;
    if (fairy.y < fairy.height / 2) fairy.y = fairy.height / 2;
    if (fairy.y > HEIGHT - fairy.height / 2) fairy.y = HEIGHT - fairy.height / 2;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    updateFairy();
    updateObjects();
    checkCollisions();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

// Start the game
function startGame() {
    score = 0;
    scoreEl.textContent = score;
    messageEl.textContent = '';
    fairy.x = WIDTH / 2;
    fairy.y = HEIGHT - 40;
    stars = [];
    bubbles = [];
    gameRunning = true;
    startBtn.disabled = true;
    gameLoop();
}

// End the game
function endGame(won) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    if (won) {
        messageEl.textContent = 'You Win! 🎉';
    } else {
        messageEl.textContent = 'You Lose! 💦';
    }
    startBtn.disabled = false;
}

// Event listeners for controls
window.addEventListener('keydown', e => {
    keysPressed[e.key] = true;
});
window.addEventListener('keyup', e => {
    keysPressed[e.key] = false;
});

startBtn.addEventListener('click', () => {
    startGame();
});

// Initial draw
clearCanvas();
drawFairy();