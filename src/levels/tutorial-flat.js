class TutorialFlat extends Level {
    async setup() {
        // Fairly flat curve to start with
        const { ground } = this.basics();
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 200 });

        this.world.addUnique(new Prompt('HOLD ▲ TO PEDAL'));

        {
            const levelStartX = await this.levelTransition({
                dialog: [
                    'A bike in unicorn land? That makes no sense!',
                    'Anyway, press [UP] to get the hell out of here',
                ],
            });

            await this.runObjectives({
                objectives: [
                    new Objective('Go right →', 1, () => waitFor(this.world, () => {
                        return this.basics().player?.position.x > levelStartX + 500; // TODO fix predicate
                    })),
                ]
            });
        }

        {
            await this.levelTransition({
                dialog: [
                    'Wow, you\'re really good at it!',
                    '(in case you couldn\'t tell, that was sarcasm)',
                    'Anyway do you think you can backflip over those hills?',
                ],
                newCurve: new PerlinCurve({ step: 2000, amplitude: 100 }),
            });

            await this.runObjectives({
                objectives: [
                    new Objective('DO 3 BACKFLIPS'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('backflip'))),
                ],
            });
        }
    }
}
