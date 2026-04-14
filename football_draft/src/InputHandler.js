class InputHandler {
    constructor() {
        this.keys = {};
        this.downKeys = {}; // Keys that were just pressed this frame

        window.addEventListener('keydown', (e) => {
            // Prevent default scrolling for arrows and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
                e.preventDefault();
            }
            this.keys[e.code] = true;
            this.keys[e.key] = true;
            this.downKeys[e.code] = true;
            this.downKeys[e.key] = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keys[e.key] = false;
            delete this.downKeys[e.code];
            delete this.downKeys[e.key];
        });
    }

    isDown(key) {
        return !!this.keys[key];
    }

    isPressed(key) {
        // Returns true only on the frame it was pressed
        const pressed = !!this.downKeys[key];
        return pressed;
    }

    clearPressed() {
        this.downKeys = {};
    }
}
