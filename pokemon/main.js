// -------------------------------------------------------------
// GAME CONFIG & STATE
// -------------------------------------------------------------
const CONFIG = {
    viewDistance: 100,
    playerSpeed: 10,
    turnSpeed: 2.0,
    gravity: -30,
    pokeballSpeed: 20,
    mapSize: 200,
    lakeRadius: 20,
    numTrees: 150
};

const POKEMON_SPAWNS = [
    'pinsir', 'skwovet', 'greedent', 'scyther', 'caterpie', 
    'metapod', 'butterfree', 'weedle', 'kakuna', 'beedrill', 
    'oranguru', 'rattata', 'pidgey'
];

let state = {
    keys: { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false },
    pokeballs: [],
    wildPokemon: [],
    trees: [],
    npcs: [],
    inUI: false,
    lastTime: performance.now(),
    velocity: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    playerPos: new THREE.Vector3(0, 2, 0)
};

// -------------------------------------------------------------
// THREE.JS SETUP
// -------------------------------------------------------------
const container = document.getElementById('game-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue
scene.fog = new THREE.Fog(0x87CEEB, 20, CONFIG.viewDistance);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(state.playerPos.x, state.playerPos.y, state.playerPos.z);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(50, 100, 50);
dirLight.castShadow = true;
scene.add(dirLight);

// -------------------------------------------------------------
// WORLD GENERATION (FOREST & LAKE)
// -------------------------------------------------------------
function buildWorld() {
    // Ground
    const groundGeo = new THREE.PlaneGeometry(CONFIG.mapSize, CONFIG.mapSize);
    const groundMat = new THREE.MeshLambertMaterial({ color: 0x228B22 }); // Forest Green
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lake
    const lakeGeo = new THREE.CircleGeometry(CONFIG.lakeRadius, 32);
    const lakeMat = new THREE.MeshLambertMaterial({ color: 0x1E90FF }); // Dodger Blue
    const lake = new THREE.Mesh(lakeGeo, lakeMat);
    lake.rotation.x = -Math.PI / 2;
    lake.position.y = 0.05; // Slightly above ground
    scene.add(lake);

    // Trees
    const trunkGeo = new THREE.CylinderGeometry(0.5, 0.8, 4);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // SaddleBrown
    const leavesGeo = new THREE.SphereGeometry(2.5, 8, 8);
    const leavesMat = new THREE.MeshLambertMaterial({ color: 0x006400 }); // DarkGreen

    for (let i = 0; i < CONFIG.numTrees; i++) {
        let x = (Math.random() - 0.5) * CONFIG.mapSize;
        let z = (Math.random() - 0.5) * CONFIG.mapSize;
        
        // Don't place tree in the lake or near spawn (0,0)
        let distToCenter = Math.sqrt(x*x + z*z);
        if (distToCenter < CONFIG.lakeRadius + 5) continue;

        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(x, 2, z);
        trunk.castShadow = true;
        scene.add(trunk);

        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(x, 4.5, z);
        leaves.castShadow = true;
        scene.add(leaves);

        state.trees.push({ x, z, radius: 1.0 }); // Collision data
    }
    // NPCs (League & Raids)
    const leagueGeo = new THREE.SphereGeometry(2, 32, 32);
    const leagueMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 }); // Gold
    const leagueNPC = new THREE.Mesh(leagueGeo, leagueMat);
    leagueNPC.position.set(20, 2, 20);
    scene.add(leagueNPC);
    state.npcs.push({ mesh: leagueNPC, type: 'league', interacted: false });

    const raidGeo = new THREE.SphereGeometry(2, 32, 32);
    const raidMat = new THREE.MeshLambertMaterial({ color: 0x8A2BE2 }); // Purple
    const raidNPC = new THREE.Mesh(raidGeo, raidMat);
    raidNPC.position.set(-20, 2, -20);
    scene.add(raidNPC);
    state.npcs.push({ mesh: raidNPC, type: 'raid', interacted: false });
}
buildWorld();

// -------------------------------------------------------------
// POKEMON SPAWNING & BILLBOARDING
// -------------------------------------------------------------
const textureLoader = new THREE.TextureLoader();

async function fetchPokemonSprite(name) {
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        const data = await res.json();
        // Use front_default or a higher quality artwork if available
        return data.sprites.front_default;
    } catch (e) {
        console.error("Failed to fetch", name);
        return null; // Fallback handled later
    }
}

async function spawnPokemon(name, x, z, isRare = false) {
    const spriteUrl = await fetchPokemonSprite(name);
    if (!spriteUrl) return;

    textureLoader.load(spriteUrl, (texture) => {
        texture.magFilter = THREE.NearestFilter; // Pixelated retro look
        const mat = new THREE.SpriteMaterial({ map: texture, color: 0xffffff });
        const sprite = new THREE.Sprite(mat);
        
        sprite.position.set(x, 1.5, z);
        sprite.scale.set(3, 3, 1);
        
        if (isRare) {
            sprite.scale.set(6, 6, 1);
            sprite.position.y = 3;
        }

        scene.add(sprite);

        state.wildPokemon.push({
            name,
            sprite,
            isRare,
            state: 'idle', // idle, walking, drinking, climbing
            target: new THREE.Vector3(x, 1.5, z),
            stateTime: 0
        });
    });
}

function initialSpawns() {
    for (let i = 0; i < 20; i++) {
        let x = (Math.random() - 0.5) * CONFIG.mapSize;
        let z = (Math.random() - 0.5) * CONFIG.mapSize;
        
        let pool = [...POKEMON_SPAWNS];
        // 5% Palkia chance
        if (Math.random() < 0.05) {
            spawnPokemon('palkia', x, z, true);
        } else {
            let randName = pool[Math.floor(Math.random() * pool.length)];
            spawnPokemon(randName, x, z);
        }
    }
}
initialSpawns();

// -------------------------------------------------------------
// CONTROLS & PHYSICS
// -------------------------------------------------------------
document.addEventListener('keydown', (e) => {
    if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = true;
    if (e.code === 'KeyP') throwPokeball();
});

document.addEventListener('keyup', (e) => {
    if (state.keys.hasOwnProperty(e.code)) state.keys[e.code] = false;
});

// Window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function throwPokeball() {
    const ballGeo = new THREE.SphereGeometry(0.2, 16, 16);
    // Top red, bottom white (simple hack: just make it red)
    const ballMat = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(ballGeo, ballMat);

    ball.position.copy(camera.position);

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    
    // Add some upward arc
    dir.y += 0.2;
    dir.normalize();

    scene.add(ball);
    
    state.pokeballs.push({
        mesh: ball,
        velocity: dir.multiplyScalar(CONFIG.pokeballSpeed),
        active: true
    });
}

// Simple collision: Player vs Tree Cylinder
function checkTreeCollisions(oldPos, newPos) {
    let finalPos = newPos.clone();
    for (const tree of state.trees) {
        let dx = newPos.x - tree.x;
        let dz = newPos.z - tree.z;
        let dist = Math.sqrt(dx*dx + dz*dz);
        // Player radius ~0.5
        if (dist < tree.radius + 0.5) {
            // Push back
            let nx = dx / dist;
            let nz = dz / dist;
            finalPos.x = tree.x + nx * (tree.radius + 0.5);
            finalPos.z = tree.z + nz * (tree.radius + 0.5);
        }
    }
    // Map bounds
    const halfMap = CONFIG.mapSize / 2;
    finalPos.x = Math.max(-halfMap, Math.min(halfMap, finalPos.x));
    finalPos.z = Math.max(-halfMap, Math.min(halfMap, finalPos.z));
    return finalPos;
}

// -------------------------------------------------------------
// GAME LOOP
// -------------------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    
    if (state.inUI) return; // Pause game while in UI

    const time = performance.now();
    const delta = (time - state.lastTime) / 1000;
    state.lastTime = time;

    // Movement (Tank Controls: Left/Right to turn, Up/Down to move)
    if (state.keys.ArrowLeft) {
        camera.rotation.y += CONFIG.turnSpeed * delta;
    }
    if (state.keys.ArrowRight) {
        camera.rotation.y -= CONFIG.turnSpeed * delta;
    }

    let moveZ = 0;
    if (state.keys.ArrowUp) moveZ = -1;
    if (state.keys.ArrowDown) moveZ = 1;

    if (moveZ !== 0) {
        const dir = new THREE.Vector3(0, 0, moveZ).applyQuaternion(camera.quaternion);
        dir.y = 0; 
        dir.normalize();
        
        let oldPos = camera.position.clone();
        let newPos = camera.position.clone().add(dir.multiplyScalar(CONFIG.playerSpeed * delta));
        
        newPos = checkTreeCollisions(oldPos, newPos);
        camera.position.copy(newPos);
    }

    // Update Pokeballs
    for (let i = state.pokeballs.length - 1; i >= 0; i--) {
        let pb = state.pokeballs[i];
        if (!pb.active) continue;

        pb.velocity.y += CONFIG.gravity * delta;
        pb.mesh.position.addScaledVector(pb.velocity, delta);

        // Ground collision
        if (pb.mesh.position.y <= 0.2) {
            pb.mesh.position.y = 0.2;
            pb.velocity.y *= -0.5; // bounce
            pb.velocity.x *= 0.8; // friction
            pb.velocity.z *= 0.8;
            
            if (pb.velocity.lengthSq() < 0.1) {
                setTimeout(() => {
                    scene.remove(pb.mesh);
                    pb.mesh.geometry.dispose();
                    pb.mesh.material.dispose();
                }, 2000);
                pb.active = false;
            }
        }

        // Pokemon Collision
        if (pb.active) {
            for (let j = state.wildPokemon.length - 1; j >= 0; j--) {
                let wp = state.wildPokemon[j];
                let dist = pb.mesh.position.distanceTo(wp.sprite.position);
                if (dist < 1.5) {
                    // Hit!
                    console.log("Hit", wp.name);
                    scene.remove(wp.sprite);
                    wp.sprite.material.map.dispose();
                    wp.sprite.material.dispose();
                    state.wildPokemon.splice(j, 1);
                    
                    pb.active = false;
                    scene.remove(pb.mesh);
                    break;
                }
            }
        }
    }

    // NPC Interaction
    for (const npc of state.npcs) {
        if (camera.position.distanceTo(npc.mesh.position) < 4) {
            if (!npc.interacted) {
                npc.interacted = true;
                openUI(npc.type);
            }
        } else {
            npc.interacted = false;
        }
    }

    // Pokemon AI Logic
    for (let wp of state.wildPokemon) {
        wp.stateTime -= delta;
        if (wp.stateTime <= 0) {
            // Pick a new state
            let rand = Math.random();
            wp.stateTime = 2 + Math.random() * 3; // 2-5 seconds per state
            if (rand < 0.3) {
                wp.state = 'idle';
            } else if (rand < 0.6) {
                wp.state = 'walking';
                wp.target.x = wp.sprite.position.x + (Math.random() - 0.5) * 10;
                wp.target.z = wp.sprite.position.z + (Math.random() - 0.5) * 10;
                wp.target.y = 1.5;
            } else if (rand < 0.8) {
                wp.state = 'drinking';
                wp.target.x = 0; // Lake is at 0,0
                wp.target.z = 0;
            } else {
                wp.state = 'climbing'; // Just move up a bit
                wp.target.y = 4; // High up
            }
        }

        // Move towards target
        let speed = 2.0;
        let dx = wp.target.x - wp.sprite.position.x;
        let dy = wp.target.y - wp.sprite.position.y;
        let dz = wp.target.z - wp.sprite.position.z;
        let dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist > 0.1 && wp.state !== 'idle') {
            wp.sprite.position.x += (dx / dist) * speed * delta;
            wp.sprite.position.y += (dy / dist) * speed * delta;
            wp.sprite.position.z += (dz / dist) * speed * delta;
        }
    }

    renderer.render(scene, camera);
}

// -------------------------------------------------------------
// UI LOGIC
// -------------------------------------------------------------
const uiOverlay = document.getElementById('ui-overlay');
const uiTitle = document.getElementById('ui-title');
const uiMessage = document.getElementById('ui-message');
const uiButtons = document.getElementById('ui-buttons');
const raidUi = document.getElementById('raid-ui');
const pokeballCountSpan = document.getElementById('pokeball-count');

function openUI(type) {
    state.inUI = true;
    uiOverlay.classList.remove('hidden');
    uiButtons.innerHTML = '';

    if (type === 'league') {
        uiTitle.innerText = "Championship League";
        uiMessage.innerText = "Ready to battle for exclusive legendary encounters? (Mewtwo, Shiny Palkia, Dialga, Zekrom)";
        
        let btnFight = document.createElement('button');
        btnFight.innerText = "Enter League";
        btnFight.onclick = () => startLeague();
        
        let btnLeave = document.createElement('button');
        btnLeave.innerText = "Leave";
        btnLeave.onclick = () => closeUI();

        uiButtons.appendChild(btnFight);
        uiButtons.appendChild(btnLeave);
    } else if (type === 'raid') {
        uiTitle.innerText = "Raid Battle";
        uiMessage.innerText = "A massive energy reading! It could be Arceus, Primal Kyogre, Primal Groudon, Mega Rayquaza, Origin Palkia, or Origin Dialga!";
        
        let btnFight = document.createElement('button');
        btnFight.innerText = "Join Raid";
        btnFight.onclick = () => startRaid();
        
        let btnLeave = document.createElement('button');
        btnLeave.innerText = "Leave";
        btnLeave.onclick = () => closeUI();

        uiButtons.appendChild(btnFight);
        uiButtons.appendChild(btnLeave);
    }
}

function closeUI() {
    uiOverlay.classList.add('hidden');
    raidUi.classList.add('hidden');
    state.inUI = false;
    state.lastTime = performance.now(); // reset delta
}

let battleState = null;
let raidPokeballs = 0;
let raidBoss = "";

const BOSS_DATA = {
    "Arceus": { hp: 300, moves: ["Judgment", "Recover"] },
    "Primal Kyogre": { hp: 280, moves: ["Origin Pulse", "Ice Beam"] },
    "Primal Groudon": { hp: 280, moves: ["Precipice Blades", "Fire Blast"] },
    "Mega Rayquaza": { hp: 300, moves: ["Dragon Ascent", "Extreme Speed"] },
    "Origin Forme Palkia": { hp: 260, moves: ["Spacial Rend", "Hydro Pump"] },
    "Origin Forme Dialga": { hp: 260, moves: ["Roar of Time", "Flash Cannon"] },
    "Mewtwo": { hp: 250, moves: ["Psystrike", "Aura Sphere"] },
    "Shiny Palkia": { hp: 230, moves: ["Spacial Rend", "Earth Power"] },
    "Dialga": { hp: 230, moves: ["Roar of Time", "Dragon Claw"] },
    "Zekrom": { hp: 230, moves: ["Bolt Strike", "Dragon Pulse"] }
};

const PLAYER_MOVES = [
    { name: "Thunderbolt", damage: 40 },
    { name: "Flamethrower", damage: 40 },
    { name: "Ice Beam", damage: 40 },
    { name: "Recover", heal: 50 },
];

function startLeague() {
    const rewards = ["Mewtwo", "Shiny Palkia", "Dialga", "Zekrom"];
    let reward = rewards[Math.floor(Math.random() * rewards.length)];
    initBattle(reward, 'league');
}

function startRaid() {
    const bosses = ["Arceus", "Primal Kyogre", "Primal Groudon", "Mega Rayquaza", "Origin Forme Palkia", "Origin Forme Dialga"];
    let boss = bosses[Math.floor(Math.random() * bosses.length)];
    initBattle(boss, 'raid');
}

function initBattle(bossName, type) {
    let bData = BOSS_DATA[bossName];
    battleState = {
        playerHP: 150, maxPlayerHP: 150,
        bossHP: bData.hp, maxBossHP: bData.hp,
        bossName: bossName, type: type,
        bossMoves: bData.moves
    };
    renderBattleUI(`A wild ${bossName} appeared!`);
}

function renderBattleUI(msg) {
    uiTitle.innerText = `Battle vs ${battleState.bossName}`;
    uiMessage.innerText = `Your HP: ${battleState.playerHP}/${battleState.maxPlayerHP} | Boss HP: ${battleState.bossHP}/${battleState.maxBossHP}\n\n${msg}`;
    
    uiButtons.innerHTML = '';
    
    PLAYER_MOVES.forEach(pm => {
        let btn = document.createElement('button');
        btn.innerText = pm.name;
        btn.style.backgroundColor = pm.heal ? "#2ecc71" : "#e74c3c";
        btn.onclick = () => takeTurn(pm);
        uiButtons.appendChild(btn);
    });
    
    let runBtn = document.createElement('button');
    runBtn.innerText = "Run";
    runBtn.style.backgroundColor = "#7f8c8d";
    runBtn.onclick = () => closeUI();
    uiButtons.appendChild(runBtn);
}

function takeTurn(playerMove) {
    let msg = "";
    if (playerMove.heal) {
        battleState.playerHP = Math.min(battleState.maxPlayerHP, battleState.playerHP + playerMove.heal);
        msg += `You used ${playerMove.name} and healed!\n`;
    } else {
        let dmg = playerMove.damage + Math.floor(Math.random() * 20);
        battleState.bossHP -= dmg;
        msg += `You used ${playerMove.name} for ${dmg} damage!\n`;
    }

    if (battleState.bossHP <= 0) {
        winBattle();
        return;
    }

    let bMove = battleState.bossMoves[Math.floor(Math.random() * battleState.bossMoves.length)];
    if (bMove === "Recover") {
        battleState.bossHP = Math.min(battleState.maxBossHP, battleState.bossHP + 50);
        msg += `${battleState.bossName} used Recover and healed!\n`;
    } else {
        let bDmg = 30 + Math.floor(Math.random() * 25);
        battleState.playerHP -= bDmg;
        msg += `${battleState.bossName} used ${bMove} for ${bDmg} damage!`;
    }

    if (battleState.playerHP <= 0) {
        uiTitle.innerText = "Defeated!";
        uiMessage.innerText = `${msg}\n\nYou blacked out!`;
        uiButtons.innerHTML = '';
        let btn = document.createElement('button');
        btn.innerText = "Return to Forest";
        btn.onclick = () => closeUI();
        uiButtons.appendChild(btn);
        return;
    }

    renderBattleUI(msg);
}

function winBattle() {
    if (battleState.type === 'league') {
        uiTitle.innerText = "League Champion!";
        uiMessage.innerText = `You defeated ${battleState.bossName} and became the champion! It respects your strength and joins your team!`;
        uiButtons.innerHTML = '';
        let btnLeave = document.createElement('button');
        btnLeave.innerText = `Awesome!`;
        btnLeave.onclick = () => closeUI();
        uiButtons.appendChild(btnLeave);
    } else {
        raidBoss = battleState.bossName;
        uiTitle.innerText = `Raid Won!`;
        uiMessage.innerText = `You defeated ${raidBoss}! You now have 10 Pokeballs to catch it. (25% chance)`;
        
        raidPokeballs = 10;
        raidUi.classList.remove('hidden');
        updateRaidUI();

        uiButtons.innerHTML = '';
        let btnThrow = document.createElement('button');
        btnThrow.innerText = "Throw Pokeball (25%)";
        btnThrow.onclick = () => throwRaidPokeball();
        
        let btnLeave = document.createElement('button');
        btnLeave.innerText = "Run Away";
        btnLeave.onclick = () => closeUI();

        uiButtons.appendChild(btnThrow);
        uiButtons.appendChild(btnLeave);
    }
}

function updateRaidUI() {
    pokeballCountSpan.innerText = raidPokeballs;
}

function throwRaidPokeball() {
    if (raidPokeballs <= 0) return;
    
    raidPokeballs--;
    updateRaidUI();

    let roll = Math.random();
    if (roll <= 0.25) {
        // Caught
        uiTitle.innerText = "Caught!";
        uiMessage.innerText = `Gotcha! ${raidBoss} was caught!`;
        uiButtons.innerHTML = '';
        let btnLeave = document.createElement('button');
        btnLeave.innerText = "Awesome!";
        btnLeave.onclick = () => closeUI();
        uiButtons.appendChild(btnLeave);
    } else {
        // Failed
        if (raidPokeballs > 0) {
            uiMessage.innerText = `Oh no! ${raidBoss} broke free! You have ${raidPokeballs} Pokeballs left.`;
        } else {
            uiTitle.innerText = "Ran Away...";
            uiMessage.innerText = `${raidBoss} fled! Better luck next time...`;
            uiButtons.innerHTML = '';
            let btnLeave = document.createElement('button');
            btnLeave.innerText = "Darn it...";
            btnLeave.onclick = () => closeUI();
            uiButtons.appendChild(btnLeave);
        }
    }
}

animate();
