class Objective extends Entity {
    constructor(label, requiredCount, detect) {
        super();
        this.categories.push('objective');

        this.label = label;
        this.detect = detect;

        this.requiredCount = requiredCount;
        this.doneCount = 0;

        this.predicateChange = new ValueChangeHelper();
    }

    get completed() {
        return this.doneCount >= this.requiredCount;
    }

    get detail() {
        return this.requiredCount > 1 ? `${this.doneCount}/${this.requiredCount}` : '';
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const player = firstItem(this.world.category('player'));
        if (!player) return;

        const [before, after] = this.predicateChange.change(this.detect(player));
        if (!before && after) {
            this.doneCount++;
        }
    }
}
