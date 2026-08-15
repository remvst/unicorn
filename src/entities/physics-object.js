class PhysicsObject extends Entity {
    constructor() {
        super();
        this.rotation = 0;
        this.hitboxes = [];

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
        super.cycle(elapsed);

        // Find the closest point-to-segment distance, accounting for hitbox radius,
        // across every hitbox and every segment in the world.
        let distanceToClosestSegment = Infinity;
        for (const hb of this.hitboxes) {
            const absolute = this.absolute(hb, new Hitbox());
            for (const segment of this.segments()) {
                const dist = segment.distanceTo(absolute.position) - absolute.radius;
                if (dist < distanceToClosestSegment) distanceToClosestSegment = dist;
            }
        }

        const speed = pointDistance(0, 0, this.momentum.position.x, this.momentum.position.y);
        const maxDist = distanceToClosestSegment / 2;

        // Determine what the max step that can be used to run the physics simulation without any risk:
        // cap substeps so the object can't travel further than maxDist (and therefore can't tunnel
        // through the closest segment) within a single cycleUnsafe call. MIN_STEP guards against
        // getting stuck when maxDist is already <= 0 (e.g. already overlapping a segment).
        const MIN_STEP = 1 / 1000;
        const step = (speed > 0 && isFinite(maxDist)) ? Math.max(maxDist / speed, MIN_STEP) : elapsed;

        let remaining = elapsed;
        while (remaining > 0) {
            const rem = Math.min(remaining, step);
            remaining -= rem;
            this.cycleUnsafe(rem);
        }
    }

    cycleUnsafe(elapsed) {
        // Momentum
        this.position.x += this.momentum.position.x * elapsed;
        this.position.y += this.momentum.position.y * elapsed;
        this.rotation += this.momentum.rotation * elapsed;

        // Gravity
        this.momentum.position.y += elapsed * 500;

        const reusableHitbox = new Hitbox();

        const absolutes = this.hitboxes.map((hb) => this.absolute(hb, new Hitbox()));

        const avgBefore = this.gravityCenter(absolutes, { x: 0, y: 0 });
        const avgAngleToCenterBefore = this.avgAngleToPoint(absolutes, avgBefore);

        // Readjust all the hitboxes
        for (let i = 0 ; i < this.hitboxes.length ; i++) {
            const hitbox = this.hitboxes[i];
            const absolute = this.absolute(hitbox, absolutes[i]);

            for (const segment of this.segments()) {
                if (!segment.collidesWith(absolute)) continue;
                const readjusted = segment.readjust(absolute, { x: 0, y: 0 });
                absolute.position.x += readjusted.x;
                absolute.position.y += readjusted.y;

                hitbox.lastCollisionAge = this.age;
                hitbox.lastCollisionSegment = segment;
            }
        }

        const avgAfter = this.gravityCenter(absolutes, { x: 0, y: 0 });

        // Continuous gravity torque: an unsupported center of mass keeps generating a
        // toppling torque every instant it isn't directly above the pivot(s) currently
        // touching a segment, independent of any impact happening this instant. This is
        // what makes a wheelie eventually fall back down even while resting motionless
        // (the linearProj-based conversion below only fires when momentum is actively
        // being cancelled, which is ~0 while at rest).
        let pivotX = null;
        let pivotCount = 0;
        for (let i = 0 ; i < this.hitboxes.length ; i++) {
            if (this.hitboxes[i].lastCollisionAge !== this.age) continue;
            pivotX = (pivotX || 0) + absolutes[i].position.x;
            pivotCount++;
        }
        if (pivotCount > 0) {
            const GRAVITY_TORQUE = 0.08; // rad/s^2 per pixel of imbalance; tune to taste
            this.momentum.rotation += (avgAfter.x - pivotX / pivotCount) * GRAVITY_TORQUE * elapsed;
        }

        const avgAngleToCenterAfter = this.avgAngleToPoint(absolutes, avgBefore);

        // Apply readjustments
        this.position.x += avgAfter.x - avgBefore.x;
        this.position.y += avgAfter.y - avgBefore.y;
        this.rotation += normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore);

        const readjustmentAngle = normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore);

        const dx = avgAfter.x - avgBefore.x;
        const dy = avgAfter.y - avgBefore.y;
        const readjustmentDistance = hypot(dx, dy);
        if (readjustmentDistance > 0.001) {
            const nx = dx / readjustmentDistance;
            const ny = dy / readjustmentDistance;
            const linearProj = this.momentum.position.x * nx + this.momentum.position.y * ny;
            if (linearProj < 0) {
                this.momentum.position.x -= linearProj * nx;
                this.momentum.position.y -= linearProj * ny;

                if (Math.abs(readjustmentAngle) > 0.0001) {
                    const na = Math.sign(readjustmentAngle);
                    const rotProj = this.momentum.rotation * na;
                    if (rotProj < 0) this.momentum.rotation -= rotProj * na;

                    // linearProj is a velocity being cancelled outright this instant (see above:
                    // it's subtracted with no elapsed scaling), so its conversion into rotation
                    // must use a fixed coefficient too. Scaling by `elapsed` here would make the
                    // torque shrink with the substep size instead of the frame's real elapsed time
                    // (substep count depends on how close to a segment we are, not on gameplay).
                    const ROTATION_TRANSFER = 0.016;
                    this.momentum.rotation += na * (-linearProj) * ROTATION_TRANSFER;
                }
            }
        }
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
