class MainMenu extends Menu {
    absorb = false;

    render() {
        this.renderTitle([
            nomangle('UNICORNS'),
            nomangle('RAINBOWS \'N'),
            nomangle('BACKFLIPS'),
        ], document.title.split(':')[1].trim());

        this.renderButton(nomangle('[SPACE] - STORY MODE'));
        if (G?.bestCombo) this.renderButton(nomangle('[T] - TRICK ATTACK MODE'));
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (downKeys[32] || TOUCH_DOWN) {
            G.screens = [new WorldScreen(allLevels)];
        }
        if (downKeys[84]) {
            G.screens = [new WorldScreen(trickAttackMode)];
        }
    }
}
