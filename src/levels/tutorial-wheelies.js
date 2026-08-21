class TutorialWheelies extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Okay, here\'s the tricky part',
                'Balance yourself on one wheel and you\'ve got a wheelie',
                'Let\'s see 3 of those',
            ],
            curve: new PerlinCurve({ step: 2000, amplitude: 50 }),
        });
        this.world.addUnique(new Prompt('◄ TO BALANCE ON ONE WHEEL'));

        await this.runObjectives({
            objectives: [
                new Objective('perform 3 wheelies'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.toLowerCase().includes('wheelie'))),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
