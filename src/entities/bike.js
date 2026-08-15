class Bike extends PhysicsObject {
    constructor() {
        super();

        this.categories.push('bike');

        this.power = 0;

        this.frontWheel = this.addHitbox();
        this.frontWheel.position.x = 20;
        this.frontWheel.radius = 10;

        this.backWheel = this.addHitbox();
        this.backWheel.position.x = -20;
        this.backWheel.radius = 10;

        this.head = this.addHitbox();
        this.head.position.y = -20;
        this.head.radius = 5;

        this.safety = this.addHitbox();
        this.safety.position.y = 5;
        this.safety.radius = 3;

        this.jumpChange = new ValueChangeHelper();

        this.backWheelOnGroundChange = new ValueChangeHelper();
        this.frontWheelOnGroundChange = new ValueChangeHelper();

        this.comboTracker = new ComboTracker(this);

        this.usingPower = false;

        this.bikeRenderable = new BikeRenderable(this);
    }

    get airborne() {
        return !this.hasCollision(this.backWheel, 0.1) &&
            !this.hasCollision(this.frontWheel, 0.1);
    }

    jump() {
        this.momentum.position.y -= 200;
        this.momentum.rotation -= Math.PI / 4;
    }

    cycleUnsafe(elapsed) {
        const raiseWheel = downKeys[37];
        const lowerWheel = downKeys[39];
        const jump = downKeys[32];
        const brake = downKeys[40];

        // Backflip/frontflip
        if (raiseWheel) this.momentum.rotation -= elapsed * Math.PI * 2;
        if (lowerWheel) this.momentum.rotation += elapsed * Math.PI * 2;

        const momentumRotationBefore = this.momentum.rotation;

        super.cycleUnsafe(elapsed);

        // Don't let ground contact damp out the player's input, no matter how many
        // substeps this frame got split into.
        if (raiseWheel || lowerWheel) {
            this.momentum.rotation = momentumRotationBefore;
        }

        const [jumpBefore, jumpAfter] = this.jumpChange.change(jump);
        const backWheelOnGround = this.age - this.backWheel.lastCollisionAge < 0.1;
        const frontWheelOnGround = this.age - this.frontWheel.lastCollisionAge < 0.1;
        if (jumpBefore && !jumpAfter && (backWheelOnGround || frontWheelOnGround)) {
            this.jump();
        }

        // Stomping
        if (brake && this.airborne) {
            this.momentum.position.y += 1000 * elapsed;
        }

        // Rotation dampening
        if (this.airborne && !raiseWheel && !lowerWheel) {
            this.momentum.rotation -= between(
                -elapsed * Math.PI,
                this.momentum.rotation,
                elapsed * Math.PI,
            );
        }

        this.power = max(0, this.power - elapsed / 8);
    }

    cycle(elapsed) {
        const accelerate = downKeys[38];
        const brake = downKeys[40];

        super.cycle(elapsed);

        const backWheelOnGround = this.age - this.backWheel.lastCollisionAge < 0.1;
        const frontWheelOnGround = this.age - this.frontWheel.lastCollisionAge < 0.1;

        let forwardPush = 0;
        if (accelerate) {
            forwardPush += (this.power > 0 ? 1000 : 500) * elapsed;
        }

        if (forwardPush && backWheelOnGround) {
            // Base momentum off the curve
            let sdx = this.backWheel.lastCollisionSegment.p2.x - this.backWheel.lastCollisionSegment.p1.x;
            let sdy = this.backWheel.lastCollisionSegment.p2.y - this.backWheel.lastCollisionSegment.p1.y;
            // Force direction to always point rightward
            if (sdx < 0) { sdx = -sdx; sdy = -sdy; }
            const slen = Math.hypot(sdx, sdy);
            sdx /= slen; sdy /= slen;

            // Cross product: positive means wheel is below the segment (ceiling contact)
            const backWheel = this.absolute(this.hitboxes[1], new Hitbox());
            const cross = sdx * (backWheel.position.y - this.backWheel.lastCollisionSegment.p1.y)
                        - sdy * (backWheel.position.x - this.backWheel.lastCollisionSegment.p1.x);
            const sign = cross > 0 ? -1 : 1;

            this.momentum.position.x += sign * sdx * forwardPush;
            this.momentum.position.y += sign * sdy * forwardPush;
        }

        // Friction
        let friction = 0;
        if (backWheelOnGround || frontWheelOnGround) {
            if (accelerate) friction = 0;
            else if (brake) friction = 1000;
            else friction = 200;
        }
        this.momentum.position.x += -Math.sign(this.momentum.position.x) * Math.min(
            Math.abs(this.momentum.position.x),
            elapsed * friction,
        );

        // Death
        if (this.hasCollision(this.head)) this.die();

        this.comboTracker.cycle(elapsed);

        const [backWheelBefore, backWheelAfter] = this.backWheelOnGroundChange.change(this.hasCollision(this.backWheel));
        const [frontWheelBefore, frontWheelAfter] = this.frontWheelOnGroundChange.change(this.hasCollision(this.frontWheel));

        const wheelClouds = [];
        if (!backWheelBefore && backWheelAfter) wheelClouds.push(this.backWheel);
        if (!frontWheelBefore && frontWheelAfter) wheelClouds.push(this.frontWheel);

        for (const wheel of wheelClouds) {
            dustCloud({
                world: this.world,
                position: {
                    x: wheel.absolute.position.x,
                    y: wheel.absolute.position.y + wheel.radius,
                },
                radius: 5,
                density: 1 / (5 * 5),
                duration: [0.25, 1],
                x: [-40, 0],
                y: [-20, 0],
                size: 5,
            });
        }
    }

    render() {
        super.render();

        ctx.wrap(() => {
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);

            this.bikeRenderable.render();
        });
    }

    die() {
        this.dead = true;
        this.world.remove(this);

        dustCloud({
            world: this.world,
            position: this.position,
            radius: 20,
            density: 1 / (5 * 5),
            duration: [0.25, 1],
            x: [-40, 40],
            y: [-40, 40],
            size: 10,
        });

        for (const wheel of [this.frontWheel, this.backWheel]) {
            const gib = this.world.add(new PhysicsObject());
            gib.position.x = wheel.absolute.position.x;
            gib.position.y = wheel.absolute.position.y;

            const hb = gib.addHitbox();
            hb.radius = wheel.radius;
        }
    }
}

class LineRenderable {

    constructor() {
        this.lines = [];
    }

    addLine(from, to) {
        this.lines.push([from, to]);
        return this;
    }

    render() {
        for (const [from, to] of this.lines) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    }
}

class BikeRenderable extends LineRenderable {
    constructor(bike) {
        super();

        const backWheel = bike.backWheel.position;
        const frontWheel = bike.frontWheel.position;

        const pedalsCenter = {
            x: interpolate(
                backWheel.x,
                frontWheel.x,
                0.5,
            ),
            y: backWheel.y,
        }

        const forkLink = {
            x: frontWheel.x - 5,
            y: frontWheel.y - 15,
        }

        const handlebarsConnection = {
            x: frontWheel.x - 5,
            y: forkLink.y - 5,
        }

        const handlebarsBottom = {
            x: handlebarsConnection.x + 5,
            y: handlebarsConnection.y,
        }

        const handlebarsTop = {
            x: handlebarsConnection.x + 5,
            y: handlebarsConnection.y - 10,
        }

        const seatBase = {
            x: interpolate(
                backWheel.x,
                frontWheel.x,
                0.4,
            ),
            y: interpolate(backWheel.y, handlebarsConnection.y, 0.5),
        }

        const seatCenter = {
            x: seatBase.x,
            y: seatBase.y - 5,
        }

        this
            .addLine(backWheel, seatBase)
            .addLine(backWheel, pedalsCenter)
            .addLine(pedalsCenter, seatCenter)
            .addLine(seatBase, forkLink)
            .addLine(pedalsCenter, forkLink)
            .addLine(frontWheel, handlebarsConnection)
            .addLine(handlebarsBottom, handlebarsConnection)
            .addLine(handlebarsBottom, handlebarsTop)
    }
}
