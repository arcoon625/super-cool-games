/* ============================================
   RING RIVALS — GAME ENGINE
   8 Fighters + Boss Ladder
   ============================================ */

// ---- Canvas Setup ----
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ---- Constants ----
const GROUND_Y_RATIO = 0.78;
const STRIKING_RANGE = 90;
const GRAVITY = 0.7;
const MOVE_SPEED = 4;

const DAMAGE = { punch: 25, kick: 20, smash: 35, jumpon: 40, special: 45 };
const ATTACK_DURATIONS = { punch: 18, kick: 22, smash: 30, jumpon: 40, special: 50 };
const ATTACK_HIT_FRAMES = { punch: 8, kick: 10, smash: 16, jumpon: 28, special: 20 };
const UNCONSCIOUS_THRESHOLD = 30;
const UNCONSCIOUS_DURATION = 180;
const MATCH_TIME_LIMIT = 99;

let matchTimer = MATCH_TIME_LIMIT;
let matchTimerFrames = 0;
let playerFighter = 'wyatt';
let specialCooldowns = { p1: 0, p2: 0 };

// ---- Settings ----
const settings = {
    crowdCheering: true,
    crowdSinging: true,
    damageNumbers: true,
    screenShake: true,
    hitParticles: true,
    difficulty: 'normal',   // 'easy' | 'normal' | 'hard'
    singingVolume: 3,       // 1-10
};

// Screen shake state
let shakeAmount = 0;
let shakeDuration = 0;

// ---- All Fighters ----
const FIGHTERS = {
    wyatt: {
        name: 'wyatt', displayName: 'WYATT', title: 'The Brawler',
        skin: '#d4a373', hair: '#5c3d2e', shorts: '#2563eb',
        gloves: '#dc2626', boots: '#1e3a5f', outline: '#1d4ed8',
        previewGrad: ['#3b82f6', '#1d4ed8'],
        hp: 100, aiSpeed: 3, aiDodge: 0.25, aiCooldownBase: 35,
        special: 'SEISMIC STOMP', specialDesc: 'Wyatt stomps the ring, creating a wide shockwave.',
    },
    koba: {
        name: 'koba', displayName: 'KOBA', title: 'The Beast',
        skin: '#8d6748', hair: '#1a1a1a', shorts: '#991b1b',
        gloves: '#111', boots: '#3b0000', outline: '#dc2626',
        previewGrad: ['#ef4444', '#991b1b'],
        hp: 110, aiSpeed: 3, aiDodge: 0.28, aiCooldownBase: 33,
        special: 'BOAR CHARGE', specialDesc: 'Koba dashes forward with a powerful unblockable tackle.',
    },
    henry: {
        name: 'henry', displayName: 'HENRY', title: 'The Striker',
        skin: '#c9a87c', hair: '#2d1b00', shorts: '#15803d',
        gloves: '#166534', boots: '#14532d', outline: '#22c55e',
        previewGrad: ['#22c55e', '#15803d'],
        hp: 100, aiSpeed: 4, aiDodge: 0.4, aiCooldownBase: 28,
        special: 'SWIFT BARRAGE', specialDesc: 'Henry delivers a lightning fast flurry of 5 hits.',
    },
    dylan: {
        name: 'dylan', displayName: 'DYLAN', title: 'The Mountain',
        skin: '#b8956a', hair: '#4a3520', shorts: '#57534e',
        gloves: '#78716c', boots: '#44403c', outline: '#a8a29e',
        previewGrad: ['#78716c', '#44403c'],
        hp: 150, aiSpeed: 2, aiDodge: 0.15, aiCooldownBase: 40,
        special: 'EARTH SHATTER', specialDesc: 'Dylan slams his massive fist, dealing huge area damage.',
    },
    miles: {
        name: 'miles', displayName: 'MILES', title: 'The Fury',
        skin: '#deb887', hair: '#dc2626', shorts: '#ea580c',
        gloves: '#f97316', boots: '#9a3412', outline: '#fb923c',
        previewGrad: ['#f97316', '#dc2626'],
        hp: 110, aiSpeed: 4.5, aiDodge: 0.35, aiCooldownBase: 25,
        special: 'CYCLONE KICK', specialDesc: 'Miles spins rapidly, knocking back enemies with fire.',
    },
    jace: {
        name: 'jace', displayName: 'JACE', title: 'The Ghost',
        skin: '#a0826d', hair: '#0f172a', shorts: '#1e1b4b',
        gloves: '#312e81', boots: '#1e1b4b', outline: '#6366f1',
        previewGrad: ['#6366f1', '#1e1b4b'],
        hp: 90, aiSpeed: 5, aiDodge: 0.55, aiCooldownBase: 22,
        special: 'PHANTOM STRIKE', specialDesc: 'Jace disappears and reappears behind the opponent.',
    },
    marcus: {
        name: 'marcus', displayName: 'MARCUS', title: 'The Crusher',
        skin: '#c4956a', hair: '#713f12', shorts: '#854d0e',
        gloves: '#a16207', boots: '#713f12', outline: '#eab308',
        previewGrad: ['#eab308', '#854d0e'],
        hp: 140, aiSpeed: 3.5, aiDodge: 0.3, aiCooldownBase: 30,
        special: 'IRON SMASH', specialDesc: 'Marcus ignores hits to deliver a crushing unblockable blow.',
    },
    johncena: {
        name: 'johncena', displayName: 'JOHN CENA', title: 'You Can\'t See Me',
        skin: '#d4a373', hair: '#c9a87c', shorts: '#1d4ed8',
        gloves: '#facc15', boots: '#1e40af', outline: '#facc15',
        previewGrad: ['#facc15', '#1d4ed8'],
        hp: 180, aiSpeed: 4, aiDodge: 0.5, aiCooldownBase: 20,
        special: 'VC-SMASH', specialDesc: 'Cena becomes invisible and slams the opponent from above.',
    },
};

// Boss order (excluding player pick)
const BOSS_ORDER = ['wyatt', 'koba', 'henry', 'dylan', 'miles', 'jace', 'marcus', 'johncena'];

// ---- Game State ----
let gameState = 'title'; // 'title' | 'bossIntro' | 'fight' | 'ko' | 'victory'
let selectedFighter = 'wyatt';
let currentBossIndex = 0;
let player, enemy;
let playerUsername = 'PLAYER';
let player2Username = 'PLAYER 2';
let gameMode = 'ladder'; // 'ladder' | 'pvp'

const BANNED_WORDS = ['fuck', 'shit', 'bitch', 'ass', 'damn', 'cunt', 'dick'];

// ---- Fighter Factory ----
function createFighter(name, x, facing, isPlayer) {
    const f = FIGHTERS[name];
    return {
        name: f.name,
        displayName: f.displayName,
        x,
        y: 0,
        vx: 0,
        vy: 0,
        facing,
        width: 60,
        height: 120,
        hp: f.hp,
        maxHp: f.hp,
        alive: true,
        isPlayer,
        colors: {
            skin: f.skin, hair: f.hair, shorts: f.shorts,
            gloves: f.gloves, boots: f.boots, outline: f.outline,
        },
        aiSpeed: f.aiSpeed,
        aiDodge: f.aiDodge,
        aiCooldownBase: f.aiCooldownBase,
        // states
        state: 'idle',
        attackType: null,
        attackFrame: 0,
        attackDuration: 0,
        attackHitFrame: 0,
        hasHitThisAttack: false,
        dodgeFrame: 0,
        dodgeDuration: 20,
        hurtFrame: 0,
        hurtDuration: 15,
        unconsciousFrame: 0,
        // animation
        idleTimer: 0,
        walkTimer: 0,
        bobOffset: 0,
        // AI
        aiTimer: 0,
        aiAction: null,
        aiCooldown: 0,
        // Combo
        comboCount: 0,
        comboTimer: 0,
    };
}

// ---- Fans & Stadium ----
const NUM_ROWS = 7;
const FANS_PER_ROW = 30;
let fans = [];

function initFans() {
    fans = [];
    const w = canvas.width;
    for (let row = 0; row < NUM_ROWS; row++) {
        for (let col = 0; col < FANS_PER_ROW; col++) {
            const spacing = w / (FANS_PER_ROW + 1);
            const x = spacing * (col + 1) + (Math.random() - 0.5) * (spacing * 0.3);
            fans.push({
                x,
                row,
                col,
                color: `hsl(${Math.random() * 360}, ${45 + Math.random() * 35}%, ${35 + Math.random() * 25}%)`,
                headColor: `hsl(${15 + Math.random() * 35}, ${40 + Math.random() * 30}%, ${50 + Math.random() * 25}%)`,
                hatColor: Math.random() < 0.3 ? `hsl(${Math.random() * 360}, 70%, 50%)` : null,
                phase: Math.random() * Math.PI * 2,
                speed: 0.025 + Math.random() * 0.025,
                clapPhase: Math.random() * Math.PI * 2,
                clapSpeed: 0.07 + Math.random() * 0.05,
                isClapping: false,
                size: 0.55 + Math.random() * 0.3,
                standChance: Math.random(),
            });
        }
    }
}

// ---- Arena Drawing ----
function drawArena() {
    const w = canvas.width, h = canvas.height;
    const groundY = h * GROUND_Y_RATIO;

    // Sky / arena background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, '#0a0a12');
    skyGrad.addColorStop(0.3, '#12101e');
    skyGrad.addColorStop(0.6, '#1a1025');
    skyGrad.addColorStop(1, '#2a1520');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, groundY);

    // Arena lights
    for (let i = 0; i < 7; i++) {
        const lx = w * 0.08 + (w * 0.84) * (i / 6);
        const grad = ctx.createRadialGradient(lx, 0, 0, lx, 0, h * 0.65);
        grad.addColorStop(0, 'rgba(255,255,200,0.06)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    // Spotlight beams
    const centerX = w / 2;
    ctx.save();
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#fffbe6';
    ctx.beginPath();
    ctx.moveTo(centerX - 30, 0);
    ctx.lineTo(centerX - 220, groundY);
    ctx.lineTo(centerX + 220, groundY);
    ctx.lineTo(centerX + 30, 0);
    ctx.fill();
    ctx.restore();

    // Side spotlights
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#e0e0ff';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, 0);
    ctx.lineTo(w * 0.05, groundY * 0.7);
    ctx.lineTo(w * 0.25, groundY * 0.7);
    ctx.lineTo(w * 0.15, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w * 0.85, 0);
    ctx.lineTo(w * 0.75, groundY * 0.7);
    ctx.lineTo(w * 0.95, groundY * 0.7);
    ctx.lineTo(w * 0.9, 0);
    ctx.fill();
    ctx.restore();

    // Stadium seating + fans
    drawStadium(groundY);

    // Ring
    const ringLeft = w * 0.15;
    const ringRight = w * 0.85;
    const ringW = ringRight - ringLeft;

    // Ring shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(ringLeft - 10, groundY + 2, ringW + 20, 20);

    // Ring mat
    const matGrad = ctx.createLinearGradient(ringLeft, groundY - 4, ringLeft, groundY + 14);
    matGrad.addColorStop(0, '#4a3728');
    matGrad.addColorStop(0.5, '#3d2e22');
    matGrad.addColorStop(1, '#2a1f18');
    ctx.fillStyle = matGrad;
    ctx.fillRect(ringLeft, groundY - 4, ringW, 18);

    // Ring canvas surface
    const surfGrad = ctx.createLinearGradient(ringLeft, groundY - 8, ringLeft, groundY);
    surfGrad.addColorStop(0, '#e8ddd0');
    surfGrad.addColorStop(1, '#d4c8b8');
    ctx.fillStyle = surfGrad;
    ctx.fillRect(ringLeft + 5, groundY - 8, ringW - 10, 8);

    // Center logo
    ctx.save();
    ctx.globalAlpha = 0.1;
    ctx.font = `bold ${Math.min(60, w * 0.05)}px 'Bebas Neue', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#b91c1c';
    ctx.fillText('RING RIVALS', centerX, groundY - 1);
    ctx.restore();

    // Ring posts
    const postPositions = [ringLeft + 8, ringRight - 8];
    postPositions.forEach(px => {
        ctx.fillStyle = '#b0b0b0';
        ctx.fillRect(px - 4, groundY - 110, 8, 112);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(px, groundY - 110, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.fillRect(px - 8, groundY - 2, 16, 6);
    });

    // Ropes
    const ropeColors = ['#dc2626', '#ffffff', '#dc2626'];
    const ropeYs = [groundY - 95, groundY - 65, groundY - 35];
    ropeYs.forEach((ry, idx) => {
        ctx.strokeStyle = ropeColors[idx];
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(postPositions[0], ry);
        ctx.quadraticCurveTo(centerX, ry + 6, postPositions[1], ry);
        ctx.stroke();
    });

    // Below ring
    ctx.fillStyle = '#0a0808';
    ctx.fillRect(0, groundY + 14, w, h - groundY - 14);

    // Ring skirt
    const skirtGrad = ctx.createLinearGradient(ringLeft, groundY + 14, ringLeft, groundY + 60);
    skirtGrad.addColorStop(0, '#1a1a2e');
    skirtGrad.addColorStop(1, '#0a0a14');
    ctx.fillStyle = skirtGrad;
    ctx.fillRect(ringLeft - 5, groundY + 12, ringW + 10, 50);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(ringLeft - 5, groundY + 14, ringW + 10, 3);

    // Floor
    const floorGrad = ctx.createLinearGradient(0, groundY + 60, 0, h);
    floorGrad.addColorStop(0, '#1a1510');
    floorGrad.addColorStop(1, '#0a0806');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, groundY + 60, w, h - groundY - 60);
}

function drawStadium(groundY) {
    const w = canvas.width;
    const baseY = groundY - 120;
    const rowH = 28;
    const seatW = w / (FANS_PER_ROW + 1);

    // Draw bleacher rows from back to front
    for (let row = NUM_ROWS - 1; row >= 0; row--) {
        const rowY = baseY - row * rowH;
        const darken = 1 - row * 0.08;

        // Bleacher step platform
        const stepGrad = ctx.createLinearGradient(0, rowY + 2, 0, rowY + rowH);
        stepGrad.addColorStop(0, `rgba(60, 50, 65, ${darken})`);
        stepGrad.addColorStop(0.5, `rgba(45, 38, 50, ${darken})`);
        stepGrad.addColorStop(1, `rgba(35, 28, 40, ${darken})`);
        ctx.fillStyle = stepGrad;
        ctx.fillRect(0, rowY + 2, w, rowH);

        // Step edge highlight
        ctx.fillStyle = `rgba(80, 70, 90, ${darken * 0.6})`;
        ctx.fillRect(0, rowY + 2, w, 2);

        // Step shadow
        ctx.fillStyle = `rgba(0, 0, 0, ${0.3 * darken})`;
        ctx.fillRect(0, rowY + rowH, w, 3);

        // Individual seat backs
        for (let col = 0; col < FANS_PER_ROW; col++) {
            const sx = seatW * (col + 1);
            const seatHalfW = seatW * 0.35;

            // Seat back
            ctx.fillStyle = `rgba(50, 42, 58, ${darken})`;
            ctx.beginPath();
            ctx.moveTo(sx - seatHalfW, rowY + 6);
            ctx.lineTo(sx - seatHalfW, rowY - 4);
            ctx.quadraticCurveTo(sx, rowY - 8, sx + seatHalfW, rowY - 4);
            ctx.lineTo(sx + seatHalfW, rowY + 6);
            ctx.fill();

            // Seat outline
            ctx.strokeStyle = `rgba(70, 60, 80, ${darken * 0.5})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(sx - seatHalfW, rowY + 6);
            ctx.lineTo(sx - seatHalfW, rowY - 4);
            ctx.quadraticCurveTo(sx, rowY - 8, sx + seatHalfW, rowY - 4);
            ctx.lineTo(sx + seatHalfW, rowY + 6);
            ctx.stroke();

            // Armrests
            ctx.fillStyle = `rgba(40, 34, 48, ${darken})`;
            ctx.fillRect(sx - seatHalfW - 1, rowY + 2, 2, 8);
            ctx.fillRect(sx + seatHalfW - 1, rowY + 2, 2, 8);
        }

        // Draw fans in this row
        const rowFans = fans.filter(f => f.row === row);
        rowFans.forEach(fan => {
            drawFan(fan, rowY, darken);
        });
    }

    // Barrier wall between crowd and ring
    const barrierY = baseY + 10;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, barrierY, w, 14);
    ctx.fillStyle = '#333';
    ctx.fillRect(0, barrierY, w, 2);
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(0, barrierY + 6, w, 2);
}

function drawFan(fan, rowY, darken) {
    const sway = Math.sin(fan.phase) * 1.5;
    const s = fan.size;
    const fy = rowY;
    const standing = fan.isClapping && fan.standChance > 0.65;
    const standOffset = standing ? -6 : 0;

    ctx.save();
    ctx.globalAlpha = darken;

    // Body
    ctx.fillStyle = fan.color;
    ctx.fillRect(fan.x - 5 * s + sway, fy - 8 * s + standOffset, 10 * s, 14 * s);

    // Head
    ctx.fillStyle = fan.headColor;
    ctx.beginPath();
    ctx.arc(fan.x + sway, fy - 13 * s + standOffset, 5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Face details
    ctx.fillStyle = '#111';
    // Eyes
    ctx.beginPath();
    ctx.arc(fan.x + sway - 1.5 * s, fy - 14 * s + standOffset, 0.8 * s, 0, Math.PI * 2);
    ctx.arc(fan.x + sway + 1.5 * s, fy - 14 * s + standOffset, 0.8 * s, 0, Math.PI * 2);
    ctx.fill();
    // Nose
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(fan.x + sway, fy - 12.5 * s + standOffset, 0.6 * s, 0, Math.PI * 2);
    ctx.fill();
    // Mouth
    ctx.beginPath();
    if (fan.isClapping) {
        ctx.fillStyle = '#311'; // cheering open mouth
        ctx.arc(fan.x + sway, fy - 11 * s + standOffset, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.strokeStyle = '#111'; // smile line
        ctx.lineWidth = 0.6 * s;
        ctx.arc(fan.x + sway, fy - 11.5 * s + standOffset, 1.5 * s, 0, Math.PI);
        ctx.stroke();
    }

    // Hat
    if (fan.hatColor) {
        ctx.fillStyle = fan.hatColor;
        ctx.fillRect(fan.x - 6 * s + sway, fy - 18 * s + standOffset, 12 * s, 3 * s);
        ctx.fillRect(fan.x - 4 * s + sway, fy - 21 * s + standOffset, 8 * s, 4 * s);
    }

    // Arms
    if (fan.isClapping) {
        const clapAngle = Math.sin(fan.clapPhase) * 0.6;
        ctx.strokeStyle = fan.headColor;
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(fan.x - 5 * s + sway, fy - 2 * s + standOffset);
        ctx.lineTo(fan.x - 1 * s + sway + clapAngle * 7, fy - 16 * s + standOffset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fan.x + 5 * s + sway, fy - 2 * s + standOffset);
        ctx.lineTo(fan.x + 1 * s + sway - clapAngle * 7, fy - 16 * s + standOffset);
        ctx.stroke();
    } else {
        ctx.strokeStyle = fan.headColor;
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(fan.x - 5 * s + sway, fy - 2 * s);
        ctx.lineTo(fan.x - 8 * s + sway, fy + 5 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(fan.x + 5 * s + sway, fy - 2 * s);
        ctx.lineTo(fan.x + 8 * s + sway, fy + 5 * s);
        ctx.stroke();
    }

    ctx.restore();

    fan.phase += fan.speed;
    if (fan.isClapping) fan.clapPhase += fan.clapSpeed;
}

function setFansClapping(clapping) {
    fans.forEach(f => f.isClapping = clapping);
}

// ---- Fighter Drawing ----
function drawFighter(f) {
    const groundY = canvas.height * GROUND_Y_RATIO;
    const x = f.x;
    const y = groundY - f.height + f.y;
    const dir = f.facing;
    const c = f.colors;
    const bob = Math.sin(f.idleTimer * 0.06) * 2;
    const walkBob = Math.sin(f.walkTimer * 0.15) * 3;
    const currentBob = f.state === 'walk' ? walkBob : bob;

    ctx.save();
    ctx.translate(x, y + currentBob);

    if (f.state === 'dodge') {
        ctx.translate(dir * -20 * (1 - f.dodgeFrame / f.dodgeDuration), 0);
    }
    if (f.state === 'hurt') {
        ctx.translate(Math.sin(f.hurtFrame * 2) * 4, 0);
    }
    if (f.state === 'unconscious') {
        ctx.translate(0, 40);
        ctx.rotate(dir * Math.PI / 2 * 0.5);
        ctx.globalAlpha = 0.7 + Math.sin(f.unconsciousFrame * 0.1) * 0.2;
    }

    // Shadow
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(0, f.height - 2 - currentBob, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Boots
    ctx.fillStyle = c.boots;
    ctx.fillRect(-14, f.height - 22, 12, 22);
    ctx.fillRect(4, f.height - 22, 12, 22);

    // Legs
    ctx.fillStyle = c.skin;
    ctx.fillRect(-12, f.height - 45, 10, 25);
    ctx.fillRect(4, f.height - 45, 10, 25);

    // Shorts
    ctx.fillStyle = c.shorts;
    ctx.fillRect(-16, f.height - 62, 34, 20);
    ctx.fillStyle = c.outline;
    ctx.fillRect(-16, f.height - 62, 34, 4);

    // Torso
    ctx.fillStyle = c.skin;
    ctx.fillRect(-14, f.height - 90, 30, 30);

    // Chest line
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1, f.height - 88);
    ctx.lineTo(1, f.height - 64);
    ctx.stroke();

    // 6-Pack Abs Lines
    ctx.beginPath();
    ctx.moveTo(-3, f.height - 82);
    ctx.lineTo(5, f.height - 82);
    ctx.moveTo(-3, f.height - 75);
    ctx.lineTo(5, f.height - 75);
    ctx.moveTo(-2, f.height - 68);
    ctx.lineTo(4, f.height - 68);
    ctx.stroke();

    // Head
    ctx.fillStyle = c.skin;
    ctx.beginPath();
    ctx.arc(2, f.height - 100, 14, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = c.hair;
    ctx.beginPath();
    ctx.arc(2, f.height - 106, 12, Math.PI, 0);
    ctx.fill();

    // Eyes
    const eyeX = 2 + dir * 5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeX - 3, f.height - 102, 3, 0, Math.PI * 2);
    ctx.arc(eyeX + 5, f.height - 102, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(eyeX - 2 + dir, f.height - 102, 1.5, 0, Math.PI * 2);
    ctx.arc(eyeX + 6 + dir, f.height - 102, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth when hurt
    if (f.state === 'hurt' || f.state === 'unconscious') {
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(eyeX + 1, f.height - 94, 3, 0, Math.PI);
        ctx.stroke();
    }

    // Arms
    drawArms(f, c, dir, currentBob);

    ctx.restore();
}

function drawArms(f, c, dir, bob) {
    const h = f.height;

    if (f.state === 'attack' && f.attackType === 'punch') {
        const progress = f.attackFrame / f.attackDuration;
        const extend = progress < 0.4 ? progress / 0.4 : 1 - (progress - 0.4) / 0.6;
        ctx.fillStyle = c.skin;
        ctx.save();
        ctx.translate(dir * 14, h - 85);
        ctx.fillRect(0, -4, dir * 40 * extend, 8);
        ctx.fillStyle = c.gloves;
        ctx.beginPath();
        ctx.arc(dir * 40 * extend, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawRestArm(c, -dir, h);
    } else if (f.state === 'attack' && f.attackType === 'kick') {
        const progress = f.attackFrame / f.attackDuration;
        const extend = progress < 0.35 ? progress / 0.35 : 1 - (progress - 0.35) / 0.65;
        ctx.fillStyle = c.skin;
        ctx.save();
        ctx.translate(dir * 8, h - 35);
        ctx.fillRect(0, -4, dir * 45 * extend, 8);
        ctx.fillStyle = c.boots;
        ctx.fillRect(dir * 45 * extend - dir * 6, -6, dir * 10, 12);
        ctx.restore();
        drawRestArm(c, dir, h);
        drawRestArm(c, -dir, h);
    } else if (f.state === 'attack' && f.attackType === 'smash') {
        const progress = f.attackFrame / f.attackDuration;
        let angle;
        if (progress < 0.4) {
            angle = -Math.PI * 0.6 * (progress / 0.4);
        } else if (progress < 0.6) {
            angle = -Math.PI * 0.6 + Math.PI * 1.2 * ((progress - 0.4) / 0.2);
        } else {
            angle = Math.PI * 0.6 * (1 - (progress - 0.6) / 0.4);
        }
        ctx.save();
        ctx.translate(dir * 8, h - 85);
        ctx.rotate(dir * angle);
        ctx.fillStyle = c.skin;
        ctx.fillRect(0, -4, 35, 8);
        ctx.fillStyle = c.gloves;
        ctx.beginPath();
        ctx.arc(35, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    } else if (f.state === 'attack' && f.attackType === 'jumpon') {
        const progress = f.attackFrame / f.attackDuration;
        const armUp = progress < 0.6 ? 1 : 1 - (progress - 0.6) / 0.4;
        drawJumpArm(c, dir, h, armUp);
        drawJumpArm(c, -dir, h, armUp);
    } else {
        drawRestArm(c, dir, h);
        drawRestArm(c, -dir, h);
    }
}

function drawRestArm(c, side, h) {
    const swing = Math.sin(Date.now() * 0.003) * 3;
    ctx.fillStyle = c.skin;
    ctx.fillRect(side * 14, h - 85, side * 8, 28 + swing);
    ctx.fillStyle = c.gloves;
    ctx.beginPath();
    ctx.arc(side * 22, h - 57 + swing, 7, 0, Math.PI * 2);
    ctx.fill();
}

function drawJumpArm(c, side, h, up) {
    ctx.fillStyle = c.skin;
    ctx.save();
    ctx.translate(side * 14, h - 85);
    ctx.rotate(side * (-Math.PI * 0.5 * up));
    ctx.fillRect(0, -4, side * 20, 8);
    ctx.fillStyle = c.gloves;
    ctx.beginPath();
    ctx.arc(side * 20, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

// ---- Particles ----
let particles = [];

function spawnHitParticles(x, y, color) {
    if (!settings.hitParticles) return;
    for (let i = 0; i < 12; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 6 - 2,
            life: 20 + Math.random() * 15,
            maxLife: 35,
            size: 2 + Math.random() * 4,
            color: color || '#ffdd57',
        });
    }
}

function spawnDamageNumber(x, y, dmg) {
    if (!settings.damageNumbers) return;
    particles.push({
        x, y: y - 20,
        vx: (Math.random() - 0.5) * 2,
        vy: -3,
        life: 40,
        maxLife: 40,
        isDamageNum: true,
        text: `-${dmg}`,
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (!p.isDamageNum) p.vy += 0.3;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        const alpha = p.life / p.maxLife;
        if (p.isDamageNum) {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 22px Inter, sans-serif';
            ctx.fillStyle = '#ff4444';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.textAlign = 'center';
            ctx.strokeText(p.text, p.x, p.y);
            ctx.fillText(p.text, p.x, p.y);
            ctx.restore();
        } else {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// ---- Input ----
const keys = {};
window.addEventListener('keydown', e => {
    const key = e.key.toLowerCase();
    keys[key] = true;
    
    if (gameState === 'fight') {
        if (key === ' ') {
            handleAction(player, 'special');
        }
        if (key === 'u' && gameMode === 'pvp') {
            handleAction(enemy, 'special');
        }

        // Player 1 Keys (F, G, H, T, Y)
        const p1Keys = ['f', 'g', 'h', 't', 'y'];
        if (p1Keys.includes(key)) {
            const p1ActionMap = { f: 'punch', g: 'kick', h: 'smash', t: 'jumpon', y: 'dodge' };
            handleAction(player, p1ActionMap[key]);
        }
        
        // Player 2 Keys (P, K, L, I, O)
        const p2Keys = ['p', 'k', 'l', 'i', 'o'];
        if (p2Keys.includes(key)) {
            const p2ActionMap = { p: 'punch', k: 'kick', l: 'smash', i: 'jumpon', o: 'dodge' };
            if (gameMode === 'pvp') {
                handleAction(enemy, p2ActionMap[key]);
            } else if (key === 'p' || key === 'k' || key === 's' || key === 'j' || key === 'd') {
                const ladderMap = { p: 'punch', k: 'kick', s: 'smash', j: 'jumpon', d: 'dodge' };
                handleAction(player, ladderMap[key]);
            }
        }
    }
});
window.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    keys[key] = false;
});

function handleAction(f, action) {
    if (!f || f.state === 'hurt' || f.state === 'unconscious' || !f.alive) return;
    if (f.state === 'attack' || f.state === 'dodge') return;

    if (action === 'special') {
        const sid = f === player ? 'p1' : 'p2';
        if (specialCooldowns[sid] > 0) return;
        f.state = 'attack';
        f.attackType = 'special';
        f.attackFrame = 0;
        f.attackDuration = ATTACK_DURATIONS.special;
        f.attackHitFrame = ATTACK_HIT_FRAMES.special;
        f.hasHitThisAttack = false;
        specialCooldowns[sid] = 400; // ~6.5 second cooldown @ 60fps
        showActionText(`${f.displayName.toUpperCase()}: ${FIGHTERS[f.name].special}!`);
        return;
    }

    if (action === 'dodge') {
        f.state = 'dodge';
        f.dodgeFrame = 0;
        return;
    }

    if (action === 'jumpon') {
        const other = (f === player) ? enemy : player;
        if (other.state !== 'unconscious') {
            if (f === player) showActionText('OPPONENT MUST BE DOWN!');
            return;
        }
    }

    f.state = 'attack';
    f.attackType = action;
    f.attackFrame = 0;
    f.attackDuration = ATTACK_DURATIONS[action];
    f.attackHitFrame = ATTACK_HIT_FRAMES[action];
    f.hasHitThisAttack = false;

    if (action === 'jumpon') {
        f.vy = -14;
    }
}

// ---- Combat ----
function getDistance(a, b) {
    return Math.abs(a.x - b.x);
}

function checkAttackHit(attacker, defender) {
    if (attacker.hasHitThisAttack) return;
    if (defender.state === 'dodge') {
        if (attacker.isPlayer) attacker.comboCount = 0; // combo break on dodge
        return;
    }
    if (attacker.attackFrame !== attacker.attackHitFrame) return;

    const dist = getDistance(attacker, defender);
    if (dist > STRIKING_RANGE) return;

    attacker.hasHitThisAttack = true;
    const dmg = DAMAGE[attacker.attackType];
    defender.hp = Math.max(0, defender.hp - dmg);

    // Combo logic
    if (attacker.isPlayer) {
        attacker.comboCount++;
        attacker.comboTimer = 180; // 3 seconds to keep combo alive
        updateComboUI(attacker.comboCount);
    }
    if (defender.isPlayer) {
        defender.comboCount = 0; // Break player's combo if they get hit
        updateComboUI(0);
    }

    defender.state = 'hurt';
    defender.hurtFrame = 0;
    defender.vx = attacker.facing * 6;

    const hitY = canvas.height * GROUND_Y_RATIO - defender.height * 0.6;
    spawnHitParticles(defender.x, hitY, attacker.attackType === 'smash' ? '#ff6b35' : '#ffdd57');
    spawnDamageNumber(defender.x, hitY, dmg);
    showActionText(attacker.attackType.toUpperCase() + '!');

    // Screen shake on hit
    if (settings.screenShake) {
        shakeAmount = attacker.attackType === 'smash' ? 8 : attacker.attackType === 'jumpon' ? 10 : 4;
        shakeDuration = 10;
    }

    if (defender.hp <= UNCONSCIOUS_THRESHOLD && defender.hp > 0 && defender.state !== 'unconscious') {
        defender.state = 'unconscious';
        defender.unconsciousFrame = 0;
    }

    if (defender.hp <= 0) {
        defender.hp = 0;
        defender.alive = false;
        triggerKO(attacker);
    }
}

function triggerKO(winner) {
    gameState = 'ko';
    if (settings.crowdCheering) {
        setFansClapping(true);
    }
    if (settings.crowdSinging) {
        startCrowdSinging();
    }

    document.getElementById('ko-overlay').classList.remove('hidden');
    document.getElementById('winner-text').textContent = winner.displayName + ' WINS!';

    const nextBossBtn = document.getElementById('next-boss-btn');
    // Show "NEXT BOSS" only if the player won and there are more bosses AND in ladder mode
    if (winner.isPlayer && gameMode === 'ladder' && currentBossIndex < getBossLadder().length - 1) {
        nextBossBtn.classList.remove('hidden');
    } else {
        nextBossBtn.classList.add('hidden');
    }

    // If player beat the final boss
    if (winner.isPlayer && currentBossIndex >= getBossLadder().length - 1) {
        setTimeout(() => {
            document.getElementById('ko-overlay').classList.add('hidden');
            document.getElementById('victory-screen').classList.remove('hidden');
            triggerConfetti();
        }, 2000);
    }
}

function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#42e2b8', '#ffffff'];
    for (let i = 0; i < 4500; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.animationDuration = (Math.random() * 3 + 2.5) + 's';
        conf.style.animationDelay = (Math.random() * 5) + 's';
        conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        container.appendChild(conf);
    }
}

function showActionText(text) {
    const el = document.getElementById('action-text');
    el.textContent = text;
    el.classList.remove('hidden');
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';
    setTimeout(() => el.classList.add('hidden'), 500);
}

function updateComboUI(count) {
    const el = document.getElementById('combo-display');
    if (count < 2) {
        el.classList.add('hidden');
        return;
    }
    el.classList.remove('hidden');
    
    // Retrigger CSS animation
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = '';

    document.getElementById('combo-count').textContent = count;
    playComboAnnouncer(count);
}

function playComboAnnouncer(count) {
    if (!('speechSynthesis' in window)) return;
    
    let text = null;
    if (count === 3) text = "3 hit combo!";
    else if (count === 5) text = "5 hits! Awesome!";
    else if (count === 7) text = "7 hits! Unstoppable!";
    else if (count === 10) text = "10 hits! Godlike!";

    if (text) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.volume = settings.singingVolume / 10;
        utterance.rate = 1.2;
        utterance.pitch = 1.5;
        window.speechSynthesis.speak(utterance);
    }
}

// ---- AI ----
function updateAI(ai, target) {
    if (ai.state === 'hurt' || ai.state === 'unconscious' || !ai.alive) return;
    if (ai.state === 'attack' || ai.state === 'dodge') return;

    ai.aiCooldown = Math.max(0, ai.aiCooldown - 1);
    if (ai.aiCooldown > 0) return;

    const dist = getDistance(ai, target);
    ai.facing = target.x > ai.x ? 1 : -1;

    // Close distance
    if (dist > STRIKING_RANGE + 20) {
        ai.state = 'walk';
        ai.vx = ai.facing * (ai.aiSpeed || 3) / getDifficultyMultiplier();
        ai.aiCooldown = 5;
        return;
    }

    const rand = Math.random();
    const dodgeChance = (ai.aiDodge || 0.25) / getDifficultyMultiplier();
    const cooldownBase = (ai.aiCooldownBase || 35) * getDifficultyMultiplier();

    // Dodge
    if (target.state === 'attack' && rand < dodgeChance) {
        ai.state = 'dodge';
        ai.dodgeFrame = 0;
        ai.aiCooldown = cooldownBase - 5;
        return;
    }

    // Attack selection
    if (rand < 0.45) {
        ai.state = 'attack';
        ai.attackType = 'punch';
        ai.attackFrame = 0;
        ai.attackDuration = ATTACK_DURATIONS.punch;
        ai.attackHitFrame = ATTACK_HIT_FRAMES.punch;
        ai.hasHitThisAttack = false;
        ai.aiCooldown = cooldownBase;
    } else if (rand < 0.65) {
        ai.state = 'attack';
        ai.attackType = 'kick';
        ai.attackFrame = 0;
        ai.attackDuration = ATTACK_DURATIONS.kick;
        ai.attackHitFrame = ATTACK_HIT_FRAMES.kick;
        ai.hasHitThisAttack = false;
        ai.aiCooldown = cooldownBase + 5;
    } else if (rand < 0.82) {
        ai.state = 'attack';
        ai.attackType = 'smash';
        ai.attackFrame = 0;
        ai.attackDuration = ATTACK_DURATIONS.smash;
        ai.attackHitFrame = ATTACK_HIT_FRAMES.smash;
        ai.hasHitThisAttack = false;
        ai.aiCooldown = cooldownBase + 10;
    } else if (target.state === 'unconscious') {
        ai.state = 'attack';
        ai.attackType = 'jumpon';
        ai.attackFrame = 0;
        ai.attackDuration = ATTACK_DURATIONS.jumpon;
        ai.attackHitFrame = ATTACK_HIT_FRAMES.jumpon;
        ai.hasHitThisAttack = false;
        ai.vy = -14;
        ai.aiCooldown = cooldownBase + 20;
    } else {
        ai.vx = -ai.facing * 3;
        ai.state = 'walk';
        ai.aiCooldown = cooldownBase - 10;
    }
}

// ---- Update Fighter ----
function updateFighter(f) {
    const ringLeft = canvas.width * 0.15 + 20;
    const ringRight = canvas.width * 0.85 - 20;

    f.idleTimer++;

    f.vy += GRAVITY;
    f.y += f.vy;
    if (f.y >= 0) { f.y = 0; f.vy = 0; }

    // Player 1 Movement (WASD)
    if (f === player && f.state === 'idle' || f.state === 'walk') {
        if (keys['a']) {
            f.vx = -MOVE_SPEED;
            f.state = 'walk';
            f.facing = -1;
        } else if (keys['d']) {
            f.vx = MOVE_SPEED;
            f.state = 'walk';
            f.facing = 1;
        } else if (f.state === 'walk') {
            f.vx = 0;
            f.state = 'idle';
        }
    }

    // Player 2 Movement (Arrows) - Only if in PVP mode
    if (f === enemy && gameMode === 'pvp' && (f.state === 'idle' || f.state === 'walk')) {
        if (keys['arrowleft']) {
            f.vx = -MOVE_SPEED;
            f.state = 'walk';
            f.facing = -1;
        } else if (keys['arrowright']) {
            f.vx = MOVE_SPEED;
            f.state = 'walk';
            f.facing = 1;
        } else if (f.state === 'walk') {
            f.vx = 0;
            f.state = 'idle';
        }
    }

    // Backward compatibility for Arrow keys on P1 in ladder mode
    if (f === player && gameMode === 'ladder' && f.state !== 'attack' && f.state !== 'hurt' &&
        f.state !== 'dodge' && f.state !== 'unconscious' && gameState === 'fight') {
        if (keys['arrowleft']) {
            f.vx = -MOVE_SPEED;
            f.state = 'walk';
            f.facing = -1;
        } else if (keys['arrowright']) {
            f.vx = MOVE_SPEED;
            f.state = 'walk';
            f.facing = 1;
        }
    }

    f.x += f.vx;
    f.vx *= 0.85;
    f.x = Math.max(ringLeft, Math.min(ringRight, f.x));

    if (f.state === 'walk') f.walkTimer++;
    else f.walkTimer = 0;

    if (f.state === 'attack') {
        f.attackFrame++;
        if (f.attackFrame >= f.attackDuration) {
            f.state = 'idle';
            f.attackType = null;
        }
    }

    if (f.state === 'dodge') {
        f.dodgeFrame++;
        if (f.dodgeFrame >= f.dodgeDuration) f.state = 'idle';
    }

    if (f.state === 'hurt') {
        f.hurtFrame++;
        if (f.hurtFrame >= f.hurtDuration) {
            if (f.hp <= UNCONSCIOUS_THRESHOLD && f.hp > 0) {
                f.state = 'unconscious';
                f.unconsciousFrame = 0;
            } else if (f.hp > 0) {
                f.state = 'idle';
            }
        }
    }

    if (f.state === 'unconscious') {
        f.unconsciousFrame++;
        if (f.unconsciousFrame >= UNCONSCIOUS_DURATION) {
            f.state = 'idle';
            f.unconsciousFrame = 0;
        }
    }

    // Combo timer
    if (f.comboCount > 0) {
        f.comboTimer--;
        if (f.comboTimer <= 0) {
            f.comboCount = 0;
            if (f.isPlayer) updateComboUI(0);
        }
    }
}

// ---- HUD ----
function updateHUD() {
    document.getElementById('p1-health').style.width = (player.hp / player.maxHp * 100) + '%';
    document.getElementById('p2-health').style.width = (enemy.hp / enemy.maxHp * 100) + '%';
    document.getElementById('p1-name').textContent = playerUsername;
    document.getElementById('p2-name').textContent = enemy.displayName;
    document.getElementById('match-timer').textContent = matchTimer;
    
    // Cooldown visuals
    document.getElementById('p1-health').parentElement.style.opacity = specialCooldowns.p1 > 0 ? 0.6 : 1;
    document.getElementById('p2-health').parentElement.style.opacity = specialCooldowns.p2 > 0 ? 0.6 : 1;

    if (gameMode === 'ladder') {
        document.getElementById('round-info').textContent = 'BOSS ' + (currentBossIndex + 1);
        document.getElementById('boss-label').textContent = `${currentBossIndex + 1} OF ${BOSS_ORDER.length}`;
    } else {
        document.getElementById('round-info').textContent = 'PVP MATCH';
        document.getElementById('boss-label').textContent = 'VS';
    }
}

function initRoster() {
    const grid = document.getElementById('roster-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    Object.keys(FIGHTERS).forEach(key => {
        const f = FIGHTERS[key];
        const item = document.createElement('div');
        item.className = 'roster-item';
        if (key === playerFighter) item.classList.add('selected');
        
        item.innerHTML = `
            <div style="background: linear-gradient(135deg, ${f.previewGrad[0]}, ${f.previewGrad[1]}); width:100%; height:80px; margin-bottom:10px;"></div>
            <span class="roster-name">${f.displayName}</span>
        `;
        
        item.onmouseover = () => updatePreview(key);
        item.onclick = () => {
            document.querySelectorAll('.roster-item').forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            playerFighter = key;
        };
        
        grid.appendChild(item);
    });
    // Set initial preview
    updatePreview(playerFighter);
}

function updatePreview(key) {
    const f = FIGHTERS[key];
    const nameEl = document.getElementById('preview-name');
    if (!nameEl) return;
    nameEl.textContent = f.displayName;
    document.getElementById('preview-title').textContent = f.title;
    document.getElementById('preview-special').textContent = 'SPECIAL: ' + f.special;
    document.getElementById('preview-display').style.background = `linear-gradient(135deg, ${f.previewGrad[0]}, ${f.previewGrad[1]})`;
}

// ---- Boss Ladder ----
function getBossLadder() {
    return BOSS_ORDER;
}

function showBossIntro() {
    const ladder = getBossLadder();
    const bossData = FIGHTERS[ladder[currentBossIndex]];

    gameState = 'bossIntro';

    // Hide everything else
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('ko-overlay').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');

    // Populate boss intro
    document.getElementById('boss-round-label').textContent = `BOSS ${currentBossIndex + 1} / ${ladder.length}`;
    document.getElementById('boss-intro-name').textContent = bossData.displayName;
    document.getElementById('boss-intro-title').textContent = bossData.title;
    document.getElementById('boss-intro-preview').style.background =
        `linear-gradient(135deg, ${bossData.previewGrad[0]}, ${bossData.previewGrad[1]})`;
    document.getElementById('boss-stat-hp').textContent = `HP: ${bossData.hp}`;

    const diffLabels = ['Easy', 'Easy', 'Medium', 'Medium', 'Hard', 'Hard', 'EXTREME'];
    document.getElementById('boss-stat-diff').textContent = diffLabels[currentBossIndex] || 'EXTREME';

    document.getElementById('boss-intro').classList.remove('hidden');
}

function startBossFight() {
    const w = canvas.width;
    const ladder = getBossLadder();
    const bossName = ladder[currentBossIndex];

    player = createFighter(playerFighter, w * 0.3, 1, true);
    player.displayName = playerUsername;
    
    if (gameMode === 'ladder') {
        enemy = createFighter(bossName, w * 0.7, -1, false);
    } else {
        // PvP Mode: Player vs Player
        enemy = createFighter('koba', w * 0.7, -1, true); 
        enemy.displayName = player2Username;
    }

    matchTimer = MATCH_TIME_LIMIT;
    matchTimerFrames = 0;
    specialCooldowns = { p1: 0, p2: 0 };

    particles = [];
    gameState = 'fight';
    setFansClapping(false);
    stopCrowdSinging();

    document.getElementById('boss-intro').classList.add('hidden');
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('ko-overlay').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
}

function startPvP() {
    const inputEl = document.getElementById('username-input');
    const errorEl = document.getElementById('username-error');
    const username = inputEl.value.trim().toUpperCase() || 'PLAYER 1';
    
    // Simple validation for P1 name
    if (username.length > 8 || (username.length > 0 && !/^[A-Z0-9]+$/.test(username))) {
        errorEl.textContent = "INVALID USERNAME (1-8 LETTERS/NUMS ONLY)";
        errorEl.classList.remove('hidden');
        return;
    }
    
    // Quick prompt for Player 2 name
    let p2name = prompt("ENTER PLAYER 2 NAME:", "PLAYER 2");
    if (!p2name) p2name = "PLAYER 2";
    p2name = p2name.trim().toUpperCase().substring(0, 8);
    if (!/^[A-Z0-9 ]*$/.test(p2name)) p2name = "PLAYER 2";

    errorEl.classList.add('hidden');
    playerUsername = username;
    player2Username = p2name || 'PLAYER 2';
    gameMode = 'pvp';
    startBossFight();
}

function goToMenu() {
    gameState = 'title';
    gameMode = 'ladder';
    currentBossIndex = 0;
    stopCrowdSinging();
    document.getElementById('title-screen').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('ko-overlay').classList.add('hidden');
    document.getElementById('boss-intro').classList.add('hidden');
    document.getElementById('victory-screen').classList.add('hidden');
}

// ---- Game Loop ----
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Screen shake
    ctx.save();
    if (shakeDuration > 0) {
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(sx, sy);
        shakeDuration--;
        if (shakeDuration <= 0) shakeAmount = 0;
    }

    drawArena();

    if (gameState === 'fight' || gameState === 'ko') {
        if (gameState === 'fight') {
            if (player.state !== 'attack' && player.state !== 'dodge') {
                if (!keys['arrowleft'] && !keys['arrowright']) {
                    player.facing = enemy.x > player.x ? 1 : -1;
                }
            }
        }

        updateFighter(player);
        updateFighter(enemy);

        if (gameState === 'fight') {
            if (gameMode === 'ladder') updateAI(enemy, player);
            if (player.state === 'attack') checkAttackHit(player, enemy);
            if (enemy.state === 'attack') checkAttackHit(enemy, player);

            // Timer Logic
            matchTimerFrames++;
            if (matchTimerFrames >= 60) {
                matchTimer--;
                matchTimerFrames = 0;
                if (matchTimer <= 0) {
                    matchTimer = 0;
                    handleTimeOver();
                }
            }
        }

        if (player.x < enemy.x) {
            drawFighter(player);
            drawFighter(enemy);
        } else {
            drawFighter(enemy);
            drawFighter(player);
        }

        updateParticles();
        updateHUD();
    }

    // Cooldown updates
    if (specialCooldowns.p1 > 0) specialCooldowns.p1--;
    if (specialCooldowns.p2 > 0) specialCooldowns.p2--;

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

function handleTimeOver() {
    gameState = 'ko';
    let winner = null;
    if (player.hp > enemy.hp) winner = player;
    else if (enemy.hp > player.hp) winner = enemy;

    if (winner) {
        document.getElementById('winner-text').textContent = (winner === player ? playerUsername : enemy.displayName) + " WINS BY DECISION!";
        if (winner === player && gameMode === 'ladder') {
            document.getElementById('next-boss-btn').classList.remove('hidden');
        }
    } else {
        document.getElementById('winner-text').textContent = "DRAW!";
    }
    
    document.getElementById('ko-text').textContent = "TIME OVER!";
    document.getElementById('ko-overlay').classList.remove('hidden');
}

// ---- UI Events ----
document.getElementById('start-btn').addEventListener('click', () => {
    const inputEl = document.getElementById('username-input');
    const errorEl = document.getElementById('username-error');
    const username = inputEl.value.trim().toUpperCase();

    if (!/^[A-Z0-9]{1,8}$/.test(username)) {
        errorEl.textContent = "INVALID USERNAME (1-8 LETTERS/NUMS ONLY)";
        errorEl.classList.remove('hidden');
        return;
    }
    
    const lowerName = username.toLowerCase();
    if (BANNED_WORDS.some(word => lowerName.includes(word))) {
        errorEl.textContent = "INVALID USERNAME (PROFANITY DETECTED)";
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');
    playerUsername = username;
    
    // Switch to Fighter Select
    document.getElementById('title-screen').classList.add('hidden');
    document.getElementById('fighter-select').classList.remove('hidden');
    initRoster();
});

document.getElementById('select-confirm-btn').addEventListener('click', () => {
    document.getElementById('fighter-select').classList.add('hidden');
    gameMode = 'ladder';
    currentBossIndex = 0;
    showBossIntro();
});

document.getElementById('boss-fight-btn').addEventListener('click', startBossFight);

document.getElementById('next-boss-btn').addEventListener('click', () => {
    currentBossIndex++;
    showBossIntro();
});

document.getElementById('rematch-btn').addEventListener('click', () => {
    startBossFight();
});

document.getElementById('local-mp-btn').addEventListener('click', startPvP);

document.getElementById('menu-btn').addEventListener('click', goToMenu);
document.getElementById('victory-menu-btn').addEventListener('click', goToMenu);

// ---- Crowd Singing (Text-to-Speech) ----
let crowdSingInterval = null;
let isSinging = false;

function startCrowdSinging() {
    if (!settings.crowdSinging || isSinging) return;
    if (!('speechSynthesis' in window)) return;
    isSinging = true;

    const lines = [
        'Shake shake shake',
        'Shake your booty',
        'Shake shake shake',
        'Shake your booty',
    ];
    let lineIndex = 0;

    function singLine() {
        if (!isSinging || !settings.crowdSinging) {
            stopCrowdSinging();
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(lines[lineIndex]);
        utterance.volume = settings.singingVolume / 10;
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        utterance.onend = () => {
            lineIndex = (lineIndex + 1) % lines.length;
            if (isSinging && settings.crowdSinging) {
                crowdSingInterval = setTimeout(singLine, 400);
            }
        };
        window.speechSynthesis.speak(utterance);
    }

    singLine();
}

function stopCrowdSinging() {
    isSinging = false;
    if (crowdSingInterval) {
        clearTimeout(crowdSingInterval);
        crowdSingInterval = null;
    }
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

// ---- AI Difficulty Multiplier ----
function getDifficultyMultiplier() {
    if (settings.difficulty === 'easy') return 1.5;
    if (settings.difficulty === 'hard') return 0.6;
    return 1.0; // normal
}

// ---- Settings UI ----
document.getElementById('settings-gear').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.toggle('hidden');
});

document.getElementById('settings-close').addEventListener('click', () => {
    document.getElementById('settings-panel').classList.add('hidden');
});

document.getElementById('setting-cheering').addEventListener('change', (e) => {
    settings.crowdCheering = e.target.checked;
    if (!settings.crowdCheering) {
        setFansClapping(false);
    }
});

document.getElementById('setting-singing').addEventListener('change', (e) => {
    settings.crowdSinging = e.target.checked;
    if (!settings.crowdSinging) {
        stopCrowdSinging();
    }
});

document.getElementById('setting-dmgnums').addEventListener('change', (e) => {
    settings.damageNumbers = e.target.checked;
});

document.getElementById('setting-screenshake').addEventListener('change', (e) => {
    settings.screenShake = e.target.checked;
});

document.getElementById('setting-particles').addEventListener('change', (e) => {
    settings.hitParticles = e.target.checked;
});

document.getElementById('setting-difficulty').addEventListener('change', (e) => {
    settings.difficulty = e.target.value;
});

document.getElementById('setting-volume').addEventListener('input', (e) => {
    settings.singingVolume = parseInt(e.target.value);
    document.getElementById('volume-label').textContent = e.target.value;
});

// ---- Init ----
initFans();
gameLoop();
