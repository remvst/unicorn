class PauseMenu extends Menu {
    absorb = true;

    render() {
        this.renderTitle([
            'GAME PAUSED',
        ]);

        this.renderButton('[ESC] to resume');
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27]);
        if (!pauseBefore && pauseAfter) {
            G.screens.pop();
        }
    }
}
