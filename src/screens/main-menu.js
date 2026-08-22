class MainMenu extends Menu {
    absorb = false;

    render() {
        this.renderTitle([
            nomangle('UNICORNS,'),
            nomangle('RAINBOWS \'N'),
            nomangle('BACKFLIPS'),
        ], document.title.split(':')[1].trim());

        this.renderButton(nomangle('[SPACE] to start'));
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
