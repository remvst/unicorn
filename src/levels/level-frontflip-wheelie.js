class LevelFrontflipWheelie extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Nice, you\'re getting the hang of it',
                'Try popping a nosewheelie right into a frontflip',
            ],
            curve: new PerlinCurve({ step: 900, amplitude: 250 }),
        });

        await this.runObjectives({
            objectives: [
                new Objective(`In one combo: ${Array(3).fill('frontflip').join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.includes('frontflip'),
                    t => t.label.includes('frontflip'),
                    t => t.label.includes('frontflip'),
                ])),
                new Objective(`In one combo: ${Array(5).fill('wheelie').join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, Array(5).fill(t => t.label.toLowerCase().includes('wheelie')))),
                new Objective(`In one combo: ${['nosewheelie', 'frontflip'].join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label === 'Nosewheelie',
                    t => t.label.includes('frontflip'),
                ])),
            ],
        });
    }
}
