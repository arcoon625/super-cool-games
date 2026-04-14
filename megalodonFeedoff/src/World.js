import * as THREE from 'three';
import { Prey } from './Prey.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.prey = [];
        this.frenzyActive = false;
        this.frenzyTimer = 0;
        this.blackoutActive = false;
        this.blackoutTimer = 40; // Start closer to event for testing

        this.setupEnvironment();
        this.createParticles();
    }

    setupEnvironment() {
        // Water surface
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);
        const waterMaterial = new THREE.MeshPhongMaterial({
            color: 0x2080ff,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        this.water = new THREE.Mesh(waterGeometry, waterMaterial);
        this.water.rotation.x = -Math.PI / 2;
        this.scene.add(this.water);

        // Underwater Fog
        this.scene.fog = new THREE.FogExp2(0x2080ff, 0.005); // Bright blue, low density for distance
        this.scene.background = new THREE.Color(0x2080ff);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 2); // Soft white light
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(100, 100, 50);
        this.scene.add(directionalLight);

        // Seabed (optional, deep down)
        const sandGeo = new THREE.PlaneGeometry(10000, 10000);
        const sandMat = new THREE.MeshStandardMaterial({ color: 0xc2b280 });
        this.seabed = new THREE.Mesh(sandGeo, sandMat);
        this.seabed.rotation.x = -Math.PI / 2;
        this.seabed.position.y = -200; // Deep
        this.scene.add(this.seabed);
    }

    update(dt, player) {
        // Handle Spawning
        this.handleSpawning(dt, player.position);

        // Update Particles
        this.updateParticles(player.position);

        // Update Prey
        this.prey.forEach(p => p.update(dt));

        // Remove distant prey to save performance
        this.prey = this.prey.filter(p => {
            const dist = p.mesh.position.distanceTo(player.position);
            if (dist > 500) {
                p.remove();
                return false;
            }
            return true;
        });

        // Collision / Eating Logic
        if (player.keys.KeyA) {
            // Attack logic
            // Check collisions in a cone/box in front of player
            const attackRange = player.size + 20;
            const attackPos = player.position.clone().add(player.direction.clone().multiplyScalar(player.size / 2));

            for (let i = this.prey.length - 1; i >= 0; i--) {
                const p = this.prey[i];
                if (p.isDead) continue;

                const dist = p.mesh.position.distanceTo(attackPos);
                if (dist < 20) { // Hitbox size
                    player.eat(p.nutritionalValue);
                    p.remove();
                    this.prey.splice(i, 1);
                }
            }
        }
    }

    handleSpawning(dt, playerPos) {
        this.frenzyTimer += dt;

        // Feeding Frenzy Event (every 60 seconds, lasts 10s)
        if (this.frenzyTimer > 60) {
            this.frenzyActive = true;
            if (this.frenzyTimer > 70) {
                this.frenzyTimer = 0;
                this.frenzyActive = false;
            }
        }

        // Blackout Event (every 90 seconds, lasts 15s)
        this.blackoutTimer += dt;
        if (this.blackoutTimer > 90) {
            if (!this.blackoutActive) {
                this.startBlackout();
            }
            if (this.blackoutTimer > 105) {
                this.endBlackout();
                this.blackoutTimer = 0;
            }
        }

        // For testing, trigger blackout early on load or randomly quicker
        if (Math.random() < 0.0005 && !this.blackoutActive) this.startBlackout();

        const maxPrey = this.frenzyActive ? 100 : 20;
        const spawnRate = this.frenzyActive ? 0.05 : 0.5; // Seconds per spawn

        if (this.prey.length < maxPrey && Math.random() < (dt / spawnRate)) {
            this.spawnPrey(playerPos);
        }
    }

    startBlackout() {
        this.blackoutActive = true;
        // Darken environment
        this.scene.fog.density = 0.05; // Thicker fog
        this.scene.background.setHex(0x000000); // Pitch black
        this.scene.children.forEach(c => {
            if (c.isLight) c.intensity *= 0.1; // Dim lights
        });

        // Notify prey to glow
        this.prey.forEach(p => p.setBioluminescent(true));
    }

    endBlackout() {
        this.blackoutActive = false;
        // Restore environment
        this.scene.fog.density = 0.005;
        this.scene.background.setHex(0x2080ff);
        this.scene.children.forEach(c => {
            if (c.isLight) c.intensity *= 10;
        });

        this.prey.forEach(p => p.setBioluminescent(false));
    }

    spawnPrey(playerPos) {
        // Spawn within a range of player but not too close
        const angle = Math.random() * Math.PI * 2;
        const dist = 100 + Math.random() * 100;
        const x = playerPos.x + Math.cos(angle) * dist;
        const z = playerPos.z + Math.sin(angle) * dist;
        const y = Math.max(-100, Math.min(-5, playerPos.y + (Math.random() - 0.5) * 50)); // Keep near player vertical level but underwater

        const position = new THREE.Vector3(x, y, z);
        const p = new Prey(this.scene, position);
        if (this.blackoutActive) p.setBioluminescent(true);
        this.prey.push(p);
    }

    createParticles() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 400; // Depth range
            positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.5,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    updateParticles(playerPos) {
        if (!this.particles) return;

        const positions = this.particles.geometry.attributes.position.array;
        const range = 200; // Half-size of the particle box

        for (let i = 0; i < positions.length; i += 3) {
            let x = positions[i];
            let y = positions[i + 1];
            let z = positions[i + 2];

            if (x < playerPos.x - range) x += range * 2;
            else if (x > playerPos.x + range) x -= range * 2;

            if (y < playerPos.y - range) y += range * 2;
            else if (y > playerPos.y + range) y -= range * 2;

            if (z < playerPos.z - range) z += range * 2;
            else if (z > playerPos.z + range) z -= range * 2;

            positions[i] = x;
            positions[i + 1] = y;
            positions[i + 2] = z;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
