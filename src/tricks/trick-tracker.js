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

class JumpTracker extends TrickTracker {
    constructor() {
        super();
        this.changeX = new ValueChangeHelper();
        this.changeY = new ValueChangeHelper();
        this.changeRotation = new ValueChangeHelper();
        this.acc = {
            position: {},
            rotation: 0,
        };
    }

    reset() {
        super.reset();
        this.acc.position.x = 0;
        this.acc.position.y = 0;
        this.acc.rotation = 0;
    }

    cycle(elapsed) {
        const landed = !this.bike.airborne();
        if (landed) this.reset();

        this.acc.position.x += changeDiff(this.changeX.change(this.bike.position.x));
        this.acc.position.y += changeDiff(this.changeY.change(this.bike.position.y));
        this.acc.rotation += normalizeAngle(changeDiff(this.changeRotation.change(normalizeAngle(this.bike.rotation))));
    }
}

class Flip extends JumpTracker {

    cycle(elapsed) {
        super.cycle(elapsed);

        const flipCount = floor((abs(this.acc.rotation) + PI) / (PI * 2));

        if (flipCount >= 1) {
            const prefix = flipCount > 1 ? ([
                nomangle('DOUBLE '),
                nomangle('TRIPLE '),
            ][flipCount - 2] || `${flipCount}X `) : '';
            const trick = this.acc.rotation < 0 ? nomangle('BACKFLIP') : nomangle('FRONTFLIP');
            this.trick.label = prefix + trick;
            this.trick.points =
                200 * // base
                (this.rotationAcc < 0 ? 1 : 2) * // increase base if frontflip
                pow(2, flipCount - 1) // exponential as the number of flips increase
                ;

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
        this.accX = 0;
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

            this.accX += abs(changeX);
            this.trick.label = targetTrickLabel;

            if (this.accX > 200) {
                this.trick.points = max(0, this.accX * 50 / 100);
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
