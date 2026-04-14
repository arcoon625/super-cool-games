
import * as THREE from 'three';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

// Setup basic scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);
scene.fog = new THREE.FogExp2(0x111111, 0.02);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Remove loading screen
const loadingEl = document.getElementById('loading');
if (loadingEl) loadingEl.remove();

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// Floor
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
    metalness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Grid Helper
const gridHelper = new THREE.GridHelper(200, 50, 0x444444, 0x222222);
scene.add(gridHelper);

// Input Handling
const input = {
    keys: {},
    prevKeys: {},
    mouse: new THREE.Vector2()
};

document.addEventListener('keydown', (e) => {
    input.keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    input.keys[e.key.toLowerCase()] = false;
});

// Setup Mouse Lock
document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

let pitch = 0;
let yaw = 0;

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    }
});

// Game State
const player = new Player(scene, camera);
let enemies = [];
let wave = 1;
let enemiesToSpawn = 1;

// UI
const waveDisplay = document.getElementById('wave-display');
const enemyDisplay = document.getElementById('enemy-display');
const healthFill = document.getElementById('health-fill');

function updateCamera() {
    // Camera orbital controls logic or FPS logic
    // We want a TPS camera that rotates around the player

    // Update camera rotation based on mouse
    const q = new THREE.Quaternion();
    q.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
    camera.quaternion.copy(q);

    // Position camera relative to player
    const playerPos = player.getPosition();
    const offset = new THREE.Vector3(0, 3, 8); // Behind and up
    offset.applyQuaternion(q);
    const camPos = new THREE.Vector3().copy(playerPos).add(offset);

    // Smooth follow? For now hard snap
    camera.position.copy(camPos);
    camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
}

function spawnEnemies() {
    if (enemies.length === 0 && enemiesToSpawn > 0) {
        // Spawn loop
        if (Math.random() < 0.05) { // Spawn rate
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 20;
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;

            const enemy = new Enemy(scene, new THREE.Vector3(x, 0, z));
            enemies.push(enemy);
            enemiesToSpawn--;
        }
    } else if (enemies.length === 0 && enemiesToSpawn <= 0) {
        // Wave Complete
        wave++;
        enemiesToSpawn = wave; // 1 -> 2 -> 3 etc. (Wait, user said Wave 1=1, Wave 2=2. So yes.)
        waveDisplay.innerText = wave;
    }
}

function checkCollisions() {
    // Bullets vs Enemies
    player.bullets.forEach(b => {
        enemies.forEach(e => {
            if (e.isDead) return;
            const dist = b.position.distanceTo(e.group.position);
            if (dist < 2.0) { // Hitbox size
                e.takeDamage(10); // Gun damage
                b.life = 0; // Destroy bullet
            }
        });
    });

    // Sword vs Enemies
    if (player.isAttacking && player.sword.visible) {
        // Get sword world position
        const swordPos = new THREE.Vector3();
        player.sword.getWorldPosition(swordPos);

        enemies.forEach(e => {
            if (e.isDead) return;
            const dist = player.getPosition().distanceTo(e.group.position);
            if (dist < 4.0) { // Melee range
                // Check angle? Simplified: if close and attacking, hit.
                e.takeDamage(2); // Sword damage per frame (continuous)
            }
        });
    }

    // Enemies vs Player
    enemies.forEach(e => {
        if (e.isDead) return;
        const dist = e.group.position.distanceTo(player.getPosition());
        if (dist < 1.5) {
            player.health -= 0.5;
        }
    });

    // Cleanup dead enemies
    enemies = enemies.filter(e => !e.isDead);
    enemyDisplay.textContent = enemies.length + enemiesToSpawn;
}

function update() {
    player.update(input, 1);
    enemies.forEach(e => e.update(player.getPosition()));

    spawnEnemies();
    checkCollisions();

    updateCamera();

    // reset prev keys
    input.prevKeys = { ...input.keys };

    // Health UI
    healthFill.style.width = player.health + '%';
    if (player.health <= 0) {
        document.getElementById('game-over').style.display = 'block';
        return; // Stop loop
    }

    renderer.render(scene, camera);
    requestAnimationFrame(update);
}

// Handle resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start loop
update();
