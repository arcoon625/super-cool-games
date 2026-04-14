class InputHandler {
    constructor() {
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            KeyJ: false,
            KeyA: false
        };

        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.code)) {
                this.keys[e.code] = false;
                // Specific checks for single press actions can go here if needed
            }
        });
    }

    isDown(code) {
        return this.keys[code];
    }
}
