class LevelAdvancedCombos extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'Alright hotshot, let\'s crank it up',
                'Mix a double backflip with a wheelie in one combo',
                'chain 10 flips together, and land a triple backflip for the crowd',
            ],
            curve: new PerlinCurve({ plus: [
                new PerlinCurve({ step: 2000, amplitude: 600 }),
                new PerlinCurve({ step: 500, amplitude: 200 }),
            ] }),
        });

        const uc = this.world.add(new AudienceUnicorn());
        uc.position.x = levelStartX + 500;

        await this.runObjectives({
            objectives: [
                new Objective(`In one combo: ${['double backflip', 'wheelie'].join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.includes('double') && t.label.includes('backflip'),
                    t => t.label.toLowerCase().includes('wheelie'),
                ])),
                new Objective(`In one combo: ${Array(10).fill('flip').join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, Array(10).fill(t => t.label.includes('flip')))),
                new Objective('triple backflip in front of unicorns'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label.includes('triple') && t.label.includes('backflip') && t.inFrontOfAudience)),
            ],
        });
    }
}
