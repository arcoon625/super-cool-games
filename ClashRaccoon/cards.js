const RARITY = {
    COMMON: { name: 'Common', color: '#bdc3c7', dropRate: 0.6 },
    UNCOMMON: { name: 'Uncommon', color: '#f39c12', dropRate: 0.25 },
    RARE: { name: 'Rare', color: '#e67e22', dropRate: 0.1 },
    EPIC: { name: 'Epic', color: '#9b59b6', dropRate: 0.04 },
    LEGENDARY: { name: 'Legendary', color: '#00d2d3', dropRate: 0.01 }
};

const CARDS = [
    // Common
    { id: 'skeletons', name: 'Skeletons', rarity: 'COMMON', elixir: 1, type: 'Troop', count: 3, hp: 30, dmg: 30, icon: '💀', arena: 1 },
    { id: 'gunner', name: 'Gunner', rarity: 'COMMON', elixir: 3, type: 'Troop', count: 1, hp: 200, dmg: 75, icon: '🔫', arena: 1 },
    { id: 'knight', name: 'Knight', rarity: 'COMMON', elixir: 3, type: 'Troop', count: 1, hp: 600, dmg: 80, icon: '⚔️', arena: 1 },

    // Uncommon 
    { id: 'tank', name: 'Tank', rarity: 'UNCOMMON', elixir: 4, type: 'Troop', count: 1, hp: 800, dmg: 50, icon: '🛡️', arena: 1 },

    // Rare
    { id: 'wizard', name: 'Wizard', rarity: 'RARE', elixir: 5, type: 'Troop', count: 1, hp: 300, dmg: 150, range: 5, icon: '🧙', arena: 5 },
    { id: 'bomb', name: 'Bomb', rarity: 'RARE', elixir: 2, type: 'Spell', damage: 300, icon: '💣', arena: 2 },

    // Epic
    { id: 'pecka', name: 'Pecka', rarity: 'EPIC', elixir: 7, type: 'Troop', count: 1, hp: 2000, dmg: 400, icon: '🤖', arena: 4 },
    { id: 'nuke_missile', name: 'Nuke Missile', rarity: 'EPIC', elixir: 6, type: 'Spell', damage: 1000, icon: '🚀', arena: 10 },
    { id: 'dragon', name: 'Dragon', rarity: 'EPIC', elixir: 4, type: 'Troop', hp: 900, dmg: 140, icon: '🐉', arena: 4 },

    // Legendary
    { id: 'megalodon', name: 'Megalodon', rarity: 'LEGENDARY', elixir: 6, type: 'Troop', hp: 2500, dmg: 300, icon: '🦈', arena: 3 },
    { id: 'sparky', name: 'Sparky', rarity: 'LEGENDARY', elixir: 6, type: 'Troop', hp: 1200, dmg: 1100, icon: '⚡', arena: 10 },
    { id: 'super_raccoon', name: 'Super Raccoon', rarity: 'LEGENDARY', elixir: 9, type: 'Troop', hp: 3000, dmg: 500, icon: '🦝', arena: 10 },

    // New Cards - Series 2
    { id: 'archers', name: 'Archers', rarity: 'COMMON', elixir: 3, type: 'Troop', count: 2, hp: 250, dmg: 70, icon: '🏹', arena: 1 },
    { id: 'minion_horde', name: 'Minion Horde', rarity: 'COMMON', elixir: 5, type: 'Troop', count: 6, hp: 150, dmg: 60, icon: '👿', arena: 4 },

    { id: 'fireball', name: 'Fireball', rarity: 'RARE', elixir: 4, type: 'Spell', damage: 600, icon: '🔥', arena: 1 },
    { id: 'giant_skeleton', name: 'Giant Skeleton', rarity: 'EPIC', elixir: 6, type: 'Troop', hp: 2500, dmg: 150, icon: '💀', arena: 2 },
    { id: 'witch', name: 'Witch', rarity: 'EPIC', elixir: 5, type: 'Troop', hp: 700, dmg: 90, icon: '🧙‍♀️', arena: 2 },
    { id: 'balloon', name: 'Balloon', rarity: 'EPIC', elixir: 5, type: 'Troop', hp: 1600, dmg: 800, icon: '🎈', arena: 2 },

    { id: 'inferno_tower', name: 'Inferno Tower', rarity: 'RARE', elixir: 5, type: 'Structure', hp: 1500, dmg: 50, icon: '🗼', arena: 4 },
    { id: 'baby_dragon', name: 'Baby Dragon', rarity: 'EPIC', elixir: 4, type: 'Troop', hp: 1100, dmg: 160, icon: '🐲', arena: 2 },

    // New Cards - Series 3 (Generated)
    { id: 'electro_wizard', name: 'Electro Wizard', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 590, dmg: 200, icon: '⚡', arena: 10 },
    { id: 'bats', name: 'Bats', rarity: 'COMMON', elixir: 2, type: 'Troop', count: 5, hp: 67, dmg: 67, icon: '🦇', arena: 5 },
    { id: 'golem', name: 'Golem', rarity: 'EPIC', elixir: 8, type: 'Troop', hp: 4256, dmg: 259, icon: '🗿', arena: 3 },

    // New Cards - Series 4
    { id: 'snow_golem', name: 'Snow Golem', rarity: 'RARE', elixir: 2, type: 'Troop', hp: 1000, dmg: 50, icon: '☃️', arena: 6 },
    { id: 'rage', name: 'Rage', rarity: 'EPIC', elixir: 2, type: 'Spell', damage: 0, icon: '💜', arena: 3 },
    { id: 'miner', name: 'Miner', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 1000, dmg: 160, icon: '⛏️', arena: 4 },
    { id: 'minions', name: 'Minions', rarity: 'COMMON', elixir: 3, type: 'Troop', count: 3, hp: 190, dmg: 84, icon: '👿', arena: 2 },
    { id: 'musketeer', name: 'Musketeer', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 598, dmg: 176, icon: '💂‍♀️', arena: 3 },

    // New Cards - Series 5
    {
        id: 'penguin_army',
        name: 'Penguin Army',
        rarity: 'EPIC',
        elixir: 5,
        type: 'Troop',
        count: 4,
        hp: 400,
        dmg: 120,
        icon: '🐧',
        arena: 6,
        spawnNames: ['Skipper', 'Kowalski', 'Rico', 'Private']
    },

    // New Cards - Series 6 (Expansion)
    // Commons
    { id: 'spear_goblins', name: 'Spear Goblins', rarity: 'COMMON', elixir: 2, type: 'Troop', count: 3, hp: 110, dmg: 67, icon: '👺', arena: 1 },
    { id: 'ice_spirit', name: 'Ice Spirit', rarity: 'COMMON', elixir: 1, type: 'Troop', hp: 190, dmg: 91, icon: '❄️', arena: 6 },
    { id: 'zap', name: 'Zap', rarity: 'COMMON', elixir: 2, type: 'Spell', damage: 159, icon: '⚡', arena: 5 },
    { id: 'royal_delivery', name: 'Royal Delivery', rarity: 'COMMON', elixir: 3, type: 'Spell', damage: 362, icon: '📦', arena: 7 },
    { id: 'skeleton_barrel', name: 'Skeleton Barrel', rarity: 'COMMON', elixir: 3, type: 'Troop', hp: 636, dmg: 100, icon: '🎈💀', arena: 6 },
    { id: 'barbarians', name: 'Barbarians', rarity: 'COMMON', elixir: 5, type: 'Troop', count: 5, hp: 555, dmg: 159, icon: '😠', arena: 3 },
    { id: 'fire_spirits', name: 'Fire Spirits', rarity: 'COMMON', elixir: 2, type: 'Troop', count: 3, hp: 91, dmg: 178, icon: '🔥', arena: 1 },
    { id: 'cannon', name: 'Cannon', rarity: 'COMMON', elixir: 3, type: 'Structure', hp: 742, dmg: 127, icon: '💣', arena: 3 },

    // Rares
    { id: 'valkyrie', name: 'Valkyrie', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 1654, dmg: 221, icon: '🪓', arena: 2 },
    { id: 'hog_rider', name: 'Hog Rider', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 1408, dmg: 264, icon: '🐖', arena: 9 },
    { id: 'battle_ram', name: 'Battle Ram', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 756, dmg: 246, icon: '🪵', arena: 3 },
    { id: 'mega_minion', name: 'Mega Minion', rarity: 'RARE', elixir: 3, type: 'Troop', hp: 695, dmg: 258, icon: '👾', arena: 4 },
    { id: 'dart_goblin', name: 'Dart Goblin', rarity: 'RARE', elixir: 3, type: 'Troop', hp: 216, dmg: 108, icon: '👺🎯', arena: 8 },
    { id: 'elixir_golem', name: 'Elixir Golem', rarity: 'RARE', elixir: 3, type: 'Troop', hp: 1260, dmg: 211, icon: '🟣', arena: 3 },
    { id: 'healing_spirit', name: 'Healing Spirit', rarity: 'RARE', elixir: 1, type: 'Troop', hp: 191, dmg: 91, icon: '💛', arena: 7 },
    { id: 'tombstone', name: 'Tombstone', rarity: 'RARE', elixir: 3, type: 'Structure', hp: 422, dmg: 0, icon: '🪦', arena: 2 },
    { id: 'earthquake', name: 'Earthquake', rarity: 'RARE', elixir: 3, type: 'Spell', damage: 68, icon: '🌋', arena: 9 },

    // Epics
    { id: 'prince', name: 'Prince', rarity: 'EPIC', elixir: 5, type: 'Troop', hp: 1615, dmg: 325, icon: '🤴', arena: 7 },
    { id: 'dark_prince', name: 'Dark Prince', rarity: 'EPIC', elixir: 4, type: 'Troop', hp: 1030, dmg: 206, icon: '🛡️🤴', arena: 7 },
    { id: 'freeze', name: 'Freeze', rarity: 'EPIC', elixir: 4, type: 'Spell', damage: 95, icon: '🥶', arena: 6 },
    { id: 'poison', name: 'Poison', rarity: 'EPIC', elixir: 4, type: 'Spell', damage: 75, icon: '☠️', arena: 5 },
    { id: 'executioner', name: 'Executioner', rarity: 'EPIC', elixir: 5, type: 'Troop', hp: 1010, dmg: 280, icon: '🪓👨', arena: 8 },
    { id: 'cannon_cart', name: 'Cannon Cart', rarity: 'EPIC', elixir: 5, type: 'Troop', hp: 1000, dmg: 200, icon: '🛒', arena: 9 },

    // Legendaries
    { id: 'princess', name: 'Princess', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 216, dmg: 140, icon: '👸', arena: 7 },
    { id: 'ice_wizard', name: 'Ice Wizard', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 590, dmg: 75, icon: '❄️🧙', arena: 6 },
    { id: 'lumberjack', name: 'Lumberjack', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 1060, dmg: 200, icon: '🪓🪵', arena: 6 },

    // New Cards - Series 7 (Master Expansion)
    { id: 'electro_giant', name: 'Electro Giant', rarity: 'EPIC', elixir: 7, type: 'Troop', hp: 3200, dmg: 160, icon: '⚡👹', arena: 10 },
    { id: 'night_witch', name: 'Night Witch', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 750, dmg: 260, icon: '🦇🧙‍♀️', arena: 8 },
    { id: 'magic_archer', name: 'Magic Archer', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 440, dmg: 111, icon: '✨🏹', arena: 5 },
    { id: 'mega_knight', name: 'Mega Knight', rarity: 'LEGENDARY', elixir: 7, type: 'Troop', hp: 3300, dmg: 222, icon: '🛡️⚔️', arena: 3 },
    { id: 'ram_rider', name: 'Ram Rider', rarity: 'LEGENDARY', elixir: 5, type: 'Troop', hp: 1461, dmg: 220, icon: '🐐🚵', arena: 9 },
    { id: 'golden_knight', name: 'Golden Knight', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 2000, dmg: 160, icon: '🌟⚔️', arena: 7 },
    { id: 'archer_queen', name: 'Archer Queen', rarity: 'LEGENDARY', elixir: 5, type: 'Troop', hp: 1000, dmg: 225, icon: '👑🏹', arena: 7 },
    { id: 'skeleton_king', name: 'Skeleton King', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 2300, dmg: 180, icon: '👑💀', arena: 2 },
    { id: 'mighty_miner', name: 'Mighty Miner', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 2400, dmg: 100, icon: '💎⛏️', arena: 4 },
    { id: 'monk', name: 'Monk', rarity: 'LEGENDARY', elixir: 5, type: 'Troop', hp: 2150, dmg: 150, icon: '🧘‍♂️', arena: 10 },
    { id: 'phoenix', name: 'Phoenix', rarity: 'LEGENDARY', elixir: 4, type: 'Troop', hp: 800, dmg: 200, icon: '🐦🔥', arena: 6 },
    { id: 'little_prince', name: 'Little Prince', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 700, dmg: 110, icon: '👦👑', arena: 7 },
    { id: 'void', name: 'Void', rarity: 'EPIC', elixir: 3, type: 'Spell', damage: 300, icon: '⚫', arena: 5 },
    { id: 'goblin_demolisher', name: 'Goblin Demolisher', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 1000, dmg: 200, icon: '💣👺', arena: 8 },
    { id: 'suspicious_bush', name: 'Suspicious Bush', rarity: 'RARE', elixir: 2, type: 'Troop', hp: 500, dmg: 100, icon: '🌿', arena: 8 },

    // New Cards - Series 8 (Evolution & Extras)
    { id: 'electro_spirit', name: 'Electro Spirit', rarity: 'COMMON', elixir: 1, type: 'Troop', hp: 190, dmg: 90, icon: '⚡👻', arena: 10 },
    { id: 'firecracker', name: 'Firecracker', rarity: 'COMMON', elixir: 3, type: 'Troop', hp: 250, dmg: 150, icon: '🧨', arena: 10 },
    { id: 'raccoon_minion', name: 'Raccoon Minion', rarity: 'COMMON', elixir: 2, type: 'Troop', hp: 200, dmg: 100, icon: '🦝🪽', arena: 1 },
    { id: 'battle_healer', name: 'Battle Healer', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 1500, dmg: 100, icon: '👼', arena: 7 },
    { id: 'elixir_collector', name: 'Elixir Collector', rarity: 'RARE', elixir: 6, type: 'Structure', hp: 1000, dmg: 0, icon: '🧪', arena: 8 },
    { id: 'trash_raccoon', name: 'Trash Raccoon', rarity: 'RARE', elixir: 4, type: 'Troop', hp: 1800, dmg: 80, icon: '🗑️🦝', arena: 1 },
    { id: 'clone', name: 'Clone', rarity: 'EPIC', elixir: 3, type: 'Spell', damage: 0, icon: '👥', arena: 8 },
    { id: 'tornado', name: 'Tornado', rarity: 'EPIC', elixir: 3, type: 'Spell', damage: 100, icon: '🌪️', arena: 5 },
    { id: 'mirror', name: 'Mirror', rarity: 'EPIC', elixir: 0, type: 'Spell', damage: 0, icon: '🪞', arena: 10 },
    { id: 'the_log', name: 'The Log', rarity: 'LEGENDARY', elixir: 2, type: 'Spell', damage: 240, icon: '🪵', arena: 6 },
    { id: 'bandit', name: 'Bandit', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 750, dmg: 160, icon: '🎭', arena: 9 },
    { id: 'royal_ghost', name: 'Royal Ghost', rarity: 'LEGENDARY', elixir: 3, type: 'Troop', hp: 1000, dmg: 216, icon: '👻', arena: 7 }
];

function getCardById(id) {
    return CARDS.find(c => c.id === id);
}
