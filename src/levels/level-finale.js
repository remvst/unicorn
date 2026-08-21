class LevelFinale extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Last one, and it\'s a doozy',
                'Land a monstrous 50x combo',
                'then stack 5 backflips and 5 frontflips into a single combo',
                'Make it count, the unicorns are counting on you',
            ],
            curve: new PerlinCurve({ plus: [
                new PerlinCurve({ step: 2500, amplitude: 900 }),
                new PerlinCurve({ step: 600, amplitude: 300 }),
            ] }),
        });

        await this.runObjectives({
            objectives: [
                new Objective('land a 50x combo'.toUpperCase(), 1, () => waitFor(this.world, () => {
                    return firstItem(this.world.category(Player))?.comboTracker.startedTricks.length >= 50;
                })),
                new Objective(`In one combo: ${[...Array(5).fill('backflip'), ...Array(5).fill('frontflip')].join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    ...Array(5).fill(t => t.label.includes('backflip')),
                    ...Array(5).fill(t => t.label.includes('frontflip')),
                ])),
            ],
        });
    }
}
