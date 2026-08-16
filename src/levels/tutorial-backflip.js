class TutorialBackflip extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'Wow, you\'re really good at it!',
                '(in case you couldn\'t tell, that was sarcasm)',
                'Anyway do you think you can backflip over those hills?',
            ],
        });

        await this.runObjectives({
            objectives: [
                new Objective('Do a backflip', (p) => {
                    return p.position.x > levelStartX + 500; // TODO fix predicate
                }),
            ],
        });
    }
}
