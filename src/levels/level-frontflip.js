class LevelFrontflip extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'Yooo that was pretty gnarly',
                'Did you know sick combos created rainbows?',
                'More rainbows = happier unicorns',
                'Happier unicorns = more magic in the world',
                'So anyway, go make some rainbows!',
            ],
            curve: new PerlinCurve({ plus: [
                new PerlinCurve({ step: 1000, amplitude: 100 }),
                new PerlinCurve({ step: 500, amplitude: 300 }),
                new PerlinCurve({ step: 200, amplitude: 100 }),
                // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
            ] }),
        });

        this.world.add(new AudienceUnicorn()).position.x = levelStartX + 400;
        this.world.add(new AudienceUnicorn()).position.x = levelStartX + 600;

        await this.runObjectives({
            objectives: [
                new Objective('frontflip in front of unicorns'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label === 'frontflip' && t.inFrontOfAudience)),
                new Objective(`In one combo: ${Array(3).fill('flip').join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.includes('flip'),
                    t => t.label.includes('flip'),
                    t => t.label.includes('flip'),
                ])),
            ],
        });
    }
}
