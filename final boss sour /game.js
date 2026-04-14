class Game {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.player = null;
        this.input = new InputHandler();
        this.currentLevelIndex = 0;
        this.level = null; // Will start in start()
        this.state = 'MENU'; // MENU, PLAYING, LEVEL_TRANSITION, GAME_OVER, WIN
    }

    start(charType) {
        this.player = new Player(this, charType);
        this.currentLevelIndex = 0;
        this.startLevel(this.currentLevelIndex);

        // Hide UI, Show HUD
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('active');
        document.getElementById('hud').classList.remove('hidden');
        document.getElementById('hud').style.display = 'flex';
        this.updateHUD();
    }

    startLevel(index) {
        this.currentLevelIndex = index;
        if (index >= LEVEL_DATA.length) {
            // Victory or Loop?
            this.currentLevelIndex = 0; // Loop for now or show "YOU WIN" screen properly
        }
        this.level = new Level(this, this.currentLevelIndex);
        this.state = 'PLAYING';
        this.player.x = 100; // Reset position
        this.player.y = this.height - this.player.height - 100;
        this.player.vx = 0;

        // Hide screens
        document.getElementById('win-screen').classList.add('hidden');
    }

    update() {
        if (this.state === 'PLAYING') {
            this.player.update(this.input);
            this.level.update();
            this.checkCollisions();
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, this.width, this.height);

        if (this.state === 'PLAYING' || this.state === 'LEVEL_TRANSITION') {
            this.level.draw(ctx);
            this.player.draw(ctx);
        }
    }

    checkCollisions() {
        this.level.enemies.forEach(enemy => {
            // 1. Player Attack -> Enemy
            if (this.player.isAttacking) {
                // Simple hitbox for attack
                let attackRange = 100;
                let dx = enemy.x - this.player.x;
                let dy = enemy.y - this.player.y;
                let dist = Math.sqrt(dx * dx + dy * dy);

                // Direction check
                let facingEnemy = (this.player.facingRight && dx > 0) || (!this.player.facingRight && dx < 0);

                if (dist < attackRange && facingEnemy && !enemy.invulnerable) {
                    enemy.takeDamage(1 + this.player.stats.attack); // Base damage 1 + stats
                    enemy.invulnerable = true;
                    setTimeout(() => enemy.invulnerable = false, 500); // .5s invincibility

                    // Knockback
                    enemy.x += this.player.facingRight ? 30 : -30;
                }
            }

            // 2. Enemy -> Player
            if (!enemy.markedForDeletion) {
                if (
                    this.player.x < enemy.x + enemy.width &&
                    this.player.x + this.player.width > enemy.x &&
                    this.player.y < enemy.y + enemy.height &&
                    this.player.y + this.player.height > enemy.y
                ) {
                    // Collision
                    // TODO: Player take damage
                    // console.log("Player hit!");
                }
            }
        });
    }

    levelComplete(config) {
        if (this.state === 'LEVEL_TRANSITION') return;
        this.state = 'LEVEL_TRANSITION';

        // Apply Rewards
        this.applyFruitReward(config.fruit);

        // Updates UI
        document.getElementById('reward-name').innerText = `${config.fruit} (${config.rewardText})`;
        document.getElementById('win-screen').classList.remove('hidden');
        document.getElementById('win-screen').classList.add('active');

        // Wait for user to click Next Level logic (handled by button event listener below)
    }

    applyFruitReward(fruit) {
        this.player.inventory.push(fruit);

        switch (fruit) {
            case 'Cranberry':
                this.player.stats.speed += 1;
                break;
            case 'Strawberry':
                this.player.stats.attack += 1;
                break;
            case 'Blueberry':
                this.player.stats.defense += 1;
                break;
            case 'Lemon':
                this.player.stats.speed += 1;
                this.player.stats.attack += 1;
                break;
            case 'Kiwi':
                this.player.stats.speed += 1;
                this.player.stats.attack += 1;
                break;
            case 'Mango':
                this.player.stats.speed += 1;
                this.player.stats.attack += 1;
                this.player.stats.defense += 1;
                break;
        }
        this.updateHUD();
    }

    updateHUD() {
        document.getElementById('speed-val').innerText = this.player.stats.speed;
        document.getElementById('atk-val').innerText = this.player.stats.attack;
        document.getElementById('def-val').innerText = this.player.stats.defense;
        document.getElementById('fruit-val').innerText = this.player.inventory.join(', ');
    }
}

window.addEventListener('load', function () {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;

    const game = new Game(canvas.width, canvas.height);

    // Character Selection
    document.querySelectorAll('.char-option').forEach(option => {
        option.addEventListener('click', () => {
            // Basic selection visual feedback could go here
            const charType = option.getAttribute('data-char');
            game.start(charType);
        });
    });

    // Next Level Button
    const nextBtn = document.getElementById('next-level-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            game.startLevel(game.currentLevelIndex + 1);
        });
    }

    function animate() {
        game.update();
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate();
});
