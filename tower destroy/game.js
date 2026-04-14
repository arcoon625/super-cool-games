
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const elixirFill = document.getElementById('elixir-fill');
const elixirText = document.getElementById('elixir-text');
const gameMessage = document.getElementById('game-message');
const levelInfo = document.getElementById('level-info');

// Game Constants
const FPS = 60;
const TILE_SIZE = 40;
const MAP_WIDTH = 1200;
const MAP_HEIGHT = 800;

// Troop Definitions
const TROOPS = {
    knight: { name: 'Knight', cost: 3, hp: 100, damage: 15, speed: 2, range: 30, color: '#3498db', type: 'melee', unlockLevel: 1 },
    archer: { name: 'Archer', cost: 3, hp: 45, damage: 20, speed: 2, range: 180, color: '#9b59b6', type: 'ranged', unlockLevel: 1 },
    gunner: { name: 'Gunner', cost: 4, hp: 60, damage: 25, speed: 1.5, range: 150, color: '#e74c3c', type: 'ranged', unlockLevel: 1 },
    goblin: { name: 'Goblin', cost: 2, hp: 40, damage: 10, speed: 3.5, range: 20, color: '#2ecc71', type: 'melee', unlockLevel: 1 },
    giant: { name: 'Giant', cost: 6, hp: 300, damage: 30, speed: 1, range: 40, color: '#e67e22', type: 'melee', target: 'building', unlockLevel: 2 },
    golem: { name: 'Golem', cost: 8, hp: 1000, damage: 50, speed: 0.8, range: 30, color: '#7f8c8d', type: 'melee', target: 'building', unlockLevel: 2 },
    witch: { name: 'Witch', cost: 5, hp: 60, damage: 25, speed: 1.5, range: 120, color: '#8e44ad', type: 'ranged', unlockLevel: 2, spawnUnit: 'skeleton', spawnRate: 300 },
    wizard: { name: 'Wizard', cost: 5, hp: 70, damage: 40, speed: 1.5, range: 120, color: '#9b59b6', type: 'splash', unlockLevel: 3 },
    dragon: { name: 'Dragon', cost: 7, hp: 200, damage: 50, speed: 2, range: 100, color: '#c0392b', type: 'air', unlockLevel: 5 },
    pekka: { name: 'P.E.K.K.A', cost: 8, hp: 500, damage: 80, speed: 1.5, range: 30, color: '#2c3e50', type: 'melee', unlockLevel: 7 },
    skeleton: { name: 'Skeletons', cost: 1, hp: 20, damage: 5, speed: 2.5, range: 20, color: '#ecf0f1', count: 3, type: 'melee', unlockLevel: 4 }, // Spawns multiple
    tank: { name: 'Tank', cost: 6, hp: 400, damage: 35, speed: 1, range: 100, color: '#7f8c8d', type: 'ranged', unlockLevel: 6 }
};

// Game State
let gameState = {
    mode: 'PLAYING', // PLAYING, VICTORY, DEFEAT
    level: 1,
    elixir: 5,
    maxElixir: 10,
    elixirRate: 0.5, // per second
    selectedTroop: null,
    entities: [],
    lastTime: 0,
    enemySpawnTimer: 0,
    unlockedTroops: ['knight', 'gunner', 'goblin']
};

class Entity {
    constructor(x, y, team, type) {
        this.x = x;
        this.y = y;
        this.team = team; // 'player' or 'enemy'
        this.type = type;
        this.dead = false;

        // Base properties, overridden by type
        this.radius = 15;
        this.hp = 100;
        this.maxHp = 100;
        this.damage = 10;
        this.range = 30;
        this.speed = 0;
        this.color = '#fff';
        this.target = null;
        this.attackCooldown = 0;
        this.attackSpeed = 60; // Frames between attacks
    }

    update() {
        if (this.dead) return;
        if (this.attackCooldown > 0) this.attackCooldown--;

        this.findTarget();

        if (this.target && !this.target.dead) {
            const dist = Math.hypot(this.target.x - this.x, this.target.y - this.y);
            if (dist <= this.range) {
                // Attack
                if (this.attackCooldown <= 0) {
                    this.target.takeDamage(this.damage);
                    this.attackCooldown = this.attackSpeed;

                    // Visual effect
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.target.x, this.target.y);
                    ctx.strokeStyle = '#fff';
                    ctx.stroke();
                }
            } else {
                // Move towards target
                if (this.speed > 0) {
                    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    this.x += Math.cos(angle) * this.speed;
                    this.y += Math.sin(angle) * this.speed;
                }
            }
        } else {
            // Move towards enemy base if no immediate target
            const enemyBaseParams = this.team === 'player' ? { x: MAP_WIDTH / 2, y: 50 } : { x: MAP_WIDTH / 2, y: MAP_HEIGHT - 50 };
            if (this.speed > 0) {
                const angle = Math.atan2(enemyBaseParams.y - this.y, enemyBaseParams.x - this.x);
                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;
            }
        }
    }

    draw() {
        if (this.dead) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Health bar
        const hpPct = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 15, this.y - 25, 30, 5);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 15, this.y - 25, 30 * hpPct, 5);
    }

    findTarget() {
        let closest = null;
        let minDst = Infinity;

        // If this unit only targets buildings (like Giant, Golem), only consider towers
        const targetBuildingsOnly = this.targetType === 'building';

        for (let e of gameState.entities) {
            if (e.team !== this.team && !e.dead) {
                // If targeting buildings only, ignore units
                if (targetBuildingsOnly && e.type !== 'tower') continue;

                const dst = Math.hypot(e.x - this.x, e.y - this.y);

                if (dst < minDst) {
                    minDst = dst;
                    closest = e;
                }
            }
        }

        // If specific building targeter found nothing (no towers left?), it might just stand still or attack units
        // For clash royale style, they usually ignore units until buildings are gone, or they just attack closest building.
        // If no buildings left, game usually ends or they attack units. Simple fallback:
        if (targetBuildingsOnly && !closest) {
            // Fallback to closest unit if no towers? Or just do nothing?
            // Lets fallback to closest unit so they aren't useless
            for (let e of gameState.entities) {
                if (e.team !== this.team && !e.dead) {
                    const dst = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dst < minDst) {
                        minDst = dst;
                        closest = e;
                    }
                }
            }
        }

        this.target = closest;
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.dead = true;
        }
    }
}

class Unit extends Entity {
    constructor(x, y, team, typeName) {
        super(x, y, team, 'unit');
        const stats = TROOPS[typeName];
        this.name = stats.name;
        this.hp = stats.hp;
        this.maxHp = stats.hp;
        this.damage = stats.damage;
        this.range = stats.range;
        this.speed = stats.speed;
        this.color = stats.color;
        this.speed = stats.speed;
        this.color = stats.color;
        this.cost = stats.cost; // Not used for logic, just reference
        this.targetType = stats.target; // 'building' or undefined

        // Custom properties for spawners (like Witch)
        if (stats.spawnUnit) {
            this.spawnUnitType = stats.spawnUnit;
            this.spawnRate = stats.spawnRate; // Frames
            this.spawnTimer = 0;
        }
    }

    update() {
        super.update();

        // Handle spawning logic (Witch)
        if (this.spawnUnitType && !this.dead) {
            this.spawnTimer++;
            if (this.spawnTimer >= this.spawnRate) {
                this.spawnTimer = 0;
                // Spawn skeletons around the witch
                for (let i = 0; i < 3; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 20;
                    const sx = this.x + Math.cos(angle) * dist;
                    const sy = this.y + Math.sin(angle) * dist;
                    gameState.entities.push(new Unit(sx, sy, this.team, this.spawnUnitType));
                }
            }
        }
    }
}

class Tower extends Entity {
    constructor(x, y, team, isKing = false) {
        super(x, y, team, 'tower');
        this.isKing = isKing;
        this.radius = isKing ? 30 : 20;
        this.hp = isKing ? 1000 + (gameState.level * 200) : 500 + (gameState.level * 100);
        this.maxHp = this.hp;
        this.damage = 20 + (gameState.level * 2);
        this.range = 150;
        this.speed = 0;
        this.color = team === 'player' ? '#3498db' : '#e74c3c';
        this.attackSpeed = 40;
    }

    draw() {
        if (this.dead) return;
        ctx.fillStyle = this.color;

        // Draw square for tower to distinguish
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

        // Health bar
        const hpPct = this.hp / this.maxHp;
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x - 20, this.y - 40, 40, 6);
        ctx.fillStyle = 'lime';
        ctx.fillRect(this.x - 20, this.y - 40, 40 * hpPct, 6);
    }
}

// Initialization and Input
function init() {
    setupLevel(gameState.level);
    setupUI();
    requestAnimationFrame(gameLoop);

    // Elixir regeneration
    setInterval(() => {
        if (gameState.mode === 'PLAYING') {
            if (gameState.elixir < gameState.maxElixir) {
                gameState.elixir = Math.min(gameState.maxElixir, gameState.elixir + 1); // FASTER REGEN: 1 per second
                updateElixirUI();
            }
        }
    }, 1000);
}

function setupLevel(lvl) {
    gameState.entities = [];
    gameState.mode = 'PLAYING';
    gameState.elixir = 5;
    gameMessage.style.display = 'none';
    levelInfo.innerText = `Level ${lvl}`;

    // Player King Tower
    gameState.entities.push(new Tower(MAP_WIDTH / 2, MAP_HEIGHT - 50, 'player', true));
    // Player Princess Towers
    gameState.entities.push(new Tower(MAP_WIDTH / 4, MAP_HEIGHT - 100, 'player', false));
    gameState.entities.push(new Tower(MAP_WIDTH * 3 / 4, MAP_HEIGHT - 100, 'player', false));

    // Enemy King Tower
    gameState.entities.push(new Tower(MAP_WIDTH / 2, 50, 'enemy', true));
    // Enemy Princess Towers
    gameState.entities.push(new Tower(MAP_WIDTH / 4, 100, 'enemy', false));
    gameState.entities.push(new Tower(MAP_WIDTH * 3 / 4, 100, 'enemy', false));
}

function setupUI() {
    uiLayer.innerHTML = '';
    gameState.unlockedTroops.forEach(troopKey => {
        const t = TROOPS[troopKey];
        const card = document.createElement('div');
        card.className = 'troop-card';
        card.innerHTML = `
            <div style="width:30px;height:30px;background:${t.color};border-radius:50%"></div>
            <div class="troop-name">${t.name}</div>
            <div class="troop-cost">${t.cost}</div>
        `;
        card.onclick = () => selectTroop(troopKey, card);
        uiLayer.appendChild(card);
    });
}

function updateElixirUI() {
    elixirFill.style.width = `${(gameState.elixir / gameState.maxElixir) * 100}%`;
    elixirText.innerText = `${Math.floor(gameState.elixir)} / ${gameState.maxElixir}`;
}

let activeCardElement = null;

function selectTroop(key, element) {
    if (gameState.selectedTroop === key) {
        gameState.selectedTroop = null;
        if (activeCardElement) activeCardElement.classList.remove('selected');
        activeCardElement = null;
    } else {
        gameState.selectedTroop = key;
        if (activeCardElement) activeCardElement.classList.remove('selected');
        element.classList.add('selected');
        activeCardElement = element;
    }
}

canvas.addEventListener('click', (e) => {
    if (gameState.mode !== 'PLAYING') return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check bounds (crude "can only place on your side" logic)
    // For simplicity, allow placement anywhere on lower half
    if (y < MAP_HEIGHT / 2) {
        // Cannot place on enemy side
        // Show error?
        return;
    }

    if (gameState.selectedTroop) {
        const troopStats = TROOPS[gameState.selectedTroop];
        if (gameState.elixir >= troopStats.cost) {
            spawnUnit(x, y, 'player', gameState.selectedTroop);
            gameState.elixir -= troopStats.cost;
            updateElixirUI();
            // Deselect? optional. Lets keep selected for spamming
        }
    }
});

function spawnUnit(x, y, team, typeName) {
    if (typeName === 'skeleton') {
        // Spawn 3 skeletons
        for (let i = 0; i < 3; i++) {
            gameState.entities.push(new Unit(x + (Math.random() * 20 - 10), y + (Math.random() * 20 - 10), team, typeName));
        }
    } else {
        gameState.entities.push(new Unit(x, y, team, typeName));
    }
}

// Game Loop
function gameLoop(timestamp) {
    const dt = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState.mode !== 'PLAYING') return;

    // Update Entities
    gameState.entities.forEach(e => e.update());

    // Remove dead entities
    gameState.entities = gameState.entities.filter(e => !e.dead);

    // Check Win/Loss Condition
    const playerKing = gameState.entities.find(e => e.team === 'player' && e.isKing);
    const enemyKing = gameState.entities.find(e => e.team === 'enemy' && e.isKing);

    if (!playerKing) {
        endGame('DEFEAT');
    } else if (!enemyKing) {
        endGame('VICTORY');
    }

    // Enemy AI Spawning
    gameState.enemySpawnTimer++;
    // Spawn something every 300-600 frames depending on level (Slower spawns)
    const spawnRate = Math.max(300, 600 - (gameState.level * 30));

    if (gameState.enemySpawnTimer > spawnRate) {
        gameState.enemySpawnTimer = 0;
        // Pick random troop from unlocked or just basic ones
        const available = Object.keys(TROOPS).filter(k => TROOPS[k].unlockLevel <= gameState.level + 1); // Enemy can use slightly better troops
        const randomTroop = available[Math.floor(Math.random() * available.length)];
        // Spawn near enemy king
        spawnUnit(MAP_WIDTH / 2 + (Math.random() * 100 - 50), 150, 'enemy', randomTroop);
    }
}

function draw() {
    // Clear background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw river/bridge?
    ctx.fillStyle = '#3498db';
    ctx.fillRect(0, MAP_HEIGHT / 2 - 10, MAP_WIDTH, 20); // River

    ctx.fillStyle = '#8e44ad'; // Bridge
    ctx.fillRect(100, MAP_HEIGHT / 2 - 12, 60, 24);
    ctx.fillRect(MAP_WIDTH - 160, MAP_HEIGHT / 2 - 12, 60, 24);

    // Draw Entities
    gameState.entities.forEach(e => e.draw());
}

function endGame(result) {
    gameState.mode = result;
    gameMessage.innerText = result;
    gameMessage.style.display = 'block';
    gameMessage.style.color = result === 'VICTORY' ? 'gold' : 'red';

    if (result === 'VICTORY') {
        const nextLevel = gameState.level + 1;
        // Unlock new troop?
        const newUnlock = Object.entries(TROOPS).find(([k, v]) => v.unlockLevel === nextLevel);

        setTimeout(() => {
            if (newUnlock) {
                alert(`Unlocked new troop: ${newUnlock[1].name}!`);
                gameState.unlockedTroops.push(newUnlock[0]);
            }
            gameState.level++;
            setupLevel(gameState.level);
            setupUI();
        }, 3000);
    } else {
        setTimeout(() => {
            // Restart level
            setupLevel(gameState.level);
            setupUI();
        }, 3000);
    }
}

// Start
init();
