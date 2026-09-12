TITLE = nomangle('UNICORNS, RAINBOWS \'N BACKFLIPS')
SUBTITLE = nomangle('TRICK ATTACK ULTRA TURBO DELUXE EDITION');
document.title = TITLE + ': ' + SUBTITLE;

class MainMenu extends Menu {
    absorb = false;

    render() {
        this.renderTitle([
            nomangle('UNICORNS'),
            nomangle('RAINBOWS \'N'),
            nomangle('BACKFLIPS'),
        ], SUBTITLE);

        if (this.age > 2) {
            this.renderButton(nomangle('[SPACE] - STORY MODE'));
            this.renderButton(nomangle('[T] - TRICK ATTACK MODE'));
            if (WAVEDASH) {
                this.renderButton(nomangle('[L] - LEADERBOARD'));
            }
            this.renderVolumeButton();
        }
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (downKeys[32] || TOUCH_DOWN || gamepadButtonValue(0)) {
            G.screens = [new WorldScreen(withSavedProgress(allLevels()))];
        }
        if (downKeys[84]) {
            G.screens = [new WorldScreen(trickAttackMode())];
        }
        if (WAVEDASH && downKeys[76]) {
            G.screens.push(new LeaderboardMenu());
        }
    }
}
