class MainMenu extends Menu {
    absorb = false;

    render() {
        this.renderTitle([
            'UNICORNS',
            'RAINBOWS \'N',
            'BACKFLIPS',
        ], document.title.split(':')[1].trim());

        this.renderButton('[SPACE] to start');
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (downKeys[32]) {
            G.screens = [
                new WorldScreen(ALL_LEVELS.map(levelClass => new levelClass())),
            ];
        }
    }
}
