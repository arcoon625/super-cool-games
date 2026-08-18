const $ = (id) => document.getElementById(id);
const screens = ["cover", "loading", "play-menu", "seasonal-events", "favorites", "online-lobby", "settings", "unlocks", "upgrades", "achievements", "stages", "select", "battle", "result"];
const canvas = $("game-canvas");
const ctx = canvas.getContext("2d");
const fallbackArena = {
  floor: 470,
  platforms: [
    { x: 105, y: 390, width: 220 },
    { x: 445, y: 310, width: 210 },
    { x: 775, y: 390, width: 220 },
  ],
};

const roster = [
  { id: "shellshock", name: "Sergeant Shellshock", icon: "🦝", art: "assets/characters/sergeant-shellshock.png", color: "#e5704e", attack: "Helmet Bonk", range: "Pistol", special: "Big Boom Blast", speed: 5.3, power: 10 },
  { id: "pip", name: "Pip", icon: "🐾", art: "assets/characters/pip.png", color: "#efb94d", attack: "Paw Swipe", range: "Snack Toss", special: "Grapple Zip", speed: 6.2, power: 8 },
  { id: "professor", name: "Professor Trash Panda", icon: "🧪", art: "assets/characters/professor-trash-panda.png", color: "#5fa7a6", attack: "Wrench Whack", range: "Gear Flinger", special: "Trash-o-Matic", speed: 4.7, power: 11 },
  { id: "bloop", name: "Bloop", icon: "🦈", art: "assets/characters/bloop.png", color: "#388fe5", attack: "Bowl Bump", range: "Bubble Beam", special: "Fishbowl Dash", speed: 5.6, power: 9 },
  { id: "ironbolt", name: "Captain Ironbolt", icon: "🐺", art: "assets/characters/captain-ironbolt.png", color: "#80944d", attack: "Twin Katanas", range: "Machine Gun", special: "Tank Charge", speed: 4.4, power: 13 },
  { id: "bolt", name: "Bolt the Beaver", icon: "🦫", art: "assets/characters/bolt-the-beaver.png", color: "#ad704c", attack: "Tail Slam", range: "Wrench Toss", special: "Rocket Boost", speed: 5.4, power: 10 },
  { id: "goblin", name: "Garbage Goblin", icon: "👺", art: "assets/characters/garbage-goblin.png", color: "#778c47", attack: "Magnet Bonk", range: "Scrap Toss", special: "Junk Avalanche", speed: 5.1, power: 11 },
  { id: "doomgear", name: "Doctor Doomgear", icon: "🤖", art: "assets/characters/doctor-doomgear.png", color: "#67428f", attack: "Claw Swing", range: "Gear Bolt", special: "Gear Fortress Beam", speed: 4.8, power: 12 },
  { id: "null", name: "Project Null", icon: "🔷", art: "assets/characters/project-null.png", color: "#554da0", attack: "Crystal Claw", range: "Teal Orb", special: "Gravity Crush", speed: 5.2, power: 14, omega: true },
  { id: "megameg", name: "Mecha Meg", icon: "🦈", art: "assets/characters/mecha-meg.png", color: "#198bd7", attack: "Titan Claw", range: "Plasma Torpedo", special: "Megalodon Charge", speed: 4.6, power: 15 },
  { id: "kingcaw", name: "King Claw", icon: "🐦‍⬛", art: "assets/characters/king-caw.png?v=king-caw-2", color: "#60398f", attack: "Crown Claw", range: "Feather Fling", special: "Royal Wing Gust", speed: 5.8, power: 11 },
  { id: "rexy", name: "Rexy", icon: "🦖", art: "assets/characters/rexy.png?v=rexy-3", color: "#967044", attack: "Tail Slam", range: "Fossil Boulder", special: "Mega Bite", speed: 4.5, power: 16 },
  { id: "blue", name: "Blue", icon: "🦖", art: "assets/characters/blue-raptor.png?v=blue-1", color: "#766653", attack: "Claw Rake", range: "Razor Quill", special: "Raptor Pounce", speed: 6.5, power: 12 },
  { id: "fang", name: "Fang the Komodo Dragon", icon: "🦎", art: "assets/characters/fang-komodo.png?v=fang-1", color: "#67723e", attack: "Tail Whip", range: "Venom Spit", special: "Predator Lunge", speed: 4.8, power: 15 },
  { id: "fierce", name: "Shadow Fang", icon: "🐆", art: "assets/characters/fierce-panther.png?v=fierce-1", color: "#26334a", attack: "Claw Combo", range: "Shadow Claw", special: "Panther Pounce", speed: 6.7, power: 12 },
  { id: "snaptrap", name: "Snaptrap", icon: "🌿", art: "assets/characters/snaptrap.png?v=snaptrap-1", color: "#5b9e43", attack: "Vine Whack", range: "Leaf Slash", special: "Mega Chomp", speed: 4.9, power: 14 },
  { id: "talon", name: "Talon the Eagle", icon: "🦅", art: "assets/characters/talon-eagle.png?v=talon-1", color: "#9c6929", attack: "Wing Swipe", range: "Feather Dart", special: "Sky Dive", speed: 6.2, power: 11 },
  { id: "tusk", name: "Tusk the Mammoth", icon: "🦣", art: "assets/characters/tusk-mammoth.png?v=tusk-1", color: "#79513a", attack: "Tusk Jab", range: "Snowball Toss", special: "Tusk Charge", speed: 4.2, power: 13, health: 120, battleScale: 1.3 },
  { id: "cobra", name: "King Cobra", icon: "🐍", art: "assets/characters/king-cobra-realistic.png?v=cobra-2", color: "#6d5a3d", attack: "Cobra Bite", range: "Venom Orb", special: "Royal Strike", speed: 5.7, power: 14, health: 105 },
  { id: "blaze", name: "Blaze", icon: "🐉", art: "assets/characters/blaze-the-dragon.png?v=blaze-3", color: "#e75228", attack: "Claw Swipe", range: "Fire Breath", special: "Wing Bash", speed: 5.1, power: 13 },
  { id: "axel", name: "Axel the Axolotl", icon: "🦎", art: "assets/characters/axel-axolotl-real.png?v=real-1", color: "#e978a7", cardBackground: "linear-gradient(#003d7499, #003d7455), url('assets/characters/backgrounds/axel-lagoon.png') center / cover", attack: "Fin Flick", range: "Water Orb", special: "Bubble Whirl", speed: 5.8, power: 10, battlePortraitScale: .78 },
  { id: "hank", name: "Hank the Hippo", icon: "🦛", art: "assets/characters/hank-hippo-real.png?v=real-1", color: "#7385a4", cardBackground: "linear-gradient(#3d291e99, #3d291e55), url('assets/characters/backgrounds/hank-riverbank.png') center / cover", attack: "Hippo Headbutt", range: "Mud Ball", special: "River Rush", speed: 4.1, power: 15, health: 115, battlePortraitScale: .64 },
  { id: "buzz", name: "Buzz the Bee", icon: "🐝", art: "assets/characters/buzz-bee-real.png?v=real-1", color: "#f2b931", cardBackground: "linear-gradient(#6f3d0099, #6f3d0055), url('assets/characters/backgrounds/buzz-meadow.png') center / cover", attack: "Stinger Jab", range: "Honey Bolt", special: "Swarm Blitz", speed: 6.8, power: 9, battlePortraitScale: .76 },
  { id: "frost", name: "Frost the Polar Bear", icon: "🐻‍❄️", art: "assets/characters/frost-polar-bear-real.png?v=real-1", color: "#8dc7df", cardBackground: "linear-gradient(#10295d99, #10295d55), url('assets/characters/backgrounds/frost-arctic.png') center / cover", attack: "Polar Paw", range: "Snowball Toss", special: "Arctic Slam", speed: 4.8, power: 14, health: 110, battlePortraitScale: .66 },
  { id: "bamboo", name: "Bamboo the Panda", icon: "🐼", art: "assets/characters/bamboo-panda-real.png?v=real-1", color: "#6b7182", cardBackground: "linear-gradient(#183d1f99, #183d1f55), url('assets/characters/backgrounds/bamboo-forest.png') center / cover", attack: "Bamboo Bonk", range: "Bamboo Shoot", special: "Panda Roll", speed: 5.3, power: 12, battlePortraitScale: .66 },
  { id: "perry", name: "Perry the Present Penguin", icon: "🐧", art: "assets/characters/perry-penguin.svg", color: "#4d88bc", attack: "Present Bonk", range: "Candy Cane Shot", special: "Snowy Surprise", speed: 5.5, power: 13, seasonal: "christmas" },
  { id: "boo", name: "Boo the Bat", icon: "🦇", art: "assets/characters/boo-the-bat.svg", color: "#6b4c91", attack: "Wing Swipe", range: "Spooky Spark", special: "Moon Dash", speed: 6.5, power: 12, seasonal: "halloween" },
];

const trainingDummy = { id: "training-dummy", name: "Training Dummy", color: "#d47b48", attack: "None", range: "None", special: "None", speed: 0, power: 0, trainingDummy: true };
const trainingStage = { id: "training-room", name: "Training Room", art: "assets/arenas/training-room.png" };
const bossEnemy = { id: "boss", name: "MEGA DOOMGEAR", color: "#bd3f4e", attack: "Titan Smash", range: "Plasma Cannon", special: "Meteor Crash", speed: 4.7, power: 10, boss: true };
const bossStage = { id: "boss-lair", name: "Boss Lair" };
const frostKing = { id: "frost-king", name: "FROST KING", color: "#7ccfeb", attack: "Glacier Claw", range: "Ice Shard", special: "Blizzard Roar", speed: 4.8, power: 13, boss: true, battleScale: 1.5, eventBoss: "christmas" };
const pumpkinKing = { id: "pumpkin-king", name: "PUMPKIN KING", color: "#dd7133", attack: "Vine Smash", range: "Pumpkin Spark", special: "Haunted Howl", speed: 5.0, power: 13, boss: true, battleScale: 1.5, eventBoss: "halloween" };
const turkeyBoss = { id: "turkey-boss", name: "TURKEY BOSS", color: "#9b5837", attack: "Wing Whack", range: "Feather Fling", special: "Gobble Storm", speed: 4.9, power: 13, boss: true, battleScale: 1.5, eventBoss: "thanksgiving" };

const stages = [
  { id: "icy", name: "Icy Peaks", description: "Frozen platforms under the northern lights", art: "assets/arenas/icy.png" },
  { id: "fire", name: "Lava Leap", description: "Volcano rocks and glowing lava", art: "assets/arenas/fire.png" },
  { id: "stone", name: "Stone Ruins", description: "Ancient temples and waterfalls", art: "assets/arenas/stone.png" },
  { id: "water", name: "Coral Coast", description: "Ocean waves and reef rafts", art: "assets/arenas/water.png" },
  { id: "pirate", name: "Pirate Ship Panic", description: "Jump across a pirate ship sailing through giant waves", art: "assets/arenas/pirate-ship-panic.png" },
  { id: "lightning", name: "Thunder Works", description: "Storm clouds and electric towers", art: "assets/arenas/lightning.png" },
  { id: "wind", name: "Sky Gusts", description: "Clouds, windmills, and airships", art: "assets/arenas/wind.png" },
  { id: "jungle", name: "Rexy's Jungle", description: "Vines, mushrooms, and small animals", art: "assets/arenas/jungle.png" },
  { id: "shadow", name: "Moonlit Shadows", description: "Purple crystals and spooky trees", art: "assets/arenas/shadow.png" },
  { id: "metal", name: "Gear Factory", description: "Magnets, machines, and steel", art: "assets/arenas/metal.png" },
  { id: "space", name: "Black Hole Bay", description: "Planets, meteors, and stars", art: "assets/arenas/space.png" },
  { id: "candy", name: "Candy Kingdom", description: "Cookies, gummies, and soda rivers", art: "assets/arenas/candy.png" },
  { id: "crystal", name: "Gem Grotto", description: "Sparkling caves and crystal falls", art: "assets/arenas/crystal.png" },
  { id: "dino", name: "Dino Dig Site", description: "Fossils, digging tools, and giant bones", art: "assets/arenas/dino-dig-site.png" },
  { id: "toybox", name: "Toybox Tower", description: "Building blocks, toy trains, and a robot", art: "assets/arenas/toybox-tower.png" },
  { id: "warfare", name: "Warfare Battlefield", description: "Sandbags, supply crates, and mountain bases", art: "assets/arenas/warfare.png" },
  { id: "fortress", name: "Fortress Field", description: "Sunny castle battlements, bridges, and a mountain valley", art: "assets/arenas/fortress-field.png" },
  { id: "neon", name: "Neon Rooftop Rumble", description: "Glowing rooftops, skybridges, and moonlit skyscrapers", art: "assets/arenas/neon-rooftop-rumble.png" },
  { id: "carnival", name: "Cloud Carnival", description: "Balloon platforms, rainbow skies, and floating rides", art: "assets/arenas/cloud-carnival.png" },
  { id: "library", name: "Haunted Library", description: "Floating books, magic candles, and moonlit shelves", art: "assets/arenas/haunted-library.png" },
  { id: "mystery", name: "Volcano Dino Island", description: "Lava rocks, giant fossils, and tropical jungle platforms", art: "assets/arenas/volcano-dino-island.png" },
  { id: "sharklab", name: "Shark Lab", description: "Underwater tanks, glowing pipes, and steel platforms", art: "assets/arenas/shark-lab.png" },
  { id: "frozenaquarium", name: "Frozen Aquarium", description: "Icy fish tanks, crystal caves, and snowy platforms", art: "assets/arenas/frozen-aquarium.png" },
  { id: "treehouse", name: "Giant Treehouse", description: "Rope bridges, lanterns, vines, and sunset branches", art: "assets/arenas/giant-treehouse.png" },
  { id: "pizzaplanet", name: "Space Pizza Planet", description: "Cheese moons, pepperoni meteors, and cosmic pizza platforms", art: "assets/arenas/space-pizza-planet.png" },
];

// Each special arena gets one themed hazard at a time, so it stays exciting
// without making the fight impossible.
const stageHazards = {
  icy: { kind: "ice", label: "ICE CHUNK", color: "#9cecff", damage: 10 },
  fire: { kind: "meteor", label: "LAVA ROCK", color: "#ff663b", damage: 14 },
  stone: { kind: "rock", label: "FALLING ROCK", color: "#9b7656", damage: 12 },
  pirate: { kind: "cannonball", label: "CANNONBALL", color: "#313742", damage: 13, horizontal: true },
  lightning: { kind: "lightning", label: "LIGHTNING STRIKE", color: "#f9ed68", damage: 12 },
  jungle: { kind: "coconut", label: "FALLING COCONUT", color: "#80502a", damage: 11 },
  shadow: { kind: "crystal", label: "SHADOW CRYSTAL", color: "#a96bff", damage: 12 },
  metal: { kind: "gear", label: "FALLING GEAR", color: "#a4b5bd", damage: 12 },
  space: { kind: "meteor", label: "METEOR", color: "#ff8544", damage: 15 },
  candy: { kind: "gumdrop", label: "GIANT GUMDROP", color: "#ff70b8", damage: 10 },
  crystal: { kind: "crystal", label: "CRYSTAL SHARD", color: "#62f2df", damage: 12 },
  dino: { kind: "rock", label: "DINO ROCK", color: "#b16d3d", damage: 14 },
  toybox: { kind: "block", label: "TOY BLOCK", color: "#ffbc43", damage: 10 },
  warfare: { kind: "crate", label: "SUPPLY CRATE", color: "#a7783d", damage: 12 },
  fortress: { kind: "rock", label: "FALLING BOULDER", color: "#9b7656", damage: 12 },
  neon: { kind: "electric", label: "NEON SPARK", color: "#70f2ff", damage: 12 },
  carnival: { kind: "gumdrop", label: "LOOSE BALLOON", color: "#ff70b8", damage: 10 },
  library: { kind: "book", label: "MAGIC BOOK", color: "#67428f", damage: 11 },
  mystery: { kind: "meteor", label: "VOLCANO ROCK", color: "#ec5534", damage: 15 },
  sharklab: { kind: "electric", label: "ELECTRIC SPARK", color: "#69eaff", damage: 11 },
  frozenaquarium: { kind: "ice", label: "ICE CHUNK", color: "#a6f4ff", damage: 11 },
  treehouse: { kind: "coconut", label: "FALLING COCONUT", color: "#80502a", damage: 12 },
  pizzaplanet: { kind: "meteor", label: "PEPPERONI METEOR", color: "#f16b45", damage: 14 },
};

// These are the real platform locations in each background picture.
const stageArenas = {
  "training-room": { floor: 480, platforms: [{ x: 95, y: 145, width: 250 }, { x: 345, y: 55, width: 420 }, { x: 760, y: 145, width: 250 }, { x: 180, y: 284, width: 255 }, { x: 665, y: 284, width: 255 }] },
  icy:       { floor: 355, platforms: [{ x: 110, y: 268, width: 250 }, { x: 440, y: 176, width: 230 }, { x: 740, y: 268, width: 255 }] },
  fire:      { floor: 366, platforms: [{ x: 135, y: 286, width: 230 }, { x: 440, y: 196, width: 230 }, { x: 740, y: 286, width: 230 }] },
  stone:     { floor: 416, platforms: [{ x: 145, y: 303, width: 250 }, { x: 440, y: 209, width: 230 }, { x: 720, y: 300, width: 260 }] },
  water:     { floor: 351, platforms: [{ x: 75, y: 270, width: 220 }, { x: 470, y: 218, width: 175 }, { x: 835, y: 271, width: 205 }] },
  pirate:    { floor: 426, platforms: [{ x: 94, y: 296, width: 252 }, { x: 458, y: 222, width: 208 }, { x: 738, y: 300, width: 247 }] },
  frozenaquarium: { floor: 370, platforms: [{ x: 102, y: 204, width: 247 }, { x: 372, y: 110, width: 352 }, { x: 740, y: 204, width: 218 }] },
  sharklab:  { floor: 425, platforms: [{ x: 65, y: 250, width: 231 }, { x: 421, y: 223, width: 237 }, { x: 802, y: 252, width: 224 }] },
  treehouse: { floor: 435, platforms: [{ x: 63, y: 231, width: 276 }, { x: 392, y: 169, width: 358 }, { x: 775, y: 231, width: 304 }] },
  pizzaplanet: { floor: 395, platforms: [{ x: 138, y: 196, width: 218 }, { x: 437, y: 154, width: 224 }, { x: 745, y: 200, width: 200 }] },
  mystery:   { floor: 430, platforms: [{ x: 68, y: 268, width: 267 }, { x: 438, y: 184, width: 213 }, { x: 755, y: 277, width: 262 }] },
  lightning: { floor: 400, platforms: [{ x: 135, y: 283, width: 255 }, { x: 440, y: 214, width: 230 }, { x: 720, y: 283, width: 255 }] },
  wind:      { floor: 360, platforms: [{ x: 245, y: 252, width: 190 }, { x: 480, y: 183, width: 160 }, { x: 665, y: 252, width: 200 }] },
  jungle:    { floor: 445, platforms: [{ x: 110, y: 278, width: 250 }, { x: 440, y: 153, width: 230 }, { x: 730, y: 278, width: 260 }] },
  shadow:    { floor: 425, platforms: [{ x: 190, y: 315, width: 230 }, { x: 440, y: 213, width: 230 }, { x: 685, y: 315, width: 230 }] },
  metal:     { floor: 382, platforms: [{ x: 45, y: 323, width: 220 }, { x: 440, y: 263, width: 230 }, { x: 820, y: 323, width: 220 }] },
  space:     { floor: 440, platforms: [{ x: 135, y: 342, width: 190 }, { x: 440, y: 290, width: 230 }, { x: 775, y: 342, width: 200 }] },
  candy:     { floor: 445, platforms: [{ x: 185, y: 316, width: 220 }, { x: 440, y: 184, width: 230 }, { x: 695, y: 316, width: 220 }] },
  crystal:   { floor: 430, platforms: [{ x: 120, y: 303, width: 245 }, { x: 440, y: 188, width: 230 }, { x: 740, y: 303, width: 245 }] },
  dino:      { floor: 465, platforms: [{ x: 135, y: 340, width: 250 }, { x: 440, y: 230, width: 230 }, { x: 730, y: 340, width: 250 }] },
  toybox:    { floor: 420, platforms: [{ x: 190, y: 230, width: 200 }, { x: 450, y: 230, width: 200 }, { x: 710, y: 230, width: 200 }] },
  warfare:   { floor: 420, platforms: [{ x: 195, y: 264, width: 250 }, { x: 690, y: 264, width: 250 }] },
  fortress:  { floor: 407, platforms: [{ x: 12, y: 309, width: 355 }, { x: 370, y: 199, width: 350 }, { x: 735, y: 309, width: 335 }] },
  neon:      { floor: 438, platforms: [{ x: 48, y: 345, width: 270 }, { x: 372, y: 201, width: 352 }, { x: 773, y: 345, width: 288 }] },
  carnival:  { floor: 475, platforms: [{ x: 62, y: 336, width: 255 }, { x: 433, y: 242, width: 230 }, { x: 776, y: 336, width: 255 }] },
  library:   { floor: 472, platforms: [{ x: 38, y: 304, width: 292 }, { x: 414, y: 183, width: 278 }, { x: 768, y: 304, width: 298 }] },
};

const seasonalEvents = [
  {
    id: "birthday", name: "Birthday Bash", icon: "🎂", month: 5, firstDay: 25, lastDay: 25,
    kind: "bonus", description: "Birthday cakes replace apples and fully heal you. Every win earns triple coins!", rewardLine: "🎂 FULL-HEAL CAKES + 3× COINS", buttonLabel: "PLAY BIRTHDAY BASH",
  },
  {
    id: "new-year", name: "Firework Frenzy", icon: "🎆", month: 0, firstDay: 1, lastDay: 7,
    kind: "bonus", description: "Every battle win gives double coins and double trophies all week!", rewardLine: "✨ DOUBLE COINS + TROPHIES", buttonLabel: "PLAY FIREWORK FRENZY",
  },
  {
    id: "shark-week", name: "Shark Week", icon: "🦈", month: 6, firstDay: 20, lastDay: 26,
    kind: "bonus", description: "Bloop and Mecha Meg deal 50% extra damage in every battle!", rewardLine: "🦈 SHARKS DEAL 50% EXTRA DAMAGE", buttonLabel: "PLAY SHARK WEEK",
  },
  {
    id: "thanksgiving", name: "Turkey Boss Feast", icon: "🦃", month: 10, firstDay: 20, lastDay: 27,
    kind: "boss", boss: turkeyBoss, stageId: "candy", coinMultiplier: 7, rewardLine: "🏆 7× COINS", description: "Full-heal turkeys replace apples. Defeat the Turkey Boss for seven times the coins!",
  },
  {
    id: "christmas", name: "Frost King Challenge", icon: "❄️", month: 11, firstDay: 20, lastDay: 25,
    boss: frostKing, stageId: "icy", rewardId: "perry", rewardName: "Perry the Present Penguin",
    description: "Defeat the Frost King. He has 300 health, double damage, and icy attacks!",
  },
  {
    id: "halloween", name: "Pumpkin King Challenge", icon: "🎃", month: 9, firstDay: 25, lastDay: 31,
    boss: pumpkinKing, stageId: "shadow", rewardId: "boo", rewardName: "Boo the Bat",
    description: "Defeat the Pumpkin King to unlock a spooky bat fighter forever!",
  },
];

function localCalendarDay(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function isSeasonalEventActive(event, date = new Date()) { return date.getMonth() === event.month && date.getDate() >= event.firstDay && date.getDate() <= event.lastDay; }
function activeSeasonalEvents(date = new Date()) { return seasonalEvents.filter((event) => isSeasonalEventActive(event, date)); }
function getSeasonalEvent(id) { return seasonalEvents.find((event) => event.id === id); }
function fireworkFrenzyActive() { return activeSeasonalEvents().some((event) => event.id === "new-year"); }
function sharkWeekActive() { return activeSeasonalEvents().some((event) => event.id === "shark-week"); }
function thanksgivingActive() { return activeSeasonalEvents().some((event) => event.id === "thanksgiving"); }
function birthdayActive() { return activeSeasonalEvents().some((event) => event.id === "birthday"); }
function seasonalMonthName(event) { return ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"][event.month]; }

const difficultyModes = {
  easy: { label: "EASY", moveSpeed: .65, thinking: 1.45, attackChance: .68 },
  normal: { label: "NORMAL", moveSpeed: 1, thinking: 1, attackChance: .9 },
  hard: { label: "HARD", moveSpeed: 1.2, thinking: .68, attackChance: 1 },
};
const coinIcon = '<span class="coin" aria-label="coin">$</span>';
const emotePhrases = ["GOOD LUCK!", "GOOD GAME!", "MY BAD!", "NICE MOVE!", "OOPS!", "WOW!", "REMATCH?", "YOU GOT THIS!"];
const nonMechanicalAnimalIds = ["pip", "bloop", "bolt", "kingcaw", "rexy", "blue", "fang", "fierce", "talon", "tusk", "cobra", "blaze", "axel", "hank", "buzz", "frost", "bamboo"];
const armoredFighterIds = ["shellshock", "ironbolt", "doomgear", "null", "megameg"];
const achievementCatalog = [
  { id: "first-win", icon: "🥇", art: "assets/badges/first-rumble-badge.png", name: "First Rumble", description: "Win your first battle." },
  { id: "speedy", icon: "⚡", art: "assets/badges/lightning-win-badge.png", name: "Lightning Win", description: "Win a battle in under 15 seconds." },
  { id: "coin-collector", icon: "💰", art: "assets/badges/coin-collector-badge.png", name: "Coin Collector", description: "Collect 100 coins total." },
  { id: "boss-beater", icon: "👑", art: "assets/badges/boss-beater-badge.png", name: "Boss Beater", description: "Defeat Mega Doomgear." },
  { id: "crow-champion", icon: "🐦‍⬛", art: "assets/badges/crowning-glory-badge.png", name: "Crowning Glory", description: "Win a battle as King Claw." },
  { id: "five-trophies", icon: "🏆", art: "assets/badges/five-trophies-badge.png", name: "Trophy Starter", description: "Earn 5 trophies." },
  { id: "ten-trophies", icon: "🏆", art: "assets/badges/ten-trophies-badge.png", name: "Silver Champion", description: "Earn 10 trophies." },
  { id: "fifty-trophies", icon: "🏆", art: "assets/badges/fifty-trophies-badge.png", name: "Gold Champion", description: "Earn 50 trophies." },
  { id: "one-hundred-trophies", icon: "🏆", art: "assets/badges/one-hundred-trophies-badge.png", name: "Platinum Champion", description: "Earn 100 trophies." },
  { id: "five-hundred-trophies", icon: "🏆", art: "assets/badges/five-hundred-trophies-badge.png", name: "Crystal Legend", description: "Earn 500 trophies." },
  { id: "one-thousand-trophies", icon: "🏆", art: "assets/badges/one-thousand-trophies-badge.png", name: "Rainbow Rumble Legend", description: "Earn 1,000 trophies." },
  { id: "apex-predator", icon: "🐾", art: "assets/badges/apex-predator-badge.png?v=apex-1", name: "Apex Predator", description: "Win 5 battles in a row." },
  { id: "flawless-victory", icon: "✨", art: "assets/badges/flawless-victory-badge.png?v=flawless-1", name: "Flawless Victory", description: "Win without taking any damage." },
  { id: "overkill", icon: "💥", art: "assets/badges/overkill-badge.png?v=overkill-1", name: "Overkill", description: "Finish a battle with a special attack." },
  { id: "speed-demon", icon: "🏎️", art: "assets/badges/speed-demon-badge.png?v=speed-demon-1", name: "Speed Demon", description: "Win a battle in less than 10 seconds." },
  { id: "high-roller", icon: "🎰", art: "assets/badges/high-roller-badge.png?v=high-roller-1", name: "High Roller", description: "Amass 500 coins." },
  { id: "zoo-keeper", icon: "🦁", art: "assets/badges/zoo-keeper-badge.png?v=zoo-keeper-1", name: "Zoo Keeper", description: "Win with every non-mechanical animal." },
  { id: "heavy-metal", icon: "🤖", art: "assets/badges/heavy-metal-badge.png?v=heavy-metal-1", name: "Heavy Metal", description: "Win with every armored fighter." },
  { id: "master-strategist", icon: "🧠", art: "assets/badges/master-strategist-badge.png?v=master-strategist-1", name: "Master Strategist", description: "Win after collecting 3 different power-ups in one battle." },
];

const unlockCatalog = [
  { type: "fighters", id: "doomgear", cost: 75, kind: "Fighter" },
  { type: "fighters", id: "null", cost: 150, kind: "Fighter" },
  { type: "fighters", id: "megameg", cost: 250, kind: "Fighter" },
];

const weaponUpgradePaths = {
  shellshock: [
    { name: "Pistol", description: "A simple, quick single bullet.", cost: 0 },
    { name: "Rifle", description: "A fast and accurate long-range bullet.", cost: 30 },
    { name: "Mini Gun", description: "A rapid spray of little bullets.", cost: 70 },
    { name: "Bazooka", description: "A bigger explosive rocket with extra damage.", cost: 125 },
    { name: "Machine Gun", description: "Three bright, powerful machine-gun bullets.", cost: 190 },
    { name: "Sniper", description: "One super-fast bullet with big damage.", cost: 300 },
    { name: "Rocket Launcher", description: "A huge rocket with the strongest blast.", cost: 450 },
  ],
  pip: [{ name: "Snack Toss", description: "Pip's starter snack shot.", cost: 0 }, { name: "Gadget Blaster", description: "Faster and stronger gadget shots.", cost: 65 }, { name: "Mega Snack Cannon", description: "A giant flying snack blast.", cost: 160 }],
  professor: [{ name: "Gear Flinger", description: "Professor's starter spinning gear.", cost: 0 }, { name: "Gear Cannon", description: "Bigger gears with more power.", cost: 70 }, { name: "Mega Gear Storm", description: "A super-sized gear blast.", cost: 180 }],
  bloop: [{ name: "Bubble Beam", description: "Bloop's starter bubble shot.", cost: 0 }, { name: "Torpedo Bubble", description: "A faster bubble torpedo.", cost: 70 }, { name: "Tidal Torpedo", description: "A giant ocean-powered torpedo.", cost: 190 }],
  ironbolt: [{ name: "Machine Gun", description: "Captain Ironbolt's starter gun.", cost: 0 }, { name: "Cannon Burst", description: "A heavy cannon shot.", cost: 85 }, { name: "Missile Rack", description: "Powerful rapid missiles.", cost: 225 }],
  bolt: [{ name: "Wrench Toss", description: "Bolt's starter wrench throw.", cost: 0 }, { name: "Drill Launcher", description: "A speedy spinning drill.", cost: 70 }, { name: "Rocket Wrench", description: "A rocket-powered wrench blast.", cost: 180 }],
  goblin: [{ name: "Scrap Toss", description: "Garbage Goblin's starter scrap shot.", cost: 0 }, { name: "Magnet Cannon", description: "A strong magnetic blast.", cost: 80 }, { name: "Junk Meteor", description: "A giant flying pile of junk.", cost: 205 }],
  doomgear: [{ name: "Gear Bolt", description: "Doctor Doomgear's starter gear bolt.", cost: 0 }, { name: "Plasma Claw", description: "A glowing claw-energy shot.", cost: 95 }, { name: "Doom Laser", description: "A huge villain laser blast.", cost: 250 }],
  null: [{ name: "Teal Orb", description: "Project Null's starter crystal orb.", cost: 0 }, { name: "Crystal Volley", description: "A fast crystal shot.", cost: 110 }, { name: "Gravity Nova", description: "A giant gravity-powered orb.", cost: 300 }],
  megameg: [{ name: "Plasma Torpedo", description: "Mecha Meg's speedy glowing torpedo.", cost: 0 }, { name: "Fin Missile", description: "A larger missile with a bigger blast.", cost: 120 }, { name: "Megalodon Beam", description: "A huge cyan beam powered by Mecha Meg's armor.", cost: 325 }],
  kingcaw: [{ name: "Feather Fling", description: "King Claw's quick royal feather shot.", cost: 0 }, { name: "Crown Boomerang", description: "A sharp spinning crown attack.", cost: 80 }, { name: "Royal Storm", description: "A powerful flock of glowing feathers.", cost: 210 }],
  rexy: [{ name: "Fossil Boulder", description: "Rexy's heavy rolling fossil rock.", cost: 0 }, { name: "Meteor Egg", description: "A faster dinosaur egg attack.", cost: 130 }, { name: "Volcano Chunk", description: "A huge ancient rock with extra power.", cost: 340 }],
  blue: [{ name: "Razor Quill", description: "Blue's fast sharp quill throw.", cost: 0 }, { name: "Triple Quill", description: "Three quick raptor quills in a row.", cost: 105 }, { name: "Raptor Storm", description: "A powerful flurry of razor quills.", cost: 275 }],
  fang: [{ name: "Venom Spit", description: "Fang's poisonous green venom splash.", cost: 0 }, { name: "Acid Glob", description: "A faster, stronger venom glob.", cost: 95 }, { name: "Toxic Torrent", description: "A giant splash of Komodo venom.", cost: 255 }],
  fierce: [{ name: "Shadow Claw", description: "Shadow Fang's flying claw-slash projectile.", cost: 0 }, { name: "Night Rake", description: "A faster, sharper triple slash.", cost: 110 }, { name: "Moon Fang", description: "A huge glowing panther claw wave.", cost: 285 }],
  snaptrap: [{ name: "Leaf Slash", description: "Snaptrap's sharp spinning leaf throw.", cost: 0 }, { name: "Thorn Disc", description: "A faster thorny leaf attack.", cost: 105 }, { name: "Jungle Cyclone", description: "A giant storm of razor leaves.", cost: 275 }],
  talon: [{ name: "Feather Dart", description: "Talon's quick razor-feather throw.", cost: 0 }, { name: "Storm Feather", description: "A faster wind-charged feather dart.", cost: 105 }, { name: "Eagle Barrage", description: "A powerful flurry of sharp eagle feathers.", cost: 275 }],
  tusk: [{ name: "Snowball Toss", description: "Tusk's heavy packed snowball.", cost: 0 }, { name: "Ice Boulder", description: "A bigger frozen ball with extra impact.", cost: 100 }, { name: "Glacier Ball", description: "A giant icy snowball that hits hard.", cost: 270 }],
  cobra: [{ name: "Venom Orb", description: "King Cobra's glowing poison orb.", cost: 0 }, { name: "Royal Venom", description: "A faster venom blast with extra sting.", cost: 110 }, { name: "Crown Toxin", description: "A giant royal poison orb that hits hard.", cost: 285 }],
  blaze: [{ name: "Fire Breath", description: "Blaze's hot rolling burst of flame.", cost: 0 }, { name: "Flame Ball", description: "A faster fire blast with extra heat.", cost: 100 }, { name: "Dragon Inferno", description: "A giant fire blast from Blaze's jaws.", cost: 260 }],
  axel: [{ name: "Water Orb", description: "Axel's bouncy aqua bubble.", cost: 0 }, { name: "Wave Orb", description: "A quicker water shot with more splash.", cost: 85 }, { name: "Tidal Bubble", description: "A giant powerful bubble blast.", cost: 220 }],
  hank: [{ name: "Mud Ball", description: "Hank's heavy packed mud ball.", cost: 0 }, { name: "River Boulder", description: "A larger muddy boulder with more power.", cost: 105 }, { name: "Flood Rock", description: "A giant crashing mud-rock blast.", cost: 275 }],
  buzz: [{ name: "Honey Bolt", description: "Buzz's quick golden stinger shot.", cost: 0 }, { name: "Triple Stinger", description: "A faster buzzing stinger attack.", cost: 95 }, { name: "Honey Storm", description: "A huge glowing honey-powered bolt.", cost: 250 }],
  frost: [{ name: "Snowball Toss", description: "Frost's packed snowball projectile.", cost: 0 }, { name: "Ice Ball", description: "A bigger, colder snowball with more impact.", cost: 105 }, { name: "Polar Blizzard", description: "A giant frozen ball that hits hard.", cost: 275 }],
  bamboo: [{ name: "Bamboo Shoot", description: "Bamboo's sharp spinning bamboo shot.", cost: 0 }, { name: "Bamboo Boomerang", description: "A faster, heavier bamboo blast.", cost: 90 }, { name: "Forest Fury", description: "A huge bamboo-powered projectile.", cost: 240 }],
  perry: [{ name: "Candy Cane Shot", description: "Perry's sweet-and-sharp candy cane projectile.", cost: 0 }],
  boo: [{ name: "Spooky Spark", description: "Boo's fast glowing night spark.", cost: 0 }],
};

const starterProfile = {
  coins: 0,
  trophies: 0,
  wins: 0,
  arenaWinsStart: 0,
  spacePizzaWinsStart: 0,
  spacePizzaUnlocked: false,
  fighters: ["shellshock", "pip", "professor", "bloop", "ironbolt", "bolt", "goblin", "kingcaw", "rexy", "blue", "fang", "fierce", "snaptrap", "talon", "tusk", "cobra", "blaze", "axel", "hank", "buzz", "frost", "bamboo"],
  stages: stages.map((stage) => stage.id),
  favoriteFighter: null,
  favoriteStage: null,
  upgrades: {},
  achievements: [],
  winStreak: 0,
  animalWins: [],
  armorWins: [],
  seasonalAttempts: {},
};

function freshProfile() {
  return { ...starterProfile, fighters: [...starterProfile.fighters], stages: [...starterProfile.stages], upgrades: {}, achievements: [], animalWins: [], armorWins: [], seasonalAttempts: {} };
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("rumble-rivals-profile"));
    if (!saved) return freshProfile();
    const savedWins = Number.isFinite(saved.wins) ? Math.max(0, Math.floor(saved.wins)) : 0;
  return {
    coins: Number.isFinite(saved.coins) ? Math.max(0, saved.coins) : 0,
      trophies: Number.isFinite(saved.trophies) ? Math.max(0, Math.floor(saved.trophies)) : 0,
      wins: savedWins,
      // Existing saved games start this ordered arena challenge from this update.
      arenaWinsStart: Number.isFinite(saved.arenaWinsStart) ? Math.max(0, Math.floor(saved.arenaWinsStart)) : savedWins,
      // Space Pizza Planet starts locked when this new arena is added.
      spacePizzaWinsStart: Number.isFinite(saved.spacePizzaWinsStart) ? Math.max(0, Math.floor(saved.spacePizzaWinsStart)) : savedWins,
      spacePizzaUnlocked: saved.spacePizzaUnlocked === true,
      fighters: Array.isArray(saved.fighters) ? [...new Set([...saved.fighters, "kingcaw", "rexy", "blue", "fang", "fierce", "snaptrap", "talon", "tusk", "cobra", "blaze", "axel", "hank", "buzz", "frost", "bamboo"])] : [...starterProfile.fighters],
      stages: Array.isArray(saved.stages) ? saved.stages : [...starterProfile.stages],
      favoriteFighter: roster.some((fighter) => fighter.id === saved.favoriteFighter) ? saved.favoriteFighter : null,
      favoriteStage: stages.some((stage) => stage.id === saved.favoriteStage) ? saved.favoriteStage : null,
      upgrades: saved.upgrades && typeof saved.upgrades === "object" ? saved.upgrades : {},
      achievements: Array.isArray(saved.achievements) ? saved.achievements : [],
      winStreak: Number.isFinite(saved.winStreak) ? Math.max(0, Math.floor(saved.winStreak)) : 0,
      animalWins: Array.isArray(saved.animalWins) ? saved.animalWins.filter((id) => typeof id === "string") : [],
      armorWins: Array.isArray(saved.armorWins) ? saved.armorWins.filter((id) => typeof id === "string") : [],
      seasonalAttempts: saved.seasonalAttempts && typeof saved.seasonalAttempts === "object" ? saved.seasonalAttempts : {},
    };
  } catch {
    return freshProfile();
  }
}

function saveProfile() {
  try { localStorage.setItem("rumble-rivals-profile", JSON.stringify(profile)); } catch { /* Coins still work for this visit. */ }
}

const mysteryArenaWinsNeeded = 10;
const sharkLabWinsNeeded = 20;
const frozenAquariumWinsNeeded = 30;
const treehouseWinsNeeded = 40;
const spacePizzaWinsNeeded = 50;
function arenaChallengeWins() { return Math.max(0, profile.wins - profile.arenaWinsStart); }

function isUnlocked(type, id) {
  if (type === "stages") {
    const wins = arenaChallengeWins();
    if (id === "mystery") return wins >= mysteryArenaWinsNeeded;
    if (id === "sharklab") return wins >= sharkLabWinsNeeded;
    if (id === "frozenaquarium") return wins >= frozenAquariumWinsNeeded;
    if (id === "treehouse") return wins >= treehouseWinsNeeded;
    if (id === "pizzaplanet") return profile.spacePizzaUnlocked;
    return true;
  }
  return profile[type].includes(id);
}
function isSeasonalRewardVisible(fighter) {
  return !fighter.seasonal || profile.fighters.includes(fighter.id);
}
function seasonalAttemptsUsed(event) {
  const record = profile.seasonalAttempts?.[event.id];
  return record?.day === localCalendarDay() ? Math.max(0, Math.floor(record.used || 0)) : 0;
}
function seasonalAttemptsLeft(event) { return Math.max(0, 3 - seasonalAttemptsUsed(event)); }
function useSeasonalAttempt(event) {
  if (seasonalAttemptsLeft(event) <= 0) return false;
  profile.seasonalAttempts = { ...(profile.seasonalAttempts || {}), [event.id]: { day: localCalendarDay(), used: seasonalAttemptsUsed(event) + 1 } };
  saveProfile();
  return true;
}
function getUnlock(type, id) { return unlockCatalog.find((item) => item.type === type && item.id === id); }

const battleCutouts = {};
const cutoutSources = {
  "training-dummy": "assets/characters/cutouts/training-dummy-cutout.png",
  shellshock: "assets/characters/cutouts/sergeant-shellshock-cutout.png",
  pip: "assets/characters/cutouts/pip-cutout.png",
  professor: "assets/characters/cutouts/professor-trash-panda-cutout.png",
  bloop: "assets/characters/cutouts/bloop-cutout.png",
  ironbolt: "assets/characters/cutouts/captain-ironbolt-cutout.png",
  bolt: "assets/characters/cutouts/bolt-the-beaver-cutout.png",
  goblin: "assets/characters/cutouts/garbage-goblin-cutout.png",
  doomgear: "assets/characters/cutouts/doctor-doomgear-cutout.png",
  null: "assets/characters/cutouts/project-null-cutout.png",
  megameg: "assets/characters/cutouts/mecha-meg-cutout.png",
  kingcaw: "assets/characters/cutouts/king-caw-cutout.png",
  rexy: "assets/characters/cutouts/rexy-cutout.png?v=rexy-2",
  blue: "assets/characters/cutouts/blue-raptor-cutout.png?v=blue-1",
  fang: "assets/characters/cutouts/fang-komodo-cutout.png?v=fang-1",
  fierce: "assets/characters/cutouts/fierce-panther-cutout.png?v=fierce-1",
  snaptrap: "assets/characters/cutouts/snaptrap-cutout.png?v=snaptrap-1",
  talon: "assets/characters/cutouts/talon-eagle-cutout.png?v=talon-1",
  tusk: "assets/characters/cutouts/tusk-mammoth-cutout.png?v=tusk-1",
  cobra: "assets/characters/cutouts/king-cobra-realistic-cutout.png?v=cobra-2",
  blaze: "assets/characters/cutouts/blaze-the-dragon-cutout.png?v=blaze-2",
  axel: "assets/characters/axel-axolotl-real.png?v=real-1",
  hank: "assets/characters/hank-hippo-real.png?v=real-1",
  buzz: "assets/characters/buzz-bee-real.png?v=real-1",
  frost: "assets/characters/frost-polar-bear-real.png?v=real-1",
  bamboo: "assets/characters/bamboo-panda-real.png?v=real-1",
};
Object.entries(cutoutSources).forEach(([id, source]) => {
  const cutout = new Image();
  cutout.src = source;
  battleCutouts[id] = cutout;
});
const stageImages = {};
stages.filter((stage) => stage.art).forEach((stage) => {
  const image = new Image();
  image.src = stage.art;
  stageImages[stage.id] = image;
});
const trainingRoomImage = new Image();
trainingRoomImage.src = trainingStage.art;

let game = null;
let animationFrame = 0;
let keys = {};
let lastTime = 0;
let loadingTimer = null;
let hoveredFighter = null;
let chosenStage = stages[0];
let matchMode = "computer";
let playerOneChoice = null;
let activeSeasonalEvent = null;
let matchSettings = { difficulty: "normal", timer: 120, volume: .55 };
let profile = loadProfile();
let selectedUpgradeFighter = roster[0];
let settingsReturnScreen = "stages";
let musicContext = null;
let musicMasterGain = null;
let musicTimer = null;
let musicStep = 0;
let onlineMatch = {
  role: null,
  roomCode: null,
  remoteInput: {},
  previousRemoteInput: {},
  unlistenInput: null,
  battleStarted: false,
  lastStateAt: 0,
  lastInputAt: 0,
  inputNonce: 0,
  emoteNonce: 0,
  emoteText: "",
  handledResult: null,
  hostConfigured: false,
};

function isOnlineMatch() { return matchMode === "online-host" || matchMode === "online-guest"; }
function onlineIsHost() { return matchMode === "online-host"; }
function onlineIsGuest() { return matchMode === "online-guest"; }

function resetOnlineMatch() {
  if (onlineMatch.unlistenInput) onlineMatch.unlistenInput();
  onlineMatch = { role: null, roomCode: null, remoteInput: {}, previousRemoteInput: {}, unlistenInput: null, battleStarted: false, lastStateAt: 0, lastInputAt: 0, inputNonce: 0, emoteNonce: 0, emoteText: "", handledResult: null, hostConfigured: false };
}

function leaveOnlineMatch() {
  if (onlineMatch.role) window.RumbleOnline?.leave();
  resetOnlineMatch();
}

function showScreen(id) {
  screens.forEach((screen) => $(screen).classList.toggle("active", screen === id));
  if (id === "play-menu") {
    updateFavoriteSummary();
    $("seasonal-events-button").hidden = activeSeasonalEvents().length === 0;
  }
  const menuVisible = id === "stages" || id === "select";
  $("settings-button").classList.toggle("visible", menuVisible);
  $("boss-button").classList.toggle("visible", id === "stages");
}

function buildSeasonalEvents() {
  const grid = $("seasonal-event-grid");
  const events = activeSeasonalEvents();
  grid.innerHTML = "";
  events.forEach((event) => {
    const card = document.createElement("article");
    card.className = `seasonal-event-card ${event.id}`;
    if (event.kind === "bonus") {
      const monthName = seasonalMonthName(event);
      card.innerHTML = `<div class="seasonal-event-icon">${event.icon}</div><div><p class="eyebrow">${monthName} ${event.firstDay}–${event.lastDay}</p><h3>${event.name}</h3><p>${event.description}</p><p class="seasonal-reward">${event.rewardLine}</p><small>NO BOSS NEEDED — JUST PLAY!</small></div>`;
      const button = document.createElement("button");
      button.className = "big-button";
      button.textContent = event.buttonLabel;
      button.addEventListener("click", () => { activeSeasonalEvent = null; matchMode = "computer"; showScreen("stages"); });
      card.append(button);
      grid.append(card);
      return;
    }
    const rewardUnlocked = event.rewardId && profile.fighters.includes(event.rewardId);
    const attemptsLeft = seasonalAttemptsLeft(event);
    const rewardLabel = event.rewardId ? `${rewardUnlocked ? "✅ " : "🎁 "}${event.rewardName}` : event.rewardLine;
    card.innerHTML = `<div class="seasonal-event-icon">${event.icon}</div><div><p class="eyebrow">${seasonalMonthName(event)} ${event.firstDay}–${event.lastDay}</p><h3>${event.name}</h3><p>${event.description}</p><p class="seasonal-reward">REWARD: ${rewardLabel}</p><small>${rewardUnlocked ? "UNLOCKED FOREVER!" : `${attemptsLeft} OF 3 CHANCES LEFT TODAY`}</small></div>`;
    const button = document.createElement("button");
    button.className = "big-button";
    button.textContent = rewardUnlocked ? "REWARD UNLOCKED" : attemptsLeft ? "FIGHT THE BOSS" : "COME BACK TOMORROW";
    button.disabled = rewardUnlocked || attemptsLeft <= 0;
    button.addEventListener("click", () => {
      activeSeasonalEvent = event;
      matchMode = "seasonal-boss";
      playerOneChoice = null;
      buildRoster();
      showFighterSelection();
      showScreen("select");
    });
    card.append(button);
    grid.append(card);
  });
  if (!events.length) grid.innerHTML = "<p class=\"unlock-message\">There are no seasonal events today. Check back during Halloween or December 20–25!</p>";
}

function setOnlineLobbyMessage(message) {
  $("online-lobby-message").textContent = message;
}

function showOnlineLobby(flow = "host") {
  const joining = flow === "join";
  $("online-lobby-title").textContent = joining ? "Join your friend" : "Play with a friend";
  $("online-lobby-copy").textContent = joining ? "Type the code your friend made, then pick your fighter." : "Make a room code, share it with a friend, then choose the arena.";
  $("online-code-entry").hidden = !joining;
  $("online-room-code").hidden = true;
  $("online-create-button").hidden = joining;
  $("online-join-button").hidden = !joining;
  setOnlineLobbyMessage(window.RumbleOnline?.configured() ? "Only friends with the room code can join. No chat is used." : "Online play needs the free Firebase setup first. Ask Archer to add the Firebase settings file.");
  showScreen("online-lobby");
}

function showOnlineWaiting(room = window.RumbleOnline?.getRoom()) {
  const host = onlineIsHost();
  $("online-lobby-title").textContent = host ? "Your friend room is ready!" : "You joined the room!";
  $("online-lobby-copy").textContent = host ? "Share this code. Your friend can enter it from their game." : "Wait for your friend to finish choosing the arena and fighter.";
  $("online-code-entry").hidden = true;
  $("online-room-code").hidden = !host;
  $("online-room-code-value").textContent = onlineMatch.roomCode || "------";
  $("online-create-button").hidden = true;
  $("online-join-button").hidden = true;
  const hostReady = Boolean(room?.hostFighter);
  const guestReady = Boolean(room?.guestFighter);
  if (host && !onlineMatch.hostConfigured) {
    $("online-create-button").hidden = false;
    $("online-create-button").textContent = "CHOOSE ARENA";
    setOnlineLobbyMessage("Share the code, then choose your arena and fighter.");
  } else if (host && hostReady && !guestReady) {
    setOnlineLobbyMessage("Arena ready! Waiting for your friend to choose Player 2.");
  } else if (!host && hostReady && !guestReady) {
    setOnlineLobbyMessage("Your friend chose the arena. Pick Player 2 when the fighter screen opens.");
  } else {
    setOnlineLobbyMessage("Getting the arena ready...");
  }
  showScreen("online-lobby");
}

function onlineNickname() { return $("online-nickname").value; }

async function makeFriendRoom() {
  try {
    $("online-create-button").disabled = true;
    setOnlineLobbyMessage("Making your friend room...");
    const room = await window.RumbleOnline.createRoom(onlineNickname());
    matchMode = "online-host";
    resetOnlineMatch();
    onlineMatch.role = "host";
    onlineMatch.roomCode = room.code;
    showOnlineWaiting(room.room);
  } catch (error) {
    setOnlineLobbyMessage(error.message || "Could not make a friend room. Try again.");
  } finally {
    $("online-create-button").disabled = false;
  }
}

async function joinFriendRoom() {
  try {
    $("online-join-button").disabled = true;
    setOnlineLobbyMessage("Finding your friend's room...");
    const room = await window.RumbleOnline.joinRoom($("online-code-input").value, onlineNickname());
    matchMode = "online-guest";
    resetOnlineMatch();
    onlineMatch.role = "guest";
    onlineMatch.roomCode = room.code;
    showOnlineWaiting(room.room);
  } catch (error) {
    setOnlineLobbyMessage(error.message || "Could not join that room. Check the code and try again.");
  } finally {
    $("online-join-button").disabled = false;
  }
}

function chooseSetting(kind, value) {
  matchSettings[kind] = kind === "timer" ? (value === "none" ? null : Number(value)) : kind === "volume" ? Number(value) : value;
  if (kind === "volume" && musicMasterGain && musicContext) musicMasterGain.gain.setTargetAtTime(matchSettings.volume, musicContext.currentTime, .03);
  document.querySelectorAll(`.setting-choice[data-setting="${kind}"]`).forEach((button) => {
    button.classList.toggle("selected", button.dataset.value === value);
  });
}

function returnToCover() {
  cancelAnimationFrame(animationFrame);
  clearInterval(loadingTimer);
  keys = {};
  game = null;
  if (isOnlineMatch()) leaveOnlineMatch();
  matchMode = "computer";
  playerOneChoice = null;
  $("cover-card").classList.remove("loading");
  showScreen("cover");
}

function resetAllProgress() {
  profile = freshProfile();
  matchSettings = { difficulty: "normal", timer: 120, volume: .55 };
  chosenStage = stages[0];
  playerOneChoice = null;
  try { localStorage.removeItem("rumble-rivals-profile"); } catch { /* A fresh profile still works for this visit. */ }
  if (musicMasterGain && musicContext) musicMasterGain.gain.setTargetAtTime(matchSettings.volume, musicContext.currentTime, .03);
  document.querySelectorAll(".setting-choice").forEach((button) => {
    const value = button.dataset.value;
    const setting = button.dataset.setting;
    const selected = (setting === "difficulty" && value === matchSettings.difficulty)
      || (setting === "timer" && Number(value) === matchSettings.timer)
      || (setting === "volume" && Number(value) === matchSettings.volume);
    button.classList.toggle("selected", selected);
  });
  buildRoster();
  buildStages();
  buildFavorites();
  buildUnlocks();
  buildUpgrades();
  buildAchievements();
  updateCoinDisplays();
  returnToCover();
}

function updateCoinDisplays() {
  $("settings-coins").textContent = profile.coins;
  $("unlock-coins").textContent = profile.coins;
  $("upgrade-settings-coins").textContent = profile.coins;
  $("upgrade-coins").textContent = profile.coins;
  $("unlock-menu-button").title = `You have ${profile.coins} coins`;
  $("upgrade-menu-button").title = `You have ${profile.coins} coins`;
}

function updateTrophyDisplay() {
  $("settings-trophies").textContent = profile.trophies;
}

function recordBattleTrophy(playerWon) {
  if (game.mode === "training") return "";
  const hadTrophy = profile.trophies > 0;
  const trophyReward = playerWon ? (fireworkFrenzyActive() ? 2 : 1) : -1;
  profile.trophies = Math.max(0, profile.trophies + trophyReward);
  updateTrophyDisplay();
  return playerWon ? `+${trophyReward} 🏆 ${trophyReward === 1 ? "trophy" : "trophies"}!${trophyReward === 2 ? " FIREWORK FRENZY!" : ""}` : hadTrophy ? "-1 🏆 trophy." : "No trophies to lose.";
}

function hasAchievement(id) { return profile.achievements.includes(id); }

function awardAchievement(id, earned) {
  if (!hasAchievement(id)) { profile.achievements.push(id); earned.push(id); }
}

function buildAchievements() {
  const grid = $("achievements-grid");
  grid.innerHTML = "";
  achievementCatalog.forEach((achievement) => {
    const earned = hasAchievement(achievement.id);
    const card = document.createElement("article");
    card.className = "achievement-card";
    card.classList.toggle("earned", earned);
    const badge = earned && achievement.art ? `<img src="${achievement.art}" alt="${achievement.name} badge" />` : earned ? achievement.icon : "🔒";
    card.innerHTML = `<span class="badge badge-${achievement.id}">${badge}</span><h3>${earned ? achievement.name : "???"}</h3><p>${earned ? achievement.description : "Keep playing to discover this achievement."}</p><small>${earned ? "EARNED!" : "LOCKED"}</small>`;
    grid.append(card);
  });
  $("achievement-count").textContent = `${profile.achievements.length} of ${achievementCatalog.length} achievements earned`;
}

function buyUnlock(item) {
  const message = $("unlock-message");
  if (isUnlocked(item.type, item.id)) return;
  if (profile.coins < item.cost) {
    message.textContent = `You need ${item.cost - profile.coins} more coins for this one!`;
    return;
  }
  profile.coins -= item.cost;
  profile[item.type].push(item.id);
  saveProfile();
  updateCoinDisplays();
  buildRoster();
  buildStages();
  buildFavorites();
  buildUnlocks();
  buildUpgrades();
  const entry = (item.type === "fighters" ? roster : stages).find((thing) => thing.id === item.id);
  message.textContent = `${entry.name} is unlocked!`;
}

function buildUnlocks() {
  const grid = $("unlock-grid");
  grid.innerHTML = "";
  unlockCatalog.forEach((item) => {
    const entry = (item.type === "fighters" ? roster : stages).find((thing) => thing.id === item.id);
    const unlocked = isUnlocked(item.type, item.id);
    const card = document.createElement("article");
    card.className = "unlock-card";
    card.innerHTML = `<img src="${entry.art}" alt="${entry.name}" /><h3>${entry.name}</h3><p>${item.kind}</p>`;
    const button = document.createElement("button");
    button.innerHTML = unlocked ? "UNLOCKED!" : `UNLOCK · ${coinIcon} ${item.cost}`;
    button.disabled = unlocked;
    button.addEventListener("click", () => buyUnlock(item));
    card.append(button);
    grid.append(card);
  });
}

function getWeaponLevel(fighterId) {
  const path = weaponUpgradePaths[fighterId] || [];
  const savedLevel = Number(profile.upgrades?.[fighterId]) || 0;
  return Math.max(0, Math.min(path.length - 1, savedLevel));
}

function getRangeWeapon(fighter) {
  const path = weaponUpgradePaths[fighter.id];
  return path ? path[getWeaponLevel(fighter.id)].name : fighter.range;
}

function buildUpgrades() {
  const grid = $("upgrade-fighter-grid");
  grid.innerHTML = "";
  roster.filter(isSeasonalRewardVisible).forEach((fighter) => {
    const unlocked = isUnlocked("fighters", fighter.id);
    const level = getWeaponLevel(fighter.id);
    const card = document.createElement("button");
    card.className = "upgrade-fighter-card";
    card.style.background = fighter.cardBackground || `linear-gradient(145deg, ${fighter.color}, #263663)`;
    card.classList.toggle("selected", selectedUpgradeFighter.id === fighter.id);
    card.innerHTML = `<img src="${fighter.art}" alt="${fighter.name}" /><strong>${fighter.name}</strong><span>${unlocked ? `${getRangeWeapon(fighter)} · Level ${level + 1}` : "🔒 Unlock this fighter first"}</span>`;
    card.disabled = !unlocked;
    if (unlocked) {
      card.addEventListener("click", () => {
        selectedUpgradeFighter = fighter;
        buildUpgrades();
      });
    }
    grid.append(card);
  });
  buildUpgradeDetails();
}

function buildUpgradeDetails() {
  const fighter = selectedUpgradeFighter;
  const path = weaponUpgradePaths[fighter.id];
  const level = getWeaponLevel(fighter.id);
  const current = path[level];
  const next = path[level + 1];
  const details = $("upgrade-details");
  const levels = path.map((upgrade, index) => {
    const status = index < level ? "completed" : index === level ? "current" : "next";
    const label = index === 0 ? "START" : `${coinIcon} ${upgrade.cost}`;
    return `<div class="weapon-level ${status}"><strong>${index + 1}. ${upgrade.name}</strong><span>${upgrade.description}</span><small>${index < level ? "UPGRADED!" : index === level ? "CURRENT WEAPON" : label}</small></div>`;
  }).join("");
  details.innerHTML = `<img src="${fighter.art}" alt="${fighter.name}" /><div class="upgrade-details-copy"><p class="eyebrow">${fighter.name.toUpperCase()}</p><h3>${current.name}</h3><p>Range weapon level ${level + 1} of ${path.length}</p><div class="weapon-levels">${levels}</div></div>`;
  const action = document.createElement("button");
  action.className = "upgrade-buy-button";
  action.innerHTML = next ? `UPGRADE TO ${next.name.toUpperCase()} · ${coinIcon} ${next.cost}` : "MAX WEAPON LEVEL!";
  action.disabled = !next;
  if (next) action.addEventListener("click", () => buyWeaponUpgrade(fighter));
  details.append(action);
}

function buyWeaponUpgrade(fighter) {
  const path = weaponUpgradePaths[fighter.id];
  const level = getWeaponLevel(fighter.id);
  const next = path[level + 1];
  const message = $("upgrade-message");
  if (!next) return;
  if (profile.coins < next.cost) {
    message.textContent = `You need ${next.cost - profile.coins} more coins for ${next.name}!`;
    return;
  }
  profile.coins -= next.cost;
  profile.upgrades[fighter.id] = level + 1;
  saveProfile();
  updateCoinDisplays();
  buildUpgrades();
  message.textContent = `${fighter.name}'s ${next.name} is ready for battle!`;
}

function playMusicNote(frequency, time, length, volume, wave = "triangle") {
  if (!frequency || !musicContext) return;
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, time);
  gain.gain.setValueAtTime(.0001, time);
  gain.gain.exponentialRampToValueAtTime(volume, time + .015);
  gain.gain.exponentialRampToValueAtTime(.0001, time + length);
  oscillator.connect(gain).connect(musicMasterGain || musicContext.destination);
  oscillator.start(time);
  oscillator.stop(time + length + .02);
}

function playMusicKick(time) {
  if (!musicContext) return;
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.frequency.setValueAtTime(135, time);
  oscillator.frequency.exponentialRampToValueAtTime(52, time + .12);
  gain.gain.setValueAtTime(.07, time);
  gain.gain.exponentialRampToValueAtTime(.0001, time + .14);
  oscillator.connect(gain).connect(musicMasterGain || musicContext.destination);
  oscillator.start(time);
  oscillator.stop(time + .16);
}

function playMusicSnare(time) {
  if (!musicContext) return;
  const oscillator = musicContext.createOscillator();
  const gain = musicContext.createGain();
  oscillator.type = "square";
  oscillator.frequency.setValueAtTime(185, time);
  oscillator.frequency.exponentialRampToValueAtTime(90, time + .06);
  gain.gain.setValueAtTime(.025, time);
  gain.gain.exponentialRampToValueAtTime(.0001, time + .09);
  oscillator.connect(gain).connect(musicMasterGain || musicContext.destination);
  oscillator.start(time);
  oscillator.stop(time + .11);
}

function playPowerUpSound() {
  if (!musicContext || matchSettings.volume <= 0) return;
  const time = musicContext.currentTime + .01;
  const note = (frequency, delay, length, volume, wave = "triangle") => playMusicNote(frequency, time + delay, length, volume, wave);
  note(940, 0, .045, .055, "square");
  note(1260, .045, .07, .04, "square");
}

function playRexyRoar() {
  if (!musicContext || matchSettings.volume <= 0) return;
  const time = musicContext.currentTime + .01;
  playMusicNote(128, time, .22, .075, "sawtooth");
  playMusicNote(94, time + .08, .28, .07, "sawtooth");
  playMusicNote(72, time + .16, .34, .05, "triangle");
}

function startMusic() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  if (!musicContext) {
    musicContext = new AudioEngine();
    musicMasterGain = musicContext.createGain();
    musicMasterGain.gain.value = matchSettings.volume;
    musicMasterGain.connect(musicContext.destination);
  }
  musicContext.resume();
  if (musicTimer) return;
  const melody = [659, 0, 784, 880, 784, 0, 659, 587, 659, 0, 784, 988, 880, 0, 784, 0, 740, 0, 659, 740, 784, 0, 880, 784, 659, 0, 587, 659, 740, 0, 659, 0];
  const bass = [131, 131, 147, 147, 165, 165, 147, 147];
  const chords = [[262, 330, 392], [294, 370, 440], [330, 415, 494], [294, 370, 440]];
  const playStep = () => {
    const time = musicContext.currentTime + .03;
    const step = musicStep % 32;
    playMusicNote(melody[step], time, .17, .035);
    if (step % 4 === 0) {
      playMusicNote(bass[step / 4], time, .2, .045, "sawtooth");
      playMusicKick(time);
    }
    if (step % 8 === 0) chords[(step / 8) % chords.length].forEach((note) => playMusicNote(note, time, .38, .009, "sine"));
    if (step % 4 === 2) playMusicSnare(time);
    if (step % 2 === 1) playMusicNote(1568, time, .035, .008, "square");
    musicStep++;
  };
  playStep();
  musicTimer = window.setInterval(playStep, 220);
}

function buildRoster() {
  const grid = $("character-grid");
  grid.innerHTML = "";
  roster.filter(isSeasonalRewardVisible).forEach((fighter) => {
    const card = document.createElement("button");
    const unlocked = isUnlocked("fighters", fighter.id);
    const unlock = getUnlock("fighters", fighter.id);
    card.className = "character-card";
    card.style.background = fighter.cardBackground || `linear-gradient(145deg, ${fighter.color}, #263663)`;
    card.classList.toggle("real-background-card", Boolean(fighter.cardBackground));
    const pickedByPlayerOne = matchMode === "two-player" && playerOneChoice?.id === fighter.id;
    card.innerHTML = `<img class="fighter-portrait" src="${fighter.art}" alt="${fighter.name}" />${pickedByPlayerOne ? '<span class="player-one-tag">PLAYER 1</span>' : ""}<div class="fighter-card-info"><h3>${fighter.name}</h3><p>${unlocked ? fighter.special : `🔒 LOCKED · ${coinIcon} ${unlock.cost}`}</p></div>`;
    card.classList.toggle("picked-player-one", pickedByPlayerOne);
    if (!unlocked) {
      card.classList.add("locked");
      card.disabled = true;
    } else {
      card.addEventListener("click", () => chooseFighter(fighter));
    }
    const rememberHoveredFighter = () => {
      hoveredFighter = fighter;
      grid.querySelectorAll(".character-card").forEach((otherCard) => otherCard.classList.remove("selected-hover"));
      card.classList.add("selected-hover");
    };
    card.addEventListener("mouseenter", rememberHoveredFighter);
    card.addEventListener("pointerenter", rememberHoveredFighter);
    card.addEventListener("mouseover", rememberHoveredFighter);
    card.addEventListener("mouseleave", () => {
      if (hoveredFighter === fighter) hoveredFighter = null;
      card.classList.remove("selected-hover");
    });
    card.addEventListener("focus", () => { hoveredFighter = fighter; });
    card.addEventListener("blur", () => { if (hoveredFighter === fighter) hoveredFighter = null; });
    grid.append(card);
  });
}

function showFighterSelection() {
  const training = matchMode === "training";
  const boss = matchMode === "boss";
  const seasonalBoss = matchMode === "seasonal-boss" && activeSeasonalEvent;
  const choosingPlayerTwo = matchMode === "two-player" && playerOneChoice;
  const onlineHost = onlineIsHost();
  const onlineGuest = onlineIsGuest();
  $("fighter-select-eyebrow").textContent = seasonalBoss ? `${activeSeasonalEvent.icon} SEASONAL BOSS` : boss ? "BOSS BATTLE · 5× COINS" : training ? "TRAINING ROOM" : onlineHost ? "FRIEND BATTLE · PLAYER 1" : onlineGuest ? "FRIEND BATTLE · PLAYER 2" : choosingPlayerTwo ? "PLAYER 2: CHOOSE YOUR FIGHTER" : matchMode === "two-player" ? "PLAYER 1: CHOOSE YOUR FIGHTER" : "CHOOSE YOUR FIGHTER";
  $("fighter-select-heading").textContent = seasonalBoss ? `Pick a hero to face the ${activeSeasonalEvent.boss.name}` : boss ? "Pick a hero to face Mega Doomgear" : training ? "Pick a fighter to train" : onlineHost ? "Choose Player 1" : onlineGuest ? "Choose Player 2" : choosingPlayerTwo ? "Player 2, pick your fighter!" : matchMode === "two-player" ? "Player 1, pick your fighter!" : "Who will you play?";
  $("fighter-select-help").textContent = seasonalBoss ? `${seasonalAttemptsLeft(activeSeasonalEvent)} of 3 chances left today. ${activeSeasonalEvent.rewardName ? `Beat the boss to unlock ${activeSeasonalEvent.rewardName} forever!` : `Beat the boss to earn ${activeSeasonalEvent.coinMultiplier}× coins!`}` : boss ? "Mega Doomgear has 200 health, 1.5× damage, and is 3× bigger. Win to earn five times the coins!" : training ? "Practice your moves on a dummy. No coins or wins are used." : onlineHost ? "Pick your fighter. Then your friend picks Player 2 using the room code." : onlineGuest ? "Your friend picked the arena. Pick your fighter to start the online battle!" : choosingPlayerTwo ? "Player 2: click any unlocked fighter. Then the battle starts!" : matchMode === "two-player" ? "Player 1 goes first. Click a fighter, then Player 2 picks one." : "Click a fighter to play. The computer will pick a rival!";
}

function chooseFighter(fighter) {
  if (matchMode === "training") { startBattle(fighter, trainingDummy); return; }
  if (matchMode === "boss") { startBattle(fighter, bossEnemy); return; }
  if (matchMode === "seasonal-boss" && activeSeasonalEvent) {
    if (!useSeasonalAttempt(activeSeasonalEvent)) { buildSeasonalEvents(); showScreen("seasonal-events"); return; }
    startBattle(fighter, activeSeasonalEvent.boss);
    return;
  }
  if (onlineIsHost()) {
    onlineMatch.hostConfigured = true;
    window.RumbleOnline.setHostSetup({ stageId: chosenStage.id, settings: { difficulty: matchSettings.difficulty, timer: matchSettings.timer }, hostFighter: fighter.id, hostWeaponLevel: getWeaponLevel(fighter.id) })
      .then(() => showOnlineWaiting())
      .catch((error) => { showOnlineWaiting(); setOnlineLobbyMessage(error.message || "Could not save your fighter choice."); });
    return;
  }
  if (onlineIsGuest()) {
    window.RumbleOnline.setGuestFighter(fighter.id, getWeaponLevel(fighter.id))
      .then(() => showOnlineWaiting())
      .catch((error) => { showOnlineWaiting(); setOnlineLobbyMessage(error.message || "Could not save your fighter choice."); });
    return;
  }
  if (matchMode !== "two-player") {
    startBattle(fighter);
    return;
  }
  if (!playerOneChoice) {
    playerOneChoice = fighter;
    hoveredFighter = null;
    buildRoster();
    showFighterSelection();
    return;
  }
  startBattle(playerOneChoice, fighter);
}

function buildStages() {
  const grid = $("stage-grid");
  grid.innerHTML = "";
  stages.forEach((stage) => {
    const card = document.createElement("button");
    const unlocked = isUnlocked("stages", stage.id);
    card.className = "stage-card";
    const winsNeeded = stage.id === "mystery" ? mysteryArenaWinsNeeded : stage.id === "sharklab" ? sharkLabWinsNeeded : stage.id === "frozenaquarium" ? frozenAquariumWinsNeeded : stage.id === "treehouse" ? treehouseWinsNeeded : stage.id === "pizzaplanet" ? spacePizzaWinsNeeded : null;
    const isMystery = (stage.id === "mystery" || stage.id === "sharklab" || stage.id === "frozenaquarium" || stage.id === "treehouse" || stage.id === "pizzaplanet") && !unlocked;
    const isWinLocked = winsNeeded !== null && !unlocked;
    card.innerHTML = isMystery
      ? `<div class="mystery-stage-art" aria-hidden="true">?</div><strong>???</strong><span class="mystery-stage-lock">UNLOCKS IN ${winsNeeded} WINS</span>`
      : stage.art
      ? `<img src="${stage.art}" alt="${stage.name}" /><strong>${stage.name}</strong><span class="${isWinLocked ? "stage-win-lock" : ""}">${isWinLocked ? `UNLOCKS IN ${winsNeeded} WINS` : stage.description}</span>`
      : `<div class="stage-basic-art" aria-hidden="true"></div><strong>${stage.name}</strong><span>${stage.description}</span>`;
    if (!unlocked) {
      card.classList.add("locked");
      card.disabled = true;
    } else {
      card.addEventListener("click", () => { chosenStage = stage; showFighterSelection(); buildRoster(); showScreen("select"); });
    }
    grid.append(card);
  });
}

function updateFavoriteSummary() {
  const fighter = roster.find((entry) => entry.id === profile.favoriteFighter);
  const stage = stages.find((entry) => entry.id === profile.favoriteStage);
  $("favorite-summary").textContent = fighter || stage
    ? `⭐ Fighter: ${fighter?.name || "Not picked"} · Arena: ${stage?.name || "Not picked"}`
    : "⭐ Pick your favorite fighter and arena!";
}

function buildFavorites() {
  const fighterGrid = $("favorite-fighter-grid");
  const stageGrid = $("favorite-stage-grid");
  fighterGrid.innerHTML = "";
  stageGrid.innerHTML = "";
  roster.filter((fighter) => isUnlocked("fighters", fighter.id)).forEach((fighter) => {
    const choice = document.createElement("button");
    const selected = profile.favoriteFighter === fighter.id;
    choice.className = "favorite-choice";
    choice.classList.toggle("selected", selected);
    choice.innerHTML = `<img src="${fighter.art}" alt="${fighter.name}" /><span><strong>${selected ? "⭐ " : ""}${fighter.name}</strong><small>${selected ? "YOUR FAVORITE" : "MAKE FAVORITE"}</small></span>`;
    choice.addEventListener("click", () => {
      profile.favoriteFighter = fighter.id;
      saveProfile();
      updateFavoriteSummary();
      buildFavorites();
    });
    fighterGrid.append(choice);
  });
  stages.filter((stage) => isUnlocked("stages", stage.id)).forEach((stage) => {
    const choice = document.createElement("button");
    const selected = profile.favoriteStage === stage.id;
    choice.className = "favorite-choice";
    choice.classList.toggle("selected", selected);
    choice.innerHTML = `<img src="${stage.art}" alt="${stage.name}" /><span><strong>${selected ? "⭐ " : ""}${stage.name}</strong><small>${selected ? "YOUR FAVORITE" : "MAKE FAVORITE"}</small></span>`;
    choice.addEventListener("click", () => {
      profile.favoriteStage = stage.id;
      saveProfile();
      updateFavoriteSummary();
      buildFavorites();
    });
    stageGrid.append(choice);
  });
}

function showFighterDetails(fighter) {
  const details = $("fighter-details");
  details.classList.add("active");
  details.style.background = fighter.cardBackground || `linear-gradient(125deg, ${fighter.color}, #2a3265)`;
  details.innerHTML = `<img src="${fighter.art}" alt="${fighter.name}" /><div><h3>${fighter.name}'s Stats</h3><div class="fighter-stats"><span>❤️ Health: ${fighter.health || 100}</span><span>💥 Damage: ${fighter.power}</span><span>⚡ Speed: ${Math.round(fighter.speed * 10)}/100</span><span>👊 Melee: ${fighter.attack}</span><span>🎯 Range: ${getRangeWeapon(fighter)}</span><span>✨ Special: ${fighter.special}</span></div></div>`;
}

function startLoading() {
  startMusic();
  showScreen("cover");
  clearInterval(loadingTimer);
  $("cover-card").classList.add("loading");
  $("cover-progress-bar").style.width = "0%";
  $("cover-loading-percent").textContent = "0%";
  const messages = ["Waking up Bloop's fishbowl...", "Polishing Rumble's tank treads...", "Charging Project Null's crystals...", "Professor Trash Panda is checking the buttons...", "Opening the arena gates!"];
  let progress = 0;
  loadingTimer = setInterval(() => {
    progress += Math.random() * 12 + 4;
    const shownProgress = Math.min(progress, 100);
    $("cover-progress-bar").style.width = `${shownProgress}%`;
    $("cover-loading-percent").textContent = `${Math.round(shownProgress)}%`;
    $("cover-loading-message").textContent = messages[Math.min(messages.length - 1, Math.floor(progress / 22))];
    if (progress >= 100) {
      clearInterval(loadingTimer);
      setTimeout(() => { $("cover-card").classList.remove("loading"); showScreen("play-menu"); }, 350);
    }
  }, 180);
}

function getArena() {
  return stageArenas[game?.stage?.id] || fallbackArena;
}

function makeFighter(data, x, facing, floor) {
  const maxHealth = data.health || 100;
  return { ...data, x, y: floor, vy: 0, facing, health: maxHealth, maxHealth, lives: 3, jumpsLeft: 2, cooldown: 0, invincible: 0, attackTimer: 0, attackSlide: 0, specialTimer: 0, hitFlash: 0, omegaTimer: 0, omegaCooldown: 0, powerUp: null, powerUpTimer: 0, frozenTimer: 0, starTimer: 0, shieldEnergy: 60, shieldExhausted: false, shielding: false, super: 0, aiTimer: 0, action: "idle", walking: false, emoteText: "", emoteTimer: 0, anim: Math.random() * 6.28 };
}

function updateBattleStatus() {
  const modeLabel = game.mode === "seasonal-boss" ? "SEASONAL BOSS" : game.mode === "boss" ? "BOSS BATTLE" : game.mode === "training" ? "TRAINING" : game.mode === "two-player" ? "2 PLAYER" : game.mode === "online-host" || game.mode === "online-guest" ? "ONLINE FRIEND" : difficultyModes[game.settings.difficulty].label;
  if (game.timeLeftMs === null) {
    $("round-text").innerHTML = `${modeLabel} · NO TIMER · ${coinIcon} ${profile.coins} · 🏆 ${profile.trophies}`;
    return;
  }
  const totalSeconds = Math.ceil(game.timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  $("round-text").innerHTML = `${modeLabel} · ${minutes}:${seconds} · ${coinIcon} ${profile.coins} · 🏆 ${profile.trophies}`;
}

function updateBattleTimer(dt) {
  if (game.timeLeftMs === null) return false;
  game.timeLeftMs = Math.max(0, game.timeLeftMs - dt);
  updateBattleStatus();
  if (game.timeLeftMs === 0) {
    endBattle(game.player.health >= game.enemy.health, true);
    return true;
  }
  return false;
}

function startBattle(selected, opponent = null) {
  cancelAnimationFrame(animationFrame);
  const choices = roster.filter((fighter) => fighter.id !== selected.id && isUnlocked("fighters", fighter.id));
  const enemy = opponent || choices[Math.floor(Math.random() * choices.length)];
  const stage = matchMode === "training" ? trainingStage : matchMode === "boss" ? bossStage : matchMode === "seasonal-boss" && activeSeasonalEvent ? stages.find((entry) => entry.id === activeSeasonalEvent.stageId) : chosenStage;
  const arena = stageArenas[stage.id] || fallbackArena;
  game = { mode: matchMode, seasonalEventId: activeSeasonalEvent?.id || null, player: makeFighter(selected, 230, 1, arena.floor), enemy: makeFighter(enemy, 810, -1, arena.floor), stage, settings: { ...matchSettings }, timeLeftMs: matchMode === "training" ? null : matchSettings.timer === null ? null : matchSettings.timer * 1000, projectiles: [], tankCharges: [], hazards: [], hazardDropMs: 9000 + Math.random() * 3500, apples: [], appleDropMs: 10000, goldenAppleDropMs: Math.random() < .15 ? 15000 + Math.random() * 20000 : null, powerUps: [], powerUpDropMs: randomPowerUpDelay(), collectedPowerUps: new Set(), playerTookDamage: false, finalHitWasSpecial: false, sparks: [], ended: false, messageTimer: 0, message: "3", countdownMs: 3000, countdownText: "3", startedAt: null };
  if (matchMode === "boss") { game.enemy.maxHealth = 200; game.enemy.health = 200; }
  if (matchMode === "seasonal-boss") {
    game.enemy.maxHealth = 300; game.enemy.health = 300;
    game.player.lives = 1; game.enemy.lives = 1;
    if (activeSeasonalEvent?.id !== "thanksgiving") { game.appleDropMs = Infinity; game.goldenAppleDropMs = null; }
    game.powerUpDropMs = Infinity;
  }
  const onlineRoom = window.RumbleOnline?.getRoom();
  const online = game.mode === "online-host" || game.mode === "online-guest";
  $("player-name").textContent = game.mode === "two-player" ? `P1 · ${selected.name.toUpperCase()}` : online ? `P1 · ${(onlineRoom?.hostName || selected.name).toUpperCase()}` : selected.name.toUpperCase();
  $("enemy-name").textContent = game.mode === "two-player" ? `P2 · ${enemy.name.toUpperCase()}` : online ? `P2 · ${(onlineRoom?.guestName || enemy.name).toUpperCase()}` : enemy.name.toUpperCase();
  $("controls-card").innerHTML = game.mode === "two-player"
    ? "<strong>Player 1:</strong> Arrow Keys move/jump · A melee · S range · Q special · W Omega · E shield &nbsp; <strong>Player 2:</strong> J/L move · I jump · F melee · G range · R special · U Omega · Y shield"
    : online
      ? `<strong>${onlineIsHost() ? "Your controls" : "Your controls"}:</strong> Arrow Keys move/jump · <b>A</b> melee · <b>S</b> range · <b>Q</b> special · <b>W</b> Omega · <b>E</b> shield · <strong>Friend battle:</strong> ${onlineIsHost() ? "you are Player 1" : "you are Player 2"}`
    : "<strong>Controls:</strong> Arrow Keys move · <b>↑</b> jump twice to reach platforms · <b>A</b> melee · <b>S</b> range · <b>Q</b> special · <b>W</b> Omega Mode (Project Null) · <b>E</b> shield (hold up to 1 second)";
  playerOneChoice = null;
  $("player-health").style.width = "100%"; $("enemy-health").style.width = "100%";
  updateLives();
  updateBattleStatus();
  showScreen("battle");
  $("battle-message").textContent = "3";
  $("battle-message").classList.add("show");
  lastTime = performance.now();
  animationFrame = requestAnimationFrame(loop);
}

function doAttack(who, type) {
  if (!game || game.ended || who.cooldown > 0) return;
  const isPlayer = who === game.player;
  const enemy = isPlayer ? game.enemy : game.player;
  let damage = type === "heavy" ? who.power + 5 : type === "special" ? who.power + 9 : type === "super" ? who.power + 18 : who.power;
  let reach = type === "range" ? 560 : type === "special" ? 250 : type === "super" ? 650 : type === "heavy" ? 120 : 86;
  if (who.id === "rexy" && type === "melee") reach = 120;
  if (who.id === "rexy" && type === "special") { damage += 6; reach = 155; }
  if (who.id === "talon" && type === "special") { damage += 3; reach = 330; }
  if (who.id === "tusk" && type === "special") { damage += 5; reach = 225; }
  if (who.id === "cobra" && type === "special") { damage += 5; reach = 285; }
  const weaponLevel = Number.isFinite(who.weaponLevel) ? who.weaponLevel : getWeaponLevel(who.id);
  if (type === "range") { damage += weaponLevel * 5; reach += weaponLevel * 45; }
  if (type === "melee" && who.powerUp === "sword") damage += who.power;
  if (type === "range" && who.powerUp === "pistol") damage += 12;
  if (who.omegaTimer > 0) { damage += 7; reach += 70; }
  if (who.boss) damage = Math.round(damage * (who.eventBoss ? 2 : 1.5));
  if (sharkWeekActive() && (who.id === "bloop" || who.id === "megameg")) damage = Math.round(damage * 1.5);
  if (type === "range") {
    const projectileOrigin = who.id === "shellshock"
      ? { x: who.x + who.facing * 84, y: who.y - 112 }
      : who.id === "rexy"
        ? { x: who.x + who.facing * 82, y: who.y - 70 }
      : who.id === "blue"
          ? { x: who.x + who.facing * 64, y: who.y - 52 }
      : who.id === "fang"
          ? { x: who.x + who.facing * 72, y: who.y - 48 }
      : who.id === "fierce"
          ? { x: who.x + who.facing * 68, y: who.y - 48 }
        : who.id === "snaptrap"
          ? { x: who.x + who.facing * 66, y: who.y - 64 }
        : who.id === "talon"
          ? { x: who.x + who.facing * 64, y: who.y - 76 }
        : who.id === "tusk"
          ? { x: who.x + who.facing * 82, y: who.y - 60 }
        : who.id === "cobra"
          ? { x: who.x + who.facing * 58, y: who.y - 88 }
      : who.id === "blaze"
          ? { x: who.x + who.facing * 72, y: who.y - 48 }
        : who.id === "axel"
          ? { x: who.x + who.facing * 62, y: who.y - 64 }
        : who.id === "hank"
          ? { x: who.x + who.facing * 80, y: who.y - 62 }
        : who.id === "buzz"
          ? { x: who.x + who.facing * 48, y: who.y - 78 }
        : who.id === "frost"
          ? { x: who.x + who.facing * 70, y: who.y - 68 }
        : who.id === "bamboo"
          ? { x: who.x + who.facing * 68, y: who.y - 65 }
        : { x: who.x + who.facing * 40, y: who.y - 35 };
    const verticalAim = (speed) => {
      if (who.id !== "shellshock") return 0;
      const travelFrames = Math.max(7, Math.abs(enemy.x - projectileOrigin.x) / speed);
      return Math.max(-5, Math.min(5, ((enemy.y - 38) - projectileOrigin.y) / travelFrames));
    };
    if (who.powerUp === "pistol") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * 23, vy: verticalAim(23), owner: who, damage, color: "#fff2a8", life: 62, size: 8, gunBullet: true, bulletColor: "#fff2a8", bulletLength: 2.4 });
      burst(projectileOrigin.x, projectileOrigin.y, "#fff2a8", 8);
    } else if (who.id === "pip") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (14 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#d69c45",
        life: 70,
        size: 13 + weaponLevel * 3,
        granolaBar: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#f5cf70", 7);
    } else if (who.id === "professor") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (13 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#a9bcc4",
        life: 70,
        size: 14 + weaponLevel * 4,
        metalGear: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#d7e5e6", 8);
    } else if (who.id === "bloop") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (11 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#71d9ff",
        life: 74,
        size: 17 + weaponLevel * 5,
        bubble: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#a9efff", 8);
    } else if (who.id === "ironbolt") {
      [-7, 0, 7].forEach((spread, index) => {
        const middleBullet = index === 1;
        game.projectiles.push({
          x: projectileOrigin.x,
          y: projectileOrigin.y + spread,
          vx: who.facing * (18 + weaponLevel * 2),
          owner: who,
          damage: middleBullet ? damage : 0,
          color: "#ffe56e",
          life: 56,
          size: 7,
          gunBullet: true,
          visualOnly: !middleBullet,
          bulletColor: "#ffe56e",
          bulletLength: 1.45
        });
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#ffe56e", 8);
    } else if (who.id === "bolt") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (13 + weaponLevel * 2),
        owner: who,
        damage: damage + 7,
        color: "#c7d4d8",
        life: 72,
        size: 15 + weaponLevel * 4,
        flyingWrench: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#d9ebee", 7);
    } else if (who.id === "goblin") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (12 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#d84f4a",
        life: 70,
        size: 14 + weaponLevel * 4,
        sodaCan: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#ff7061", 7);
    } else if (who.id === "doomgear") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (14 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#ae69ff",
        life: 70,
        size: 15 + weaponLevel * 4,
        electricGear: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#c884ff", 10);
    } else if (who.id === "null") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (15 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#6fffe8",
        life: 72,
        size: 15 + weaponLevel * 5,
        crystalShard: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#75fff0", 10);
    } else if (who.id === "megameg") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (12 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#3daeff",
        life: 76,
        size: 18 + weaponLevel * 5,
        plasmaTornado: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#55ccff", 12);
    } else if (who.id === "kingcaw") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (16 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#222735",
        life: 70,
        size: 17 + weaponLevel * 4,
        blackFeather: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#7f729b", 7);
    } else if (who.id === "rexy") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (10 + weaponLevel * 2),
        owner: who,
        damage: damage + 5 + weaponLevel * 3,
        color: "#9b6e46",
        life: 82,
        size: 19 + weaponLevel * 5,
        fossilBoulder: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#e6c47a", 12);
    } else if (who.id === "blue") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (18 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#4c4037",
        life: 62,
        size: 14 + weaponLevel * 4,
        blackFeather: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#cdbb98", 7);
    } else if (who.id === "fang") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (12 + weaponLevel * 2),
        owner: who,
        damage: damage + weaponLevel * 3,
        color: "#91df4c",
        life: 58,
        size: 15 + weaponLevel * 4,
        venomSpit: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#bbf573", 8);
    } else if (who.id === "fierce") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (17 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#aab6ff",
        life: 62,
        size: 15 + weaponLevel * 4,
        shadowClaw: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#afbbff", 8);
    } else if (who.id === "snaptrap") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (14 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#7fce4f",
        life: 68,
        size: 16 + weaponLevel * 4,
        leafSlash: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#b5ef71", 8);
    } else if (who.id === "talon") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (18 + weaponLevel * 2),
        owner: who,
        damage,
        color: "#f5e4aa",
        life: 66,
        size: 15 + weaponLevel * 4,
        eagleFeather: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#fff2c5", 8);
    } else if (who.id === "tusk") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (11 + weaponLevel * 2),
        owner: who,
        damage: damage + 3 + weaponLevel * 3,
        color: "#e4f7ff",
        life: 74,
        size: 18 + weaponLevel * 5,
        snowball: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#d7f2ff", 10);
    } else if (who.id === "cobra") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * (13 + weaponLevel * 2),
        owner: who,
        damage: damage + weaponLevel * 3,
        color: "#8ee84a",
        life: 66,
        size: 16 + weaponLevel * 5,
        cobraVenom: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#d7ff79", 9);
    } else if (who.id === "blaze") {
      game.projectiles.push({
        x: projectileOrigin.x,
        y: projectileOrigin.y,
        vx: who.facing * 14,
        owner: who,
        damage: 1.5,
        color: "#ff6a24",
        life: 28,
        size: 13,
        fireBreath: true
      });
      burst(projectileOrigin.x, projectileOrigin.y, "#ff9b37", 4);
    } else if (who.id === "axel") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (13 + weaponLevel * 2), owner: who, damage, color: "#7de4ef", life: 72, size: 16 + weaponLevel * 4, bubble: true });
      burst(projectileOrigin.x, projectileOrigin.y, "#b4faff", 8);
    } else if (who.id === "hank") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (10 + weaponLevel * 2), owner: who, damage: damage + 4 + weaponLevel * 3, color: "#73553d", life: 78, size: 18 + weaponLevel * 5, fossilBoulder: true });
      burst(projectileOrigin.x, projectileOrigin.y, "#b5885f", 10);
    } else if (who.id === "buzz") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (19 + weaponLevel * 2), owner: who, damage, color: "#ffd64a", life: 62, size: 13 + weaponLevel * 4, beeStinger: true });
      burst(projectileOrigin.x, projectileOrigin.y, "#fff29a", 8);
    } else if (who.id === "frost") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (12 + weaponLevel * 2), owner: who, damage: damage + 2 + weaponLevel * 3, color: "#e4f7ff", life: 74, size: 18 + weaponLevel * 5, snowball: true });
      burst(projectileOrigin.x, projectileOrigin.y, "#d7f2ff", 10);
    } else if (who.id === "bamboo") {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (15 + weaponLevel * 2), owner: who, damage, color: "#76b84c", life: 68, size: 15 + weaponLevel * 4, bambooShoot: true });
      burst(projectileOrigin.x, projectileOrigin.y, "#c2ed8e", 8);
    } else if (who.id === "shellshock") {
      if (weaponLevel === 0) {
        game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * 15, vy: verticalAim(15), owner: who, damage, color: "#fff3a8", life: 58, size: 5, gunBullet: true, bulletColor: "#fff3a8", bulletLength: 1.15 });
        burst(projectileOrigin.x, projectileOrigin.y, "#ffe566", 4);
      } else if (weaponLevel === 1) {
        game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * 22, vy: verticalAim(22), owner: who, damage: damage + 5, color: "#f8c65a", life: 64, size: 6, rifleBullet: true });
        burst(projectileOrigin.x, projectileOrigin.y, "#f8c65a", 5);
      } else if (weaponLevel === 2 || weaponLevel === 4) {
        const miniGun = weaponLevel === 2;
        const spreads = miniGun ? [-11, -5, 0, 5, 11] : [-7, 0, 7];
        spreads.forEach((spread, index) => {
          const middleShot = index === Math.floor(spreads.length / 2);
          const bulletSpeed = miniGun ? 18 : 16;
          game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y + spread, vx: who.facing * bulletSpeed, vy: verticalAim(bulletSpeed), owner: who, damage: middleShot ? damage + (miniGun ? 4 : 8) : 0, color: "#ffe566", life: 55, size: 7, gunBullet: true, visualOnly: !middleShot, bulletColor: miniGun ? "#fff26a" : "#ffe566", bulletLength: miniGun ? 1.2 : 1.5 });
        });
        burst(projectileOrigin.x, projectileOrigin.y, "#ffe566", miniGun ? 10 : 8);
      } else if (weaponLevel === 3 || weaponLevel === 6) {
        const rocketLauncher = weaponLevel === 6;
        const rocketSpeed = rocketLauncher ? 14 : 11;
        game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * rocketSpeed, vy: verticalAim(rocketSpeed), owner: who, damage: damage + (rocketLauncher ? 16 : 8), color: rocketLauncher ? "#ff5d39" : "#ff9e37", life: 70, size: rocketLauncher ? 26 : 18, rocket: true });
        burst(projectileOrigin.x, projectileOrigin.y, rocketLauncher ? "#ff5d39" : "#ffb640", rocketLauncher ? 14 : 10);
      } else {
        game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * 29, vy: verticalAim(29), owner: who, damage: damage + 18, color: "#d7ffff", life: 48, size: 5, gunBullet: true, bulletColor: "#d7ffff", bulletLength: 3.2, sniper: true });
        burst(projectileOrigin.x, projectileOrigin.y, "#d7ffff", 7);
      }
    } else {
      game.projectiles.push({ x: projectileOrigin.x, y: projectileOrigin.y, vx: who.facing * (12 + weaponLevel * 2 + (who.omegaTimer > 0 ? 3 : 0)), owner: who, damage, color: who.omegaTimer > 0 ? "#81fff5" : who.color, life: 70, size: 11 + weaponLevel * 3, rocket: weaponLevel >= 2 });
    }
  } else if (type === "special" && who.id === "ironbolt") {
    game.tankCharges.push({ x: who.x - who.facing * 175, y: getArena().floor - 18, vx: who.facing * 18, owner: who, damage: damage + 4, life: 76, hit: false });
    flashMessage("TANK CHARGE!", 42);
  } else if (type === "super") {
    game.projectiles.push({ x: who.x, y: 100, vx: 0, owner: who, damage, color: "#ffe658", life: 28, size: 75, beam: true });
  } else if (Math.abs(enemy.x - who.x) < reach) {
    hitOpponent(who, enemy, damage, reach, type === "special" ? who.special.toUpperCase() : type === "heavy" ? "SMASH!" : "WHACK!");
  }
  who.cooldown = who.id === "blaze" && type === "range" ? 7 : type === "super" ? 70 : type === "special" ? 42 : type === "heavy" ? 28 : 16;
  who.attackTimer = 13;
  who.attackSlide = who.facing * (type === "range" ? -12 : type === "special" ? 46 : type === "super" ? 24 : type === "heavy" ? 32 : 38);
  who.action = type;
  if (who.id === "rexy" && (type === "melee" || type === "special") && Math.random() < (type === "special" ? .7 : .28)) {
    showFighterEmote(who, "ROOOAR!");
    playRexyRoar();
  }
  if (type === "super") who.super = 0;
  if (type === "special") who.super = Math.min(100, who.super + 8);
}

function hitOpponent(attacker, target, damage, reach, text) {
  if (target.invincible > 0 || target.starTimer > 0 || Math.abs(target.x - attacker.x) > reach || game.ended) return;
  if (target.shielding) {
    burst(target.x, target.y - 45, "#77dcff", 10);
    flashMessage("SHIELD BLOCK!", 22);
    return;
  }
  target.health = Math.max(0, target.health - damage);
  if (target === game.player) game.playerTookDamage = true;
  if (target.health <= 0) game.finalHitWasSpecial = text === attacker.special.toUpperCase();
  target.hitFlash = 12; target.invincible = 12;
  target.x += attacker.facing * Math.min(60, damage * 3.2);
  attacker.super = Math.min(100, attacker.super + 12);
  burst(target.x, target.y - 35, attacker.color, 12);
  if (text) flashMessage(text, 28);
  updateHealth();
  if (target.trainingDummy && target.health <= 0) {
    target.health = target.maxHealth;
    target.x = 810;
    target.invincible = 50;
    updateHealth();
    flashMessage("DUMMY RESET! KEEP PRACTICING!", 52);
    return;
  }
  if (target.health <= 0) endBattle(attacker === game.player);
}

function burst(x, y, color, count) {
  for (let i = 0; i < count; i++) game.sparks.push({ x, y, vx: (Math.random() - .5) * 9, vy: (Math.random() - .6) * 8, life: 22 + Math.random() * 14, color });
}

function updateHealth() { $("player-health").style.width = `${game.player.health / game.player.maxHealth * 100}%`; $("enemy-health").style.width = `${game.enemy.health / game.enemy.maxHealth * 100}%`; }
function updateLives() { $("player-lives").textContent = `LIVES: ${game.player.lives}`; $("enemy-lives").textContent = `LIVES: ${game.enemy.lives}`; }
function flashMessage(message, timer) { game.message = message; game.messageTimer = timer; $("battle-message").textContent = message; $("battle-message").classList.add("show"); }
function showFighterEmote(fighter, phrase) {
  fighter.emoteText = phrase;
  fighter.emoteTimer = 150;
}
function useEmote(phrase) {
  if (!game || game.ended || !emotePhrases.includes(phrase)) return;
  const speaker = onlineIsGuest() ? game.enemy : game.player;
  showFighterEmote(speaker, phrase);
  if (onlineIsGuest()) {
    onlineMatch.emoteText = phrase;
    onlineMatch.emoteNonce++;
    window.RumbleOnline.sendInput(onlineControlsFromKeys()).catch(() => {});
  }
}

function rewardWinCoins(winner = game.player, completedSeconds = null) {
  const battleCoins = game.settings.difficulty === "hard" ? 30 : game.settings.difficulty === "easy" ? 10 : 20;
  const battleSeconds = completedSeconds === null ? Math.floor((performance.now() - game.startedAt) / 1000) : completedSeconds;
  const speedBonus = Math.max(0, 25 - Math.floor(battleSeconds / 5));
  const seasonalEvent = game.mode === "seasonal-boss" ? getSeasonalEvent(game.seasonalEventId) : null;
  const bossMultiplier = seasonalEvent?.coinMultiplier || (game.mode === "boss" || game.mode === "seasonal-boss" ? 5 : 1);
  const seasonalCoinMultiplier = birthdayActive() ? 3 : fireworkFrenzyActive() ? 2 : 1;
  const reward = (battleCoins + speedBonus) * bossMultiplier * seasonalCoinMultiplier;
  const winsBefore = arenaChallengeWins();
  const spacePizzaUnlockingNow = !profile.spacePizzaUnlocked && profile.wins - profile.spacePizzaWinsStart === spacePizzaWinsNeeded - 1;
  profile.coins += reward;
  profile.wins++;
  profile.winStreak = (profile.winStreak || 0) + 1;
  if (nonMechanicalAnimalIds.includes(winner.id)) profile.animalWins = [...new Set([...(profile.animalWins || []), winner.id])];
  if (armoredFighterIds.includes(winner.id)) profile.armorWins = [...new Set([...(profile.armorWins || []), winner.id])];
  const earnedAchievements = [];
  if (profile.wins >= 1) awardAchievement("first-win", earnedAchievements);
  if (battleSeconds < 15) awardAchievement("speedy", earnedAchievements);
  if (profile.coins >= 100) awardAchievement("coin-collector", earnedAchievements);
  if (profile.winStreak >= 5) awardAchievement("apex-predator", earnedAchievements);
  if (!game.playerTookDamage) awardAchievement("flawless-victory", earnedAchievements);
  if (game.finalHitWasSpecial) awardAchievement("overkill", earnedAchievements);
  if (battleSeconds < 10) awardAchievement("speed-demon", earnedAchievements);
  if (profile.coins >= 500) awardAchievement("high-roller", earnedAchievements);
  if (nonMechanicalAnimalIds.every((id) => profile.animalWins.includes(id))) awardAchievement("zoo-keeper", earnedAchievements);
  if (armoredFighterIds.every((id) => profile.armorWins.includes(id))) awardAchievement("heavy-metal", earnedAchievements);
  if (game.collectedPowerUps?.size >= 3) awardAchievement("master-strategist", earnedAchievements);
  if (game.mode === "boss") awardAchievement("boss-beater", earnedAchievements);
  if (winner.id === "kingcaw") awardAchievement("crow-champion", earnedAchievements);
  if (profile.trophies >= 5) awardAchievement("five-trophies", earnedAchievements);
  if (profile.trophies >= 10) awardAchievement("ten-trophies", earnedAchievements);
  if (profile.trophies >= 50) awardAchievement("fifty-trophies", earnedAchievements);
  if (profile.trophies >= 100) awardAchievement("one-hundred-trophies", earnedAchievements);
  if (profile.trophies >= 500) awardAchievement("five-hundred-trophies", earnedAchievements);
  if (profile.trophies >= 1000) awardAchievement("one-thousand-trophies", earnedAchievements);
  const winsAfter = arenaChallengeWins();
  const mysteryUnlockingNow = winsBefore < mysteryArenaWinsNeeded && winsAfter >= mysteryArenaWinsNeeded;
  const sharkLabUnlockingNow = winsBefore < sharkLabWinsNeeded && winsAfter >= sharkLabWinsNeeded;
  const frozenAquariumUnlockingNow = winsBefore < frozenAquariumWinsNeeded && winsAfter >= frozenAquariumWinsNeeded;
  const treehouseUnlockingNow = winsBefore < treehouseWinsNeeded && winsAfter >= treehouseWinsNeeded;
  if (spacePizzaUnlockingNow) profile.spacePizzaUnlocked = true;
  const seasonalRewardNow = Boolean(seasonalEvent?.rewardId && !profile.fighters.includes(seasonalEvent.rewardId));
  if (seasonalRewardNow) profile.fighters = [...new Set([...profile.fighters, seasonalEvent.rewardId])];
  saveProfile();
  updateCoinDisplays();
  if (mysteryUnlockingNow || sharkLabUnlockingNow || frozenAquariumUnlockingNow || treehouseUnlockingNow || spacePizzaUnlockingNow) buildStages();
  const arenaUnlockMessage = `${mysteryUnlockingNow ? " Mystery Arena unlocked!" : ""}${sharkLabUnlockingNow ? " Shark Lab unlocked!" : ""}${frozenAquariumUnlockingNow ? " Frozen Aquarium unlocked!" : ""}${treehouseUnlockingNow ? " Giant Treehouse unlocked!" : ""}${spacePizzaUnlockingNow ? " Space Pizza Planet unlocked!" : ""}`;
  const achievementMessage = earnedAchievements.length ? ` Achievement unlocked: ${earnedAchievements.map((id) => achievementCatalog.find((item) => item.id === id).name).join(" + ")}!` : "";
  return { reward, battleCoins, speedBonus, bossMultiplier, seasonalCoinMultiplier, arenaUnlockMessage, achievementMessage, seasonalRewardMessage: `${seasonalCoinMultiplier === 2 ? " FIREWORK FRENZY DOUBLE COINS!" : ""}${seasonalCoinMultiplier === 3 ? " BIRTHDAY BASH TRIPLE COINS!" : ""}${seasonalRewardNow ? ` ${seasonalEvent.rewardName} unlocked forever!` : ""}${seasonalEvent?.id === "thanksgiving" ? " TURKEY BOSS BONUS!" : ""}` };
}

function activateOmega(p = game.player) {
  if (!p.omega || p.omegaTimer > 0 || p.omegaCooldown > 0) { flashMessage(p.omega ? "OMEGA IS COOLING DOWN!" : "ONLY PROJECT NULL HAS OMEGA MODE!", 44); return; }
  p.omegaTimer = 15 * 60; p.omegaCooldown = 120 * 60; p.super = 100; burst(p.x, p.y - 70, "#9d7aff", 30); flashMessage("OMEGA MODE!", 75);
}

function playerInput() {
  const p = game.player;
  p.walking = false;
  if (p.frozenTimer > 0) { p.shielding = false; return; }
  if (!keys.e) p.shieldExhausted = false;
  p.shielding = Boolean(keys.e && !p.shieldExhausted && p.shieldEnergy > 0);
  if (p.shielding) {
    p.shieldEnergy--;
    if (p.shieldEnergy <= 0) { p.shielding = false; p.shieldExhausted = true; flashMessage("SHIELD EMPTY!", 32); }
  }
  if (keys.ArrowLeft) { p.x -= p.speed; p.facing = -1; p.walking = true; }
  if (keys.ArrowRight) { p.x += p.speed; p.facing = 1; p.walking = true; }
  if (keys.ArrowUp && p.jumpsLeft > 0) {
    p.vy = p.jumpsLeft === 2 ? -19 : -17;
    p.jumpsLeft--;
    keys.ArrowUp = false;
  }
  if (keys.a) { keys.a = false; doAttack(p, "melee"); }
  if (keys.s) {
    if (p.id === "blaze") doAttack(p, "range");
    else { keys.s = false; doAttack(p, "range"); }
  }
  if (keys.q) { keys.q = false; doAttack(p, "special"); }
  if (keys.w) { keys.w = false; activateOmega(); }
}

function secondPlayerInput() {
  const p = game.enemy;
  p.walking = false;
  if (p.frozenTimer > 0) { p.shielding = false; return; }
  if (!keys.y) p.shieldExhausted = false;
  p.shielding = Boolean(keys.y && !p.shieldExhausted && p.shieldEnergy > 0);
  if (p.shielding) {
    p.shieldEnergy--;
    if (p.shieldEnergy <= 0) { p.shielding = false; p.shieldExhausted = true; flashMessage("SHIELD EMPTY!", 32); }
  }
  if (keys.j) { p.x -= p.speed; p.facing = -1; p.walking = true; }
  if (keys.l) { p.x += p.speed; p.facing = 1; p.walking = true; }
  if (keys.i && p.jumpsLeft > 0) {
    p.vy = p.jumpsLeft === 2 ? -19 : -17;
    p.jumpsLeft--;
    keys.i = false;
  }
  if (keys.f) { keys.f = false; doAttack(p, "melee"); }
  if (keys.g) {
    if (p.id === "blaze") doAttack(p, "range");
    else { keys.g = false; doAttack(p, "range"); }
  }
  if (keys.r) { keys.r = false; doAttack(p, "special"); }
  if (keys.u) { keys.u = false; activateOmega(p); }
}

function onlineControlsFromKeys() {
  return {
    left: Boolean(keys.ArrowLeft),
    right: Boolean(keys.ArrowRight),
    shield: Boolean(keys.e),
    jumpNonce: onlineMatch.inputNonce && keys.ArrowUp ? onlineMatch.inputNonce : 0,
    meleeNonce: onlineMatch.inputNonce && keys.a ? onlineMatch.inputNonce : 0,
    rangeNonce: onlineMatch.inputNonce && keys.s ? onlineMatch.inputNonce : 0,
    rangeHeld: Boolean(keys.s),
    specialNonce: onlineMatch.inputNonce && keys.q ? onlineMatch.inputNonce : 0,
    omegaNonce: onlineMatch.inputNonce && keys.w ? onlineMatch.inputNonce : 0,
    emote: onlineMatch.emoteText,
    emoteNonce: onlineMatch.emoteNonce,
  };
}

function applyOnlineControls(fighter, input, previous) {
  fighter.walking = false;
  if (fighter.frozenTimer > 0) { fighter.shielding = false; return; }
  if (!input.shield) fighter.shieldExhausted = false;
  fighter.shielding = Boolean(input.shield && !fighter.shieldExhausted && fighter.shieldEnergy > 0);
  if (fighter.shielding) {
    fighter.shieldEnergy--;
    if (fighter.shieldEnergy <= 0) { fighter.shielding = false; fighter.shieldExhausted = true; flashMessage("SHIELD EMPTY!", 32); }
  }
  if (input.left) { fighter.x -= fighter.speed; fighter.facing = -1; fighter.walking = true; }
  if (input.right) { fighter.x += fighter.speed; fighter.facing = 1; fighter.walking = true; }
  if (input.jumpNonce && input.jumpNonce !== previous.jumpNonce && fighter.jumpsLeft > 0) {
    fighter.vy = fighter.jumpsLeft === 2 ? -19 : -17;
    fighter.jumpsLeft--;
  }
  if (input.meleeNonce && input.meleeNonce !== previous.meleeNonce) doAttack(fighter, "melee");
  if (fighter.id === "blaze" && input.rangeHeld) doAttack(fighter, "range");
  else if (input.rangeNonce && input.rangeNonce !== previous.rangeNonce) doAttack(fighter, "range");
  if (input.specialNonce && input.specialNonce !== previous.specialNonce) doAttack(fighter, "special");
  if (input.omegaNonce && input.omegaNonce !== previous.omegaNonce) activateOmega(fighter);
  if (input.emoteNonce && input.emoteNonce !== previous.emoteNonce && emotePhrases.includes(input.emote)) {
    showFighterEmote(fighter, input.emote);
  }
}

function onlineSnapshot() {
  const copyFighter = (fighter) => ({ ...fighter });
  const ownerSlot = (owner) => owner === game.player ? "p1" : "p2";
  return {
    sequence: Date.now(),
    stageId: game.stage.id,
    settings: game.settings,
    timeLeftMs: game.timeLeftMs,
    countdownMs: game.countdownMs,
    countdownText: game.countdownText,
    message: game.message,
    messageTimer: game.messageTimer,
    player: copyFighter(game.player),
    enemy: copyFighter(game.enemy),
    projectiles: game.projectiles.map((projectile) => ({ ...projectile, owner: ownerSlot(projectile.owner) })),
    tankCharges: game.tankCharges.map((tank) => ({ ...tank, owner: ownerSlot(tank.owner) })),
    hazards: game.hazards.map((hazard) => ({ ...hazard })),
    hazardDropMs: game.hazardDropMs,
    apples: game.apples.map((apple) => ({ ...apple })),
    powerUps: game.powerUps.map((powerUp) => ({ ...powerUp })),
    sparks: game.sparks.map((spark) => ({ ...spark })),
  };
}

function applyOnlineSnapshot(snapshot) {
  if (!onlineIsGuest() || !snapshot?.player || !snapshot?.enemy) return;
  const stage = stages.find((item) => item.id === snapshot.stageId) || chosenStage;
  const player = { ...snapshot.player };
  const enemy = { ...snapshot.enemy };
  game = {
    ...(game || {}),
    mode: "online-guest",
    stage,
    settings: snapshot.settings || { ...matchSettings },
    timeLeftMs: snapshot.timeLeftMs,
    countdownMs: snapshot.countdownMs,
    countdownText: snapshot.countdownText,
    message: snapshot.message,
    messageTimer: snapshot.messageTimer,
    player,
    enemy,
    projectiles: (snapshot.projectiles || []).map((projectile) => ({ ...projectile, owner: projectile.owner === "p1" ? player : enemy })),
    tankCharges: (snapshot.tankCharges || []).map((tank) => ({ ...tank, owner: tank.owner === "p1" ? player : enemy })),
    hazards: snapshot.hazards || [],
    hazardDropMs: snapshot.hazardDropMs || 0,
    apples: snapshot.apples || [],
    powerUps: snapshot.powerUps || [],
    sparks: snapshot.sparks || [],
    ended: false,
  };
  $("battle-message").textContent = game.countdownMs > 0 ? game.countdownText : game.message || "FIGHT!";
  $("battle-message").classList.toggle("show", game.countdownMs > 0 || game.messageTimer > 0);
  updateHealth();
  updateLives();
  updateBattleStatus();
}

function publishOnlineState(now) {
  if (!onlineIsHost() || now - onlineMatch.lastStateAt < 66) return;
  onlineMatch.lastStateAt = now;
  window.RumbleOnline.publishState(onlineSnapshot()).catch(() => {});
}

function sendOnlineControls(now) {
  if (!onlineIsGuest() || now - onlineMatch.lastInputAt < 45) return;
  onlineMatch.lastInputAt = now;
  window.RumbleOnline.sendInput(onlineControlsFromKeys()).catch(() => {});
}

function enemyAI() {
  if (game.mode === "training") return;
  const e = game.enemy, p = game.player, distance = p.x - e.x;
  if (e.frozenTimer > 0) { e.walking = false; return; }
  const difficulty = difficultyModes[game.settings.difficulty];
  e.facing = distance > 0 ? 1 : -1;
  e.walking = false;
  if (Math.abs(distance) > 125) { e.x += Math.sign(distance) * e.speed * .55 * difficulty.moveSpeed; e.walking = true; }
  if (e.vy === 0 && p.y < e.y - 35 && Math.random() < .035 * difficulty.moveSpeed) e.vy = -18;
  e.aiTimer--;
  if (e.aiTimer <= 0 && e.cooldown <= 0) {
    const roll = Math.random();
    if (roll < difficulty.attackChance) {
      const attackRoll = Math.random();
      if (Math.abs(distance) < 100 && attackRoll < .6) doAttack(e, "melee");
      else if (attackRoll < .72) doAttack(e, "range");
      else doAttack(e, "special");
    }
    e.aiTimer = (25 + Math.random() * 42) * difficulty.thinking;
  }
}

function updateFighter(f) {
  if (f.trainingDummy && (f.x < -65 || f.x > canvas.width + 65)) {
    f.x = 810; f.y = getArena().floor; f.vy = 0; f.health = f.maxHealth; f.invincible = 50;
    updateHealth();
    flashMessage("DUMMY RESET! KEEP PRACTICING!", 52);
    return;
  }
  if (f.x < -65 || f.x > canvas.width + 65) { loseLife(f); return; }
  const arena = getArena();
  const oldY = f.y;
  f.vy += .78;
  f.y += f.vy;
  if (f.vy >= 0) {
    for (const platform of arena.platforms) {
      const crossedTop = oldY <= platform.y && f.y >= platform.y;
      const overPlatform = f.x + 24 > platform.x && f.x - 24 < platform.x + platform.width;
      if (crossedTop && overPlatform) { f.y = platform.y; f.vy = 0; f.jumpsLeft = 2; break; }
    }
  }
  if (f.y > arena.floor) { f.y = arena.floor; f.vy = 0; f.jumpsLeft = 2; }
  if (Math.abs(f.attackSlide) > .5) {
    const step = f.attackSlide * .28;
    f.x += step;
    f.attackSlide -= step;
  } else f.attackSlide = 0;
  f.anim += f.walking ? .32 : .09;
  ["cooldown", "invincible", "attackTimer", "specialTimer", "hitFlash", "omegaTimer", "omegaCooldown", "powerUpTimer", "frozenTimer", "starTimer", "emoteTimer"].forEach((key) => { if (f[key] > 0) f[key]--; });
  if (f.emoteTimer <= 0) f.emoteText = "";
  if (!f.shielding && f.shieldEnergy < 60) f.shieldEnergy++;
  if (f.powerUpTimer <= 0) f.powerUp = null;
}

function loseLife(f) {
  if (game.ended) return;
  f.lives--;
  updateLives();
  if (f.lives < 0) { endBattle(f !== game.player); return; }
  f.x = f === game.player ? 230 : 810;
  f.y = getArena().floor - 70;
  f.vy = -5;
  f.jumpsLeft = 2;
  // Falling uses one of your safe falls, but it must not heal you.
  // This keeps players from getting a free full-health respawn.
  f.health = Math.max(1, f.health);
  f.cooldown = 45;
  f.invincible = 90;
  f.walking = false;
  updateHealth();
  burst(f.x, f.y - 45, "#ffffff", 22);
  flashMessage(`${f.name.toUpperCase()} RESPAWNS! ${f.lives} SAFE FALLS LEFT`, 75);
}

function updateProjectiles() {
  game.projectiles.forEach((p) => {
    p.life--; p.x += p.vx; p.y += p.vy || 0;
    const enemy = p.owner === game.player ? game.enemy : game.player;
    if (p.visualOnly) {
      // The two extra tracer bullets are just for the machine-gun look.
    } else if (p.beam) {
      if (p.life === 18 && Math.abs(enemy.x - p.x) < 370) hitOpponent(p.owner, enemy, p.damage, 700, "SUPER BLAST!");
    } else if (Math.abs(p.x - enemy.x) < p.size + 28 && Math.abs(p.y - (enemy.y - 36)) < 50) {
      if (enemy.shielding) {
        p.owner = enemy;
        p.vx = -p.vx * .45;
        p.damage = Math.max(2, Math.round(p.damage * .7));
        p.life = Math.min(p.life, 20);
        p.x = enemy.x + Math.sign(p.vx) * 38;
        burst(enemy.x, enemy.y - 45, "#77dcff", 12);
        flashMessage("SHIELD BOUNCE!", 26);
      } else {
        hitOpponent(p.owner, enemy, p.damage, 700, "ZAP!");
        p.life = 0;
      }
    }
  });
  game.projectiles = game.projectiles.filter((p) => p.life > 0 && p.x > -100 && p.x < canvas.width + 100);
  game.sparks.forEach((s) => { s.x += s.vx; s.y += s.vy; s.vy += .3; s.life--; });
  game.sparks = game.sparks.filter((s) => s.life > 0);
}

function spawnApple(golden = false) {
  const turkey = !golden && thanksgivingActive();
  const cake = !golden && birthdayActive();
  game.apples.push({ x: 55 + Math.random() * (canvas.width - 110), y: -28, vy: 0, life: golden ? 180 : 300, landed: false, golden, turkey, cake });
  flashMessage(golden ? "GOLDEN APPLE DROP!" : turkey ? "FULL-HEAL TURKEY DROP!" : cake ? "BIRTHDAY CAKE DROP!" : "APPLE DROP!", 42);
}

function updateApples(dt) {
  game.appleDropMs -= dt;
  if (game.appleDropMs <= 0) {
    spawnApple();
    game.appleDropMs += 10000;
  }
  if (thanksgivingActive() || birthdayActive()) game.goldenAppleDropMs = null;
  if (game.goldenAppleDropMs !== null) {
    game.goldenAppleDropMs -= dt;
    if (game.goldenAppleDropMs <= 0) { spawnApple(true); game.goldenAppleDropMs = null; }
  }
  const arena = getArena();
  game.apples.forEach((apple) => {
    const oldY = apple.y;
    if (!apple.landed) {
      apple.vy += .58;
      apple.y += apple.vy;
      if (apple.vy >= 0) {
        for (const platform of arena.platforms) {
          const crossedTop = oldY + 18 <= platform.y && apple.y + 18 >= platform.y;
          const overPlatform = apple.x + 14 > platform.x && apple.x - 14 < platform.x + platform.width;
          if (crossedTop && overPlatform) { apple.y = platform.y - 18; apple.vy = 0; apple.landed = true; break; }
        }
      }
      if (apple.y + 18 >= arena.floor) { apple.y = arena.floor - 18; apple.vy = 0; apple.landed = true; }
    }
    apple.life--;
    [game.player, game.enemy].forEach((fighter) => {
      const specialHealingDrop = apple.turkey || apple.cake;
      const turkeyCanHealFighter = game.mode === "two-player" || game.mode === "online-host" || game.mode === "online-guest" || fighter === game.player;
      if (apple.collected || (specialHealingDrop && !turkeyCanHealFighter) || Math.abs(fighter.x - apple.x) > 42 || Math.abs((fighter.y - 38) - apple.y) > 52) return;
      apple.collected = true;
      fighter.health = apple.golden || specialHealingDrop ? fighter.maxHealth : Math.min(fighter.maxHealth, fighter.health + 25);
      updateHealth();
      playPowerUpSound(apple.golden ? "golden-apple" : "apple");
      burst(apple.x, apple.y, apple.golden ? "#ffe34d" : apple.turkey ? "#bd6c30" : apple.cake ? "#ff83bd" : "#ff4d4d", apple.golden || specialHealingDrop ? 25 : 13);
      flashMessage(apple.golden ? "GOLDEN APPLE! FULL HEALTH!" : apple.turkey ? "TURKEY FEAST! FULL HEALTH!" : apple.cake ? "BIRTHDAY CAKE! FULL HEALTH!" : "APPLE! +25 HEALTH", 55);
    });
  });
  game.apples = game.apples.filter((apple) => !apple.collected && apple.life > 0);
}

function drawApple(apple) {
  ctx.save();
  ctx.translate(apple.x, apple.y);
  if (apple.cake) {
    ctx.shadowColor = "#ffb1d5";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#f6d097";
    ctx.fillRect(-20, -2, 40, 21);
    ctx.fillStyle = "#f58cc0";
    ctx.beginPath(); ctx.roundRect(-22, -8, 44, 14, 7); ctx.fill();
    ctx.fillStyle = "#fff3d1";
    ctx.fillRect(-3, -30, 6, 21);
    ctx.fillStyle = "#ffcc32";
    ctx.beginPath(); ctx.moveTo(0, -42); ctx.quadraticCurveTo(-7, -32, 0, -28); ctx.quadraticCurveTo(7, -32, 0, -42); ctx.fill();
    ctx.fillStyle = "#fff";
    [-11, 11].forEach((x) => { ctx.beginPath(); ctx.arc(x, 8, 3, 0, Math.PI * 2); ctx.fill(); });
    ctx.restore();
    return;
  }
  if (apple.turkey) {
    ctx.shadowColor = "#ffbb5d";
    ctx.shadowBlur = 14;
    ["#c54532", "#ef9a36", "#f3d15c", "#bd6538"].forEach((color, index) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(-18 + index * 12, -9, 10, 22, (-.45 + index * .3), 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#875034";
    ctx.beginPath(); ctx.ellipse(0, 2, 19, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(3, -20, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f4bd38";
    ctx.beginPath(); ctx.moveTo(11, -19); ctx.lineTo(25, -14); ctx.lineTo(11, -9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#d73c39";
    ctx.beginPath(); ctx.arc(-4, -30, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(-1, -10, 5, 11);
    ctx.fillStyle = "#fff7d4";
    ctx.beginPath(); ctx.arc(5, -23, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    return;
  }
  ctx.shadowColor = apple.golden ? "#f0b900" : "#631f2a";
  ctx.shadowBlur = 10;
  ctx.fillStyle = apple.golden ? "#ffc928" : "#ee4345";
  ctx.beginPath();
  ctx.arc(-7, 1, 11, 0, Math.PI * 2);
  ctx.arc(7, 1, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = apple.golden ? "#fff2a2" : "#ff7470";
  ctx.beginPath();
  ctx.arc(-5, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#704527";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.quadraticCurveTo(1, -18, 6, -20);
  ctx.stroke();
  ctx.fillStyle = "#62be50";
  ctx.beginPath();
  ctx.ellipse(10, -17, 8, 4, -.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function randomPowerUpDelay() {
  return 15000 + Math.random() * 20000;
}

function spawnPowerUp() {
  const types = ["sword", "pistol", "freeze", "star"];
  const type = types[Math.floor(Math.random() * types.length)];
  game.powerUps.push({ type, x: 55 + Math.random() * (canvas.width - 110), y: -32, vy: 0, life: 900, landed: false });
  flashMessage(type === "sword" ? "SWORD DROP!" : type === "pistol" ? "SHINY PISTOL DROP!" : type === "freeze" ? "FREEZE BOMB DROP!" : "SUPER STAR DROP!", 42);
}

function updatePowerUps(dt) {
  game.powerUpDropMs -= dt;
  if (game.powerUpDropMs <= 0) {
    spawnPowerUp();
    game.powerUpDropMs += randomPowerUpDelay();
  }
  const arena = getArena();
  game.powerUps.forEach((powerUp) => {
    const oldY = powerUp.y;
    if (!powerUp.landed) {
      powerUp.vy += .58;
      powerUp.y += powerUp.vy;
      if (powerUp.vy >= 0) {
        for (const platform of arena.platforms) {
          const crossedTop = oldY + 20 <= platform.y && powerUp.y + 20 >= platform.y;
          const overPlatform = powerUp.x + 17 > platform.x && powerUp.x - 17 < platform.x + platform.width;
          if (crossedTop && overPlatform) { powerUp.y = platform.y - 20; powerUp.vy = 0; powerUp.landed = true; break; }
        }
      }
      if (powerUp.y + 20 >= arena.floor) { powerUp.y = arena.floor - 20; powerUp.vy = 0; powerUp.landed = true; }
    }
    powerUp.life--;
    [game.player, game.enemy].forEach((fighter) => {
      if (powerUp.collected || Math.abs(fighter.x - powerUp.x) > 45 || Math.abs((fighter.y - 38) - powerUp.y) > 55) return;
      powerUp.collected = true;
      if (fighter === game.player) game.collectedPowerUps.add(powerUp.type);
      if (powerUp.type === "freeze") {
        const opponent = fighter === game.player ? game.enemy : game.player;
        opponent.frozenTimer = 120;
        opponent.shielding = false;
        playPowerUpSound("freeze");
        burst(powerUp.x, powerUp.y, "#7ce8ff", 28);
        flashMessage("FREEZE BOMB! OPPONENT FROZEN!", 65);
      } else if (powerUp.type === "star") {
        fighter.starTimer = 300;
        playPowerUpSound("star");
        burst(powerUp.x, powerUp.y, "#fff05a", 30);
        flashMessage("SUPER STAR! INVINCIBLE!", 65);
      } else {
        fighter.powerUp = powerUp.type;
        fighter.powerUpTimer = 600;
        playPowerUpSound(powerUp.type);
        burst(powerUp.x, powerUp.y, powerUp.type === "sword" ? "#6ce6ff" : "#ffe45d", 18);
        flashMessage(powerUp.type === "sword" ? "SWORD POWER! MELEE x2" : "SHINY PISTOL POWER!", 55);
      }
    });
  });
  game.powerUps = game.powerUps.filter((powerUp) => !powerUp.collected && powerUp.life > 0);
}

function drawPowerUp(powerUp) {
  ctx.save();
  ctx.translate(powerUp.x, powerUp.y);
  ctx.shadowColor = powerUp.type === "sword" ? "#64edff" : powerUp.type === "pistol" || powerUp.type === "star" ? "#ffe45d" : "#7ce8ff";
  ctx.shadowBlur = 18;
  if (powerUp.type === "sword") {
    ctx.rotate(-.28);
    ctx.fillStyle = "#dffaff";
    ctx.fillRect(-4, -22, 8, 34);
    ctx.fillStyle = "#58dffa";
    ctx.beginPath(); ctx.moveTo(0, -31); ctx.lineTo(-5, -20); ctx.lineTo(5, -20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#f3c85a";
    ctx.fillRect(-14, 9, 28, 6);
    ctx.fillStyle = "#794c32";
    ctx.fillRect(-4, 15, 8, 13);
  } else if (powerUp.type === "pistol") {
    ctx.fillStyle = "#d6dce5";
    ctx.fillRect(-18, -8, 30, 13);
    ctx.fillStyle = "#fff4ac";
    ctx.fillRect(10, -5, 15, 6);
    ctx.fillStyle = "#687487";
    ctx.fillRect(-8, 4, 10, 15);
    ctx.fillStyle = "#fff9d8";
    ctx.beginPath(); ctx.arc(-11, -2, 4, 0, Math.PI * 2); ctx.fill();
  } else if (powerUp.type === "freeze") {
    ctx.fillStyle = "#79dff4";
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#d9fbff"; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(11, 0); ctx.moveTo(0, -11); ctx.lineTo(0, 11); ctx.stroke(); ctx.restore(); }
    ctx.strokeStyle = "#475a77"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(6, -16); ctx.quadraticCurveTo(10, -28, 18, -25); ctx.stroke();
  } else {
    ctx.fillStyle = "#fff4a0";
    ctx.beginPath();
    for (let point = 0; point < 10; point++) { const angle = -Math.PI / 2 + point * Math.PI / 5; const radius = point % 2 === 0 ? 25 : 11; const x = Math.cos(angle) * radius; const y = Math.sin(angle) * radius; point ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#694c20"; ctx.beginPath(); ctx.arc(-8, -2, 2.5, 0, Math.PI * 2); ctx.arc(8, -2, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function updateTankCharges() {
  game.tankCharges.forEach((tank) => {
    tank.x += tank.vx;
    tank.life--;
    const target = tank.owner === game.player ? game.enemy : game.player;
    const closeEnough = Math.abs(tank.x - target.x) < 84 && Math.abs(tank.y - target.y) < 125;
    if (!tank.hit && target.invincible <= 0 && target.starTimer <= 0 && closeEnough) {
      tank.hit = true;
      if (target.shielding) {
        burst(target.x, target.y - 45, "#77dcff", 16);
        flashMessage("SHIELD BLOCK!", 28);
        return;
      }
      target.health = Math.max(0, target.health - tank.damage);
      if (target === game.player) game.playerTookDamage = true;
      if (target.health <= 0) game.finalHitWasSpecial = true;
      target.hitFlash = 18;
      target.invincible = 16;
      target.x += Math.sign(tank.vx) * Math.min(82, tank.damage * 4);
      tank.owner.super = Math.min(100, tank.owner.super + 12);
      burst(target.x, target.y - 35, "#f4cf4d", 20);
      flashMessage("TANK CHARGE!", 38);
      updateHealth();
      if (target.trainingDummy && target.health <= 0) {
        target.health = target.maxHealth;
        target.x = 810;
        target.invincible = 50;
        updateHealth();
        flashMessage("DUMMY RESET! KEEP PRACTICING!", 52);
        return;
      }
      if (target.health <= 0) endBattle(tank.owner === game.player);
    }
  });
  game.tankCharges = game.tankCharges.filter((tank) => tank.life > 0 && tank.x > -180 && tank.x < canvas.width + 180);
}

function spawnStageHazard() {
  const config = stageHazards[game.stage.id];
  if (!config) return;
  const size = config.kind === "meteor" ? 28 : config.kind === "cannonball" ? 24 : 22;
  const direction = Math.random() < .5 ? 1 : -1;
  const hazard = { ...config, x: 70 + Math.random() * (canvas.width - 140), y: -size * 2, vx: 0, vy: 4.2 + Math.random() * 1.7, size, life: 260, rotation: 0 };
  if (config.horizontal) {
    hazard.x = direction > 0 ? -size : canvas.width + size;
    hazard.y = getArena().floor - 46;
    hazard.vx = direction * 10;
    hazard.vy = 0;
  }
  game.hazards.push(hazard);
}

function updateStageHazards(dt) {
  const config = stageHazards[game.stage.id];
  if (!config) return;
  game.hazardDropMs -= dt;
  if (game.hazardDropMs <= 0 && game.hazards.length === 0) {
    spawnStageHazard();
    game.hazardDropMs = 8000 + Math.random() * 4500;
  }
  game.hazards.forEach((hazard) => {
    hazard.x += hazard.vx;
    hazard.y += hazard.vy;
    hazard.rotation += .16 + Math.abs(hazard.vx) * .015;
    hazard.life--;
    [game.player, game.enemy].forEach((fighter) => {
      if (hazard.life <= 0 || fighter.invincible > 0 || fighter.starTimer > 0) return;
      const closeEnough = Math.abs(hazard.x - fighter.x) < hazard.size + 30 && Math.abs(hazard.y - (fighter.y - 42)) < hazard.size + 48;
      if (!closeEnough) return;
      hazard.life = 0;
      if (fighter.shielding) {
        burst(fighter.x, fighter.y - 48, "#77dcff", 14);
        flashMessage("SHIELD BLOCK!", 24);
        return;
      }
      fighter.health = Math.max(0, fighter.health - hazard.damage);
      if (fighter === game.player) game.playerTookDamage = true;
      fighter.hitFlash = 14;
      fighter.invincible = 18;
      fighter.x += Math.sign(hazard.x - fighter.x) * -Math.min(54, hazard.damage * 3);
      burst(fighter.x, fighter.y - 42, hazard.color, 18);
      flashMessage(`${hazard.label}!`, 42);
      updateHealth();
      if (fighter.health <= 0) endBattle(fighter !== game.player);
    });
    if (!hazard.horizontal && hazard.y > getArena().floor + hazard.size) hazard.life = 0;
  });
  game.hazards = game.hazards.filter((hazard) => hazard.life > 0 && hazard.x > -90 && hazard.x < canvas.width + 90);
}

function drawBackground() {
  if (game?.mode === "boss") {
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#1e1637"); sky.addColorStop(.72, "#6d2635"); sky.addColorStop(.73, "#ec633b"); sky.addColorStop(1, "#6a1f30");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f49b45"; [[145, 120], [430, 180], [815, 115], [1000, 230]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); });
    [{ x: 105, y: 390, width: 220 }, { x: 445, y: 310, width: 210 }, { x: 775, y: 390, width: 220 }].forEach((platform) => { ctx.fillStyle = "#352b45"; ctx.fillRect(platform.x, platform.y, platform.width, 22); ctx.fillStyle = "#ef743f"; ctx.fillRect(platform.x, platform.y, platform.width, 6); });
    ctx.fillStyle = "#ffe170"; ctx.font = "bold 34px system-ui"; ctx.textAlign = "center"; ctx.fillText("MEGA DOOMGEAR'S LAIR", canvas.width / 2, 75);
    return;
  }
  if (game?.mode === "training") {
    if (trainingRoomImage.complete && trainingRoomImage.naturalWidth) {
      ctx.drawImage(trainingRoomImage, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#10244b12";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return;
    }
    const wall = ctx.createLinearGradient(0, 0, 0, canvas.height);
    wall.addColorStop(0, "#dff5ff"); wall.addColorStop(.7, "#8bc6e5"); wall.addColorStop(.71, "#687b8b"); wall.addColorStop(1, "#384d60");
    ctx.fillStyle = wall; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff88"; for (let x = 70; x < canvas.width; x += 150) ctx.fillRect(x, 50, 80, 200);
    ctx.fillStyle = "#f2c64e"; ctx.fillRect(0, 510, canvas.width, 10);
    const platforms = [{ x: 105, y: 390, width: 220 }, { x: 445, y: 310, width: 210 }, { x: 775, y: 390, width: 220 }];
    platforms.forEach((platform) => {
      ctx.fillStyle = "#34495d"; ctx.fillRect(platform.x, platform.y, platform.width, 20);
      ctx.fillStyle = "#70c7de"; ctx.fillRect(platform.x, platform.y, platform.width, 7);
      ctx.fillStyle = "#d5fbff"; ctx.fillRect(platform.x + 12, platform.y + 8, platform.width - 24, 3);
    });
    ctx.fillStyle = "#2a3d50"; ctx.font = "bold 32px system-ui"; ctx.textAlign = "center"; ctx.fillText("TRAINING ROOM", canvas.width / 2, 75);
    return;
  }
  const selectedStageImage = game?.stage && stageImages[game.stage.id];
  if (selectedStageImage?.complete && selectedStageImage.naturalWidth) {
    ctx.drawImage(selectedStageImage, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#10244b18";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height); sky.addColorStop(0, "#73d6fa"); sky.addColorStop(.68, "#d4f6ff"); sky.addColorStop(.69, "#7bcc77"); sky.addColorStop(1, "#2f976b"); ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffffaa"; [[140,100,70],[380,155,48],[760,90,78],[975,175,50]].forEach(([x,y,s]) => { ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.arc(x+s*.8,y+20,s*.68,0,Math.PI*2); ctx.arc(x-s*.75,y+24,s*.58,0,Math.PI*2); ctx.fill(); });
  ctx.fillStyle = "#4ca061"; for (let i=0;i<7;i++){ const x=i*185-30; ctx.beginPath(); ctx.arc(x+50, 430, 130, Math.PI, 0); ctx.fill(); }
  ctx.fillStyle = "#4cba75"; ctx.fillRect(0, 510, canvas.width, 110); ctx.fillStyle = "#267d67"; ctx.fillRect(0, 560, canvas.width, 60);
  ctx.fillStyle = "#784cb3"; [[160,500],[870,500]].forEach(([x,y]) => { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+22,y-74); ctx.lineTo(x+44,y); ctx.fill(); });
}

function drawCharacterArt(context, f) {
  const omega = f.omegaTimer > 0;
  const circle = (x, y, radius, color) => { context.fillStyle = color; context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fill(); };
  const oval = (x, y, rx, ry, color) => { context.fillStyle = color; context.beginPath(); context.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); context.fill(); };
  const poly = (points, color) => { context.fillStyle = color; context.beginPath(); context.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x, y]) => context.lineTo(x, y)); context.closePath(); context.fill(); };
  const line = (x1, y1, x2, y2, width, color) => { context.strokeStyle = color; context.lineWidth = width; context.lineCap = "round"; context.beginPath(); context.moveTo(x1, y1); context.lineTo(x2, y2); context.stroke(); };
  const eye = (x, y, color = "#17284d") => { circle(x, y, 7, "#fff"); circle(x + 1, y + 1, 3.5, color); };

  if (f.id === "training-dummy") {
    oval(0, -35, 28, 43, "#a77a55"); circle(0, -90, 31, "#e8d1a6");
    context.strokeStyle = "#754f3c"; context.lineWidth = 5; context.beginPath(); context.moveTo(-21, -102); context.lineTo(21, -78); context.moveTo(21, -102); context.lineTo(-21, -78); context.stroke();
    context.fillStyle = "#fff8de"; context.fillRect(-14, -96, 28, 12); context.fillStyle = "#b84942"; context.fillRect(-5, -93, 10, 6);
  } else if (f.id === "shellshock") {
    oval(0, -37, 26, 39, "#e86f48"); circle(0, -83, 31, "#7b808c"); circle(-17, -113, 13, "#7b808c"); circle(17, -113, 13, "#7b808c"); oval(0, -77, 22, 18, "#444951"); eye(-9, -80); eye(10, -80); line(20, -45, 58, -30, 12, "#2d3543"); line(56, -30, 76, -30, 9, "#555e6f");
  } else if (f.id === "pip") {
    oval(-2, -32, 20, 31, "#8c9099"); circle(-2, -72, 27, "#a9adb3"); circle(-18, -96, 11, "#a9adb3"); circle(14, -96, 11, "#a9adb3"); oval(-2, -70, 20, 13, "#f0e4d2"); eye(-11, -73); eye(7, -73); oval(27, -43, 15, 26, "#f2ca42"); line(-17, -28, -42, -13, 13, "#9fa4a9"); line(-41, -13, -54, -3, 9, "#676b74");
  } else if (f.id === "professor") {
    oval(0, -35, 25, 40, "#f5f0dd"); circle(0, -82, 29, "#7d8087"); circle(-18, -108, 10, "#7d8087"); circle(18, -108, 10, "#7d8087"); circle(-11, -83, 12, "#dcae42"); circle(12, -83, 12, "#dcae42"); circle(-11, -83, 8, "#87e9ed"); circle(12, -83, 8, "#87e9ed"); line(-9, -45, -34, -22, 9, "#75818a"); line(-39, -25, -51, -7, 5, "#d7dde4");
  } else if (f.id === "bloop") {
    context.strokeStyle = "#eaffff"; context.lineWidth = 6; context.beginPath(); context.arc(0, -70, 52, 0, Math.PI * 2); context.stroke(); oval(2, -68, 32, 22, "#349ce5"); poly([[24,-68],[48,-86],[44,-52]], "#349ce5"); eye(-8, -72); eye(8, -72); poly([[-12,-51],[1,-43],[13,-51]], "#fff"); line(-46, -35, -65, -16, 7, "#d49e47"); line(46, -35, 65, -16, 7, "#d49e47");
  } else if (f.id === "ironbolt") {
    oval(0, -35, 27, 40, "#617342"); circle(0, -82, 29, "#a4a7ab"); poly([[-23,-101],[-24,-126],[-5,-108]], "#89929a"); poly([[5,-108],[23,-126],[23,-101]], "#89929a"); oval(0, -75, 24, 16, "#d9dbe0"); eye(-9,-77); eye(10,-77); line(0,-102,38,-98,8,"#e95359"); context.fillStyle="#71864c"; context.fillRect(29,-50,40,25); circle(67,-37,13,"#273640"); line(-28,-58,-56,-12,6,"#e6edf2"); line(-14,-58,-42,-12,6,"#e6edf2");
  } else if (f.id === "bolt") {
    oval(0, -35, 26, 40, "#bb754e"); circle(0, -82, 28, "#a66142"); oval(0, -72, 21, 14, "#e7c6a8"); eye(-10,-83); eye(10,-83); context.fillStyle="#fff"; context.fillRect(-9,-64,7,12); context.fillRect(3,-64,7,12); oval(-40,-35,19,30,"#6d432e"); oval(28,-45,15,24,"#c98e42"); line(40,-48,55,-70,6,"#4fe7e7"); line(48,-40,65,-60,6,"#4fe7e7");
  } else if (f.id === "goblin") {
    oval(0, -35, 25, 40, "#697d3e"); circle(0, -82, 28, "#87ad49"); poly([[-21,-88],[-52,-107],[-31,-68]], "#87ad49"); poly([[21,-88],[52,-107],[31,-68]], "#87ad49"); context.fillStyle="#80878b"; context.fillRect(-23,-111,46,17); circle(-10,-80,10,"#f4d753"); circle(11,-80,10,"#f4d753"); circle(-10,-80,3,"#17284d");circle(11,-80,3,"#17284d"); line(28,-48,55,-25,7,"#a8aeb2"); line(54,-25,70,-41,11,"#ca5668");
  } else if (f.id === "doomgear" || f.id === "boss") {
    oval(0, -34, 30, 42, "#332b4c"); circle(0, -83, 32, "#22263d"); poly([[-30,-88],[-46,-128],[-7,-112]], "#4f387e"); poly([[8,-112],[46,-128],[30,-88]], "#4f387e"); oval(0,-82,25,22,"#9f9ca8"); circle(-10,-84,7,"#7650d3");circle(11,-84,7,"#7650d3"); line(0,-69,0,-58,6,"#5ce8dc"); line(28,-46,62,-62,18,"#697180"); circle(66,-65,13,"#9ba5af");
  } else if (f.id === "null") {
    oval(0, -34, 27, 42, omega ? "#242a41" : "#323f8c"); circle(0, -82, 31, "#3d4da3"); poly([[-24,-96],[-24,-124],[-2,-106]], "#272f6e"); poly([[2,-106],[24,-124],[24,-96]], "#1f7da0"); oval(-10,-81,16,21,"#444990"); oval(10,-81,16,21,"#2787ae"); line(0,-106,0,-57,4,"#67f4e4"); eye(-10,-84,"#59f6e5"); eye(10,-84,"#a56eff"); poly([[25,-48],[43,-73],[49,-38]], omega ? "#a46dff" : "#4f3ea6"); poly([[-25,-50],[-45,-70],[-48,-37]], omega ? "#8afff1" : "#4f3ea6");
  } else if (f.id === "frost-king") {
    oval(0, -36, 34, 44, "#f8feff"); circle(0, -88, 36, "#edfaff"); eye(-12, -91, "#277bb8"); eye(12, -91, "#277bb8"); poly([[-32,-113],[-18,-143],[-4,-117],[0,-151],[12,-117],[30,-142],[34,-112]], "#8bdcf7"); line(-35,-48,-67,-18,13,"#9de9ff"); line(35,-48,67,-18,13,"#9de9ff");
  } else if (f.id === "pumpkin-king") {
    oval(0, -37, 34, 43, "#4a7540"); circle(0, -88, 38, "#e57a35"); poly([[-24,-111],[-12,-124],[-4,-109]], "#273d25"); poly([[4,-109],[12,-124],[24,-111]], "#273d25"); eye(-12, -89, "#f9ed63"); eye(12, -89, "#f9ed63"); context.strokeStyle="#503126"; context.lineWidth=6; context.beginPath(); context.arc(0,-82,20,.2,2.94); context.stroke(); line(0,-125,0,-143,9,"#5f8d42");
  } else if (f.id === "turkey-boss") {
    [[-28,"#b64733"],[-10,"#ec9a39"],[10,"#f2cf58"],[28,"#9a5437"]].forEach(([x, color]) => { oval(x, -73, 16, 45, color); });
    oval(0, -38, 34, 43, "#875036"); circle(0, -91, 33, "#a9633e"); eye(-11, -94, "#251a24"); eye(11, -94, "#251a24");
    poly([[19,-91],[48,-82],[19,-73]], "#f2bd39"); circle(-7, -121, 7, "#d84c40"); circle(0, -132, 7, "#d84c40"); line(-1,-77,-1,-62,7,"#d6423e"); line(-26,-48,-58,-18,13,"#9a593a"); line(26,-48,58,-18,13,"#9a593a");
  } else if (f.id === "axel") {
    oval(0, -42, 29, 39, "#ec83ad"); circle(0, -87, 32, "#ff9fc5"); [-1, 1].forEach((side) => { poly([[side * 22,-100],[side * 52,-120],[side * 39,-77]], "#ed78ac"); }); eye(-10,-88); eye(10,-88); oval(0,-70,18,10,"#ffe8f0"); line(-24,-48,-51,-24,9,"#e87ca7"); line(24,-48,51,-24,9,"#e87ca7");
  } else if (f.id === "hank") {
    oval(0, -36, 39, 45, "#667894"); circle(0, -84, 38, "#7589a6"); circle(-17,-94,12,"#a9bdd0"); circle(17,-94,12,"#a9bdd0"); oval(0,-73,24,15,"#b6c7d5"); circle(-8,-73,4,"#4a5b72"); circle(8,-73,4,"#4a5b72"); eye(-13,-91); eye(13,-91); line(-32,-46,-61,-18,14,"#667894"); line(32,-46,61,-18,14,"#667894");
  } else if (f.id === "buzz") {
    oval(0, -44, 24, 37, "#f4c52e"); circle(0, -86, 24, "#2e303b"); eye(-8,-87); eye(8,-87); [-1,1].forEach((side) => { oval(side * 27,-61,22,12,"#eafaff"); }); context.fillStyle="#30313d"; context.fillRect(-18,-54,36,7); context.fillRect(-18,-39,36,7); line(0,-110,-9,-123,3,"#30313d"); line(0,-110,9,-123,3,"#30313d");
  } else if (f.id === "frost") {
    oval(0, -37, 33, 43, "#eaf8ff"); circle(0, -86, 34, "#f7fdff"); circle(-22,-111,12,"#d9eef7"); circle(22,-111,12,"#d9eef7"); oval(0,-72,20,14,"#d3e9f3"); eye(-11,-88,"#3978a0"); eye(11,-88,"#3978a0"); line(-28,-48,-57,-18,13,"#ecfaff"); line(28,-48,57,-18,13,"#ecfaff");
  } else if (f.id === "bamboo") {
    oval(0, -37, 31, 43, "#f3f4f0"); circle(0, -86, 34, "#f5f6f2"); oval(-24,-108,13,18,"#27313d"); oval(24,-108,13,18,"#27313d"); oval(-15,-84,12,16,"#27313d"); oval(15,-84,12,16,"#27313d"); oval(0,-68,18,11,"#eff1ed"); eye(-12,-87); eye(12,-87); line(29,-50,59,-73,8,"#5e9d40"); line(40,-65,55,-88,5,"#78bd51"); line(-28,-48,-56,-18,12,"#27313d");
  } else if (f.id === "perry") {
    oval(0, -36, 29, 43, "#253a58"); oval(0, -35, 20, 31, "#fffdf1"); circle(0, -85, 31, "#263957"); eye(-10, -87); eye(10, -87); poly([[-10,-75],[10,-75],[0,-61]], "#f6ae31"); context.fillStyle="#de4a4e"; context.fillRect(-34,-117,68,17); circle(30,-129,15,"#fff7e4"); line(-23,-45,-49,-15,12,"#263957"); context.fillStyle="#dc424b"; context.fillRect(22,-47,34,34); line(39,-47,39,-13,7,"#ffe368");
  } else if (f.id === "boo") {
    oval(0, -39, 28, 43, "#493260"); circle(0, -87, 31, "#593b73"); poly([[-28,-100],[-53,-130],[-46,-76]], "#69498a"); poly([[28,-100],[53,-130],[46,-76]], "#69498a"); eye(-10,-88,"#d8d3ff"); eye(10,-88,"#d8d3ff"); poly([[-23,-110],[-16,-140],[-2,-115]], "#69498a"); poly([[2,-115],[16,-140],[23,-110]], "#69498a"); line(-22,-52,-53,-24,11,"#69498a"); line(22,-52,53,-24,11,"#69498a");
  }
  if (omega) { context.strokeStyle="#8afff1"; context.lineWidth=5; context.beginPath(); context.arc(0,-68,59,0,Math.PI*2); context.stroke(); }
}

function drawBattlePortrait(f) {
  const cutout = battleCutouts[f.id] || (f.id === "boss" ? battleCutouts.doomgear : null);
  if (!cutout || !cutout.complete || !cutout.naturalWidth) return false;
  const portraitScale = f.battlePortraitScale || 1;
  const maxWidth = 190 * portraitScale;
  const maxHeight = 224 * portraitScale;
  let width = maxHeight * (cutout.naturalWidth / cutout.naturalHeight);
  let height = maxHeight;
  if (width > maxWidth) {
    width = maxWidth;
    height = width * (cutout.naturalHeight / cutout.naturalWidth);
  }
  ctx.save();
  ctx.shadowColor = "#18254caa";
  ctx.shadowBlur = 15;
  ctx.drawImage(cutout, -width / 2, -height, width, height);
  ctx.restore();
  return true;
}

function drawFighter(f) {
  const wave = Math.sin(f.anim);
  const jumping = Math.abs(f.vy) > 1.2;
  const bob = wave * (f.walking ? 13 : 6);
  const breathing = 1 + Math.sin(f.anim * .55) * .025;
  const jumpStretch = jumping ? 1.1 : 1;
  const jumpSquish = jumping ? .93 : 1;
  const attackPhase = f.attackTimer > 0 ? 1 - f.attackTimer / 13 : 0;
  const attackSwing = Math.sin(attackPhase * Math.PI);
  const attackStretch = f.attackTimer > 0 ? (f.action === "range" ? 1.12 : 1.25) : 1;
  const attackPush = f.attackTimer > 0 ? (f.action === "range" ? -8 * attackSwing : f.action === "special" || f.action === "super" ? 14 * attackSwing : 24 * attackSwing) : 0;
  const attackLift = f.attackTimer > 0 ? (f.action === "range" ? 4 * attackSwing : -8 * attackSwing) : 0;
  const tilt = f.attackTimer > 0 ? (f.action === "range" ? .12 : f.action === "special" || f.action === "super" ? -.08 : -.28) * attackSwing : jumping ? Math.max(-.18, Math.min(.18, f.vy * .025)) : f.walking ? wave * .16 : wave * .04;
  const fighterScale = (f.boss ? 1.5 : 1) * (f.battleScale || 1);
  ctx.save(); ctx.translate(f.x + f.facing * attackPush, f.y + bob + attackLift); ctx.rotate(tilt); ctx.scale(f.facing * attackStretch * breathing * jumpSquish * fighterScale, (f.attackTimer > 0 ? .88 : 1) * breathing * jumpStretch * fighterScale);
  if (f.walking) {
    ctx.fillStyle = "#ffffffa8";
    for (let puff = 0; puff < 4; puff++) { ctx.beginPath(); ctx.ellipse(-30 - puff * 15, 4 + puff * 3 + Math.abs(wave) * 4, 13 - puff * 2, 5, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  if (f.hitFlash > 0) ctx.globalAlpha = .55;
  const omega = f.omegaTimer > 0;
  if (omega) { ctx.shadowColor="#9a7cff"; ctx.shadowBlur=28; ctx.fillStyle="#9d7aff44"; ctx.beginPath(); ctx.arc(0,-48,75,0,Math.PI*2); ctx.fill(); }
  if (f.starTimer > 0) { ctx.strokeStyle="#fff05a"; ctx.lineWidth=7; ctx.shadowColor="#ffe24a"; ctx.shadowBlur=22; ctx.beginPath(); ctx.arc(0,-53,66,0,Math.PI*2); ctx.stroke(); }
  if (f.frozenTimer > 0) { ctx.strokeStyle="#b4f5ff"; ctx.lineWidth=6; ctx.shadowColor="#65dbff"; ctx.shadowBlur=18; ctx.beginPath(); ctx.arc(0,-53,58,0,Math.PI*2); ctx.stroke(); }
  if (f.shielding) { ctx.strokeStyle="#75dbff"; ctx.lineWidth=7; ctx.shadowColor="#66d6ff"; ctx.shadowBlur=22; ctx.beginPath(); ctx.arc(0,-53,62,0,Math.PI*2); ctx.stroke(); }
  ctx.fillStyle = "#17284d"; ctx.beginPath(); ctx.ellipse(0, 5, 39, 13, 0, 0, Math.PI*2); ctx.fill();
  if (!drawBattlePortrait(f)) drawCharacterArt(ctx, f);
  if (f.attackTimer > 0) {
    if (f.action === "range") {
      ctx.fillStyle = omega ? "#8cfff2" : "#fff6aa";
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(57, -54, 13 + attackSwing * 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffb13f";
      ctx.beginPath(); ctx.arc(57, -54, 5 + attackSwing * 4, 0, Math.PI * 2); ctx.fill();
    } else if (f.action === "special" || f.action === "super") {
      ctx.strokeStyle = omega || f.action === "super" ? "#8cfff2" : "#ff8b58";
      ctx.lineWidth = 10; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.arc(0, -58, 45 + attackSwing * 22, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.strokeStyle = omega ? "#8cfff2" : "#fff05a";
      ctx.lineWidth = 9; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(23, -58, 49 + attackSwing * 11, -1.2, 1.2); ctx.stroke();
    }
  }
  ctx.restore();
  if (f.emoteTimer > 0 && f.emoteText) {
    const text = f.emoteText;
    ctx.save();
    ctx.font = "900 15px system-ui";
    const width = Math.min(185, Math.max(76, ctx.measureText(text).width + 26));
    const height = 34;
    const x = Math.max(width / 2 + 6, Math.min(canvas.width - width / 2 - 6, f.x));
    const y = Math.max(34, f.y - 145);
    ctx.fillStyle = "#fffdf2";
    ctx.strokeStyle = "#283866";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - width / 2, y - height / 2, width, height, 15);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 8, y + height / 2 - 1);
    ctx.lineTo(x + 2, y + height / 2 + 11);
    ctx.lineTo(x + 10, y + height / 2 - 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#263866";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 1);
    ctx.restore();
  }
  ctx.fillStyle="#17284d";ctx.font="bold 15px system-ui";ctx.textAlign="center";ctx.fillText(f.name, f.x, f.y+35);
  if (f.powerUpTimer > 0) { ctx.fillStyle=f.powerUp === "sword" ? "#1daed1" : "#b47912";ctx.font="bold 12px system-ui";ctx.fillText(`${f.powerUp === "sword" ? "SWORD" : "PISTOL"} ${Math.ceil(f.powerUpTimer/60)}s`,f.x,f.y+52); }
  if (f.omegaTimer > 0) { ctx.fillStyle="#6945e2";ctx.font="bold 12px system-ui";ctx.fillText(`OMEGA ${Math.ceil(f.omegaTimer/60)}s`,f.x,f.y + (f.powerUpTimer > 0 ? 68 : 52)); }
}

function drawTankCharge(tank) {
  const direction = Math.sign(tank.vx) || 1;
  ctx.save();
  ctx.translate(tank.x, tank.y);
  ctx.scale(direction, 1);
  ctx.fillStyle = "#14203499";
  ctx.beginPath();
  ctx.ellipse(0, 10, 83, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#27313b";
  ctx.fillRect(-72, -42, 144, 45);
  ctx.fillStyle = "#526232";
  ctx.fillRect(-61, -67, 122, 38);
  ctx.fillStyle = "#71864c";
  ctx.beginPath();
  ctx.roundRect(-45, -95, 75, 42, 14);
  ctx.fill();
  ctx.fillStyle = "#3d492c";
  ctx.fillRect(14, -84, 84, 16);
  ctx.fillStyle = "#d8ab44";
  ctx.fillRect(85, -87, 13, 22);
  ctx.fillStyle = "#b9c16a";
  ctx.fillRect(-40, -61, 85, 5);
  ctx.fillStyle = "#151d27";
  [-48, -16, 16, 48].forEach((x) => { ctx.beginPath(); ctx.arc(x, -17, 15, 0, Math.PI * 2); ctx.fill(); });
  ctx.fillStyle = "#8f9954";
  [-48, -16, 16, 48].forEach((x) => { ctx.beginPath(); ctx.arc(x, -17, 8, 0, Math.PI * 2); ctx.fill(); });
  ctx.restore();
}

function drawStageHazard(hazard) {
  const size = hazard.size;
  ctx.save();
  ctx.translate(hazard.x, hazard.y);
  ctx.rotate(hazard.rotation);
  ctx.shadowColor = hazard.color;
  ctx.shadowBlur = hazard.kind === "lightning" || hazard.kind === "electric" ? 22 : 8;
  if (hazard.kind === "rock" || hazard.kind === "meteor") {
    ctx.fillStyle = hazard.color;
    ctx.beginPath();
    for (let point = 0; point < 7; point += 1) {
      const angle = (Math.PI * 2 * point) / 7;
      const radius = size * (point % 2 ? .78 : 1);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (point === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    if (hazard.kind === "meteor") {
      ctx.fillStyle = "#ffe270";
      ctx.beginPath();
      ctx.moveTo(-size * 1.7, 0);
      ctx.lineTo(-size * .75, -size * .45);
      ctx.lineTo(-size * .75, size * .45);
      ctx.closePath();
      ctx.fill();
    }
  } else if (hazard.kind === "cannonball") {
    ctx.fillStyle = "#313742";
    ctx.beginPath(); ctx.arc(0, 0, size, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#879098"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(-size * .22, -size * .22, size * .42, .4, Math.PI * 1.6); ctx.stroke();
  } else if (hazard.kind === "ice" || hazard.kind === "crystal") {
    ctx.fillStyle = hazard.color;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.2); ctx.lineTo(size * .72, 0); ctx.lineTo(0, size * 1.08); ctx.lineTo(-size * .72, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#e4ffff";
    ctx.beginPath(); ctx.moveTo(0, -size * 1.05); ctx.lineTo(size * .3, 0); ctx.lineTo(0, size * .1); ctx.closePath(); ctx.fill();
  } else if (hazard.kind === "coconut") {
    ctx.fillStyle = "#7d4927";
    ctx.beginPath(); ctx.ellipse(0, 0, size * .8, size, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#c58a4b"; ctx.lineWidth = 3;
    [-.35, 0, .35].forEach((line) => { ctx.beginPath(); ctx.moveTo(size * line, -size * .72); ctx.lineTo(size * line, size * .72); ctx.stroke(); });
  } else if (hazard.kind === "lightning" || hazard.kind === "electric") {
    ctx.strokeStyle = hazard.color; ctx.lineWidth = Math.max(5, size * .28);
    ctx.beginPath(); ctx.moveTo(0, -size); ctx.lineTo(-size * .34, -size * .16); ctx.lineTo(size * .12, -size * .16); ctx.lineTo(-size * .22, size); ctx.stroke();
  } else if (hazard.kind === "gear") {
    ctx.fillStyle = hazard.color;
    ctx.beginPath();
    for (let tooth = 0; tooth < 16; tooth += 1) {
      const angle = (Math.PI * 2 * tooth) / 16;
      const radius = tooth % 2 ? size * .7 : size;
      if (tooth === 0) ctx.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius); else ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#52646b"; ctx.beginPath(); ctx.arc(0, 0, size * .38, 0, Math.PI * 2); ctx.fill();
  } else if (hazard.kind === "gumdrop") {
    ctx.fillStyle = hazard.color;
    ctx.beginPath(); ctx.arc(0, 0, size, Math.PI, 0); ctx.lineTo(size, size * .6); ctx.lineTo(-size, size * .6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#fff2ff"; ctx.beginPath(); ctx.arc(-size * .3, -size * .35, size * .16, 0, Math.PI * 2); ctx.fill();
  } else if (hazard.kind === "book") {
    ctx.fillStyle = "#d5a14e";
    ctx.fillRect(-size, -size * .72, size * 2, size * 1.44);
    ctx.fillStyle = hazard.color;
    ctx.fillRect(-size * .8, -size * .56, size * 1.6, size * 1.12);
    ctx.strokeStyle = "#f6df8b"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -size * .52); ctx.lineTo(0, size * .52); ctx.stroke();
  } else if (hazard.kind === "block" || hazard.kind === "crate") {
    ctx.fillStyle = hazard.color;
    ctx.fillRect(-size, -size, size * 2, size * 2);
    ctx.strokeStyle = "#fff0a8"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-size, -size); ctx.lineTo(size, size); ctx.moveTo(size, -size); ctx.lineTo(-size, size); ctx.stroke();
  }
  ctx.restore();
}

function drawProjectile(projectile) {
  ctx.save();
  if (projectile.beeStinger) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.rotate(Math.sin(projectile.life * .32) * .22);
    ctx.shadowColor = "#ffe85a"; ctx.shadowBlur = 15;
    ctx.fillStyle = "#f5c62e";
    ctx.beginPath(); ctx.ellipse(0, 0, size, size * .52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#343340";
    [-.28, .12].forEach((offset) => ctx.fillRect(size * offset, -size * .48, size * .18, size * .96));
    ctx.fillStyle = "#fff8d7";
    ctx.beginPath(); ctx.ellipse(-size * .25, -size * .55, size * .52, size * .22, -.45, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2c2933";
    ctx.beginPath(); ctx.moveTo(size, 0); ctx.lineTo(size * 1.7, 0); ctx.lineTo(size * .98, size * .22); ctx.closePath(); ctx.fill();
  } else if (projectile.bambooShoot) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .2 * direction);
    ctx.shadowColor = "#8fdd5a"; ctx.shadowBlur = 12;
    ctx.fillStyle = "#5ca53e";
    ctx.beginPath(); ctx.roundRect(-size * 1.2, -size * .35, size * 2.4, size * .7, size * .25); ctx.fill();
    ctx.strokeStyle = "#d3f59b"; ctx.lineWidth = Math.max(2, size * .12);
    [-.45, .1, .63].forEach((mark) => { ctx.beginPath(); ctx.moveTo(size * mark, -size * .33); ctx.lineTo(size * mark, size * .33); ctx.stroke(); });
    ctx.fillStyle = "#e4ffad";
    ctx.beginPath(); ctx.moveTo(size * 1.2, 0); ctx.lineTo(size * .68, -size * .42); ctx.lineTo(size * .68, size * .42); ctx.closePath(); ctx.fill();
  } else if (projectile.leafSlash) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .24 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#76c84e";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#66af42";
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.15, size * .48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#e9ff9a";
    ctx.lineWidth = Math.max(2, size * .12);
    ctx.beginPath();
    ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
    ctx.stroke();
    ctx.fillStyle = "#d8ff8b";
    ctx.beginPath();
    ctx.moveTo(size * 1.12, 0); ctx.lineTo(size * .54, -size * .25); ctx.lineTo(size * .54, size * .25); ctx.closePath();
    ctx.fill();
  } else if (projectile.shadowClaw) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.shadowColor = "#9baeff";
    ctx.shadowBlur = 18;
    ctx.strokeStyle = "#c7d4ff";
    ctx.lineWidth = Math.max(2.5, size * .15);
    ctx.lineCap = "round";
    [-.38, 0, .38].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(-size * .9, offset * size);
      ctx.quadraticCurveTo(size * .05, (offset - .35) * size, size * 1.05, offset * size);
      ctx.stroke();
    });
  } else if (projectile.venomSpit) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.rotate(Math.sin(projectile.life * .25) * .16);
    ctx.shadowColor = "#8ce34f";
    ctx.shadowBlur = 18;
    const venom = ctx.createLinearGradient(-size, -size, size, size);
    venom.addColorStop(0, "#d5ff8b");
    venom.addColorStop(.5, "#8de042");
    venom.addColorStop(1, "#3c922c");
    ctx.fillStyle = venom;
    ctx.beginPath();
    ctx.moveTo(size * 1.1, 0);
    ctx.quadraticCurveTo(size * .2, -size * .8, -size * .75, -size * .28);
    ctx.quadraticCurveTo(-size * 1.1, 0, -size * .75, size * .28);
    ctx.quadraticCurveTo(size * .2, size * .8, size * 1.1, 0);
    ctx.fill();
    ctx.fillStyle = "#f2ffc3";
    ctx.beginPath();
    ctx.arc(size * .28, -size * .16, Math.max(2, size * .2), 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.fireBreath) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.shadowColor = "#ff5725";
    ctx.shadowBlur = 20;
    const flame = ctx.createLinearGradient(-size, 0, size, 0);
    flame.addColorStop(0, "#ffca45");
    flame.addColorStop(.48, "#ff7927");
    flame.addColorStop(1, "#d93622");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.quadraticCurveTo(-size * .2, -size * .85, size * 1.2, 0);
    ctx.quadraticCurveTo(-size * .2, size * .85, -size, 0);
    ctx.fill();
    ctx.fillStyle = "#fff2a8";
    ctx.beginPath();
    ctx.ellipse(-size * .15, 0, size * .48, size * .25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.granolaBar) {
    const direction = Math.sign(projectile.vx) || 1;
    const length = projectile.size * 1.65;
    const height = projectile.size * .72;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(direction * projectile.life * .18);
    ctx.shadowColor = "#9a6024";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#e7b954";
    ctx.fillRect(-length / 2, -height / 2, length, height);
    ctx.fillStyle = "#9b5a2c";
    ctx.fillRect(-length / 2 + 4, -height / 2 + 3, length - 8, height - 6);
    ctx.fillStyle = "#f7da83";
    [-.28, 0, .28].forEach((spot) => {
      ctx.beginPath();
      ctx.arc(length * spot, 0, Math.max(1.5, projectile.size * .1), 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (projectile.fossilBoulder) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .13 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#34281f";
    ctx.shadowBlur = 8;
    const boulder = [[-1, -.08], [-.62, -.74], [.08, -.92], [.76, -.52], [1, .1], [.58, .78], [-.12, .93], [-.78, .55]];
    const rockShade = ctx.createLinearGradient(-size, -size, size, size);
    rockShade.addColorStop(0, "#c8ad84");
    rockShade.addColorStop(.42, "#8e765b");
    rockShade.addColorStop(1, "#4f4034");
    ctx.fillStyle = rockShade;
    ctx.beginPath();
    boulder.forEach(([x, y], point) => { if (point === 0) ctx.moveTo(x * size, y * size); else ctx.lineTo(x * size, y * size); });
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#d5bea0";
    ctx.beginPath();
    ctx.moveTo(-size * .58, -size * .62); ctx.lineTo(size * .08, -size * .89); ctx.lineTo(size * .5, -size * .42); ctx.lineTo(-size * .1, -size * .12); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#695848";
    ctx.beginPath();
    ctx.moveTo(-size * .1, -size * .12); ctx.lineTo(size * .5, -size * .42); ctx.lineTo(size * .76, size * .16); ctx.lineTo(size * .14, size * .72); ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#3f332b";
    ctx.lineWidth = Math.max(1.5, size * .075);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-size * .7, size * .18); ctx.lineTo(-size * .25, size * .02); ctx.lineTo(-size * .05, size * .28); ctx.lineTo(size * .3, size * .12);
    ctx.moveTo(size * .2, -size * .68); ctx.lineTo(size * .02, -size * .3); ctx.lineTo(size * .26, -size * .04);
    ctx.stroke();
  } else if (projectile.blackFeather) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.rotate(Math.sin(projectile.life * .25) * .18);
    ctx.shadowColor = "#8064b8";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#202330";
    ctx.beginPath();
    ctx.moveTo(size * 1.1, 0);
    ctx.quadraticCurveTo(0, -size * .6, -size * .85, 0);
    ctx.quadraticCurveTo(0, size * .6, size * 1.1, 0);
    ctx.fill();
    ctx.strokeStyle = "#a29ab4";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * .8, 0);
    ctx.lineTo(size * 1.05, 0);
    ctx.stroke();
  } else if (projectile.eagleFeather) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.rotate(Math.sin(projectile.life * .25) * .2);
    ctx.shadowColor = "#ffe19a";
    ctx.shadowBlur = 12;
    const feather = ctx.createLinearGradient(-size, 0, size, 0);
    feather.addColorStop(0, "#875523");
    feather.addColorStop(.5, "#f3d27b");
    feather.addColorStop(1, "#fff4ca");
    ctx.fillStyle = feather;
    ctx.beginPath();
    ctx.moveTo(size * 1.15, 0);
    ctx.quadraticCurveTo(0, -size * .62, -size * .9, 0);
    ctx.quadraticCurveTo(0, size * .62, size * 1.15, 0);
    ctx.fill();
    ctx.strokeStyle = "#fff8da";
    ctx.lineWidth = Math.max(1.5, size * .11);
    ctx.beginPath();
    ctx.moveTo(-size * .82, 0);
    ctx.lineTo(size * 1.08, 0);
    ctx.stroke();
  } else if (projectile.snowball) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .1 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#b8eaff";
    ctx.shadowBlur = 14;
    const snow = ctx.createRadialGradient(-size * .28, -size * .3, size * .08, 0, 0, size);
    snow.addColorStop(0, "#ffffff");
    snow.addColorStop(.58, "#d9f3ff");
    snow.addColorStop(1, "#85bfd9");
    ctx.fillStyle = snow;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c7eaff";
    ctx.lineWidth = Math.max(1.5, size * .1);
    ctx.beginPath();
    ctx.arc(0, 0, size * .7, .4, Math.PI * 1.65);
    ctx.stroke();
  } else if (projectile.cobraVenom) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .12 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#a9f359";
    ctx.shadowBlur = 20;
    const venom = ctx.createRadialGradient(-size * .28, -size * .28, size * .08, 0, 0, size);
    venom.addColorStop(0, "#f2ffb1");
    venom.addColorStop(.45, "#a4e84f");
    venom.addColorStop(1, "#327c3c");
    ctx.fillStyle = venom;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#efffc1";
    ctx.lineWidth = Math.max(1.5, size * .1);
    ctx.beginPath();
    ctx.arc(0, 0, size * .62, .2, Math.PI * 1.7);
    ctx.stroke();
  } else if (projectile.plasmaTornado) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(direction * projectile.life * .09);
    ctx.shadowColor = "#32b7ff";
    ctx.shadowBlur = 22;
    ctx.strokeStyle = "#52ccff";
    ctx.lineWidth = Math.max(3, size * .16);
    for (let ring = 0; ring < 4; ring += 1) {
      const y = -size * .7 + ring * size * .46;
      const width = size * (.5 + ring * .22);
      ctx.beginPath();
      ctx.ellipse(0, y, width, Math.max(3, size * .13), 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = "#d5f7ff";
    ctx.lineWidth = Math.max(2, size * .09);
    ctx.beginPath();
    ctx.moveTo(-size * .32, -size * .75);
    ctx.lineTo(size * .25, -size * .28);
    ctx.lineTo(-size * .18, size * .12);
    ctx.lineTo(size * .42, size * .62);
    ctx.stroke();
  } else if (projectile.crystalShard) {
    const size = projectile.size;
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(direction * projectile.life * .12);
    ctx.shadowColor = "#4effe6";
    ctx.shadowBlur = 20;
    ctx.fillStyle = "#42d8cf";
    ctx.beginPath();
    ctx.moveTo(size * 1.15, 0);
    ctx.lineTo(0, -size * .58);
    ctx.lineTo(-size * .8, 0);
    ctx.lineTo(0, size * .58);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#bafff5";
    ctx.beginPath();
    ctx.moveTo(size * .88, 0);
    ctx.lineTo(0, -size * .4);
    ctx.lineTo(0, size * .05);
    ctx.closePath();
    ctx.fill();
  } else if (projectile.electricGear) {
    const teeth = 8;
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .23 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#b35cff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#51317e";
    ctx.beginPath();
    for (let tooth = 0; tooth < teeth * 2; tooth += 1) {
      const angle = (Math.PI * 2 * tooth) / (teeth * 2);
      const radius = tooth % 2 === 0 ? size : size * .7;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (tooth === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d68cff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-size * .55, -size * .1);
    ctx.lineTo(-size * .1, size * .18);
    ctx.lineTo(size * .08, -size * .28);
    ctx.lineTo(size * .52, size * .06);
    ctx.stroke();
    ctx.fillStyle = "#f3d8ff";
    ctx.beginPath();
    ctx.arc(0, 0, size * .22, 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.metalGear) {
    const teeth = 10;
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .2 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#70e5df";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#aabcc2";
    ctx.beginPath();
    for (let tooth = 0; tooth < teeth * 2; tooth += 1) {
      const angle = (Math.PI * 2 * tooth) / (teeth * 2);
      const radius = tooth % 2 === 0 ? size : size * .72;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (tooth === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#5b6d73";
    ctx.beginPath();
    ctx.arc(0, 0, size * .5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#dceef0";
    ctx.beginPath();
    ctx.arc(0, 0, size * .22, 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.bubble) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.globalAlpha = .48;
    ctx.fillStyle = "#69cfff";
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#d5f8ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#58d7ff";
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(-size * .32, -size * .34, Math.max(2, size * .18), 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.flyingWrench) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .17 * (Math.sign(projectile.vx) || 1));
    ctx.strokeStyle = "#c7d4d8";
    ctx.lineWidth = Math.max(5, size * .34);
    ctx.lineCap = "round";
    ctx.shadowColor = "#83d4df";
    ctx.shadowBlur = 9;
    ctx.beginPath();
    ctx.moveTo(-size * .82, 0);
    ctx.lineTo(size * .28, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(size * .35, 0, size * .48, .7, Math.PI * 2 - .7);
    ctx.stroke();
    ctx.fillStyle = "#6e8087";
    ctx.beginPath();
    ctx.arc(-size * .86, 0, size * .2, 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.sodaCan) {
    const size = projectile.size;
    ctx.translate(projectile.x, projectile.y);
    ctx.rotate(projectile.life * .16 * (Math.sign(projectile.vx) || 1));
    ctx.shadowColor = "#ff7b57";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "#d94f48";
    ctx.fillRect(-size * .46, -size * .82, size * .92, size * 1.64);
    ctx.fillStyle = "#f3f0d8";
    ctx.fillRect(-size * .46, -size * .14, size * .92, size * .26);
    ctx.fillStyle = "#c9d5d5";
    ctx.beginPath();
    ctx.ellipse(0, -size * .82, size * .46, size * .16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#657477";
    ctx.beginPath();
    ctx.arc(0, -size * .82, size * .12, 0, Math.PI * 2);
    ctx.fill();
  } else if (projectile.rifleBullet) {
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.shadowColor = "#ffad32";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#f8c65a";
    ctx.fillRect(-12, -3, 18, 6);
    ctx.fillStyle = "#fff0a2";
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(4, -5);
    ctx.lineTo(4, 5);
    ctx.closePath();
    ctx.fill();
  } else if (projectile.gunBullet) {
    ctx.strokeStyle = projectile.bulletColor || "#fff6a4";
    ctx.shadowColor = projectile.sniper ? "#5cf6ff" : (projectile.bulletColor || "#ff9d22");
    ctx.shadowBlur = projectile.sniper ? 22 : 13;
    ctx.lineWidth = projectile.sniper ? 2 : 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(projectile.x - projectile.vx * (projectile.bulletLength || 1.5), projectile.y - (projectile.vy || 0) * (projectile.bulletLength || 1.5));
    ctx.lineTo(projectile.x, projectile.y);
    ctx.stroke();
    if (projectile.sniper) {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (projectile.rocket) {
    const direction = Math.sign(projectile.vx) || 1;
    ctx.translate(projectile.x, projectile.y);
    ctx.scale(direction, 1);
    ctx.shadowColor = projectile.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#f1eed8";
    ctx.fillRect(-15, -6, 27, 12);
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.lineTo(7, -10);
    ctx.lineTo(7, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffc94f";
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-27, -7);
    ctx.lineTo(-27, 7);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.shadowColor = projectile.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = projectile.color;
    if (projectile.beam) {
      ctx.globalAlpha = .5;
      ctx.fillRect(projectile.x - 120, 0, 240, canvas.height);
    } else {
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function draw() {
  drawBackground();
  game.tankCharges.forEach(drawTankCharge);
  game.hazards.forEach(drawStageHazard);
  game.projectiles.forEach(drawProjectile);
  game.apples.forEach(drawApple);
  game.powerUps.forEach(drawPowerUp);
  drawFighter(game.player); drawFighter(game.enemy);
  game.sparks.forEach((s) => { ctx.fillStyle=s.color;ctx.globalAlpha=s.life/36;ctx.fillRect(s.x,s.y,5,5); });ctx.globalAlpha=1;
  [game.player,game.enemy].forEach((f,i)=>{ctx.fillStyle="#ffffffcc";ctx.fillRect(i?canvas.width-195:25,25,170,12);ctx.fillStyle=f.color;ctx.fillRect(i?canvas.width-195:25,25,170*f.super/100,12);});
}

function loop(now) {
  if (!game || game.ended) return;
  const dt = Math.min(40, now-lastTime); lastTime=now;
  if (onlineIsGuest()) {
    sendOnlineControls(now);
    draw();
    animationFrame = requestAnimationFrame(loop);
    return;
  }
  if (game.countdownMs > 0) {
    game.countdownMs = Math.max(0, game.countdownMs - dt);
    const countdownText = game.countdownMs > 0 ? String(Math.ceil(game.countdownMs / 1000)) : "FIGHT!";
    if (countdownText !== game.countdownText) {
      game.countdownText = countdownText;
      if (countdownText === "FIGHT!") {
        game.startedAt = performance.now();
        flashMessage("FIGHT!", 70);
      } else {
        $("battle-message").textContent = countdownText;
        $("battle-message").classList.add("show");
      }
    }
    publishOnlineState(now);
    draw();
    animationFrame = requestAnimationFrame(loop);
    return;
  }
  if (updateBattleTimer(dt)) return;
  playerInput();
  if (game.mode === "two-player") secondPlayerInput();
  else if (onlineIsHost()) {
    applyOnlineControls(game.enemy, onlineMatch.remoteInput, onlineMatch.previousRemoteInput);
    onlineMatch.previousRemoteInput = { ...onlineMatch.remoteInput };
  } else enemyAI();
  updateFighter(game.player); updateFighter(game.enemy); updateProjectiles(); updateTankCharges(); updateStageHazards(dt); updateApples(dt); updatePowerUps(dt);
  if (game.messageTimer > 0) { game.messageTimer--; if (game.messageTimer === 0) $("battle-message").classList.remove("show"); }
  publishOnlineState(now);
  draw(); animationFrame=requestAnimationFrame(loop);
}

function endBattle(playerWon, timeRanOut = false) {
  if (game.ended) return;
  game.ended = true;
  if (!playerWon && game.mode !== "training") profile.winStreak = 0;
  const onlineBattle = game.mode === "online-host";
  const trophyMessage = recordBattleTrophy(playerWon);
  const completedSeconds = game.startedAt ? Math.max(0, Math.floor((performance.now() - game.startedAt) / 1000)) : 0;
  const coinsWon = (playerWon || game.mode === "two-player") && game.mode !== "training" ? rewardWinCoins(game.player, completedSeconds) : null;
  if (!coinsWon && game.mode !== "training") saveProfile();
  const rewardText = coinsWon?.bossMultiplier > 1
    ? `+${coinsWon.reward} ${coinIcon}! ${coinsWon.bossMultiplier}× BOSS BATTLE REWARD!${coinsWon.arenaUnlockMessage}${coinsWon.achievementMessage}${coinsWon.seasonalRewardMessage || ""}`
    : coinsWon ? `+${coinsWon.reward} ${coinIcon}! ${coinsWon.battleCoins} for winning + ${coinsWon.speedBonus} speed bonus.${coinsWon.arenaUnlockMessage}${coinsWon.achievementMessage}` : "";
  cancelAnimationFrame(animationFrame);
  flashMessage(timeRanOut ? "TIME'S UP!" : playerWon ? "YOU WIN!" : "OH NO!", 60);
  if (onlineBattle) {
    const result = {
      matchId: window.RumbleOnline.getRoom()?.matchId || `${onlineMatch.roomCode}-${Date.now()}`,
      winnerSlot: playerWon ? "p1" : "p2",
      winnerName: (playerWon ? game.player : game.enemy).name,
      timeRanOut,
      completedSeconds,
    };
    window.RumbleOnline.publishResult(result).catch(() => {});
  }
  setTimeout(() => {
    const winner = playerWon ? game.player : game.enemy;
    if (game.mode === "two-player") {
      $("result-kicker").textContent = timeRanOut ? "TIME'S UP!" : "THE ARENA CHEERS!";
      $("result-title").textContent = playerWon ? "P1 WINS!" : "P2 WINS!";
      $("result-copy").textContent = timeRanOut ? `${winner.name} had more health when time ran out!` : `${winner.name} is the Rumble Rivals champion!`;
      $("coin-reward").innerHTML = rewardText;
      $("trophy-reward").textContent = trophyMessage;
    } else {
      $("result-kicker").textContent = game.mode === "boss" || game.mode === "seasonal-boss" ? playerWon ? "BOSS DEFEATED!" : "THE BOSS WAS TOO STRONG!" : timeRanOut ? "TIME'S UP!" : playerWon ? "THE ARENA CHEERS!" : "KEEP PRACTICING!";
      $("result-title").textContent = game.mode === "boss" || game.mode === "seasonal-boss" ? playerWon ? "BOSS BEATEN!" : "TRY AGAIN!" : playerWon ? "YOU WIN!" : timeRanOut ? "TIME'S UP!" : "TRY AGAIN!";
      $("result-copy").textContent = timeRanOut ? `${playerWon ? game.player.name : game.enemy.name} had more health when time ran out!` : playerWon ? `${game.player.name} is the Rumble Rivals champion!` : `${game.enemy.name} won this round. You can get them next time!`;
      $("coin-reward").innerHTML = playerWon ? rewardText : `You have ${profile.coins} ${coinIcon}. Win the next battle to earn more!`;
      $("trophy-reward").textContent = trophyMessage;
    }
    if (playerWon) {
      showWinConfetti();
    } else {
      $("win-confetti").innerHTML = "";
    }
    showScreen("result");
  }, 850);
}

function showWinConfetti() {
  const confetti = $("win-confetti");
  confetti.innerHTML = "";
  const colors = ["#ff4f8b", "#ffd447", "#5de1c6", "#4aa8ff", "#8e68ed", "#ff9b45", "#ff6ee7", "#72f1ff"];
  for (let pieceNumber = 0; pieceNumber < 5000; pieceNumber++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.setProperty("--left", `${-35 + Math.random() * 170}%`);
    piece.style.setProperty("--top", `${-320 + Math.random() * 440}px`);
    piece.style.setProperty("--color", colors[pieceNumber % colors.length]);
    piece.style.setProperty("--drift", `${-800 + Math.random() * 1600}px`);
    piece.style.setProperty("--delay", `${Math.random() * .45}s`);
    piece.style.setProperty("--fall-time", `${1.4 + Math.random() * 1.1}s`);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
  }
  window.setTimeout(() => { confetti.innerHTML = ""; }, 3400);
}

function onlineFighter(id, weaponLevel) {
  const fighter = roster.find((item) => item.id === id);
  return fighter ? { ...fighter, weaponLevel: Math.max(0, Number(weaponLevel) || 0) } : null;
}

function startOnlineBattle(room) {
  if (onlineMatch.battleStarted || !room?.hostFighter || !room?.guestFighter) return;
  const hostFighter = onlineFighter(room.hostFighter, room.hostWeaponLevel);
  const guestFighter = onlineFighter(room.guestFighter, room.guestWeaponLevel);
  const stage = stages.find((item) => item.id === room.stageId);
  if (!hostFighter || !guestFighter || !stage) return;
  onlineMatch.battleStarted = true;
  chosenStage = stage;
  matchSettings = { ...matchSettings, ...(room.settings || {}) };
  if (onlineIsHost()) {
    onlineMatch.unlistenInput = window.RumbleOnline.onInput("p2", (input) => { onlineMatch.remoteInput = input || {}; });
  }
  startBattle(hostFighter, guestFighter);
  if (onlineIsGuest() && room.state) applyOnlineSnapshot(room.state);
}

function claimedOnlineMatch(matchId) {
  try {
    const claimed = JSON.parse(localStorage.getItem("rumble-rivals-online-results") || "[]");
    return Array.isArray(claimed) && claimed.includes(matchId);
  } catch { return false; }
}

function rememberOnlineMatch(matchId) {
  try {
    const claimed = JSON.parse(localStorage.getItem("rumble-rivals-online-results") || "[]");
    const next = [...new Set([...(Array.isArray(claimed) ? claimed : []), matchId])].slice(-100);
    localStorage.setItem("rumble-rivals-online-results", JSON.stringify(next));
  } catch { /* The one-time reward still works during this visit. */ }
}

function showOnlineGuestResult(result) {
  if (!onlineIsGuest() || !result?.matchId || onlineMatch.handledResult === result.matchId) return;
  onlineMatch.handledResult = result.matchId;
  const playerWon = result.winnerSlot === "p2";
  let trophyMessage = "";
  let coinsWon = null;
  if (!claimedOnlineMatch(result.matchId)) {
    if (!playerWon) profile.winStreak = 0;
    trophyMessage = recordBattleTrophy(playerWon);
    coinsWon = playerWon ? rewardWinCoins(game.enemy, result.completedSeconds || 0) : null;
    if (!coinsWon) saveProfile();
    rememberOnlineMatch(result.matchId);
  } else {
    trophyMessage = "This match was already counted.";
  }
  const rewardText = coinsWon ? `+${coinsWon.reward} ${coinIcon}! ${coinsWon.battleCoins} for winning + ${coinsWon.speedBonus} speed bonus.${coinsWon.arenaUnlockMessage}${coinsWon.achievementMessage}` : playerWon ? "Your rewards were already counted." : `You have ${profile.coins} ${coinIcon}. Win the next battle to earn more!`;
  $("result-kicker").textContent = result.timeRanOut ? "TIME'S UP!" : "THE ARENA CHEERS!";
  $("result-title").textContent = playerWon ? "YOU WIN!" : "TRY AGAIN!";
  $("result-copy").textContent = result.timeRanOut ? `${result.winnerName} had more health when time ran out!` : `${result.winnerName} is the Rumble Rivals champion!`;
  $("coin-reward").innerHTML = rewardText;
  $("trophy-reward").textContent = trophyMessage;
  if (playerWon) showWinConfetti(); else $("win-confetti").innerHTML = "";
  if (game) game.ended = true;
  cancelAnimationFrame(animationFrame);
  showScreen("result");
}

function handleOnlineRoom(room) {
  if (!onlineMatch.role || !room) return;
  if (room.settings?.gameVersion && room.settings.gameVersion !== window.RumbleOnline.version) {
    setOnlineLobbyMessage("Your friend has a different game version. Both players should reload the game.");
    showScreen("online-lobby");
    return;
  }
  const friendUid = onlineIsHost() ? room.guestUid : room.hostUid;
  const friendConnected = friendUid && room.players?.[friendUid]?.connected !== false;
  if (room.status === "abandoned" || (friendUid && !friendConnected && room.status !== "finished")) {
    cancelAnimationFrame(animationFrame);
    setOnlineLobbyMessage("Your friend left the room or lost their connection.");
    showScreen("online-lobby");
    return;
  }
  if (onlineIsHost() && room.hostFighter && room.guestFighter && room.status !== "playing" && room.status !== "finished" && !onlineMatch.battleStarted && !onlineMatch.starting) {
    onlineMatch.starting = true;
    window.RumbleOnline.startMatch().then(() => startOnlineBattle(window.RumbleOnline.getRoom() || room)).catch((error) => {
      onlineMatch.starting = false;
      setOnlineLobbyMessage(error.message || "Could not start the online battle.");
    });
    return;
  }
  if (onlineIsGuest() && room.hostFighter && !room.guestFighter && !$("select").classList.contains("active")) {
    buildRoster();
    showFighterSelection();
    showScreen("select");
  }
  if (room.status === "playing") {
    if (!onlineMatch.battleStarted) startOnlineBattle(room);
    if (onlineIsGuest() && room.state) applyOnlineSnapshot(room.state);
  }
  if (room.status === "finished" && room.result) showOnlineGuestResult(room.result);
}

window.RumbleOnline?.subscribe((event) => {
  if (event.type === "room") handleOnlineRoom(event.room);
  if (event.type === "error" && onlineMatch.role) setOnlineLobbyMessage(event.message);
});

$("start-button").addEventListener("click", startLoading);
$("solo-play-button").addEventListener("click", () => { activeSeasonalEvent = null; matchMode = "computer"; playerOneChoice = null; showScreen("stages"); });
$("two-player-button").addEventListener("click", () => { activeSeasonalEvent = null; matchMode = "two-player"; playerOneChoice = null; showScreen("stages"); });
$("find-friend-button").addEventListener("click", () => showOnlineLobby("host"));
$("enter-code-button").addEventListener("click", () => showOnlineLobby("join"));
$("favorites-button").addEventListener("click", () => { buildFavorites(); showScreen("favorites"); });
$("seasonal-events-button").addEventListener("click", () => { buildSeasonalEvents(); showScreen("seasonal-events"); });
$("seasonal-events-back").addEventListener("click", () => showScreen("play-menu"));
$("favorites-back").addEventListener("click", () => showScreen("play-menu"));
$("online-create-button").addEventListener("click", () => {
  if (onlineIsHost() && !onlineMatch.hostConfigured) { showScreen("stages"); return; }
  makeFriendRoom();
});
$("online-join-button").addEventListener("click", joinFriendRoom);
$("online-copy-code").addEventListener("click", async () => {
  const code = onlineMatch.roomCode;
  if (!code) return;
  try { await navigator.clipboard.writeText(code); setOnlineLobbyMessage("Code copied! Send it to your friend."); }
  catch { setOnlineLobbyMessage(`Tell your friend this code: ${code}`); }
});
$("online-lobby-back").addEventListener("click", () => {
  if (isOnlineMatch()) leaveOnlineMatch();
  matchMode = "computer";
  showScreen("play-menu");
});
$("play-menu-back").addEventListener("click", returnToCover);
$("training-button").addEventListener("click", () => { activeSeasonalEvent = null; matchMode = "training"; playerOneChoice = null; buildRoster(); showFighterSelection(); showScreen("select"); });
$("boss-button").addEventListener("click", () => { activeSeasonalEvent = null; matchMode = "boss"; playerOneChoice = null; buildRoster(); showFighterSelection(); showScreen("select"); });
document.querySelectorAll(".setting-choice").forEach((button) => button.addEventListener("click", () => chooseSetting(button.dataset.setting, button.dataset.value)));
$("settings-button").addEventListener("click", () => {
  settingsReturnScreen = $("select").classList.contains("active") ? "select" : "stages";
  showScreen("settings");
});
$("settings-back").addEventListener("click", () => showScreen(settingsReturnScreen));
$("settings-continue").addEventListener("click", () => showScreen(settingsReturnScreen));
$("unlock-menu-button").addEventListener("click", () => { buildUnlocks(); showScreen("unlocks"); });
$("upgrade-menu-button").addEventListener("click", () => { buildUpgrades(); showScreen("upgrades"); });
$("achievements-menu-button").addEventListener("click", () => { buildAchievements(); showScreen("achievements"); });
$("unlocks-back").addEventListener("click", () => showScreen("settings"));
$("upgrades-back").addEventListener("click", () => showScreen("settings"));
$("achievements-back").addEventListener("click", () => showScreen("settings"));
$("stage-back").addEventListener("click", () => isOnlineMatch() ? showOnlineWaiting() : showScreen("play-menu"));
$("back-to-cover").addEventListener("click", () => { playerOneChoice = null; isOnlineMatch() ? showOnlineWaiting() : matchMode === "seasonal-boss" ? (buildSeasonalEvents(), showScreen("seasonal-events")) : showScreen("stages"); });
$("quit-battle").addEventListener("click", returnToCover);
$("rematch-button").addEventListener("click", () => {
  if (isOnlineMatch()) { returnToCover(); return; }
  if (game.mode === "seasonal-boss") {
    const event = getSeasonalEvent(game.seasonalEventId);
    if (event && useSeasonalAttempt(event)) { activeSeasonalEvent = event; startBattle(game.player, event.boss); }
    else { buildSeasonalEvents(); showScreen("seasonal-events"); }
    return;
  }
  startBattle(game.player, game.mode === "two-player" ? game.enemy : null);
});
$("select-button").addEventListener("click", returnToCover);
$("emote-toggle").addEventListener("click", () => {
  const options = $("emote-options");
  options.hidden = !options.hidden;
  $("emote-toggle").setAttribute("aria-expanded", String(!options.hidden));
});
document.querySelectorAll("[data-emote]").forEach((button) => button.addEventListener("click", () => {
  useEmote(button.dataset.emote);
  $("emote-options").hidden = true;
  $("emote-toggle").setAttribute("aria-expanded", "false");
}));
function setBattleKey(key, pressed) {
  if (pressed && onlineIsGuest() && ["ArrowUp", "a", "s", "q", "w"].includes(key) && !keys[key]) onlineMatch.inputNonce++;
  keys[key] = pressed;
  if (onlineIsGuest() && game && !game.ended) window.RumbleOnline.sendInput(onlineControlsFromKeys()).catch(() => {});
}

document.querySelectorAll("[data-touch-key]").forEach((button) => {
  const key = button.dataset.touchKey;
  const held = button.dataset.touchHold === "true";
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture?.(event.pointerId);
    setBattleKey(key, true);
    if (!held) window.setTimeout(() => setBattleKey(key, false), 110);
  });
  if (held) {
    const release = (event) => { event.preventDefault(); setBattleKey(key, false); };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
  }
});

// On phones and tablets, the left control is a real joystick. Push it upward
// to jump; the left and right directions stay held while the stick is moved.
const touchJoystick = $("touch-joystick");
const touchStick = $("touch-stick");
let joystickPointerId = null;
let joystickCanJump = true;
function resetTouchJoystick() {
  joystickPointerId = null;
  joystickCanJump = true;
  touchStick.style.transform = "translate(-50%, -50%)";
  setBattleKey("ArrowLeft", false);
  setBattleKey("ArrowRight", false);
}
function updateTouchJoystick(event) {
  const bounds = touchJoystick.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  let offsetX = event.clientX - centerX;
  let offsetY = event.clientY - centerY;
  const maxDistance = bounds.width * .3;
  const distance = Math.hypot(offsetX, offsetY);
  if (distance > maxDistance) { offsetX = offsetX / distance * maxDistance; offsetY = offsetY / distance * maxDistance; }
  touchStick.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
  const moveThreshold = maxDistance * .34;
  setBattleKey("ArrowLeft", offsetX < -moveThreshold);
  setBattleKey("ArrowRight", offsetX > moveThreshold);
  if (offsetY < -maxDistance * .55 && joystickCanJump) {
    joystickCanJump = false;
    setBattleKey("ArrowUp", true);
    window.setTimeout(() => setBattleKey("ArrowUp", false), 110);
  }
  if (offsetY > -maxDistance * .2) joystickCanJump = true;
}
touchJoystick.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  joystickPointerId = event.pointerId;
  touchJoystick.setPointerCapture?.(event.pointerId);
  updateTouchJoystick(event);
});
touchJoystick.addEventListener("pointermove", (event) => {
  if (event.pointerId === joystickPointerId) { event.preventDefault(); updateTouchJoystick(event); }
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
  touchJoystick.addEventListener(eventName, (event) => {
    if (joystickPointerId === null || event.pointerId === joystickPointerId) resetTouchJoystick();
  });
});

window.addEventListener("blur", () => ["ArrowLeft", "ArrowRight", "ArrowUp", "a", "s", "e"].forEach((key) => { keys[key] = false; }));
window.addEventListener("keydown", (event) => {
  const typingInField = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target.isContentEditable;
  if (typingInField) return;
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if ((event.metaKey || event.ctrlKey) && key === "r") {
    event.preventDefault();
    resetAllProgress();
    return;
  }
  if ($("select").classList.contains("active") && key === "a" && hoveredFighter) {
    event.preventDefault();
    showFighterDetails(hoveredFighter);
    return;
  }
  if (["ArrowLeft","ArrowRight","ArrowUp","a","s","q","w","e","j","l","i","f","g","r","u","y"," "].includes(key)) event.preventDefault();
  setBattleKey(key, true);
});
window.addEventListener("keyup", (event) => {
  const typingInField = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement || event.target.isContentEditable;
  if (typingInField) return;
  const key=event.key.length===1 ? event.key.toLowerCase() : event.key;
  setBattleKey(key, false);
});
updateCoinDisplays();
updateTrophyDisplay();
buildUnlocks();
buildUpgrades();
buildAchievements();
buildStages();
buildRoster();
buildFavorites();
