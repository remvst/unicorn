class TutorialJumps extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                nomangle('K that was pretty sick NGL'),
                nomangle('Let\'s see if you can get more air'),
            ]),
            curve: simpleBumps(),
        });

        this.world.addUnique(new Prompt(nomangle('HOLD [SPACE], RELEASE TO JUMP')));

        await this.runObjectives({
            objectives: [
                new Objective(
                    'GET AIR TIME',
                    3,
                    () => awaitTrick(this.world, anyAir),
                ),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
