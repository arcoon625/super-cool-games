// Game Configuration
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    fps: 60,
    fov: 100,
    cameraHeight: 2000,
    cameraDepth: 1 / Math.tan((100 / 2) * Math.PI / 180),
    trackLength: 100000, // Total Z distance
    laneWidth: 1200,      // World units width of a lane
    roadWidth: 4000,      // Total road width
    segmentLength: 200,   // Just for visual stripes
};

// State
let state = {
    screen: 'selection', // selection, race, result
    player: {
        x: 0, // 0 is center, -1 is left edge, 1 is right edge of road roughly
        z: 0,
        speed: 0,
        maxSpeed: 0,
        accel: 0,
        handling: 0,
        width: 600,    // World units (matches texture aspect mostly)
        length: 1200,  // World units
    },
    opponents: [],
    roadColor: { light: '#444', dark: '#333' },
    grassColor: { light: '#111', dark: '#0a0a0a' },
    finished: false,
    startTime: 0,
    finishRank: null
};

// DOM Elements
const screens = {
    selection: document.getElementById('selection-screen'),
    race: document.getElementById('race-screen'),
    result: document.getElementById('result-screen')
};
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const ui = {
    speed: document.getElementById('speed'),
    rank: document.getElementById('position'),
    distance: document.getElementById('distance'),
    finalRank: document.getElementById('final-rank'),
    countdown: document.getElementById('countdown-overlay')
};

// Car Definitions
const CARS = {
    speedster: { name: 'The Bolt', color: '#ff0055', maxSpeed: 600, accel: 15, handling: 0.15 }, // Faster
    balanced: { name: 'Phantom', color: '#00f3ff', maxSpeed: 550, accel: 12, handling: 0.2 },
    heavy: { name: 'Titan', color: '#ffee00', maxSpeed: 500, accel: 10, handling: 0.25 }
};

// Initialization
function init() {
    setupSelection();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function setupSelection() {
    document.querySelectorAll('.car-card').forEach(card => {
        card.addEventListener('click', () => {
            const carType = card.dataset.car;
            startGame(carType);
        });
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
        switchScreen('selection');
    });
}

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
    state.screen = screenName;
}

function startGame(carType) {
    const selectedCar = CARS[carType];

    // Reset Player
    state.player = {
        ...state.player,
        x: 0,
        z: 0,
        speed: 0,
        maxSpeed: selectedCar.maxSpeed,
        accel: selectedCar.accel,
        handling: selectedCar.handling,
        color: selectedCar.color,
        type: carType
    };

    // Generate Opponents
    state.opponents = [];
    const opponentTypes = Object.keys(CARS).filter(c => c !== carType);

    // Add 2 AI opponents
    opponentTypes.forEach((type, i) => {
        state.opponents.push({
            x: i === 0 ? -1500 : 1500, // Lane positions in world coords
            z: 2000, // Start slightly ahead
            speed: 0,
            maxSpeed: CARS[type].maxSpeed * 0.95, // Slightly slower than player max potential
            accel: CARS[type].accel * 0.9,
            color: CARS[type].color,
            width: 600,
            length: 1200,
            zOffset: 0
        });
    });

    state.finished = false;
    state.finishRank = null;
    state.startTime = Date.now();

    switchScreen('race');
    startCountdown();
}

function startCountdown() {
    ui.countdown.classList.remove('hidden');
    let count = 3;
    ui.countdown.querySelector('.counter').innerText = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            ui.countdown.querySelector('.counter').innerText = count;
        } else if (count === 0) {
            ui.countdown.querySelector('.counter').innerText = 'GO!';
        } else {
            clearInterval(interval);
            ui.countdown.classList.add('hidden');
        }
    }, 1000);
}

// Input Handling
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

// Game Loop
let lastTime = 0;
function gameLoop(time) {
    const dt = (time - lastTime) / 1000 * 60; // Normalize to 60fps units
    lastTime = time;

    if (state.screen === 'race') {
        if (ui.countdown.classList.contains('hidden')) {
            update(dt);
        }
        draw();
    }

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    if (state.finished) return;

    const p = state.player;

    // --- Player Physics ---
    if (keys['ArrowUp'] || keys['w']) p.speed += p.accel * dt;
    else p.speed *= 0.98; // Friction

    if (keys['ArrowDown'] || keys['s']) p.speed -= p.accel * dt;

    // Steering
    const speedRatio = p.speed / p.maxSpeed;
    if (p.speed > 0) { // Can only steer if moving
        if (keys['ArrowLeft'] || keys['a']) p.x -= p.handling * speedRatio * dt * 200;
        if (keys['ArrowRight'] || keys['d']) p.x += p.handling * speedRatio * dt * 200;
    }

    // Caps
    p.speed = Math.max(0, Math.min(p.speed, p.maxSpeed));
    p.x = Math.max(-2500, Math.min(2500, p.x)); // Road boundaries (world units)

    // Move
    p.z += p.speed * dt;

    // --- Opponent AI ---
    state.opponents.forEach(opp => {
        // Accelerate
        if (opp.speed < opp.maxSpeed) {
            opp.speed += opp.accel * dt;
        }

        // Simple logic: maintain lane, maybe drift slightly
        // For now, just drive straight
        opp.z += opp.speed * dt;
    });

    // --- Collision Detection ---
    // Simple Box Collision
    state.opponents.forEach(opp => {
        // Check Z overlap
        // Cars are 'length' long.
        if (p.z < opp.z + opp.length && p.z + p.length > opp.z) {
            // Check X overlap
            // Cars are 'width' wide
            if (p.x < opp.x + opp.width && p.x + p.width > opp.x) {
                // Collision!
                // Slow down player
                p.speed *= 0.5;
                // Bounce effect
                if (p.x < opp.x) p.x -= 200;
                else p.x += 200;
            }
        }
    });

    // --- Win Condition ---
    if (p.z >= CONFIG.trackLength) {
        finishRace();
    }
}

function updateHUD() {
    const p = state.player;
    ui.speed.innerText = Math.floor((p.speed / p.maxSpeed) * 200);

    const progress = Math.min(100, Math.floor((p.z / CONFIG.trackLength) * 100));
    ui.distance.innerText = progress;

    // Calculate Rank
    const allCars = [p, ...state.opponents];
    allCars.sort((a, b) => b.z - a.z); // detailed Sort by Z
    const rank = allCars.indexOf(p) + 1;
    ui.rank.innerText = rank;
}

function finishRace() {
    state.finished = true;

    // Calculate Final Rank
    const allCars = [state.player, ...state.opponents];
    allCars.sort((a, b) => b.z - a.z);
    const rank = allCars.indexOf(state.player) + 1;
    state.finishRank = rank;

    const suffixes = ["st", "nd", "rd"];
    const suffix = suffixes[rank - 1] || "th";

    setTimeout(() => {
        switchScreen('result');
        ui.finalRank.innerText = rank + suffix;
    }, 1000);
}

// --- Rendering System ---
function draw() {
    // Clear
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Sky
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, w, h);

    // Horizon
    const horizon = h / 2;
    // Ground
    ctx.fillStyle = '#111';
    ctx.fillRect(0, horizon, w, h / 2);

    // --- Project 3D Point to 2D ---
    const project = (x, y, z) => {
        const cameraZ = state.player.z - 2000; // Camera is behind car
        const cameraX = state.player.x;
        const cameraY = CONFIG.cameraHeight;

        const scale = CONFIG.cameraDepth / ((z - cameraZ) || 1);
        const screenX = w / 2 + (scale * (x - cameraX));
        const screenY = horizon + (scale * (y - cameraY)); // Y increases downwards
        const screenW = scale * CONFIG.roadWidth;

        return { x: screenX, y: screenY, w: screenW, scale: scale };
    };

    // --- Draw Road Segments (Stripes) ---
    // We only draw the visible road
    const startZ = Math.floor(state.player.z / CONFIG.segmentLength) * CONFIG.segmentLength;
    const endZ = startZ + 300 * CONFIG.segmentLength; // Draw distance

    // Optimized drawing: big polygon for road color
    // Then draw stripes
    // Simple approach:

    // Draw base road rect with perspective
    // Actually, drawing a single trapezoid for the road base is fastest
    ctx.fillStyle = '#222';
    // Left edge at horizon
    const horizonScale = CONFIG.cameraDepth / (endZ - (state.player.z - 2000));
    // Close edge
    // Simply:
    const pFar = project(0, 0, endZ); // center far
    const pNear = project(0, 0, state.player.z + 100); // near player

    // Let's iterate segments for the "Motion" feel
    for (let z = startZ; z < startZ + 50000; z += CONFIG.segmentLength * 2) {
        if (z > endZ) break;

        // Check if visible
        if (z < state.player.z - 1000) continue;

        const p1 = project(-CONFIG.laneWidth / 6, 0, z);
        const p2 = project(CONFIG.laneWidth / 6, 0, z);
        const p3 = project(CONFIG.laneWidth / 6, 0, z + CONFIG.segmentLength);
        const p4 = project(-CONFIG.laneWidth / 6, 0, z + CONFIG.segmentLength);

        if (p1.scale < 0 || p3.scale < 0) continue; // Behind camera clipping

        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.fill();
    }

    // Draw Road Borders (optional, skipping for speed)

    // --- Draw Objects (Cars) from Back to Front ---
    const renderList = [];

    // Add Player
    renderList.push({ ...state.player, isPlayer: true });

    // Add Opponents
    state.opponents.forEach(opp => renderList.push(opp));

    // Sort by Z (far to near)
    renderList.sort((a, b) => b.z - a.z);

    renderList.forEach(obj => {
        // Cull if behind
        if (obj.z < state.player.z - 2000) return;

        const p = project(obj.x, 0, obj.z);
        if (p.scale <= 0) return;

        // Draw Car
        const carW = obj.width * p.scale;
        const carH = obj.length * 0.5 * p.scale; // Visual height

        const carX = p.x - carW / 2;
        const carY = p.y - carH;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, carW / 1.8, carW / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = obj.color;
        // Simple shape
        ctx.fillRect(carX, carY, carW, carH);

        // Roof
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(carX + carW * 0.1, carY + carH * 0.1, carW * 0.8, carH * 0.4);

        // Lights
        ctx.fillStyle = '#f00';
        ctx.fillRect(carX + carW * 0.1, carY + carH * 0.6, carW * 0.2, carH * 0.1);
        ctx.fillRect(carX + carW * 0.7, carY + carH * 0.6, carW * 0.2, carH * 0.1);

        if (obj.isPlayer) {
            // Add indicator?
        }
    });

    updateHUD();
}

init();
