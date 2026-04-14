// No import needed - using window.TEAMS_DATA from data.js
const TEAMS = window.TEAMS_DATA;

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Game State
        this.state = 'MENU'; // MENU, PITCHING, HITTING, RUNNING, FIELDING
        this.userTeam = null;
        this.cpuTeam = null;
        this.score = { home: 0, away: 0 };
        this.inning = 1;
        this.isTop = true;
        this.outs = 0;
        this.bases = [null, null, null]; // 1st, 2nd, 3rd
        this.currentBatterIndex = 0;
        this.currentPitcherIndex = 0;

        // Ball & Physics
        this.ball = {
            x: 0, y: 0, z: 0, // z is depth
            vx: 0, vy: 0, vz: 0,
            active: false,
            type: null,
            targetX: 0,
            targetY: 0
        };

        // Aiming
        this.aimX = 0; // -1 to 1
        this.aimY = 0; // -1 to 1

        // Keyboard State
        this.keys = {};
        this.shiftPressed = false;

        // Visuals
        this.fieldWidth = 2000;
        this.fieldDepth = 4000;
        this.perspective = 0.5;

        // Assets
        this.assets = {
            batter: new Image(),
            catcher: new Image()
        };
        this.assets.batter.src = 'batter.png';
        this.assets.catcher.src = 'catcher.png';

        this.swingTime = 0;
        this.isSwinging = false;

        this.init();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    init() {
        this.populateTeamCarousel();
        this.setupEventListeners();
        requestAnimationFrame(() => this.gameLoop());
    }

    populateTeamCarousel() {
        const carousel = document.getElementById('team-carousel');
        TEAMS.forEach((team, index) => {
            const card = document.createElement('div');
            card.className = 'team-card glass';
            card.innerHTML = `
                <h3>${team.location}</h3>
                <div class="team-logo-small">⚾</div>
                <h2>${team.name.split(' ').pop()}</h2>
            `;
            card.onclick = () => {
                document.querySelectorAll('.team-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.userTeam = team;
            };
            if (index === 0) {
                card.classList.add('selected');
                this.userTeam = team;
            }
            carousel.appendChild(card);
        });
    }

    setupEventListeners() {
        document.getElementById('start-game').onclick = () => this.startGame();
        document.getElementById('settings-btn').onclick = () => this.toggleSettings(true);
        document.getElementById('resume-game').onclick = () => this.toggleSettings(false);
        document.getElementById('pitching-change').onclick = () => this.handlePitchingChange();
        document.getElementById('batting-practice').onclick = () => this.startPractice();

        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toUpperCase()] = true;
            if (e.key === 'Shift') this.shiftPressed = true;
            this.handleInput();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toUpperCase()] = false;
            if (e.key === 'Shift') this.shiftPressed = false;
        });
    }

    handleInput() {
        if (this.state !== 'GAME') return;

        // Aiming (Arrow Keys)
        if (this.keys['ARROWLEFT']) this.aimX = Math.max(-1, this.aimX - 0.05);
        if (this.keys['ARROWRIGHT']) this.aimX = Math.min(1, this.aimX + 0.05);
        if (this.keys['ARROWUP']) this.aimY = Math.max(-1, this.aimY - 0.05);
        if (this.keys['ARROWDOWN']) this.aimY = Math.min(1, this.aimY + 0.05);

        // Pitching
        if (!this.ball.active) {
            if (this.keys['F']) this.pitch('FASTBALL');
            if (this.keys['S']) this.pitch('SLIDER');
            if (this.keys['C']) {
                if (this.shiftPressed) this.pitch('CHANGEUP');
                else this.pitch('CURVEBALL');
            }
        }

        // Hitting
        if (this.ball.active && this.state === 'GAME') {
            if (this.keys['S']) {
                if (this.shiftPressed) this.steal();
                else this.swing();
            }
        }

        // Fielding (T + 1/2/3/4)
        if (this.keys['T']) {
            if (this.keys['1']) this.throwTo(0);
            if (this.keys['2']) this.throwTo(1);
            if (this.keys['3']) this.throwTo(2);
            if (this.keys['4']) this.throwTo(3); // Home
        }
    }

    startGame() {
        document.getElementById('team-selection').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.state = 'GAME';
        
        // Random CPU team
        this.cpuTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
        if (this.cpuTeam === this.userTeam) this.cpuTeam = TEAMS[(TEAMS.indexOf(this.userTeam) + 1) % TEAMS.length];

        document.getElementById('away-name').innerText = this.cpuTeam.name.substring(0, 3).toUpperCase();
        document.getElementById('home-name').innerText = this.userTeam.name.substring(0, 3).toUpperCase();
        
        this.resetInning();
    }

    resetInning() {
        this.ball.active = false;
        this.aimX = 0;
        this.aimY = 0;
    }

    pitch(type) {
        this.ball.active = true;
        this.ball.type = type;
        this.ball.z = 0;
        this.ball.x = 0;
        this.ball.y = -50; // Release height
        this.ball.vz = 50; // Depth speed
        this.ball.targetX = this.aimX * 100;
        this.ball.targetY = this.aimY * 100;

        // Basic curve logic
        this.ball.vx = (this.ball.targetX) / 100 * 2;
        this.ball.vy = (this.ball.targetY + 50) / 100 * 2;
        
        // Pitch variation
        if (type === 'SLIDER') this.ball.vx += 1;
        if (type === 'CURVEBALL') { this.ball.vy -= 1; this.ball.vz *= 0.8; }
        if (type === 'CHANGEUP') this.ball.vz *= 0.7;
    }

    swing() {
        this.isSwinging = true;
        this.swingTime = 15; // Animation frames
        
        // Simple timing check
        if (this.ball.active && this.ball.z > 3500 && this.ball.z < 4500) {
            const dist = Math.sqrt(Math.pow(this.ball.x - 0, 2) + Math.pow(this.ball.y - 0, 2));
            if (dist < 50) {
                this.handleHit();
            } else {
                this.announce("STRIKE!");
            }
        } else {
            this.announce("STRIKE!");
        }
    }

    steal() {
        const success = Math.random() > 0.5;
        if (success) {
            this.announce("SAFE! STOLEN BASE");
        } else {
            this.announce("OUT! CAUGHT STEALING");
        }
    }

    handleHit() {
        this.ball.vz = -80; // Fly back
        this.ball.vy = -40;
        this.ball.vx = (Math.random() - 0.5) * 40;
        this.announce("HIT!");
    }

    throwTo(base) {
        console.log("Throwing to base:", base);
        this.announce(`THROW TO ${base + 1}`);
    }

    announce(text) {
        const el = document.getElementById('announcement');
        const textEl = document.getElementById('announcement-text');
        textEl.innerText = text;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 1500);
    }

    toggleSettings(show) {
        document.getElementById('settings-modal').classList.toggle('hidden', !show);
    }

    handlePitchingChange() {
        this.announce("PITCHER CHANGED");
        this.toggleSettings(false);
    }

    startPractice() {
        this.announce("PRACTICE MODE");
        this.toggleSettings(false);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.state !== 'GAME') return;

        if (this.isSwinging) {
            this.swingTime--;
            if (this.swingTime <= 0) this.isSwinging = false;
        }

        if (this.ball.active) {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            this.ball.z += this.ball.vz;

            // Simple gravity
            this.ball.vy += 0.5;

            // Reset if out of bounds
            if (this.ball.z > 5000 || this.ball.z < -2000) {
                this.ball.active = false;
            }
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Field (Sky & Grass)
        const sky = ctx.createLinearGradient(0, 0, 0, canvas.height / 2);
        sky.addColorStop(0, '#001f3f');
        sky.addColorStop(1, '#0074D9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height / 2);

        ctx.fillStyle = '#2ECC40'; // Grass
        ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);

        // Draw Dirt Infield (Circle)
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(canvas.width / 2, canvas.height / 2 + 100, 400, 200, 0, 0, Math.PI * 2);
        ctx.fill();

        // Projection Helper
        const project = (x, y, z) => {
            const scale = 2000 / (2000 + z);
            return {
                x: canvas.width / 2 + x * scale,
                y: canvas.height / 2 + y * scale,
                s: scale
            };
        };

        // Draw Catcher (Placeholder at z=4200)
        const catcherPos = project(0, 50, 4100);
        if (this.assets.catcher.complete) {
            const w = 150 * catcherPos.s;
            const h = 150 * catcherPos.s;
            ctx.drawImage(this.assets.catcher, catcherPos.x - w/2, catcherPos.y - h, w, h);
        }

        // Draw Batter (Placeholder at z=4000)
        const batterPos = project(80, 50, 3900);
        if (this.assets.batter.complete) {
            ctx.save();
            const w = 250 * batterPos.s;
            const h = 250 * batterPos.s;
            ctx.translate(batterPos.x, batterPos.y - h/2);
            if (this.isSwinging) ctx.rotate(-Math.PI / 4); // Animation tilt
            ctx.drawImage(this.assets.batter, -w/2, -h/2, w, h);
            ctx.restore();
        }

        // Draw Ball
        if (this.ball.active) {
            const p = project(this.ball.x, this.ball.y, this.ball.z);
            ctx.fillStyle = 'white';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'white';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 10 * p.s, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Draw Aiming Reticle (Only when pitching)
        if (!this.ball.active && this.state === 'GAME') {
            const aim = project(this.aimX * 100, this.aimY * 100, 4000);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(aim.x, aim.y, 30, 0, Math.PI * 2);
            ctx.stroke();
            
            // Crosshair
            ctx.moveTo(aim.x - 10, aim.y);
            ctx.lineTo(aim.x + 10, aim.y);
            ctx.moveTo(aim.x, aim.y - 10);
            ctx.lineTo(aim.x, aim.y + 10);
            ctx.stroke();
        }
    }
}

new Game();
