class LevelFinale extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                nomangle('Well that\'s awkward'),
                nomangle('You cleared all the goals'),
                nomangle('...'),
                nomangle('Guess you can keep doing combos'),
            ]),
            curve: regularLevel(),
        });

        await this.world.addUnique(new Prompt(nomangle('THANKS FOR PLAYING'))).removeWhenAgeIs(5);
    }
}
