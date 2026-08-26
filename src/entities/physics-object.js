reusablePoints = [];

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
        const relativeAngle = atan2(relativeHitbox.position.y, relativeHitbox.position.x);
        const relativeDist = hypot(relativeHitbox.position.x, relativeHitbox.position.y);

        out.position.x = this.position.x + cos(relativeAngle + this.rotation) * relativeDist;
        out.position.y = this.position.y + sin(relativeAngle + this.rotation) * relativeDist;
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
            avg += atan2(
                hb.position.y - point.y,
                hb.position.x - point.x,
            ) / hitboxes.length;
        }
        return avg;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const safeDist = min(...this.hitboxes.map((hb) => hb.radius)) / 2;
        const maxHitboxDist = max(...this.hitboxes.map((hb) => pointDistance(0, 0, hb.position.x, hb.position.y)));
        const speed = pointDistance(0, 0, this.momentum.position.x, this.momentum.position.y)
            + abs(this.momentum.rotation) * maxHitboxDist;
        const step = speed > 0 ? safeDist / speed : elapsed;

        let remaining = elapsed;
        while (remaining > 0) {
            const rem = min(remaining, step);
            remaining -= rem;
            this.cycleUnsafe(rem);
        }
    }

    cycleUnsafe(elapsed) {
        // Sketchy util so we don't keep creating points in memory
        let reusableIndex = 0;
        function reusablePt() {
            while (reusableIndex >= reusablePoints.length) reusablePoints.push({});
            const pt = reusablePoints[reusableIndex++];
            pt.x = 0;
            pt.y = 0;
            return pt;
        }

        // Momentum
        this.position.x += this.momentum.position.x * elapsed;
        this.position.y += this.momentum.position.y * elapsed;
        this.rotation += this.momentum.rotation * elapsed;

        // Gravity
        this.momentum.position.y += elapsed * 500;

        const absolutes = this.hitboxes.map((hb) => this.absolute(hb, (hb.absolute ??= new Hitbox())));

        const avgBefore = this.gravityCenter(absolutes, reusablePt());
        const avgAngleToCenterBefore = this.avgAngleToPoint(absolutes, avgBefore);

        for (let pass = 0 ; pass < COLLISION_RESOLVE_PASSES ; pass++) {
            let anyCollision = false;

            for (let i = 0 ; i < this.hitboxes.length ; i++) {
                const hitbox = this.hitboxes[i];
                const absolute = absolutes[i];

                for (const segment of this.segments()) {
                    if (!segment.collidesWith(absolute)) continue;
                    anyCollision = true;

                    const readjusted = segment.readjust(absolute, reusablePt());
                    absolute.position.x += readjusted.x;
                    absolute.position.y += readjusted.y;

                    hitbox.lastCollisionAge = this.age;
                    hitbox.lastCollisionSegment = segment;
                }
            }

            if (!anyCollision) break;
        }

        const avgAfter = this.gravityCenter(absolutes, reusablePt());

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

                if (abs(readjustmentAngle) > 0.0001) {
                    const na = sign(readjustmentAngle);
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
        if (!DEBUG_COLLISIONS) return;

        // Hitboxes
        ctx.wrap(() => {
            ctx.translate(this.position.x, this.position.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#f00';
            ctx.fillRect(-1, -1, 2, 2);

            let color = ['#f00', '#00f', '#ff0']
            for (const hb of this.hitboxes) {
                ctx.save();
                ctx.translate(hb.position.x, hb.position.y);
                ctx.lineWidth = 2;
                ctx.strokeStyle = color.shift();
                ctx.beginPath();
                ctx.arc(0, 0, hb.radius, 0, 2 * PI);
                ctx.stroke();
                ctx.restore();
            }
        });

        ctx.wrap(() => {
            for (const seg of this.segments()) {
                seg.render();
            }
        });

        // Orientation
        ctx.wrap(() => {
            return;
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(this.rotation) * 50, this.position.y + sin(this.rotation) * 50);
            ctx.stroke();
        });
    }

    * segments() {
        this.segmentsCache ||= new Cache();

        for (const ground of this.world.category(Ground)) {
            const stepX = 20;
            const window = 400;
            const refX = floorToNearest(this.position.x, stepX);

            yield* this.segmentsCache.getOrCreate(
                floorToNearest(refX, window / 4),
                () => {
                    const segments = [];
                    for (let x = refX - window / 2 ; x < refX + window / 2 ; x += stepX) {
                        segments.push(new Segment(
                            { x: x, y: ground.curveAt(x) },
                            { x: x - stepX, y: ground.curveAt(x- stepX) },
                        ))
                    }
                    return segments;
                }
            );
        }
    }
}
