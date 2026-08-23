class MainMenu extends Menu {
    absorb = false;

    render() {
        this.renderTitle([
            nomangle('UNICORNS'),
            nomangle('RAINBOWS \'N'),
            nomangle('BACKFLIPS'),
        ], document.title.split(':')[1].trim());

        if (this.age > 2) {
            this.renderButton(nomangle('[SPACE] - STORY MODE'));
            this.renderButton(nomangle('[T] - TRICK ATTACK MODE'));
        }
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
