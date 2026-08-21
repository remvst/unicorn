class TutorialJumps extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Okay okay, now here\'s a rough one',
                'These hills are gnarly, hold ▲ and let go to jump further',
                'Catch some air, 3 times',
            ],
            curve: new PerlinCurve({ step: 500, amplitude: 400 }),
        });
        this.world.addUnique(new Prompt('HOLD ▲, RELEASE TO JUMP'));

        await this.runObjectives({
            objectives: [
                new Objective('perform 3 jumps'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('Jump'))),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
