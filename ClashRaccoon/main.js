// Game State
const gameState = {
    xp: 0,
    coins: 0,
    level: 1,
    collection: {}, // { cardId: count }
    deck: ['skeletons', 'knight', 'gunner', 'bomb'], // Default deck
    trophies: 0,
    cardLevels: {}, // { cardId: level }
    chests: [
        { type: 'basic', status: 'READY', unlockTime: 0 }, // Free chest at start
        null,
        null,
        null
    ]
};

const LEVEL_XP_REQ = [0, 100, 300, 600, 1000, 2000]; // XP required for levels

// DOM Elements
const els = {
    xpDisplay: document.getElementById('player-level'),
    xpBar: document.getElementById('xp-bar-fill'),
    coinDisplay: document.getElementById('player-coins'),
    trophyDisplay: document.getElementById('player-trophies'),
    chestSlots: document.getElementById('chest-slots'),
    resetBtn: document.getElementById('reset-btn'),

    // Screens
    homeScreen: document.getElementById('home-screen'),
    deckScreen: document.getElementById('deck-screen'),
    battleScreen: document.getElementById('battle-screen'),

    // Battle
    battleBtn: document.getElementById('battle-btn'),

    // Navigation
    navBtns: document.querySelectorAll('.nav-btn'),

    // Modal
    chestModal: document.getElementById('chest-modal'),
    chestRewards: document.getElementById('chest-rewards'),
    closeChestBtn: document.getElementById('close-chest-btn'),

    // Arena elements
    arenaNum: document.getElementById('arena-num'),
    arenaName: document.getElementById('arena-name'),
    arenaModal: document.getElementById('arena-modal'),
    arenaUnlocksGrid: document.getElementById('arena-unlocks-grid'),
    closeArenaBtn: document.getElementById('close-arena-btn'),
    shopChestsContainer: document.getElementById('shop-chests-container'),
    shopGoldContainer: document.getElementById('shop-gold-container'),

    // Card Details Modal
    detailsModal: document.getElementById('card-details-modal'),
    detailsName: document.getElementById('details-name'),
    detailsRarity: document.getElementById('details-rarity'),
    detailsImage: document.getElementById('details-image'),
    detailsHP: document.getElementById('details-hp'),
    detailsDMG: document.getElementById('details-dmg'),
    detailsElixir: document.getElementById('details-elixir'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    upgradeCost: document.getElementById('upgrade-cost'),
    upgradeProgressFill: document.getElementById('upgrade-progress-fill'),
    upgradeProgressText: document.getElementById('upgrade-progress-text'),
    toggleDeckBtn: document.getElementById('toggle-deck-btn'),
    closeDetailsBtn: document.getElementById('close-details-btn')
};

const ARENAS = [
    {
        num: 1,
        name: 'Raccoon Forest',
        req: 0,
        color: '#2ecc71',
        icon: '🌲',
        background: 'linear-gradient(to bottom, #2c3e50, #27ae60)',
        previewArt: 'radial-gradient(circle at 50% 120%, #27ae60 0%, #2ecc71 40%, #2c3e50 100%)'
    },
    {
        num: 2,
        name: 'Bone Pit',
        req: 400,
        color: '#95a5a6',
        icon: '🦴',
        background: 'linear-gradient(to bottom, #2c3e50, #7f8c8d)',
        previewArt: 'radial-gradient(circle at 50% 120%, #7f8c8d 0%, #95a5a6 40%, #2c3e50 100%)'
    },
    {
        num: 3,
        name: 'Barbarian Bowl',
        req: 800,
        color: '#e67e22',
        icon: '⚔️',
        background: 'linear-gradient(to bottom, #d35400, #e67e22)',
        previewArt: 'radial-gradient(circle at 50% 120%, #e67e22 0%, #f39c12 40%, #d35400 100%)'
    },
    {
        num: 4,
        name: 'P.E.C.K.A\'s Playhouse',
        req: 1100,
        color: '#2c3e50',
        icon: '🤖',
        background: 'linear-gradient(to bottom, #1a1a1a, #2c3e50)',
        previewArt: 'radial-gradient(circle at 50% 120%, #2c3e50 0%, #34495e 40%, #1a1a1a 100%)'
    },
    {
        num: 5,
        name: 'Spell Valley',
        req: 1400,
        color: '#9b59b6',
        icon: '🔮',
        background: 'linear-gradient(to bottom, #4b0082, #9b59b6)',
        previewArt: 'radial-gradient(circle at 50% 120%, #9b59b6 0%, #8e44ad 40%, #4b0082 100%)'
    },
    {
        num: 6,
        name: 'Frozen Peak',
        req: 2000,
        color: '#ecf0f1',
        icon: '❄️',
        background: 'linear-gradient(to bottom, #2980b9, #ecf0f1)',
        previewArt: 'radial-gradient(circle at 50% 120%, #ecf0f1 0%, #bdc3c7 40%, #2980b9 100%)'
    },
    {
        num: 7,
        name: 'Royal Arena',
        req: 2600,
        color: '#f1c40f',
        icon: '👑',
        background: 'linear-gradient(to bottom, #2c3e50, #f1c40f)',
        previewArt: 'radial-gradient(circle at 50% 120%, #f1c40f 0%, #f39c12 40%, #2c3e50 100%)'
    },
    {
        num: 8,
        name: 'Jungle Arena',
        req: 3000,
        color: '#27ae60',
        icon: '🌿',
        background: 'linear-gradient(to bottom, #1e272e, #27ae60)',
        previewArt: 'radial-gradient(circle at 50% 120%, #2ecc71 0%, #27ae60 40%, #1e272e 100%)'
    },
    {
        num: 9,
        name: 'Hog Mountain',
        req: 3400,
        color: '#e67e22',
        icon: '🏔️',
        background: 'linear-gradient(to bottom, #2c3e50, #e67e22)',
        previewArt: 'radial-gradient(circle at 50% 120%, #e67e22 0%, #d35400 40%, #2c3e50 100%)'
    },
    {
        num: 10,
        name: 'Electro Valley',
        req: 3800,
        color: '#00d2d3',
        icon: '⚡',
        background: 'linear-gradient(to bottom, #2c3e50, #00d2d3)',
        previewArt: 'radial-gradient(circle at 50% 120%, #00d2d3 0%, #01a3a4 40%, #2c3e50 100%)'
    }
];

// --- Initialization ---
function init() {
    loadGame();

    // Init Shop if missing or old format
    const isOldFormat = gameState.shop && gameState.shop.length > 0 && !gameState.shop[0].type;
    if (!gameState.shop || gameState.shop.length === 0 || isOldFormat) {
        refreshShop();
    }

    updateUI();
    setupEventListeners();
}

function setupEventListeners() {
    // Navigation
    els.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // Battle
    els.battleBtn.addEventListener('click', startBattle);
    if (els.resetBtn) els.resetBtn.addEventListener('click', resetGame);

    // Modal
    els.closeChestBtn.onclick = () => {
        els.chestModal.classList.add('hidden');
    };

    els.closeArenaBtn.onclick = () => {
        els.arenaModal.classList.add('hidden');
    };

    els.closeDetailsBtn.onclick = () => {
        els.detailsModal.classList.add('hidden');
    };

    document.querySelector('.arena-display').onclick = () => {
        showArenaInfo();
    };

    // Back Buttons
    document.querySelectorAll('.nav-return-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab('home');
        });
    });

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'b' || e.key === 'B') {
            switchTab('home');
        }
    });
}

function refreshShop() {
    gameState.shop = [];
    const currentArenaNum = getCurrentArena().num;
    const availablePool = CARDS.filter(c => c.arena <= currentArenaNum);

    // Safety check for empty pool
    if (availablePool.length === 0) return;

    // 1. Daily Deals (6 Cards)
    for (let i = 0; i < 6; i++) {
        const card = availablePool[Math.floor(Math.random() * availablePool.length)];
        const amount = Math.floor(Math.random() * 5) + 1;
        let unitPrice = 10;
        if (card.rarity === 'UNCOMMON') unitPrice = 50;
        if (card.rarity === 'RARE') unitPrice = 150;
        if (card.rarity === 'EPIC') unitPrice = 500;
        if (card.rarity === 'LEGENDARY') unitPrice = 2000;

        gameState.shop.push({
            type: 'card',
            cardId: card.id,
            amount: amount,
            price: unitPrice * amount,
            purchased: false
        });
    }

    // 2. Chests (3 Types)
    const chestTypes = [
        { name: 'Silver', price: 50, type: 'Silver' },
        { name: 'Golden', price: 150, type: 'Golden' },
        { name: 'Giant', price: 500, type: 'Giant' }
    ];
    chestTypes.forEach(ct => {
        gameState.shop.push({
            type: 'chest',
            chestType: ct.type,
            name: ct.name,
            price: ct.price,
            purchased: false
        });
    });

    // 3. Treasury (Gold Packs)
    const goldPacks = [
        { name: 'Bucket of Gold', amount: 500, price: 0 }, // First one free? Or just low cost
        { name: 'Pouch of Gold', amount: 200, price: 50 },
        { name: 'Wagon of Gold', amount: 2000, price: 400 }
    ];
    goldPacks.forEach(gp => {
        gameState.shop.push({
            type: 'gold',
            name: gp.name,
            amount: gp.amount,
            price: gp.price,
            purchased: false
        });
    });

    saveGame();
}

function renderShop() {
    const dailyContainer = document.getElementById('shop-container');
    const chestsContainer = els.shopChestsContainer;
    const goldContainer = els.shopGoldContainer;

    if (dailyContainer) dailyContainer.innerHTML = '';
    if (chestsContainer) chestsContainer.innerHTML = '';
    if (goldContainer) goldContainer.innerHTML = '';

    const coinDisp = document.getElementById('coin-display-shop');
    if (coinDisp) coinDisp.textContent = gameState.coins;

    gameState.shop.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = `shop-item ${item.type}-item`;
        if (item.purchased) el.classList.add('sold-out');
        else el.onclick = () => buyShopItem(index);

        let content = '';
        if (item.type === 'card') {
            const card = getCardById(item.cardId);
            content = `
                <div style="font-size:0.7rem; font-weight:bold; color:#7f8c8d">${card.rarity}</div>
                <div class="card-image" style="${card.image ? `background-image: url('${card.image}')` : 'display:flex;align-items:center;justify-content:center;font-size:30px;'}; width:50px; height:60px; background-size:cover;">${card.image ? '' : card.icon}</div>
                <div style="font-size:0.8rem; font-weight:bold">${card.name} x${item.amount}</div>
            `;
        } else if (item.type === 'chest') {
            content = `
                <div style="font-size:0.7rem; font-weight:bold; color:#3498db">CHEST</div>
                <div style="font-size:40px; margin: 5px 0;">📦</div>
                <div style="font-size:0.8rem; font-weight:bold">${item.name}</div>
            `;
        } else if (item.type === 'gold') {
            content = `
                <div style="font-size:0.7rem; font-weight:bold; color:#f1c40f">GOLD</div>
                <div style="font-size:40px; margin: 5px 0;">🪙</div>
                <div style="font-size:0.8rem; font-weight:bold">${item.amount} Gold</div>
            `;
        }

        el.innerHTML = `
            ${content}
            <div class="shop-price">
                ${item.purchased ? 'SOLD' : (item.price === 0 ? 'FREE' : `🪙 ${item.price}`)}
            </div>
        `;

        if (item.type === 'card') dailyContainer.appendChild(el);
        else if (item.type === 'chest') chestsContainer.appendChild(el);
        else if (item.type === 'gold') goldContainer.appendChild(el);
    });
}

function buyShopItem(index) {
    const item = gameState.shop[index];
    if (!item || item.purchased) return;

    if (gameState.coins >= item.price) {
        if (item.type === 'chest') {
            // Check for empty chest slot
            const slot = gameState.chests.findIndex(c => c === null);
            if (slot === -1) {
                alert("Chest slots full!");
                return;
            }
            gameState.chests[slot] = { type: item.chestType, status: 'LOCKED', unlockTime: 10000 };
        } else if (item.type === 'gold') {
            gameState.coins += item.amount;
        } else if (item.type === 'card') {
            addCardToCollection(item.cardId, item.amount);
        }

        gameState.coins -= item.price;
        item.purchased = true;
        updateUI();
        renderShop();

        const feedback = item.type === 'card' ? `Bought ${item.amount} x ${getCardById(item.cardId).name}!`
            : item.type === 'chest' ? `Bought ${item.name} Chest!`
                : `Received ${item.amount} Gold!`;
        alert(feedback);
        saveGame();
    } else {
        alert("Not enough Coins!");
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    if (tabName === 'home') {
        renderChestSlots();
        els.homeScreen.classList.add('active');
        document.querySelector('[data-tab="home"]').classList.add('active');
    } else if (tabName === 'deck') {
        renderCollection();
        els.deckScreen.classList.add('active');
        document.querySelector('[data-tab="deck"]').classList.add('active');
    } else if (tabName === 'shop') {
        renderShop();
        const shopScreen = document.getElementById('shop-screen');
        if (shopScreen) shopScreen.classList.add('active');
        document.querySelector('[data-tab="shop"]').classList.add('active');
    }
}

// --- core Logic ---

function addXP(amount) {
    gameState.xp += amount;
    // Level Up Logic
    if (gameState.level < LEVEL_XP_REQ.length && gameState.xp >= LEVEL_XP_REQ[gameState.level]) {
        gameState.xp -= LEVEL_XP_REQ[gameState.level];
        gameState.level++;
        alert("LEVEL UP! You are now level " + gameState.level);
    }
    updateUI();
}

function addCoins(amount) {
    gameState.coins += amount;
    updateUI();
}

function addCardToCollection(cardId, amount = 1) {
    if (!gameState.collection[cardId]) gameState.collection[cardId] = 0;
    gameState.collection[cardId] += amount;
}

// --- Chest Logic ---

function openChest(slotIndex) {
    const chest = gameState.chests[slotIndex];
    if (!chest || chest.status !== 'READY') return;

    // Generate Rewards
    const rewards = generateChestRewards(chest.type);

    // Apply rewards
    addCoins(rewards.coins);
    rewards.cards.forEach(r => addCardToCollection(r.cardId, r.count));

    // Remove chest
    gameState.chests[slotIndex] = null;

    // Show UI
    showChestRewards(rewards);
    updateUI();
}

function generateChestRewards(type) {
    let coins = 0;
    let numCards = 0;
    const cards = [];
    const currentArenaNum = getCurrentArena().num;

    // Tiered scaling
    if (type === 'Giant') {
        coins = Math.floor(Math.random() * 500) + 200;
        numCards = 10;
    } else if (type === 'Golden') {
        coins = Math.floor(Math.random() * 150) + 80;
        numCards = 5;
    } else { // Silver or Basic
        coins = Math.floor(Math.random() * 50) + 20;
        numCards = 3;
    }

    for (let i = 0; i < numCards; i++) {
        let minRarity = 'COMMON';

        // Guarantees for better chests
        if (type === 'Giant') {
            if (i === 0) minRarity = 'EPIC'; // 1 Guaranteed Epic
            else if (i < 3) minRarity = 'RARE'; // 2 Guaranteed Rares
        } else if (type === 'Golden') {
            if (i === 0) minRarity = 'RARE'; // 1 Guaranteed Rare
        }

        const rarity = rollRarity(minRarity);
        const availableCards = CARDS.filter(c => c.rarity === rarity && c.arena <= currentArenaNum);

        if (availableCards.length > 0) {
            const card = availableCards[Math.floor(Math.random() * availableCards.length)];
            const existing = cards.find(c => c.cardId === card.id);
            if (existing) existing.count++;
            else cards.push({ cardId: card.id, count: 1, name: card.name, rarity: card.rarity });
        }
    }

    return { coins, cards };
}

function rollRarity(minRarity = 'COMMON') {
    const rarityLevels = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'];
    const minIndex = rarityLevels.indexOf(minRarity);

    let roll = 'COMMON';
    const rand = Math.random();
    if (rand < RARITY.LEGENDARY.dropRate) roll = 'LEGENDARY'; // 1%
    else if (rand < RARITY.LEGENDARY.dropRate + RARITY.EPIC.dropRate) roll = 'EPIC'; // 5%
    else if (rand < 0.2) roll = 'RARE'; // 15%
    else if (rand < 0.5) roll = 'UNCOMMON'; // 30%
    else roll = 'COMMON';

    const rollIndex = rarityLevels.indexOf(roll);
    return rarityLevels[Math.max(minIndex, rollIndex)];
}

function showChestRewards(rewards) {
    els.chestRewards.innerHTML = `
        <div class="reward-row">🪙 ${rewards.coins} Coins</div>
        ${rewards.cards.map(c => `
            <div class="reward-card">
                <span class="card-icon">${getCardById(c.cardId).icon}</span>
                <span>${c.count}x <span style="color:${RARITY[c.rarity].color}">${c.name}</span></span>
            </div>
        `).join('')}
    `;
    els.chestModal.classList.remove('hidden');
}

function startChestUnlock(slotIndex) {
    // Simplified: Instant unlock for 'Free' chests or long timer
    // For now, let's make all chestnuts instant for testing joy
    const chest = gameState.chests[slotIndex];
    if (chest && chest.status === 'LOCKED') {
        chest.status = 'READY'; // Instant for now
        updateUI();
    }
}

// --- Battle Logic ---
let battleState = null;
let gameLoopId = null;

function getCurrentArena() {
    let current = ARENAS[0];
    for (const arena of ARENAS) {
        if (gameState.trophies >= arena.req) {
            current = arena;
        }
    }
    return current;
}

function showArenaInfo() {
    const arena = getCurrentArena();
    document.getElementById('modal-arena-name').textContent = arena.name;

    const unlocks = CARDS.filter(c => c.arena === arena.num);
    const container = els.arenaUnlocksGrid;
    container.innerHTML = '';

    unlocks.forEach(card => {
        const el = document.createElement('div');
        el.className = `card ${card.rarity.toLowerCase()}`;
        el.innerHTML = `
            <div class="card-image" style="${card.image ? `background-image: url('${card.image}')` : 'display:flex;align-items:center;justify-content:center;font-size:30px;'}">${card.image ? '' : card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="elixir-cost">${card.elixir}</div>
        `;
        container.appendChild(el);
    });

    els.arenaModal.classList.remove('hidden');
}

function startBattle() {
    try {
        // 1. Validate Deck Size
        // If < 8, fill with random unlocked or duplicates until 8
        const deck = [...gameState.deck];
        if (deck.length < 8) {
            const unlocked = Object.keys(gameState.collection);
            if (unlocked.length === 0) { alert("Error: No cards!"); return; }

            while (deck.length < 8) {
                // Pick random unlocked
                deck.push(unlocked[Math.floor(Math.random() * unlocked.length)]);
            }
        }

        // Switch Screen
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        els.battleScreen.classList.add('active');

        // 2. Init State (Shuffle)
        const shuffled = deck.sort(() => Math.random() - 0.5);

        battleState = {
            elixir: 5,
            maxElixir: 10,
            elixirRate: 0.5,
            entities: [],
            lastTime: performance.now(),
            startTime: performance.now(),
            gameOver: false,
            enemySpawnTimer: 0,

            // Cycle
            hand: [null, null, null, null], // Slots
            drawPile: shuffled,
            discardPile: [], // Not strictly needed if we rotate, but good for tracking

            selectedCard: null,
            selectedIndex: -1
        };

        // Fill Initial Hand (4 cards)
        for (let i = 0; i < 4; i++) {
            battleState.hand[i] = battleState.drawPile.shift();
        }

        // Spawn Towers
        spawnTower('player');
        spawnTower('enemy');

        // Apply Arena Colors
        const arena = getCurrentArena();
        const field = document.getElementById('battlefield');
        field.style.backgroundColor = arena.color;

        // Dynamic battlefield design
        field.style.backgroundImage = `
            ${arena.background},
            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.05) 0px, rgba(255, 255, 255, 0.05) 20px, transparent 20px, transparent 40px)
        `;
        field.style.backgroundBlendMode = 'overlay';
        field.style.backgroundSize = 'cover, auto';

        renderBattleHand(); // Handles Hand + Next Card

        // Start Loop
        cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(gameLoop);

        // UI Init
        document.getElementById('elixir-count').textContent = Math.floor(battleState.elixir);
        document.getElementById('elixir-fill').style.width = (battleState.elixir / battleState.maxElixir * 100) + '%';
    } catch (e) {
        console.error(e);
        alert("Battle Error: " + e.message);
        switchTab('home'); // Recover
    }
}

function spawnTower(team) {
    const isPlayer = team === 'player';
    const fieldH = 600; // Approx
    const fieldW = document.getElementById('battlefield').offsetWidth;

    battleState.entities.push({
        uid: team + '_king',
        id: 'tower',
        team: team,
        type: 'tower',
        x: (fieldW / 2) - 50, // Centered (100px width)
        y: isPlayer ? fieldH - 120 : 10,
        hp: 3000,
        maxHp: 3000,
        dmg: 50, // Defensive fire? (Future)
        icon: '🏰',
        dead: false
    });
}

function gameLoop(timestamp) {
    if (battleState.gameOver) return;

    const dt = (timestamp - battleState.lastTime) / 1000;
    battleState.lastTime = timestamp;

    updateBattle(dt);
    drawBattle();

    gameLoopId = requestAnimationFrame(gameLoop);
}

function updateBattle(dt) {
    // Elixir
    if (battleState.elixir < battleState.maxElixir) {
        battleState.elixir += battleState.elixirRate * dt;
        if (battleState.elixir > battleState.maxElixir) battleState.elixir = battleState.maxElixir;

        document.getElementById('elixir-count').textContent = Math.floor(battleState.elixir);
        document.getElementById('elixir-fill').style.width = (battleState.elixir / battleState.maxElixir * 100) + '%';
    }

    // AI Spawner
    battleState.enemySpawnTimer += dt;
    if (battleState.enemySpawnTimer > 6) {
        spawnEnemyUnit();
        battleState.enemySpawnTimer = 0;
    }


    // Combat & Movement
    battleState.entities.forEach(ent => {
        if (ent.dead) return;

        // 1. Find Target (Simple closest enemy)
        let target = null;
        let minRate = 9999;

        battleState.entities.forEach(other => {
            if (other === ent || other.dead || other.team === ent.team) return;
            const dist = Math.hypot(ent.x - other.x, ent.y - other.y);
            if (dist < 200 && dist < minRate) { // Aggro range
                minRate = dist;
                target = other;
            }
        });

        // 2. Action: Attack vs Move
        if (target && minRate < 30) {
            // Attack
            target.hp -= ent.dmg * dt;
            if (target.hp <= 0) {
                target.dead = true;
                if (target.type === 'tower') endBattle(ent.team === 'player');
            }
        } else if (ent.type !== 'tower') { // Towers don't move
            // Move Logic
            // Default target is enemy tower
            const towerY = ent.team === 'player' ? 20 : 550; // Approx
            let destX = ent.x; // Straight line default
            let destY = towerY;

            // River Pathfinding
            const riverY = 300; // Approx mid
            const isNearRiver = Math.abs(ent.y - riverY) < 50;
            const fieldW = 320; // assumed width if undefined, but accessible via DOM or saved state. 
            // Lets crude logic: Bridge Left (20%), Bridge Right (80%)
            // Pixels: 20% of ~350 = 70px, 80% = 280px.
            const bridges = [80, 240]; // Estimated centers

            if (isNearRiver) {
                // Find nearest bridge
                const closestBridge = Math.abs(ent.x - bridges[0]) < Math.abs(ent.x - bridges[1]) ? bridges[0] : bridges[1];
                if (Math.abs(ent.x - closestBridge) > 10) {
                    destX = closestBridge;
                    destY = riverY; // Move laterally to bridge
                }
            } else if (target) {
                destX = target.x;
                destY = target.y;
            }

            // Move vector
            const dx = destX - ent.x;
            const dy = destY - ent.y;
            const len = Math.hypot(dx, dy);

            if (len > 1) {
                const speed = 40; // Faster
                ent.x += (dx / len) * speed * dt;
                ent.y += (dy / len) * speed * dt;
            }
        }
    });

    // Remove dead
    battleState.entities = battleState.entities.filter(e => !e.dead);
}

function drawBattle() {
    const field = document.getElementById('battlefield');

    document.querySelectorAll('.entity').forEach(el => {
        const uid = el.id;
        const ent = battleState.entities.find(e => e.uid === uid);
        if (!ent) {
            el.remove();
        } else {
            // Update HP bar if needed (TODO)
            if (ent.type === 'tower') {
                // Tower special vis?
                el.style.opacity = ent.hp / ent.maxHp;
            }
        }
    });

    battleState.entities.forEach(ent => {
        let el = document.getElementById(ent.uid);
        if (!el) {
            el = document.createElement('div');
            el.id = ent.uid;

            // Tower vs Troop
            if (ent.type === 'tower') {
                el.className = 'entity ' + ent.team + ' tower';
                // Towers use emojis for now, or we can make a tower asset later. 
                // Let's keep emoji for Tower to act as "King", or finding a castle image?
                // Plan said "Battle Visuals", implied units. Let's stick to units for now or make a generic castle style.
                // Actually, let's use the emoji '🏰' but scaled up as before, but maybe stylized better?
                // The current css handles .tower quite well.
                el.textContent = ent.icon;
            } else {
                el.className = 'entity ' + ent.team;
                // Use Card Image
                const card = getCardById(ent.id);
                if (card && card.image) {
                    el.style.backgroundImage = `url('${card.image}')`;
                    el.style.backgroundSize = 'cover';
                    el.style.backgroundColor = 'transparent'; // Remove default if any
                    el.style.borderRadius = '50%'; // Circle units? Or square? Let's try circle for troops.
                    el.style.border = '2px solid ' + (ent.team === 'player' ? '#3498db' : '#e74c3c');
                } else {
                    el.textContent = ent.icon; // Fallback
                }
            }

            el.style.position = 'absolute';
            el.style.width = '40px'; // Slightly larger units
            el.style.height = '40px';
            el.style.fontSize = '25px'; // For towers
            el.style.textAlign = 'center';
            el.title = ent.name || ''; // Show name on hover


            // Remove hue-rotate for images, use border/overlay for team distinction
            // if (ent.team === 'enemy' && ent.type !== 'tower') el.style.filter = 'hue-rotate(180deg)'; 

            field.appendChild(el);
        }
        el.style.left = ent.x + 'px';
        el.style.top = ent.y + 'px';
    });
}

function spawnUnit(cardId, team, x, y, customName = null) {
    const card = getCardById(cardId);
    if (!card) return;

    const uid = Math.random().toString(36).substr(2, 9);
    battleState.entities.push({
        uid: uid,
        id: cardId,
        team: team,
        type: 'troop',
        x: x,
        y: y,
        hp: card.hp || 100,
        dmg: card.dmg || 10,
        icon: card.icon,
        name: customName || card.name,
        dead: false
    });
}

function spawnEnemyUnit() {
    const x = Math.random() * 200 + 50;
    spawnUnit('skeletons', 'enemy', x, 50);
}

function renderBattleHand() {
    const handContainer = document.getElementById('hand-cards');
    handContainer.innerHTML = '';

    // Hand
    battleState.hand.forEach((cardId, index) => {
        const card = getCardById(cardId);
        const el = document.createElement('div');
        el.className = `card in-hand ${card.rarity.toLowerCase()}`;
        if (battleState.selectedIndex === index) el.classList.add('selected');

        el.innerHTML = `
            <div class="card-image" style="${card.image ? `background-image: url('${card.image}')` : 'display:flex;align-items:center;justify-content:center;font-size:40px;'}">${card.image ? '' : card.icon}</div>
            <div class="card-elixir">${card.elixir}</div>
        `;

        el.onclick = () => selectCard(cardId, el, index);
        handContainer.appendChild(el);
    });

    // Next Card
    const nextContainer = document.getElementById('next-card-slot');
    nextContainer.innerHTML = '';
    const nextCardId = battleState.drawPile[0];
    if (nextCardId) {
        const c = getCardById(nextCardId);
        nextContainer.innerHTML = `
            <div class="card ${c.rarity.toLowerCase()}" style="transform: scale(0.6);">
                <div class="card-image" style="${c.image ? `background-image: url('${c.image}')` : 'display:flex;align-items:center;justify-content:center;font-size:40px;'}">${c.image ? '' : c.icon}</div>
            </div>

        `;
    }
}

function selectCard(cardId, el, index) {
    document.querySelectorAll('.in-hand').forEach(e => e.classList.remove('selected'));

    // Toggle off
    if (battleState.selectedIndex === index) {
        battleState.selectedCard = null;
        battleState.selectedIndex = -1;
        return;
    }

    const card = getCardById(cardId);
    if (battleState.elixir < card.elixir) {
        // alert("Not enough Elixir!"); // Annoying in fast play
        return;
    }

    battleState.selectedCard = cardId;
    battleState.selectedIndex = index;
    el.classList.add('selected');
}

// Click on battlefield
document.getElementById('battlefield').addEventListener('mousedown', (e) => {
    if (!battleState || battleState.selectedIndex === -1) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const card = getCardById(battleState.selectedCard);

    // Spend
    battleState.elixir -= card.elixir;

    // Spawn Logic with Count and Custom Names
    const count = card.count || 1;
    for (let i = 0; i < count; i++) {
        // Random offset for horde layout
        const offsetX = (Math.random() - 0.5) * 40;
        const offsetY = (Math.random() - 0.5) * 40;

        let customName = null;
        if (card.spawnNames && card.spawnNames[i]) {
            customName = card.spawnNames[i];
        }

        spawnUnit(battleState.selectedCard, 'player', x + offsetX, y + offsetY, customName);
    }

    // Cycle Logic
    // 1. Played card -> End of Draw
    battleState.drawPile.push(battleState.selectedCard);

    // 2. Top of Draw -> Hand slot
    battleState.hand[battleState.selectedIndex] = battleState.drawPile.shift();

    // UI
    renderBattleHand(); // Updates Hand and Next

    // Deselect
    battleState.selectedCard = null;
    battleState.selectedIndex = -1;
});


function endBattle(won) {
    battleState.gameOver = true; // Stop the game loop
    cancelAnimationFrame(gameLoopId); // Ensure loop is stopped

    // Clear battlefield entities only
    document.querySelectorAll('.entity').forEach(e => e.remove());

    const durationMs = performance.now() - (battleState.startTime || performance.now());
    const durationSec = Math.floor(durationMs / 1000);

    let trophyDelta = -20;
    let isBlitzPromotion = false;

    if (won) {
        if (durationSec < 20) {
            // Blitz Promotion!
            const current = getCurrentArena();
            const nextArenaIndex = ARENAS.findIndex(a => a.num === current.num) + 1;
            if (nextArenaIndex < ARENAS.length) {
                const nextArena = ARENAS[nextArenaIndex];
                trophyDelta = nextArena.req - gameState.trophies;
                isBlitzPromotion = true;
            } else {
                trophyDelta = 50; // Max trophies if already at final arena
            }
        } else if (durationSec < 30) trophyDelta = 50;
        else if (durationSec < 60) trophyDelta = 40;
        else if (durationSec < 120) trophyDelta = 30;
        else trophyDelta = 25;
    }

    gameState.trophies = Math.max(0, gameState.trophies + trophyDelta);

    if (won) {
        if (isBlitzPromotion) {
            const newArena = getCurrentArena();
            alert(`⚡ BLITZ PROMOTION! ⚡\nWin in ${durationSec}s! You've been promoted to ${newArena.name}!\n+${trophyDelta} Trophies!`);
        } else {
            alert(`Victory! ${durationSec}s battle. +50 XP, +${trophyDelta} Trophies`);
        }
    } else {
        alert(`Defeat! ${durationSec}s battle. -20 Trophies`);
    }
    if (won) {
        addXP(50);
        // Add chest if slot available
        const emptySlot = gameState.chests.findIndex(c => c === null);
        if (emptySlot !== -1) {
            // Random chest type
            const type = Math.random() > 0.8 ? 'Golden' : 'Silver';
            gameState.chests[emptySlot] = { type: type, status: 'LOCKED', unlockTime: 10000 };
            alert(`You got a ${type} Chest!`);
        } else {
            alert("Chest slots full!");
        }
    }
    switchTab('home');
    refreshShop(); // New offers after every battle
    updateUI();
}


// --- UI Updates ---
function updateUI() {
    // Stats
    els.xpDisplay.textContent = gameState.level;
    const req = LEVEL_XP_REQ[gameState.level] || 9999;
    const prev = LEVEL_XP_REQ[gameState.level - 1] || 0;
    const pct = ((gameState.xp) / (req)) * 100; // Simplified
    els.xpBar.style.width = `${pct}%`;
    els.coinDisplay.textContent = gameState.coins;
    if (els.trophyDisplay) els.trophyDisplay.textContent = gameState.trophies;

    // Arena Update
    const arena = getCurrentArena();
    if (els.arenaNum) els.arenaNum.textContent = `ARENA ${arena.num}`;
    if (els.arenaName) els.arenaName.textContent = arena.name;

    // Update Arena Image (Premium Art)
    const arenaImgEl = document.getElementById('arena-image');
    if (arenaImgEl) {
        arenaImgEl.style.background = arena.previewArt;
        // Adding layered aesthetic elements
        arenaImgEl.innerHTML = `
            <div style="position:absolute; bottom:-10px; font-size:120px; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.5))">${arena.icon}</div>
            <div style="position:absolute; top:10px; right:10px; font-size:40px; opacity:0.3; transform:rotate(15deg)">${arena.icon}</div>
            <div style="position:absolute; top:40px; left:20px; font-size:30px; opacity:0.2; transform:rotate(-10deg)">${arena.icon}</div>
        `;
    }

    // Chests
    renderChestSlots();
}

function renderChestSlots() {
    els.chestSlots.innerHTML = '';
    gameState.chests.forEach((chest, index) => {
        const div = document.createElement('div');
        div.className = 'chest-slot ' + (chest ? 'has-chest' : 'empty');

        if (chest) {
            div.innerHTML = `
                <div>${chest.type}</div>
                <div style="font-size:0.7em">${chest.status}</div>
            `;
            div.onclick = () => {
                if (chest.status === 'READY') openChest(index);
                else startChestUnlock(index);
            };
        } else {
            div.textContent = "Empty";
        }

        els.chestSlots.appendChild(div);
    });
}

function renderCollection() {
    const container = document.getElementById('card-collection');
    container.innerHTML = '';
    // Deck Builder
    const deckSet = new Set(gameState.deck);

    // Sort: Unlocked first, then by arena, then by rarity
    const getWeight = (c) => {
        const currentArenaNum = getCurrentArena().num;
        const arenaLocked = c.arena > currentArenaNum;
        const rarityWeights = { 'COMMON': 1, 'UNCOMMON': 2, 'RARE': 3, 'EPIC': 4, 'LEGENDARY': 5 };
        // Weight: 0 if locked, 1000 if unlocked. Then arena (lower is higher), then rarity.
        return (arenaLocked ? 0 : 1000) - (c.arena * 10) + rarityWeights[c.rarity];
    };
    CARDS.sort((a, b) => getWeight(b) - getWeight(a));

    CARDS.forEach(card => {
        const count = gameState.collection[card.id] || 0;
        const level = gameState.cardLevels[card.id] || 1;
        const required = level * 5;
        const canUpgrade = count >= required && count > 0;

        const isSelected = deckSet.has(card.id);
        const currentArenaNum = getCurrentArena().num;
        const isArenaLocked = card.arena > currentArenaNum;

        const el = document.createElement('div');
        el.className = `card ${card.rarity.toLowerCase()} ${isSelected ? 'selected' : ''} ${isArenaLocked ? 'locked' : ''} ${canUpgrade ? 'can-upgrade' : ''}`;

        // Arena lock overlay
        let lockOverlay = '';
        if (isArenaLocked) {
            lockOverlay = `<div class="lock-overlay">🔒 Arena ${card.arena}</div>`;
        } else if (count === 0) {
            lockOverlay = `<div class="not-owned-overlay">NOT OWNED</div>`;
        }

        const selectionBadge = isSelected ? '<div class="deck-badge">IN DECK</div>' : '';

        el.innerHTML = `
            ${lockOverlay}
            ${selectionBadge}
            <div class="card-image" style="${card.image ? `background-image: url('${card.image}')` : 'display:flex;align-items:center;justify-content:center;font-size:40px;'}">${card.image ? '' : card.icon}</div>
            <div class="card-name">${card.name}</div>
            <div class="elixir-cost">${card.elixir}</div>
            <div class="card-level">Lvl ${level}</div>
            <div class="card-count">${count}/${required}</div>
        `;

        if (isArenaLocked) {
            el.onclick = () => alert(`This card unlocks at Arena ${card.arena}! Current: ${currentArenaNum}`);
        } else {
            el.onclick = () => showCardDetails(card.id);
        }
        container.appendChild(el);
    });
}

function showCardDetails(cardId) {
    const card = getCardById(cardId);
    if (!card) return;

    const level = gameState.cardLevels[cardId] || 1;
    const count = gameState.collection[cardId] || 0;
    const required = level * 5;
    const coinCost = level * 100;

    // Calculate Stats with 10% bonus per level
    const bonus = 1 + (level - 1) * 0.1;
    const hp = Math.floor((card.hp || 0) * bonus);
    const dmg = Math.floor((card.dmg || card.damage || 0) * bonus);

    els.detailsName.textContent = card.name;
    els.detailsRarity.textContent = card.rarity;
    els.detailsRarity.style.color = RARITY[card.rarity].color;
    els.detailsImage.textContent = card.icon;
    els.detailsHP.textContent = hp;
    els.detailsDMG.textContent = dmg;
    els.detailsElixir.textContent = card.elixir;

    // Upgrade Progress
    const pct = Math.min(100, (count / required) * 100);
    els.upgradeProgressFill.style.width = pct + '%';
    els.upgradeProgressText.textContent = `${count}/${required}`;
    els.upgradeCost.textContent = `🪙 ${coinCost}`;

    // Upgrade Button State
    const hasCards = count >= required;
    const hasCoins = gameState.coins >= coinCost;
    els.upgradeBtn.disabled = !hasCards || !hasCoins;

    els.upgradeBtn.onclick = () => upgradeCard(cardId);

    // Deck Toggle Button
    const isInDeck = gameState.deck.includes(cardId);
    els.toggleDeckBtn.textContent = isInDeck ? 'REMOVE FROM DECK' : 'ADD TO DECK';
    els.toggleDeckBtn.style.background = isInDeck ? '#e67e22' : '#3498db';

    els.toggleDeckBtn.onclick = () => {
        if (isInDeck) {
            if (gameState.deck.length <= 4) {
                alert("Must have at least 4 cards!");
                return;
            }
            gameState.deck = gameState.deck.filter(id => id !== cardId);
        } else {
            if (count === 0) return;
            if (gameState.deck.length >= 8) {
                alert("Deck full! (Max 8)");
                return;
            }
            gameState.deck.push(cardId);
        }
        saveGame();
        showCardDetails(cardId); // Refresh modal
        renderCollection();
        renderDeckPreview();
    };

    els.detailsModal.classList.remove('hidden');
}

function upgradeCard(cardId) {
    const level = gameState.cardLevels[cardId] || 1;
    const count = gameState.collection[cardId] || 0;
    const required = level * 5;
    const coinCost = level * 100;

    if (count < required || gameState.coins < coinCost) return;

    // Apply Upgrade
    gameState.collection[cardId] -= required;
    gameState.coins -= coinCost;
    gameState.cardLevels[cardId] = level + 1;

    // XP Reward
    addXP(required * 10);

    saveGame();
    updateUI();
    renderCollection();
    showCardDetails(cardId); // Update modal UI

    // Celebration effect would be nice here
    alert(`${getCardById(cardId).name} upgraded to Level ${level + 1}!`);
}

function renderDeckPreview() {
    const container = document.getElementById('battle-deck');
    if (!container) return;
    container.innerHTML = '';

    let totalElixir = 0;
    // For now, let's just make sure the 'Collection' view serves as the builder.
    // The previous implementation had a "Battle Deck" and "Collection" section in the Deck tab.
    // Let's populate the Battle Deck section too.

    gameState.deck.forEach(cardId => {
        const card = getCardById(cardId);
        if (card) totalElixir += card.elixir;

        const el = document.createElement('div');
        el.className = `card ${card.rarity.toLowerCase()}`;
        el.innerHTML = `
            <div class="card-image">${card.icon}</div>
            <div class="card-name">${card.name}</div>
        `;
        // Click to remove?
        el.onclick = () => {
            if (gameState.deck.length <= 4) return;
            gameState.deck = gameState.deck.filter(id => id !== cardId);
            renderCollection();
            renderDeckPreview();
        };
        container.appendChild(el);
    });

    const avg = gameState.deck.length > 0 ? (totalElixir / gameState.deck.length).toFixed(1) : "0.0";
    const avgEl = document.getElementById('avg-elixir-value');
    if (avgEl) avgEl.textContent = avg;
}

function saveGame() {
    const data = {
        xp: gameState.xp,
        coins: gameState.coins,
        level: gameState.level,
        collection: gameState.collection,
        deck: gameState.deck,
        trophies: gameState.trophies,
        cardLevels: gameState.cardLevels,
        chests: gameState.chests,
        shop: gameState.shop
    };
    localStorage.setItem('clashRaccoonSave', JSON.stringify(data));
}

function loadGame() {
    const saved = localStorage.getItem('clashRaccoonSave');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gameState.xp = data.xp || 0;
            gameState.coins = data.coins || 0;
            gameState.level = data.level || 1;
            gameState.collection = data.collection || {};
            gameState.deck = data.deck || gameState.deck;
            gameState.trophies = data.trophies || 0;
            gameState.cardLevels = data.cardLevels || {};
            gameState.chests = data.chests || gameState.chests;
            gameState.shop = data.shop || [];
        } catch (e) {
            console.error("Save file corrupted", e);
        }
    }

    if (Object.keys(gameState.collection).length === 0) {
        // Give starting cards
        gameState.deck.forEach(id => addCardToCollection(id, 1));
    }
}

function resetGame() {
    if (confirm("Are you sure you want to reset all progress? This cannot be undone!")) {
        localStorage.removeItem('clashRaccoonSave');
        location.reload();
    }
}

// Start
document.addEventListener('DOMContentLoaded', () => {
    init();
});
