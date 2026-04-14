import * as THREE from 'three';

export class Prey {
    constructor(scene, position) {
        this.scene = scene;
        this.isDead = false;

        // Randomize size/type
        this.type = Math.random() > 0.8 ? 'whale' : 'fish';
        const size = this.type === 'whale' ? 10 : 2;

        const geometry = this.type === 'whale'
            ? new THREE.BoxGeometry(size, size / 2, size * 2)
            : new THREE.ConeGeometry(size / 2, size * 2, 8);

        if (this.type === 'fish') geometry.rotateX(Math.PI / 2);

        const color = this.type === 'whale' ? 0x888888 : 0xffaa00;
        const material = new THREE.MeshStandardMaterial({ color: color });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position);

        // Random rotation
        this.mesh.rotation.x = Math.random() * Math.PI * 2; // Random orientation? No, fish sway
        this.mesh.rotation.y = Math.random() * Math.PI * 2;

        this.scene.add(this.mesh);

        this.speed = 5 + Math.random() * 5;
        this.direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.mesh.rotation.y);

        // Value for eating
        this.nutritionalValue = this.type === 'whale' ? 50 : 10;

        this.originalColor = color;
    }

    setBioluminescent(active) {
        if (active) {
            this.mesh.material.emissive.setHex(this.type === 'whale' ? 0x0000ff : 0x00ff00);
            this.mesh.material.emissiveIntensity = 1;
            this.mesh.material.color.setHex(0x000000); // Darken diffuse
        } else {
            this.mesh.material.emissive.setHex(0x000000);
            this.mesh.material.emissiveIntensity = 0;
            this.mesh.material.color.setHex(this.originalColor);
        }
    }

    update(dt) {
        if (this.isDead) return;

        // Simple movement
        this.mesh.position.add(this.direction.clone().multiplyScalar(this.speed * dt));

        // Wrap around world logic or despawn if too far? 
        // For now, let them swim.

        // Slight distinct random rotation or wobbly movement
        this.mesh.rotation.z = Math.sin(Date.now() * 0.005) * 0.1;
    }

    remove() {
        this.isDead = true;
        this.scene.remove(this.mesh);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
    }
}
