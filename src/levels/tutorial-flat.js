class TutorialFlat extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'A bike in unicorn land? That makes no sense!',
                'Anyway, press [UP] to get the hell out of here',
            ],
         });

        await this.runObjectives({
            objectives: [
                new Objective('Go right', (p) => {
                    return p.position.x > levelStartX + 500; // TODO fix predicate
                }),
            ]
        });
    }
}
