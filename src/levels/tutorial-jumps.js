class TutorialJumps extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'You can also jump to get a bit of extra air',
                'Hold [SPACE], then release to jump',
            ],
            curve: new PerlinCurve({ step: 500, amplitude: 200 }),
        });
        this.world.addUnique(new Prompt('HOLD [SPACE], RELEASE TO JUMP'));

        await this.runObjectives({
            objectives: [
                new Objective('perform 3 jumps'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('Jump'))),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
