class Game {
    constructor() {
        this.renderer = new Renderer('gameCanvas');
        this.input = new InputHandler();
        this.playManager = new PlayManager(this);

        this.state = GAME_STATE.MENU;
        this.playType = ''; // Initialize
        this.lastTime = 0;

        this.userTeam = null;
        this.cpuTeam = null;
        this.homeTeam = null; // Who starts on left

        this.score = { home: 0, away: 0 };
        this.currentDown = 1;
        this.scrimmageLine = 200; // Pixel position X
        this.firstDownLine = 300; // 10 yards (approx 100px logic? Wait, field is 1024-160=864px for 100 yards. so ~8.6px per yard. 10 yards = 86px.)
        // Let's refine scale: Width 1024. Endzones 80+80=160. Field = 864px. 100 yards. 1 yard = 8.64px.
        this.pixelsPerYard = 8.64;
        this.yardsToFirst = 10;

        this.timeouts = 3;
        this.clock = 300;
        this.quarter = 1;
        this.possession = null;
        this.playType = '';
        this.isTwoPointAttempt = false; // Flag for conversion attempts
        this.runClockBetweenPlays = false;

        this.initUI();
        this.initAudio();
    }

    initUI() {
        const teamContainer = document.getElementById('team-selection');
        teamContainer.innerHTML = '';

        if (typeof TEAMS !== 'undefined' && Array.isArray(TEAMS)) {
            TEAMS.forEach(t => {
                const btn = document.createElement('button');
                btn.textContent = t.name;
                btn.style.backgroundColor = t.color;
                btn.style.borderColor = t.secondary;
                btn.onclick = () => this.selectTeam(t);
                teamContainer.appendChild(btn);
            });

            const randomBtn = document.createElement('button');
            randomBtn.textContent = "Random Team";
            randomBtn.className = "random-team-btn";
            randomBtn.style.backgroundColor = "#444";
            randomBtn.style.color = "#fff";
            randomBtn.style.border = "2px solid #fff";
            randomBtn.style.padding = "10px 20px";
            randomBtn.onclick = () => {
                const randomTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
                this.selectTeam(randomTeam);
            };
            teamContainer.appendChild(randomBtn);
        }

        document.getElementById('btn-heads').onclick = () => this.handleCoinToss('Heads');
        document.getElementById('btn-tails').onclick = () => this.handleCoinToss('Tails');

        // PLAYBOOK UI
        document.getElementById('btn-run-cat').onclick = () => this.showPlayCategory('RUN');
        document.getElementById('btn-pass-cat').onclick = () => this.showPlayCategory('PASS');
        document.getElementById('btn-kick').onclick = () => {
            if (this.currentDown === 4) this.attemptPunt();
            else this.attemptKick('FG');
        };
        document.getElementById('btn-back-to-cat').onclick = () => {
            document.getElementById('play-categories').classList.remove('hidden');
            document.getElementById('play-list-container').classList.add('hidden');
            document.getElementById('btn-back-to-cat').classList.add('hidden');
        };

        // CONVERSION UI
        document.getElementById('btn-extra-point').onclick = () => this.startConversionChoice('KICK');
        document.getElementById('btn-two-point').onclick = () => this.startConversionChoice('PLAY');
    }

    showPlayCategory(cat) {
        const container = document.getElementById('play-list-container');
        container.innerHTML = '';
        container.classList.remove('hidden');
        document.getElementById('play-categories').classList.add('hidden');
        document.getElementById('btn-back-to-cat').classList.remove('hidden');

        const playbook = {
            'RUN': [
                { name: 'HB Dive', type: 'RUN', color: '#44aa44' },
                { name: 'HB Toss', type: 'HB_TOSS', color: '#33cc33' },
                { name: 'Jet Sweep', type: 'JET_SWEEP', color: '#228822' },
                { name: 'QB Draw', type: 'QB_DRAW', color: '#66aa66' },
                { name: 'QB Sneak', type: 'TUSH_PUSH', color: '#116611' }
            ],
            'PASS': [
                { name: 'Slant Routes', type: 'SLANT', color: '#4444aa' },
                { name: 'Corner Routes', type: 'CORNER', color: '#3333cc' },
                { name: 'Deep Post', type: 'DEEP_POST', color: '#222288' },
                { name: 'Screen Pass', type: 'SCREEN', color: '#111166' },
                { name: 'Hail Mary', type: 'HAIL_MARY', color: '#ff4444' },
                { name: 'Hook & Ladder', type: 'LATERAL', color: '#ff8800' }
            ]
        };

        const plays = playbook[cat];
        plays.forEach(p => {
            const btn = document.createElement('button');
            btn.textContent = p.name;
            btn.style.backgroundColor = p.color;
            btn.style.padding = "10px 20px";
            btn.onclick = () => {
                this.startPlayMode(p.type);
                // Reset UI for next time
                document.getElementById('play-categories').classList.remove('hidden');
                document.getElementById('play-list-container').classList.add('hidden');
                document.getElementById('btn-back-to-cat').classList.add('hidden');
            };
            container.appendChild(btn);
        });
    }

    selectTeam(teamData) {
        // Warm up audio on first user interaction
        this.warmUpAudio();

        this.userTeam = new Team(teamData.name, teamData.color, teamData.secondary, teamData.rating, teamData.roster);
        this.userTeam.side = 'home';
        this.homeTeam = this.userTeam;

        // Random CPU team
        const otherTeams = TEAMS.filter(t => t.name !== teamData.name);
        const cpuData = otherTeams[Math.floor(Math.random() * otherTeams.length)];
        this.cpuTeam = new Team(cpuData.name, '#F0F0F0', cpuData.color, cpuData.rating, cpuData.roster);
        this.cpuTeam.side = 'away';

        this.state = GAME_STATE.COIN_TOSS;
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('coin-toss').classList.remove('hidden');

        // Announce team selection
        setTimeout(() => {
            this.speak(`Selection confirmed. ${this.userTeam.name} taking the field today.`, this.martinVoice);
        }, 500);
    }

    handleCoinToss(choice) {
        this.warmUpAudio();
        const r = Math.random();
        const result = r < 0.5 ? 'Heads' : 'Tails';
        const win = result === choice;
        document.getElementById('coin-result').textContent = win ? "You Won! Receive." : "Lost. CPU Receive.";
        this.homeTeam = this.userTeam;
        this.possession = win ? 'USER' : 'CPU';

        // Initial drive start
        if (this.possession === 'USER') {
            this.scrimmageLine = 200; // User 20
        } else {
            // CPU starts at their 30 (User requested)
            // Field is 1024. CPU Endzone is Left (0)? No.
            // User is Home (Left). CPU is Away (Right).
            // CPU Drives Right (1024) to Left (0).
            // Their 30 is 30 yards from Left Endzone? No, from their own goal line (0).
            // Wait, if User is Left (0->1024), their goal is 1024.
            // CPU is Right (1024->0), their goal is 0.
            // CPU 30 yard line is 300px from 0? No...
            // Standard football: Start at own 20/25/30.
            // If User is Home (Left Endzone 0-100?), they drive -> Right. 200 is User 20 (approx).
            // CPU is Away (Right Endzone 924-1024?), they drive -> Left.
            // CPU 30 yard line would be 1024 - 300 = 724.
            this.scrimmageLine = 724;
        }

        this.firstDownLine = this.scrimmageLine + (10 * this.pixelsPerYard * (this.possession === 'USER' ? 1 : -1));
        this.currentDown = 1;
        this.yardsToFirst = 10;

        setTimeout(() => {
            document.getElementById('coin-toss').classList.add('hidden');
            document.getElementById('hud').classList.remove('hidden');
            this.startDown();
        }, 1500);
    }

    startDown() {
        this.state = GAME_STATE.PLAY_CALLING;
        // Check direction for First Down line visual
        const dir = (this.possession === 'USER') ? 1 : -1;
        this.firstDownLine = this.scrimmageLine + (this.yardsToFirst * this.pixelsPerYard * dir);

        // Capping at Goal Line
        const goalLine = (dir === 1) ? 1024 - 50 : 50;
        if (dir === 1 && this.firstDownLine > goalLine) this.firstDownLine = goalLine;
        if (dir === -1 && this.firstDownLine < goalLine) this.firstDownLine = goalLine;

        document.getElementById('play-calling').classList.remove('hidden');
        this.updateHUD();

        // Announce Down
        const ord = this.getOrdinal(this.currentDown);
        const downText = `${this.currentDown}${ord} and ${this.yardsToFirst}`;
        // this.speak(downText); // Optional if you want to speak every down start


        if (this.possession === 'CPU') {
            document.getElementById('play-calling').classList.add('hidden');
            const menu = document.getElementById('special-play-menu');
            if (menu) menu.classList.add('hidden'); // Ensure closed for CPU turn
            setTimeout(() => {
                try {
                    // CPU Decision Making
                    // 4th Down Logic
                    if (this.currentDown === 4) {
                        const distToGoal = (this.possession === 'USER') ? (this.scrimmageLine - 50) : (1024 - 50 - this.scrimmageLine);
                        const normalizedDist = Math.abs(distToGoal / this.pixelsPerYard); // Yards to goal

                        // If roughly within 35 yards, Field Goal
                        if (normalizedDist < 35) {
                            this.speak("Field Goal Unit coming out.");
                            setTimeout(() => this.attemptKick('FG'), 2000);
                            return;
                        } else {
                            // Punt
                            this.speak("Punt Team on the field.");
                            this.attemptPunt();
                            return;
                        }
                    }

                    const r = Math.random();
                    let type = 'RUN';
                    if (r < 0.15) type = 'RUN';
                    else if (r < 0.25) type = 'HB_TOSS';
                    else if (r < 0.35) type = 'JET_SWEEP';
                    else if (r < 0.45) type = 'SLANT';
                    else if (r < 0.55) type = 'CORNER';
                    else if (r < 0.65) type = 'DEEP_POST';
                    else if (r < 0.75) type = 'SCREEN';
                    else if (r < 0.82) type = 'QB_DRAW';
                    else if (r < 0.90) type = 'HAIL_MARY';
                    else if (r < 0.95) type = 'TUSH_PUSH';
                    else type = 'LATERAL';

                    this.startPlayMode(type);
                } catch (e) { console.error(e); }
            }, 2000);
        }
    }

    update(dt) {
        // Clock
        const shouldRunClock = ((this.state === GAME_STATE.PLAY_RUNNING && !this.isTwoPointAttempt) ||
            (this.state === GAME_STATE.PLAY_CALLING && this.runClockBetweenPlays));

        if (shouldRunClock && this.clock > 0) {
            this.clock -= dt;
            if (this.clock <= 0) {
                this.clock = 0;
                this.quarter++;
                if (this.quarter > 4) {
                    alert("GAME OVER");
                } else {
                    this.clock = 300;
                    alert(`End of Quarter ${this.quarter - 1}`);
                }
            }
            this.updateHUD();
        }

        if (this.state === GAME_STATE.PLAY_RUNNING) {
            this.playManager.update(dt);

            // REPLAY RECORDING
            // Only record if running
            if (this.replayData) {
                // Snapshot
                const frame = {
                    players: this.playManager.players.map(p => ({
                        x: p.x, y: p.y, dir: p.dir, role: p.role, number: p.number, teamColor: p.team.color, secondary: p.team.secondaryColor, radius: p.radius, isWhite: (p.team.color === '#F0F0F0')
                    })),
                    ball: { x: this.playManager.ball.x, y: this.playManager.ball.y }
                };
                this.replayData.push(frame);
            }

            // Input checks for Passing (Only if User Offense)
            if (this.possession === 'USER') {
                if (this.input.isPressed(KEYS.DIGIT_1)) this.playManager.throwBall('1');
                if (this.input.isPressed(KEYS.DIGIT_2)) this.playManager.throwBall('2');
                if (this.input.isPressed(KEYS.DIGIT_3)) this.playManager.throwBall('3');
            }
        } else if (this.state === 'REPLAY') {
            // Replay Logic
            this.replayTimer += dt;
            if (this.replayTimer > 0.016) { // 60fps
                this.replayTimer = 0;
                this.replayFrame++;
                if (this.replayFrame >= this.replayData.length) {
                    this.replayFrame = 0; // Loop or Stop? Loop is nice.
                }
            }

            // Exit Replay check
            if (this.input.isPressed('Escape') || this.input.isPressed(' ')) {
                this.endReplay();
            }
        }

        // Timeout check
        if (this.input.isPressed('t')) {
            if (this.timeouts > 0) {
                this.timeouts--;
                alert("Timeout Called!");
                this.updateHUD();
            }
        }

        this.input.clearPressed();
    }

    render() {
        this.renderer.clear();

        // Focus Logic for Cinematic Camera
        let targetX = FIELD.WIDTH / 2;
        let targetY = FIELD.HEIGHT / 2;
        let playDir = (this.playManager) ? this.playManager.playDirection : 1;

        if (this.state === GAME_STATE.PLAY_RUNNING || this.state === 'POST_PLAY') {
            const carrier = this.playManager?.ball?.carrier;
            const target = carrier || this.userPlayer || this.playManager?.players[0];
            if (target && Number.isFinite(target.x) && Number.isFinite(target.y)) {
                targetX = target.x;
                targetY = target.y;
            }
        } else if (this.state === GAME_STATE.PLAY_CALLING) {
            targetX = this.scrimmageLine;
            targetY = FIELD.HEIGHT / 2;
        } else if (this.state === 'REPLAY' && this.replayData && this.replayData[this.replayFrame]) {
            const frame = this.replayData[this.replayFrame];
            targetX = frame.ball.x;
            targetY = frame.ball.y;
        }

        this.renderer.applyCameraTransform(targetX, targetY, playDir);

        this.renderer.drawField(this.firstDownLine);

        // Render players if in Running, Post-Play, or Play-Calling (showing formation)
        const showPlayers = (this.state === GAME_STATE.PLAY_RUNNING || this.state === 'POST_PLAY' || this.state === GAME_STATE.PLAY_CALLING);

        if (showPlayers && this.playManager) {
            this.playManager.players.forEach(p => this.renderer.drawPlayer(p));
            this.renderer.drawBall(this.playManager.ball.x, this.playManager.ball.y, this.playManager.ball.carrier);
        } else if (this.state === 'REPLAY' && this.replayData && this.replayData[this.replayFrame]) {
            // Render Replay Frame
            const frame = this.replayData[this.replayFrame];
            frame.players.forEach(pData => {
                const mockP = {
                    x: pData.x,
                    y: pData.y,
                    team: pData.team,
                    role: pData.role,
                    number: pData.number,
                    radius: pData.radius || 12,
                    angle: pData.angle || 0,
                    animTimer: 0,
                    isMoving: true
                };
                this.renderer.drawPlayer(mockP);
            });
            this.renderer.drawBall(frame.ball.x, frame.ball.y, null);
        }

        this.renderer.resetCameraTransform();

        // UI elements don't move with camera
        if (this.state === 'REPLAY') {
            this.renderer.ctx.fillStyle = "red";
            this.renderer.ctx.font = "bold 24px Arial";
            this.renderer.ctx.fillText("REPLAY MODE", this.renderer.canvas.width / 2, 50);
        }
    }

    // ... updateHUD ...

    startReplayMode() {
        if (!this.replayData || this.replayData.length === 0) return;

        // Cancel auto-advance if user clicks replay
        if (this.nextPlayTimer) {
            clearTimeout(this.nextPlayTimer);
            this.nextPlayTimer = null;
        }

        this.prevState = this.state;
        this.state = 'REPLAY';
        this.replayFrame = 0;
        this.replayTimer = 0;
        document.getElementById('hud').classList.add('hidden');

        // Hide Replay button in replay mode
        const btn = document.getElementById('btn-replay');
        if (btn) btn.style.display = 'none';
    }

    endReplay() {
        this.state = GAME_STATE.PLAY_CALLING; // Go straight to play calling
        document.getElementById('hud').classList.remove('hidden');

        // Resume play flow
        this.startDown();
    }

    initAudio() {
        if (!window.speechSynthesis) return;

        const setVoices = () => {
            let voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            // Debug voice availability
            console.log("Found Voices:", voices.length);

            // MARTIN: Primary Play-by-Play (British)
            this.martinVoice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'))
                || voices.find(v => v.name === 'Google UK English Male')
                || voices.find(v => v.name === 'Daniel')
                || voices.find(v => v.lang.startsWith('en-GB'))
                || voices.find(v => v.lang.startsWith('en'))
                || voices[0];

            // PETER: Color Commentary (British)
            this.peterVoice = voices.find(v => v.lang === 'en-GB' && v.name !== this.martinVoice?.name && v.name.includes('Female'))
                || voices.find(v => v.name === 'Google UK English Female')
                || voices.find(v => v.name === 'Serena')
                || voices.find(v => v.lang.startsWith('en-GB') && v.name !== this.martinVoice?.name)
                || voices[1]
                || voices[0];

            console.log(`🎙️ COMMENTARY LOADED: Martin=${this.martinVoice?.name}, Peter=${this.peterVoice?.name}`);
        };

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = setVoices;
        }
        setVoices();
        setTimeout(setVoices, 500);
        setTimeout(setVoices, 2000); // Late load fallback
    }

    // Unlocks TTS engine on user gesture
    warmUpAudio() {
        if (!window.speechSynthesis) return;
        if (this.audioUnlocked) return;

        const utterance = new SpeechSynthesisUtterance(""); // Silent
        utterance.volume = 0;
        window.speechSynthesis.speak(utterance);
        this.audioUnlocked = true;
        console.log("🔊 Audio Engine Warmed Up");
    }

    speak(text, voice) {
        try {
            if (!window.speechSynthesis) return;

            if (!voice) window.speechSynthesis.cancel(); // Cancel only if it's a new primary event (Martin)

            const utterance = new SpeechSynthesisUtterance(text);
            if (voice) utterance.voice = voice;

            // Adjust pitch/rate for distinction
            if (voice === this.peterVoice) {
                utterance.rate = 1.0; // Peter is poetic and rhythmic
                utterance.pitch = 0.95;
            } else {
                utterance.rate = 1.1; // Martin is high energy
                utterance.pitch = 1.05;
            }

            window.speechSynthesis.speak(utterance);

            const debugEl = document.getElementById('debug-input');
            if (debugEl) debugEl.textContent = `Commentary: ${text}`;
        } catch (e) { console.error("TTS Error:", e); }
    }

    fanSpeak(type) {
        if (!window.speechSynthesis) return;
        const cheers = ["YEAHHHHH!", "WOOOOOOO!", "TOUCHDOWN! LET'S GO!", "UNBELIEVABLE!"];
        const boos = ["BOOOOOOO!", "NOOOOO!", "TERRIBLE!", "BLOODY HELL!"];

        const phrase = (type === 'CHEER') ?
            cheers[Math.floor(Math.random() * cheers.length)] :
            boos[Math.floor(Math.random() * boos.length)];

        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.volume = 0.4; // "don't make those sounds too loud"
        utterance.rate = 1.3;   // High energy
        utterance.pitch = 1.2;  // Higher pitch for crowd feel

        // Use a generic voice for fans to contrast with broadcasters
        window.speechSynthesis.speak(utterance);
    }

    handlePlayEnd(reason, ballX, tackler = null) {
        try {
            this.state = 'POST_PLAY'; // FREEZE GAME LOGIC

            // Enable Replay Button
            const btn = document.getElementById('btn-replay');
            if (btn) btn.style.display = 'block';

            // Fan Reaction
            const gain = (ballX - this.scrimmageLine) * ((this.possession === 'USER') ? 1 : -1);
            if (gain > 100) this.fanSpeak('CHEER');

            const dir = (this.possession === 'USER') ? 1 : -1;

            if (reason === 'TOUCHDOWN') {
                const isUserScore = (this.possession === 'USER');

                if (this.isTwoPointAttempt) {
                    this.score[isUserScore ? 'home' : 'away'] += 2;
                    this.isTwoPointAttempt = false;
                    this.commentate('GAIN', "The 2-point conversion is GOOD!");
                    setTimeout(() => {
                        this.switchPossession();
                        const kickoffPos = (this.possession === 'USER') ? 350 : 674;
                        this.resetDrive(kickoffPos);
                    }, 2000);
                    return;
                }

                // Regular Touchdown
                this.score[isUserScore ? 'home' : 'away'] += 6;
                this.commentate('TOUCHDOWN');

                // Fans reaction
                setTimeout(() => {
                    this.fanSpeak(isUserScore ? 'CHEER' : 'BOO');
                }, 500);

                // Go to CONVERSION state
                setTimeout(() => {
                    if (this.possession === 'USER') {
                        this.showConversionChoice();
                    } else {
                        // CPU Choice: 85% Kick, 15% 2pt
                        const cpuGoesForTwo = Math.random() < 0.15; // 15% random chance
                        if (cpuGoesForTwo) this.startConversionChoice('PLAY');
                        else this.startConversionChoice('KICK');
                    }
                }, 1500);
                return;
            }

            if (reason === 'SAFETY') {
                this.score[this.possession === 'USER' ? 'away' : 'home'] += 2; // Opponent gets 2
                this.speak("Safety!");
                this.commentate('SAFETY', "Available safety speech.");

                setTimeout(() => {
                    this.switchPossession();
                    this.resetDrive(500);
                }, 100);
                return;
            }
            if (reason === 'TURNOVER' || reason === 'INTERCEPTION') {
                this.speak("Turnover! Defense takes the ball.");

                this.nextPlayTimer = setTimeout(() => {
                    this.switchPossession();
                    this.resetDrive(ballX);
                }, 100);
                return;
            }

            if (reason === 'FUMBLE') {
                this.speak("FUMBLE! The ball is loose! Recovered by the defense!");
                this.commentate('TURNOVER', "FUMBLE! TURNOVER!");

                this.nextPlayTimer = setTimeout(() => {
                    this.switchPossession();
                    this.resetDrive(ballX);
                }, 3000);
                return;
            }

            // --- YARDAGE & DOWNS ---
            let gainPixels = (ballX - this.scrimmageLine) * dir;
            if (reason === 'INCOMPLETE') gainPixels = 0;

            if (reason !== 'INCOMPLETE') {
                this.scrimmageLine = ballX;
            }

            // Commentary for plays
            if (reason === 'TACKLE') {
                const gainYards = Math.round(gainPixels / this.pixelsPerYard);

                // Check for Sack - Safe check for playType
                const isPassPlay = this.playType && (typeof this.playType === 'string') && this.playType.includes('PASS');

                if (gainYards < 0 && isPassPlay) {
                    let sackerName = "the defense";
                    if (tackler && tackler.team && tackler.role) {
                        try {
                            sackerName = this.getPlayerName(tackler.team, tackler.role);
                        } catch (e) {
                            console.warn("Name lookup failed", e);
                        }
                    }
                    this.commentate('SACK', `Sacked by ${sackerName}! Loss of ${Math.abs(gainYards)} yds.`);
                } else {
                    let tacklerName = "";
                    if (tackler && tackler.team && tackler.role) {
                        try {
                            let name = this.getPlayerName(tackler.team, tackler.role);
                            if (name) tacklerName = ` by ${name}`;
                        } catch (e) {
                            console.warn("Name lookup failed", e);
                        }
                    }

                    if (gainYards > 10) this.commentate('GAIN', `Big gain of ${gainYards} yards! Tackled${tacklerName}.`);
                    else this.commentate('GAIN', `Gain of ${gainYards} yards. Tackled${tacklerName}.`);
                }
            }
            const yardsGained = Math.round(gainPixels / this.pixelsPerYard);

            // Timer Logic: Run clock if play ended in bounds (TACKLE)
            // Stop clock on Out of Bounds, Incomplete, Scores
            this.runClockBetweenPlays = (reason === 'TACKLE');

            if (reason === 'TACKLE' || reason === 'OUT_OF_BOUNDS') {
                if (yardsGained > 2) this.speak(`Gain of ${yardsGained}.`);
                else if (yardsGained < -1) this.commentate('LOSS', (this.possession === 'USER' ? this.userTeam.name : this.cpuTeam.name));
                else this.commentate('NO_GAIN', (this.possession === 'USER' ? this.userTeam.name : this.cpuTeam.name));

                if (reason === 'OUT_OF_BOUNDS') this.speak("Stepped out of bounds.");
            } else if (reason === 'INCOMPLETE') {
                this.speak("Incomplete pass.");
            }

            let firstDown = false;
            // Guard against undefined scrimmageLine/firstDownLine math
            if (this.scrimmageLine && this.firstDownLine) {
                if (dir === 1 && this.scrimmageLine >= this.firstDownLine) firstDown = true;
                else if (dir === -1 && this.scrimmageLine <= this.firstDownLine) firstDown = true;
            }

            const goalLine = (dir === 1) ? 1024 - 50 : 50;
            const distToGoalPixels = Math.abs(goalLine - this.scrimmageLine);
            const yardsToGoal = Math.ceil(distToGoalPixels / this.pixelsPerYard);

            if (firstDown) {
                this.speak("First Down!");
                this.currentDown = 1;
                // Cap yards to first at yards to goal
                this.yardsToFirst = Math.min(10, yardsToGoal);
            } else {
                this.currentDown++;
                let distPixels = Math.abs(this.firstDownLine - this.scrimmageLine);
                this.yardsToFirst = Math.ceil(distPixels / this.pixelsPerYard);
            }

            // Update Goal Situation Flag
            this.isGoalSituation = (this.yardsToFirst === yardsToGoal);

            if (this.currentDown > 4) {
                this.speak("Turnover on downs.");
                this.nextPlayTimer = setTimeout(() => {
                    this.switchPossession();
                    this.resetDrive(this.scrimmageLine);
                }, 100);
                return;
            }

            // Delay next play slightly for commentary
            this.nextPlayTimer = setTimeout(() => {
                this.startDown();
            }, 100);

        } catch (error) {
            console.error("CRITICAL ERROR IN HANDLE_PLAY_END:", error);
            // DEBUG SPEECH: Tell the user what went wrong
            const msg = error.message || "Unknown Error";
            this.speak("Technical difficulties. " + msg);

            this.nextPlayTimer = setTimeout(() => {
                this.startDown();
            }, 2000);
        }
    }

    // Need to initialize replayData in startPlayMode
    startPlayMode(type) {
        try {
            document.getElementById('play-calling').classList.add('hidden');
            // Hide replay button
            const btn = document.getElementById('btn-replay');
            if (btn) btn.style.display = 'none';

            this.replayData = []; // Clear old replay
            this.playType = type; // SAVE THE PLAY TYPE
            this.state = GAME_STATE.PLAY_RUNNING;
            this.playManager.setupPlay(
                this.possession === 'USER' ? this.userTeam : this.cpuTeam,
                this.possession === 'USER' ? this.cpuTeam : this.userTeam,
                this.scrimmageLine, type
            );
        } catch (e) { console.error(e); alert("Start Play Error: " + e.message); }
    }

    getOrdinal(n) {
        if (n > 3 && n < 21) return 'th';
        switch (n % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }

    updateHUD() {
        document.getElementById('score-home').textContent = this.score.home;
        document.getElementById('score-away').textContent = this.score.away;

        let downText = `${this.currentDown}${this.getOrdinal(this.currentDown)} & ${this.yardsToFirst}`;
        if (this.isGoalSituation) downText = `${this.currentDown}${this.getOrdinal(this.currentDown)} & Goal`;
        if (this.currentDown > 4) downText = "Turnover";

        // ADD PLAY NAME TO HUD
        if (this.state === GAME_STATE.PLAY_RUNNING && this.playType) {
            let pName = this.playType.replace('_', ' ');
            if (this.isTwoPointAttempt) pName = "2PT CONVERSION (" + pName + ")";
            downText += ` | ${pName}`;
        }

        document.getElementById('down-yard').textContent = downText;
        document.getElementById('timeouts').textContent = `TO: ${this.timeouts}`;
        document.getElementById('quarter').textContent = `Q${this.quarter}`;

        // Timer format MM:SS
        const min = Math.floor(this.clock / 60);
        const sec = Math.floor(this.clock % 60);
        document.getElementById('timer').textContent = `${min}:${sec < 10 ? '0' + sec : sec}`;

        if (this.userTeam) {
            document.getElementById('team-home').textContent = this.userTeam.name;
            document.getElementById('team-away').textContent = this.cpuTeam.name;
        }

        // Input Debugger
        const debugEl = document.getElementById('debug-input');
        if (debugEl) {
            let keys = [];
            if (this.input.isDown('ArrowUp') || this.input.isDown('KeyW')) keys.push('UP');
            if (this.input.isDown('ArrowDown') || this.input.isDown('KeyS')) keys.push('DOWN');
            if (this.input.isDown('ArrowLeft') || this.input.isDown('KeyA')) keys.push('LEFT');
            if (this.input.isDown('ArrowRight') || this.input.isDown('KeyD')) keys.push('RIGHT');
            debugEl.textContent = `Input: ${keys.join(' ')}`;
        }
    }

    loop(timestamp) {
        try {
            const dt = (timestamp - this.lastTime) / 1000;
            this.lastTime = timestamp;

            this.update(dt);
            this.render();

            requestAnimationFrame((ts) => this.loop(ts));
        } catch (e) {
            console.error(e);
            const el = document.getElementById('error-log');
            if (el) {
                el.textContent += `\nError: ${e.message}\n${e.stack}`;
            } else {
                alert("Game Critical Error: " + e.message);
            }
        }
    }

    start() {
        requestAnimationFrame((ts) => {
            this.lastTime = ts;
            this.loop(ts);
        });
    }

    switchPossession() {
        this.possession = (this.possession === 'USER') ? 'CPU' : 'USER';
        this.playManager.ball.carrier = null;
    }

    resetDrive(startLine) {
        this.scrimmageLine = startLine;
        this.currentDown = 1;

        const dir = (this.possession === 'USER') ? 1 : -1;
        const goalLine = (dir === 1) ? 1024 - 50 : 50;
        const distToGoalPixels = Math.abs(goalLine - this.scrimmageLine);
        const yardsToGoal = Math.ceil(distToGoalPixels / this.pixelsPerYard);

        this.yardsToFirst = Math.min(10, yardsToGoal);
        this.isGoalSituation = (this.yardsToFirst === yardsToGoal);

        this.startDown();
    }

    attemptPunt() {
        setTimeout(() => {
            // Punt Logic
            // Distance: 35-55 yards
            const puntDist = 35 + Math.random() * 20;
            const dir = (this.possession === 'USER') ? 1 : -1;

            // Calculate new line
            // If User Punts (dir 1, moving down), ball moves further down (add pixels)
            // If CPU Punts (dir -1, moving up), ball moves further up (sub pixels)
            // Wait, punt moves ball *away* from kicker.

            // Current scrum line
            let newLine = this.scrimmageLine + (dir * puntDist * this.pixelsPerYard);

            // Cap at 20 yard line (Touchback)
            if (dir === 1 && newLine > (1024 - 100)) newLine = 1024 - 100; // Opponent 20
            if (dir === -1 && newLine < 100) newLine = 100; // Opponent 20

            this.commentate('PUNT');
            this.speak(`Punt of ${Math.floor(puntDist)} yards.`);

            this.switchPossession();
            this.resetDrive(newLine);

        }, 2000);
    }

    attemptKick(type) {
        // type = 'FG' or 'PAT'
        let distance = 0;
        if (type === 'PAT') distance = 20;
        else {
            const dir = (this.possession === 'USER') ? 1 : -1;
            const endZoneX = (dir === 1) ? 1024 - 50 : 50;
            const distPixels = Math.abs(endZoneX - this.scrimmageLine);
            distance = Math.round(distPixels / this.pixelsPerYard) + 17;
        }

        // Probability
        let chance = 1.0;
        if (distance > 30) chance -= (distance - 30) * 0.02;

        const roll = Math.random();
        const success = roll < chance;

        if (success) {
            this.commentate('GAIN', `Kick is GOOD! (${distance} yds)`);
            if (type === 'FG') this.score[this.possession === 'USER' ? 'home' : 'away'] += 3;
            else this.score[this.possession === 'USER' ? 'home' : 'away'] += 1;
        } else {
            this.commentate('NO_GAIN', "Kick is No Good! Wide!");
        }

        setTimeout(() => {
            if (type === 'FG') this.switchPossession();
            // If PAT, we just scored, so we kickoff next (resetDrive handles kickoff pos)
            // Wait, if PAT, possession is still USER until Kickoff? 
            // Logic: TD -> PAT -> Kickoff.
            // If FG -> Kickoff (Defense ball).

            if (type === 'FG') {
                if (success) {
                    const kickoffPos = (this.possession === 'USER') ? 200 : 824;
                    this.resetDrive(kickoffPos);
                } else {
                    this.resetDrive(this.scrimmageLine); // Turnover on downs
                }
            } else { // PAT
                this.switchPossession();
                const kickoffPos = (this.possession === 'USER') ? 345 : 679; // Approx 30 yard line
                this.resetDrive(kickoffPos);
            }
        }, 2000);

        document.getElementById('play-calling').classList.add('hidden');
        document.getElementById('post-td-choice').classList.add('hidden');
    }

    showConversionChoice() {
        this.state = GAME_STATE.CONVERSION;
        document.getElementById('post-td-choice').classList.remove('hidden');
        document.getElementById('play-calling').classList.add('hidden');
    }

    startConversionChoice(choice) {
        document.getElementById('post-td-choice').classList.add('hidden');

        if (choice === 'KICK') {
            this.attemptKick('PAT');
        } else {
            // 2-Point Conversion Setup
            this.isTwoPointAttempt = true;
            this.state = GAME_STATE.PLAY_CALLING;

            // Place at 2-yard line
            const dir = (this.possession === 'USER') ? 1 : -1;
            const goalLine = (dir === 1) ? 1024 - 80 : 80;
            this.scrimmageLine = goalLine - (dir * 2 * this.pixelsPerYard);

            this.yardsToFirst = 2; // Goal
            this.isGoalSituation = true;

            // Show playbook
            document.getElementById('play-calling').classList.remove('hidden');
            document.getElementById('play-categories').classList.remove('hidden');
            document.getElementById('play-list-container').classList.add('hidden');
            document.getElementById('btn-back-to-cat').classList.add('hidden');
        }
    }

    // Helper for random commentary
    // British Broadcast Commentary System (Martin & Peter Style)
    commentate(type, data) {
        const martin = [
            { type: 'TOUCHDOWN', text: `BRILLIANT! ABSOLUTELY MAGNIFICENT GOAL!` },
            { type: 'TOUCHDOWN', text: `HE'S FOUND THE BACK OF THE NET! TOUCHDOWN!` },
            { type: 'TOUCHDOWN', text: `PURE CLASS! HE'S IN FOR THE SCORE!` },
            { type: 'TOUCHDOWN', text: `OH, YOU BEAUTY! WHAT A TOUCHDOWN!` },
            { type: 'TOUCHDOWN', text: `UNSTOPPABLE! THE CROWD IS DELIGHTED!` },
            { type: 'SAFETY', text: `OH DEAR! HE'S BEEN NICKED IN HIS OWN AREA! THAT'S A SAFETY!` },
            { type: 'SAFETY', text: `DISASTER FOR THEM! TACKLED IN THE ENDZONE! SAFETY!` },
            { type: 'TURNOVER', text: `INTERCEPTED! CRUEL LUCK FOR THE ATTACKERS!` },
            { type: 'TURNOVER', text: `HE'S NICKED IT! THE DEFENSE TAKES OVER!` },
            { type: 'TURNOVER', text: `BLOODY HELL, HE'S DROPPED THE BALL! TURNOVER!` },
            { type: 'BIG_GAIN', text: `LOOK AT HIM GO! A LOVELY BIT OF FOOTBALL FOR ${data} YARDS!` },
            { type: 'BIG_GAIN', text: `HE'S BROKEN FREE! ABSOLUTELY FLYING FOR ${data} YARDS!` },
            { type: 'BIG_GAIN', text: `SENSATIONAL RUN! THAT'S ${data} MORE YARDS!` },
            { type: 'GAIN', text: `A SOLID GAIN OF ${data}.` },
            { type: 'GAIN', text: `KEEPING THE MOMENTUM WITH ${data} YARDS.` },
            { type: 'GAIN', text: `LOVELY STUFF, THAT'S ${data} YARDS.` },
            { type: 'LOSS', text: `CAUGHT OUT! LOSS OF ${Math.abs(data)} YARDS.` },
            { type: 'LOSS', text: `THE DEFENSE WAS READY! LOSS OF ${Math.abs(data)}.` },
            { type: 'NO_GAIN', text: `NOTHING DOING THERE. STOIC DEFENDING.` },
            { type: 'NO_GAIN', text: `HE'S BEEN MET BY A WALL. NO GAIN.` },
            { type: 'INCOMPLETE', text: `MUDDLED IT! PASS FALLS INCOMPLETE.` },
            { type: 'INCOMPLETE', text: `JUST A BIT TOO MUCH ON THAT ONE. INCOMPLETE.` },
            { type: 'FIRST_DOWN', text: `CHALK THAT ONE UP! FIRST DOWN!` },
            { type: 'FIRST_DOWN', text: `HE'S GOT ENOUGH! MOVE THE CHAINS!` }
        ];

        const peter = [
            { type: 'TOUCHDOWN', text: `IT'S POETRY IN MOTION, MARTIN. ABSOLUTE SCENARIO!` },
            { type: 'TOUCHDOWN', text: `YOU SIMPLY CANNOT DEFEND AGAINST GENIUS LIKE THAT.` },
            { type: 'TOUCHDOWN', text: `THE STUFF OF LEGENDS. HE'S WRITTEN HIS NAME IN GLORY.` },
            { type: 'SAFETY', text: `A TRAGEDY IN ONE ACT. NOWHERE TO HIDE THERE.` },
            { type: 'TURNOVER', text: `HE READ THAT LIKE A SUNDAY NOVEL. BRILLIANT STEAL.` },
            { type: 'TURNOVER', text: `A MOMENT OF MADNESS! THE DEFENSE WILL REVEL IN THIS.` },
            { type: 'BIG_GAIN', text: `HE'S CARVING THEM APART! LIKE A HOT KNIFE THROUGH BUTTER.` },
            { type: 'BIG_GAIN', text: `SUCH ELEGANCE. SUCH POWER. HE IS A FORCE OF NATURE.` },
            { type: 'GAIN', text: `WORKMANLIKE. HE'S DOING THE HARD YARDS.` },
            { type: 'LOSS', text: `A RATHER DAMP SQUIB OF A PLAY, THAT.` },
            { type: 'NO_GAIN', text: `A PROPER TUSSLE, BUT NO GROUND WON.` },
            { type: 'INCOMPLETE', text: `A WHISPER AWAY FROM PERFECTION.` },
            { type: 'FIRST_DOWN', text: `THE DRIVE BREATHES AGAIN. VITAL.` },
            { type: 'PUNT', text: `SENDING IT CLEAR ACROSS THE COUNTY.` },
            { type: 'PUNT', text: `A PROPER CLEARANCE, THAT.` }
        ];

        // Filter valid comments
        const validMartins = martin.filter(c => c.type === type);
        const validPeters = peter.filter(c => c.type === type);

        let text = "";
        if (validMartins.length > 0) {
            text = validMartins[Math.floor(Math.random() * validMartins.length)].text;
        } else {
            text = type; // Fallback
        }

        // Martin speaks first
        this.speak(text, this.martinVoice);

        // 40% chance for Peter to add poetic analysis
        if (validPeters.length > 0 && Math.random() < 0.4) {
            const peterComment = validPeters[Math.floor(Math.random() * validPeters.length)].text;
            setTimeout(() => this.speak(peterComment, this.peterVoice), 2500);
        }
    }
}
