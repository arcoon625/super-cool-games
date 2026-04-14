class Player {
    constructor(game, charType) {
        this.game = game;
        this.width = 60;
        this.height = 90;
        this.x = 100;
        this.y = game.height - this.height - 100;
        this.vy = 0;
        this.vx = 0;
        this.weight = 0.8;
        this.baseSpeed = 6;
        this.jumpPower = 22;
        this.charType = charType;
        this.facingRight = true;
        this.onGround = false;

        // Attack State
        this.isAttacking = false;
        this.attackTimer = 0;
        this.attackDuration = 20; // Frames
        this.attackCooldown = 0;

        // Stats
        this.stats = {
            speed: 0,   // Bonus from fruits
            attack: 0,  // Bonus from fruits
            defense: 0  // Bonus from fruits
        };
        this.inventory = [];
    }

    update(input) {
        // Horizontal Movement
        let currentSpeed = this.baseSpeed + (this.stats.speed * 1.5);
        if (input.isDown('ArrowRight')) {
            this.vx = currentSpeed;
            this.facingRight = true;
        } else if (input.isDown('ArrowLeft')) {
            this.vx = -currentSpeed;
            this.facingRight = false;
        } else {
            this.vx = 0;
        }

        // Jump
        if (input.isDown('KeyJ') && this.onGround) {
            this.vy -= this.jumpPower;
            this.onGround = false;
        }

        // Attack
        if (this.attackCooldown > 0) this.attackCooldown--;

        if (input.isDown('KeyA') && this.attackCooldown === 0 && !this.isAttacking) {
            this.isAttacking = true;
            this.attackTimer = this.attackDuration;
            this.attackCooldown = 30; // Frames before next attack
            // Check collisions with enemies here or in main game loop
        }

        if (this.isAttacking) {
            this.attackTimer--;
            if (this.attackTimer <= 0) {
                this.isAttacking = false;
            }
        }

        // Physics
        this.x += this.vx;
        this.y += this.vy;

        if (!this.onGround) {
            this.vy += this.weight;
        } else {
            this.vy = 0;
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > this.game.width - this.width) this.x = this.game.width - this.width;

        // Ground collision (Floor) - Hardcoded for now, will use Level platforms later
        if (this.y > this.game.height - this.height - 50) {
            this.y = this.game.height - this.height - 50;
            this.onGround = true;
        }
    }

    draw(ctx) {
        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + this.width / 2, this.game.height - 50, 20, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character Visuals
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;

        if (this.charType === 'hank') {
            this.drawHank(ctx, centerX, centerY);
        } else {
            this.drawQuinny(ctx, centerX, centerY);
        }

        // Attack Visual (Sword/Punch)
        if (this.isAttacking) {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 3;
            let dir = this.facingRight ? 1 : -1;
            let attackX = centerX + (40 * dir);

            ctx.beginPath();
            ctx.arc(attackX, centerY, 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // "Swoosh" effect
            ctx.beginPath();
            ctx.arc(centerX, centerY, 60, this.facingRight ? -0.5 : 2.5, this.facingRight ? 0.5 : 3.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawHank(ctx, x, y) {
        // HANK - Red theme, rougher look
        // Body
        let grad = ctx.createLinearGradient(x - 20, y - 40, x + 20, y + 40);
        grad.addColorStop(0, '#e74c3c');
        grad.addColorStop(1, '#c0392b');
        ctx.fillStyle = grad;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Head Band/Hair
        ctx.fillStyle = '#8e44ad';
        ctx.fillRect(this.x, this.y, this.width, 20);

        // Eyes
        this.drawEyes(ctx, x, y - 10);
    }

    drawQuinny(ctx, x, y) {
        // QUINNY - Blue theme, sleeker look
        // Body
        let grad = ctx.createLinearGradient(x - 20, y - 40, x + 20, y + 40);
        grad.addColorStop(0, '#3498db');
        grad.addColorStop(1, '#2980b9');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();

        // Goggles/Visor
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(this.x, this.y + 10, this.width, 15);

        // Eyes (Under visor maybe? or just style)
        // this.drawEyes(ctx, x, y - 5);
    }

    drawEyes(ctx, x, y) {
        ctx.fillStyle = 'white';
        let dirOffset = this.facingRight ? 4 : -4;

        // Left Eye
        ctx.beginPath();
        ctx.arc(x - 10 + dirOffset, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye
        ctx.beginPath();
        ctx.arc(x + 10 + dirOffset, y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x - 10 + dirOffset + (this.facingRight ? 2 : -2), y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 10 + dirOffset + (this.facingRight ? 2 : -2), y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}
