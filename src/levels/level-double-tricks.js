class LevelDoubleTricks extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'The unicorns are getting greedy',
                'Show them a double backflip AND a double frontflip',
                'and land a monster 20x combo while you\'re out here',
            ],
            curve: new PerlinCurve({ step: 700, amplitude: 400 }),
        });

        const uc1 = this.world.add(new AudienceUnicorn());
        uc1.position.x = levelStartX + 400;
        const uc2 = this.world.add(new AudienceUnicorn());
        uc2.position.x = levelStartX + 700;

        await this.runObjectives({
            objectives: [
                new Objective('double backflip in front of unicorns'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('double') && t.label.includes('backflip') && t.inFrontOfAudience)),
                new Objective('double frontflip in front of unicorns'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('double') && t.label.includes('frontflip') && t.inFrontOfAudience)),
                new Objective('land a 20x combo'.toUpperCase(), 1, () => waitFor(this.world, () => {
                    return firstItem(this.world.category(Player))?.comboTracker.startedTricks.length >= 20;
                })),
            ],
        });
    }
}
