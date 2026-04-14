/**
 * Fruit Power: Boss Battle
 * Core Game Logic
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const moneyDisplay = document.getElementById('money-display');

// --- 3D Projection ---
function project3D(gx, gy) {
    const t = Math.max(0, Math.min(1, gy / canvas.height));
    const scale = 0.38 + t * 0.62;
    const sx = canvas.width / 2 + (gx - canvas.width / 2) * scale;
    const sy = canvas.height * 0.18 + t * canvas.height * 0.72;
    return { x: sx, y: sy, scale };
}

function drawArena() {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4);
    skyGrad.addColorStop(0, '#0a0015');
    skyGrad.addColorStop(1, '#1a0030');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);

    // Floor gradient
    const floorGrad = ctx.createLinearGradient(0, canvas.height * 0.18, 0, canvas.height);
    floorGrad.addColorStop(0, '#0d001a');
    floorGrad.addColorStop(1, '#150028');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, canvas.height * 0.18, canvas.width, canvas.height * 0.82);

    // Horizon glow
    const hGlow = ctx.createLinearGradient(0, canvas.height * 0.13, 0, canvas.height * 0.28);
    hGlow.addColorStop(0, 'rgba(100, 0, 200, 0)');
    hGlow.addColorStop(0.5, 'rgba(100, 0, 200, 0.25)');
    hGlow.addColorStop(1, 'rgba(60, 0, 160, 0)');
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, canvas.height * 0.13, canvas.width, canvas.height * 0.15);

    // Perspective grid lines
    const vp = { x: canvas.width / 2, y: canvas.height * 0.18 }; // vanishing point
    const numLines = 12;
    const floorBottom = canvas.height;
    ctx.strokeStyle = 'rgba(120, 0, 255, 0.20)';
    ctx.lineWidth = 1;

    // Converging lines from vanishing point
    for (let i = 0; i <= numLines; i++) {
        const bx = (canvas.width / numLines) * i;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(bx, floorBottom);
        ctx.stroke();
    }

    // Horizontal depth lines
    for (let t = 0.05; t <= 1; t += 0.12) {
        const p1 = project3D(0, canvas.height * t);
        const p2 = project3D(canvas.width, canvas.height * t);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(120, 0, 255, ${0.05 + t * 0.18})`;
        ctx.stroke();
    }
}

function draw3DBox(px, py, w, h, faceColor) {
    const sideW = w * 0.28;
    const topH = h * 0.22;
    const { x, y, scale } = project3D(px, py);
    const sw = w * scale, sh = h * scale, ssW = sideW * scale, stH = topH * scale;

    // Shadow on floor
    const shadowProj = project3D(px + w / 2, py + h + 10);
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(shadowProj.x, shadowProj.y, (sw / 2) * 1.2, (sh * 0.15), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Top face (lighter)
    ctx.fillStyle = brighten(faceColor, 60);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + sw, y);
    ctx.lineTo(x + sw + ssW, y - stH);
    ctx.lineTo(x + ssW, y - stH);
    ctx.closePath();
    ctx.fill();

    // Front face (main color)
    ctx.fillStyle = faceColor;
    ctx.fillRect(x, y, sw, sh);

    // Side face (darker)
    ctx.fillStyle = darken(faceColor, 50);
    ctx.beginPath();
    ctx.moveTo(x + sw, y);
    ctx.lineTo(x + sw + ssW, y - stH);
    ctx.lineTo(x + sw + ssW, y - stH + sh);
    ctx.lineTo(x + sw, y + sh);
    ctx.closePath();
    ctx.fill();

    // Edge highlights
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, sw, sh);

    return { screenX: x, screenY: y, screenW: sw, screenH: sh, scale };
}

function brighten(hex, amount) {
    const c = hexToRgb(hex);
    if (!c) return hex;
    return `rgb(${Math.min(255, c.r + amount)},${Math.min(255, c.g + amount)},${Math.min(255, c.b + amount)})`;
}
function darken(hex, amount) {
    const c = hexToRgb(hex);
    if (!c) return hex;
    return `rgb(${Math.max(0, c.r - amount)},${Math.max(0, c.g - amount)},${Math.max(0, c.b - amount)})`;
}
function hexToRgb(hex) {
    // Handle rgba and rgb strings too
    if (hex.startsWith('rgb')) {
        const m = hex.match(/(\d+),\s*(\d+),\s*(\d+)/);
        if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    }
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : { r: 150, g: 150, b: 150 };
}
const fruitDisplay = document.getElementById('fruit-display');
const playerHpBar = document.getElementById('player-hp-bar');
const bossHpBar = document.getElementById('boss-hp-bar');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const shopItemsContainer = document.getElementById('shop-items');
const nextBossBtn = document.getElementById('next-boss-btn');
const levelUpBtn = document.getElementById('level-up-btn');
const levelDisplay = document.getElementById('level-display');
const xpBar = document.getElementById('xp-bar');
const questList = document.getElementById('quest-list');

// --- Configuration & State ---
let gameState = 'playing'; // 'playing', 'modal'
let money = 0;
let currentFruit = 'Rocket';
let bossLevel = 1;
let lastTime = 0;

let playerLevel = 1;
let playerXp = 0;
let xpToNextLevel = 100;
let totalDamageDealt = 0;

const QUEST_POOL = [
    { title: 'Deal More Damage', type: 'damage', baseTarget: 500, baseRewardMoney: 50, baseRewardXp: 50 },
    { title: 'Boss Slayer', type: 'boss_kill', baseTarget: 2, baseRewardMoney: 100, baseRewardXp: 100 },
    { title: 'Elite Combatant', type: 'damage', baseTarget: 2000, baseRewardMoney: 300, baseRewardXp: 300 },
    { title: 'Victory Streak', type: 'boss_kill', baseTarget: 5, baseRewardMoney: 400, baseRewardXp: 500 },
    { title: 'Demolisher', type: 'damage', baseTarget: 5000, baseRewardMoney: 1000, baseRewardXp: 1000 }
];

let quests = [];

function generateNewQuest() {
    const template = QUEST_POOL[Math.floor(Math.random() * QUEST_POOL.length)];
    const scaling = 1 + (playerLevel - 1) * 0.2; // Quests scale with player level

    return {
        id: Date.now() + Math.random(),
        title: template.title,
        type: template.type,
        target: Math.floor(template.baseTarget * scaling),
        progress: 0,
        rewardMoney: Math.floor(template.baseRewardMoney * scaling),
        rewardXp: Math.floor(template.baseRewardXp * scaling),
        completed: false
    };
}

// Initial Quests
for (let i = 0; i < 3; i++) {
    quests.push(generateNewQuest());
}

const FRUITS = {
    'Rocket': { name: 'Rocket', color: '#ff4757', speed: 5, power: 10, hp: 100, ability: 'dash', attackType: 'missile' },
    'Bomb': { name: 'Bomb', color: '#2d3436', price: 15, speed: 4, power: 15, hp: 120, ability: 'explode', attackType: 'bomb' },
    'Flame': { name: 'Flame', color: '#ffa502', price: 20, speed: 4, power: 25, hp: 150, ability: 'burst', attackType: 'stream' },
    'Cloud': { name: 'Cloud', color: '#f5f6fa', price: 40, speed: 6, power: 30, hp: 160, ability: 'float', attackType: 'cloud' },
    'Ice': { name: 'Ice', color: '#70a1ff', price: 60, speed: 4, power: 35, hp: 180, ability: 'freeze', attackType: 'orb' },
    'Sand': { name: 'Sand', color: '#e1b12c', price: 90, speed: 4, power: 40, hp: 190, ability: 'desert', attackType: 'wave' },
    'Light': { name: 'Light', color: '#eccc68', price: 110, speed: 7, power: 45, hp: 200, ability: 'beam', attackType: 'beam' },
    'Dark': { name: 'Dark', color: '#2f3640', price: 130, speed: 5, power: 50, hp: 250, ability: 'blackhole', attackType: 'orb' },
    'T-Rex': { name: 'T-Rex', color: '#2f3542', price: 150, speed: 3, power: 55, hp: 350, ability: 'bite', attackType: 'bite' },
    'Rubber': { name: 'Rubber', color: '#ff6b81', price: 250, speed: 5, power: 65, hp: 400, ability: 'bounce', attackType: 'gatling' },
    'Dough': { name: 'Dough', color: '#dfe4ea', price: 350, speed: 4, power: 75, hp: 450, ability: 'sticky', attackType: 'stretch' },
    'Yeti': { name: 'Yeti', color: '#ced6e0', price: 420, speed: 3, power: 85, hp: 500, ability: 'snowball', attackType: 'projectile' },
    'Gravity': { name: 'Gravity', color: '#4834d4', price: 550, speed: 4, power: 90, hp: 550, ability: 'crush', attackType: 'crush' },
    'Magma': { name: 'Magma', color: '#ff3838', price: 650, speed: 4, power: 95, hp: 600, ability: 'lava', attackType: 'stream' },
    'Portal': { name: 'Portal', color: '#9c88ff', price: 750, speed: 8, power: 100, hp: 620, ability: 'teleport', attackType: 'portal' },
    'Mochi': { name: 'Mochi', color: '#f7d794', price: 800, speed: 5, power: 105, hp: 650, ability: 'stretch', attackType: 'stretch' },
    'Lightning': { name: 'Lightning', color: '#fbc531', price: 850, speed: 8, power: 110, hp: 680, ability: 'strike', attackType: 'bolt' },
    'Quake': { name: 'Quake', color: '#7f8c8d', price: 900, speed: 3, power: 110, hp: 700, ability: 'shockwave', attackType: 'wave' },
    'Shadow': { name: 'Shadow', color: '#2c3e50', price: 1100, speed: 6, power: 120, hp: 750, ability: 'nightmare', attackType: 'nightmare' },
    'Buddha': { name: 'Buddha', color: '#f1c40f', price: 1300, speed: 2, power: 130, hp: 1000, ability: 'impact', attackType: 'impact' },
    'Venom': { name: 'Venom', color: '#8e44ad', price: 1800, speed: 5, power: 150, hp: 850, ability: 'toxic', attackType: 'toxic' },
    'Phoenix': { name: 'Phoenix', color: '#f0932b', price: 2200, speed: 6, power: 180, hp: 1200, ability: 'reborn', attackType: 'projectile' },
    'Control': { name: 'Control', color: '#00cec9', price: 2500, speed: 6, power: 200, hp: 1300, ability: 'room', attackType: 'room' },
    'Leopard': { name: 'Leopard', color: '#f1c40f', price: 3200, speed: 8, power: 250, hp: 1500, ability: 'slash', attackType: 'slash' },
    'Kitsune': { name: 'Kitsune', color: '#eb4d4b', price: 4000, speed: 9, power: 300, hp: 2000, ability: 'foxfire', attackType: 'projectile' },
    'Spirit': { name: 'Spirit', color: '#7ed6df', price: 4500, speed: 5, power: 350, hp: 2500, ability: 'specter', attackType: 'wisp' },
    'Dragon': { name: 'Dragon', color: '#ff4757', price: 5000, speed: 6, power: 500, hp: 5000, ability: 'fire-breath', attackType: 'fire-breath' },
    'God': { name: 'God', color: '#ffffff', price: 10000, speed: 10, power: 1000, hp: 10000, ability: 'divine', attackType: 'divine' }
};

const unlockedFruits = ['Rocket'];

// --- Entities ---
class Player {
    constructor() {
        this.reset();
    }

    reset() {
        const fruit = FRUITS[currentFruit];
        this.width = currentFruit === 'T-Rex' ? 60 : 40;
        this.height = currentFruit === 'T-Rex' ? 60 : 40;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 100;
        this.speed = fruit.speed;
        this.hp = fruit.hp;
        this.maxHp = fruit.hp;
        this.color = fruit.color;
        this.velX = 0;
        this.velY = 0;
        this.projectiles = [];
        this.lastShot = 0;
        this.shootInterval = 300;
    }

    update(keys) {
        // Movement
        if (keys['w'] || keys['ArrowUp']) this.velY = -this.speed;
        else if (keys['s'] || keys['ArrowDown']) this.velY = this.speed;
        else this.velY = 0;

        if (keys['a'] || keys['ArrowLeft']) this.velX = -this.speed;
        else if (keys['d'] || keys['ArrowRight']) this.velX = this.speed;
        else this.velX = 0;

        this.x += this.velX;
        this.y += this.velY;

        // Boundaries
        this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));

        // Shooting
        if (keys[' '] || keys['mouse']) {
            const now = Date.now();
            if (now - this.lastShot > this.shootInterval) {
                this.shoot();
                this.lastShot = now;
            }
        }

        // Update projectiles
        this.projectiles.forEach((p, i) => {
            if (p.type === 'missile' || p.type === 'gatling') {
                p.y -= 15;
            } else if (p.type === 'stretch') {
                p.y -= 20;
                p.height += 20; // Stretch effect
            } else if (p.type === 'wisp' || p.type === 'nightmare') {
                p.y -= 7;
                p.x += Math.sin(p.y / 10) * 3; // Drifting movement
            } else if (p.type === 'orb' || p.type === 'bomb') {
                p.y -= 5;
                p.width += 0.5;
                p.height += 0.5;
            } else if (p.type === 'wave') {
                p.y -= 8;
                p.width += 10;
                p.x -= 5;
            } else if (p.type === 'toxic') {
                p.y -= 2;
                p.alpha -= 0.01;
                p.width += 2;
                p.height += 2;
                p.x += (Math.random() - 0.5) * 5;
            } else if (p.type === 'cloud') {
                p.y -= 3;
                p.width += 2;
                p.x -= 1;
                p.alpha -= 0.01;
            } else if (p.type === 'portal') {
                p.y -= 15;
                p.width += Math.sin(p.y / 20) * 2;
            } else if (p.type === 'beam' || p.type === 'impact' || p.type === 'divine' || p.type === 'bite' || p.type === 'slash' || p.type === 'room') {
                p.life--;
            } else {
                p.y -= 10;
            }

            if (p.y < -100 || (p.life !== undefined && p.life <= 0) || (p.alpha !== undefined && p.alpha <= 0)) {
                this.projectiles.splice(i, 1);
            }
        });
    }

    shoot() {
        const fruit = FRUITS[currentFruit];
        const damage = fruit.power * (1 + (playerLevel - 1) * 0.05);
        const type = fruit.attackType;

        if (type === 'beam') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 5, y: 0, width: 10, height: this.y, color: '#eccc68', damage, life: 10 });
        } else if (type === 'bite') {
            this.projectiles.push({ type, x: this.x - 20, y: this.y - 40, width: this.width + 40, height: 40, color: this.color, damage, life: 15 });
        } else if (type === 'impact') {
            this.projectiles.push({ type, x: this.x - 50, y: this.y - 100, width: this.width + 100, height: 100, color: 'rgba(241, 196, 15, 0.3)', damage, life: 20 });
        } else if (type === 'divine') {
            for (let i = 0; i < 5; i++) {
                this.projectiles.push({ type, x: Math.random() * canvas.width, y: 0, width: 30, height: canvas.height, color: 'rgba(255, 255, 255, 0.8)', damage: damage / 2, life: 30 });
            }
        } else if (type === 'slash') {
            this.projectiles.push({ type, x: this.x - 30, y: this.y - 20, width: this.width + 60, height: 10, color: 'white', damage, life: 10 });
        } else if (type === 'toxic') {
            this.projectiles.push({ type, x: this.x + this.width / 2, y: this.y, width: 20, height: 20, color: 'rgba(142, 68, 173, 0.6)', damage: damage / 10, offset: 0, alpha: 1 });
        } else if (type === 'wave') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 50, y: this.y, width: 100, height: 20, color: '#7f8c8d', damage });
        } else if (type === 'gatling') {
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    this.projectiles.push({ type: 'gatling', x: this.x + 10 + (Math.random() * 40), y: this.y, width: 20, height: 20, color: '#ff6b81', damage: damage / 2 });
                }, i * 100);
            }
        } else if (type === 'stretch') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 10, y: this.y, width: 20, height: 40, color: this.color, damage, life: 30 });
        } else if (type === 'wisp' || type === 'nightmare') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 10, y: this.y, width: 20, height: 20, color: this.color, damage });
        } else if (type === 'fire-breath') {
            for (let i = 0; i < 3; i++) {
                this.projectiles.push({ type: 'stream', x: this.x + this.width / 2 + (Math.random() - 0.5) * 20, y: this.y, width: 15, height: 15, color: '#ff4757', damage: damage / 5 });
            }
        } else if (type === 'bomb') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 15, y: this.y, width: 30, height: 30, color: '#2d3436', damage: damage * 1.5, life: 30 });
        } else if (type === 'room') {
            this.projectiles.push({ type, x: this.x - 150, y: this.y - 150, width: this.width + 300, height: 300, color: 'rgba(0, 206, 201, 0.4)', damage, life: 30 });
        } else if (type === 'cloud') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 20, y: this.y, width: 40, height: 20, color: '#f5f6fa', damage: damage / 2, alpha: 1 });
        } else if (type === 'bolt') {
            for (let i = 0; i < 3; i++) {
                this.projectiles.push({ type: 'beam', x: this.x + this.width / 2 - 10 + (Math.random() * 20), y: 0, width: 5, height: this.y, color: '#fbc531', damage, life: 8 });
            }
        } else if (type === 'portal') {
            this.projectiles.push({ type, x: this.x + this.width / 2 - 20, y: this.y, width: 40, height: 10, color: '#9c88ff', damage });
        } else {
            this.projectiles.push({
                type,
                x: this.x + this.width / 2 - 5,
                y: this.y,
                width: type === 'orb' ? 20 : 10,
                height: type === 'orb' ? 20 : 20,
                color: this.color,
                damage: damage
            });
        }
    }

    draw() {
        // Draw Projectiles
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;

            if (p.type === 'beam' || p.type === 'divine') {
                ctx.fillRect(p.x, p.y, p.width, p.height);
                // Pulse effect for beam
                ctx.globalAlpha = 0.5;
                ctx.fillRect(p.x - 5, p.y, p.width + 10, p.height);
            } else if (p.type === 'room') {
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 5;
                ctx.stroke();
                ctx.globalAlpha = 0.2;
                ctx.fill();
            } else if (p.type === 'orb' || p.type === 'wisp' || p.type === 'nightmare' || p.type === 'bomb') {
                ctx.beginPath();
                ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, 0, Math.PI * 2);
                ctx.fill();
                if (p.type === 'wisp') {
                    ctx.globalAlpha = 0.3;
                    ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width, 0, Math.PI * 2);
                    ctx.fill();
                } else if (p.type === 'bomb') {
                    ctx.fillStyle = 'rgba(255,100,0,0.5)';
                    ctx.beginPath();
                    ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.width / 4, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.type === 'gatling') {
                ctx.roundRect(p.x, p.y, p.width, p.height, 5);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(p.x + 5, p.y + 5, 5, 5);
            } else if (p.type === 'cloud') {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(p.x + p.width / 2 - 10, p.y + p.height / 2 - 5, p.width / 3, p.height / 3, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'stretch') {
                ctx.roundRect(p.x, p.y, p.width, p.height, 10);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.2)';
                ctx.fillRect(p.x, p.y, p.width, 20); // Joint/Head of stretch
            } else if (p.type === 'toxic') {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.width, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'wave') {
                ctx.beginPath();
                ctx.ellipse(p.x + p.width / 2, p.y, p.width / 2, 10, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fill();
            } else if (p.type === 'portal') {
                ctx.beginPath();
                ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = 'transparent';
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width / 2 - i * 5, p.height / 2 - i * 2, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            } else if (p.type === 'bite') {
                // Draw jaws
                ctx.fillRect(p.x, p.y, p.width, 10);
                ctx.fillRect(p.x, p.y + p.height - 10, p.width, 10);
                for (let i = 0; i < p.width; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(p.x + i, p.y + 10);
                    ctx.lineTo(p.x + i + 5, p.y + 20);
                    ctx.lineTo(p.x + i + 10, p.y + 10);
                    ctx.fill();
                }
            } else {
                ctx.fillRect(p.x, p.y, p.width, p.height);
            }
            ctx.restore();
        });
        ctx.shadowBlur = 0;

        // Draw Player as 3D box
        const playerColor = FRUITS[currentFruit].color;
        const boxInfo = draw3DBox(this.x, this.y, this.width, this.height, playerColor);

        // Draw simple fruit emoji on front face for personality
        const emojiMap = {
            'Rocket': '🚀', 'Bomb': '💣', 'Flame': '🔥', 'Cloud': '☁️', 'Ice': '❄️', 'Sand': '🏜️',
            'Light': '☀️', 'Dark': '🕳️', 'T-Rex': '🦖', 'Rubber': '💪', 'Dough': '🍞', 'Yeti': '❄',
            'Gravity': '🌀', 'Magma': '🌋', 'Portal': '🚪', 'Mochi': '🍡', 'Lightning': '⚡',
            'Quake': '⛰️', 'Shadow': '🌑', 'Buddha': '🌟', 'Venom': '🐍', 'Phoenix': '🦅',
            'Control': '🔘', 'Leopard': '🐆', 'Kitsune': '🦊', 'Spirit': '👻', 'Dragon': '🐉', 'God': '✨'
        };
        const emoji = emojiMap[currentFruit] || '?';
        ctx.font = `${Math.floor(boxInfo.screenH * 0.55)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, boxInfo.screenX + boxInfo.screenW / 2, boxInfo.screenY + boxInfo.screenH / 2);
    }

    drawRocket() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.fill();
    }

    drawFlame() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        // Flame tip
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.quadraticCurveTo(this.x + this.width / 2, this.y - 10, this.x + this.width, this.y + this.height / 2);
        ctx.fill();
    }

    drawIce() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    }

    drawLight() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'white';
    }

    drawTRex() {
        ctx.fillStyle = this.color;
        // Body
        ctx.fillRect(this.x + 5, this.y + 15, this.width - 20, this.height - 20);
        // Snout
        ctx.fillRect(this.x + this.width - 25, this.y + 10, 30, 20);
        // Tail
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 20);
        ctx.lineTo(this.x - 15, this.y + 45);
        ctx.lineTo(this.x + 5, this.y + 45);
        ctx.fill();
        // Eye
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + this.width - 10, this.y + 15, 6, 6);
        // Teeth
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + this.width - 15, this.y + 25, 3, 5);
        ctx.fillRect(this.x + this.width - 5, this.y + 25, 3, 5);
    }

    drawRubber() {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();
    }

    drawDough() {
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, this.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawYeti() {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 5);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 5, this.y + 10, this.width - 10, 15); // Fur patch
    }

    drawMagma() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff9f43';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 + 5, this.y + this.height / 2 - 5, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGravity() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#686de0';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    drawMochi() {
        ctx.beginPath();
        ctx.roundRect(this.x, this.y + 10, this.width, this.height - 10, 20);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.y + 15, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawQuake() {
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 4;
        ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    }

    drawShadow() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.quadraticCurveTo(this.x + this.width, this.y + this.height / 2, this.x + this.width / 2, this.y + this.height);
        ctx.quadraticCurveTo(this.x, this.y + this.height / 2, this.x + this.width / 2, this.y);
        ctx.fill();
        ctx.fillStyle = '#eb4d4b';
        ctx.fillRect(this.x + this.width / 2 - 2, this.y + this.height / 2 - 2, 4, 4);
    }

    drawBuddha() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawVenom() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.bezierCurveTo(
            this.x, this.y + this.height * 0.7,
            this.x + this.width, this.y + this.height * 0.3,
            this.x + this.width / 2, this.y
        );
        ctx.stroke();

        // Head
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2 - 4, this.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(this.x + this.width / 2 + 4, this.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Tongue
        ctx.strokeStyle = '#ff4757';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y - 8);
        ctx.lineTo(this.x + this.width / 2, this.y - 15);
        ctx.stroke();
    }

    drawPhoenix() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.fill();
        ctx.fillStyle = '#ffbe76';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 5);
        ctx.lineTo(this.x + 10, this.y + this.height - 5);
        ctx.fill();
    }

    drawLeopard() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2d3436';
        // Leopard spots
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(this.x + 10 + Math.random() * 20, this.y + 10 + Math.random() * 20, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawKitsune() {
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        // Fox ears
        ctx.beginPath();
        ctx.moveTo(this.x + 5, this.y + 5);
        ctx.lineTo(this.x + 15, this.y - 5);
        ctx.lineTo(this.x + 25, this.y + 5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y + 5);
        ctx.lineTo(this.x + 25, this.y - 5);
        ctx.lineTo(this.x + 35, this.y + 5);
        ctx.fill();
    }

    drawSpirit() {
        ctx.save();
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 25, this.y + 15, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawDragon() {
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y + this.height / 2);
        ctx.fill();
        // Spikes or wings
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.height / 2);
        ctx.lineTo(this.x - 10, this.y + this.height / 2 + 10);
        ctx.lineTo(this.x, this.y + this.height / 2 + 20);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.x + this.width, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width + 10, this.y + this.height / 2 + 10);
        ctx.lineTo(this.x + this.width, this.y + this.height / 2 + 20);
        ctx.fill();
    }

    drawGod() {
        const now = Date.now();
        const pulse = Math.sin(now / 500) * 5;

        ctx.save();
        // Golden Aura
        ctx.shadowBlur = 15 + pulse * 2;
        ctx.shadowColor = '#f1c40f';

        // Main Divine Orb
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + pulse
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.4, '#fff9c4');
        gradient.addColorStop(1, '#f1c40f');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Inner Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Boss {
    constructor(level) {
        this.level = level;
        this.width = 100 + (level * 10);
        this.height = 100 + (level * 10);
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50;
        this.maxHp = 100 * level;
        this.hp = this.maxHp;
        this.speed = 2 + (level * 0.5);
        this.dir = 1;
        this.lastShot = 0;
        this.shootInterval = Math.max(500, 2000 - (level * 100));
        this.projectiles = [];
    }

    update() {
        // Horizontal movement
        this.x += this.speed * this.dir;
        if (this.x <= 0 || this.x + this.width >= canvas.width) {
            this.dir *= -1;
        }

        // Shooting
        const now = Date.now();
        if (now - this.lastShot > this.shootInterval) {
            this.shoot();
            this.lastShot = now;
        }

        // Update projectiles
        this.projectiles.forEach((p, i) => {
            p.y += 5;
            if (p.y > canvas.height) this.projectiles.splice(i, 1);
        });
    }

    shoot() {
        this.projectiles.push({
            x: this.x + this.width / 2 - 10,
            y: this.y + this.height,
            width: 20,
            height: 20,
            color: '#a29bfe'
        });
    }

    draw() {
        // Boss projectiles — projected 3D
        this.projectiles.forEach(p => {
            const proj = project3D(p.x + p.width / 2, p.y + p.height / 2);
            const sw = p.width * proj.scale;
            const sh = p.height * proj.scale;
            ctx.fillStyle = '#a29bfe';
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#a29bfe';
            ctx.fillRect(proj.x - sw / 2, proj.y - sh / 2, sw, sh);
            ctx.shadowBlur = 0;
        });

        // Boss as 3D box with angry face
        const bossColor = `hsl(${(Date.now() / 30) % 360}, 80%, 45%)`; // color-cycling boss
        const boxInfo = draw3DBox(this.x, this.y, this.width, this.height, '#c0392b');

        // Face drawn on front face
        const bx = boxInfo.screenX, by = boxInfo.screenY;
        const bw = boxInfo.screenW, bh = boxInfo.screenH;
        const sc = boxInfo.scale;

        ctx.fillStyle = 'white';
        ctx.fillRect(bx + bw * 0.18, by + bh * 0.28, bw * 0.18, bh * 0.12);
        ctx.fillRect(bx + bw * 0.62, by + bh * 0.28, bw * 0.18, bh * 0.12);
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(bx + bw * 0.25, by + bh * 0.6, bw * 0.5, bh * 0.08);

        // Glow aura
        ctx.shadowBlur = 30 * sc;
        ctx.shadowColor = '#ff4757';
        ctx.strokeStyle = 'rgba(255, 71, 87, 0.5)';
        ctx.lineWidth = 3;
        ctx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);
        ctx.shadowBlur = 0;
    }
}

// --- Game Logic ---
let player = new Player();
let boss = new Boss(bossLevel);
const keys = {};

window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);
window.addEventListener('mousedown', () => keys['mouse'] = true);
window.addEventListener('mouseup', () => keys['mouse'] = false);

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function checkCollisions() {
    // Player hits boss
    player.projectiles.forEach((p, pi) => {
        if (p.x < boss.x + boss.width &&
            p.x + p.width > boss.x &&
            p.y < boss.y + boss.height &&
            p.y + p.height > boss.y) {

            boss.hp -= p.damage;
            updateQuests('damage', p.damage);
            gainXp(Math.floor(p.damage / 2));

            // Only splice regular projectiles
            const nonDestructive = ['beam', 'divine', 'toxic', 'bite', 'impact', 'slash', 'stream', 'room', 'cloud'];
            if (!nonDestructive.includes(p.type)) {
                player.projectiles.splice(pi, 1);
            } else if (p.type !== 'toxic' && p.type !== 'stream' && p.type !== 'cloud') {
                // Beams/Slashes hit once and then their damage is set to 0 to prevent multi-hit per frame
                p.damage = 0;
            }

            if (boss.hp <= 0) winLevel();
        }
    });

    // Boss hits player
    boss.projectiles.forEach((p, pi) => {
        if (p.x < player.x + player.width &&
            p.x + p.width > player.x &&
            p.y < player.y + player.height &&
            p.y + p.height > player.y) {
            player.hp -= 10;
            boss.projectiles.splice(pi, 1);
            if (player.hp <= 0) gameOver();
        }
    });

    // Sync UI
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    bossHpBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    moneyDisplay.innerText = `$${money}`;
}

function winLevel() {
    gameState = 'modal';
    money += 100;
    bossLevel++;
    gainXp(50);
    updateQuests('boss_kill', 1);
    modalTitle.innerText = "Victory!";
    modalText.innerText = `You defeated Boss Level ${bossLevel - 1} and earned $100. Current Balance: $${money}`;
    showShop();
    showQuests();
    overlay.classList.remove('hidden');
}

function gainXp(amount) {
    playerXp += amount;
    updateUI();
}

function manualLevelUp() {
    if (playerXp >= xpToNextLevel) {
        playerXp -= xpToNextLevel;
        playerLevel++;
        xpToNextLevel = Math.floor(xpToNextLevel * 1.5); // Increase cost more aggressively
        showLevelUpToast();
        updateUI();
    }
}

levelUpBtn.onclick = manualLevelUp;

function updateQuests(type, amount) {
    quests.forEach(quest => {
        if (!quest.completed && quest.type === type) {
            quest.progress += amount;
            if (quest.progress >= quest.target) {
                quest.progress = quest.target;
                completeQuest(quest);
            }
        }
    });
    showQuests();
}

function completeQuest(quest) {
    quest.completed = true;
    money += quest.rewardMoney;
    gainXp(quest.rewardXp);

    // Replace quest after a short delay so the player can see the checkmark
    setTimeout(() => {
        const index = quests.indexOf(quest);
        if (index > -1) {
            quests[index] = generateNewQuest();
            showQuests();
        }
    }, 1500);
}

function showQuests() {
    questList.innerHTML = '';
    quests.forEach(quest => {
        const item = document.createElement('div');
        item.className = 'quest-item';
        const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);

        item.innerHTML = `
            <span class="quest-title">${quest.title} ${quest.completed ? '✅' : ''}</span>
            <div class="hp-bar-outer" style="height: 4px;">
                <div class="hp-bar-inner" style="width: ${progressPercent}%; background: ${quest.completed ? '#4ade80' : 'var(--accent)'}"></div>
            </div>
            <span class="quest-progress-text">${Math.floor(quest.progress)}/${quest.target}</span>
            <div class="quest-reward">+$${quest.rewardMoney} | +${quest.rewardXp} XP</div>
        `;
        questList.appendChild(item);
    });
}

function showLevelUpToast() {
    const toast = document.createElement('div');
    toast.className = 'level-up-toast';
    toast.innerText = `LEVEL UP! Level ${playerLevel}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

function updateUI() {
    playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
    bossHpBar.style.width = `${(boss.hp / boss.maxHp) * 100}%`;
    moneyDisplay.innerText = `$${money}`;
    levelDisplay.innerText = playerLevel;
    xpBar.style.width = `${(playerXp / xpToNextLevel) * 100}%`;

    // Update Level Up Button
    levelUpBtn.innerText = `UPGRADE (${~~xpToNextLevel} XP)`;
    if (playerXp >= xpToNextLevel) {
        levelUpBtn.classList.remove('disabled');
    } else {
        levelUpBtn.classList.add('disabled');
    }
}

function gameOver() {
    gameState = 'modal';
    modalTitle.innerText = "Defeated!";
    modalText.innerText = `Try again. You need stronger fruit power!`;
    shopItemsContainer.innerHTML = '';
    overlay.classList.remove('hidden');
}

function showShop() {
    shopItemsContainer.innerHTML = '';
    Object.keys(FRUITS).forEach(key => {
        const fruit = FRUITS[key];
        if (key === 'Rocket') return; // Default

        const item = document.createElement('div');
        item.className = `shop-item ${money < fruit.price && !unlockedFruits.includes(key) ? 'disabled' : ''}`;
        item.innerHTML = `
            <h3>${fruit.name}</h3>
            <span class="price">${unlockedFruits.includes(key) ? 'OWNED' : '$' + fruit.price}</span>
        `;

        item.onclick = () => {
            if (unlockedFruits.includes(key)) {
                currentFruit = key;
                fruitDisplay.innerText = key;
                player.reset();
                showShop(); // refresh owned state
            } else if (money >= fruit.price) {
                money -= fruit.price;
                unlockedFruits.push(key);
                currentFruit = key;
                fruitDisplay.innerText = key;
                player.reset();
                moneyDisplay.innerText = `$${money}`;
                updateUI();
                showShop();
            }
        };
        shopItemsContainer.appendChild(item);
    });
}

nextBossBtn.onclick = () => {
    boss = new Boss(bossLevel);
    player.reset();
    gameState = 'playing';
    overlay.classList.add('hidden');
};

function loop(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawArena();

    if (gameState === 'playing') {
        player.update(keys);
        boss.update();
        checkCollisions();
    }

    player.draw();
    boss.draw();

    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
window.onload = () => {
    player.reset();
    boss = new Boss(bossLevel);
    showQuests();
    updateUI();
};
