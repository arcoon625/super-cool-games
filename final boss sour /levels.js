const LEVEL_DATA = [
    {
        id: 1,
        title: "CRANBERRY FIELDS",
        background: "#2c3e50",
        groundColor: "#8e44ad",
        enemyType: "CranberryEnemy",
        enemyCount: 5,
        boss: null,
        fruit: "Cranberry",
        rewardText: "SPEED UP!"
    },
    {
        id: 2,
        title: "SPIDER'S LAIR",
        background: "#000000",
        groundColor: "#333333",
        enemyType: null,
        boss: "SpiderBoss",
        fruit: "Strawberry",
        rewardText: "ATTACK UP!"
    },
    {
        id: 3,
        title: "CROCODILE CREEK",
        background: "#1e8449", // Greenish
        groundColor: "#27ae60",
        enemyType: "CranberryEnemy", // Maybe some minions
        enemyCount: 3,
        boss: "CrocodileBoss",
        fruit: "Blueberry",
        rewardText: "DEFENSE UP!"
    },
    {
        id: 4,
        title: "NEON CAT CITY",
        background: "#2c3e50",
        groundColor: "#34495e",
        enemyType: null,
        boss: "CatBoss",
        fruit: "Lemon",
        rewardText: "SPEED & ATTACK UP!"
    }
];

class Level {
    constructor(game, levelIndex) {
        this.game = game;
        this.levelIndex = levelIndex;
        this.config = LEVEL_DATA[levelIndex] || LEVEL_DATA[0];
        this.enemies = [];
        this.particles = [];
        this.init();
    }

    init() {
        // Spawn Enemies
        if (this.config.enemyType === "CranberryEnemy") {
            for (let i = 0; i < this.config.enemyCount; i++) {
                // Random position from right side
                let x = this.game.width + (Math.random() * 800);
                let y = this.game.height - 50 - 40; // Ground - enemy height
                this.enemies.push(new CranberryEnemy(this.game, x, y));
            }
        }

        // Spawn Boss
        if (this.config.boss) {
            let bossX = this.game.width - 200;
            let bossY = this.game.height - 50 - 150; // Ground - boss height

            if (this.config.boss === "SpiderBoss") {
                this.enemies.push(new SpiderBoss(this.game, bossX, bossY));
            } else if (this.config.boss === "CrocodileBoss") {
                this.enemies.push(new CrocodileBoss(this.game, bossX, bossY));
            } else if (this.config.boss === "CatBoss") {
                this.enemies.push(new CatBoss(this.game, bossX, bossY));
            }

            // Show Boss HUD
            document.getElementById('boss-hud').classList.remove('hidden');
            document.getElementById('boss-hud').style.display = 'block';
        } else {
            document.getElementById('boss-hud').classList.add('hidden');
        }
    }

    update() {
        // Update enemies
        this.enemies.forEach(enemy => enemy.update());

        // Remove dead
        this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

        // Check level completion
        if (this.enemies.length === 0) {
            this.game.levelComplete(this.config);
        }
    }

    draw(ctx) {
        // Draw Background
        ctx.fillStyle = this.config.background;
        ctx.fillRect(0, 0, this.game.width, this.game.height);

        // Draw Ground
        ctx.fillStyle = this.config.groundColor;
        ctx.fillRect(0, this.game.height - 50, this.game.width, 50);

        // Draw Enemies
        this.enemies.forEach(enemy => enemy.draw(ctx));
    }
}
