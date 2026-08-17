class ComboTracker {

    constructor(bike) {
        this.bike = bike;

        this.comboId = 0;

        this.tricksTrackers = [
            new Flip(),
            new Wheelie(),
            new LongJump(),
            new TallJump(),
            new PerfectLanding(),
        ];
        for (const tracker of this.tricksTrackers) {
            tracker.bind(this);
        }

        this.startedTricks = []; // tricks that will start showing in the combo
        this.lockedTricks = new Set(); // tricks that are finished but not landed yet
        this.landedTricks = new Set(); // tricks that have been fully landed
        this.comboPower = 0;
        this.points = 0;

        this.lastChange = false;
    }

    * unfinishedTricks() {
        for (const trick of this.startedTricks) {
            if (this.lockedTricks.has(trick) || this.landedTricks.has(trick)) continue;
            yield trick;
        }
    }

    addTrick(trick) {
        if (!trick.started) {
            trick.started = true;
            this.startedTricks.push(trick);

            this.comboPower = min(1, this.comboPower + 0.5);
        }

        this.lastChange = this.bike.age;

        this.points = roundToNearest(this.startedTricks.reduce((acc, t) => acc + t.points, 0), 10);
    }

    lockTrick(trick) {
        trick.locked = true;
        this.lockedTricks.add(trick);
    }

    cycle(elapsed) {
        for (const tracker of this.tricksTrackers) {
            tracker.cycle(elapsed);
        }

        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        if (this.bike.age - this.lastChange > 0.2) {
            this.comboPower = max(0, this.comboPower - elapsed / 4);
        }

        // Both wheels down, mark tricks as landed
        if (front && back) {
            for (const trick of this.lockedTricks) {
                console.log('landed', trick.label)
                this.landedTricks.add(trick);
            }
            this.lockedTricks.clear();
        }

        if (this.comboPower <= 0 && (front || back)) {
            this.validateCombo();
        }
    }

    validateCombo() {
        if (!this.startedTricks.length) return;

        for (const tracker of this.tricksTrackers) {
            tracker.reset();
        }

        this.startedTricks.length = 0;
        this.lockedTricks.clear();
        this.landedTricks.clear();
        this.points = 0;

        this.comboId++;
    }

    hasLandedTrick(predicate) {
        for (const trick of this.landedTricks) {
            if (predicate(trick)) return true;
        }
    }
}
