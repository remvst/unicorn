class ComboTracker {

    constructor(bike) {
        this.bike = bike;

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

        this.tricks = [];
        this.comboPower = 0;
        this.points = 0;
    }

    addTrick(trick) {
        if (!trick.addedToCombo) {
            trick.addedToCombo = true;
            this.tricks.push(trick);

            this.comboPower = min(1, this.comboPower + 0.5);
        }

        this.points = roundToNearest(this.tricks.reduce((acc, t) => acc + t.points, 0), 10);
    }

    cycle(elapsed) {
        for (const tracker of this.tricksTrackers) {
            tracker.cycle(elapsed);
        }

        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        this.comboPower = max(0, this.comboPower - elapsed / 4);

        if (this.comboPower <= 0 && (front || back)) {
            this.validateCombo();
        }
    }

    validateCombo() {
        if (!this.tricks.length) return;

        for (const tracker of this.tricksTrackers) {
            tracker.reset();
        }

        this.tricks.length = 0;
        this.points = 0;
    }
}
