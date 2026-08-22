class TutorialJumps extends Level {
    async setup() {
        await this.levelTransition({
            dialog: [
                'You can also jump to get a bit of extra air',
                'Hold [SPACE], then release to jump',
            ],
            curve: simpleBumps(),
        });
        this.world.addUnique(new Prompt('HOLD [SPACE], RELEASE TO JUMP'));

        await this.runObjectives({
            objectives: [
                new Objective('GET AIR TIME', 3, () => awaitTrick(this.world, anyAir)),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
