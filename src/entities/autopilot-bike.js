
class AutopilotBike extends Bike {
    constructor() {
        super();
        this.simulated = new Bike();
        this.simulated.die = () => {};
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.controls.accelerate = this.momentum.position.x < 500;

        const currentAngle = normalizeAngle(this.rotation);
        const angleSoon = this.rotation + this.momentum.rotation * 0.2
        const targetAngle = this.targetAngle();
        const angleDiff = normalizeAngle(targetAngle - angleSoon);

        const spot = this.landingSpot();

        // this.controls.raiseWheel = angleDiff < 0;
        // this.controls.lowerWheel = angleDiff > 0;

        // if (!this.airborne(0.1)) {
            this.rotation = targetAngle;
            this.momentum.rotation = 0;
        // }

        // if (!spot && this.airborne()) {
        //     this.controls.raiseWheel = true;
        //     this.controls.lowerWheel = false;
        // }

        // if (!this.airborne())
        // this.momentum.rotation = 0;
        // this.rotation = targetAngle;
    }

    targetAngle() {
        const ground = firstItem(this.world.category('ground'));
        const currentSlope = sin(this.rotation) / cos(this.rotation);

        let x = this.position.x;

        if (this.airborne(0.2)) {
            x = this.landingSpot()?.x || x;
        }

        const slope = ground.curve.slopeFor(x);
        return normalizeAngle(atan2(slope, 1));
    }

    landingSpot() {
        this.simulated.world = this.world;

        this.simulated.position.x = this.position.x;
        this.simulated.position.y = this.position.y;
        this.simulated.rotation = this.rotation;

        this.simulated.momentum.position.x = this.momentum.position.x;
        this.simulated.momentum.position.y = this.momentum.position.y;
        this.simulated.momentum.rotation = this.momentum.rotation;

        this.simulated.frontWheel.lastCollisionAge = this.frontWheel.lastCollisionAge;
        this.simulated.backWheel.lastCollisionAge = this.backWheel.lastCollisionAge;

        for (let t = 0 ; t < 0.5 ; t += 1 / 60) {
            this.simulated.cycle(1 / 60);

            if (!this.simulated.airborne(0.1)) {
                return this.simulated.position;
            }
        }
    }

    die() {
        // What never lived cannot die
    }

    render() {
        if (DEBUG) ctx.wrap(() => {
            const spot = this.landingSpot();
            if (spot) {
                ctx.strokeStyle = '#ff0';
                ctx.lineWidth = 5;

                ctx.beginPath();
                ctx.moveTo(this.position.x, this.position.y);
                ctx.lineTo(spot.x, spot.y);
                ctx.stroke();
            }

            const targetAngle = this.targetAngle();
            ctx.strokeStyle = '#0f0';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(targetAngle) * 50, this.position.y + sin(targetAngle) * 50);
            ctx.stroke();


            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(this.rotation) * 50, this.position.y + sin(this.rotation) * 50);
            ctx.stroke();


            // this.simulated.world = this.world;

            // this.simulated.position.x = this.position.x;
            // this.simulated.position.y = this.position.y;
            // this.simulated.rotation = this.rotation;

            // this.simulated.momentum.position.x = this.momentum.position.x;
            // this.simulated.momentum.position.y = this.momentum.position.y;
            // this.simulated.momentum.rotation = this.momentum.rotation;

            // this.simulated.frontWheel.lastCollisionAge = this.frontWheel.lastCollisionAge;
            // this.simulated.backWheel.lastCollisionAge = this.backWheel.lastCollisionAge;

            // ctx.strokeStyle = '#fff';
            // ctx.lineWidth = 5;
            // ctx.beginPath();
            // for (let t = 0 ; t < 1 ; t += 1 / 60) {
            //     this.simulated.cycle(1 / 60);

            //     ctx.lineTo(this.simulated.position.x, this.simulated.position.y);

            //     if (!this.simulated.airborne(0.1)) {
            //         // return this.simulated.position;
            //         break;
            //     }
            // }
            // ctx.stroke();
        });

        super.render();
    }
}
