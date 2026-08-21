class LevelFrontflip extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'Alright, not bad for a first try',
                'Let\'s see if these unicorns are impressed though',
                'Show off a frontflip, then link a few flips together',
            ],
            curve: new PerlinCurve({ step: 1500, amplitude: 400 }),
        });

        const uc1 = this.world.add(new AudienceUnicorn());
        uc1.position.x = levelStartX + 400;
        const uc2 = this.world.add(new AudienceUnicorn());
        uc2.position.x = levelStartX + 600;

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
