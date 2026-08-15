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

    hasCollision(hitbox, delay = 0.1) {
        return this.age - hitbox.lastCollisionAge <= delay;
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

        // Cap the substep duration so a fast-moving hitbox can't cross more than (roughly) its
        // own radius in one physics step, which is what would let it tunnel through a segment.
        // Using a fixed safety margin (the smallest hitbox radius) rather than the live distance
        // to the nearest segment keeps the substep count a function of speed alone - resting on
        // a segment (distance ~0) no longer explodes it, which is what made time-scaled momentum
        // updates elsewhere in the class behave inconsistently.
        const safeDist = Math.min(...this.hitboxes.map((hb) => hb.radius)) / 4;

        // A hitbox's actual speed through the world is its linear speed plus its tangential
        // speed from rotation (omega * distance from origin). Ignoring the rotational part
        // underestimates speed for hitboxes far from the origin (e.g. the back wheel) during
        // fast spins (flips), letting them tunnel through segments despite the cap above.
        const maxHitboxDist = Math.max(...this.hitboxes.map((hb) => pointDistance(0, 0, hb.position.x, hb.position.y)));
        const speed = pointDistance(0, 0, this.momentum.position.x, this.momentum.position.y)
            + Math.abs(this.momentum.rotation) * maxHitboxDist;
        const step = speed > 0 ? safeDist / speed : elapsed;

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

        const absolutes = this.hitboxes.map((hb) => this.absolute(hb, (hb.absolute ??= new Hitbox())));

        const avgBefore = this.gravityCenter(absolutes, { x: 0, y: 0 });
        const avgAngleToCenterBefore = this.avgAngleToPoint(absolutes, avgBefore);

        const RESOLVE_PASSES = 5;
        for (let pass = 0 ; pass < RESOLVE_PASSES ; pass++) {
            let anyCollision = false;

            for (let i = 0 ; i < this.hitboxes.length ; i++) {
                const hitbox = this.hitboxes[i];
                const absolute = absolutes[i];

                for (const segment of this.segments()) {
                    if (!segment.collidesWith(absolute)) continue;
                    anyCollision = true;

                    const readjusted = segment.readjust(absolute, { x: 0, y: 0 });
                    absolute.position.x += readjusted.x;
                    absolute.position.y += readjusted.y;

                    hitbox.lastCollisionAge = this.age;
                    hitbox.lastCollisionSegment = segment;
                }
            }

            if (!anyCollision) break;
        }

        const avgAfter = this.gravityCenter(absolutes, { x: 0, y: 0 });

        const avgAngleToCenterAfter = this.avgAngleToPoint(absolutes, avgBefore);

        // Apply readjustments
        this.position.x += avgAfter.x - avgBefore.x;
        this.position.y += avgAfter.y - avgBefore.y;

        // Disable this line for now as it seems to make the physics less glitchy
        // this.rotation += normalizeAngle(avgAngleToCenterAfter - avgAngleToCenterBefore);

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
                    const ROTATION_TRANSFER = 0.016 / 2;
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
            yield* ground.getSegments(this);
        }
    }
}
