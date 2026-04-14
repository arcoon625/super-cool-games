class Enemy {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 50;
        this.vx = -2;
        this.vy = 0;
        this.hp = 1;
        this.markedForDeletion = false;
        this.color = 'red';
        this.damage = 1;
    }

    update() {
        this.x += this.vx;

        // Simple bounds check
        if (this.x < -100) this.markedForDeletion = true;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.markedForDeletion = true;
            // Spawn particles or effect?
        }
    }
}

class CranberryEnemy extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 40;
        this.height = 40;
        this.hp = 2;
        this.vx = -3 - (Math.random() * 2);
        this.color = '#bf1e2e'; // Cranberry red
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 20, 20, 0, Math.PI * 2);
        ctx.fill();

        // Details
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 15, 2, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y + 10);
        ctx.lineTo(this.x + 20, this.y + 15);
        ctx.stroke();
    }
}

class Boss extends Enemy {
    constructor(game, x, y) {
        super(game, x, y);
        this.width = 150;
        this.height = 150;
        this.hp = 50;
        this.maxHp = 50;
        this.name = "BOSS";
        this.phase = 1;
        this.vx = 2;
    }

    update() {
        super.update();
        // Patrol logic
        if (this.x <= 50 || this.x >= this.game.width - this.width - 50) {
            this.vx *= -1;
        }
        this.drawHealthBar();
    }

    drawHealthBar(ctx) {
        // Handled by UI, but we need to update the DOM
        const fill = document.getElementById('boss-hp-fill');
        const name = document.getElementById('boss-name');
        if (fill) {
            let pct = (this.hp / this.maxHp) * 100;
            fill.style.width = pct + '%';
        }
        if (name) name.innerText = this.name;
    }
}

class SpiderBoss extends Boss {
    constructor(game, x, y) {
        super(game, x, y);
        this.name = "SPIDER QUEEN";
        this.hp = 30;
        this.maxHp = 30;
        this.y = y - 50; // Bigger
    }

    draw(ctx) {
        ctx.fillStyle = '#2c3e50';
        // Body
        ctx.beginPath();
        ctx.ellipse(this.x + 75, this.y + 75, 50, 40, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 8;
        for (let i = 0; i < 4; i++) {
            // Left legs
            ctx.beginPath();
            ctx.moveTo(this.x + 35, this.y + 75);
            ctx.lineTo(this.x - 20, this.y + 50 + (i * 20));
            ctx.stroke();

            // Right legs
            ctx.beginPath();
            ctx.moveTo(this.x + 115, this.y + 75);
            ctx.lineTo(this.x + 170, this.y + 50 + (i * 20));
            ctx.stroke();
        }

        // Eyes
        ctx.fillStyle = 'red';
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.arc(this.x + 60 + (i * 8), this.y + 60, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class CrocodileBoss extends Boss {
    constructor(game, x, y) {
        super(game, x, y);
        this.name = "CROC TERROR";
        this.hp = 45;
        this.maxHp = 45;
        this.vx = 4; // Faster
    }

    draw(ctx) {
        ctx.fillStyle = '#27ae60';
        // Body (Long)
        ctx.fillRect(this.x, this.y + 50, this.width, 50);
        // Snout
        ctx.fillRect(this.x - 40, this.y + 60, 40, 30);

        // Eye
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 50, 10, 0, Math.PI * 2);
        ctx.fill();

        // Teeth
        ctx.fillStyle = 'white';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(this.x - 35 + (i * 10), this.y + 90);
            ctx.lineTo(this.x - 30 + (i * 10), this.y + 100);
            ctx.lineTo(this.x - 25 + (i * 10), this.y + 90);
            ctx.fill();
        }
    }
}

class CatBoss extends Boss {
    constructor(game, x, y) {
        super(game, x, y);
        this.name = "MECHA CAT";
        this.hp = 60;
        this.maxHp = 60;
        this.vx = 6; // Very fast
    }

    draw(ctx) {
        ctx.fillStyle = '#95a5a6';
        // Head
        ctx.beginPath();
        ctx.arc(this.x + 75, this.y + 75, 50, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.beginPath();
        ctx.moveTo(this.x + 40, this.y + 40);
        ctx.lineTo(this.x + 40, this.y - 10);
        ctx.lineTo(this.x + 70, this.y + 30);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + 110, this.y + 40);
        ctx.lineTo(this.x + 110, this.y - 10);
        ctx.lineTo(this.x + 80, this.y + 30);
        ctx.fill();

        // Eyes (Laser)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(this.x + 55, this.y + 70, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.x + 95, this.y + 70, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
