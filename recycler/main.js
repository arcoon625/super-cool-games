const gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('recycler-high-score')) || 0,
    isPlaying: false,
    speed: 2,
    spawnRate: 2000,
    lastSpawnTime: 0,
    items: [],
    lanes: 3,
    itemSize: 60,
    binHeight: 120
};

const TRASH_TYPES = {
    BLACK: { id: 'black', name: 'Trash', color: '#333333', items: ['🍕', '🥤', '🧶', '🧼', '🦴', '🩹', '🚬'] },
    BLUE: { id: 'blue', name: 'Recycling', color: '#3498db', items: ['📄', '📦', '🍾', '🥫', '📰', '🍶', '🧴'] },
    GREEN: { id: 'green', name: 'Organics', color: '#2ecc71', items: ['🍎', '🍌', '🥬', '🥚', '☕', '🍂', '🍞'] }
};

const elements = {
    score: document.getElementById('score'),
    highScore: document.getElementById('high-score'),
    board: document.getElementById('game-board'),
    itemsContainer: document.getElementById('items-container'),
    overlay: document.getElementById('overlay'),
    overlayTitle: document.getElementById('overlay-title'),
    overlayMessage: document.getElementById('overlay-message'),
    startBtn: document.getElementById('start-btn')
};

// Initialize
elements.highScore.textContent = gameState.highScore;

function startGame() {
    gameState.score = 0;
    gameState.speed = 2;
    gameState.spawnRate = 2000;
    gameState.items.forEach(item => item.el.remove());
    gameState.items = [];
    gameState.isPlaying = true;
    gameState.lastSpawnTime = 0;
    elements.score.textContent = '0';
    elements.overlay.classList.remove('visible');
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState.isPlaying = false;
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('recycler-high-score', gameState.highScore);
        elements.highScore.textContent = gameState.highScore;
    }
    
    elements.overlayTitle.textContent = 'GAME OVER';
    elements.overlayMessage.textContent = `You scored ${gameState.score} points! Can you do better?`;
    elements.startBtn.textContent = 'RETRY';
    elements.overlay.classList.add('visible');
}

function spawnItem() {
    const types = Object.keys(TRASH_TYPES);
    const typeKey = types[Math.floor(Math.random() * types.length)];
    const type = TRASH_TYPES[typeKey];
    const itemChar = type.items[Math.floor(Math.random() * type.items.length)];
    
    const lane = Math.floor(Math.random() * gameState.lanes);
    const laneWidth = elements.board.clientWidth / gameState.lanes;
    
    const el = document.createElement('div');
    el.className = 'trash-item';
    el.textContent = itemChar;
    el.style.left = `${lane * laneWidth + (laneWidth - gameState.itemSize) / 2}px`;
    el.style.top = `-${gameState.itemSize}px`;
    
    elements.itemsContainer.appendChild(el);
    
    const item = {
        el,
        type: typeKey,
        lane,
        y: -gameState.itemSize,
        isDragging: false
    };
    
    setupDragEvents(item);
    gameState.items.push(item);
}

function setupDragEvents(item) {
    let startX = 0;
    let initialLeft = 0;
    const laneWidth = elements.board.clientWidth / gameState.lanes;

    const onStart = (e) => {
        if (!gameState.isPlaying) return;
        item.isDragging = true;
        const event = e.type === 'touchstart' ? e.touches[0] : e;
        startX = event.clientX;
        initialLeft = parseFloat(item.el.style.left);
        item.el.style.cursor = 'grabbing';
    };

    const onMove = (e) => {
        if (!item.isDragging) return;
        const event = e.type === 'touchmove' ? e.touches[0] : e;
        const dx = event.clientX - startX;
        let newLeft = initialLeft + dx;
        
        // Boundaries
        newLeft = Math.max(0, Math.min(elements.board.clientWidth - gameState.itemSize, newLeft));
        item.el.style.left = `${newLeft}px`;
        
        // Update lane based on center position
        const centerX = newLeft + gameState.itemSize / 2;
        item.lane = Math.floor(centerX / laneWidth);
    };

    const onEnd = () => {
        if (!item.isDragging) return;
        item.isDragging = false;
        item.el.style.cursor = 'grab';
        
        // Snap to lane
        const targetLeft = item.lane * laneWidth + (laneWidth - gameState.itemSize) / 2;
        item.el.style.left = `${targetLeft}px`;
    };

    item.el.addEventListener('mousedown', onStart);
    item.el.addEventListener('touchstart', onStart, { passive: true });
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);
}

function updateScore(points) {
    gameState.score += points;
    elements.score.textContent = gameState.score;
    
    // Scale difficulty
    gameState.speed = 2 + (gameState.score / 50);
    gameState.spawnRate = Math.max(800, 2000 - (gameState.score * 10));

    // Visual feedback
    const feedback = document.createElement('div');
    feedback.className = 'plus-five';
    feedback.textContent = `+${points}`;
    feedback.style.left = '50%';
    feedback.style.top = '10%';
    document.getElementById('game-container').appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
}

function gameLoop(time) {
    if (!gameState.isPlaying) return;

    // Spawning
    if (time - gameState.lastSpawnTime > gameState.spawnRate) {
        spawnItem();
        gameState.lastSpawnTime = time;
    }

    // Movement & Collision
    const boardHeight = elements.board.clientHeight;
    const laneWidth = elements.board.clientWidth / gameState.lanes;
    
    for (let i = gameState.items.length - 1; i >= 0; i--) {
        const item = gameState.items[i];
        
        if (!item.isDragging) {
            item.y += gameState.speed;
            item.el.style.top = `${item.y}px`;
        }

        // Collision with bin area
        if (item.y + gameState.itemSize > boardHeight - gameState.binHeight) {
            // Check if correct bin
            // Lane mapping: 0=Black, 1=Blue, 2=Green
            const correctLane = item.type === 'BLACK' ? 0 : (item.type === 'BLUE' ? 1 : 2);
            
            if (item.lane === correctLane) {
                updateScore(5);
                item.el.remove();
                gameState.items.splice(i, 1);
            } else {
                // Wrong bin!
                const binEl = document.querySelectorAll('.bin')[item.lane];
                binEl.classList.add('wrong-bin');
                setTimeout(() => binEl.classList.remove('wrong-bin'), 500);
                gameOver();
                return;
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

elements.startBtn.addEventListener('click', startGame);

// Handle window resize
window.addEventListener('resize', () => {
    if (!gameState.isPlaying) return;
    const laneWidth = elements.board.clientWidth / gameState.lanes;
    gameState.items.forEach(item => {
        const targetLeft = item.lane * laneWidth + (laneWidth - gameState.itemSize) / 2;
        item.el.style.left = `${targetLeft}px`;
    });
});
