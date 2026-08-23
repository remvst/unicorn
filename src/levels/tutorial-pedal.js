class TutorialPedal extends Level {
    async setup() {
        this.ground.curve = plains();

        this.world.addUnique(new Prompt(nomangle('▲ TO PEDAL, ▼ TO BRAKE')));

        const startX = this.player.position.x;
        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('GO RIGHT →'),
                    1,
                    () => waitFor(this.world, () => this.player?.position.x > startX + 1000),
                ),
            ],
        });

        this.world.clearCategory(Objective);
        this.world.clearCategory(Prompt);
    }
}
