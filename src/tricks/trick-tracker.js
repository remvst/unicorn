class TrickTracker {
    bind(combo) {
        this.combo = combo;
        this.bike = this.combo.bike;
        this.trick = new Trick();
        this.reset();
    }

    reset() {
        if (this.trick.started) {
            this.combo.lockTrick(this.trick);
            this.trick = new Trick();
        }
        this.trick.label = '';
        this.trick.points = 0;
    }

    cycle(elapsed) {

    }
}

class Flip extends TrickTracker {
    constructor() {
        super();
        this.changeRotation = new ValueChangeHelper();
        this.acc = 0;
    }

    reset() {
        super.reset();
        this.acc = 0;
    }

    cycle(elapsed) {
        const landed = !this.bike.airborne();
        if (landed) this.reset();

        this.acc += normalizeAngle(changeDiff(this.changeRotation.change(normalizeAngle(this.bike.rotation))));

        const flipCount = floor((abs(this.acc) + PI) / (PI * 2));

        if (flipCount >= 1) {
            const prefix = flipCount > 1 ? ([
                nomangle('DOUBLE '),
                nomangle('TRIPLE '),
            ][flipCount - 2] || `${flipCount}X `) : '';
            const trick = (this.acc < 0 ? nomangle('BACK') : nomangle('FRONT')) + nomangle('FLIP');
            this.trick.label = prefix + trick;
            this.trick.points =
                200 * // base
                (this.acc < 0 ? 1 : 3) * // increase base if frontflip
                pow(2, flipCount - 1) // exponential as the number of flips increase
                ;
            this.trick.multiplier = flipCount;

            this.combo.addTrick(this.trick);
        }
    }
}

class Wheelie extends TrickTracker {

    constructor() {
        super();
        this.trick = new Trick();
        this.changeX = new ValueChangeHelper();
    }

    reset() {
        super.reset();
        this.accX = -1;
    }

    cycle(elapsed) {
        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);
        const changeX = changeDiff(this.changeX.change(this.bike.position.x));

        // Both wheels on the ground => reset
        if (back && front) this.reset();

        // Only one wheel on the ground => keep accumulating
        if (back !== front) {
            // Trick type change => reset
            const targetTrickLabel  = back ? nomangle('WHEELIE') : nomangle('NOSEWHEELIE');
            if (this.trick.label && this.trick.label !== targetTrickLabel) {
                this.reset();
            }

            // Don't allow starting a wheelie until the user is actively balancing
            if (back && this.bike.controls.spin < 0 || front && this.bike.controls.spin > 0) {
                this.accX = max(0, this.accX);
            }

            if (this.accX < 0) return;

            this.accX += abs(changeX);
            this.trick.label = targetTrickLabel;

            if (this.accX > 200) {
                this.trick.points = max(0, this.accX * (front ? 150 : 50) / 100);
                this.combo.addTrick(this.trick);
            }
        }
    }
}

class AirTime extends TrickTracker {
    reset() {
        super.reset();
        this.acc = 0;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (!this.bike.airborne()) {
            this.reset();
        } else {
            this.acc += elapsed;
            this.trick.points = this.acc * 100;
            if (this.trick.points > 200) {
                this.trick.label = this.acc.toFixed(1) + nomangle('S AIR TIME');
                this.combo.addTrick(this.trick);
            }
        }
    }
}

class Stomp extends TrickTracker {
    reset() {
        super.reset();
        this.acc = 0;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        if (!this.bike.airborne()) {
            if (this.acc > 0.3) {
                this.trick.label = nomangle('STOMP');
                this.trick.points = 50;
                this.combo.addTrick(this.trick);
            }

            this.reset();
        } else {
            if (this.bike.controls.jump) {
                this.acc = max(0, this.acc + elapsed);
            } else {
                this.acc = min(0.6, this.acc - elapsed);
            }
        }
    }
}
