const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const KEYS = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyS: false,
    Shift: false
};

// Game State
let gameState = 'PLAYING'; // PLAYING, SHOP, GAMEOVER
let wave = 1;
let castleHealth = 1000;
let gold = 100; // Starting gold
let lastTime = 0;
let enemies = [];
let arrows = [];
let allies = [];
let particles = [];
let score = 0;

// Player Inventory / Upgrades
let currentArrowType = 'normal'; // normal, fire, poison
let unlockedArrows = {
    normal: true,
    fire: false,
    poison: false,
    piercing: false,
    explosive: false,
    ice: false,
    lightning: false
};

// Update UI
const scoreElement = document.getElementById('score');
const shopElement = document.getElementById('shop-overlay');

// Classes
class Player {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = 50; // On the castle wall
        this.y = CANVAS_HEIGHT / 2;
        this.speed = 5;
        this.color = 'blue';
        this.aimX = 1;
        this.aimY = 0;
        this.lastShotTime = 0;
        this.fireRate = 500; // ms
        this.attackSpeedLevel = 0;
    }

    update() {
        if (gameState !== 'PLAYING') return;

        // Aiming Logic (Shift + Arrows)
        if (KEYS.Shift) {
            if (KEYS.ArrowUp) { this.aimX = 0; this.aimY = -1; }
            else if (KEYS.ArrowDown) { this.aimX = 0; this.aimY = 1; }
            else if (KEYS.ArrowLeft) { this.aimX = -1; this.aimY = 0; }
            else if (KEYS.ArrowRight) { this.aimX = 1; this.aimY = 0; }
        } else {
            // Movement Logic
            if (KEYS.ArrowUp && this.y > 0) this.y -= this.speed;
            if (KEYS.ArrowDown && this.y < CANVAS_HEIGHT - this.height) this.y += this.speed;
            if (KEYS.ArrowLeft && this.x > 0) this.x -= this.speed;
            if (KEYS.ArrowRight && this.x < 150) this.x += this.speed; // Limit to castle area
        }

        // Shooting
        if (KEYS.KeyS && !KEYS.Shift) {
            const now = Date.now();
            if (now - this.lastShotTime > this.fireRate) {
                this.shoot();
                this.lastShotTime = now;
            }
        }
    }

    shoot() {
        arrows.push(new Arrow(this.x + this.width / 2, this.y + this.height / 2, this.aimX, this.aimY, currentArrowType));
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Draw Aim Indicator
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2 + this.aimX * 20, this.y + this.height / 2 + this.aimY * 20);
        ctx.stroke();
    }

    upgradeAttackSpeed() {
        this.attackSpeedLevel++;
        this.fireRate = Math.max(100, 500 - (this.attackSpeedLevel * 50));
    }
}

class Ally {
    constructor() {
        this.width = 30;
        this.height = 30;
        this.x = Math.random() * 100 + 20; // Random position on wall
        this.y = Math.random() * (CANVAS_HEIGHT - 60) + 30;
        this.color = 'lightblue';
        this.lastShotTime = 0;
        this.fireRate = 1500; // Allies shoot slower
        this.range = 400;
    }

    update() {
        const now = Date.now();
        if (now - this.lastShotTime > this.fireRate) {
            // Find nearest enemy
            let nearestEnemy = null;
            let minDist = Infinity;
            for (let enemy of enemies) {
                if (!enemy.active) continue;
                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist && dist < this.range) {
                    minDist = dist;
                    nearestEnemy = enemy;
                }
            }

            if (nearestEnemy) {
                const dx = nearestEnemy.x - this.x;
                const dy = nearestEnemy.y - this.y;
                const mag = Math.sqrt(dx * dx + dy * dy);
                this.shoot(dx / mag, dy / mag);
                this.lastShotTime = now;
            }
        }
    }

    shoot(dx, dy) {
        // Allies always shoot normal arrows
        arrows.push(new Arrow(this.x + this.width / 2, this.y + this.height / 2, dx, dy, 'normal'));
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Arrow {
    constructor(x, y, dx, dy, type) {
        this.x = x;
        this.y = y;
        this.speed = 10;
        this.dx = dx;
        this.dy = dy;
        this.width = 10;
        this.height = 4;
        this.active = true;
        this.type = type; // normal, fire, poison, piercing

        // Piercing Logic
        this.pierceCount = (type === 'piercing') ? 3 : 1;
        this.hitEnemies = []; // Track who we hit so we don't hit same enemy twice in one frame/pass
    }

    update() {
        this.x += this.dx * this.speed;
        this.y += this.dy * this.speed;

        if (this.x < 0 || this.x > CANVAS_WIDTH || this.y < 0 || this.y > CANVAS_HEIGHT) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (this.type === 'fire') ctx.fillStyle = 'orange';
        else if (this.type === 'poison') ctx.fillStyle = 'lime';
        else if (this.type === 'piercing') ctx.fillStyle = '#ff00ff';
        else if (this.type === 'explosive') ctx.fillStyle = '#ff4500';
        else if (this.type === 'ice') ctx.fillStyle = '#00ffff';
        else if (this.type === 'lightning') ctx.fillStyle = '#ffff00';
        else ctx.fillStyle = 'white';

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.dy, this.dx));
        ctx.fillRect(-5, -2, 10, 4);
        ctx.restore();
    }
}

class Enemy {
    constructor(type) {
        this.type = type;
        this.x = CANVAS_WIDTH;
        this.y = Math.random() * (CANVAS_HEIGHT - 40);
        this.width = 30;
        this.height = 30;
        this.active = true;

        // Stats
        this.speed = 1;
        this.baseSpeed = 1;
        this.health = 10;
        this.damage = 10;
        this.color = 'red';
        this.reward = 10;

        // Status Effects
        this.status = {
            burn: { active: false, timer: 0, tick: 0 },
            poison: { active: false, timer: 0, tick: 0 },
            freeze: { active: false, timer: 0 },
            shock: { active: false, timer: 0 }
        };

        this.applyTypeStats();
    }

    applyTypeStats() {
        switch (this.type) {
            case 'gunner':
                this.baseSpeed = 1.5;
                this.health = 20;
                this.color = 'orange';
                this.reward = 15;
                break;
            case 'tank':
                this.baseSpeed = 0.5;
                this.health = 60;
                this.color = 'darkred';
                this.width = 40;
                this.height = 40;
                this.reward = 30;
                break;
            case 'archer':
                this.baseSpeed = 2;
                this.health = 15;
                this.color = 'purple';
                this.reward = 10;
                break;
            case 'knight':
                this.baseSpeed = 2.5;
                this.health = 30;
                this.color = 'silver';
                this.reward = 20;
                break;
        }
        this.speed = this.baseSpeed;
    }

    update() {
        // Status Effects
        let currentSpeed = this.baseSpeed;

        if (this.status.freeze.active) {
            currentSpeed = 0;
            this.status.freeze.timer--;
            if (this.status.freeze.timer <= 0) this.status.freeze.active = false;
        } else if (this.status.poison.active) {
            currentSpeed = this.baseSpeed * 0.5;
            this.status.poison.timer--;
            if (this.status.poison.timer <= 0) {
                this.status.poison.active = false;
            }
            if (this.status.poison.tick++ > 60) {
                this.health -= 2; // Poison damage tic
                this.status.poison.tick = 0;
            }
        }

        if (this.status.burn.active) {
            this.status.burn.timer--;
            if (this.status.burn.timer <= 0) this.status.burn.active = false;
            if (this.status.burn.tick++ > 30) {
                this.health -= 5;
                this.status.burn.tick = 0;
            }
        }

        // Shock Visual Timer
        if (this.status.shock.active) {
            this.status.shock.timer--;
            if (this.status.shock.timer <= 0) this.status.shock.active = false;
        }

        if (this.health <= 0) {
            this.active = false;
            gold += this.reward;
            score += this.reward;
            return;
        }

        this.x -= currentSpeed;

        // Hit Castle
        if (this.x <= 100) {
            castleHealth -= this.damage;
            this.active = false;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        if (this.status.freeze.active) {
            ctx.fillStyle = '#00ffff'; // Cyan for frozen
        }
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Status Indicators
        if (this.status.burn.active) {
            ctx.fillStyle = 'orange';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.status.poison.active) {
            ctx.fillStyle = 'lime';
            ctx.beginPath();
            ctx.arc(this.x + this.width / 2, this.y - 5, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        if (this.status.shock.active) {
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x + this.width, this.y + this.height);
            ctx.stroke();
        }
    }
}

// Game Instances
const player = new Player();

// Shop System
function initShop() {
    const container = document.getElementById('shop-overlay');
    // Clear existing (keep first 2 children h2, p)
    while (container.children.length > 2) {
        container.removeChild(container.lastChild);
    }

    const items = [
        {
            name: "Fire Arrows",
            cost: 200,
            id: 'fire',
            desc: "Burns enemies.",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Poison Arrows",
            cost: 200,
            id: 'poison',
            desc: "Slows enemies.",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Piercing Arrows",
            cost: 500,
            id: 'piercing',
            desc: "Shoot through enemies.",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Explosive Arrows",
            cost: 600,
            id: 'explosive',
            desc: "Explodes on impact (AOE).",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Ice Arrows",
            cost: 400,
            id: 'ice',
            desc: "Freezes enemies solid.",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Lightning Arrows",
            cost: 700,
            id: 'lightning',
            desc: "Chains damage to nearby.",
            type: 'upgrade',
            oneTime: true
        },
        {
            name: "Hire Ally Archer",
            cost: 150,
            id: 'ally',
            desc: "Hires a helper.",
            type: 'consumable'
        },
        {
            name: "Repair Castle",
            cost: 100,
            id: 'repair',
            desc: "Recover 200 Health.",
            type: 'consumable'
        },
        {
            name: "Attack Speed Up",
            cost: 300,
            id: 'speed',
            desc: "Shoot faster.",
            type: 'consumable' // Can buy multiple times
        }
    ];

    items.forEach(item => {
        const btn = document.createElement('div');
        btn.style.margin = '10px';
        btn.style.padding = '10px';
        btn.style.background = '#333';
        btn.style.border = '1px solid #555';
        btn.style.cursor = 'pointer';
        btn.style.display = 'inline-block';
        btn.style.width = '200px';
        btn.style.verticalAlign = 'top';

        btn.innerHTML = `<strong>${item.name}</strong><br>${item.desc}<br>Cost: ${item.cost} G`;

        btn.onclick = () => buyItem(item);

        // Visual States
        if (item.id === 'speed') {
            btn.innerHTML += `<br>(Lvl ${player.attackSpeedLevel})`;
        }

        if (item.oneTime && unlockedArrows[item.id]) {
            btn.style.background = '#1a331a';
            if (currentArrowType === item.id) {
                btn.style.border = '2px solid gold';
                btn.innerHTML += '<br>EQUIPPED';
            } else {
                btn.onclick = () => { currentArrowType = item.id; initShop(); };
                btn.innerHTML = `<strong>${item.name}</strong><br>(Owned)<br>Click to Equip`;
            }
        }

        container.appendChild(btn);
    });

    // Normal Arrow Equip Button
    const normalBtn = document.createElement('div');
    normalBtn.style.margin = '10px';
    normalBtn.style.padding = '10px';
    normalBtn.style.background = currentArrowType === 'normal' ? '#1a331a' : '#333';
    normalBtn.style.border = currentArrowType === 'normal' ? '2px solid gold' : '1px solid #555';
    normalBtn.style.cursor = 'pointer';
    normalBtn.style.display = 'inline-block';
    normalBtn.style.width = '200px';
    normalBtn.style.verticalAlign = 'top'; // Align with others
    normalBtn.innerHTML = "<strong>Normal Arrows</strong><br>Default arrows.<br>Equip";
    normalBtn.onclick = () => { currentArrowType = 'normal'; initShop(); };
    container.appendChild(normalBtn);
}

function buyItem(item) {
    if (gold >= item.cost) {
        if (item.id === 'ally') {
            gold -= item.cost;
            allies.push(new Ally());
        } else if (item.id === 'repair') {
            gold -= item.cost;
            castleHealth = Math.min(castleHealth + 200, 1000);
        } else if (item.id === 'speed') {
            gold -= item.cost;
            player.upgradeAttackSpeed();
        } else if (!unlockedArrows[item.id]) {
            gold -= item.cost;
            unlockedArrows[item.id] = true;
            currentArrowType = item.id;
        }
        initShop(); // Refresh UI
    } else {
        alert("Not enough gold!");
    }
}

// Input Listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') KEYS.Shift = true;
    if (KEYS.hasOwnProperty(e.code) || e.code === 'KeyS') {
        if (e.code === 'KeyS') KEYS.KeyS = true;
        else KEYS[e.code] = true;
    }

    // Shop Toggle
    if (e.code === 'KeyS' && KEYS.Shift) {
        toggleShop();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') KEYS.Shift = false;
    if (e.code === 'KeyS') KEYS.KeyS = false;
    else if (KEYS.hasOwnProperty(e.code)) KEYS[e.code] = false;
});

function toggleShop() {
    if (gameState === 'PLAYING') {
        gameState = 'SHOP';
        shopElement.classList.remove('hidden');
        initShop(); // Render shop items
    } else if (gameState === 'SHOP') {
        gameState = 'PLAYING';
        shopElement.classList.add('hidden');
    }
}

// Wave Logic
let enemiesToSpawn = 0;
let spawnTimer = 0;

function startWave() {
    enemiesToSpawn = wave * 5 + Math.floor(Math.pow(1.2, wave));
    console.log(`Starting Wave ${wave} with ${enemiesToSpawn} enemies`);
}

function updateWave() {
    if (gameState !== 'PLAYING') return;

    if (enemiesToSpawn > 0) {
        spawnTimer++;
        if (spawnTimer > 100 - (wave * 2)) { // Spawn rate increases with wave
            const types = ['gunner', 'tank', 'archer', 'knight'];
            let typeIndex = Math.min(Math.floor(Math.random() * (wave / 2 + 1)), types.length - 1);
            enemies.push(new Enemy(types[typeIndex]));
            enemiesToSpawn--;
            spawnTimer = 0;
        }
    } else if (enemies.length === 0) {
        wave++;
        startWave();
    }
}

// Main Loop
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Background/Castle area
    ctx.fillStyle = '#888';
    ctx.fillRect(0, 0, 100, CANVAS_HEIGHT); // Castle Wall

    if (gameState === 'PLAYING') {
        player.update();
        player.draw(ctx);

        allies.forEach(ally => {
            ally.update();
            ally.draw(ctx);
        });

        updateWave();

        // Draw Particles
        particles.forEach((p, index) => {
            if (p.type === 'line') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.tx, p.ty);
                ctx.stroke();
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r || 5, 0, Math.PI * 2);
                ctx.fill();
            }
            p.life--;
            if (p.life <= 0) particles.splice(index, 1);
        });

        // Update Projectiles
        arrows.forEach((arrow, index) => {
            arrow.update();
            arrow.draw(ctx);
            if (!arrow.active) arrows.splice(index, 1);
        });

        // Update Enemies
        enemies.forEach((enemy, index) => {
            enemy.update();
            enemy.draw(ctx);

            // Collision Arrow-Enemy
            for (let i = 0; i < arrows.length; i++) {
                let a = arrows[i];
                if (!a.active) continue;

                // Skip if arrow already hit this enemy
                if (a.hitEnemies && a.hitEnemies.includes(enemy)) continue;

                if (
                    a.x < enemy.x + enemy.width &&
                    a.x + a.width > enemy.x &&
                    a.y < enemy.y + enemy.height &&
                    a.y + a.height > enemy.y
                ) {
                    // Apply Damage
                    let dmg = 10;
                    if (a.type === 'fire') dmg = 5;
                    if (a.type === 'poison') dmg = 3;
                    if (a.type === 'piercing') dmg = 8;
                    if (a.type === 'explosive') dmg = 20;
                    if (a.type === 'ice') dmg = 5;
                    if (a.type === 'lightning') dmg = 12;

                    enemy.health -= dmg;

                    // Mark hit
                    if (!a.hitEnemies) a.hitEnemies = [];
                    a.hitEnemies.push(enemy);
                    a.pierceCount--;

                    if (a.pierceCount <= 0) {
                        a.active = false;
                    }

                    // Apply Status
                    if (a.type === 'fire') {
                        enemy.status.burn.active = true;
                        enemy.status.burn.timer = 180; // 3 seconds
                    } else if (a.type === 'poison') {
                        enemy.status.poison.active = true;
                        enemy.status.poison.timer = 300; // 5 seconds
                    } else if (a.type === 'explosive') {
                        // AOE
                        enemies.forEach(e => {
                            if (e === enemy || !e.active) return;
                            const dist = Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2);
                            if (dist < 100) { // 100px radius
                                e.health -= 15;
                                e.status.burn.active = true;
                                e.status.burn.timer = 60;
                            }
                        });
                        // Visual
                        particles.push({ x: enemy.x, y: enemy.y, life: 10, color: 'orange', r: 50 });
                    } else if (a.type === 'ice') {
                        enemy.status.freeze.active = true;
                        enemy.status.freeze.timer = 120; // 2s
                    } else if (a.type === 'lightning') {
                        let nearest = null;
                        let minDist = 200;
                        enemies.forEach(e => {
                            if (e === enemy || !e.active) return;
                            const dist = Math.sqrt((e.x - enemy.x) ** 2 + (e.y - enemy.y) ** 2);
                            if (dist < minDist) {
                                minDist = dist;
                                nearest = e;
                            }
                        });
                        if (nearest) {
                            nearest.health -= 10;
                            nearest.status.shock.active = true;
                            nearest.status.shock.timer = 30;
                            // Visual Chain
                            particles.push({ x: enemy.x, y: enemy.y, tx: nearest.x, ty: nearest.y, life: 5, color: 'yellow', type: 'line' });
                        }
                    }

                    if (enemy.health <= 0) {
                        enemy.active = false;
                        gold += enemy.reward;
                        score += enemy.reward;
                    }
                    if (!a.active) break; // Arrow destroyed
                }
            }

            if (!enemy.active) enemies.splice(index, 1);
        });

        // Game Over Check
        if (castleHealth <= 0) {
            gameState = 'GAMEOVER';
            alert('Game Over! You survived ' + (wave - 1) + ' waves.');
            location.reload();
        }

        // UI Update
        scoreElement.textContent = `Wave: ${wave} | Health: ${castleHealth} | Gold: ${gold}`;
    } else {
        // Pause State (Shop) or Game Over
        player.draw(ctx);
        allies.forEach(ally => ally.draw(ctx));
        enemies.forEach(e => e.draw(ctx));
    }

    requestAnimationFrame(gameLoop);
}

// Init
startWave();
requestAnimationFrame(gameLoop);
