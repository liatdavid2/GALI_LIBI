// Fairy Star Collector Game
// The fairy collects stars and avoids bubbles

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const startButton = document.getElementById('start-button');
const messageElem = document.getElementById('message');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game objects
let fairy = {
    x: WIDTH / 2,
    y: HEIGHT - 50,
    radius: 20,
    speed: 6
};

let stars = [];
let bubbles = [];

let score = 0;
let gameRunning = false;
let animationId;

// Controls
let keys = {
    left: false,
    right: false
};

// Utility: random integer in [min, max]
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Draw fairy as a pink circle with wings
function drawFairy() {
    // Body
    ctx.fillStyle = '#ff66b3';
    ctx.beginPath();
    ctx.arc(fairy.x, fairy.y, fairy.radius, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = 'rgba(255, 153, 204, 0.6)';
    ctx.beginPath();
    ctx.ellipse(fairy.x - 18, fairy.y - 10, 12, 20, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(fairy.x + 18, fairy.y - 10, 12, 20, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Face (eyes)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fairy.x - 7, fairy.y - 5, 4, 0, Math.PI * 2);
    ctx.arc(fairy.x + 7, fairy.y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b30059';
    ctx.beginPath();
    ctx.arc(fairy.x - 7, fairy.y - 5, 2, 0, Math.PI * 2);
    ctx.arc(fairy.x + 7, fairy.y - 5, 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw star as a small yellow star shape
function drawStar(star) {
    const cx = star.x;
    const cy = star.y;
    const spikes = 5;
    const outerRadius = 12;
    const innerRadius = 5;

    ctx.fillStyle = '#ffff66';
    ctx.beginPath();
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Draw bubble as a transparent pink circle with highlight
function drawBubble(bubble) {
    ctx.fillStyle = 'rgba(255, 153, 204, 0.4)';
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bubble.x - bubble.radius / 3, bubble.y - bubble.radius / 3, bubble.radius / 2, 0, Math.PI * 2);
    ctx.stroke();
}

// Clear canvas
function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

// Update game objects
function update() {
    if (!gameRunning) return;

    // Move fairy
    if (keys.left) {
        fairy.x -= fairy.speed;
        if (fairy.x - fairy.radius < 0) fairy.x = fairy.radius;
    }
    if (keys.right) {
        fairy.x += fairy.speed;
        if (fairy.x + fairy.radius > WIDTH) fairy.x = WIDTH - fairy.radius;
    }

    // Move stars down
    for (let i = stars.length - 1; i >= 0; i--) {
        stars[i].y += stars[i].speed;
        if (stars[i].y - stars[i].radius > HEIGHT) {
            // Remove star if it goes off screen
            stars.splice(i, 1);
        }
    }

    // Move bubbles down
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y += bubbles[i].speed;
        if (bubbles[i].y - bubbles[i].radius > HEIGHT) {
            // Remove bubble if it goes off screen
            bubbles.splice(i, 1);
        }
    }

    // Check collisions with stars
    for (let i = stars.length - 1; i >= 0; i--) {
        if (circleCollision(fairy, stars[i])) {
            stars.splice(i, 1);
            score += 1;
            scoreElem.textContent = score;
            if (score >= 10) {
                endGame(true);
                return;
            }
        }
    }

    // Check collisions with bubbles
    for (let i = 0; i < bubbles.length; i++) {
        if (circleCollision(fairy, bubbles[i])) {
            endGame(false);
            return;
        }
    }

    // Occasionally add new stars and bubbles
    if (Math.random() < 0.03) {
        stars.push({
            x: randInt(20, WIDTH - 20),
            y: -20,
            radius: 12,
            speed: randInt(2, 4)
        });
    }
    if (Math.random() < 0.02) {
        bubbles.push({
            x: randInt(20, WIDTH - 20),
            y: -20,
            radius: randInt(15, 25),
            speed: randInt(1, 3)
        });
    }
}

// Check circle collision
function circleCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < c1.radius + c2.radius;
}

// Draw all game objects
function draw() {
    clear();
    drawFairy();
    stars.forEach(drawStar);
    bubbles.forEach(drawBubble);
}

// Game loop
function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    score = 0;
    scoreElem.textContent = score;
    messageElem.textContent = '';
    fairy.x = WIDTH / 2;
    stars = [];
    bubbles = [];
    gameRunning = true;
    startButton.disabled = true;
    gameLoop();
}

// End game
function endGame(won) {
    gameRunning = false;
    startButton.disabled = false;
    if (won) {
        messageElem.textContent = 'You Win! The fairy collected 10 stars!';
    } else {
        messageElem.textContent = 'You Lose! The fairy touched a bubble!';
    }
    cancelAnimationFrame(animationId);
}

// Event listeners for controls
window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = true;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = false;
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = false;
    }
});

startButton.addEventListener('click', startGame);
