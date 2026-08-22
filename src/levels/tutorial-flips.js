class TutorialFlips extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                'A bike in unicorn land? Why?',
                '...',
                'Think you can backflip over those hills?',
            ]),
            curve: simpleBumps(),
        });

        this.world.addUnique(new Prompt(nomangle('◄ / ▶ TO FLIP WHILE AIRBORNE')));

        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('PERFORM 3 FLIPS'),
                    3,
                    () => awaitTrick(this.world, anyFlip),
                ),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
