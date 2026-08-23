class Bike extends PhysicsObject {
    constructor() {
        super();

        this.power = 0;

        this.pedalAge = 0;

        this.frontWheel = this.addHitbox();
        this.frontWheel.position.x = 20;
        this.frontWheel.position.y = 20;
        this.frontWheel.radius = 10;

        this.backWheel = this.addHitbox();
        this.backWheel.position.x = -20;
        this.backWheel.position.y = 20;
        this.backWheel.radius = 10;

        this.head = this.addHitbox();
        this.head.position.y = -10;
        this.head.radius = 10;

        this.jumpChange = new ValueChangeHelper();

        this.backWheelOnGroundChange = new ValueChangeHelper();
        this.frontWheelOnGroundChange = new ValueChangeHelper();

        this.usingPower = false;

        this.renderable = new BikeAndRiderRenderable(this);

        this.controls = {
            // raiseWheel: false,
            // lowerWheel: false,
            // accelerate: false,
            // brake: false,
            // jump: false,
        }
    }

    airborne(coyoteTime) {
        return !this.hasCollision(this.backWheel, coyoteTime) &&
            !this.hasCollision(this.frontWheel, coyoteTime);
    }

    jump() {
        this.momentum.position.y -= 200;
        this.momentum.rotation -= PI / 4;
        zzfx(...[.9,,231,,,.07,1,3.8,40,111,,,,,,,,.89,.04,,186]); // Jump 17
    }

    cycleUnsafe(elapsed) {
        const {
            raiseWheel,
            lowerWheel,
            jump,
            brake,
        } = this.controls;

        // Backflip/frontflip
        // If the player is trying to counteract a flip, give extra power so it's easier to control
        if (raiseWheel) this.momentum.rotation -= elapsed * (this.momentum.rotation > 0 ? PI * 4 : PI * 2);
        if (lowerWheel) this.momentum.rotation += elapsed * (this.momentum.rotation < 0 ? PI * 4 : PI * 2);

        const momentumRotationBefore = this.momentum.rotation;

        super.cycleUnsafe(elapsed);

        // Don't let ground contact damp out the player's input, no matter how many
        // substeps this frame got split into.
        if (raiseWheel || lowerWheel) {
            this.momentum.rotation = momentumRotationBefore;
        }

        const [jumpBefore, jumpAfter] = this.jumpChange.change(jump);
        if (jumpBefore && !jumpAfter && !this.airborne(0.1) && this.world.age > 0.5) {
            this.jump();
        }

        // Stomping
        if (jump && this.airborne()) {
            this.momentum.position.y += 1000 * elapsed;
        }

        // Rotation dampening
        if (this.airborne(0.1) && !raiseWheel && !lowerWheel) {
            this.momentum.rotation -= between(
                -elapsed * PI * 2,
                this.momentum.rotation,
                elapsed * PI * 2,
            );
        }

        // Cap spinning
        this.momentum.rotation = between(
            -PI * 2,
            this.momentum.rotation,
            PI * 2,
        );

        this.power = max(0, this.power - elapsed / 8);
    }

    cycle(elapsed) {
        const {
            raiseWheel,
            lowerWheel,
            jump,
            brake,
            accelerate,
        } = this.controls;

        const momentumYBefore = this.momentum.position.y;

        super.cycle(elapsed);

        const backWheelOnGround = this.hasCollision(this.backWheel);
        const frontWheelOnGround = this.hasCollision(this.frontWheel);

        let forwardPush = 0;
        if (accelerate) {
            forwardPush += (this.power > 0 ? 1000 : 500) * elapsed;

            const momentum = pointDistance(0, 0, this.momentum.position.x, this.momentum.position.y);
            this.pedalAge += elapsed * interpolate(0, 1, momentum / 500);
        }

        if (forwardPush && backWheelOnGround) {
            // Base momentum off the curve
            let sdx = this.backWheel.lastCollisionSegment.p2.x - this.backWheel.lastCollisionSegment.p1.x;
            let sdy = this.backWheel.lastCollisionSegment.p2.y - this.backWheel.lastCollisionSegment.p1.y;
            // Force direction to always point rightward
            if (sdx < 0) { sdx = -sdx; sdy = -sdy; }
            const slen = hypot(sdx, sdy);
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
            else if (jump) friction = 50;
            else if (brake) friction = 1000;
            else friction = 200;
        }
        this.momentum.position.x += -sign(this.momentum.position.x) * min(
            abs(this.momentum.position.x),
            elapsed * friction,
        );

        // Death
        if (this.hasCollision(this.head)) this.die();

        const [backWheelBefore, backWheelAfter] = this.backWheelOnGroundChange.change(this.hasCollision(this.backWheel, 0.3));
        const [frontWheelBefore, frontWheelAfter] = this.frontWheelOnGroundChange.change(this.hasCollision(this.frontWheel, 0.3));

        const wheelClouds = [];
        if (!backWheelBefore && backWheelAfter) wheelClouds.push(this.backWheel);
        if (!frontWheelBefore && frontWheelAfter) wheelClouds.push(this.frontWheel);

        for (const wheel of wheelClouds) {
            zzfx(...[.2,,29,.01,.03,.02,3,2,,-24,-181,.22,,.8,,,,.7,.01,,-1362]); // Blip 79

            dustCloud({
                world: this.world,
                position: {
                    x: wheel.absolute.position.x,
                    y: wheel.absolute.position.y + wheel.radius,
                },
                radius: interpolate(5, 15, abs(momentumYBefore) / 1000),
                density: 1 / (5 * 5),
                duration: [0.25, 1],
                x: [-40, 0],
                y: [-20, 0],
                size: 5,
            });
        }

        // Animations
        if (this.airborne(0.3)) {
            this.renderable.landAge = 0;
        } else {
            this.renderable.landAge += elapsed;
        }

        const targetBalance = raiseWheel
            ? -1
            : lowerWheel
            ? 1
            : 0;

        this.renderable.balance += between(
            -elapsed * 2,
            targetBalance - this.renderable.balance,
            elapsed * 2,
        );

        const targetJumpPrep = jump
            ? 1
            : 0;
        this.renderable.jumpPrep += between(
            -elapsed * 10,
            targetJumpPrep - this.renderable.jumpPrep,
            elapsed * 2,
        );
    }

    render() {
        ctx.wrap(() => {
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);

            this.renderable.pedalAge = this.pedalAge;
            this.renderable.render();
        });

        super.render();
    }

    die() {
        zzfx(...[1.5,,375,.01,.02,.19,5,.39546947939141197,,,,,,2,,.4,.13,.64,.01,,169]); // Hit 65
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

        this.world.add(new WheelGib(this, this.backWheel)).removeWhenAgeIs(20);
        this.world.add(new WheelGib(this, this.frontWheel)).removeWhenAgeIs(20);
        this.world.add(new BikeGib(this)).removeWhenAgeIs(20);
    }
}

class BikeRenderable extends SkeletonRenderable {
    constructor(bike, wheels = 1) {
        super();

        const backWheel = bike.backWheel.position;
        const frontWheel = bike.frontWheel.position;

        this.pedalsCenter = {
            x: interpolate(
                backWheel.x,
                frontWheel.x,
                0.4,
            ),
            y: backWheel.y,
        }

        this.forkLink = {
            x: frontWheel.x - 5,
            y: frontWheel.y - 15,
        }

        this.handlebarsConnection = {
            x: frontWheel.x - 5,
            y: this.forkLink.y - 5,
        }

        this.handlebarsBottom = {
            x: this.handlebarsConnection.x + 3,
            y: this.handlebarsConnection.y - 2,
        }

        this.handlebarsTop = {
            x: this.handlebarsConnection.x + 3,
            y: this.handlebarsConnection.y - 10,
        }

        this.seatBase = {
            x: interpolate(
                backWheel.x,
                frontWheel.x,
                0.3,
            ),
            y: interpolate(backWheel.y, this.handlebarsConnection.y, 0.5),
        }

        this.seatCenter = {
            x: this.seatBase.x,
            y: this.seatBase.y - 5,
        }

        if (wheels) {
            this
                .add(setThickness(4))
                .add(setColor('#000'))
                .add(circleRenderable(backWheel, bike.backWheel.radius))
                .add(circleRenderable(frontWheel, bike.frontWheel.radius));
        }

        // Body
        this.add(
            setLineCap('round'),
            setColor('#444'),
            setThickness(2),
            lineRenderable(backWheel, this.seatBase),
            lineRenderable(backWheel, this.pedalsCenter),
            lineRenderable(this.pedalsCenter, this.seatCenter),
            lineRenderable(this.seatBase, this.forkLink),
            lineRenderable(this.pedalsCenter, this.forkLink),
            lineRenderable(frontWheel, this.handlebarsConnection),
            lineRenderable(this.handlebarsBottom, this.handlebarsConnection),
            lineRenderable(this.handlebarsBottom, this.handlebarsTop),
            circleRenderable(this.pedalsCenter, 3),
        );
    }
}

class BikeAndRiderRenderable extends BikeRenderable {
    constructor(bike) {
        super(bike);

        this.balance = 0;
        this.landAge = 0;
        this.pedalAge = 0;
        this.jumpPrep = 0;

        this.butt = {};

        this.leftFoot = {};
        this.leftKnee = {};

        this.rightFoot = {};
        this.rightKnee = {};

        this.shoulders = {};
        this.head = {};
        this.leftHand = {};
        this.leftElbow = {};

        this
            // Right leg, rendered behind the bike
            // (yes I know it's technically the left leg but whatever, why are you even reading this)
            .prepend(
                setThickness(4),
                setColor('#ccc'),
                setLineCap('round'),
                lineRenderable(this.rightFoot, this.rightKnee),
                lineRenderable(this.rightKnee, this.butt),
            )

            // Rest of the rider, rendered in front of the bike
            .add(
                setColor('#fff'),
                setThickness(4),
                setLineCap('round'),
                lineRenderable(this.leftFoot, this.leftKnee),
                lineRenderable(this.leftKnee, this.butt),

                setThickness(6),
                lineRenderable(this.shoulders, this.butt),

                setThickness(4),
                lineRenderable(this.shoulders, this.leftElbow),
                lineRenderable(this.leftElbow, this.leftHand),
                circleRenderable(this.head, 6, true),
                circleRenderable(this.leftHand, true),
            )
            ;
    }

    render() {
        this.leftFoot.x = this.pedalsCenter.x + cos(this.pedalAge * 9) * 5;
        this.leftFoot.y = this.pedalsCenter.y + sin(this.pedalAge * 9) * 5;

        this.rightFoot.x = this.pedalsCenter.x + cos(this.pedalAge * 9 + PI) * 5;
        this.rightFoot.y = this.pedalsCenter.y + sin(this.pedalAge * 9 + PI) * 5;

        this.butt.x = this.seatCenter.x;
        this.butt.y = this.seatCenter.y - 2;

        this.leftKnee.x = interpolate(
            this.leftFoot.x,
            this.butt.x,
            0.5,
        ) + 10;

        this.leftKnee.y = interpolate(
            this.leftFoot.y,
            this.butt.y,
            0.5,
        );

        this.rightKnee.x = interpolate(
            this.rightFoot.x,
            this.butt.x,
            0.5,
        ) + 10;

        this.rightKnee.y = interpolate(
            this.rightFoot.y,
            this.butt.y,
            0.5,
        );

        this.leftHand.x = this.handlebarsTop.x;
        this.leftHand.y = this.handlebarsTop.y;

        this.shoulders.x =
            interpolate(this.butt.x, this.leftHand.x, 0.3) + // Base position
            this.balance * 10 + // Pull/push bike
            interpolate(0, 5, pyramid(this.landAge / 0.3)) + // Landing animation
            cos(this.pedalAge * 9 + PI) * 2 + // Rotate shoulders while pedaling
            interpolate(0, 5, this.jumpPrep) +
            0;

        this.shoulders.y =
            interpolateUnbounded(this.butt.y, this.leftHand.y, 1.5) + // Base position
            interpolate(0, 5, pyramid(this.landAge / 0.3)) + // Landing animation
            interpolate(0, 5, this.jumpPrep)
            0;

        this.head.x = interpolateUnbounded(this.butt.x, this.shoulders.x, 1.3) + 2;
        this.head.y = interpolateUnbounded(this.butt.y, this.shoulders.y, 1.3);

        this.leftElbow.x = interpolate(this.shoulders.x, this.leftHand.x, 0.4);
        this.leftElbow.y = interpolateUnbounded(this.shoulders.y, this.leftHand.y, 1.2);

        super.render();
    }
}

pyramid = (x) => 1 - abs((x - 0.5) * 2);
