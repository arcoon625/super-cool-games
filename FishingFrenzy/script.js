

const gameState = {
    money: 0,
    inventory: [],
    currentHookIndex: 0,
    isFishing: false,
    currentBait: 'Worms',
    baitInventory: {
        'Worms': 5, // giving 5 free starter worms
        'Shrimp': 0,
        'Magic Lure': 0
    }
};

const baits = [
    { name: 'Worms', price: 1, description: 'Basic bait. Standard luck.', multiplier: 1 },
    { name: 'Shrimp', price: 10, description: 'Better luck for Rare fish.', multiplier: 2 }, // price adjusted to $10/ea ($50/pack)
    { name: 'Magic Lure', price: 40, description: 'Amazing luck for Epic fish.', multiplier: 5 } // price $40/ea ($200/pack)
];

const fishTypes = [
    { name: 'Sardine', value: 5, rarity: 'Common', minHook: 0 },
    { name: 'Trout', value: 10, rarity: 'Common', minHook: 0 },
    { name: 'Salmon', value: 25, rarity: 'Uncommon', minHook: 1 },
    { name: 'Bass', value: 40, rarity: 'Uncommon', minHook: 1 },
    { name: 'Tuna', value: 120, rarity: 'Rare', minHook: 2 },
    { name: 'Swordfish', value: 200, rarity: 'Rare', minHook: 2 },
    { name: 'Shark', value: 600, rarity: 'Epic', minHook: 3 },
    { name: 'Whale', value: 1000, rarity: 'Epic', minHook: 3 },
    { name: 'Kraken', value: 6000, rarity: 'Legendary', minHook: 4 },
    { name: 'Leviathan', value: 10000, rarity: 'Legendary', minHook: 4 },
    { name: 'Golden Megalodon', value: 1000000, rarity: 'Mythic', minHook: 5 }
];

const hooks = [
    { name: 'Basic Hook', price: 0, level: 0 },
    { name: 'Bronze Hook', price: 100, level: 1 },
    { name: 'Silver Hook', price: 500, level: 2 },
    { name: 'Gold Hook', price: 2500, level: 3 },
    { name: 'Diamond Hook', price: 10000, level: 4 },
    { name: 'Netherite Hook', price: 50000, level: 5 }
];

// DOM Elements
const moneyDisplay = document.getElementById('money-display');
const hookDisplay = document.getElementById('hook-display');
const castBtn = document.getElementById('cast-btn');
const messageLog = document.getElementById('message-log');
const floatIndicator = document.getElementById('float-indicator');
const inventoryList = document.getElementById('inventory-list');
const sellAllBtn = document.getElementById('sell-all-btn');
const shopItems = document.getElementById('shop-items');

// Init
function init() {
    updateUI();
    renderShop();

    castBtn.addEventListener('click', castLine);
    sellAllBtn.addEventListener('click', sellAllFish);

    // Bait switcher
    const baitDisplay = document.getElementById('bait-display');
    if (baitDisplay) {
        baitDisplay.addEventListener('click', selectBait);
    }
}

function updateUI() {
    moneyDisplay.textContent = `$${gameState.money}`;
    hookDisplay.textContent = hooks[gameState.currentHookIndex].name;

    // Bait Display
    const baitDisplay = document.getElementById('bait-display');
    if (baitDisplay) {
        const count = gameState.baitInventory[gameState.currentBait];
        baitDisplay.innerHTML = `${gameState.currentBait} (x${count}) <small style="font-size:0.8em; cursor:pointer; color:var(--primary-color)">(Click to Switch)</small>`;
    }

    // Update inventory
    inventoryList.innerHTML = '';
    if (gameState.inventory.length === 0) {
        inventoryList.innerHTML = '<li class="empty-msg">No fish caught yet.</li>';
    } else {
        gameState.inventory.forEach(fish => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${fish.name}</span> <span style="color:var(--success-color)">$${fish.value}</span>`;
            inventoryList.appendChild(li);
        });
    }

    // Update shop button states
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach((btn, index) => {
        // Correct index mapping relies on renderShop order
        const hookIndex = index + 1; // since we don't buy the basic hook
        if (hookIndex < hooks.length) {
            btn.disabled = gameState.money < hooks[hookIndex].price || gameState.currentHookIndex >= hookIndex;
            if (gameState.currentHookIndex >= hookIndex) {
                btn.textContent = "Owned";
            }
        }
    });
}

function log(msg) {
    const div = document.createElement('div');
    div.textContent = `> ${msg}`;
    messageLog.prepend(div);
    // Keep log clean
    if (messageLog.children.length > 20) {
        messageLog.removeChild(messageLog.lastChild);
    }
}

function castLine() {

    gameState.isFishing = true;

    // Check for bait
    if (gameState.baitInventory[gameState.currentBait] <= 0 && gameState.currentBait !== 'Worms') {
        const confirmSwitch = confirm(`You are out of ${gameState.currentBait}! Switch to Worms?`);
        if (confirmSwitch) {
            gameState.currentBait = 'Worms';
            updateUI();
        } else {
            console.log("Cancelled fishing due to lack of bait");
            gameState.isFishing = false;
            return;
        }
    }

    // Deduct bait (Worms are infinite for now? Or cost $1? Plan said Cost $1/ea. Let's make Worms infinite/free basic bait to prevent softlock, OR just cheap. 
    // The plan said "Worms (Cost: $1/ea)". Let's stick to plan but give 5 starter worms.
    // actually let's make "Worms" cheap but necessary.

    if (gameState.baitInventory[gameState.currentBait] > 0) {
        gameState.baitInventory[gameState.currentBait]--;
    } else {
        // Fallback or prevent cast
        if (gameState.currentBait === 'Worms') {
            // If out of worms, maybe can't fish? Or catch trash?
            // Let's allow fishing without bait but with terrible odds? 
            // Or just auto-buy worms if have money?
            // Simplest: prevent cast if 0 bait.
            log("You need bait to fish! Buy some in the shop.");
            gameState.isFishing = false;
            return;
        }
    }

    updateUI();

    castBtn.disabled = true;
    castBtn.textContent = "Fishing...";
    floatIndicator.classList.remove('hidden');

    log(`You cast your line with ${gameState.currentBait}...`);

    // Random wait time between 2 and 5 seconds
    const waitTime = Math.random() * 3000 + 2000;

    setTimeout(() => {
        catchFish();
    }, waitTime);
}

function catchFish() {
    gameState.isFishing = false;
    castBtn.disabled = false;
    castBtn.textContent = "Cast Line";
    floatIndicator.classList.add('hidden');

    // Determine what fish can be caught
    const currentHookLevel = hooks[gameState.currentHookIndex].level;
    const availableFish = fishTypes.filter(f => f.minHook === currentHookLevel);

    let caughtFish;

    // Apply Bait Multipliers
    // Worms: 1x
    // Shrimp: 2x for Rare+
    // Magic Lure: 5x for Epic+
    const currentBait = baits.find(b => b.name === gameState.currentBait);
    const multiplier = currentBait ? currentBait.multiplier : 1;
    // logic: multiplier applies to weights of target rarities

    const weightedPool = [];
    availableFish.forEach(fish => {
        let weight = 100; // Common base
        if (fish.rarity === 'Uncommon') weight = 50;
        if (fish.rarity === 'Rare') weight = 20;
        if (fish.rarity === 'Epic') weight = 5;
        if (fish.rarity === 'Legendary') weight = 1;
        if (fish.rarity === 'Mythic') weight = 0.1;

        // Apply multipliers
        if (gameState.currentBait === 'Shrimp') {
            if (['Rare', 'Epic', 'Legendary', 'Mythic'].includes(fish.rarity)) {
                weight *= 2;
            }
        } else if (gameState.currentBait === 'Magic Lure') {
            if (['Epic', 'Legendary', 'Mythic'].includes(fish.rarity)) {
                weight *= 5;
            }
        }

        fish._tempWeight = weight;
    });

    const totalWeight = availableFish.reduce((sum, f) => sum + f._tempWeight, 0);
    let randomWeight = Math.random() * totalWeight;

    for (const fish of availableFish) {
        if (randomWeight < fish._tempWeight) {
            caughtFish = fish;
            break;
        }
        randomWeight -= fish._tempWeight;
    }

    if (caughtFish) {
        gameState.inventory.push(caughtFish);
        log(`You caught a ${caughtFish.name} (${caughtFish.rarity})!`);

        if (caughtFish.name === 'Golden Megalodon') {
            alert("YOU CAUGHT THE GOLDEN MEGALODON! YOU WIN!");
            log("*** YOU WON THE GAME! ***");
        }
    } else {
        log("Everything got away...");
    }

    updateUI();
}

function sellAllFish() {
    if (gameState.inventory.length === 0) {
        log("No fish to sell.");
        return;
    }

    let totalValue = 0;
    gameState.inventory.forEach(fish => {
        totalValue += fish.value;
    });

    gameState.money += totalValue;
    const count = gameState.inventory.length;
    gameState.inventory = [];

    log(`Sold ${count} fish for $${totalValue}.`);
    updateUI();
}

function renderShop() {
    shopItems.innerHTML = '';

    const hooksSection = document.createElement('div');
    hooksSection.innerHTML = '<h3>Hooks</h3>';
    shopItems.appendChild(hooksSection);

    // Hooks
    for (let i = 1; i < hooks.length; i++) {
        const hook = hooks[i];
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <h4>${hook.name}</h4>
            <p>Cost: $${hook.price}</p>
            <button class="buy-hook-btn" onclick="buyHook(${i})">Buy</button>
        `;
        shopItems.appendChild(div);
    }

    const baitSection = document.createElement('div');
    baitSection.innerHTML = '<h3 style="margin-top:20px; border-top:1px solid #334155; padding-top:10px;">Bait</h3>';
    shopItems.appendChild(baitSection);

    // Bait
    baits.forEach(bait => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        // Selling in packs of 5 to make it less clicky
        const packPrice = bait.price * 5;
        div.innerHTML = `
            <h4>${bait.name} (x5)</h4>
            <p>Cost: $${packPrice}</p>
            <p class="desc">${bait.description}</p>
            <button class="buy-bait-btn" onclick="buyBait('${bait.name}')">Buy Pack</button>
        `;
        shopItems.appendChild(div);
    });
}

window.buyHook = function (index) {
    const hook = hooks[index];
    if (gameState.money >= hook.price) {
        if (gameState.currentHookIndex >= index) {
            log("You already own this or a better hook.");
            return;
        }

        gameState.money -= hook.price;
        gameState.currentHookIndex = index;
        log(`Bought ${hook.name}!`);
        updateUI();
    } else {
        log("Not enough money!");
    }
};

window.buyBait = function (baitName) {
    const bait = baits.find(b => b.name === baitName);
    const cost = bait.price * 5;

    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.baitInventory[baitName] += 5;
        log(`Bought 5 ${baitName}s!`);
        updateUI();
    } else {
        log("Not enough money for bait!");
    }
};

window.selectBait = function () {
    // Cycle through available baits? Or dropdown?
    // Let's just cycle for simplicity or make a small selector UI
    // Simple cycle
    const baitNames = baits.map(b => b.name);
    let idx = baitNames.indexOf(gameState.currentBait);
    idx = (idx + 1) % baitNames.length;
    gameState.currentBait = baitNames[idx];
    updateUI();
}

init();
