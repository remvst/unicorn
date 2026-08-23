class TutorialFlips extends Level {
    async setup() {
        await this.runUnicornDialog(0, [
            nomangle('A bike in unicorn land? Why?'),
            '...',
            nomangle('Think you can backflip over those hills?'),
        ]);
        await this.transitionIntoCurve(simpleBumps());

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
