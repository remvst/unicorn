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
            await this.promiseFactory();
            this.doneCount++;
            spawnRainbows(firstItem(this.world.category(Player)));
        }
    }
}

awaitTrick = async (world, predicate) => {
    const player = firstItem(world.category(Player));
    const exludeTricks = new Set(player?.comboTracker.landedTricks || []);

    await waitFor(world, () => {
        const player = firstItem(world.category(Player));
        if (!player) return;

        for (const trick of player.comboTracker.landedTricks) {
            if (predicate(trick) && !exludeTricks.has(trick)) {
                exludeTricks.add(trick);
                return true;
            }
        }
    });
}

awaitChange = async (world, valueGetter) => {
    const value = valueGetter();
    await waitFor(world, () => valueGetter() !== value);
}

awaitCombo = async (world, predicates) => {
    await awaitChange(world, () => firstItem(world.category(Player))?.comboTracker.startedTricks.length === 0);

    const matchingTricks = new Set();

    await waitFor(world, () => {
        const player = firstItem(world.category(Player));
        if (!player) return;

        matchingTricks.clear();

        predicateLoop: for (const predicate of predicates) {
            for (const trick of player.comboTracker.landedTricks) {
                if (!matchingTricks.has(trick) && predicate(trick)) {
                    matchingTricks.add(trick);
                    continue predicateLoop;
                }
            }

            return; // predicate didn't match
        }

        // All predicates match, success!
        return true;
    });
}
