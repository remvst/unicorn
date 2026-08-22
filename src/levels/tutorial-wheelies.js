class TutorialWheelies extends Level {
    async setup() {
        await this.levelTransition({
            transition: (x) => this.runUnicornDialog(x, [
                nomangle('Aight this next part is fairly advanced'),
                nomangle('If you balance yourself on one wheel, that\'s called a wheelie'),
                nomangle('Wheelies allow you to connect combos together'),
            ]),
            curve: plains(),
        });

        this.world.addUnique(new Prompt('◄ TO BALANCE ON ONE WHEEL'));

        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('PERFORM 3 WHEELIES'),
                    3,
                    () => awaitTrick(this.world, anyWheelie),
                ),
            ],
        });

        this.world.clearCategory(Prompt);
    }
}
