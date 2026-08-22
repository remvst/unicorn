class MainLevel extends Level {
    constructor(objectives) {
        super();
        this.objectives = objectives;
    }

    async setup() {
        await this.levelTransition({
            curve: regularLevel(),
            transition: (x) => this.announceLevelTitle(x, 'ENTERING:\nSUNNY HILLS')
        });

        this.world.clearCategory(Objective);

        await this.runObjectives({
            objectives: this.objectives,
            requiredCount: this.objectives.length - 1,
        });
    }
}
