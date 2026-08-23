class MainLevel extends Level {
    constructor(title, getObjectives) {
        super();
        this.title = title;
        this.getObjectives = getObjectives;
    }

    async setup() {
        this.world.clearCategory(ItemGenerator);

        await this.levelTransition({
            curve: regularLevel(),
            transition: (x) => {
                this.announceLevelTitle(x, this.title);
                return waitFor(this.world, () => this.basics().camera.position.x > x + CANVAS_WIDTH);
            }
        });

        this.world.clearCategory(Unicorn); // TODO this clears on-screen unicorns, not good

        this.world.add(new ItemGenerator());
        for (const x of [200, 300, 400]) {
            this.world.add(new AudienceUnicorn()).position.x = x;
        }

        this.world.clearCategory(Objective);

        const objectives = this.getObjectives();
        await this.runObjectives({
            objectives: objectives,
            requiredCount: max(1, objectives.length - 1),
        });
    }
}
