class Game {
    constructor() {
        if (DEBUG) {
            this.lastFrameIndex = 0;
            this.frameTimes = Array(60).fill(0);
        }

        this.mainMenu();

        if (ICON_MODE) {
            this.screens = [new WorldScreen(() => [new IconLevel()])];
        }

        this.frame();
    }

    mainMenu() {
        this.screens = [
            new WorldScreen(() => [new IntroLevel()]),
            new MainMenu(),
        ];
    }

    get bestCombo() {
        return parseInt(localStorage["bc"]) || 0;
    }

    set bestCombo(x) {
        localStorage["bc"] = x;
    }

    frame() {
        const now = performance.now();
        const elapsed = min((now - (this.lastFrame || 0)) / 1000, 1 / 30);
        this.lastFrame = now;

        if (!DEBUG || document.hasFocus() || ICON_MODE) {
            // Slomo/fast forward
            if (DEBUG) {
                if (downKeys[71]) elapsed *= 0.1;
                if (downKeys[70]) elapsed *= 4;
            }

            let i = this.screens.length;
            while (this.screens[--i]) {
                const screen = this.screens[i];
                screen.cycle(elapsed);
                if (screen.absorb) break;
            }

            for (const screen of this.screens) {
                ctx.wrap(() => screen.render());
            }

            if (DEBUG && DEBUG_INFO) ctx.wrap(() => {
                this.frameTimes[this.lastFrameIndex] = now;
                const nextIndex = (this.lastFrameIndex + 1) % this.frameTimes.length;
                const fps = (this.frameTimes.length - 1) / ((now - this.frameTimes[nextIndex]) / 1000);
                this.lastFrameIndex = nextIndex;

                ctx.translate(10, 10);
                ctx.font = '20px Courier';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.shadowColor = '#000';
                ctx.shadowOffsetY = 2;

                const debugValues = [
                    nomangle(`FPS: `) + fps.toFixed(1),
                ]

                for (const screen of this.screens) {
                    debugValues.push(...screen.debugValues());
                }

                for (const value of debugValues) {
                    ctx.fillText(value, 0, 0);
                    ctx.translate(0, 20);
                }
            });
        }

        if (ICON_MODE) return;
        requestAnimationFrame(() => this.frame());
    }
}
