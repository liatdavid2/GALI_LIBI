// Fairy Star Collector Game
// The fairy collects stars and avoids clouds

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const messageEl = document.getElementById('message');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game settings
const fairySize = 40;
const starSize = 20;
const cloudSize = 50;
const maxStars = 5;
const maxClouds = 3;
const starSpeed = 2;
const cloudSpeed = 1.5;
const maxScore = 10; // Win condition

let fairy = {
    x: WIDTH / 2 - fairySize / 2,
    y: HEIGHT - fairySize - 10,
    width: fairySize,
    height: fairySize,
    speed: 5
};

let stars = [];
let clouds = [];
let score = 0;
let gameRunning = false;

// Key press state
let keys = {
    left: false,
    right: false
};

// Load images
const fairyImg = new Image();
const starImg = new Image();
const cloudImg = new Image();

// Draw simple pink fairy
function drawFairy(x, y) {
    // Body
    ctx.fillStyle = '#ff66b2';
    ctx.beginPath();
    ctx.ellipse(x + fairySize/2, y + fairySize/2, fairySize/2, fairySize/2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = '#ffb3d9';
    ctx.beginPath();
    ctx.ellipse(x + fairySize/4, y + fairySize/4, fairySize/4, fairySize/3, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 3*fairySize/4, y + fairySize/4, fairySize/4, fairySize/3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Face
    ctx.fillStyle = '#fff0fb';
    ctx.beginPath();
    ctx.arc(x + fairySize/2, y + fairySize/2, fairySize/6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#a6006a';
    ctx.beginPath();
    ctx.arc(x + fairySize/2 - 5, y + fairySize/2 - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + fairySize/2 + 5, y + fairySize/2 - 3, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw star
function drawStar(x, y) {
    ctx.fillStyle = '#fff9b0';
    ctx.beginPath();
    // 5-point star
    const spikes = 5;
    const outerRadius = starSize / 2;
    const innerRadius = outerRadius / 2.5;
    let rot = Math.PI / 2 * 3;
    let cx = x + starSize / 2;
    let cy = y + starSize / 2;
    let step = Math.PI / spikes;
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        let x1 = cx + Math.cos(rot) * outerRadius;
        let y1 = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x1, y1);
        rot += step;
        let x2 = cx + Math.cos(rot) * innerRadius;
        let y2 = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x2, y2);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Draw cloud
function drawCloud(x, y) {
    ctx.fillStyle = '#ffffffcc';
    // Draw 3 circles to form a cloud
    ctx.beginPath();
    ctx.arc(x + cloudSize * 0.3, y + cloudSize * 0.5, cloudSize * 0.3, 0, Math.PI * 2);
    ctx.arc(x + cloudSize * 0.6, y + cloudSize * 0.4, cloudSize * 0.35, 0, Math.PI * 2);
    ctx.arc(x + cloudSize * 0.8, y + cloudSize * 0.6, cloudSize * 0.25, 0, Math.PI * 2);
    ctx.fill();
}

// Initialize stars and clouds
function initObjects() {
    stars = [];
    clouds = [];
    for (let i = 0; i < maxStars; i++) {
        stars.push({
            x: Math.random() * (WIDTH - starSize),
            y: Math.random() * -HEIGHT,
            width: starSize,
            height: starSize,
            speed: starSpeed + Math.random()
        });
    }
    for (let i = 0; i < maxClouds; i++) {
        clouds.push({
            x: Math.random() * (WIDTH - cloudSize),
            y: Math.random() * -HEIGHT,
            width: cloudSize,
            height: cloudSize,
            speed: cloudSpeed + Math.random() * 0.5
        });
    }
}

// Reset game
function resetGame() {
    score = 0;
    scoreEl.textContent = score;
    fairy.x = WIDTH / 2 - fairySize / 2;
    messageEl.textContent = '';
    initObjects();
    gameRunning = true;
    startBtn.textContent = 'Restart Game';
    requestAnimationFrame(gameLoop);
}

// Check collision between two rectangles
function isColliding(a, b) {
    return !(
        a.x + a.width < b.x ||
        a.x > b.x + b.width ||
        a.y + a.height < b.y ||
        a.y > b.y + b.height
    );
}

// Update game objects
function update() {
    // Move fairy
    if (keys.left) {
        fairy.x -= fairy.speed;
        if (fairy.x < 0) fairy.x = 0;
    }
    if (keys.right) {
        fairy.x += fairy.speed;
        if (fairy.x + fairy.width > WIDTH) fairy.x = WIDTH - fairy.width;
    }

    // Move stars down
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > HEIGHT) {
            star.x = Math.random() * (WIDTH - starSize);
            star.y = Math.random() * -HEIGHT;
        }
    }

    // Move clouds down
    for (let cloud of clouds) {
        cloud.y += cloud.speed;
        if (cloud.y > HEIGHT) {
            cloud.x = Math.random() * (WIDTH - cloudSize);
            cloud.y = Math.random() * -HEIGHT;
        }
    }

    // Check collisions with stars
    for (let i = 0; i < stars.length; i++) {
        if (isColliding(fairy, stars[i])) {
            score++;
            scoreEl.textContent = score;
            // Reset star position
            stars[i].x = Math.random() * (WIDTH - starSize);
            stars[i].y = Math.random() * -HEIGHT;
            if (score >= maxScore) {
                gameRunning = false;
                messageEl.textContent = 'You Win! The fairy collected all stars!';
            }
        }
    }

    // Check collisions with clouds
    for (let cloud of clouds) {
        if (isColliding(fairy, cloud)) {
            gameRunning = false;
            messageEl.textContent = 'Oh no! The fairy hit a cloud! You Lose!';
        }
    }
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw stars
    for (let star of stars) {
        drawStar(star.x, star.y);
    }

    // Draw clouds
    for (let cloud of clouds) {
        drawCloud(cloud.x, cloud.y);
    }

    // Draw fairy
    drawFairy(fairy.x, fairy.y);
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Key event listeners
window.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = true;
    }
});

window.addEventListener('keyup', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd') {
        keys.right = false;
    }
});

// Start button
startBtn.addEventListener('click', () => {
    resetGame();
});

// Initial draw
ctx.font = '20px Comic Sans MS';
ctx.fillStyle = '#a6006a';
ctx.textAlign = 'center';
ctx.fillText('Press Start to Play!', WIDTH / 2, HEIGHT / 2);