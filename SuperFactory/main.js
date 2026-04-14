
// State
let state = {
    money: 0,
    incomePerSecond: 0,
    items: [],
    baseCost: 10,
    costMultiplier: 1.15
};

// Configuration
const RARITIES = [
    { id: 'common', name: 'Common', chance: 0.50, multiplier: 1, color: 'var(--common)' },
    { id: 'uncommon', name: 'Uncommon', chance: 0.30, multiplier: 3, color: 'var(--uncommon)' },
    { id: 'rare', name: 'Rare', chance: 0.15, multiplier: 8, color: 'var(--rare)' },
    { id: 'epic', name: 'Epic', chance: 0.04, multiplier: 20, color: 'var(--epic)' },
    { id: 'legendary', name: 'Legendary', chance: 0.009, multiplier: 100, color: 'var(--legendary)' },
    { id: 'mythic', name: 'Mythic', chance: 0.001, multiplier: 500, color: 'var(--mythic)' },
    // Secret is handled separately or as a very rare fail-safe
    { id: 'secret', name: 'SECRET', chance: 0.00001, multiplier: 10000, color: 'var(--secret)' } 
];

// Name Parts
const PREFIXES = [
    "Croco", "Air", "Octo", "Cyber", "Rocket", "Laser", "Nano", "Mega", 
    "Giga", "Spider", "Turbo", "Aqua", "Pyro", "Space", "Time", "Void",
    "Iron", "Golden", "Shadow", "Thunder", "Ghost", "Plasma", "Mecha",
    "Dino", "Shark", "Eagle", "Lion", "Tiger", "Bear", "Wolf"
];

const SUFFIXES = [
    "dile", "plane", "pus", "bot", "tron", "rex", "naut", "cycle", "tank",
    "copter", "jet", "blaster", "saur", "wing", "claw", "fin", "fang",
    "drill", "hammer", "shield", "sword", "star", "moon", "sun", "core",
    "beast", "wraith", "soul", "mind", "heart"
];

const ICONS = [
    "🐊", "✈️", "🐙", "🤖", "🚀", "🔫", "🧬", "💪", 
    "🦖", "🕷️", "🏎️", "💧", "🔥", "🌌", "⏳", "⚫",
    "🛡️", "👑", "🌑", "⚡", "👻", "⚛️", "🏗️",
    "🦎", "🦈", "🦅", "🦁", "🐯", "🐻", "🐺"
];


// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const incomeDisplay = document.getElementById('income-display');
const gameGrid = document.getElementById('game-grid');
const buyBtn = document.getElementById('buy-btn');
const costDisplay = document.getElementById('cost-display');

// Helpers
function formatMoney(amount) {
    if (amount >= 1e9) return '$' + (amount / 1e9).toFixed(2) + 'B';
    if (amount >= 1e6) return '$' + (amount / 1e6).toFixed(2) + 'M';
    if (amount >= 1e3) return '$' + (amount / 1e3).toFixed(2) + 'K';
    return '$' + Math.floor(amount);
}

function getNextCost() {
    return Math.floor(state.baseCost * Math.pow(state.costMultiplier, state.items.length));
}

function getRandomRarity() {
    const rand = Math.random();
    let cumulativeChance = 0;
    
    // Iterate normally for most, but ensure we catch floating point weirdness
    for (let i = 0; i < RARITIES.length; i++) {
        cumulativeChance += RARITIES[i].chance;
        if (rand < cumulativeChance) {
            return RARITIES[i];
        }
    }
    return RARITIES[0]; // Fallback to common
}

function generateHybridName() {
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    
    // 30% chance to hyphenate, otherwise blend
    if (Math.random() < 0.3) {
        return `${prefix}-${suffix}`;
    } else {
        // Simple blend: just concat
        // Could do more complex string manipulation here later if requested
        // Like removing last char of prefix if it matches first of suffix
        let name = prefix + suffix;
        return name;
    }
}

function generateIcon() {
    return ICONS[Math.floor(Math.random() * ICONS.length)];
}

// Core Logic
function createHybrid() {
    const cost = getNextCost();
    if (state.money < cost) return;

    state.money -= cost;
    
    const rarity = getRandomRarity();
    const name = generateHybridName();
    const icon = generateIcon();
    
    const hybrid = {
        name: name,
        rarity: rarity,
        icon: icon,
        income: 1 * rarity.multiplier // Base income is $1 * multiplier
    };
    
    state.items.push(hybrid);
    state.incomePerSecond += hybrid.income;
    
    renderHybrid(hybrid);
    updateUI();
}

function renderHybrid(hybrid) {
    const el = document.createElement('div');
    el.className = `hybrid-card ${hybrid.rarity.id}`;
    
    el.innerHTML = `
        <div class="hybrid-rarity-pill" style="color: ${hybrid.rarity.color}">${hybrid.rarity.name}</div>
        <div class="hybrid-icon">${hybrid.icon}</div>
        <div class="hybrid-name">${hybrid.name}</div>
        <div class="hybrid-income">+$${hybrid.income}/s</div>
    `;
    
    gameGrid.prepend(el); // Add new ones to top/start
}

function updateUI() {
    moneyDisplay.innerText = formatMoney(state.money);
    incomeDisplay.innerText = '+' + formatMoney(state.incomePerSecond) + '/s';
    
    const nextCost = getNextCost();
    costDisplay.innerText = formatMoney(nextCost);
    
    // Enable/Disable button
    if (state.money >= nextCost) {
        buyBtn.style.opacity = '1';
        buyBtn.style.cursor = 'pointer';
    } else {
        buyBtn.style.opacity = '0.5';
        buyBtn.style.cursor = 'not-allowed';
    }
}

// Game Loop
setInterval(() => {
    state.money += state.incomePerSecond / 10; // Update 10 times a second for smoothness
    updateUI();
}, 100);


// Initialization
buyBtn.addEventListener('click', createHybrid);

// Give starting money for testing/gameplay flow (or just let them click 0 cost?)
// Let's set initial cost to 10 and give them 15 to start.
state.money = 15;
updateUI();

console.log("Hybrid Tycoon initialized!");
