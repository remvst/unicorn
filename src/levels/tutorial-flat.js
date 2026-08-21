class TutorialFlat extends Level {
    async setup() {
        // Fairly flat curve to start with
        const { ground } = this.basics();
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 200 });

        this.world.addUnique(new Prompt('▲ TO PEDAL, ▼ TO BRAKE'));

        {
            const startX = this.basics().player?.position.x;
            await this.runObjectives({
                objectives: [
                    new Objective('Go right →', 1, () => waitFor(this.world, () => {
                        return this.basics().player?.position.x > startX + 500; // TODO fix predicate
                    })),
                ],
            });
        }

        // Backflip tutorial
        {
            await this.levelTransition({
                dialog: [
                    'Yo, you must be the guy they sent',
                    'Let\'s see if you can do a couple backflips',
                    'Use ◄ and ► to control your balance',
                ],
                curve: new PerlinCurve({ step: 500, amplitude: 200 }),
            });
            this.world.addUnique(new Prompt('◄ / ► to balance'));

            await this.runObjectives({
                objectives: [
                    new Objective('DO 3 BACKFLIPS'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('backflip'))),
                ],
            });
        }

        // Jump tutorial
        // TODO

        // First level
        {
            await this.levelTransition({
                dialog: [
                    'Alright so here\'s the deal',
                    'We don\'t have enough rainbows',
                    'Gnarly combos create rainbows',
                    'Rainbows = Happy unicorns',
                    'Happy unicorns = more magic in the world',
                    'Got it? Then go perform some combos!',
                ],
                curve: new PerlinCurve({ step: 500, amplitude: 400 }),
            });
            this.world.clearCategory(Prompt);

            await this.runObjectives({
                objectives: [
                    new Objective('BACKFLIP IN FRONT OF UNICORNS'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('backflip') && t.inFrontOfAudience)),
                    new Objective('DOUBLE BACKFLIP'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('double backflip'))),
                ],
            });
        }
        {
            await this.levelTransition({
                dialog: [],
            });
            this.world.clearCategory(Prompt);

            await this.runObjectives({
                objectives: [
                    new Objective('FRONTFLIP'.toUpperCase(), 2, () => awaitTrick(this.world, t => t.label.includes('FRONTFLIP') && t.inFrontOfAudience)),
                    // TODO find another objective
                    // new Objective('DOUBLE BACKFLIP'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('double backflip'))),
                ],
            });
        }

        // Wheelie tutorial
        {
            await this.levelTransition({
                dialog: [
                    'Let me show you a cool trick',
                    'When you balance yourself on one wheel, that\'s a wheelie',
                    'Let\'s see you do a few wheelies',
                ],
                curve: new PerlinCurve({ step: 500, amplitude: 100 }),
            });
            this.world.addUnique(new Prompt('◄ to balance on one wheel'));

            await this.runObjectives({
                objectives: [
                    new Objective('DO 3 wheelies'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('wheelie'))),
                ],
            });
        }

        // Third level
        {
            await this.levelTransition({
                dialog: [
                    'Wheelies help build combos',
                    '',
                ],
                curve: new PerlinCurve({ step: 500, amplitude: 100 }),
            });
            this.world.addUnique(new Prompt('◄ to balance on one wheel'));

            await this.runObjectives({
                objectives: [
                    // TODO wheelie + backflip combo
                    // TODO 2000 pts combo
                    new Objective('DO 3 wheelies'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('wheelie'))),
                    new Objective('LAND A 5X COMBO'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('wheelie'))), // TODO
                ],
            });
        }
    }
}
