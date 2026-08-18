class Gib extends PhysicsObject {
    render() {
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        this.renderable.render();

        if (DEBUG_COLLISIONS) super.render();
    }
}

class BikeGib extends Gib {
    constructor(
        bike
    ) {
        super();
        this.position.x = bike.position.x;
        this.position.y = bike.position.y;
        this.rotation = bike.rotation;
        this.momentum.position.x = bike.momentum.position.x / 4;
        this.momentum.position.y = bike.momentum.position.y / 4;
        this.momentum.rotation = bike.momentum.rotation / 4;
        this.renderable = new BikeRenderable(bike, false);

        for (const pt of [
            this.renderable.seatBase,
            this.renderable.handlebarsTop,
            bike.backWheel.position,
            bike.frontWheel.position,
        ]) {
            const hb = this.addHitbox();
            hb.radius = 1;
            hb.position.x = pt.x;
            hb.position.y = pt.y;
        }
    }
}

class WheelGib extends Gib {
    constructor(bike, wheel) {
        super();

        this.position.x = wheel.absolute.position.x;
        this.position.y = wheel.absolute.position.y;
        this.momentum.position.x = bike.momentum.position.x;
        this.momentum.position.y = bike.momentum.position.y;

        const hb = this.addHitbox();
        hb.radius = wheel.radius;

        this.renderable = new SkeletonRenderable()
            .add(setThickness(4))
            .add(circleRenderable(hb.position, hb.radius));
    }
}
