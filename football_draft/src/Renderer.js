class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.addEventListener('click', () => {
            window.focus();
            console.log("Canvas clicked, window focused");
        });
        this.ctx = this.canvas.getContext('2d');

        // Camera / Perspective State
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1.2,
            targetRotation: 0, // Current rotation (radian)
            isVertical: true   // Behind the QB mode
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Keep internal resolution fixed, scale with CSS
        this.canvas.width = FIELD.WIDTH;
        this.canvas.height = FIELD.HEIGHT;
    }

    clear() {
        this.ctx.fillStyle = '#388e3c'; // Field Green
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    applyCameraTransform(targetX, targetY, playDirection) {
        this.ctx.save();

        // Center of screen
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        this.ctx.translate(centerX, centerY);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        if (this.camera.isVertical) {
            // Behind the QB: Downfield is UP
            // If playDirection is 1 (Positive X), rotation is -90 deg
            // If playDirection is -1 (Negative X), rotation is +90 deg
            const rotation = (playDirection === 1) ? -Math.PI / 2 : Math.PI / 2;
            this.ctx.rotate(rotation);

            // Adjust camera position relative to target
            this.ctx.translate(-targetX, -targetY);
        } else {
            this.ctx.translate(-targetX, -targetY);
        }
    }

    resetCameraTransform() {
        this.ctx.restore();
    }

    drawField(firstDownLineX) {
        this.ctx.save();

        // Draw Endzone Grass (Darker)
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.fillRect(0, 0, 80, FIELD.HEIGHT); // Left Endzone
        this.ctx.fillRect(FIELD.WIDTH - 80, 0, 80, FIELD.HEIGHT); // Right Endzone

        // Draw Yard Lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        const startX = 80;
        const endX = FIELD.WIDTH - 80;
        const fieldWidth = endX - startX;

        for (let i = 0; i <= 10; i++) {
            const x = startX + (fieldWidth / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, FIELD.HEIGHT);
            this.ctx.stroke();

            // Yard Numbers
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            if (i > 0 && i < 10) {
                let yard = i <= 5 ? i * 10 : (10 - i) * 10;
                // Rotate numbers so they are readable in vertical view
                this.ctx.translate(x, 60);
                this.ctx.rotate(Math.PI / 2);
                this.ctx.fillText(yard, 0, 0);

                this.ctx.restore();
                this.ctx.save();
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.translate(x, FIELD.HEIGHT - 60);
                this.ctx.rotate(Math.PI / 2);
                this.ctx.fillText(yard, 0, 0);
            }
            this.ctx.restore();
        }

        // Draw First Down Line (Yellow)
        if (firstDownLineX) {
            this.ctx.beginPath();
            this.ctx.moveTo(firstDownLineX, 0);
            this.ctx.lineTo(firstDownLineX, FIELD.HEIGHT);
            this.ctx.strokeStyle = '#ffff00'; // Yellow
            this.ctx.lineWidth = 5;
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    getDanceOffsets(player) {
        if (!player || player.state !== 'DANCING') return { x: 0, y: 0, r: 0, ballY: 0, angle: 0 };
        const t = player.danceTimer;
        let dx = 0, dy = 0, dr = 0, ballY = 0, dAngle = 0;
        switch (player.danceType) {
            case 'SPIKE':
                // Rapid arm movement simulation
                if ((t * 4) % 1 < 0.3) ballY = 15;
                break;
            case 'TWERKING':
                // Oscillating movement
                dx = Math.sin(t * 20) * 4;
                dy = Math.cos(t * 15) * 3;
                dAngle = Math.sin(t * 10) * 0.2;
                break;
            case 'FLEX':
                // Pulse size
                dr = Math.sin(t * 12) * 5;
                break;
            case 'LEAP':
                // Jump animation
                dy = -Math.abs(Math.sin(t * 5) * 40);
                break;
            case 'ICKY_SHUFFLE':
                // Side-to-side rhythmic shuffles
                dx = Math.sin(t * 10) * 10;
                dAngle = Math.sin(t * 20) * 0.3;
                break;
        }
        return { x: dx, y: dy, r: dr, ballY: ballY, angle: dAngle };
    }

    drawPlayer(player) {
        if (!player) return;
        const offsets = this.getDanceOffsets(player);
        const px = (Number.isFinite(player.x) ? player.x : 0) + offsets.x;
        const py = (Number.isFinite(player.y) ? player.y : 0) + offsets.y;
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;

        const radius = player.radius + offsets.r;

        // Running bob animation
        let bobY = 0;
        if (player.isMoving) {
            bobY = Math.sin(player.animTimer * 15) * 3;
        }

        const size = Math.floor(radius * 4.5);

        // Animation calculations
        const swing = Math.sin(player.animTimer * 12);
        const cycle = Math.cos(player.animTimer * 12);
        const moving = player.isMoving || player.state === 'DANCING';

        // 1. Draw Shadow
        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.beginPath();
        this.ctx.ellipse(0, radius * 0.5, radius * 1.2, radius * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0,0,0,0.25)';
        this.ctx.fill();
        this.ctx.restore();

        // 2. Draw Humanoid Shape with Rotation
        this.ctx.save();
        this.ctx.translate(px, py + bobY);
        this.ctx.rotate(player.angle + offsets.angle + Math.PI / 2);

        const teamColor = (player.team && player.team.color) ? player.team.color : '#fff';
        const secColor = (player.team && player.team.secondaryColor) ? player.team.secondaryColor : '#444';

        // --- LIMBS ---
        if (moving) {
            this.ctx.fillStyle = teamColor;
            this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            this.ctx.lineWidth = 1;

            // Legs (Cycling)
            const legDist = radius * 0.5;
            const legSwing = cycle * radius * 0.6;

            // Left Leg
            this.ctx.beginPath();
            this.ctx.ellipse(-legDist, legSwing, radius * 0.4, radius * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Right Leg
            this.ctx.beginPath();
            this.ctx.ellipse(legDist, -legSwing, radius * 0.4, radius * 0.6, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Arms (Swinging)
            const armDist = radius * 1.2;
            const armSwing = swing * radius * 0.8;

            // Left Arm
            this.ctx.beginPath();
            this.ctx.ellipse(-armDist, -armSwing, radius * 0.3, radius * 0.5, 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();

            // Right Arm
            this.ctx.beginPath();
            this.ctx.ellipse(armDist, armSwing, radius * 0.3, radius * 0.5, -0.4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        // --- BODY ---
        // Shoulders / Shoulder Pads
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, radius * 1.4, radius * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = teamColor;
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        this.ctx.stroke();

        // Helmet
        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.1, radius * 0.7, 0, Math.PI * 2);
        this.ctx.fillStyle = secColor;
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();

        // Facemask detail
        this.ctx.beginPath();
        this.ctx.arc(0, -radius * 0.3, radius * 0.5, 0.2, Math.PI - 0.2);
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();

        // 3. Draw UI elements (Number, Carrier Glow)
        this.ctx.save();
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = 'black';

        let label = player.number || player.role;
        this.ctx.fillText(label, px, py - radius - 5);

        if (player.isBallCarrier) {
            this.ctx.beginPath();
            this.ctx.arc(px, py + bobY, radius + 2, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    drawBall(x, y, carrier) {
        let bx = x;
        let by = y;

        if (carrier && carrier.state === 'DANCING') {
            const offsets = this.getDanceOffsets(carrier);
            bx += offsets.x;
            by += offsets.y + offsets.ballY;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(bx, by, 6, 10, Math.PI / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#5d4037'; // Brown
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(bx - 4, by);
        this.ctx.lineTo(bx + 4, by);
        this.ctx.stroke();
        this.ctx.restore();
    }
}
