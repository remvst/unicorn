class Objective extends Entity {
    constructor(label, requiredCount, promiseFactory) {
        super();

        this.label = label;
        this.requiredCount = requiredCount;
        this.promiseFactory = promiseFactory;
    }

    get completed() {
        return this.doneCount >= this.requiredCount;
    }

    get detail() {
        return this.requiredCount > 1 ? `${this.doneCount}/${this.requiredCount}` : '';
    }

    async start() {
        this.doneCount = 0;
        while (this.doneCount < this.requiredCount) {
            await this.promiseFactory(this.world);
            this.doneCount++;
            spawnRainbows(firstItem(this.world.category(Player)));
        }
    }
}
