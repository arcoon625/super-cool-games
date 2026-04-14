class PlayManager {
    constructor(game) {
        this.game = game;
        this.players = [];
        this.ball = { x: 0, y: 0, carrier: null, inAir: false, target: null };
        this.playType = null; // 'RUN' or 'PASS'
        this.playState = 'SETUP'; // SETUP, RUNNING, ENDED
    }

    setupPlay(offenseTeam, defenseTeam, scrimmageX, playType) {
        console.log(`Setting up play: ${playType} at ${scrimmageX}`);
        this.playType = playType;
        this.playState = 'SETUP';
        this.players = [];
        const dir = offenseTeam === this.game.homeTeam ? 1 : -1; // 1 = Left to Right, -1 = Right to Left
        this.playDirection = dir;

        // --- OFFENSE (11 Players) ---
        // 5 Linemen
        const startY = 150; // Started higher
        const gap = 70; // Increased from 50 to 70 for more space
        // LT, LG, C, RG, RT
        for (let i = 0; i < 5; i++) {
            this.players.push(new Player(scrimmageX, startY + (i * gap), offenseTeam, 'OL', 'OL'));
        }

        // QB
        const qb = new Player(scrimmageX - (25 * dir), startY + (2 * gap), offenseTeam, 'QB', 'QB'); // Aligned with C
        this.players.push(qb);

        // Skill Players
        // WRs (Spread out)
        this.players.push(new Player(scrimmageX, 50, offenseTeam, 'WR', '1')); // WR1 Top
        this.players.push(new Player(scrimmageX, 550, offenseTeam, 'WR', '2')); // WR2 Bottom

        // TE
        this.players.push(new Player(scrimmageX, startY - 40, offenseTeam, 'TE', 'TE')); // Flex TE

        // Backfield & Specialized Formations
        const runPlays = ['RUN', 'JET_SWEEP', 'HB_TOSS', 'QB_DRAW'];
        const passPlays = ['PASS', 'DEEP_POST', 'SCREEN', 'SLANT', 'CORNER', 'HAIL_MARY', 'LATERAL'];

        let rb;
        if (runPlays.includes(playType)) {
            rb = new Player(scrimmageX - (60 * dir), startY + (2 * gap), offenseTeam, 'RB', 'RB');
            this.players.push(rb);
            this.players.push(new Player(scrimmageX - (40 * dir), startY + (1.5 * gap), offenseTeam, 'FB', 'FB'));
            this.game.userPlayer = (playType === 'QB_DRAW') ? qb : rb;
        } else if (passPlays.includes(playType)) {
            rb = new Player(scrimmageX - (50 * dir), startY + (2 * gap), offenseTeam, 'RB', 'RB');
            this.players.push(rb);
            this.players.push(new Player(scrimmageX - (10 * dir), startY + (3.5 * gap), offenseTeam, 'WR', '3'));
            this.game.userPlayer = qb;
        } else if (playType === 'TUSH_PUSH') {
            const qbX = scrimmageX - (10 * dir); // Closer
            qb.setPos(qbX, startY + (2 * gap));
            this.players.push(new Player(qbX - (15 * dir), startY + (1.5 * gap), offenseTeam, 'RB', 'FB'));
            this.players.push(new Player(qbX - (15 * dir), startY + (2.5 * gap), offenseTeam, 'RB', 'RB'));
            this.players.push(new Player(scrimmageX, startY - 20, offenseTeam, 'TE', 'TE'));
            this.players.push(new Player(scrimmageX, startY + (5 * gap) + 20, offenseTeam, 'TE', 'TE2'));
            this.game.userPlayer = qb;
        }

        if (!this.game.userPlayer) this.game.userPlayer = qb;

        // --- DEFENSE (11 Players) ---
        const isHeavy = (playType === 'TUSH_PUSH');

        // 1. D-Line (4 Linemen)
        // Shift closer if heavy
        const dLineOffset = isHeavy ? (5 * dir) : (15 * dir);
        const dLineStart = scrimmageX + dLineOffset;

        for (let i = 0; i < 4; i++) {
            const p = new Player(dLineStart, startY + (i * gap) + 35, defenseTeam, 'DL', 'DL');
            this.players.push(p);
        }

        // 2. Linebackers (3 Players)
        // MLB
        const lbDepth = isHeavy ? (25 * dir) : (60 * dir); // Stack the box for Tush Push
        const mlb = new Player(scrimmageX + lbDepth, startY + (2 * gap), defenseTeam, 'LB', 'MLB');
        this.players.push(mlb);

        // OLBs
        const olbDepth = isHeavy ? (20 * dir) : (50 * dir);
        const olbYOffset = isHeavy ? (0.5 * gap) : (1.5 * gap); // Tighter on heavy
        this.players.push(new Player(scrimmageX + olbDepth, startY - olbYOffset, defenseTeam, 'LB', 'OLB'));
        this.players.push(new Player(scrimmageX + olbDepth, startY + (4 * gap) + olbYOffset, defenseTeam, 'LB', 'OLB'));

        // 3. Defensive Backs (4 Players)
        // CBs
        const cbDepth = isHeavy ? (15 * dir) : (25 * dir);
        this.players.push(new Player(scrimmageX + cbDepth, 50, defenseTeam, 'CB', 'CB'));
        this.players.push(new Player(scrimmageX + cbDepth, 550, defenseTeam, 'CB', 'CB'));

        // Safeties
        const sDepth = isHeavy ? (80 * dir) : (150 * dir); // Move up for run support
        this.players.push(new Player(scrimmageX + sDepth, startY + (1.5 * gap), defenseTeam, 'S', 'FS'));
        this.players.push(new Player(scrimmageX + sDepth, startY + (3.5 * gap), defenseTeam, 'S', 'SS'));

        // Give user control if playing defense
        if (defenseTeam === this.game.userTeam) {
            this.game.userPlayer = mlb;
            console.log("User Defense: Controlling MLB");
        }

        // --- MAN-TO-MAN ASSIGNMENTS ---
        const offensePlayers = this.players.filter(p => p.team === offenseTeam);
        const defensePlayers = this.players.filter(p => p.team === defenseTeam);

        const offenseWRs = offensePlayers.filter(p => p.role === 'WR');
        const offenseRB = offensePlayers.find(p => p.role === 'RB');
        const offenseTE = offensePlayers.find(p => p.role === 'TE');

        defensePlayers.forEach(p => {
            if (p.role === 'CB') {
                // CB1 -> WR1, CB2 -> WR2
                const targetNum = (p.y < 300) ? '1' : '2';
                p.manTarget = offenseWRs.find(w => w.number === targetNum) || offenseWRs[0];
            } else if (p.role === 'LB') {
                if (p.number === 'MLB') p.manTarget = offenseRB;
                else {
                    // OLBs cover TE or Slot (WR3)
                    const slot = offenseWRs.find(w => w.number === '3');
                    p.manTarget = (p.y < 300) ? (offenseTE || slot) : (slot || offenseTE);
                }
            } else if (p.role === 'S') {
                // Safeties double team or provide help
                p.manTarget = (p.y < 300) ? offenseWRs.find(w => w.number === '1') : offenseWRs.find(w => w.number === '2');
            }
        });


        this.ball.carrier = qb || this.players[0];
        this.ball.x = (this.ball.carrier) ? this.ball.carrier.x : scrimmageX;
        this.ball.y = (this.ball.carrier) ? this.ball.carrier.y : startY + (2 * gap);
        this.ball.inAir = false;

        // Auto-snap effectively
        setTimeout(() => {
            try { if (this.startPlay) this.startPlay(); } catch (e) { console.error("StartPlay Error:", e); }
        }, 1000);
    }

    startPlay() {
        this.playState = 'RUNNING';
        this.handoffTimer = 0;
        this.handoffComplete = false;

        // QB always starts with the ball
        const qb = this.players.find(p => p.role === 'QB');
        if (qb) {
            this.ball.carrier = qb;
            qb.isBallCarrier = true;
        }

        if (this.playType === 'JET_SWEEP') {
            const wr = this.players.find(p => p.role === 'WR' && p.number === '2');
            if (wr) {
                // WR starts moving across for sweep
                wr.sweepState = 'CROSSING';
            }
        }

        if (['RUN', 'JET_SWEEP', 'HB_TOSS', 'QB_DRAW'].includes(this.playType)) {
            this.handoffComplete = false;
        } else {
            this.handoffComplete = true; // Pass plays
        }
    }

    update(dt) {
        if (this.playState !== 'RUNNING' && this.playState !== 'ENDED') return;

        // Reset movement state at start of frame
        this.players.forEach(p => {
            p.resetMovementState();
            p.blockedBy = null; // Reset blocked state
        });

        // --- AI & MOVEMENT UPDATE ---
        this.players.forEach(p => {
            if (p.state === 'DANCING') {
                p.danceTimer += dt;
                return; // Don't move while dancing
            }

            // Handoff Timing Logic (Offense)
            if (this.playType === 'RUN' && !this.handoffComplete && p.role === 'QB') {
                this.handoffTimer += dt;
                if (this.handoffTimer > 0.8) { // 0.8s handoff delay
                    const rb = this.players.find(pl => pl.role === 'RB' && pl.team === p.team);
                    if (rb) {
                        p.isBallCarrier = false;
                        this.ball.carrier = rb;
                        rb.isBallCarrier = true;
                        this.handoffComplete = true;
                    }
                }
            }

            // JET SWEEP HANDOFF
            if (this.playType === 'JET_SWEEP' && !this.handoffComplete && p.role === 'QB') {
                const wr = this.players.find(pl => pl.role === 'WR' && pl.number === '2' && pl.team === p.team);
                if (wr) {
                    const dist = Math.hypot(wr.x - p.x, wr.y - p.y);
                    if (dist < 40) {
                        p.isBallCarrier = false;
                        this.ball.carrier = wr;
                        wr.isBallCarrier = true;
                        this.handoffComplete = true;
                        wr.sweepState = 'RUNNING';
                        wr.sweepDir = (wr.y < 300) ? 1 : -1; // Sweep towards middle/sideline
                    }
                }
            }

            // HB TOSS HANDOFF (Fast Pitch)
            if (this.playType === 'HB_TOSS' && !this.handoffComplete && p.role === 'QB') {
                const rb = this.players.find(pl => pl.role === 'RB' && pl.team === p.team);
                if (rb) {
                    const dist = Math.hypot(rb.x - p.x, rb.y - p.y);
                    if (dist < 80) { // Large radius for toss
                        p.isBallCarrier = false;
                        this.ball.carrier = rb;
                        rb.isBallCarrier = true;
                        this.handoffComplete = true;
                    }
                }
            }

            // QB DRAW (Delayed Handoff/Run)
            if (this.playType === 'QB_DRAW' && !this.handoffComplete && p.role === 'QB') {
                this.handoffTimer += dt;
                if (this.handoffTimer > 1.0) { // Wait 1s
                    this.handoffComplete = true;
                }
            }

            // Increment animation timer if moving
            if (p.isMoving) {
                p.animTimer += dt;
            }
            // 1. User Control (Override all else if active user player)
            if (p === this.game.userPlayer) {
                let dx = 0;
                let dy = 0;
                const dir = this.playDirection;

                // Relative controls based on vertical "Behind the QB" view
                // UP (W/ArrowUp) should always move DOWNFIELD (X direction * playDirection)
                // LEFT/RIGHT should always move across the field (Y direction)
                if (this.game.input.isDown('ArrowUp') || this.game.input.isDown('KeyW')) dx = dir;
                if (this.game.input.isDown('ArrowDown') || this.game.input.isDown('KeyS')) dx = -dir;
                if (this.game.input.isDown('ArrowLeft') || this.game.input.isDown('KeyA')) dy = -dir;
                if (this.game.input.isDown('ArrowRight') || this.game.input.isDown('KeyD')) dy = dir;

                if (dx !== 0 || dy !== 0) {
                    const len = Math.sqrt(dx * dx + dy * dy);
                    p.move(dx / len, dy / len);
                }

                // Check Throw Input
                const passPlays = ['PASS', 'HAIL_MARY', 'DEEP_POST', 'SCREEN', 'LATERAL', 'SLANT', 'CORNER'];
                const canThrow = passPlays.includes(this.playType);
                if (canThrow && this.ball.carrier === p && !this.ball.inAir) {
                    if (this.game.input.isPressed('Digit1') || this.game.input.isPressed('1')) this.throwBall('1');
                    if (this.game.input.isPressed('Digit2') || this.game.input.isPressed('2')) this.throwBall('2');
                    if (this.game.input.isPressed('Digit3') || this.game.input.isPressed('3')) this.throwBall('3');
                }

                return; // unique behavior for user
            }

            // 2. AI blocking / Engaging
            // LINEMEN (OL/DL/TE/LB interaction near line)
            // 2. AI blocking / Engaging
            // LINEMEN (OL/DL/TE/LB interaction near line)
            if (['OL', 'DL', 'TE', 'LB', 'FB'].includes(p.role)) {
                // CLEAR INVALID TARGETS
                if (p.blockTarget) {
                    const d = Math.hypot(p.blockTarget.x - p.x, p.blockTarget.y - p.y);
                    if (d > 50) p.blockTarget = null; // Lost contact
                }

                // DEFENSIVE FRONT LOGIC (DL/LB)
                if (p.role === 'DL' || p.role === 'LB') {
                    // Rush QB/Carrier if not blocked
                    const target = this.ball.carrier || this.ball;

                    // EDGE CONTAIN LOGIC FOR OLBs
                    if (p.role === 'LB' && p.number === 'OLB') {
                        const isTop = p.y < 300;
                        const carrierIsOutside = (isTop && target.y < p.y) || (!isTop && target.y > p.y);

                        if (carrierIsOutside) {
                            let cutoffY = (isTop) ? -1 : 1;
                            let cutoffX = (target.x - p.x) * 0.5;
                            p.move(cutoffX * 0.5, cutoffY * 1.5);
                            return;
                        }
                    }
                    this.movePlayerTowards(p, target);
                }

                // OFFENSIVE LINE / BLOCKERS LOGIC
                else if (['OL', 'FB', 'TE'].includes(p.role)) {
                    // 1. ACQUIRE TARGET IF NEEDED (OR SWITCH IF NEW THREAT IS CLOSER)
                    // If my current target is far (e.g. > 60) and there is someone VERY close (< 30), switch!
                    let currentDist = p.blockTarget ? Math.hypot(p.blockTarget.x - p.x, p.blockTarget.y - p.y) : 1000;

                    if (!p.blockTarget || currentDist > 60) {
                        let bestTarget = null;
                        let minScore = 10000;

                        this.players.forEach(opp => {
                            if (opp.team !== p.team) {
                                const dist = Math.hypot(opp.x - p.x, opp.y - p.y);

                                // Priority Score: DISTANCE IS KING
                                let score = dist;

                                // Slight bias for Front 7, but distance overrides
                                if (['DL', 'LB'].includes(opp.role)) score -= 10;

                                // Only lock onto reasonable targets
                                if (dist < 100 && score < minScore) {
                                    minScore = score;
                                    bestTarget = opp;
                                }
                            }
                        });

                        // If found a much better target, switch
                        if (bestTarget) {
                            p.blockTarget = bestTarget;
                        }
                    }

                    // 2. EXECUTE BLOCK OR MOVE
                    if (p.blockTarget) {
                        const dist = Math.hypot(p.blockTarget.x - p.x, p.blockTarget.y - p.y);

                        // ENGAGE
                        if (dist < 30) {
                            // Set PHYSICS IMPEDIMENT
                            p.blockTarget.blockedBy = p;

                            // Block Holding / Pancake Logic
                            if (Math.random() < 0.01) {
                                // WIN BLOCK (Push them back)
                                this.movePlayerTowards(p, p.blockTarget);
                            } else {
                                // STALEMATE (Hold Ground) - actively mirror them
                                // Don't just jitter, try to stay between them and the QB?
                                // For now: Jitter is fine for stalemate
                                p.move((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);
                            }
                        } else {
                            // Chase them down!
                            this.movePlayerTowards(p, p.blockTarget);
                        }
                    } else {
                        // NO TARGET - PASIVE BEHAVIOR
                        const dir = p.team === this.game.homeTeam ? 1 : -1;
                        const isPassPlay = this.playType.includes('PASS') || this.playType === 'HAIL_MARY';

                        if (isPassPlay) {
                            // PASS PRO: Only retreat if safe
                            // Scan for any threats in front
                            let threatNearby = false;
                            this.players.forEach(opp => {
                                if (opp.team !== p.team && Math.hypot(opp.x - p.x, opp.y - p.y) < 150) {
                                    threatNearby = true;
                                }
                            });

                            if (!threatNearby && (p.x - this.game.scrimmageLine) * dir > -20) {
                                p.move(dir * -0.3, 0); // Drop back into pocket
                            } else {
                                p.move(0, 0); // Hold ground, ready to block
                            }
                        } else {
                            // RUN BLOCK: Drive Forward
                            if (p.role === 'FB' || (p.role === 'TE' && !isPassPlay)) {
                                p.move(dir * 0.8, 0); // Seek LBs
                            } else {
                                p.move(dir * 0.4, 0); // OL Drive
                            }
                        }
                    }
                }
                else if (p.isBallCarrier && p.team !== this.game.userTeam) {
                    this.handleCarrierAI(p, dt);
                }
            }

            // 3. Receivers & DBs
            else if (['WR', 'RB', 'FB', 'TE'].includes(p.role)) {
                const teamWithBall = this.ball.carrier ? this.ball.carrier.team : null;
                const dir = (p.team === this.game.homeTeam) ? 1 : -1;

                if (p.team === teamWithBall) {
                    if (p.isBallCarrier) {
                        // AI Ball Carrier Logic (CPU or User Autopilot if needed)
                        if (p.team !== this.game.userTeam) {
                            // CPU Carrier Evasive Logic (already handled in section 4? No, let's keep it here for role consistency)
                            this.handleCarrierAI(p, dt);
                        }
                    } else {
                        // Route Running
                        if (!this.ball.inAir) {
                            if (p.role === 'WR') {
                                // DEFAULT
                                p.move(dir, (p.number === '1' ? 0.3 : -0.3));

                                // JET SWEEP (WR2)
                                if (this.playType === 'JET_SWEEP' && p.number === '2') {
                                    if (p.sweepState === 'CROSSING') {
                                        const qb = this.players.find(pl => pl.role === 'QB' && pl.team === p.team);
                                        const targetX = qb ? qb.x : this.game.scrimmageLine - (15 * dir);
                                        const targetY = qb ? qb.y : 300;
                                        let dx = targetX - p.x;
                                        let dy = targetY - p.y;
                                        const dist = Math.hypot(dx, dy);
                                        if (dist > 15) p.move(dx / dist, dy / dist); // Target the QB directly
                                        else p.sweepState = 'READY';
                                    } else if (p.sweepState === 'READY') {
                                        const qb = this.players.find(pl => pl.role === 'QB' && pl.team === p.team);
                                        if (qb) this.movePlayerTowards(p, qb); // Stay glued to QB until handoff
                                        else p.move(0, 0);
                                    } else if (p.sweepState === 'RUNNING') {
                                        // Sprint laterally then cut up
                                        const fieldPos = (p.x - this.game.scrimmageLine) * dir;
                                        if (fieldPos < 80) p.move(0.5 * dir, p.sweepDir); // Sweep arc
                                        else p.move(dir, 0); // Turn upfield
                                    }
                                }

                                // DEEP POST
                                if (this.playType === 'DEEP_POST') {
                                    const dist = (p.x - this.game.scrimmageLine) * dir;
                                    if (dist < 150) p.move(dir, 0);
                                    else p.move(dir, (p.y < 300 ? 0.6 : -0.6));
                                }

                                // SLANT
                                if (this.playType === 'SLANT') {
                                    const dist = (p.x - this.game.scrimmageLine) * dir;
                                    if (dist < 40) p.move(dir, 0);
                                    else p.move(dir, (p.y < 300 ? 0.8 : -0.8));
                                }

                                // CORNER
                                if (this.playType === 'CORNER') {
                                    const dist = (p.x - this.game.scrimmageLine) * dir;
                                    if (dist < 100) p.move(dir, 0);
                                    else p.move(dir, (p.y < 300 ? -0.8 : 0.8));
                                }
                            } else if (p.role === 'RB' || p.role === 'FB') {
                                // SCREEN PASS
                                if (this.playType === 'SCREEN' && p.role === 'RB') {
                                    p.move(0, (p.y < 300 ? -0.8 : 0.8));
                                } else if (this.playType === 'HB_TOSS' && p.role === 'RB') {
                                    // Run wide for toss
                                    p.move(0.2 * dir, (p.y < 300 ? -1.2 : 1.2));
                                } else {
                                    p.move(dir, 0.5);
                                }
                            } else if (p.role === 'TE') {
                                p.move(dir, -0.2);
                            }
                        }

                        // Special Play overrides
                        if (this.playType === 'HAIL_MARY' && p.role === 'WR') p.move(dir, 0);
                        if (this.playType === 'TUSH_PUSH') p.move(dir, 0);
                        if (this.playType === 'LATERAL') {
                            if (p.role === 'WR' && p.number === '1') {
                                const dist = (p.x - this.game.scrimmageLine) * dir;
                                if (dist < 100) p.move(dir, 0); else p.move(0, 0);
                            }
                            if (p.role === 'RB') {
                                const target = this.players.find(pl => pl.role === 'WR' && pl.number === '1' && pl.team === p.team);
                                if (target) {
                                    let dx = (target.x - (25 * dir)) - p.x;
                                    let dy = (target.y + 10) - p.y;
                                    const d = Math.hypot(dx, dy);
                                    if (d > 10) p.move(dx / d, dy / d);
                                }
                            }
                        }
                    }
                } else {
                    // DEFENSE: Shadow / Guard
                    this.handleDefensiveDBAI(p, dt);
                }
            }

            // 4. CPU QB SCANNING / PRESSURE
            else if (p.team !== this.game.userTeam && p.role === 'QB') {
                const dir = this.game.homeTeam === p.team ? 1 : -1;

                // QB FREEZE FOR JET SWEEP / DRAW
                if (!this.handoffComplete && ['JET_SWEEP', 'QB_DRAW', 'HB_TOSS'].includes(this.playType)) {
                    p.move(0, 0);
                    return;
                }

                const passPlays = ['PASS', 'HAIL_MARY', 'DEEP_POST', 'SCREEN', 'LATERAL', 'SLANT', 'CORNER'];
                const canThrowPlay = passPlays.includes(this.playType);
                if (p.isBallCarrier && canThrowPlay) {
                    this.qbTimer = (this.qbTimer || 0) + dt;
                    if (!this.throwTime) this.throwTime = 1.5 + Math.random() * 2.5;

                    let threatened = false;
                    this.players.forEach(opp => {
                        if (opp.team !== p.team && Math.hypot(opp.x - p.x, opp.y - p.y) < 100) threatened = true;
                    });

                    if (this.qbTimer > this.throwTime || (threatened && Math.random() < 0.02)) {
                        const wrs = this.players.filter(pl => pl.team === p.team && pl.role === 'WR');
                        if (wrs.length > 0) {
                            const target = wrs[Math.floor(Math.random() * wrs.length)];
                            if (target && target.number) this.throwBall(target.number);
                        }
                        this.qbTimer = 0;
                        this.throwTime = null;
                        return;
                    }
                }
            }
        });

        // Ball Mechanics (if in air)
        if (this.ball.inAir && this.ball.target) {
            const speed = 8;
            let dx = this.ball.target.x - this.ball.x;
            let dy = this.ball.target.y - this.ball.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 10) {
                // ARRIVED AT TARGET
                this.resolvePassOutcome(); // NEW LOGIC
            } else {
                this.ball.x += (dx / dist) * speed;
                this.ball.y += (dy / dist) * speed;
            }
        } else if (this.ball.carrier) {
            this.ball.x = this.ball.carrier.x;
            this.ball.y = this.ball.carrier.y;
        }

        // Collision/Tackle Check
        this.checkCollisions();
    }

    movePlayerTowards(player, target) {
        if (!target) return;

        // PHYSICS IMPEDIMENT CHECK
        if (player.blockedBy) {
            // 90% Speed penalty if blocked!
            // Only allow very slow movement (attempting to shed block)
            if (Math.random() > 0.05) { // 5% chance to break free immediately per frame? No, too fast.
                // Just move very slowly
                let dx = target.x - player.x;
                let dy = target.y - player.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > 0) player.move((dx / d) * 0.1, (dy / d) * 0.1); // Crawl
                return;
            }
            // Else: Break block (normal movement resumes this frame)
        }

        let dx = target.x - player.x;
        let dy = target.y - player.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > 5) player.move(dx / d, dy / d);
        else player.isMoving = false;
    }

    handleCarrierAI(p, dt) {
        const dir = (p.team === this.game.homeTeam) ? 1 : -1;
        let moveX = dir * 0.8;
        let moveY = 0;

        // Evasive logic
        let nearestThreat = null;
        let threatDist = 120;
        this.players.forEach(opp => {
            if (opp.team !== p.team) {
                const d = Math.hypot(opp.x - p.x, opp.y - p.y);
                if (d < threatDist) {
                    threatDist = d;
                    nearestThreat = opp;
                }
            }
        });

        if (nearestThreat) {
            const dy = p.y - nearestThreat.y;
            moveY = (dy > 0) ? 0.6 : -0.6;
            moveX = dir * 0.6;
        }

        // Sideline avoidance
        if (p.y < 80) moveY = 0.5;
        if (p.y > 520) moveY = -0.5;

        p.move(moveX, moveY);
    }

    handleDefensiveDBAI(p, dt) {
        if (this.ball.inAir) {
            this.movePlayerTowards(p, this.ball.target || this.ball);
            return;
        }

        // 1. Prioritize assigned Man Target
        const target = p.manTarget;

        if (target) {
            const dir = (p.team === this.game.homeTeam) ? -1 : 1;

            // "GUARD" Logic: Stay "Outside" and slightly downfield
            // Cushion based on role
            const cushion = (p.role === 'S') ? 60 : 25;
            let tx = target.x + (cushion * dir);
            let ty = target.y;

            // React to ball carrier if close
            const distToCarrier = this.ball.carrier ? Math.hypot(this.ball.carrier.x - p.x, this.ball.carrier.y - p.y) : 1000;
            if (distToCarrier < 130 && !target.isBallCarrier) {
                this.movePlayerTowards(p, this.ball.carrier);
            } else {
                this.movePlayerTowards(p, { x: tx, y: ty });
            }
        } else {
            // Fallback: Rush ball carrier/scrimmage line
            this.movePlayerTowards(p, this.ball.carrier || { x: this.game.scrimmageLine, y: p.y });
        }
    }

    resolvePassOutcome() {
        this.ball.inAir = false;
        const target = this.ball.target;

        // Find nearest defender to the target
        let nearestDef = null;
        let minDist = 1000;
        this.players.forEach(p => {
            if (p.team !== target.team) {
                const d = Math.hypot(p.x - target.x, p.y - target.y);
                if (d < minDist) {
                    minDist = d;
                    nearestDef = p;
                }
            }
        });

        // Outcome Logic
        // Outcome Logic
        // Adjusted: Tighter coverage required (20 vs 30) and much lower interception rate
        if (nearestDef && minDist < 20) {
            // COVERED
            const roll = Math.random();
            if (roll < 0.05) { 
                // INTERCEPTION (5% chance if covered)
                // Swap possession logic handled in Game.js via 'TURNOVER' or 'INTERCEPTION'
                this.ball.carrier = nearestDef;
                nearestDef.isBallCarrier = true;
                this.endPlay('INTERCEPTION');
                return;
            } else if (roll < 0.60) {
                // INCOMPLETE (55% chance if covered)
                this.endPlay('INCOMPLETE');
                return;
            }
            // Else Catch (40% chance in traffic - "Aggressive Catch")
        }

        // CATCH
        this.ball.carrier = target;
        this.game.userPlayer = target;
        target.isBallCarrier = true;
    }

    checkCollisions() {
        if (!this.ball.carrier) return;

        const carrier = this.ball.carrier;

        // Check Tackles Logic
        for (let p of this.players) {
            if (p.team !== carrier.team) { // Defense
                const dx = p.x - carrier.x;
                const dy = p.y - carrier.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < (p.radius + carrier.radius) * 0.8) {
                    // TACKLED! 

                    // FUMBLE CHECK FOR RBs (15% chance)
                    // Only if not a QB sliding or special condition
                    if (carrier.role === 'RB' && Math.random() < 0.15) {
                        this.endPlay('FUMBLE', p); // p is the tackler/forcer
                        return;
                    }

                    // Check if tackle happened in Safety Zone
                    // Driver Right (1): Safety < 50
                    // Drive Left (-1): Safety > 1024-50
                    let isSafety = false;
                    if (this.playDirection === 1 && carrier.x < 50) isSafety = true;
                    if (this.playDirection === -1 && carrier.x > 1024 - 50) isSafety = true;

                    if (isSafety) {
                        this.endPlay('SAFETY', p);
                    } else {
                        this.endPlay('TACKLE', p);
                    }
                    return;
                }
            }
        }

        // Check Touchdown (Immediate upon entry)
        if (this.playDirection === 1) {
            if (carrier.x > 1024 - 50) this.triggerTouchdown(carrier);
        } else {
            if (carrier.x < 50) this.triggerTouchdown(carrier);
        }

        // Check Out of Bounds (Y axis)
        if (carrier.y < 50 || carrier.y > 550) {
            this.endPlay('OUT_OF_BOUNDS');
        }
    }

    triggerTouchdown(carrier) {
        if (this.playState === 'ENDED') return;

        const dances = ['SPIKE', 'TWERKING', 'FLEX', 'LEAP', 'ICKY_SHUFFLE'];
        const randomDance = dances[Math.floor(Math.random() * dances.length)];
        carrier.startDance(randomDance);

        // Freeze all other players during the dance
        this.players.forEach(p => {
            if (p !== carrier) {
                p.speed = 0;
            }
        });

        this.playState = 'ENDED';

        // Wait 3 seconds for the dance animation before concluding the play
        setTimeout(() => {
            this.game.handlePlayEnd('TOUCHDOWN', this.ball.x);
        }, 3000);
    }

    throwBall(receiverNumber) {
        if (!['PASS', 'HAIL_MARY'].includes(this.playType) || this.ball.inAir) return;

        const target = this.players.find(p => p.role === 'WR' && p.number === receiverNumber);
        if (target) {
            this.ball.carrier = null; // Left QB hand
            this.ball.inAir = true;
            this.ball.target = target;
            // QB isn't carrier anymore
            const qb = this.players.find(p => p.role === 'QB');
            if (qb) qb.isBallCarrier = false;
        }
    }

    endPlay(reason, tackler = null) {
        this.playState = 'ENDED';
        this.game.handlePlayEnd(reason, this.ball.x, tackler);
    }
}
