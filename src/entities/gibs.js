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
        this.position = { ...bike.position };
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
            hb.position = { ...pt };
        }
    }
}

class WheelGib extends Gib {
    constructor(bike, wheel) {
        super();

        this.position = { ...wheel.absolute.position };
        this.momentum.position = { ...bike.momentum.position };
        this.momentum.rotation = bike.momentum.rotation;

        const hb = this.addHitbox();
        hb.radius = wheel.radius;

        this.renderable = new SkeletonRenderable()
            .add(
                setColor('#000'),
                setThickness(4),
                circleRenderable(hb.position, hb.radius),
            );
    }
}
