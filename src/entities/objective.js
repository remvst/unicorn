class Objective extends Entity {
    constructor(label, detect) {
        super();
        this.categories.push('objective');
        this.label = label;
        this.detect = detect;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const player = firstItem(this.world.category('player'));
        if (!player) return;

        if (!this.completed && this.detect(player)) {
            this.completed = true;

            // Check level completion
            const hasMoreObjectives = [...this.world.category('objective')].filter(x => !x.completed).length;
            if (!hasMoreObjectives) this.world.add(new LevelOutcome(true));
        }
    }
}
