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

    }

    cycle(elapsed) {
        const raiseWheel = downKeys[37];
        const lowerWheel = downKeys[39];
        const accelerate = downKeys[38];

        // Backflip/frontflip
        if (raiseWheel) this.momentum.rotation -= elapsed * Math.PI * 2;
        if (lowerWheel) this.momentum.rotation += elapsed * Math.PI * 2;

        const momentumRotationBefore = this.momentum.rotation;

        super.cycle(elapsed);

        if (accelerate && this.age - this.backWheel.lastCollisionAge < 0.1) {
            // TODO check that the back wheel is in contact with the ground
            // TODO momentum should be based off the curve of the ground
            // TODO update rotation momentum as well

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

            this.momentum.position.x += sign * sdx * elapsed * 20;
            this.momentum.position.y += sign * sdy * elapsed * 20;
        }

        // Friction
        // TODO only add friction if on the ground
        if (!accelerate) {
            this.momentum.position.x += -Math.sign(this.momentum.position.x) * Math.min(
                Math.abs(this.momentum.position.x),
                elapsed * 1,
            );
        }

        if (raiseWheel || lowerWheel) {
            this.momentum.rotation = momentumRotationBefore;
        }
    }
}
