class PauseMenu extends Menu {
    absorb = true;

    render() {
        this.renderTitle([
            nomangle('GAME PAUSED'),
        ]);

        this.renderButton(nomangle('[ESC] to resume'));
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27]);
        if (!pauseBefore && pauseAfter) {
            G.screens.pop();
        }
    }
}
