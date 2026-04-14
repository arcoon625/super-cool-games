import * as THREE from 'three';
import { Player } from './src/Player.js';
import { World } from './src/World.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const world = new World(scene);
const player = new Player(scene, camera);

// UI Elements
// Accessed directly in loop


// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Game Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const dt = clock.getDelta();

    player.update(dt);
    world.update(dt, player);

    // Update UI
    const sizePercent = Math.min(100, (player.size / 200) * 100); // Assume 200ft is "max" bar width visual
    document.getElementById('size-bar').style.width = `${sizePercent}%`;
    document.getElementById('size-val').innerText = `${Math.floor(player.size)}ft`;

    document.getElementById('hunger-bar').style.width = `${Math.floor(player.hunger)}%`;

    renderer.render(scene, camera);
}

animate();
