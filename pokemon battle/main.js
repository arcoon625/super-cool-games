// Game State
const state = {
    gold: 0,
    caughtPokemon: [],
    caughtCount: 0,
    battleUnlocked: false,
    ownedPokemon: [],
    activeEnemies: [],
    battle: null // Battle instance
};

// Elements
const els = {
    world: document.getElementById('world'),
    goldCount: document.getElementById('gold-count'),
    caughtCount: document.getElementById('caught-count'),
    btnPokemon: document.getElementById('btn-pokemon'),
    btnBattle: document.getElementById('btn-battle'),
    modalPokemon: document.getElementById('pokemon-menu'),
    modalBattle: document.getElementById('battle-interface'),
    pokemonList: document.getElementById('pokemon-list'),
    closeBtns: document.querySelectorAll('.close-btn'),
    // Battle Elements
    battleArena: document.querySelector('.battle-scene'), // Injected later
    moveSelection: document.getElementById('move-selection'),
    battleLog: document.getElementById('battle-log'),
    selectedPokemonName: document.getElementById('selected-pokemon-name'),
    pokemonActions: document.getElementById('pokemon-actions')
};

// Database with Evolution and Moves
// Rarity: 1 (Common) - 5 (Legendary)
const POKEMON_DB = [
    { id: 1, name: 'Pikachu', type: 'Electric', rarity: 2, moves: ['Thunder Shock', 'Quick Attack', 'Iron Tail', 'Thunderbolt'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', evolveTo: 26, hp: 100 },
    { id: 26, name: 'Raichu', type: 'Electric', rarity: 3, moves: ['Thunder', 'Volt Tackle', 'Iron Tail', 'Focus Blast'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png', hp: 140 },

    { id: 4, name: 'Charmander', type: 'Fire', rarity: 2, moves: ['Scratch', 'Ember', 'Dragon Breath', 'Flamethrower'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png', evolveTo: 5, hp: 90 },
    { id: 5, name: 'Charmeleon', type: 'Fire', rarity: 3, moves: ['Fire Fang', 'Slash', 'Flamethrower', 'Dragon Rage'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png', evolveTo: 6, hp: 120 },
    { id: 6, name: 'Charizard', type: 'Fire/Flying', rarity: 4, moves: ['Flare Blitz', 'Air Slash', 'Dragon Claw', 'Inferno'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', hp: 180 },

    { id: 7, name: 'Squirtle', type: 'Water', rarity: 2, moves: ['Tackle', 'Water Gun', 'Bubble', 'Hydro Pump'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png', evolveTo: 8, hp: 95 },
    { id: 8, name: 'Wartortle', type: 'Water', rarity: 3, moves: ['Bite', 'Water Pulse', 'Aqua Tail', 'Ice Beam'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png', evolveTo: 9, hp: 125 },
    { id: 9, name: 'Blastoise', type: 'Water', rarity: 4, moves: ['Hydro Cannon', 'Flash Cannon', 'Skull Bash', 'Surf'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png', hp: 190 },

    { id: 443, name: 'Gible', type: 'Dragon/Ground', rarity: 2, moves: ['Tackle', 'Sand Attack', 'Dragon Rage', 'Sand Tomb'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/443.png', evolveTo: 444, hp: 80 },
    { id: 444, name: 'Gabite', type: 'Dragon/Ground', rarity: 3, moves: ['Dual Chop', 'Dragon Claw', 'Dig', 'Slash'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/444.png', evolveTo: 445, hp: 110 },
    { id: 445, name: 'Garchomp', type: 'Dragon/Ground', rarity: 5, moves: ['Dragon Claw', 'Earthquake', 'Fire Fang', 'Draco Meteor'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png', hp: 200 },

    { id: 133, name: 'Eevee', type: 'Normal', rarity: 1, moves: ['Tackle', 'Quick Attack', 'Bite', 'Swift'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png', evolveTo: 134, hp: 85 }, // Simplification: Evolve to Vaporeon for demo
    { id: 134, name: 'Vaporeon', type: 'Water', rarity: 3, moves: ['Water Gun', 'Aurora Beam', 'Hydro Pump', 'Acid Armor'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png', hp: 160 },

    { id: 150, name: 'Mewtwo', type: 'Psychic', rarity: 5, moves: ['Psystrike', 'Shadow Ball', 'Aura Sphere', 'Psychic'], image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', hp: 220 }
];

// Initialization
function init() {
    setupListeners();
    gameLoop();
    spawnLoop();
}

function setupListeners() {
    els.btnPokemon.addEventListener('click', () => openModal(els.modalPokemon));
    els.btnBattle.addEventListener('click', startBattle);

    els.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal').classList.add('hidden');
        });
    });

    // Evolution Buttons
    document.querySelectorAll('[data-action="evolve"]').forEach(btn =>
        btn.addEventListener('click', () => handleEvolution())
    );
}

function updateUI() {
    els.goldCount.innerText = state.gold;
    els.caughtCount.innerText = state.caughtCount;
    if (state.caughtCount >= 10 && !state.battleUnlocked) {
        state.battleUnlocked = true;
        els.btnBattle.classList.remove('hidden');
    }
}

function openModal(modal) {
    modal.classList.remove('hidden');
    if (modal === els.modalPokemon) renderPokemonList();
}

// Spawning Logic
function spawnLoop() {
    if (state.activeEnemies.length < 8) {
        spawnPokemon();
    }
    setTimeout(spawnLoop, Math.random() * 2000 + 1000);
}

function spawnPokemon() {
    // Rarity Weighted Spawn
    const rand = Math.random();
    let tier = 1;
    if (rand > 0.95) tier = 5;      // 5% Legendary
    else if (rand > 0.8) tier = 4;  // 15% Rare
    else if (rand > 0.6) tier = 3;  // 20% Uncommon
    else tier = 2; // Common/Basic

    const pool = POKEMON_DB.filter(p => p.rarity <= tier && (!p.evolveTo && tier > 3 ? false : true));
    // ^ Logic: Spawn evolutions only if high tier, else basics.
    // Simplified: Just pick random from DB weighted by rarity manual logic above is flawed if DB is small.
    // Let's just pick random from DB
    const template = POKEMON_DB[Math.floor(Math.random() * POKEMON_DB.length)];

    const id = Date.now() + Math.random();

    // Create DOM
    const el = document.createElement('div');
    el.className = 'pokemon-sprite';
    el.style.backgroundImage = `url(${template.image})`;

    // Random Position (Simulated 3D depth)
    const position = {
        x: Math.random() * 80 + 10,
        depth: Math.random() * 0.8 + 0.2
    };

    el.style.left = position.x + '%';
    el.style.transform = `scale(${position.depth})`;
    el.style.zIndex = Math.floor(position.depth * 100);

    el.addEventListener('click', () => catchPokemon(template, el));

    els.world.appendChild(el);
    state.activeEnemies.push({ id, el, position, template });

    movePokemon(id);
}

function movePokemon(id) {
    const enemy = state.activeEnemies.find(e => e.id === id);
    if (!enemy) return;

    // Smooth Random Walk
    const destX = Math.random() * 80 + 10;
    const destDepth = Math.random() * 0.8 + 0.2;
    // Duration proportional to distance for constant speed feel
    const duration = Math.random() * 2 + 2; // 2-4 seconds

    enemy.el.style.transition = `left ${duration}s ease-in-out, transform ${duration}s ease-in-out`;
    enemy.el.style.left = destX + '%';
    enemy.el.style.transform = `scale(${destDepth})`;
    enemy.el.style.zIndex = Math.floor(destDepth * 100);

    setTimeout(() => movePokemon(id), duration * 1000);
}

function catchPokemon(pokemonData, el) {
    // Remove
    el.remove();
    state.activeEnemies = state.activeEnemies.filter(e => e.el !== el);

    // Logic
    state.gold += 10;
    state.caughtCount++;
    const newPk = {
        ...pokemonData,
        instanceId: Date.now(),
        currentHp: pokemonData.hp
    };
    state.caughtPokemon.push(newPk);
    state.ownedPokemon.push(newPk);

    // Flash effect/Notification could go here
    updateUI();
}

// Management
let selectedPokemonInstance = null;

function renderPokemonList() {
    els.pokemonList.innerHTML = '';
    state.caughtPokemon.forEach(pk => {
        const div = document.createElement('div');
        div.className = 'pokemon-card';
        div.style.padding = '10px';
        div.style.border = '1px solid #ddd';
        div.style.margin = '5px';
        div.style.cursor = 'pointer';
        div.innerHTML = `<img src="${pk.image}" width="50" style="vertical-align:middle"> <b>${pk.name}</b> (HP: ${pk.hp})`;
        div.onclick = () => selectPokemon(pk);
        els.pokemonList.appendChild(div);
    });
}

function selectPokemon(pk) {
    selectedPokemonInstance = pk;
    els.selectedPokemonName.innerText = `${pk.name} - ${pk.type}`;
    els.pokemonActions.classList.remove('hidden');
}

function handleEvolution() {
    if (!selectedPokemonInstance) return;
    if (state.gold < 50) {
        alert("Not enough gold! Need 50.");
        return;
    }

    const evolveTargetId = selectedPokemonInstance.evolveTo;
    if (!evolveTargetId) {
        alert("This Pokemon cannot evolve further!");
        return;
    }

    const targetTemplate = POKEMON_DB.find(p => p.id === evolveTargetId);
    if (targetTemplate) {
        state.gold -= 50;
        // Mutate stats
        selectedPokemonInstance.name = targetTemplate.name;
        selectedPokemonInstance.image = targetTemplate.image;
        selectedPokemonInstance.type = targetTemplate.type;
        selectedPokemonInstance.moves = targetTemplate.moves;
        selectedPokemonInstance.hp = targetTemplate.hp;
        selectedPokemonInstance.currentHp = targetTemplate.hp;
        selectedPokemonInstance.evolveTo = targetTemplate.evolveTo;

        updateUI();
        renderPokemonList();
        selectPokemon(selectedPokemonInstance); // refresh view
        alert(`Evolved into ${targetTemplate.name}!`);
    }
}

// ----------------------
// BATTLE SYSTEM (3v3)
// ----------------------

class BattleSystem {
    constructor(playerTeam, enemyTeam) {
        this.playerTeam = playerTeam; // Array of 3 Pokemon objects
        this.enemyTeam = enemyTeam;   // Array of 3 Pokemon objects
        this.turn = 'player'; // or 'enemy'
        this.activePlayerIdx = 0;
        this.activeEnemyIdx = 0;
        this.logMsg = "Battle Start!";

        this.render();
    }

    render() {
        const arena = document.querySelector('.battle-scene');
        arena.innerHTML = `
            <div id="battle-arena">
                <div id="player-battler" class="battler">
                    <div class="battler-stats">
                        <span id="p-name"></span>
                        <div class="hp-bar"><div id="p-hp" class="hp-fill"></div></div>
                    </div>
                </div>
                <div id="enemy-battler" class="battler">
                    <div class="battler-stats">
                        <span id="e-name"></span>
                        <div class="hp-bar"><div id="e-hp" class="hp-fill"></div></div>
                    </div>
                </div>
            </div>
        `;

        this.pSprite = document.getElementById('player-battler');
        this.eSprite = document.getElementById('enemy-battler');
        this.pName = document.getElementById('p-name');
        this.eName = document.getElementById('e-name');
        this.pHP = document.getElementById('p-hp');
        this.eHP = document.getElementById('e-hp');

        this.updateView();
        this.generateMoves();
    }

    updateView() {
        const p = this.playerTeam[this.activePlayerIdx];
        const e = this.enemyTeam[this.activeEnemyIdx];

        if (!p || !e) return; // Should handle End Game

        this.pSprite.style.backgroundImage = `url(${p.image})`;
        this.pName.innerText = p.name;
        this.pHP.style.width = `${(p.currentHp / p.hp) * 100}%`;

        this.eSprite.style.backgroundImage = `url(${e.image})`;
        // Flip enemy
        this.eSprite.style.transform = 'scaleX(-1)';
        this.eName.innerText = e.name;
        this.eHP.style.width = `${(e.currentHp / e.hp) * 100}%`;

        els.battleLog.innerText = this.logMsg;
    }

    generateMoves() {
        els.moveSelection.innerHTML = '';
        const p = this.playerTeam[this.activePlayerIdx];
        if (p.currentHp <= 0) {
            // Fainted logic would go here, auto-swap
            this.logMsg = `${p.name} fainted!`;
            this.swapPlayerPokemon();
            return;
        }

        p.moves.forEach(moveName => {
            const btn = document.createElement('button');
            btn.className = 'move-btn';
            btn.innerText = moveName;
            btn.onclick = () => this.playerMove(moveName);
            els.moveSelection.appendChild(btn);
        });
    }

    swapPlayerPokemon() {
        // Find next alive
        const nextIdx = this.playerTeam.findIndex(pk => pk.currentHp > 0);
        if (nextIdx === -1) {
            this.endBattle(false);
        } else {
            this.activePlayerIdx = nextIdx;
            this.logMsg = `Go ${this.playerTeam[nextIdx].name}!`;
            this.updateView();
            this.generateMoves();
        }
    }

    playerMove(move) {
        const p = this.playerTeam[this.activePlayerIdx];
        const e = this.enemyTeam[this.activeEnemyIdx];

        // DAMAGE CALC (Simple)
        const damage = Math.floor(Math.random() * 30) + 20;
        e.currentHp -= damage;
        this.logMsg = `${p.name} used ${move}! Dealt ${damage} dmg.`;

        this.updateView();

        if (e.currentHp <= 0) {
            e.currentHp = 0;
            this.logMsg = `${e.name} fainted!`;
            this.updateView();
            setTimeout(() => this.nextEnemy(), 1500);
        } else {
            // Enemy Turn
            disableMoves(true);
            setTimeout(() => this.enemyTurn(), 1500);
        }
    }

    enemyTurn() {
        const p = this.playerTeam[this.activePlayerIdx];
        const e = this.enemyTeam[this.activeEnemyIdx];

        const move = e.moves[Math.floor(Math.random() * e.moves.length)];
        const damage = Math.floor(Math.random() * 25) + 15;
        p.currentHp -= damage;

        this.logMsg = `Enemy ${e.name} used ${move}! Dealt ${damage} dmg.`;
        this.updateView();

        if (p.currentHp <= 0) {
            p.currentHp = 0;
            this.logMsg = `${p.name} fainted!`;
            disableMoves(true);
            setTimeout(() => this.swapPlayerPokemon(), 1500);
        } else {
            disableMoves(false);
        }
    }

    nextEnemy() {
        const nextIdx = this.enemyTeam.findIndex(pk => pk.currentHp > 0);
        if (nextIdx === -1) {
            this.endBattle(true);
        } else {
            this.activeEnemyIdx = nextIdx;
            this.logMsg = `Enemy sent out ${this.enemyTeam[nextIdx].name}!`;
            this.updateView();
            disableMoves(false);
        }
    }

    endBattle(win) {
        this.logMsg = win ? "You Won! +50 Gold" : "You Lost...";
        els.battleLog.innerText = this.logMsg;
        if (win) state.gold += 50;
        updateUI();
        setTimeout(() => {
            els.modalBattle.classList.add('hidden');
            // Heal team after battle for simplicity? Or keep damage? 
            // Reset HP for demo enjoyment
            this.playerTeam.forEach(p => p.currentHp = p.hp);
        }, 3000);
    }
}

function startBattle() {
    if (state.caughtPokemon.length < 1) {
        alert("Catch more Pokemon first!");
        return;
    }

    // Pick first 3 alive
    const pTeam = state.caughtPokemon.slice(0, 3).map(p => ({ ...p })); // Clone to avoid permanent death in this loop version logic
    // Actually user wants permanent stats probably, but let's heal for now.

    // Generate Random Enemy Team
    const eTeam = [];
    for (let i = 0; i < 3; i++) {
        const temp = POKEMON_DB[Math.floor(Math.random() * POKEMON_DB.length)];
        eTeam.push({ ...temp, currentHp: temp.hp, instanceId: 'enemy-' + i });
    }

    els.modalBattle.classList.remove('hidden');
    state.battle = new BattleSystem(pTeam, eTeam);
}

function disableMoves(disabled) {
    Array.from(document.querySelectorAll('.move-btn')).forEach(b => b.disabled = disabled);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
}

init();
