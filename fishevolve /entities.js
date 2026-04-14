const assetCache = {};
function loadAsset(name) {
    if (!assetCache[name]) {
        const img = new Image();
        img.src = `assets/${name}.png`;
        assetCache[name] = img;
    }
    return assetCache[name];
}

// Preload known assets
['sardine', 'salmon', 'bass', 'makoshark', 'greatwhite', 'mososaurus', 'megalodon', 'planeteater', 'starfish', 'shrimp'].forEach(loadAsset); // Add others as they are generated

class Entity {
    constructor(x, y, radius, color, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.type = type; // 'player', 'starfish', 'shrimp', 'enemy'
        this.markedForDeletion = false;
        this.vx = 0;
        this.vy = 0;
        this.angle = 0; // For facing direction
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Update angle based on velocity
        if (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1) {
            this.angle = Math.atan2(this.vy, this.vx);
        }
    }

    draw(ctx, viewport) {
        // Default draw if no specific override
        ctx.beginPath();
        ctx.arc(this.x - viewport.x, this.y - viewport.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

class Food extends Entity {
    constructor(x, y, type) {
        let radius = 5;
        let color = '#ffcc00';
        let xpValue = 1;

        if (type === 'starfish') {
            radius = 8;
            color = '#ff6f61'; /* coral */
            xpValue = 10;
        } else if (type === 'shrimp') {
            radius = 6;
            color = '#ffb7b2';
            xpValue = 4;
        } else if (type === 'scraps') {
            radius = 4;
            color = '#a9a9a9';
            xpValue = 2;
        }

        super(x, y, radius, color, type);
        this.xpValue = xpValue;

        // Slight drift
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.wobble = Math.random() * Math.PI * 2;
    }

    update(dt) {
        super.update(dt);
        this.wobble += dt * 2;
    }

    draw(ctx, viewport) {
        const cx = this.x - viewport.x;
        const cy = this.y - viewport.y;

        if (this.type === 'starfish') {
            const spikes = 5;
            const outerRadius = this.radius;
            const innerRadius = this.radius / 2.5;

            let rot = this.wobble; // Rotate slowly
            let x = cx;
            let y = cy;
            let step = Math.PI / spikes;

            ctx.beginPath();
            ctx.moveTo(cx, cy - outerRadius); // Start top
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                ctx.lineTo(x, y);
                rot += step;

                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                ctx.lineTo(x, y);
                rot += step;
            }
            ctx.fillStyle = this.color;
            ctx.fill();

            // Detail
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(cx, cy, innerRadius / 2, 0, Math.PI * 2);
            ctx.fill();

        } else if (this.type === 'shrimp') {
            // Draw Shrimp (curved shape)
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.angle + Math.sin(this.wobble) * 0.2);

            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius / 2, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Tail
            ctx.beginPath();
            ctx.moveTo(-this.radius, 0);
            ctx.lineTo(-this.radius - 5, -3);
            ctx.lineTo(-this.radius - 5, 3);
            ctx.fillStyle = this.color;
            ctx.fill();

            ctx.restore();
        } else {
            // Scraps (irregular)
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(this.wobble);
            ctx.beginPath();
            ctx.moveTo(-this.radius, -this.radius);
            ctx.lineTo(this.radius, -this.radius / 2);
            ctx.lineTo(0, this.radius);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.restore();
        }
    }
}

class FishEntity extends Entity {
    constructor(x, y, type, radius, speed, color) {
        super(x, y, radius, color, type);
        this.speed = speed;
        this.tailAngle = 0;
    }

    update(dt) {
        super.update(dt);
        // Tail animation based on speed
        const speedFactor = Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 100;
        this.tailAngle += dt * 10 * Math.max(0.5, speedFactor);
    }

    draw(ctx, viewport) {
        const cx = this.x - viewport.x;
        const cy = this.y - viewport.y;

        ctx.save();
        ctx.translate(cx, cy);

        // Orient fish
        ctx.rotate(this.angle);

        // Check for Image Asset
        const img = assetCache[this.type];
        if (img && img.complete && img.naturalWidth !== 0) {
            // Draw Image with Swim Animation
            const w = this.radius * 4;
            const h = w * (img.height / img.width);

            // Swim parameters
            const swimSpeed = 5;
            const swimAmplitude = 2; // Reduced from 5 to 2 to fix 'wiggly wobbly'
            const time = Date.now() / 300; // Slower time base

            // Depending on speed, wiggle faster?
            const speedFactor = Math.sqrt(this.vx * this.vx + this.vy * this.vy) / 100;
            const dynamicAmp = swimAmplitude * Math.min(1.2, Math.max(0.1, speedFactor));

            // If |angle| > PI/2, flip vertically
            const isFlipped = Math.abs(this.angle) > Math.PI / 2;
            if (isFlipped) {
                ctx.scale(1, -1);
            }

            // Strip rendering for deformation
            const numStrips = 10;
            const stripWidth = w / numStrips;
            const imgStripWidth = img.width / numStrips;

            for (let i = 0; i < numStrips; i++) {
                // Calculate offset for wave
                // Tail is at left (negative x) normally? 
                // Image is usually facing Right. So Head is Right (i=last), Tail is Left (i=0)?
                // Actually usually draw -w/2 to w/2.
                // Let's assume Head is at Right (positive X relative to center)
                // So Right side (high i) moves less, Left side (low i) moves more (Tail wag)

                // i goes 0..numStrips. 0 is Left (Tail), num is Right (Head)
                // We want tail to wag more.
                const wagAmount = (numStrips - i) / numStrips; // 1.0 at tail, 0.0 at head

                const offset = Math.sin(time + i * 0.5) * dynamicAmp * wagAmount;

                // Source
                const sx = i * imgStripWidth;
                const sy = 0;
                const sw = imgStripWidth;
                const sh = img.height;

                // Dest
                const dx = -w / 2 + i * stripWidth;
                const dy = -h / 2 + offset;
                const dw = stripWidth + 1; // +1 to fix gaps
                const dh = h;

                ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            }

            ctx.restore();
            return;
        }

        // --- FALLBACK TO PROCEDURAL DRAWING ---
        const length = this.radius * 1.5;
        const width = this.radius;

        ctx.fillStyle = this.color;

        // -- Draw Body Shape --
        ctx.beginPath();
        if (this.type === 'mososaurus') {
            // MOSASAURUS: Long rigid body, crocodile head, big paddle fins
            const headLen = length * 0.8;

            // Body
            ctx.ellipse(-length * 0.2, 0, length * 0.8, width * 0.7, 0, 0, Math.PI * 2);

            // Head (Long snout)
            ctx.moveTo(length * 0.5, -width * 0.4);
            ctx.lineTo(length + headLen, -width * 0.2); // Snout tip top
            ctx.lineTo(length + headLen, width * 0.2);  // Snout tip bottom
            ctx.lineTo(length * 0.5, width * 0.4);

            // Tail (Thick)
            ctx.moveTo(-length, 0);
            ctx.lineTo(-length * 1.8, -width * 0.3);
            ctx.lineTo(-length * 1.8, width * 0.3);
            ctx.lineTo(-length, 0);
        } else if (this.type.includes('shark') || this.type === 'greatwhite' || this.type === 'megalodon' || this.type === 'mako') {
            // SHARK: Torpedo shape, pointed nose
            ctx.moveTo(length, 0); // Nose
            ctx.quadraticCurveTo(0, -width, -length, 0); // Top
            ctx.quadraticCurveTo(0, width, length, 0); // Bottom
        } else {
            // GENERIC FISH
            ctx.ellipse(0, 0, length, width * 0.6, 0, 0, Math.PI * 2);
        }
        ctx.fill();

        // -- Draw Teeth (Sharks & Mosa) --
        if (['mako', 'greatwhite', 'megalodon', 'mososaurus', 'planeteater'].includes(this.type) || this.type.includes('shark')) {
            ctx.fillStyle = 'white';
            ctx.beginPath();

            if (this.type === 'mososaurus') {
                // Teeth along the snout
                const startX = length * 0.5;
                const endX = length + length * 0.6; // Snout length
                const toothSize = this.radius * 0.15;
                for (let tx = startX; tx < endX; tx += toothSize * 1.5) {
                    ctx.moveTo(tx, width * 0.2);
                    ctx.lineTo(tx + toothSize / 2, width * 0.2 + toothSize); // Down
                    ctx.lineTo(tx + toothSize, width * 0.2);

                    ctx.moveTo(tx, -width * 0.2);
                    ctx.lineTo(tx + toothSize / 2, -width * 0.2 - toothSize); // Up
                    ctx.lineTo(tx + toothSize, -width * 0.2);
                }
            } else {
                // Shark teeth (Mouth area)
                const mouthX = length * 0.5;
                const mouthY = width * 0.3;
                const toothSize = this.radius * 0.15;
                // Bottom jaw teeth
                for (let i = 0; i < 3; i++) {
                    ctx.moveTo(mouthX + i * toothSize, mouthY);
                    ctx.lineTo(mouthX + i * toothSize + toothSize / 2, mouthY - toothSize); // Upward point
                    ctx.lineTo(mouthX + i * toothSize + toothSize, mouthY);
                }
            }
            ctx.fill();
            // Revert color for fins
            ctx.fillStyle = this.color;
        }

        // -- Eyes --
        const eyeX = (this.type === 'mososaurus') ? length * 0.4 : length * 0.6;
        const eyeY = (this.type === 'mososaurus') ? -width * 0.3 : -width * 0.2;
        const eyeSize = this.radius * 0.15;

        ctx.beginPath();
        ctx.arc(eyeX, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + eyeSize * 0.3, eyeY, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'black';
        ctx.fill();

        // -- Fins / Tail --
        ctx.fillStyle = this.color;

        if (this.type === 'mososaurus') {
            // Paddles
            ctx.save();
            ctx.translate(length * 0.2, width * 0.5);
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.ellipse(0, 0, length * 0.4, width * 0.15, 0, 0, Math.PI * 2); // Front Flipper
            ctx.fill();
            ctx.restore();

            ctx.save();
            ctx.translate(-length * 0.5, width * 0.4);
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.ellipse(0, 0, length * 0.3, width * 0.15, 0, 0, Math.PI * 2); // Back Flipper
            ctx.fill();
            ctx.restore();
        } else {
            // Standard Tail Wag
            const tailWag = Math.sin(this.tailAngle) * 0.2;
            ctx.save();
            ctx.translate(-length * 0.8, 0);
            ctx.rotate(tailWag);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-length * 0.6, -width * 0.6);
            ctx.lineTo(-length * 0.6, width * 0.6);
            ctx.fill();
            ctx.restore();

            // Dorsal Fin for Sharks
            if (this.type.includes('shark') || this.type === 'greatwhite' || this.type === 'megalodon') {
                ctx.beginPath();
                ctx.moveTo(0, -width * 0.5);
                ctx.lineTo(-length * 0.3, -width * 1.5); // High fin
                ctx.lineTo(length * 0.2, -width * 0.5);
                ctx.fill();
            }
            // Side Fin
            ctx.beginPath();
            ctx.moveTo(length * 0.2, width * 0.3);
            ctx.lineTo(-length * 0.2, width * 0.9);
            ctx.lineTo(0, width * 0.3);
            ctx.fillStyle = this.makeDarker(this.color);
            ctx.fill();
        }

        ctx.restore();

        // Debug Label (keep only for very big things or debugging)
        if (this.radius > 50) {
            // Optional: Name tag
        }
    }

    makeDarker(hex) {
        // Simple helper to darken color for fins
        // Assuming hex is #RRGGBB
        return hex; // TODO: Implement hex manipulation if needed, or just use same color
    }
}

class Enemy extends FishEntity {
    constructor(x, y, type, radius, speed) {
        let color = '#ff0000';
        if (type === 'salmon') color = '#fa8072';
        if (type === 'bass') color = '#556b2f';
        if (type === 'mako') color = '#1e90ff';
        if (type === 'greatwhite') color = '#708090'; // SlateGray
        if (type === 'mososaurus') color = '#2f4f4f';
        if (type === 'megalodon') color = '#8b0000';

        super(x, y, type, radius, speed, color);

        // Initialize movement logic
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
    }

    update(dt, player) {
        // Basic movement

        // Optional: Avoid walls or turn around logic could go here

        super.update(dt);
    }
}

class Player extends FishEntity {
    constructor() {
        super(0, 0, 'sardine', 10, 150, '#4dcfff');
        this.score = 0; // Mass
        this.evolutionStage = 0;
        this.evolutionData = [
            { name: 'Sardine', mass: 10, color: '#a8d8e6', radius: 10, diet: ['starfish', 'scraps', 'shrimp'] },
            { name: 'Salmon', mass: 100, color: '#fa8072', radius: 20, diet: ['sardine', 'shrimp'] },
            { name: 'Bass', mass: 500, color: '#556b2f', radius: 35, diet: ['salmon', 'sardine'] },
            { name: 'Mako Shark', mass: 1500, color: '#1e90ff', radius: 60, diet: ['bass', 'salmon'] },
            { name: 'Great White', mass: 4000, color: '#708090', radius: 100, diet: ['mako', 'bass'] },
            { name: 'Mosasaurus', mass: 10000, color: '#2f4f4f', radius: 180, diet: ['greatwhite', 'mako'] },
            { name: 'Megalodon', mass: 25000, color: '#8b0000', radius: 300, diet: ['mososaurus', 'greatwhite'] },
            { name: 'Planet Eater', mass: 999999, color: '#222222', radius: 600, diet: ['megalodon', 'mososaurus'] } // Final form
        ];
        this.applyStats();
    }

    applyStats() {
        const data = this.evolutionData[this.evolutionStage];
        this.radius = data.radius;
        this.color = data.color;
        this.type = data.name.toLowerCase().replace(' ', '');
        // Keep speed manual or increase?
        this.speed = 150 + (this.evolutionStage * 20);
    }

    update(dt, input) {
        // Move towards mouse
        const dx = input.mouseX - (window.innerWidth / 2); // Relative to center of screen
        const dy = input.mouseY - (window.innerHeight / 2);

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }

        super.update(dt);

        // Check evolution
        this.checkEvolution();
    }

    checkEvolution() {
        const nextStage = this.evolutionData[this.evolutionStage + 1];
        if (nextStage && this.score >= this.evolutionData[this.evolutionStage].mass) {
            this.evolutionStage++;
            this.applyStats();

            // Notify UI
            const evt = new CustomEvent('evolution', { detail: this.evolutionData[this.evolutionStage] });
            window.dispatchEvent(evt);
            return true;
        }
        return false;
    }

    // Legacy evolve method - merged into applyStats/checkEvolution
    evolve(data) { }

    canEat(entity) {
        // can always eat same type
        if (entity.type === this.type) return true;

        // Planet eater eats everything
        if (this.evolutionStage >= 7) return true;

        // Food items (lower food chain) are always edible
        const foodTypes = ['starfish', 'scraps', 'shrimp'];
        if (foodTypes.includes(entity.type)) return true;

        // Check Evolution Hierarchy
        // Find the stage index of the target
        let targetStage = -1;
        for (let i = 0; i < this.evolutionData.length; i++) {
            const data = this.evolutionData[i];
            const typeName = data.name.toLowerCase().replace(' ', '');
            // Handle edge case if names don't match exactly (e.g. 'makoshark' vs 'Mako Shark')
            // My applyStats does: .toLowerCase().replace(' ', '')
            if (typeName === entity.type) {
                targetStage = i;
                break;
            }
        }

        // If generic enemy/not found? Assume edible if smaller? 
        // But for now, if it IS in the chain:
        if (targetStage !== -1) {
            // "Eat anything lower than you" (and also equal to you, per previous rules)
            return targetStage < this.evolutionStage;
        }

        // Default to radius check if not in hierarchy?
        // simple rule: can eat if radius is smaller or equal
        return entity.radius <= this.radius;
    }
}
