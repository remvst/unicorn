class TestLevel extends Level {
    async setup() {
        this.transitionIntoCurve(new PerlinCurve({ plus: [
            new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 500, amplitude: 200 }),
            // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ] }));

        spawnRainbows(this.basics().player);

        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 200;
        }
        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 300;
        }
        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 400;
        }

        await this.runObjectives({
            objectives: [
                new Objective('DO A BACKFLIP'.toUpperCase(), 3, () => awaitTrick(this.world, t => t.label.includes('backflip'))),
                new Objective('COMBO BACKFLIP + FRONTFLIP'.toUpperCase(), 3, () => awaitCombo(this.world, [
                    t => t.label.includes('backflip'),
                    t => t.label.includes('frontflip'),
                ])),
                new Objective('2 BACKFLIPS SAME COMBO'.toUpperCase(), 3, () => awaitCombo(this.world, [
                    t => t.label.includes('backflip'),
                    t => t.label.includes('backflip'),
                ])),
                new Objective('10,000 SCORE'.toUpperCase(), 1, () => new Promise(() => {})),
                new Objective('WHEELIE IN FRONT OF UNICORNS'.toUpperCase(), 1, () => new Promise(() => {})),
            ]
        })

        await new Promise((r) => {});
    }
}
