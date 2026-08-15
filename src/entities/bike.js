class Bike extends PhysicsObject {
    constructor() {
        super();

        this.categories.push('bike');

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
    }

    jump() {
        console.log('jumpy');
        this.momentum.position.y -= 200;
        this.momentum.rotation -= Math.PI / 4;
    }

    cycleUnsafe(elapsed) {
        const raiseWheel = downKeys[37];
        const lowerWheel = downKeys[39];
        const jump = downKeys[32];

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

        // TODO breaking while in the air = stomp

        // Rotation dampening
        if (!backWheelOnGround && !frontWheelOnGround && !raiseWheel && !lowerWheel) {
            this.momentum.rotation -= between(
                -elapsed * Math.PI,
                this.momentum.rotation,
                elapsed * Math.PI,
            );
        }
    }

    cycle(elapsed) {
        const accelerate = downKeys[38];
        const brake = downKeys[40];

        super.cycle(elapsed);

        const backWheelOnGround = this.age - this.backWheel.lastCollisionAge < 0.1;
        const frontWheelOnGround = this.age - this.frontWheel.lastCollisionAge < 0.1;

        if (accelerate && backWheelOnGround) {
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

            this.momentum.position.x += sign * sdx * elapsed * 1000;
            this.momentum.position.y += sign * sdy * elapsed * 1000;
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
    }
}
