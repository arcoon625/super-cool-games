import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        this.size = 50; // Feet
        this.speed = 20; // Movement speed
        this.turnSpeed = 1.5;
        this.verticalSpeed = 10;

        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3(0, 0, -1);
        this.position = new THREE.Vector3(0, -10, 0); // Start underwater

        this.hunger = 100;
        this.maxHunger = 100;
        this.isDead = false;

        // Create a placeholder mesh for the shark (invisible or visible for debug)
        const geometry = new THREE.ConeGeometry(1, 4, 8); // Simple shape
        geometry.rotateX(Math.PI / 2); // Point forward
        const material = new THREE.MeshStandardMaterial({ color: 0x606060 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.scale.set(this.size / 10, this.size / 10, this.size / 5); // Scale based on size

        // We'll hide the mesh for first person view, or keep it if we want to see part of "us"
        // For "eye view", we attach camera to mesh
        this.scene.add(this.mesh);

        // Controls state
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            Shift: false, // For Sprint
            Space: false, // Ascend
            KeyC: false, // Descend
            KeyJ: false, // Jump
            KeyA: false // Attack
        };

        this.hasJumped = false;

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(e) {
        if (e.key === 'Shift') this.keys.Shift = true;
        if (this.keys.hasOwnProperty(e.code) || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
            if (e.code === 'Space') this.keys.Space = true; // Map Space specifically
            else this.keys[e.code] = true;
        }
        // Handle mapped keys
        if (e.code === 'ArrowUp') this.keys.ArrowUp = true;
        if (e.code === 'ArrowDown') this.keys.ArrowDown = true;
        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = true;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = true;
        if (e.code === 'KeyC') this.keys.KeyC = true;

        if (e.code === 'KeyJ') {
            this.keys.KeyJ = true;
            if (!this.hasJumped && this.position.y > -5) { // Can only jump near surface
                this.jump();
            }
        }
        if (e.code === 'KeyA') this.keys.KeyA = true;
    }

    onKeyUp(e) {
        if (e.key === 'Shift') this.keys.Shift = false;
        if (this.keys.hasOwnProperty(e.code) || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'Space') {
            if (e.code === 'Space') this.keys.Space = false;
            else this.keys[e.code] = false;
        }
        if (e.code === 'ArrowUp') this.keys.ArrowUp = false;
        if (e.code === 'ArrowDown') this.keys.ArrowDown = false;
        if (e.code === 'ArrowLeft') this.keys.ArrowLeft = false;
        if (e.code === 'ArrowRight') this.keys.ArrowRight = false;
        if (e.code === 'KeyJ') this.keys.KeyJ = false;
        if (e.code === 'KeyA') this.keys.KeyA = false;
        if (e.code === 'KeyC') this.keys.KeyC = false;
    }

    jump() {
        this.velocity.y = 30; // Impulse
        this.hasJumped = true;
        setTimeout(() => { this.hasJumped = false; }, 2000); // Cooldown
    }

    update(dt) {
        if (this.isDead) return;

        // Hunger decay
        this.hunger -= 1 * dt;
        if (this.hunger <= 0) {
            this.hunger = 0;
            this.die();
        }

        // Movement Logic
        let currentSpeed = this.speed * dt;
        if (this.keys.Shift) {
            currentSpeed *= 3; // Sprint Multiplier
        }

        const moveSpeed = currentSpeed;
        const rotSpeed = this.turnSpeed * dt;

        // Rotation
        if (this.keys.ArrowLeft) {
            this.mesh.rotation.y += rotSpeed;
        }
        if (this.keys.ArrowRight) {
            this.mesh.rotation.y -= rotSpeed;
        }

        // Update direction vector based on rotation
        this.mesh.getWorldDirection(this.direction);
        this.direction.normalize();

        // Forward Movement
        if (this.keys.ArrowUp) {
            this.velocity.add(this.direction.clone().multiplyScalar(moveSpeed));
        }
        // Backward drag/brake
        if (this.keys.ArrowDown) {
            this.velocity.sub(this.direction.clone().multiplyScalar(moveSpeed * 0.5));
        }

        // Vertical Movement (Space = Up, C = Down)
        if (this.keys.Space) {
            this.velocity.y += this.verticalSpeed * dt;
        }
        if (this.keys.KeyC) {
            this.velocity.y -= this.verticalSpeed * dt;
        }

        // Apply physics/velocity
        this.position.add(this.velocity.clone().multiplyScalar(dt));
        this.velocity.multiplyScalar(0.95); // Drag

        // Gravity if out of water
        if (this.position.y > 0) {
            this.velocity.y -= 9.8 * dt;
        } else {
            // Bouyancy/Water resistance vertical damping
            this.velocity.y *= 0.95;
        }

        this.mesh.position.copy(this.position);

        // Camera follow (Eye view)
        this.camera.position.copy(this.mesh.position).add(new THREE.Vector3(0, 1, 0));

        // Look direction (same as shark mostly)
        const lookAtPos = this.mesh.position.clone().add(this.direction.clone().multiplyScalar(100));
        this.camera.lookAt(lookAtPos);
    }

    eat(amount) {
        this.hunger = Math.min(this.maxHunger, this.hunger + amount);
        this.grow(amount * 0.1);
    }

    grow(amount) {
        this.size += amount;
        // Scale mesh
        const scale = this.size / 50;
        this.mesh.scale.set(scale, scale, scale);
        // Adjust speed (bigger = faster max speed but slower accel/turn?)
        // For fun: bigger = faster
        this.speed = 20 + (this.size - 50) * 0.5;
    }

    die() {
        this.isDead = true;
        document.getElementById('game-over').classList.remove('hidden');
    }
}
