const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.querySelector('#scoreDisplay span');
const highScoreDisplay = document.querySelector('#highScoreDisplay span');
const finalScoreDisplay = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

// Game Constants
const GRAVITY = 0.6;
const JUMP_STRENGTH = -10;
const INITIAL_SPEED = 6;
const GROUND_Y = 320; // Y coordinate for the floor

// Game State
let isPlaying = false;
let score = 0;
let highScore = localStorage.getItem('geometryDashHighScore') || 0;
highScoreDisplay.textContent = highScore;
let gameSpeed = INITIAL_SPEED;
let frameCount = 0;
let animationId;

// Entities
let player;
let obstacles = [];
let particles = [];

class Player {
    constructor() {
        this.size = 30;
        this.x = 100;
        this.y = GROUND_Y - this.size;
        this.yVelocity = 0;
        this.isGrounded = true;
        this.rotation = 0;
    }

    jump() {
        if (this.isGrounded) {
            this.yVelocity = JUMP_STRENGTH;
            this.isGrounded = false;
            createParticles(this.x + this.size / 2, this.y + this.size, 10, '#00f3ff');
        }
    }

    update() {
        // Apply gravity
        this.yVelocity += GRAVITY;
        this.y += this.yVelocity;

        // Ground collision
        if (this.y + this.size >= GROUND_Y) {
            this.y = GROUND_Y - this.size;
            this.yVelocity = 0;
            if (!this.isGrounded) {
                // Just landed
                this.rotation = Math.round(this.rotation / 90) * 90; // Snap rotation
                createParticles(this.x + this.size / 2, this.y + this.size, 5, '#ffffff');
            }
            this.isGrounded = true;
        } else {
            // Rotate while in air
            this.rotation += 5;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
        ctx.rotate((this.rotation * Math.PI) / 180);
        
        ctx.fillStyle = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00f3ff';
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        
        // Inner detail
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-this.size / 4, -this.size / 4, this.size / 2, this.size / 2);
        
        ctx.restore();
    }
}

class Obstacle {
    constructor() {
        this.width = 30;
        this.height = 40 + Math.random() * 40; // Random height between 40 and 80
        this.x = canvas.width;
        this.y = GROUND_Y - this.height;
        this.passed = false;
    }

    update() {
        this.x -= gameSpeed;
    }

    draw() {
        ctx.fillStyle = '#ff00ea';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00ea';

        // Draw a triangle spike
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = (Math.random() - 0.5) * 5;
        this.life = 1.0;
        this.decay = Math.random() * 0.05 + 0.02;
        this.color = color;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function createParticles(x, y, count, color) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function initGame() {
    player = new Player();
    obstacles = [];
    particles = [];
    score = 0;
    gameSpeed = INITIAL_SPEED;
    frameCount = 0;
    scoreDisplay.textContent = score;
    isPlaying = true;
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    
    // Start game loop
    if (animationId) cancelAnimationFrame(animationId);
    gameLoop();
}

function spawnObstacle() {
    // Spawn logic based on frames and random chance to prevent impossible jumps
    if (frameCount % 60 === 0) { // Every ~1 second minimum
        if (Math.random() < 0.5 || frameCount % 120 === 0) { // Randomize gaps
            obstacles.push(new Obstacle());
        }
    }
}

function checkCollision(p, obs) {
    // AABB Collision with a slightly smaller hitbox for fairness
    const hitboxMargin = 5;
    return (
        p.x + hitboxMargin < obs.x + obs.width &&
        p.x + p.size - hitboxMargin > obs.x &&
        p.y + hitboxMargin < obs.y + obs.height &&
        p.y + p.size - hitboxMargin > obs.y
    );
}

function drawBackground() {
    // Grid lines for speed effect
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
    ctx.lineWidth = 2;
    
    const offset = (frameCount * (gameSpeed * 0.5)) % 40;
    
    for (let x = -offset; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, GROUND_Y);
        ctx.stroke();
    }

    // Floor
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Floor top line
    ctx.fillStyle = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f3ff';
    ctx.fillRect(0, GROUND_Y, canvas.width, 4);
    ctx.shadowBlur = 0; // Reset shadow for next draws
}

function gameOver() {
    isPlaying = false;
    createParticles(player.x + player.size / 2, player.y + player.size / 2, 50, '#ff00ea');
    
    // Draw one last frame with explosion
    drawGameObjects();
    
    setTimeout(() => {
        gameOverScreen.classList.add('active');
        finalScoreDisplay.textContent = score;
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('geometryDashHighScore', highScore);
            highScoreDisplay.textContent = highScore;
        }
    }, 500);
}

function drawGameObjects() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();

    // Draw and update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    // Draw and update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        if (isPlaying) obs.update();
        obs.draw();

        // Check collision
        if (isPlaying && checkCollision(player, obs)) {
            gameOver();
        }

        // Score tracking
        if (isPlaying && !obs.passed && player.x > obs.x + obs.width) {
            obs.passed = true;
            score += 10;
            scoreDisplay.textContent = score;
            
            // Increase difficulty
            if (score % 50 === 0) {
                gameSpeed += 0.5;
            }
        }

        // Cleanup off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    if (isPlaying) {
        player.update();
    }
    
    // Don't draw player if game over (to show explosion)
    if (isPlaying || particles.length < 20) {
       player.draw();
    }
}

function gameLoop() {
    if (!isPlaying) return;

    spawnObstacle();
    drawGameObjects();
    
    frameCount++;
    animationId = requestAnimationFrame(gameLoop);
}

// Input Handling
function handleJump(e) {
    if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;
    
    if (isPlaying) {
        player.jump();
    } else if (e.type === 'keydown' && e.code === 'Space') {
        // Allow starting game with Space
        if (startScreen.classList.contains('active') || gameOverScreen.classList.contains('active')) {
            initGame();
        }
    }
}

window.addEventListener('keydown', handleJump);
canvas.addEventListener('mousedown', handleJump);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevent scrolling
    handleJump(e);
});

// Button Listeners
startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);

// Initial empty draw
drawBackground();
