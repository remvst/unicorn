class PauseMenu extends Menu {
    absorb = true;

    render() {
        this.renderTitle([
            nomangle('GAME PAUSED'),
        ]);

        this.renderButton(nomangle('[ESC] - RESUME'));
        this.renderButton(nomangle('[M] - MAIN MENU'));
        this.renderVolumeButton();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27] || gamepadButtonValue(9));
        if (!pauseBefore && pauseAfter) {
            G.screens.pop();
        }

        if (downKeys[77]) {
            G.mainMenu();
        }
    }
}
