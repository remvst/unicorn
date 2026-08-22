class MainLevel extends Level {
    constructor(objectives) {
        super();
        this.objectives = objectives;
    }

    async setup() {
        this.world.clearCategory(ItemGenerator);

        await this.levelTransition({
            curve: regularLevel(),
            transition: (x) => this.announceLevelTitle(x, 'ENTERING:\nSUNNY HILLS')
        });

        this.world.clearCategory(Unicorn); // TODO this clears on-screen unicorns, not good

        this.world.add(new ItemGenerator());
        for (const x of [200, 300, 400]) {
            this.world.add(new AudienceUnicorn()).position.x = x;
        }

        this.world.clearCategory(Objective);

        await this.runObjectives({
            objectives: this.objectives,
            requiredCount: this.objectives.length - 1,
        });
    }
}
