class Bike extends PhysicsObject {
    constructor() {
        super();

        this.categories.push('bike');

        // TODO
        // this.lastBackWheelOnGround = 0;
        // this.lastBackWheelSegment = null;

        const frontWheel = this.addHitbox();
        frontWheel.position.x = 20;
        frontWheel.radius = 10;

        const backWheel = this.addHitbox();
        backWheel.position.x = -20;
        backWheel.radius = 10;

        const head = this.addHitbox();
        head.position.y = -20;
        head.radius = 5;

    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const raiseWheel = downKeys[37];
        const lowerWheel = downKeys[39];
        const accelerate = downKeys[38];

        if (raiseWheel) this.momentum.rotation -= elapsed * Math.PI * 2;
        if (lowerWheel) this.momentum.rotation += elapsed * Math.PI * 2;
        if (accelerate && this.age - this.lastBackWheelOnGround < 0.1) {
            // TODO check that the back wheel is in contact with the ground
            // TODO momentum should be based off the curve of the ground
            // TODO update rotation momentum as well

            // Base momentum off the curve
            let sdx = this.lastBackWheelSegment.p2.x - this.lastBackWheelSegment.p1.x;
            let sdy = this.lastBackWheelSegment.p2.y - this.lastBackWheelSegment.p1.y;
            // Force direction to always point rightward
            if (sdx < 0) { sdx = -sdx; sdy = -sdy; }
            const slen = Math.hypot(sdx, sdy);
            sdx /= slen; sdy /= slen;

            // Cross product: positive means wheel is below the segment (ceiling contact)
            const backWheel = this.absolute(this.hitboxes[1], new Hitbox());
            const cross = sdx * (backWheel.position.y - this.lastBackWheelSegment.p1.y)
                        - sdy * (backWheel.position.x - this.lastBackWheelSegment.p1.x);
            const sign = cross > 0 ? -1 : 1;

            this.momentum.position.x += sign * sdx * elapsed * 20;
            this.momentum.position.y += sign * sdy * elapsed * 20;
        }
    }
}
