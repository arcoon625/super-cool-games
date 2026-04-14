class Team {
    constructor(name, color, secondaryColor, rating, roster = {}) {
        this.name = name;
        this.color = color;
        this.secondaryColor = secondaryColor;
        this.rating = rating;
        this.roster = roster;
        this.score = 0;
    }
}

class Player {
    constructor(x, y, team, role, number) {
        this.x = Number.isFinite(x) ? x : 0; // Safeguard
        this.y = Number.isFinite(y) ? y : 0; // Safeguard
        this.team = team; // Team object
        this.role = role; // 'QB', 'RB', 'WR', 'DEF'
        this.number = number;
        this.radius = 12;

        let rating = 70;
        if (team && typeof team.rating === 'number') rating = team.rating;
        this.speed = 3.5 + (rating / 50); // Slower base speed (was 4) for more realism
        if (role === 'DEF' || role === 'CB' || role === 'S' || role === 'LB') {
            this.speed *= 1.05; // Defense 5% faster to close gaps
        }

        this.isBallCarrier = false;
        this.state = 'NORMAL'; // 'NORMAL' or 'DANCING'
        this.danceType = null;
        this.danceTimer = 0;

        // Visual properties
        const dir = (team && team.side === 'home') ? 1 : -1; // Default facing
        this.angle = (role === 'OL' || role === 'QB' || role === 'RB' || role === 'WR') ? (dir === 1 ? 0 : Math.PI) : (dir === 1 ? Math.PI : 0);
        this.animTimer = 0;
        this.isMoving = false;
    }

    startDance(type) {
        this.state = 'DANCING';
        this.danceType = type;
        this.danceTimer = 0;
    }

    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        if (dx !== 0 || dy !== 0) {
            this.angle = Math.atan2(dy, dx);
            this.isMoving = true;
        }

        // Boundary checks (roughly field size)
        if (this.y < 50) this.y = 50;
        if (this.y > 550) this.y = 550;
        if (this.x < 0) this.x = 0;
        if (this.x > 1024) this.x = 1024;
    }

    resetMovementState() {
        this.isMoving = false;
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
}
