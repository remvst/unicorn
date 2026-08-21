class TutorialFlips extends Level {
    async setup() {
        // Smooth, gentle hills that make backflips easy to land
        const { ground } = this.basics();
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 150 });

        this.world.addUnique(new Prompt('▲ TO PEDAL, ▼ TO BRAKE'));

        const startX = this.basics().player?.position.x;
        await this.runObjectives({
            objectives: [
                new Objective('GO RIGHT →'.toUpperCase(), 1, () => waitFor(this.world, () => {
                    return this.basics().player?.position.x > startX + 500;
                })),
            ],
        });

        this.world.clearCategory(Prompt);

        this.transitionIntoCurve(new PerlinCurve({ plus: [
            new PerlinCurve({ step: 1000, amplitude: 200 }),
            new PerlinCurve({ step: 500, amplitude: 300 }),
            // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ] }));

        this.world.addUnique(new Prompt('◄ / ► TO BALANCE'));

        await this.runObjectives({
            objectives: [
                new Objective('perform 3 flips'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('flip'))),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
