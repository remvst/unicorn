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

        for (const obj of [...this.world.category(Objective)]) {
            if (obj.completed) {
                this.world.remove(obj);

                const index = remainingObjectives.indexOf(obj);
                if (index >= 0) remainingObjectives.splice(index, 1);
            }
        }
    }
}
