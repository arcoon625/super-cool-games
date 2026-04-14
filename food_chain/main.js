/**
 * Food Chain Game
 * 
 * Concepts:
 * - World is large, Canvas is viewport.
 * - Entities have coords (x, y).
 * - Player follows mouse.
 * - Zones determined by X/Y.
 */

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Resize handling
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Game State
        this.entities = [];
        this.particles = [];
        this.player = null;

        // Camera
        this.camera = { x: 0, y: 0 };

        // Input
        this.mouseX = 0;
        this.mouseY = 0;
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.init();
        this.lastTime = 0;
        requestAnimationFrame((t) => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        // Create Player
        this.player = new Player(0, 0);
        this.entities.push(this.player);

        // Spawn Logic
        this.spawnTimer = 0;
    }

    loop(timestamp) {
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Spawning
        this.spawnTimer += dt;
        if (this.spawnTimer > 0.5 && this.entities.length < 50) {
            this.spawnEntity();
            this.spawnTimer = 0;
        }

        // Update entities
        this.entities.forEach(e => e.update(dt, this));

        // Camera follow player (smoothly)
        const targetCamX = this.player.markedForDeletion ? this.camera.x : this.player.x - this.canvas.width / 2;
        const targetCamY = this.player.markedForDeletion ? this.camera.y : this.player.y - this.canvas.height / 2;

        this.camera.x += (targetCamX - this.camera.x) * 0.1;
        this.camera.y += (targetCamY - this.camera.y) * 0.1;

        // Cleanup
        this.entities = this.entities.filter(e => !e.markedForDeletion);

        if (this.player.markedForDeletion) {
            // Game Over logic placeholder
            document.getElementById('stage').innerText = "DEAD (Refresh to restart)";
        }
    }

    spawnEntity() {
        // Spawn around the player but outside view
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(this.canvas.width, this.canvas.height) * (0.8 + Math.random() * 0.5);
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;

        // Determine what to spawn based on depth (y) and randomness
        const rand = Math.random();

        if (rand < 0.1) {
            this.entities.push(new Shark(x, y));
        } else if (rand < 0.4) {
            this.entities.push(new Starfish(x, y));
        } else {
            this.entities.push(new Plankton(x, y));
        }
    }

    draw() {
        // Dynamic Background based on Depth (Y)
        // 0 = Surface, Positive = Deeper
        // Simple gradient interpolation
        const depth = this.camera.y + this.canvas.height / 2;
        let r, g, b;

        if (depth < 1000) { // Sunlight Zone
            r = 0; g = 105; b = 148;
        } else if (depth < 3000) { // Twilight Zone
            r = 0; g = 20; b = 60;
        } else { // Midnight Zone
            r = 0; g = 0; b = 10;
        }

        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw entities (sort by layer? nah, just draw)
        // Draw non-player first
        this.entities.forEach(e => {
            if (e !== this.player) e.draw(this.ctx);
        });
        // Draw player on top
        if (!this.player.markedForDeletion) this.player.draw(this.ctx);

        this.ctx.restore();
    }
}

class Entity {
    constructor(x, y, radius, color, tier) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.tier = tier; // 1=Plankton, 2=Starfish/Sardine, 5=Shark
        this.markedForDeletion = false;
        this.velX = 0;
        this.velY = 0;
        this.angle = 0;
    }

    update(dt, game) {
        this.x += this.velX * dt;
        this.y += this.velY * dt;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

class Player extends Entity {
    constructor(x, y) {
        super(x, y, 15, 'silver', 2); // Tier 2
        this.speed = 250;
        this.maxSpeed = 250;
    }

    update(dt, game) {
        const mouseWorldX = game.mouseX + game.camera.x;
        const mouseWorldY = game.mouseY + game.camera.y;

        const dx = mouseWorldX - this.x;
        const dy = mouseWorldY - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 5) {
            const moveRatio = Math.min(dist, this.speed * dt) / dist;
            this.x += dx * moveRatio * 5 * dt; // Smoothing
            this.y += dy * moveRatio * 5 * dt;
            this.angle = Math.atan2(dy, dx);
        }

        // Check collisions
        game.entities.forEach(e => {
            if (e === this || e.markedForDeletion) return;
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            const rSum = this.radius + e.radius;

            if (d < rSum) {
                if (this.tier >= e.tier && this.radius > e.radius) {
                    // EAT
                    e.markedForDeletion = true;
                    this.radius += e.radius * 0.1; // Grow
                    // Increase stats
                    const score = document.getElementById('score');
                    if (score) score.innerText = parseInt(score.innerText) + (e.tier * 10);

                    // Evolution check (simple threshold)
                    if (this.radius > 30 && this.tier === 2) {
                        this.tier = 3;
                        this.color = 'gold'; // Upgrade!
                        document.getElementById('stage').innerText = "Big Fish";
                    }
                } else if (e.tier > this.tier) {
                    // DIE
                    this.markedForDeletion = true;
                }
            }
        });
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Sardine Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 2, this.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.radius, -this.radius / 3, this.radius / 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.radius + 2, -this.radius / 3, this.radius / 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Plankton extends Entity {
    constructor(x, y) {
        super(x, y, 4, '#88ff88', 1); // Tier 1
        this.driftX = (Math.random() - 0.5) * 10;
        this.driftY = (Math.random() - 0.5) * 10;
    }
    update(dt) {
        this.x += this.driftX * dt;
        this.y += this.driftY * dt;
    }
}

class Starfish extends Entity {
    constructor(x, y) {
        super(x, y, 12, '#ff6b6b', 1); // Tier 1 but bigger
        this.angle = Math.random() * Math.PI * 2;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle); // Slowly rotate?

        // Draw Star logic
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * this.radius,
                Math.sin((18 + i * 72) * Math.PI / 180) * this.radius);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * (this.radius / 2),
                Math.sin((54 + i * 72) * Math.PI / 180) * (this.radius / 2));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}

class Shark extends Entity {
    constructor(x, y) {
        super(x, y, 50, '#555', 5); // Tier 5
        this.speed = 180;
    }

    update(dt, game) {
        // Simple Chase Logic
        if (game.player && !game.player.markedForDeletion) {
            const dx = game.player.x - this.x;
            const dy = game.player.y - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 800) { // Detection range
                const angle = Math.atan2(dy, dx);
                this.velX = Math.cos(angle) * this.speed;
                this.velY = Math.sin(angle) * this.speed;
                this.angle = angle;
            } else {
                // Wander
                this.velX *= 0.99;
                this.velY *= 0.99;
            }
        }

        super.update(dt, game);
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Shark Body
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 2.5, this.radius, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dorsal Fin
        ctx.beginPath();
        ctx.moveTo(-10, -20);
        ctx.lineTo(20, -50);
        ctx.lineTo(30, -20);
        ctx.fill();

        // Tail
        ctx.beginPath();
        ctx.moveTo(-this.radius * 2, 0);
        ctx.lineTo(-this.radius * 3, -20);
        ctx.lineTo(-this.radius * 3, 20);
        ctx.fill();

        ctx.restore();
    }
}

// Start game
window.onload = () => {
    new Game();
};
