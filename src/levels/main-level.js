class MainLevel extends Level {
    constructor(title, objectives) {
        super();
        this.title = title;
        this.objectives = objectives;
    }

    async setup() {
        this.world.clearCategory(ItemGenerator);

        await this.levelTransition({
            curve: regularLevel(),
            transition: (x) => {
                this.announceLevelTitle(x, this.title);
                return waitFor(this.world, () => this.camera.position.x > x + CANVAS_WIDTH);
            }
        });

        this.world.addUnique(new ItemGenerator());
        this.world.addUnique(new UnicornGenerator());

        this.world.clearCategory(Objective);

        await this.runObjectives({
            objectives: this.objectives,
        });
    }
}
