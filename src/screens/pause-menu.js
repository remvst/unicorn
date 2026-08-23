class PauseMenu extends Menu {
    absorb = true;

    render() {
        this.renderTitle([
            nomangle('GAME PAUSED'),
        ]);

        this.renderButton(nomangle('[ESC] - RESUME'));
        this.renderButton(nomangle('[M] - MAIN MENU'));
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27]);
        if (!pauseBefore && pauseAfter) {
            G.screens.pop();
        }

        if (downKeys[77]) {
            if (confirm(nomangle('Exit? (your progress will be lost'))) {
                G.mainMenu();
            }
        }
    }
}
