// Moves database - a subset of real moves for battle use
const MOVES = {
    // Normal
    tackle: { name: 'Tackle', type: 'normal', power: 40, pp: 35, category: 'physical' },
    slam: { name: 'Slam', type: 'normal', power: 80, pp: 20, category: 'physical' },
    bodyslam: { name: 'Body Slam', type: 'normal', power: 85, pp: 15, category: 'physical' },
    hyperbeam: { name: 'Hyper Beam', type: 'normal', power: 150, pp: 5, category: 'special' },
    // Fire
    ember: { name: 'Ember', type: 'fire', power: 40, pp: 25, category: 'special' },
    flamethrower: { name: 'Flamethrower', type: 'fire', power: 90, pp: 15, category: 'special' },
    fireblast: { name: 'Fire Blast', type: 'fire', power: 110, pp: 5, category: 'special' },
    flareblitz: { name: 'Flare Blitz', type: 'fire', power: 120, pp: 15, category: 'physical' },
    // Water
    watergun: { name: 'Water Gun', type: 'water', power: 40, pp: 25, category: 'special' },
    surf: { name: 'Surf', type: 'water', power: 90, pp: 15, category: 'special' },
    hydropump: { name: 'Hydro Pump', type: 'water', power: 110, pp: 5, category: 'special' },
    // Grass
    vinewhip: { name: 'Vine Whip', type: 'grass', power: 45, pp: 25, category: 'physical' },
    razorleaf: { name: 'Razor Leaf', type: 'grass', power: 55, pp: 25, category: 'physical' },
    solarbeam: { name: 'Solar Beam', type: 'grass', power: 120, pp: 10, category: 'special' },
    // Electric
    thundershock: { name: 'ThunderShock', type: 'electric', power: 40, pp: 30, category: 'special' },
    thunderbolt: { name: 'Thunderbolt', type: 'electric', power: 90, pp: 15, category: 'special' },
    thunder: { name: 'Thunder', type: 'electric', power: 110, pp: 10, category: 'special' },
    // Ice
    icepunch: { name: 'Ice Punch', type: 'ice', power: 75, pp: 15, category: 'physical' },
    blizzard: { name: 'Blizzard', type: 'ice', power: 110, pp: 5, category: 'special' },
    icebeam: { name: 'Ice Beam', type: 'ice', power: 90, pp: 10, category: 'special' },
    // Fighting
    karatechop: { name: 'Karate Chop', type: 'fighting', power: 50, pp: 25, category: 'physical' },
    closecombat: { name: 'Close Combat', type: 'fighting', power: 120, pp: 5, category: 'physical' },
    // Poison
    poisonsting: { name: 'Poison Sting', type: 'poison', power: 15, pp: 35, category: 'physical' },
    sludgebomb: { name: 'Sludge Bomb', type: 'poison', power: 90, pp: 10, category: 'special' },
    // Ground
    earthquake: { name: 'Earthquake', type: 'ground', power: 100, pp: 10, category: 'physical' },
    mudshot: { name: 'Mud Shot', type: 'ground', power: 55, pp: 15, category: 'special' },
    // Flying
    gust: { name: 'Gust', type: 'flying', power: 40, pp: 35, category: 'special' },
    airslash: { name: 'Air Slash', type: 'flying', power: 75, pp: 15, category: 'special' },
    // Psychic
    confusion: { name: 'Confusion', type: 'psychic', power: 50, pp: 25, category: 'special' },
    psychic: { name: 'Psychic', type: 'psychic', power: 90, pp: 10, category: 'special' },
    // Bug
    bugbite: { name: 'Bug Bite', type: 'bug', power: 60, pp: 20, category: 'physical' },
    xscissor: { name: 'X-Scissor', type: 'bug', power: 80, pp: 15, category: 'physical' },
    // Rock
    rockthrow: { name: 'Rock Throw', type: 'rock', power: 50, pp: 15, category: 'physical' },
    rockslide: { name: 'Rock Slide', type: 'rock', power: 75, pp: 10, category: 'physical' },
    stoneEdge: { name: 'Stone Edge', type: 'rock', power: 100, pp: 5, category: 'physical' },
    // Ghost
    shadowball: { name: 'Shadow Ball', type: 'ghost', power: 80, pp: 15, category: 'special' },
    phantomforce: { name: 'Phantom Force', type: 'ghost', power: 90, pp: 10, category: 'physical' },
    // Dragon
    dragonrage: { name: 'Dragon Rage', type: 'dragon', power: 40, pp: 10, category: 'special' },
    dragonpulse: { name: 'Dragon Pulse', type: 'dragon', power: 85, pp: 10, category: 'special' },
    outrage: { name: 'Outrage', type: 'dragon', power: 120, pp: 10, category: 'physical' },
    // Dark
    bite: { name: 'Bite', type: 'dark', power: 60, pp: 25, category: 'physical' },
    darkpulse: { name: 'Dark Pulse', type: 'dark', power: 80, pp: 15, category: 'special' },
    // Steel
    ironhead: { name: 'Iron Head', type: 'steel', power: 80, pp: 15, category: 'physical' },
    flashcannon: { name: 'Flash Cannon', type: 'steel', power: 80, pp: 10, category: 'special' },
    // Fairy
    moonblast: { name: 'Moonblast', type: 'fairy', power: 95, pp: 15, category: 'special' },
    drainingkiss: { name: 'Draining Kiss', type: 'fairy', power: 50, pp: 10, category: 'special' },
};

// Type effectiveness chart
const TYPE_CHART = {
    fire: { grass: 2, ice: 2, bug: 2, steel: 2, water: .5, fire: .5, rock: .5, dragon: .5 },
    water: { fire: 2, ground: 2, rock: 2, water: .5, grass: .5, dragon: .5 },
    grass: { water: 2, ground: 2, rock: 2, fire: .5, grass: .5, poison: .5, flying: .5, bug: .5, dragon: .5, steel: .5 },
    electric: { water: 2, flying: 2, grass: .5, electric: .5, dragon: .5, ground: 0 },
    ice: { grass: 2, ground: 2, flying: 2, dragon: 2, fire: .5, water: .5, ice: .5, steel: .5 },
    fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, poison: .5, bug: .5, psychic: .5, flying: .5, fairy: .5, ghost: 0 },
    poison: { grass: 2, fairy: 2, poison: .5, ground: .5, rock: .5, ghost: .5, steel: 0 },
    ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, grass: .5, bug: .5, flying: 0 },
    flying: { grass: 2, fighting: 2, bug: 2, electric: .5, rock: .5, steel: .5 },
    psychic: { fighting: 2, poison: 2, psychic: .5, steel: .5, dark: 0 },
    bug: { grass: 2, psychic: 2, dark: 2, fire: .5, fighting: .5, flying: .5, ghost: .5, steel: .5, fairy: .5 },
    rock: { fire: 2, ice: 2, flying: 2, bug: 2, fighting: .5, ground: .5, steel: .5 },
    ghost: { psychic: 2, ghost: 2, dark: .5, normal: 0 },
    dragon: { dragon: 2, steel: .5, fairy: 0 },
    dark: { psychic: 2, ghost: 2, fighting: .5, dark: .5, fairy: .5 },
    steel: { ice: 2, rock: 2, fairy: 2, fire: .5, water: .5, electric: .5, steel: .5 },
    fairy: { fighting: 2, dragon: 2, dark: 2, fire: .5, poison: .5, steel: .5 },
    normal: { rock: .5, steel: .5, ghost: 0 },
};

function getEffectiveness(moveType, defType1, defType2) {
    const chart = TYPE_CHART[moveType] || {};
    let mult = (chart[defType1] ?? 1) * (defType2 ? (chart[defType2] ?? 1) : 1);
    return mult;
}

function getMovesByType(type) {
    return Object.entries(MOVES)
        .filter(([, m]) => m.type === type)
        .map(([k, m]) => ({ key: k, ...m }));
}

function getMoveset(pokemon) {
    const pool = [];
    // Always add a STAB move
    const stab1 = getMovesByType(pokemon.type1);
    if (stab1.length) pool.push(...stab1.slice(0, 2));
    if (pokemon.type2) {
        const stab2 = getMovesByType(pokemon.type2);
        if (stab2.length) pool.push(...stab2.slice(0, 2));
    }
    // Add normal tackle as filler
    if (pool.length < 4) pool.push({ key: 'tackle', ...MOVES.tackle });
    if (pool.length < 4) pool.push({ key: 'bodyslam', ...MOVES.bodyslam });
    // Shuffle and pick 4
    const shuffled = pool.sort(() => Math.random() - 0.5);
    const seen = new Set();
    const moves = [];
    for (const m of shuffled) {
        if (!seen.has(m.key)) { seen.add(m.key); moves.push({ ...m, ppLeft: m.pp }); }
        if (moves.length >= 4) break;
    }
    while (moves.length < 4) {
        const m = { key: 'tackle', ...MOVES.tackle, ppLeft: MOVES.tackle.pp };
        moves.push(m);
    }
    return moves;
}
