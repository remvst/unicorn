class TutorialFlips extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                'A bike in unicorn land? Why?',
                '...',
                'Anyway, think you can backflip?',
            ]),
            curve: simpleBumps(),
        });

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
