class LevelBackflipFrontflip extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'Sick air time',
                'Now try mixing a backflip and a frontflip into the same combo',
                'and see if you can stack up a decent combo while you\'re at it',
            ],
            curve: new PerlinCurve({ step: 800, amplitude: 300 }),
        });

        this.world.addUnique(new ItemGenerator());

        await this.runObjectives({
            objectives: [
                new Objective(`In one combo: ${['backflip', 'frontflip'].join(' + ')}`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.includes('backflip'),
                    t => t.label.includes('frontflip'),
                ])),
                new Objective('land a 5x combo'.toUpperCase(), 1, () => waitFor(this.world, () => {
                    return firstItem(this.world.category(Player))?.comboTracker.startedTricks.length >= 5;
                })),
            ],
        });
    }
}
