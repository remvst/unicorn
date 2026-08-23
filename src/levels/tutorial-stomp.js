class TutorialStomp extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                nomangle('You can also hold [SPACE] to stomp the ground'),
                nomangle('Stomping is great for gaining momentum'),
            ]),
            curve: simpleBumps(),
        });

        this.world.addUnique(new Prompt(nomangle('HOLD [SPACE] WHILE AIRBORNE TO STOMP')));

        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('STOMP THE GROUND'),
                    5,
                    () => awaitTrick(this.world, anyStomp),
                ),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
