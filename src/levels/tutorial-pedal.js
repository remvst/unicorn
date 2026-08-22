class TutorialPedal extends Level {
    async setup() {
        this.basics().ground.curve = plains();

        this.world.addUnique(new Prompt(nomangle('▲ TO PEDAL, ▼ TO BRAKE')));

        const startX = this.basics().player.position.x;
        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('Go right →'),
                    1,
                    () => waitFor(this.world, () => this.basics().player.position.x > startX + 2000),
                ),
            ],
        });

        this.world.clearCategory(Objective);
        this.world.clearCategory(Prompt);
    }
}
