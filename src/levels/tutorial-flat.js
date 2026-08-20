class TutorialFlat extends Level {
    async setup() {
        // Fairly flat curve to start with
        const { ground } = this.basics();
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 200 });

        const levelStartX = await this.levelTransition({
            dialog: [
                'A bike in unicorn land? That makes no sense!',
                'Anyway, press [UP] to get the hell out of here',
            ],
         });

        await this.runObjectives({
            objectives: [
                new Objective('Go right', 1, () => waitFor(this.world, () => {
                    return this.basics().player?.position.x > levelStartX + 500; // TODO fix predicate
                })),
            ]
        });
    }
}
