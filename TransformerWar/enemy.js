
import * as THREE from 'three';

export class Enemy {
    constructor(scene, position) {
        this.scene = scene;
        this.params = {
            speed: 0.15 + Math.random() * 0.1,
            hp: 50
        };

        this.group = new THREE.Group();
        this.group.position.copy(position);

        // Decepticon-ish look
        const body = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 2.0, 0.8),
            new THREE.MeshStandardMaterial({ color: 0x330033, roughness: 0.2, metalness: 0.9 }) // Dark purple
        );
        body.position.y = 1.0;
        this.group.add(body);

        // Eyes
        const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        eyeL.position.set(-0.3, 1.8, 0.4);
        this.group.add(eyeL);
        const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        eyeR.position.set(0.3, 1.8, 0.4);
        this.group.add(eyeR);

        this.scene.add(this.group);
        this.isDead = false;
    }

    update(playerPos) {
        if (this.isDead) return;

        // Move towards player
        const dir = new THREE.Vector3().subVectors(playerPos, this.group.position);
        dir.y = 0; // Stay on ground

        if (dir.length() > 1.5) { // Stop if too close
            dir.normalize();
            this.group.position.add(dir.multiplyScalar(this.params.speed));
            this.group.lookAt(playerPos.x, this.group.position.y, playerPos.z);
        }
    }

    takeDamage(amount) {
        this.params.hp -= amount;
        if (this.params.hp <= 0) {
            this.die();
        } else {
            // Flash red
            this.group.children[0].material.color.setHex(0xffffff);
            setTimeout(() => {
                if (!this.isDead) this.group.children[0].material.color.setHex(0x330033);
            }, 100);
        }
    }

    die() {
        this.isDead = true;
        this.scene.remove(this.group);
        // Maybe add explosion effect later
    }
}
