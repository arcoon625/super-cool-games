// ============================================================
//  POKEMON ADVENTURE - game.js
// ============================================================

const app = document.getElementById('app');

// ── GAME STATE ──────────────────────────────────────────────
const defaultState = {
  screen: 'title',
  playerName: 'Red',
  starter: null,
  party: [],          // BattlePokemon[]  (max 6 active)
  box: [],            // BattlePokemon[]  (PC Storage)
  caught: new Set(),  // ids
  seen: new Set(),
  pokeballs: Infinity,
  badges: new Array(18).fill(false),
  defeatedNPCs: new Set(),
  completedTrades: new Set(),
  battleCtx: null,
};

let STATE = { ...defaultState, caught: new Set(), seen: new Set(), badges: new Array(18).fill(false), defeatedNPCs: new Set(), completedTrades: new Set(), party: [], box: [] };

const SAVE_KEY = 'pokemon_adventure_save';

function saveGame() {
  const data = {
    ...STATE,
    caught: Array.from(STATE.caught),
    seen: Array.from(STATE.seen),
    defeatedNPCs: Array.from(STATE.defeatedNPCs),
    completedTrades: Array.from(STATE.completedTrades)
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      STATE = {
        ...defaultState,
        ...parsed,
        caught: new Set(parsed.caught || []),
        seen: new Set(parsed.seen || []),
        defeatedNPCs: new Set(parsed.defeatedNPCs || []),
        completedTrades: new Set(parsed.completedTrades || [])
      };
      return true;
    } catch (e) { console.error("Save file corrupted"); }
  }
  return false;
}

function restartGame() {
  if (confirm("Are you sure you want to start over? All progress will be lost!")) {
    STATE = { ...defaultState, caught: new Set(), seen: new Set(), badges: new Array(18).fill(false), defeatedNPCs: new Set(), completedTrades: new Set(), party: [], box: [] };
    localStorage.removeItem(SAVE_KEY);
    showTitle();
  }
}

function initGame() {
  if (loadGame()) {
    if (STATE.screen === 'title') showTitle();
    else if (STATE.screen === 'starter') showStarterSelect();
    else if (STATE.screen === 'wild') showWildArea();
    else if (STATE.screen === 'dex') showPokedex();
    else if (STATE.screen === 'gyms') showGyms();
    else if (STATE.screen === 'npcs') showNPCs();
    else if (STATE.screen === 'pcbox') showPCBox();
    else if (STATE.screen === 'trade') showTradeCenter();
    else showTitle();
  } else {
    showTitle();
  }
}

// ── GYMS ────────────────────────────────────────────────────
const GYMS = [
  { type: 'rock', leader: 'Brock', title: 'Boulder Badge', icon: '⛰️', badge: '🪨', pokes: [74, 95] },
  { type: 'water', leader: 'Misty', title: 'Cascade Badge', icon: '💧', badge: '💦', pokes: [120, 121] },
  { type: 'electric', leader: 'Lt. Surge', title: 'Thunder Badge', icon: '⚡', badge: '🔋', pokes: [100, 125] },
  { type: 'grass', leader: 'Erika', title: 'Rainbow Badge', icon: '🌿', badge: '🌸', pokes: [70, 71, 45] },
  { type: 'poison', leader: 'Koga', title: 'Soul Badge', icon: '☠️', badge: '💀', pokes: [109, 110, 89] },
  { type: 'psychic', leader: 'Sabrina', title: 'Marsh Badge', icon: '🔮', badge: '🧠', pokes: [63, 64, 65] },
  { type: 'fire', leader: 'Blaine', title: 'Volcano Badge', icon: '🔥', badge: '🌋', pokes: [77, 126, 6] },
  { type: 'dark', leader: 'Giovanni', title: 'Earth Badge', icon: '🌑', badge: '🌍', pokes: [111, 112] },
  { type: 'fighting', leader: 'Chuck', title: 'Storm Badge', icon: '🥊', badge: '💪', pokes: [56, 57, 297] },
  { type: 'ice', leader: 'Pryce', title: 'Glacier Badge', icon: '❄️', badge: '🧊', pokes: [86, 87, 221] },
  { type: 'normal', leader: 'Whitney', title: 'Plain Badge', icon: '🐄', badge: '⭐', pokes: [39, 241] },
  { type: 'ghost', leader: 'Morty', title: 'Fog Badge', icon: '👻', badge: '🕯️', pokes: [92, 93, 94] },
  { type: 'flying', leader: 'Falkner', title: 'Zephyr Badge', icon: '🦅', badge: '🪁', pokes: [16, 17, 18] },
  { type: 'bug', leader: 'Bugsy', title: 'Hive Badge', icon: '🐛', badge: '🍃', pokes: [13, 14, 15] },
  { type: 'steel', leader: 'Jasmine', title: 'Mineral Badge', icon: '⚙️', badge: '💿', pokes: [208, 227] },
  { type: 'dragon', leader: 'Clair', title: 'Rising Badge', icon: '🐉', badge: '💎', pokes: [147, 148, 149] },
  { type: 'fairy', leader: 'Valerie', title: 'Fairy Badge', icon: '🧚', badge: '🌙', pokes: [35, 36, 700] },
  { type: 'ground', leader: 'Clay', title: 'Quake Badge', icon: '🏔️', badge: '🌋', pokes: [328, 329, 330] },
];

// ── NPC TRAINERS ─────────────────────────────────────────────
const NPCS = [
  { id: 'youngster', name: 'Youngster Joey', avatar: '👦', desc: 'Has a level 5 Rattata. His best!', pokes: [19, 19, 19] },
  { id: 'lass', name: 'Lass Karen', avatar: '👧', desc: 'Loves cute Pokemon!', pokes: [35, 39, 173] },
  { id: 'camper', name: 'Camper Liam', avatar: '🏕️', desc: 'Explores the wilderness daily.', pokes: [16, 393, 396] },
  { id: 'hiker', name: 'Hiker Alan', avatar: '🧗', desc: 'Rugged mountain trainer.', pokes: [74, 75, 95] },
  { id: 'rocket', name: 'Team Rocket Grunt', avatar: '😈', desc: 'Prepare for trouble!', pokes: [23, 109, 110] },
  { id: 'ace1', name: 'Ace Trainer May', avatar: '👩', desc: 'Skilled battler from Hoenn.', pokes: [252, 255, 258] },
  { id: 'rival', name: 'Rival Blue', avatar: '😤', desc: 'Your childhood rival!', pokes: [6, 9, 3] },
  { id: 'legend', name: 'Champion Lance', avatar: '🏆', desc: 'The Dragon Master. Elite 4!', pokes: [149, 148, 373] },
];

// ── STARTERS ─────────────────────────────────────────────────
const STARTERS = [
  { id: 656, name: 'Froakie', type: 'water', note: 'Swift & special attacker' },
  { id: 152, name: 'Chikorita', type: 'grass', note: 'Defensive grass-type' },
  { id: 255, name: 'Torchic', type: 'fire', note: 'Speedy fire striker' },
];

// ── EVOLUTION DATA ───────────────────────────────────────────
// Format: fromId → { toId, level }
const EVOLUTIONS = {
  // Gen 1
  1: { toId: 2, level: 16 }, 2: { toId: 3, level: 32 }, 4: { toId: 5, level: 16 }, 5: { toId: 6, level: 36 },
  7: { toId: 8, level: 16 }, 8: { toId: 9, level: 36 }, 10: { toId: 11, level: 7 }, 11: { toId: 12, level: 10 },
  13: { toId: 14, level: 7 }, 14: { toId: 15, level: 10 }, 16: { toId: 17, level: 18 }, 17: { toId: 18, level: 36 },
  19: { toId: 20, level: 20 }, 21: { toId: 22, level: 20 }, 23: { toId: 24, level: 22 }, 25: { toId: 26, level: 28 },
  27: { toId: 28, level: 22 }, 29: { toId: 30, level: 16 }, 30: { toId: 31, level: 36 }, 32: { toId: 33, level: 16 },
  33: { toId: 34, level: 36 }, 37: { toId: 38, level: 29 }, 39: { toId: 40, level: 24 }, 41: { toId: 42, level: 22 },
  43: { toId: 44, level: 21 }, 44: { toId: 45, level: 32 }, 46: { toId: 47, level: 24 }, 48: { toId: 49, level: 31 },
  50: { toId: 51, level: 26 }, 52: { toId: 53, level: 28 }, 54: { toId: 55, level: 33 }, 56: { toId: 57, level: 28 },
  58: { toId: 59, level: 34 }, 60: { toId: 61, level: 25 }, 61: { toId: 62, level: 36 }, 63: { toId: 64, level: 16 },
  64: { toId: 65, level: 36 }, 66: { toId: 67, level: 28 }, 67: { toId: 68, level: 36 }, 69: { toId: 70, level: 21 },
  70: { toId: 71, level: 34 }, 72: { toId: 73, level: 30 }, 74: { toId: 75, level: 25 }, 75: { toId: 76, level: 36 },
  77: { toId: 78, level: 40 }, 79: { toId: 80, level: 37 }, 81: { toId: 82, level: 30 }, 84: { toId: 85, level: 31 },
  86: { toId: 87, level: 34 }, 88: { toId: 89, level: 38 }, 90: { toId: 91, level: 33 }, 92: { toId: 93, level: 25 },
  93: { toId: 94, level: 36 }, 95: { toId: 208, level: 36 }, 96: { toId: 97, level: 26 }, 98: { toId: 99, level: 28 },
  100: { toId: 101, level: 30 }, 102: { toId: 103, level: 28 }, 104: { toId: 105, level: 28 },
  109: { toId: 110, level: 35 }, 111: { toId: 112, level: 42 }, 114: { toId: 465, level: 34 },
  116: { toId: 117, level: 32 }, 117: { toId: 230, level: 42 }, 118: { toId: 119, level: 33 },
  120: { toId: 121, level: 34 }, 123: { toId: 212, level: 36 }, 126: { toId: 467, level: 36 },
  129: { toId: 130, level: 20 }, 131: { toId: 131, level: 0 }, 133: { toId: 134, level: 36 },
  138: { toId: 139, level: 40 }, 140: { toId: 141, level: 40 }, 143: { toId: 143, level: 0 },
  147: { toId: 148, level: 30 }, 148: { toId: 149, level: 55 },
  // Gen 2
  152: { toId: 153, level: 16 }, 153: { toId: 154, level: 32 }, 155: { toId: 156, level: 14 }, 156: { toId: 157, level: 36 },
  158: { toId: 159, level: 18 }, 159: { toId: 160, level: 30 }, 161: { toId: 162, level: 15 }, 163: { toId: 164, level: 20 },
  165: { toId: 166, level: 18 }, 167: { toId: 168, level: 22 }, 172: { toId: 25, level: 15 }, 173: { toId: 35, level: 15 },
  174: { toId: 39, level: 15 }, 175: { toId: 176, level: 15 }, 177: { toId: 178, level: 25 }, 179: { toId: 180, level: 15 },
  180: { toId: 181, level: 30 }, 183: { toId: 184, level: 18 }, 187: { toId: 188, level: 18 }, 188: { toId: 189, level: 27 },
  190: { toId: 424, level: 32 }, 191: { toId: 192, level: 25 }, 193: { toId: 469, level: 33 }, 194: { toId: 195, level: 20 },
  198: { toId: 430, level: 36 }, 200: { toId: 429, level: 36 }, 204: { toId: 205, level: 31 }, 207: { toId: 472, level: 40 },
  209: { toId: 210, level: 23 }, 211: { toId: 211, level: 0 }, 214: { toId: 214, level: 0 }, 215: { toId: 461, level: 40 },
  216: { toId: 217, level: 30 }, 218: { toId: 219, level: 38 }, 220: { toId: 221, level: 33 }, 222: { toId: 864, level: 38 },
  223: { toId: 224, level: 25 }, 225: { toId: 225, level: 0 }, 228: { toId: 229, level: 24 }, 231: { toId: 232, level: 25 },
  233: { toId: 474, level: 36 }, 236: { toId: 106, level: 20 }, 238: { toId: 124, level: 30 }, 239: { toId: 125, level: 30 },
  240: { toId: 126, level: 30 }, 246: { toId: 247, level: 30 }, 247: { toId: 248, level: 55 },
  // Gen 3
  252: { toId: 253, level: 16 }, 253: { toId: 254, level: 36 }, 255: { toId: 256, level: 16 }, 256: { toId: 257, level: 36 },
  258: { toId: 259, level: 16 }, 259: { toId: 260, level: 36 }, 261: { toId: 262, level: 18 }, 263: { toId: 264, level: 20 },
  270: { toId: 271, level: 14 }, 271: { toId: 272, level: 35 }, 273: { toId: 274, level: 14 }, 274: { toId: 275, level: 36 },
  276: { toId: 277, level: 22 }, 278: { toId: 279, level: 25 }, 280: { toId: 281, level: 20 }, 281: { toId: 282, level: 30 },
  283: { toId: 284, level: 22 }, 285: { toId: 286, level: 23 }, 287: { toId: 288, level: 18 }, 288: { toId: 289, level: 36 },
  290: { toId: 291, level: 20 }, 293: { toId: 294, level: 20 }, 294: { toId: 295, level: 40 }, 296: { toId: 297, level: 24 },
  299: { toId: 476, level: 36 }, 300: { toId: 301, level: 15 }, 302: { toId: 302, level: 0 }, 303: { toId: 303, level: 0 },
  304: { toId: 305, level: 32 }, 305: { toId: 306, level: 42 }, 307: { toId: 308, level: 37 }, 309: { toId: 310, level: 26 },
  315: { toId: 407, level: 25 }, 316: { toId: 317, level: 26 }, 318: { toId: 319, level: 30 }, 320: { toId: 321, level: 40 },
  322: { toId: 323, level: 33 }, 325: { toId: 326, level: 32 }, 328: { toId: 329, level: 35 }, 329: { toId: 330, level: 45 },
  331: { toId: 332, level: 32 }, 333: { toId: 334, level: 35 }, 339: { toId: 340, level: 30 }, 341: { toId: 342, level: 30 },
  343: { toId: 344, level: 36 }, 345: { toId: 346, level: 40 }, 347: { toId: 348, level: 40 }, 349: { toId: 350, level: 30 },
  353: { toId: 354, level: 37 }, 355: { toId: 356, level: 37 }, 356: { toId: 477, level: 37 }, 357: { toId: 357, level: 0 },
  358: { toId: 358, level: 0 }, 359: { toId: 359, level: 0 }, 361: { toId: 362, level: 42 }, 363: { toId: 364, level: 32 },
  364: { toId: 365, level: 44 }, 366: { toId: 367, level: 30 }, 368: { toId: 368, level: 30 },
  371: { toId: 372, level: 30 }, 372: { toId: 373, level: 50 }, 374: { toId: 375, level: 20 }, 375: { toId: 376, level: 45 },
  // Gen 4
  387: { toId: 388, level: 18 }, 388: { toId: 389, level: 32 }, 390: { toId: 391, level: 14 }, 391: { toId: 392, level: 36 },
  393: { toId: 394, level: 16 }, 394: { toId: 395, level: 36 }, 396: { toId: 397, level: 14 }, 397: { toId: 398, level: 34 },
  399: { toId: 400, level: 15 }, 401: { toId: 402, level: 10 }, 403: { toId: 404, level: 15 }, 404: { toId: 405, level: 30 },
  406: { toId: 407, level: 25 }, 408: { toId: 409, level: 30 }, 410: { toId: 411, level: 30 }, 412: { toId: 413, level: 20 },
  415: { toId: 416, level: 21 }, 418: { toId: 419, level: 26 }, 420: { toId: 421, level: 25 }, 422: { toId: 423, level: 30 },
  427: { toId: 428, level: 20 }, 433: { toId: 358, level: 20 }, 434: { toId: 435, level: 34 }, 436: { toId: 437, level: 33 },
  438: { toId: 185, level: 15 }, 439: { toId: 122, level: 15 }, 440: { toId: 113, level: 15 }, 443: { toId: 444, level: 24 },
  444: { toId: 445, level: 48 }, 446: { toId: 143, level: 20 }, 447: { toId: 448, level: 34 }, 449: { toId: 450, level: 34 },
  451: { toId: 452, level: 40 }, 453: { toId: 454, level: 37 }, 455: { toId: 455, level: 0 }, 456: { toId: 457, level: 31 },
  459: { toId: 460, level: 40 }, 461: { toId: 461, level: 0 }, 462: { toId: 462, level: 0 }, 463: { toId: 463, level: 0 },
  464: { toId: 464, level: 0 }, 466: { toId: 466, level: 0 }, 467: { toId: 467, level: 0 }, 468: { toId: 468, level: 0 },
  // Gen 5
  495: { toId: 496, level: 17 }, 496: { toId: 497, level: 36 }, 498: { toId: 499, level: 17 }, 499: { toId: 500, level: 36 },
  501: { toId: 502, level: 17 }, 502: { toId: 503, level: 36 }, 504: { toId: 505, level: 20 }, 506: { toId: 507, level: 16 },
  507: { toId: 508, level: 32 }, 509: { toId: 510, level: 20 }, 511: { toId: 512, level: 22 }, 513: { toId: 514, level: 22 },
  515: { toId: 516, level: 22 }, 517: { toId: 518, level: 30 }, 519: { toId: 520, level: 21 }, 520: { toId: 521, level: 31 },
  522: { toId: 523, level: 27 }, 524: { toId: 525, level: 25 }, 525: { toId: 526, level: 40 }, 527: { toId: 528, level: 20 },
  529: { toId: 530, level: 31 }, 532: { toId: 533, level: 25 }, 533: { toId: 534, level: 40 }, 535: { toId: 536, level: 25 },
  536: { toId: 537, level: 36 }, 540: { toId: 541, level: 20 }, 541: { toId: 542, level: 30 }, 543: { toId: 544, level: 22 },
  544: { toId: 545, level: 30 }, 546: { toId: 547, level: 18 }, 548: { toId: 549, level: 28 }, 550: { toId: 550, level: 0 },
  551: { toId: 552, level: 29 }, 552: { toId: 553, level: 40 }, 554: { toId: 555, level: 35 }, 556: { toId: 556, level: 0 },
  557: { toId: 558, level: 34 }, 559: { toId: 560, level: 39 }, 562: { toId: 563, level: 34 }, 564: { toId: 565, level: 37 },
  566: { toId: 567, level: 37 }, 568: { toId: 569, level: 36 }, 570: { toId: 571, level: 30 }, 572: { toId: 573, level: 25 },
  574: { toId: 575, level: 32 }, 575: { toId: 576, level: 41 }, 577: { toId: 578, level: 32 }, 578: { toId: 579, level: 41 },
  580: { toId: 581, level: 35 }, 582: { toId: 583, level: 35 }, 583: { toId: 584, level: 47 }, 585: { toId: 586, level: 20 },
  588: { toId: 589, level: 30 }, 590: { toId: 591, level: 39 }, 595: { toId: 596, level: 36 }, 597: { toId: 598, level: 40 },
  599: { toId: 600, level: 38 }, 600: { toId: 601, level: 49 }, 602: { toId: 603, level: 39 }, 603: { toId: 604, level: 49 },
  605: { toId: 606, level: 42 }, 607: { toId: 608, level: 41 }, 608: { toId: 609, level: 61 }, 610: { toId: 611, level: 38 },
  611: { toId: 612, level: 48 }, 613: { toId: 614, level: 37 }, 616: { toId: 617, level: 30 }, 618: { toId: 618, level: 0 },
  619: { toId: 620, level: 50 }, 622: { toId: 623, level: 43 }, 624: { toId: 625, level: 52 }, 626: { toId: 626, level: 0 },
  627: { toId: 628, level: 54 }, 629: { toId: 630, level: 54 }, 631: { toId: 631, level: 0 }, 632: { toId: 632, level: 0 },
  633: { toId: 634, level: 50 }, 634: { toId: 635, level: 64 }, 636: { toId: 637, level: 59 },
  // Gen 6
  650: { toId: 651, level: 16 }, 651: { toId: 652, level: 36 }, 653: { toId: 654, level: 16 }, 654: { toId: 655, level: 36 },
  656: { toId: 657, level: 16 }, 657: { toId: 658, level: 36 }, 659: { toId: 660, level: 20 }, 661: { toId: 662, level: 17 },
  662: { toId: 663, level: 35 }, 664: { toId: 665, level: 9 }, 665: { toId: 666, level: 12 }, 667: { toId: 668, level: 35 },
  669: { toId: 670, level: 19 }, 670: { toId: 671, level: 38 }, 672: { toId: 673, level: 32 }, 674: { toId: 675, level: 32 },
  677: { toId: 678, level: 25 }, 679: { toId: 680, level: 35 }, 680: { toId: 681, level: 45 }, 682: { toId: 683, level: 39 },
  684: { toId: 685, level: 40 }, 686: { toId: 687, level: 30 }, 688: { toId: 689, level: 52 }, 690: { toId: 691, level: 48 },
  692: { toId: 693, level: 37 }, 694: { toId: 695, level: 32 }, 696: { toId: 697, level: 39 }, 698: { toId: 699, level: 39 },
  700: { toId: 700, level: 0 }, 701: { toId: 701, level: 0 }, 702: { toId: 702, level: 0 }, 703: { toId: 703, level: 0 },
  704: { toId: 705, level: 40 }, 705: { toId: 706, level: 50 }, 708: { toId: 709, level: 37 }, 710: { toId: 711, level: 28 },
  712: { toId: 713, level: 37 }, 714: { toId: 715, level: 48 },
  // Gen 7
  722: { toId: 723, level: 17 }, 723: { toId: 724, level: 34 }, 725: { toId: 726, level: 17 }, 726: { toId: 727, level: 34 },
  728: { toId: 729, level: 17 }, 729: { toId: 730, level: 34 }, 731: { toId: 732, level: 14 }, 732: { toId: 733, level: 28 },
  734: { toId: 735, level: 20 }, 736: { toId: 737, level: 20 }, 737: { toId: 738, level: 30 }, 739: { toId: 740, level: 37 },
  742: { toId: 743, level: 25 }, 744: { toId: 745, level: 25 }, 746: { toId: 746, level: 0 }, 747: { toId: 748, level: 38 },
  749: { toId: 750, level: 30 }, 751: { toId: 752, level: 22 }, 753: { toId: 754, level: 34 }, 755: { toId: 756, level: 24 },
  757: { toId: 758, level: 33 }, 759: { toId: 760, level: 27 }, 761: { toId: 762, level: 18 }, 762: { toId: 763, level: 29 },
  767: { toId: 768, level: 30 }, 769: { toId: 770, level: 42 }, 771: { toId: 771, level: 0 },
  774: { toId: 774, level: 0 }, 775: { toId: 775, level: 0 }, 776: { toId: 776, level: 0 }, 777: { toId: 777, level: 0 },
  779: { toId: 779, level: 0 }, 782: { toId: 783, level: 35 }, 783: { toId: 784, level: 45 },
  // Gen 8
  810: { toId: 811, level: 16 }, 811: { toId: 812, level: 35 }, 813: { toId: 814, level: 16 }, 814: { toId: 815, level: 35 },
  816: { toId: 817, level: 16 }, 817: { toId: 818, level: 35 }, 819: { toId: 820, level: 24 }, 821: { toId: 822, level: 18 },
  822: { toId: 823, level: 38 }, 824: { toId: 825, level: 20 }, 825: { toId: 826, level: 30 }, 827: { toId: 828, level: 18 },
  829: { toId: 830, level: 15 }, 831: { toId: 832, level: 24 }, 833: { toId: 834, level: 22 }, 835: { toId: 836, level: 25 },
  837: { toId: 838, level: 18 }, 838: { toId: 839, level: 34 }, 840: { toId: 841, level: 30 }, 843: { toId: 844, level: 36 },
  846: { toId: 847, level: 26 }, 848: { toId: 849, level: 30 }, 850: { toId: 851, level: 28 }, 852: { toId: 853, level: 35 },
  854: { toId: 855, level: 30 }, 856: { toId: 857, level: 32 }, 857: { toId: 858, level: 42 }, 859: { toId: 860, level: 32 },
  860: { toId: 861, level: 42 }, 868: { toId: 869, level: 18 }, 871: { toId: 871, level: 0 }, 872: { toId: 873, level: 30 },
  874: { toId: 874, level: 0 }, 875: { toId: 875, level: 0 }, 877: { toId: 877, level: 0 }, 878: { toId: 879, level: 34 },
  880: { toId: 880, level: 0 }, 881: { toId: 881, level: 0 }, 882: { toId: 882, level: 0 }, 883: { toId: 883, level: 0 },
  884: { toId: 884, level: 0 }, 885: { toId: 886, level: 50 }, 886: { toId: 887, level: 60 },
  // Gen 9
  906: { toId: 907, level: 16 }, 907: { toId: 908, level: 36 }, 909: { toId: 910, level: 14 }, 910: { toId: 911, level: 36 },
  912: { toId: 913, level: 16 }, 913: { toId: 914, level: 36 }, 915: { toId: 916, level: 18 }, 917: { toId: 918, level: 12 },
  919: { toId: 920, level: 24 }, 921: { toId: 922, level: 18 }, 922: { toId: 923, level: 32 }, 924: { toId: 925, level: 25 },
  926: { toId: 927, level: 26 }, 928: { toId: 929, level: 25 }, 929: { toId: 930, level: 35 }, 932: { toId: 933, level: 24 },
  933: { toId: 934, level: 38 }, 935: { toId: 936, level: 40 }, 938: { toId: 939, level: 30 }, 940: { toId: 941, level: 25 },
  942: { toId: 943, level: 30 }, 944: { toId: 945, level: 28 }, 946: { toId: 947, level: 36 }, 948: { toId: 949, level: 30 },
  951: { toId: 952, level: 28 }, 953: { toId: 954, level: 28 }, 955: { toId: 956, level: 35 }, 957: { toId: 958, level: 24 },
  958: { toId: 959, level: 38 }, 960: { toId: 961, level: 26 }, 963: { toId: 964, level: 38 }, 965: { toId: 966, level: 40 },
  969: { toId: 970, level: 35 }, 971: { toId: 972, level: 30 }, 974: { toId: 975, level: 32 },
  982: { toId: 982, level: 0 }, 996: { toId: 997, level: 35 }, 997: { toId: 998, level: 54 }, 999: { toId: 1000, level: 40 },
};

// ============================================================
//  UTILITY
// ============================================================
function qs(sel, ctx = document) { return ctx.querySelector(sel); }

function toast(msg, dur = 2400) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), dur);
}

function hpColor(pct) {
  if (pct > .5) return 'high';
  if (pct > .25) return 'medium';
  return 'low';
}

function typeBadge(type) {
  return type ? `<span class="type-badge type-${type}">${type}</span>` : '';
}

function spriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}
function backUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`;
}

// Create a battle-ready pokemon object
function makeBattlePoke(template, level = 5) {
  const lvl = level;
  return {
    ...template,
    level: lvl,
    maxHp: template.hp + lvl * 3,
    currentHp: template.hp + lvl * 3,
    moves: getMoveset(template),
    atk: template.attack + lvl * 2,
    def: template.defense + lvl,
  };
}

// ── EVOLUTION CHECK ─────────────────────────────────────────
function checkEvolution(poke) {
  const evo = EVOLUTIONS[poke.id];
  if (!evo || evo.level === 0) return;   // level 0 = stone/trade evo, skip
  if (poke.level >= evo.level) {
    const oldName = poke.name;
    const newTemplate = getPokemon(evo.toId);
    if (!newTemplate) return;
    // Evolve in-place: update all fields but keep currentHp ratio
    const hpRatio = poke.currentHp / poke.maxHp;
    const oldLevel = poke.level;
    Object.assign(poke, newTemplate);
    poke.level = oldLevel;
    poke.maxHp = newTemplate.hp + oldLevel * 3;
    poke.currentHp = Math.max(1, Math.floor(poke.maxHp * hpRatio));
    poke.atk = newTemplate.attack + oldLevel * 2;
    poke.def = newTemplate.defense + oldLevel;
    poke.moves = getMoveset(newTemplate);
    STATE.caught.add(evo.toId);
    STATE.seen.add(evo.toId);
    showEvolveOverlay(oldName, newTemplate.name, evo.toId);
  }
}

function showEvolveOverlay(fromName, toName, toId) {
  const over = document.createElement('div');
  over.className = 'overlay';
  over.innerHTML = `
      <div class="modal" style="border-color:var(--gold);text-align:center">
        <div style="font-size:48px;margin-bottom:10px">✨</div>
        <h3 style="color:var(--gold)">What?!</h3>
        <p style="margin:12px 0;font-size:13px;color:#eee">${fromName} is evolving!</p>
        <img src="${spriteUrl(toId)}" style="width:96px;height:96px;image-rendering:pixelated"/>
        <p style="margin:10px 0;font-family:'Press Start 2P',monospace;font-size:11px;color:var(--gold)">
          ${fromName} evolved into<br/>${toName}!
        </p>
        <button class="btn btn-gold" onclick="this.closest('.overlay').remove()">Awesome! →</button>
      </div>`;
  document.body.appendChild(over);
  toast(`🌟 ${fromName} evolved into ${toName}!`, 3000);
}

// damage formula
function calcDamage(attacker, move, defender) {
  const base = ((2 * attacker.level / 5 + 2) * move.power * (attacker.atk / defender.def)) / 50 + 2;
  const eff = getEffectiveness(move.type, defender.type1, defender.type2);
  const stab = (move.type === attacker.type1 || move.type === attacker.type2) ? 1.5 : 1;
  const randFactor = 0.85 + Math.random() * 0.15;
  return Math.max(1, Math.floor(base * eff * stab * randFactor));
}

// ============================================================
//  RENDERING ENGINE
// ============================================================
function render(html) { app.innerHTML = `<div class="screen">${html}</div>`; }

// ── TITLE ─────────────────────────────────────────────────
function showTitle() {
  STATE.screen = 'title';
  const floaters = [25, 6, 94, 150, 384, 133, 149]; // Pikachu, Charizard, Gengar, Mewtwo, Rayquaza, Eevee, Dragonite
  render(`
    <div class="title-screen">
      <div class="floating-pokemon">
        ${floaters.map((id, i) => `<img src="${spriteUrl(id)}" class="float-poke p-${i}" />`).join('')}
      </div>
      <div class="title-content">
        <div class="pokeball-anim">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#e3350d" stroke="#222" stroke-width="4"/>
            <rect y="46" width="100" height="8" fill="#222"/>
            <circle cx="50" cy="50" r="16" fill="white" stroke="#222" stroke-width="4"/>
            <circle cx="50" cy="50" r="8" fill="#e3350d" stroke="#222" stroke-width="3"/>
          </svg>
        </div>
        <h1>Pokémon Adventure</h1>
        <p class="subtitle">Catch all 1025 Pokémon!</p>
        <br/>
        <button class="btn btn-red" onclick="showStarterSelect()">▶ New Game</button>
        ${STATE.party.length > 0 ? `<button class="btn btn-gray" onclick="restartGame()" style="margin-left: 10px;">🔄 Start Over</button>` : ''}
      </div>
    </div>
  `);
}

// ── STARTER SELECT ─────────────────────────────────────────
function showStarterSelect() {
  STATE.screen = 'starter';
  render(`
    <div class="text-center">
      <h2 class="pixel" style="color:var(--gold);font-size:13px;margin-bottom:6px">Choose Your Starter!</h2>
      <p style="color:var(--subtext);font-size:13px;margin-bottom:10px">Pick one Pokémon to begin your journey.</p>
      <div class="starter-grid">
        ${STARTERS.map(s => {
    const p = getPokemon(s.id);
    return `
          <div class="starter-card" id="sc-${s.id}" onclick="selectStarter(${s.id})">
            <img src="${spriteUrl(s.id)}" alt="${s.name}" onerror="this.src='https://via.placeholder.com/96'"/>
            <div class="name">${s.name}</div>
            ${typeBadge(p.type1)}${typeBadge(p.type2)}
            <p style="font-size:11px;color:var(--subtext);margin-top:8px">${s.note}</p>
          </div>`;
  }).join('')}
      </div>
      <button class="btn btn-green" id="confirmBtn" onclick="confirmStarter()" style="display:none">
        ✅ Choose This Pokémon!
      </button>
    </div>
  `);
}

let pendingStarter = null;
function selectStarter(id) {
  pendingStarter = id;
  document.querySelectorAll('.starter-card').forEach(c => c.classList.remove('selected'));
  const card = document.getElementById(`sc-${id}`);
  if (card) card.classList.add('selected');
  const btn = document.getElementById('confirmBtn');
  if (btn) btn.style.display = 'block';
}

function confirmStarter() {
  if (!pendingStarter) return;
  const template = getPokemon(pendingStarter);
  const bp = makeBattlePoke(template, 5);
  STATE.starter = bp;
  STATE.party = [bp];
  STATE.caught.add(pendingStarter);
  STATE.seen.add(pendingStarter);
  saveGame();
  toast(`You chose ${template.name}!`);
  showHub();
}

// ── HUB / OVERWORLD ────────────────────────────────────────
function showHub() {
  STATE.screen = 'hub';
  const caughtCount = STATE.caught.size;
  const badgeCount = STATE.badges.filter(Boolean).length;
  render(`
    <div>
      ${partyBarHTML()}
      <div style="text-align:center;margin-bottom:20px">
        <h2 class="pixel" style="color:var(--gold);font-size:13px">🗺️ Overworld</h2>
        <p style="color:var(--subtext);font-size:12px;margin-top:6px">
          🏅 Badges: ${badgeCount}/18 &nbsp;|&nbsp; 📖 Pokédex: ${caughtCount}/1025
        </p>
        <button class="btn btn-sm btn-gray" onclick="restartGame()" style="margin-top:12px">🔄 Start Over</button>
      </div>
      <div class="hub-grid">
        <div class="hub-card" onclick="showWildArea()">
          <div class="icon">🌿</div>
          <h3>Wild Area</h3>
          <p>Encounter & catch wild Pokémon</p>
        </div>
        <div class="hub-card" onclick="showPokedex()">
          <div class="icon">📖</div>
          <h3>Pokédex</h3>
          <p>${caughtCount} / 1025 caught</p>
        </div>
        <div class="hub-card" onclick="showGyms()">
          <div class="icon">🏟️</div>
          <h3>Gyms</h3>
          <p>${badgeCount} / 18 badges earned</p>
        </div>
        <div class="hub-card" onclick="showNPCs()">
          <div class="icon">🧑‍🤝‍🧑</div>
          <h3>Trainers</h3>
          <p>Battle NPC trainers</p>
        </div>
        <div class="hub-card" onclick="showPCBox()">
          <div class="icon">💾</div>
          <h3>PC Box</h3>
          <p>${STATE.box.length} Pokémon stored — transfer party</p>
        </div>
        <div class="hub-card" onclick="showTradeCenter()">
          <div class="icon">🔀</div>
          <h3>Trade Center</h3>
          <p>Trade Pokémon with NPCs</p>
        </div>
      </div>
    </div>
  `);
}

function partyBarHTML() {
  const slots = STATE.party.slice(0, 6).map(p => {
    const pct = p.currentHp / p.maxHp;
    return `<div class="party-slot" title="${p.name} HP: ${p.currentHp}/${p.maxHp}">
      <img src="${spriteUrl(p.id)}" alt="${p.name}"/>
      <div class="hp-strip"><div class="hp-fill" style="width:${Math.max(0, pct * 100)}%;background:${pct > .5 ? 'var(--green)' : pct > .25 ? 'var(--gold)' : 'var(--red)'}"></div></div>
    </div>`;
  }).join('');
  return `<div class="party-bar"><span class="label">PARTY</span>${slots}</div>`;
}

// ── WILD AREA ─────────────────────────────────────────────
let wildPoke = null;
let catchResult = null;

function showWildArea() {
  STATE.screen = 'wild';
  catchResult = null;
  wildPoke = null;
  renderWild();
}

function renderWild() {
  render(`
    <div class="wild-area">
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">🌿 Wild Area</h2>
      </div>
      ${partyBarHTML()}
      <div class="encounter-box ${wildPoke && wildPoke.legendary ? 'legendary-glow' : ''}" id="enc-box">
        ${wildPoke ? wildPokeHTML() : `<p style="color:var(--subtext);font-size:13px">Tall grass rustles...<br/><br/>Press Explore to find a Pokémon!</p>`}
      </div>
      ${catchResult ? `<div class="catch-result ${catchResult.ok ? 'success' : 'fail'}">${catchResult.msg}</div>` : ''}
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-green" onclick="findWildPoke()">🔍 Explore</button>
        ${wildPoke && !catchResult ? `
          <button class="btn btn-red" onclick="throwBall()">⚾ Throw Pokéball</button>
          <button class="btn btn-blue" onclick="startWildBattle()">⚔️ Battle First</button>
        ` : ''}
      </div>
    </div>
  `);
}

function wildPokeHTML() {
  const p = wildPoke;
  return `
    <img src="${spriteUrl(p.id)}" alt="${p.name}" onerror="this.style.display='none'"/>
    <div class="poke-name">${p.legendary ? '✨ ' : ''}${p.name}</div>
    <div class="poke-num">#${String(p.id).padStart(4, '0')} ${p.legendary ? '(LEGENDARY!)' : ''}</div>
    ${p.legendary ? '<p style="color:var(--gold);font-size:10px;margin-top:8px;font-family:monospace">⭐ 1/5 catch chance!</p>' : ''}
  `;
}

function findWildPoke() {
  catchResult = null;
  const rng = Math.random();
  // 2% legendary encounter
  let pool;
  if (rng < 0.02) {
    pool = POKEMON.filter(p => p.legendary);
  } else {
    pool = POKEMON.filter(p => !p.legendary);
  }
  const template = pool[Math.floor(Math.random() * pool.length)];
  const lvl = 5 + Math.floor(Math.random() * 40);
  wildPoke = makeBattlePoke(template, lvl);
  STATE.seen.add(template.id);
  renderWild();
}

function throwBall() {
  if (!wildPoke) return;
  // Legendary: 1/5 chance. Regular: high chance
  const caught = wildPoke.legendary
    ? Math.random() < 0.2
    : Math.random() < 0.75;

  if (caught) {
    STATE.caught.add(wildPoke.id);
    if (STATE.party.length < 6) STATE.party.push(wildPoke);
    catchResult = { ok: true, msg: `🎉 Caught ${wildPoke.name}!` };
    toast(`${wildPoke.name} added to Pokédex!`);
    wildPoke = null;
    saveGame();
  } else {
    catchResult = {
      ok: false, msg: wildPoke.legendary
        ? `💨 ${wildPoke.name} broke free! (1/5 chance)`
        : `💨 ${wildPoke.name} broke free!`
    };
  }
  renderWild();
}

function startWildBattle() {
  if (!wildPoke) return;
  STATE.battleCtx = {
    type: 'wild',
    enemy: wildPoke,
    onWin: () => {
      toast('Wild Pokémon was defeated!');
      showWildArea();
    },
    onLose: () => { toast('You blacked out!'); healAll(); showHub(); },
    canCatch: true,
  };
  showBattle();
}

// ── POKÉDEX ────────────────────────────────────────────────
function showPokedex() {
  STATE.screen = 'dex';
  renderDex('');
}

function renderDex(filter) {
  const q = filter.toLowerCase().trim();
  const list = POKEMON.filter(p =>
    !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q) || (p.type1 + ' ' + (p.type2 || '')).includes(q)
  );
  render(`
    <div>
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">📖 Pokédex</h2>
      </div>
      <div style="margin-bottom:8px">
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill" style="width:${(STATE.caught.size / 1025 * 100).toFixed(1)}%"></div>
          <div class="progress-label">${STATE.caught.size} / 1025 Caught</div>
        </div>
      </div>
      <div class="dex-filter">
        <input type="text" id="dex-search" placeholder="Search name, #, or type..." value="${filter}"
          oninput="renderDex(this.value)" />
        <button class="btn btn-sm btn-gray" onclick="renderDex('')">Clear</button>
      </div>
      <div class="dex-grid">
        ${list.slice(0, 300).map(p => {
    const caught = STATE.caught.has(p.id);
    const seen = STATE.seen.has(p.id);
    return `<div class="dex-entry ${caught ? 'caught' : ''} ${p.legendary ? 'legendary' : ''}" title="${p.name}">
            ${caught ? '<span class="caught-badge">✅</span>' : ''}
            <img src="${spriteUrl(p.id)}" alt="${p.name}" class="${!seen ? 'unseen' : ''}" loading="lazy" onerror="this.src=''"/>
            <div class="dnum">#${String(p.id).padStart(4, '0')}</div>
            <div class="dname">${seen ? p.name : '???'}</div>
          </div>`;
  }).join('')}
      </div>
      ${list.length > 300 ? `<p style="text-align:center;color:var(--subtext);margin-top:10px;font-size:12px">Showing 300 of ${list.length} results. Use search to narrow down.</p>` : ''}
    </div>
  `);
}

// ── GYMS ──────────────────────────────────────────────────
function showGyms() {
  STATE.screen = 'gyms';
  render(`
    <div>
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">🏟️ Gym Challenge</h2>
      </div>
      <p style="color:var(--subtext);font-size:12px;margin-bottom:10px;text-align:center">
        Defeat all 18 gyms to become Champion!
      </p>
      <div class="gym-grid">
        ${GYMS.map((g, i) => {
    const defeated = STATE.badges[i];
    return `<div class="gym-card ${defeated ? 'defeated' : ''}" onclick="challengeGym(${i})">
            <div class="gym-icon">${g.icon}</div>
            <div class="gym-name">${g.leader}</div>
            <div class="gym-type">${g.type.toUpperCase()} type</div>
            <div class="badge">${defeated ? g.badge : '🔒'}</div>
          </div>`;
  }).join('')}
      </div>
    </div>
  `);
}

function challengeGym(i) {
  const gym = GYMS[i];
  const levels = [15, 20, 25, 30, 35, 40, 45, 50, 30, 35, 25, 35, 20, 20, 40, 45, 38, 38];
  const lvl = levels[i] || 30;
  const enemyTemplate = getPokemon(gym.pokes[gym.pokes.length - 1]);
  const enemy = makeBattlePoke(enemyTemplate, lvl);

  STATE.battleCtx = {
    type: 'gym',
    gymIdx: i,
    enemy,
    label: `Gym Leader ${gym.leader}`,
    onWin: () => {
      STATE.badges[i] = true;
      saveGame();
      toast(`🏅 You earned the ${gym.title}!`);
      showGyms();
    },
    onLose: () => { toast('You lost! Train more!'); healAll(); showHub(); },
    canCatch: false,
  };
  showBattle();
}

// ── NPC TRAINERS ──────────────────────────────────────────
function showNPCs() {
  STATE.screen = 'npcs';
  render(`
    <div>
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">🧑 Trainers</h2>
      </div>
      <div class="npc-list">
        ${NPCS.map(n => {
    const defeated = STATE.defeatedNPCs.has(n.id);
    return `<div class="npc-card ${defeated ? 'defeated' : ''}" onclick="challengeNPC('${n.id}')">
            <div class="npc-avatar">${n.avatar}</div>
            <div class="npc-info">
              <div class="npc-name">${n.name} ${defeated ? '(Defeated)' : ''}</div>
              <div class="npc-desc">${n.desc}</div>
            </div>
            <button class="btn btn-sm ${defeated ? 'btn-gray' : 'btn-red'}">Battle</button>
          </div>`;
  }).join('')}
      </div>
    </div>
  `);
}

function challengeNPC(id) {
  const npc = NPCS.find(n => n.id === id);
  if (!npc) return;
  const lvlMap = { youngster: 8, lass: 12, camper: 15, hiker: 20, rocket: 25, ace1: 35, rival: 50, legend: 65 };
  const lvl = lvlMap[id] || 20;
  const templateId = npc.pokes[npc.pokes.length - 1];
  const enemy = makeBattlePoke(getPokemon(templateId), lvl);

  STATE.battleCtx = {
    type: 'npc',
    npcId: id,
    enemy,
    label: npc.name,
    onWin: () => {
      STATE.defeatedNPCs.add(id);
      saveGame();
      toast(`You defeated ${npc.name}!`);
      showNPCs();
    },
    onLose: () => { toast('You lost! Keep training!'); healAll(); showHub(); },
    canCatch: false,
  };
  showBattle();
}

// ── NPC TRADES ────────────────────────────────────────────
// Each trade: NPC wants wantId from you, offers offerId in return
const NPC_TRADES = [
  { id: 't1', npc: 'Gentleman Alfred', avatar: '🎩', wantId: 129, offerId: 147, desc: 'My Dratini for your Magikarp?' },
  { id: 't2', npc: 'Sailor Bruno', avatar: '⚓', wantId: 98, offerId: 116, desc: 'Trade my Horsea for your Krabby?' },
  { id: 't3', npc: 'Hiker Ruben', avatar: '🧗', wantId: 74, offerId: 95, desc: 'I want a Geodude. Take my Onix!' },
  { id: 't4', npc: 'Little Girl Amy', avatar: '👧', wantId: 25, offerId: 133, desc: 'Give me Pikachu, get my Eevee!' },
  { id: 't5', npc: 'Scientist Kyle', avatar: '🧪', wantId: 137, offerId: 233, desc: 'Porygon for Porygon2? Done deal.' },
  { id: 't6', npc: 'Old Couple', avatar: '👴', wantId: 132, offerId: 132, desc: 'A Ditto for a Ditto. Fair trade!' },
  { id: 't7', npc: 'Fisherman Dale', avatar: '🎣', wantId: 116, offerId: 230, desc: 'My Kingdra for your Horsea?' },
  { id: 't8', npc: 'Nerd Benny', avatar: '🤓', wantId: 63, offerId: 65, desc: 'Trade your Abra, get Alakazam!' },
  { id: 't9', npc: 'Nurse Rosa', avatar: '👩‍⚕️', wantId: happyId(), offerId: chanId(), desc: 'I have Chansey, want your Eevee!' },
  { id: 't10', npc: 'Rival Red', avatar: '🧢', wantId: 6, offerId: 149, desc: 'My Dragonite for your Charizard?' },
  { id: 't11', npc: 'Hiker Lola', avatar: '⛏️', wantId: 50, offerId: 104, desc: 'Cubone for your Diglett?' },
  { id: 't12', npc: 'Lady Sofia', avatar: '👸', wantId: 35, offerId: 131, desc: 'A Lapras for your Clefairy!' },
];

function happyId() { return 133; }
function chanId() { return 113; }

// ── PC BOX ────────────────────────────────────────────────
function showPCBox() {
  STATE.screen = 'pcbox';
  renderPCBox('party');
}

function renderPCBox(tab) {
  const isParty = tab === 'party';
  const list = isParty ? STATE.party : STATE.box;

  const rows = list.map((p, i) => {
    const isStarter = p === STATE.starter;
    const pct = p.currentHp / p.maxHp;
    const canTransfer = isParty && !isStarter && STATE.party.length > 1;
    const canWithdraw = !isParty;
    const partyFull = STATE.party.length >= 6;
    return `
    <div style="display:flex;align-items:center;gap:12px;padding:12px;
      background:var(--card);border:2px solid var(--border);border-radius:12px;margin-bottom:10px">
      <img src="${spriteUrl(p.id)}" style="width:56px;height:56px;image-rendering:pixelated"/>
      <div style="flex:1">
        <div style="font-family:'Press Start 2P',monospace;font-size:9px;color:var(--gold);margin-bottom:4px">
          ${p.name} Lv.${p.level} ${isStarter ? '⭐' : ''}
        </div>
        ${typeBadge(p.type1)}${typeBadge(p.type2)}
        <div style="background:#222;border-radius:4px;height:7px;overflow:hidden;margin-top:6px">
          <div style="height:100%;width:${Math.max(0, pct * 100).toFixed(0)}%;
            background:${pct > .5 ? 'var(--green)' : pct > .25 ? 'var(--gold)' : 'var(--red)'};
            border-radius:4px"></div>
        </div>
        <div style="font-size:10px;color:var(--subtext);margin-top:2px">${p.currentHp}/${p.maxHp} HP</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${canTransfer
        ? `<button class="btn btn-sm btn-red" onclick="transferPokemon(${i})">📤 Transfer</button>`
        : isStarter ? '<span style="font-size:10px;color:var(--subtext)">Starter</span>' : ''}
        ${canWithdraw
        ? partyFull
          ? '<span style="font-size:10px;color:var(--subtext)">Party full</span>'
          : `<button class="btn btn-sm btn-green" onclick="withdrawPokemon(${i})">📥 Withdraw</button>`
        : ''}
      </div>
    </div>`;
  }).join('');

  render(`
    <div>
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">💾 PC Box</h2>
      </div>
      <p style="color:var(--subtext);font-size:12px;margin-bottom:14px">
        Transfer Pokémon from your party to the Box to free up slots. Withdrawn Pokémon return to your party.
      </p>
      <!-- Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <button class="btn btn-sm ${isParty ? 'btn-gold' : 'btn-gray'}" onclick="renderPCBox('party')">👜 Party (${STATE.party.length}/6)</button>
        <button class="btn btn-sm ${!isParty ? 'btn-gold' : 'btn-gray'}" onclick="renderPCBox('box')">📦 Box (${STATE.box.length})</button>
      </div>
      ${list.length === 0
      ? `<p style="text-align:center;color:var(--subtext);margin-top:30px">${isParty ? 'No Pokémon in party.' : 'Box is empty.'}</p>`
      : rows}
    </div>
  `);
}

function transferPokemon(idx) {
  if (STATE.party.length <= 1) { toast("Can't transfer your last Pokémon!"); return; }
  const p = STATE.party[idx];
  if (!p) return;
  if (p === STATE.starter) { toast('Your starter cannot be transferred!'); return; }
  // Move from party to box
  STATE.party.splice(idx, 1);
  STATE.box.push(p);
  saveGame();
  toast(`${p.name} was sent to the Box!`);
  renderPCBox('party');
}

function withdrawPokemon(idx) {
  if (STATE.party.length >= 6) { toast('Party is full! Transfer someone first.'); return; }
  const p = STATE.box[idx];
  if (!p) return;
  STATE.box.splice(idx, 1);
  STATE.party.push(p);
  saveGame();
  toast(`${p.name} was added to your party!`);
  renderPCBox('box');
}

// ── TRADE CENTER ──────────────────────────────────────────
function showTradeCenter() {
  STATE.screen = 'trade';
  render(`
    <div>
      <div class="game-header">
        <button class="back-btn" onclick="showHub()">← Back</button>
        <h2 class="pixel">🔀 Trade Center</h2>
      </div>
      <p style="color:var(--subtext);font-size:12px;margin-bottom:16px;text-align:center">
        Trade Pokémon with NPCs. Some Pokémon evolve when traded!
      </p>
      <div class="npc-list">
        ${NPC_TRADES.map(t => {
    const done = STATE.completedTrades.has(t.id);
    const want = getPokemon(t.wantId);
    const offer = getPokemon(t.offerId);
    const haveIt = [...STATE.party, ...STATE.box].some(p => p.id === t.wantId);
    return `<div class="npc-card ${done ? 'defeated' : ''}" onclick="${!done ? `proposeTradeNPC('${t.id}')` : ''}">
            <div class="npc-avatar">${t.avatar}</div>
            <div class="npc-info" style="flex:1">
              <div class="npc-name">${t.npc} ${done ? '(Done)' : ''}</div>
              <div class="npc-desc" style="margin-bottom:6px">${t.desc}</div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <div style="text-align:center">
                  <img src="${spriteUrl(t.wantId)}" style="width:40px;height:40px;image-rendering:pixelated"/>
                  <div style="font-size:9px;color:var(--subtext)">${want.name}</div>
                </div>
                <div style="font-size:20px">→</div>
                <div style="text-align:center">
                  <img src="${spriteUrl(t.offerId)}" style="width:40px;height:40px;image-rendering:pixelated"/>
                  <div style="font-size:9px;color:var(--gold)">${offer.name}</div>
                </div>
              </div>
            </div>
            <div>
              ${done
        ? '<span style="color:var(--subtext);font-size:10px">✅ Done</span>'
        : haveIt
          ? '<button class="btn btn-sm btn-gold">Trade!</button>'
          : `<span style="font-size:10px;color:#ff6b6b">Need<br/>${want.name}</span>`}
            </div>
          </div>`;
  }).join('')}
      </div>
    </div>
  `);
}

function proposeTradeNPC(tid) {
  const trade = NPC_TRADES.find(t => t.id === tid);
  if (!trade) return;
  if (STATE.completedTrades.has(tid)) return;

  const allPoke = [...STATE.party, ...STATE.box];
  const yours = allPoke.filter(p => p.id === trade.wantId);
  if (!yours.length) {
    toast(`You don't have ${getPokemon(trade.wantId).name}!`);
    return;
  }

  const givePoke = yours[0];
  const offerTemplate = getPokemon(trade.offerId);
  const received = makeBattlePoke(offerTemplate, givePoke.level);

  // Show confirmation overlay
  const over = document.createElement('div');
  over.className = 'overlay';
  over.id = 'trade-overlay';
  over.innerHTML = `
    <div class="modal" style="border-color:var(--gold)">
      <h3>Confirm Trade</h3>
      <div style="display:flex;align-items:center;justify-content:center;gap:20px;margin:16px 0">
        <div style="text-align:center">
          <img src="${spriteUrl(givePoke.id)}" style="width:72px;height:72px;image-rendering:pixelated"/>
          <p style="font-size:11px;color:#ff6b6b;margin-top:4px">Your ${givePoke.name}</p>
        </div>
        <div style="font-size:28px">⇆</div>
        <div style="text-align:center">
          <img src="${spriteUrl(received.id)}" style="width:72px;height:72px;image-rendering:pixelated"/>
          <p style="font-size:11px;color:var(--gold);margin-top:4px">${received.name}</p>
        </div>
      </div>
      <p style="font-size:12px;color:var(--subtext);margin-bottom:16px">${trade.npc} wants your ${givePoke.name}.</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="btn btn-gold" onclick="confirmTradeNPC('${tid}')">✅ Trade!</button>
        <button class="btn btn-gray" onclick="document.getElementById('trade-overlay').remove()">Cancel</button>
      </div>
    </div>`;
  document.body.appendChild(over);
}

function confirmTradeNPC(tid) {
  const trade = NPC_TRADES.find(t => t.id === tid);
  if (!trade) return;

  const allSources = [
    { arr: STATE.party, label: 'party' },
    { arr: STATE.box, label: 'box' },
  ];
  let removed = false;
  let givenPoke = null;
  for (const src of allSources) {
    const idx = src.arr.findIndex(p => p.id === trade.wantId);
    if (idx !== -1) {
      givenPoke = src.arr[idx];
      src.arr.splice(idx, 1);
      removed = true;
      break;
    }
  }
  if (!removed) { toast('Trade failed — Pokémon not found.'); return; }

  const offerTemplate = getPokemon(trade.offerId);
  const received = makeBattlePoke(offerTemplate, givenPoke.level);
  STATE.caught.add(trade.offerId);
  STATE.seen.add(trade.offerId);

  // Put received in party if room, else box
  if (STATE.party.length < 6) {
    STATE.party.push(received);
  } else {
    STATE.box.push(received);
  }

  STATE.completedTrades.add(tid);
  saveGame();
  document.getElementById('trade-overlay')?.remove();

  // Check for trade evolution on received
  const traded = received;
  traded.tradedEvolution = true;
  checkTradeEvolution(traded);

  toast(`Trade complete! You got ${received.name}!`, 3000);
  showTradeCenter();
}

// Pokemon that evolve by trade (simplified subset)
const TRADE_EVOS = {
  64: 65, 67: 68, 75: 76, 93: 94, 95: 208, 117: 230, 123: 212,
  207: 472, 233: 474, 280: 282, 349: 350, 374: 375, 375: 376,
  447: 448, 533: 534, 574: 575, 575: 576, 578: 579,
};

function checkTradeEvolution(poke) {
  const toId = TRADE_EVOS[poke.id];
  if (!toId) return;
  const newTemplate = getPokemon(toId);
  if (!newTemplate) return;
  const oldName = poke.name;
  const hpRatio = poke.currentHp / poke.maxHp;
  const lvl = poke.level;
  Object.assign(poke, newTemplate);
  poke.level = lvl;
  poke.maxHp = newTemplate.hp + lvl * 3;
  poke.currentHp = Math.max(1, Math.floor(poke.maxHp * hpRatio));
  poke.atk = newTemplate.attack + lvl * 2;
  poke.def = newTemplate.defense + lvl;
  poke.moves = getMoveset(newTemplate);
  STATE.caught.add(toId);
  STATE.seen.add(toId);
  setTimeout(() => showEvolveOverlay(oldName, newTemplate.name, toId), 400);
}

// ── BATTLE SYSTEM ─────────────────────────────────────────
let battleLog = [];
let battleOver = false;
let playerPoke = null;
let enemyPoke = null;
let showingSwitch = false;

// Track which slot playerPoke lives in
function playerPokeIdx() {
  return STATE.party.indexOf(playerPoke);
}

function showSwitchPanel() {
  showingSwitch = true;
  renderBattle();
}

function switchPokemon(idx) {
  const target = STATE.party[idx];
  if (!target) return;
  if (target === playerPoke) {
    toast('That Pokémon is already in battle!');
    showingSwitch = false;
    renderBattle();
    return;
  }
  if (target.currentHp <= 0) {
    toast(`${target.name} has fainted!`);
    return;
  }
  const prev = playerPoke;
  playerPoke = target;
  battleLog.push(`${prev.name} switched out! Go, ${target.name}!`);
  // Enemy gets a free hit on switch-in
  if (!battleOver) {
    const eMove = enemyPoke.moves[Math.floor(Math.random() * enemyPoke.moves.length)];
    const eDmg = calcDamage(enemyPoke, eMove, playerPoke);
    playerPoke.currentHp = Math.max(0, playerPoke.currentHp - eDmg);
    battleLog.push(`${enemyPoke.name} used ${eMove.name}! (${eDmg} dmg)`);
    if (playerPoke.currentHp <= 0) {
      battleLog.push(`${playerPoke.name} fainted!`);
      // Auto-find next alive pokemon
      const next = STATE.party.find(p => p.currentHp > 0 && p !== playerPoke);
      if (next) {
        playerPoke = next;
        battleLog.push(`${next.name} was sent out automatically!`);
      } else {
        battleOver = true;
      }
    }
  }
  showingSwitch = false;
  renderBattle();
}

function showBattle() {
  const ctx = STATE.battleCtx;
  if (!ctx) return;

  playerPoke = STATE.party[0];  // use first party member
  enemyPoke = ctx.enemy;
  battleLog = [`A wild ${enemyPoke.name} appeared!`];
  if (ctx.label) battleLog = [`${ctx.label} wants to battle!`, `${ctx.label} sent out ${enemyPoke.name}!`];
  battleOver = false;
  renderBattle();
}

function renderBattle() {
  const ctx = STATE.battleCtx;
  if (!playerPoke || !enemyPoke) return;

  const ePct = enemyPoke.currentHp / enemyPoke.maxHp;
  const pPct = playerPoke.currentHp / playerPoke.maxHp;

  render(`
    <div class="battle-screen">
      <div class="game-header">
        <button class="back-btn" onclick="fleeBattle()">🏃 Flee</button>
        <h2 class="pixel" style="font-size:10px">${ctx.label || 'Wild Battle'}</h2>
      </div>

      <div class="battle-field">
        <!-- Enemy side -->
        <div class="enemy-side">
          <div class="hp-bar-wrap">
            <div class="pname">${enemyPoke.name} Lv.${enemyPoke.level}</div>
            <div class="hp-bar-outer">
              <div class="hp-bar-inner ${hpColor(ePct)}" style="width:${Math.max(0, ePct * 100).toFixed(1)}%"></div>
            </div>
            <div class="hp-text">${enemyPoke.currentHp} / ${enemyPoke.maxHp}</div>
          </div>
          <img class="battle-poke-img enemy" src="${spriteUrl(enemyPoke.id)}" alt="${enemyPoke.name}" onerror="this.src=''"/>
        </div>

        <!-- Player side -->
        <div class="player-side">
          <img class="battle-poke-img player" src="${backUrl(playerPoke.id)}" alt="${playerPoke.name}" onerror="this.src='${spriteUrl(playerPoke.id)}'"/>
          <div class="hp-bar-wrap">
            <div class="pname">${playerPoke.name} Lv.${playerPoke.level}</div>
            <div class="hp-bar-outer">
              <div class="hp-bar-inner ${hpColor(pPct)}" style="width:${Math.max(0, pPct * 100).toFixed(1)}%"></div>
            </div>
            <div class="hp-text">${playerPoke.currentHp} / ${playerPoke.maxHp}</div>
          </div>
        </div>
      </div>

      <div class="battle-menu">
        <div class="battle-log">${battleLog.slice(-3).join('<br/>')}</div>
        ${battleOver ? battleOverHTML() : battleActionsHTML(ctx)}
      </div>
    </div>
  `);
}

function battleActionsHTML(ctx) {
  if (showingSwitch) return switchPanelHTML();
  if (!playerPoke.moves || !playerPoke.moves.length) return '';
  const moveButtons = playerPoke.moves.map((m, i) => `
    <button class="move-btn" onclick="useMove(${i})">
      <div class="mname">${m.name}</div>
      <span class="mtype type-${m.type}">${m.type}</span>
      <div class="mpp">PP ${m.ppLeft}/${m.pp}</div>
    </button>
  `).join('');

  const catchBtn = ctx.canCatch && ctx.type === 'wild'
    ? `<button class="btn btn-gold btn-full" style="margin-top:10px" onclick="throwBallInBattle()">⚾ Throw Pokéball</button>`
    : '';

  const switchBtn = STATE.party.filter(p => p.currentHp > 0).length > 1
    ? `<button class="btn btn-blue btn-full" style="margin-top:8px" onclick="showSwitchPanel()">🔄 Switch Pokémon</button>`
    : '';

  return `<div class="move-grid">${moveButtons}</div>${catchBtn}${switchBtn}`;
}

function switchPanelHTML() {
  const slots = STATE.party.map((p, i) => {
    const pct = p.currentHp / p.maxHp;
    const active = p === playerPoke;
    const fainted = p.currentHp <= 0;
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:10px;
                background:${active ? '#1a3a5c' : fainted ? '#2a1010' : '#0f1b30'};
                border:2px solid ${active ? 'var(--gold)' : fainted ? '#555' : 'var(--border)'};
                margin-bottom:8px;cursor:${fainted || active ? 'default' : 'pointer'}"
             onclick="${!fainted && !active ? `switchPokemon(${i})` : ''}"
        >
          <img src="${spriteUrl(p.id)}" style="width:44px;height:44px;image-rendering:pixelated"/>
          <div style="flex:1">
            <div style="font-family:'Press Start 2P',monospace;font-size:8px;color:var(--gold);margin-bottom:4px">
              ${p.name} Lv.${p.level} ${active ? '(Active)' : fainted ? '(Fainted)' : ''}
            </div>
            <div style="background:#222;border-radius:4px;height:8px;overflow:hidden">
              <div style="height:100%;width:${Math.max(0, pct * 100).toFixed(0)}%;
                background:${pct > .5 ? 'var(--green)' : pct > .25 ? 'var(--gold)' : 'var(--red)'};
                border-radius:4px"></div>
            </div>
            <div style="font-size:10px;color:var(--subtext);margin-top:2px">${p.currentHp}/${p.maxHp} HP</div>
          </div>
        </div>`;
  }).join('');

  return `<div>
      <div style="font-family:'Press Start 2P',monospace;font-size:9px;color:var(--gold);margin-bottom:10px">Choose a Pokémon:</div>
      ${slots}
      <button class="btn btn-gray btn-full" style="margin-top:4px" onclick="showingSwitch=false;renderBattle()">← Cancel</button>
    </div>`;
}

function battleOverHTML() {
  return `<div style="text-align:center;padding:10px">
    <button class="btn btn-green" onclick="endBattle()">Continue →</button>
  </div>`;
}

function useMove(idx) {
  if (battleOver) return;
  const move = playerPoke.moves[idx];
  if (!move || move.ppLeft <= 0) { toast('No PP left!'); return; }
  move.ppLeft--;

  // Player attacks
  const dmg = calcDamage(playerPoke, move, enemyPoke);
  const eff = getEffectiveness(move.type, enemyPoke.type1, enemyPoke.type2);
  enemyPoke.currentHp = Math.max(0, enemyPoke.currentHp - dmg);
  let log = `${playerPoke.name} used ${move.name}! (${dmg} dmg)`;
  if (eff >= 2) log += ' Super effective!';
  if (eff <= 0.5 && eff > 0) log += ' Not very effective...';
  if (eff === 0) log += ' No effect!';
  battleLog.push(log);

  if (enemyPoke.currentHp <= 0) {
    battleLog.push(`${enemyPoke.name} fainted!`);
    const xp = Math.floor(enemyPoke.level * 10);
    battleLog.push(`${playerPoke.name} gained ${xp} XP! (Lv.${playerPoke.level} → Lv.${Math.min(100, playerPoke.level + 1)})`);
    playerPoke.level = Math.min(100, playerPoke.level + 1);
    // Update stats on level up
    playerPoke.maxHp = playerPoke.hp + playerPoke.level * 3;
    playerPoke.currentHp = Math.min(playerPoke.currentHp + 5, playerPoke.maxHp);
    playerPoke.atk = playerPoke.attack + playerPoke.level * 2;
    playerPoke.def = playerPoke.defense + playerPoke.level;
    battleOver = true;
    renderBattle();
    // Check evolution after a short delay so the battle screen shows first
    setTimeout(() => checkEvolution(playerPoke), 800);
    return;
  }

  // Enemy attacks back
  const eMove = enemyPoke.moves[Math.floor(Math.random() * enemyPoke.moves.length)];
  const eDmg = calcDamage(enemyPoke, eMove, playerPoke);
  playerPoke.currentHp = Math.max(0, playerPoke.currentHp - eDmg);
  battleLog.push(`${enemyPoke.name} used ${eMove.name}! (${eDmg} dmg)`);

  if (playerPoke.currentHp <= 0) {
    battleLog.push(`${playerPoke.name} fainted!`);
    // Try to auto-send out next alive pokemon
    const next = STATE.party.find(p => p.currentHp > 0 && p !== playerPoke);
    if (next) {
      playerPoke = next;
      battleLog.push(`Go, ${next.name}!`);
    } else {
      battleOver = true;
    }
  }

  renderBattle();
}

function throwBallInBattle() {
  if (!STATE.battleCtx?.canCatch) return;
  const caught = enemyPoke?.legendary
    ? Math.random() < 0.2
    : Math.random() < 0.6;

  if (caught) {
    STATE.caught.add(enemyPoke.id);
    if (STATE.party.length < 6) {
      const newPoke = { ...enemyPoke };
      STATE.party.push(newPoke);
    }
    battleLog.push(`Gotcha! ${enemyPoke.name} was caught!`);
    toast(`🎉 ${enemyPoke.name} added to Pokédex!`);
    saveGame();
    battleOver = true;
    enemyPoke.currentHp = 0;
    STATE.battleCtx.onWin = () => showWildArea();
    renderBattle();
  } else {
    battleLog.push(enemyPoke.legendary
      ? `${enemyPoke.name} broke free! So powerful...`
      : `${enemyPoke.name} broke free!`);
    // Enemy counter-attacks
    const eMove = enemyPoke.moves[Math.floor(Math.random() * enemyPoke.moves.length)];
    const eDmg = calcDamage(enemyPoke, eMove, playerPoke);
    playerPoke.currentHp = Math.max(0, playerPoke.currentHp - eDmg);
    battleLog.push(`${enemyPoke.name} used ${eMove.name}! (${eDmg} dmg)`);
    if (playerPoke.currentHp <= 0) {
      battleLog.push(`${playerPoke.name} fainted!`);
      battleOver = true;
    }
    renderBattle();
  }
}

function endBattle() {
  const ctx = STATE.battleCtx;
  if (!ctx) return;
  const playerWon = enemyPoke.currentHp <= 0;
  if (playerWon) {
    ctx.onWin();
  } else {
    ctx.onLose();
  }
  STATE.battleCtx = null;
}

function fleeBattle() {
  if (STATE.battleCtx?.type === 'gym') {
    toast('You cannot flee from a Gym Battle!');
    return;
  }
  battleLog.push('Got away safely!');
  battleOver = true;
  STATE.battleCtx = { ...STATE.battleCtx, onWin: () => showHub() };
  STATE.battleCtx.onWin();
  STATE.battleCtx = null;
}

function healAll() {
  STATE.party.forEach(p => { p.currentHp = p.maxHp; p.moves.forEach(m => m.ppLeft = m.pp); });
}

// ── INIT ─────────────────────────────────────────────────
showTitle();
