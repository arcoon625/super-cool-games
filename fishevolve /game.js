const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('current-mass');
const nextMassEl = document.getElementById('next-mass');
const evoNameEl = document.getElementById('evolution-name');
const msgArea = document.getElementById('message-area');

// Game State
let lastTime = 0;
let player = new Player();
let entities = []; // Food and Enemies
let viewport = { x: 0, y: 0 };
let input = { mouseX: 0, mouseY: 0 };

// Configuration
// Configuration
const SPAWN_RATE = 0.1; // seconds (Much faster spawning)
let spawnTimer = 0;

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Input handling
window.addEventListener('mousemove', (e) => {
    input.mouseX = e.clientX;
    input.mouseY = e.clientY;
});

// Sound / Events
window.addEventListener('evolution', (e) => {
    const data = e.detail;
    evoNameEl.textContent = data.name;
    const nextStage = player.evolutionData[player.evolutionStage + 1];
    nextMassEl.textContent = nextStage ? nextStage.mass : 'MAX';

    showMessage(`Evolved to ${data.name}!`);
});

function showMessage(text) {
    msgArea.textContent = text;
    msgArea.classList.remove('hidden');
    msgArea.style.opacity = '1';

    setTimeout(() => {
        msgArea.style.opacity = '0';
        setTimeout(() => msgArea.classList.add('hidden'), 500);
    }, 2000);
}

// Spawning Logic
function spawnEntities(dt) {
    spawnTimer += dt;
    if (spawnTimer > SPAWN_RATE) {
        spawnTimer = 0;

        // Spawn radius needs to be outside screen but not too far
        // Based on player position
        const angle = Math.random() * Math.PI * 2;
        // Distance depends on canvas size, spawn just outside
        const dist = Math.max(canvas.width, canvas.height) / 2 + 100;

        const spawnX = player.x + Math.cos(angle) * dist;
        const spawnY = player.y + Math.sin(angle) * dist;

        // Decide what to spawn based on player level + randomness
        const rand = Math.random();

        if (rand < 0.7) {
            // Spawn Food
            const foodTypes = ['starfish', 'scraps', 'shrimp'];
            const type = foodTypes[Math.floor(Math.random() * foodTypes.length)];
            entities.push(new Food(spawnX, spawnY, type));
        } else {
            // Spawn Enemy / Prey
            // Should spawn things player can eat AND things that can eat player
            // For now simple random selection from evolution chain
            // Exclude current player type to avoid cannibalism if not desired, or include it
            const stage = Math.floor(Math.random() * 6); // 0 to 5
            const data = player.evolutionData[stage];
            if (data.name !== 'Planet Eater') { // Don't spawn max level bosses randomly yet
                entities.push(new Enemy(spawnX, spawnY, data.name.toLowerCase().replace(' ', ''), data.radius, 100)); // Speed 100
            }
        }
    }
}

function checkCollisions() {
    for (const entity of entities) {
        if (entity.markedForDeletion) continue;

        const dx = player.x - entity.x;
        const dy = player.y - entity.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < player.radius + entity.radius) {
            // Collision!

            // Check if player eats entity
            if (player.canEat(entity)) {
                entity.markedForDeletion = true;
                // Gain mass
                if (entity instanceof Food) player.score += entity.xpValue;
                else player.score += entity.radius / 2; // Eating fish gives more

                // Cap score update
                scoreEl.textContent = Math.floor(player.score);

            } else if (entity.radius > player.radius) {
                // Entity is larger -> Eats player!
                isGameOver = true;
                deathReason.textContent = "You were eaten by a " + entity.type + "!";
                gameOverScreen.classList.remove('hidden');
                return; // Stop update
            }
        }
    }

    // Cleanup
    entities = entities.filter(e => !e.markedForDeletion);

    // Despawn far away entities
    entities = entities.filter(e => {
        const dx = player.x - e.x;
        const dy = player.y - e.y;
        return (dx * dx + dy * dy) < 5000000; // ~2200px radius
    });
}

function update(dt) {
    player.update(dt, input);

    // Update Camera (Viewport)
    // Center player
    viewport.x = player.x - canvas.width / 2;
    viewport.y = player.y - canvas.height / 2;

    spawnEntities(dt);

    entities.forEach(e => e.update(dt));

    checkCollisions();
}

// Particles for Ocean Ambiance
const particles = [];
for (let i = 0; i < 50; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 20 + 5,
        alpha: Math.random() * 0.3 + 0.1
    });
}

function drawBackground() {
    // 1. Deep Ocean Gradient (already in CSS but helpful to reinforce or overlay)
    const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, "#006994"); // Lighter top
    grd.addColorStop(1, "#001e36"); // Darker bottom
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Sunbeams from top
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    const beamGrd = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
    beamGrd.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    beamGrd.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = beamGrd;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    ctx.lineTo(canvas.width * 0.8, canvas.height); // Skewed
    ctx.lineTo(canvas.width * 0.2, canvas.height);
    ctx.fill();
    ctx.restore();

    // 3. Bubbles / Particulates (Parallax)
    ctx.fillStyle = 'white';
    particles.forEach(p => {
        // Move relative to viewport for parallax
        let px = (p.x - viewport.x * 0.5) % canvas.width;
        let py = (p.y - viewport.y * 0.5) % canvas.height;
        if (px < 0) px += canvas.width;
        if (py < 0) py += canvas.height;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Animate up
        p.y -= p.speed * 0.016; // Approx dt
        if (p.y < -50) p.y = canvas.height + 50;
    });
    ctx.globalAlpha = 1.0;
}

function draw() {
    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Not strictly needed if bg fills, but good practice

    // Draw Background
    drawBackground();

    // Draw Grid (Optional, can be disabled for realism)
    // drawGrid();

    // Draw Entities
    entities.forEach(e => e.draw(ctx, viewport));

    // Draw Player
    player.draw(ctx, viewport);

    // Underwater Lighting Overlay
    drawLighting();
}

function drawLighting() {
    // 1. Water Tint (Blue/Green overlay)
    ctx.fillStyle = "rgba(0, 30, 60, 0.2)"; // Deep blue tint
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Caustics (Shifting light patterns)
    // Simulated with moving gradients or white overlay
    const time = Date.now() / 1000;

    ctx.save();
    ctx.globalCompositeOperation = 'overlay'; // Blend mode essential for 'light' look
    ctx.globalAlpha = 0.15;

    // Moving light bands
    const shift = (Math.sin(time) * 50) + (time * 20);
    const grad = ctx.createLinearGradient(0 + shift, 0, canvas.width + shift, canvas.height);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.2, "white");
    grad.addColorStop(0.4, "transparent");
    grad.addColorStop(0.6, "white");
    grad.addColorStop(0.8, "transparent");
    grad.addColorStop(1, "white");

    ctx.fillStyle = grad;
    // Rotate slightly for diagonal rays
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(0.2);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw big rect to cover rotation
    ctx.fillRect(-500, -500, canvas.width + 1000, canvas.height + 1000);

    ctx.restore();

    // 3. Vignette (Darker corners for depth)
    const rad = Math.max(canvas.width, canvas.height) / 1.2;
    const vign = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, rad * 0.5, canvas.width / 2, canvas.height / 2, rad);
    vign.addColorStop(0, "rgba(0,0,0,0)");
    vign.addColorStop(1, "rgba(0,0,50,0.6)"); // Dark blue edges
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

const gameOverScreen = document.getElementById('game-over-screen');
const deathReason = document.getElementById('death-reason');
const restartBtn = document.getElementById('restart-btn');

let isGameOver = false;

restartBtn.addEventListener('click', () => {
    resetGame();
});

function resetGame() {
    isGameOver = false;
    gameOverScreen.classList.add('hidden');

    player = new Player();
    entities = [];
    scoreEl.textContent = '0';
    evoEl.textContent = "Sardine";
    // Reset spawn timer?
    spawnTimer = 0;

    // Resume loop if it was stopped, or just rely on 'isGameOver' flag in update
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const gridSize = 100;

    const startX = Math.floor(viewport.x / gridSize) * gridSize;
    const startY = Math.floor(viewport.y / gridSize) * gridSize;

    ctx.beginPath();
    for (let x = startX; x < viewport.x + canvas.width + gridSize; x += gridSize) {
        ctx.moveTo(x - viewport.x, 0);
        ctx.lineTo(x - viewport.x, canvas.height);
    }
    for (let y = startY; y < viewport.y + canvas.height + gridSize; y += gridSize) {
        ctx.moveTo(0, y - viewport.y);
        ctx.lineTo(canvas.width, y - viewport.y);
    }
    ctx.stroke();

    ctx.globalAlpha = 1.0;
}

function gameLoop(timestamp) {
    if (isGameOver) return; // Stop loop

    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (dt < 0.1) { // Prevent huge jumps if tab inactive
        update(dt);
        draw();
    }

    requestAnimationFrame(gameLoop);
}

// Start
requestAnimationFrame(gameLoop);
