class LevelWheelieBasics extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Wheelies are an awesome way to pad out a combo',
                'String a few together, then mix one in with a backflip',
            ],
            curve: new PerlinCurve({ step: 1000, amplitude: 150 }),
        });

        await this.runObjectives({
            objectives: [
                new Objective(`In one combo: ${Array(3).fill('wheelie').join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.toLowerCase().includes('wheelie'),
                    t => t.label.toLowerCase().includes('wheelie'),
                    t => t.label.toLowerCase().includes('wheelie'),
                ])),
                new Objective('land a 10x combo'.toUpperCase(), 1, () => waitFor(this.world, () => {
                    return firstItem(this.world.category(Player))?.comboTracker.startedTricks.length >= 10;
                })),
                new Objective(`In one combo: ${['wheelie', 'backflip'].join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.toLowerCase().includes('wheelie'),
                    t => t.label.includes('backflip'),
                ])),
            ],
        });
    }
}
