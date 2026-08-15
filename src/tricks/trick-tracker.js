class Trick {
    constructor() {
        this.label = '';
    }
}

class ComboTracker {

    constructor(bike) {
        this.bike = bike;

        this.tricksTrackers = [
            new Backflip(),
            new Wheelie(),
            new DistanceJump(),
            new TallJump(),
            new PerfectLanding(),
        ];
        for (const tracker of this.tricksTrackers) {
            tracker.bind(this);
        }

        this.tricks = [];

        this.groundedAcc = 0;
    }

    addTrick(trick) {
        if (this.tricks.indexOf(trick) >= 0) return;
        this.tricks.push(trick);
    }

    cycle(elapsed) {
        for (const tracker of this.tricksTrackers) {
            tracker.cycle(elapsed);
        }

        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        if (!front || !back) {
            this.groundedAcc = 0;
        } else {
            this.groundedAcc += elapsed;
            if (this.groundedAcc > 0.1) {
                this.validateCombo();
            }
        }
    }

    validateCombo() {
        if (!this.tricks.length) return;

        for (const tracker of this.tricksTrackers) {
            tracker.reset();
        }

        this.tricks = [];

        this.bike.power += 0.5;
    }
}

class TrickTracker {
    bind(combo) {
        this.combo = combo;
        this.bike = this.combo.bike;
        this.reset();
    }

    reset() {

    }

    cycle(elapsed) {

    }
}

class Backflip extends TrickTracker {

    reset() {
        this.previousRotation = this.bike.rotation;
        this.rotationAcc = 0;
        this.trick = new Trick();
    }

    cycle(elapsed) {
        if (this.bike.airborne) {
            this.rotationAcc += this.bike.rotation - this.previousRotation;
            this.previousRotation = this.bike.rotation;

            const flipCount = (abs(this.rotationAcc) + PI) / (PI * 2);
            if (flipCount >= 1) {
                this.combo.addTrick(this.trick);
                this.trick.label = floor(flipCount) + 'x' + (this.rotationAcc < 0 ? 'backflip' : 'frontflip');
            }
        } else {
            this.reset();
        }
    }
}

class Wheelie extends TrickTracker {

    reset() {
        this.acc = 0;
        this.trick = new Trick();
    }

    cycle(elapsed) {
        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        if (back && !front || front && !back) {
            this.acc += elapsed;
            if (this.acc > 0.5) {
                this.trick.label ||= back ? 'Wheelie' : 'Nosewheelie';
                this.combo.addTrick(this.trick);
            }
        } else {
            this.acc = 0;
        }
    }
}

class DistanceJump extends TrickTracker {

    reset() {
        this.acc = 0;
        this.changeX = new ValueChangeHelper();
        this.trick = new Trick();
        this.trick.label = 'jump distance';
    }

    cycle(elapsed) {
        const [xBefore, xAfter] = this.changeX.change(this.bike.position.x);

        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        if (back || front) {
            this.reset();
        } else {
            this.acc += (xAfter - xBefore) || 0;
            if (this.acc > 1000) {
                this.combo.addTrick(this.trick);
            }
        }
    }
}

class TallJump extends TrickTracker {

    reset() {
        this.acc = 0;
        this.changeY = new ValueChangeHelper();
        this.trick = new Trick();
        this.trick.label = 'jump height';
    }

    cycle(elapsed) {
        const [yBefore, yAfter] = this.changeY.change(this.bike.position.y);

        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        if (back || front) {
            this.reset();
        } else {
            this.acc += min(0, yAfter - yBefore || 0);
            if (this.acc < -200) {
                this.combo.addTrick(this.trick);
            }
        }
    }
}

class PerfectLanding extends TrickTracker { // TODO consider gutting

    reset() {
        this.landedTime = 0;
        this.airTime = 0;
        this.trick = new Trick();
        this.trick.label = 'perfect landing';
        this.airborneMomentum = 0;
    }

    cycle(elapsed) {
        const back = this.bike.hasCollision(this.bike.backWheel);
        const front = this.bike.hasCollision(this.bike.frontWheel);

        const momentum = pointDistance(0, 0, this.bike.momentum.position.x, this.bike.momentum.position.y);

        if (back || front) {
            this.landedTime += elapsed;
        } else {
            this.airTime += elapsed;
            this.landedTime = 0;
            this.airborneMomentum = momentum;
        }

        if (back && front) {
            const rating = momentum / this.airborneMomentum;
            if (this.landedTime < 0.1 && this.airTime > 1 && rating > 0.95) {

                this.trick.label = 'Landing ' + rating.toFixed(2);
                this.combo.addTrick(this.trick);
            }

            this.airTime = 0;

            this.reset();
        }
    }
}
