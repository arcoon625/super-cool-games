
import * as THREE from 'three';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;
        this.isVehicle = false;
        this.health = 100;
        this.speed = 0.5;
        this.velocity = new THREE.Vector3();
        this.direction = new THREE.Vector3();
        this.bullets = [];
        this.lastShot = 0;
        
        // Robot parts
        this.robotGroup = new THREE.Group();
        // Simple Robot Body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.3, metalness: 0.8 }));
        torso.position.y = 1.5;
        this.robotGroup.add(torso);
        
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), new THREE.MeshStandardMaterial({ color: 0xaaaaaa, roughness: 0.3, metalness: 0.8 }));
        head.position.y = 2.4;
        this.robotGroup.add(head);

        // Arms
        const armL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        armL.position.set(-0.7, 1.5, 0);
        this.robotGroup.add(armL);
        const armR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        armR.position.set(0.7, 1.5, 0);
        this.robotGroup.add(armR);
        this.armR = armR; // For sword animation

        // Legs
        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.35), new THREE.MeshStandardMaterial({ color: 0x0000aa }));
        legL.position.set(-0.3, 0.75, 0);
        this.robotGroup.add(legL);
        const legR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 0.35), new THREE.MeshStandardMaterial({ color: 0x0000aa }));
        legR.position.set(0.3, 0.75, 0);
        this.robotGroup.add(legR);

        // Vehicle parts
        this.vehicleGroup = new THREE.Group();
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.5, 2.5), new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.2, metalness: 0.9 }));
        chassis.position.y = 0.5;
        this.vehicleGroup.add(chassis);
        const cab = new THREE.Mesh(new THREE.BoxGeometry(1, 0.4, 1), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        cab.position.set(0, 1, -0.2);
        this.vehicleGroup.add(cab);
        this.vehicleGroup.visible = false;

        this.scene.add(this.robotGroup);
        this.scene.add(this.vehicleGroup);
        
        // Sword
        this.sword = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 2 }));
        this.sword.position.set(0, -0.8, 0.5);
        this.sword.rotation.x = Math.PI / 2;
        this.sword.visible = false;
        armR.add(this.sword);

        this.isAttacking = false;
    }

    update(input, dt) {
        // Transform
        if (input.keys['t'] && !input.prevKeys['t']) {
            this.isVehicle = !this.isVehicle;
            this.robotGroup.visible = !this.isVehicle;
            this.vehicleGroup.visible = this.isVehicle;
            
            // Adjust camera height based on mode
            if (this.isVehicle) {
                this.speed = 1.0; // Faster in vehicle
                // Update crosshair visibility
                document.getElementById('crosshair').style.display = 'none';
            } else {
                this.speed = 0.5;
                document.getElementById('crosshair').style.display = 'block';
            }
        }
        
        // Movement
        this.direction.set(0, 0, 0);
        if (input.keys['w']) this.direction.z = -1;
        if (input.keys['s']) this.direction.z = 1;
        if (input.keys['a']) this.direction.x = -1;
        if (input.keys['d']) this.direction.x = 1;

        if (this.direction.length() > 0) {
            this.direction.normalize().applyQuaternion(this.camera.quaternion);
            this.direction.y = 0; // Keeping it on the ground plane mostly
            this.velocity.copy(this.direction).multiplyScalar(this.speed);
            
            const currentGroup = this.isVehicle ? this.vehicleGroup : this.robotGroup;
            currentGroup.position.add(this.velocity);
            
            // Rotate character to face movement direction
            if (this.isVehicle && this.direction.lengthSq() > 0.01) {
                 const targetRotation = Math.atan2(this.direction.x, this.direction.z);
                 // Smooth rotation
                 const qStub = new THREE.Quaternion();
                 qStub.setFromAxisAngle(new THREE.Vector3(0,1,0), targetRotation);
                 currentGroup.quaternion.slerp(qStub, 0.1);
            } else {
                 // In robot mode, character faces camera direction mainly, or free?
                 // Let's make robot face camera direction basically
                 const euler = new THREE.Euler(0, 0, 0, 'YXZ');
                 euler.setFromQuaternion(this.camera.quaternion);
                 currentGroup.rotation.y = euler.y;
            }
        }
        
        // Synch vehicle position/robot position
        if (this.isVehicle) {
            this.robotGroup.position.copy(this.vehicleGroup.position);
        } else {
            this.vehicleGroup.position.copy(this.robotGroup.position);
        }

        // Camera follow
        const currentPos = this.isVehicle ? this.vehicleGroup.position : this.robotGroup.position;
        // Third person camera offset
        const idealOffset = this.isVehicle ? new THREE.Vector3(0, 5, 10) : new THREE.Vector3(0, 3, 5);
        idealOffset.applyQuaternion(this.camera.quaternion); // This makes it follow rotation
        // Actually for a simple shooter, let's keep camera somewhat independent but follow position
        // We will update camera position in Main Loop more precisely, or here.
        // Let's just update the camera position relative to player
        
        
        // Attack
        if (!this.isVehicle) {
            if (input.keys['s'] && !this.isAttacking) {
                this.swingSword();
            }
            if (input.keys['g'] && Date.now() - this.lastShot > 200) {
                this.shoot();
            }
        }

        // Bullets update
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.position.add(b.velocity);
            b.life -= dt;
            if (b.life <= 0) {
                this.scene.remove(b);
                this.bullets.splice(i, 1);
            }
        }
        
        // Sword animation
        if (this.isAttacking) {
             this.sword.rotation.x -= 0.2;
             if (this.sword.rotation.x < -1) {
                 this.isAttacking = false;
                 this.sword.visible = false;
                 this.sword.rotation.x = Math.PI/2;
             }
        }
    }
    
    swingSword() {
        this.isAttacking = true;
        this.sword.visible = true;
        this.sword.rotation.x = Math.PI / 2; 
    }

    shoot() {
        const bullet = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 8, 8), 
            new THREE.MeshBasicMaterial({ color: 0xffff00 })
        );
        bullet.position.copy(this.robotGroup.position);
        bullet.position.y += 2; // Shoot from head/shoulder height
        
        // Shoot direction is camera direction
        const dir = new THREE.Vector3(0, 0, -1);
        dir.applyQuaternion(this.camera.quaternion);
        
        bullet.velocity = dir.multiplyScalar(2.0); // Fast bullet
        bullet.life = 100; // frames
        
        this.scene.add(bullet);
        this.bullets.push(bullet);
        this.lastShot = Date.now();
    }
    
    getPosition() {
        return this.isVehicle ? this.vehicleGroup.position : this.robotGroup.position;
    }
}
