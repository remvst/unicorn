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

        this.world.addUnique(new Prompt(nomangle('THANKS FOR PLAYING'))).removeWhenAgeIs(5);

        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('PERFORM SICK COMBOS'),
                    1,
                    () => new Promise(r => { }),
                ),
            ],
        });

        await new Promise(r => { });
    }
}
