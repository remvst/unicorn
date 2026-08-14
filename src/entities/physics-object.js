class PhysicsObject extends Entity {
    constructor() {
        super();
        this.rotation = 0;
        this.hitboxes = [];

        this.lastBackWheelOnGround = 0;
        this.lastBackWheelSegment = null;

        this.momentum = {
            position: {x: 0, y: 0},
            rotation: 0,
        };
    }

    addHitbox() {
        const hitbox = new Hitbox();
        this.hitboxes.push(hitbox);
        return hitbox;
    }

    absolute(relativeHitbox, out) {
        const relativeAngle = Math.atan2(relativeHitbox.position.y, relativeHitbox.position.x);
        const relativeDist = Math.hypot(relativeHitbox.position.x, relativeHitbox.position.y);

        out.position.x = this.position.x + Math.cos(relativeAngle + this.rotation) * relativeDist;
        out.position.y = this.position.y + Math.sin(relativeAngle + this.rotation) * relativeDist;
        out.radius = relativeHitbox.radius;
        return out;
    }

    gravityCenter(hitboxes, out) {
        out.x = 0;
        out.y = 0;

        for (const hb of hitboxes) {
            out.x += hb.position.x / hitboxes.length;
            out.y += hb.position.y / hitboxes.length;
        }

        return out;
    }

    avgAngleToPoint(hitboxes, point) {
        let avg = 0;
        for (const hb of hitboxes) { // TODO maybe reduce
            avg += Math.atan2(
                hb.position.y - point.y,
                hb.position.x - point.x,
            ) / hitboxes.length;
        }
        return avg;
    }

    cycle(elapsed) {
        // let x = 0;
        // let y = 0;
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

        // TODO brakes
        // if (down['ArrowDown']) y = 1;

        this.position.x += this.momentum.position.x * elapsed * 50;
        this.position.y += this.momentum.position.y * elapsed * 50;

        // Friction
        // TODO only add friction if on the ground
        if (!accelerate) {
            this.momentum.position.x += -Math.sign(this.momentum.position.x) * Math.min(
                Math.abs(this.momentum.position.x),
                elapsed * 1,
            );
        }

        // if (!raiseWheel && !lowerWheel) {
        //     this.momentum.rotation += -Math.sign(this.momentum.rotation) * Math.min(
        //         Math.abs(this.momentum.rotation),
        //         elapsed * Math.PI * 4,
        //     );
        //     // this.momentum.rotation += elapsed * Math.PI * 4;
        // }

        // Gravity
        this.momentum.position.y += elapsed * 10;

        this.rotation += this.momentum.rotation * elapsed;

        const reusableHitbox = new Hitbox();

        const absolutes = this.hitboxes.map((hb) => this.absolute(hb, new Hitbox()));

        const avgBefore = this.gravityCenter(absolutes, { x: 0, y: 0 });
        const avgAngleToCenterBefore = this.avgAngleToPoint(absolutes, avgBefore);

        // Readjust all the hitboxes
        let readjustmentCount = 0;
        for (let i = 0 ; i < this.hitboxes.length ; i++) {
            const absolute = this.absolute(this.hitboxes[i], absolutes[i]);

            for (const seg of this.segments()) {
                if (!seg.collidesWith(absolute)) continue;
                const readjusted = seg.readjust(absolute, { x: 0, y: 0 });
                absolute.position.x += readjusted.x;
                absolute.position.y += readjusted.y;
                readjustmentCount++;

                if (i === 1) {
                    this.lastBackWheelOnGround = this.age;
                    this.lastBackWheelSegment = seg;
                }
            }
        }

        const avgAfter = this.gravityCenter(absolutes, { x: 0, y: 0 });

        const avgAngleToCenterAfter = this.avgAngleToPoint(absolutes, avgBefore);

        // Apply readjustments
        this.position.x += avgAfter.x - avgBefore.x;
        this.position.y += avgAfter.y - avgBefore.y;
        this.rotation += normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore);
        // console.log(avgAngleToCenterAfter - avgAngleToCenterBefore);

        if (Math.abs(normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore)) > Math.PI / 2) {
            console.error('boom');
        }

        const deltaAngle = normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore);

        const dx = avgAfter.x - avgBefore.x;
        const dy = avgAfter.y - avgBefore.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0.001) {
            const nx = dx / len;
            const ny = dy / len;
            const linearProj = this.momentum.position.x * nx + this.momentum.position.y * ny;
            if (linearProj < 0) {
                this.momentum.position.x -= linearProj * nx;
                this.momentum.position.y -= linearProj * ny;

                if (Math.abs(deltaAngle) > 0.0001 && !raiseWheel && !lowerWheel) {
                    const na = Math.sign(deltaAngle);
                    const rotProj = this.momentum.rotation * na;
                    if (rotProj < 0) this.momentum.rotation -= rotProj * na;
                    this.momentum.rotation += na * (-linearProj) * 0.8;
                }
            }
        }

        // if (
        //     readjustmentCount === this.hitboxes.length &&
        //     avgAfter.y - avgBefore.y
        // ) {
        //     // TODO readjust, this ain't gr8
        //     this.momentum.position.y = 0;
        //     console.log('land');
        //     // this.momentum.rotation *= 0.5;
        // } else if (readjustmentCount > 0) {
        //     // this.momentum.position.y = avgAfter.y - avgBefore.y;
        //     // console.log(this.momentum.position.y);
        // }
    }

    render() {
        // Hitboxes
        ctx.wrap(() => {
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#f00';
            ctx.fillRect(-5, -5, 10, 10);

            let color = ['#f00', '#00f']
            for (const hb of this.hitboxes) {
                ctx.save();
                ctx.translate(hb.position.x, hb.position.y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = color.shift();
                ctx.beginPath();
                ctx.arc(0, 0, hb.radius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.restore();
            }
        });

        // Orientation
        ctx.wrap(() => {
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + Math.cos(this.rotation) * 50, this.position.y + Math.sin(this.rotation) * 50);
            ctx.stroke();
        });

        const reusableHitbox = new Hitbox();

        let totalAddedAngle = 0;

        for (const hb of this.hitboxes) {
            const absolute = this.absolute(hb, reusableHitbox);

            const angleBefore = Math.atan2(absolute.y, absolute.x);

            ctx.strokeStyle = '#0f0';

            for (const seg of this.segments()) {
                if (seg.collidesWith(absolute)) {
                    ctx.strokeStyle = '#f00';

                    const readjusted = seg.readjust(absolute, {x: 0, y: 0});
                    absolute.position.x += readjusted.x;
                    absolute.position.y += readjusted.y;
                }
            }

            const angleAfter = Math.atan2(absolute.y, absolute.x);
            totalAddedAngle += angleAfter - angleBefore;

            // ctx.save();
            // ctx.translate(absolute.position.x, absolute.position.y);
            // ctx.lineWidth = 2;
            // ctx.beginPath();
            // ctx.arc(0, 0, absolute.radius, 0, 2 * Math.PI);
            // ctx.stroke();
            // ctx.restore();
        }
    }

    * segments() {
        for (const ground of this.world.category('ground')) {
                yield* ground.getSegments()
        }
    }
}
