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
        const landed = this.bike.hasCollision(this.bike.backWheel) || this.bike.hasCollision(this.bike.frontWheel);
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


class PerfectLanding extends TrickTracker {

    constructor() {
        super();
        this.fullLandChange = new ValueChangeHelper();
    }

    reset() {
        super.reset();
        this.landedAcc = 0;
        this.changeMomentum = new ValueChangeHelper();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        // Intentional large coyote-time to force jumps >1s
        const back = this.bike.hasCollision(this.bike.backWheel, 1);
        const front = this.bike.hasCollision(this.bike.frontWheel, 1);

        const [fullBefore, fullAfter] = this.fullLandChange.change(front && back);

        const momentum = pointDistance(0, 0, this.bike.momentum.position.x, this.bike.momentum.position.y);

        if (!front && !back) {
            this.reset();
            this.changeMomentum.change(momentum);
        }

        if (front || back) {
            this.landedAcc += elapsed;
        }

        if (fullAfter && !fullBefore && this.landedAcc < 0.1) {
            const [momentumBefore, momentumNow] = this.changeMomentum.change(momentum);
            const score = momentumNow / momentumBefore;
            if (score > 0.9) {
                this.trick.label = nomangle('PERFECT LANDING');
                this.trick.points = 500;
                this.combo.addTrick(this.trick);
            }
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

class TallJump extends JumpTracker {
    cycle(elapsed) {
        super.cycle(elapsed);

        this.trick.points = max(
            this.trick.points,
            -this.acc.position.y,
        );
        if (this.trick.points > 100) {
            this.trick.label = nomangle('JUMP HEIGHT');
            this.combo.addTrick(this.trick);
        }
    }
}

class LongJump extends JumpTracker {
    cycle(elapsed) {
        super.cycle(elapsed);

        this.trick.points = max(
            this.trick.points,
            this.acc.position.x * 20 / 100,
        );
        if (this.trick.points > 100) {
            this.trick.label = nomangle('JUMP DISTANCE');
            this.combo.addTrick(this.trick);
        }
    }
}
