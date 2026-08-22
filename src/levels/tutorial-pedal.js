class TutorialPedal extends Level {
    async setup() {
        // Smooth, gentle hills that make backflips easy to land
        const { ground } = this.basics();
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 150 });

        this.world.addUnique(new Prompt(nomangle('▲ TO PEDAL, ▼ TO BRAKE')));

        const startX = this.basics().player.position.x;
        await this.runObjectives({
            objectives: [
                new Objective(
                    nomangle('Go right →'),
                    1,
                    () => waitFor(this.world, () => this.basics().player.position.x > startX + 500),
                ),
            ],
        });

        this.world.clearCategory(Objective);
        this.world.clearCategory(Prompt);
    }
}
