class TrickTracker {
    bind(combo) {
        this.combo = combo;
        this.bike = this.combo.bike;
        this.reset();
    }

    reset() {
        this.trick = !this.trick || this.trick.addedToCombo
            ? new Trick()
            : this.trick;
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
            const qualifier = flipCount > 1 ? ([
                '',
                'double',
                'triple',
            ][flipCount - 1] || `${flipCount}x`) : '';
            const trick = this.acc.rotation < 0 ? 'backflip' : 'frontflip';
            this.trick.label = `${qualifier} ${trick}`;
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

        if (back === front) {
            this.reset(); // airborne or landed, not a wheelie
        } else if (back !== front) {
            this.accX += changeX;
            if (this.accX > 200) {
                this.trick.points = max(0, this.accX * 50 / 100);
                this.trick.label ||= back ? 'Wheelie' : 'Nosewheelie';
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
            this.trick.label = 'Jump height';
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
            this.trick.label = 'Jump distance';
            this.combo.addTrick(this.trick);
        }
    }
}
