class Camera extends Entity {

    extraOffsetY = 0;
    zoom = 1;

    constructor() {
        super();
        this.offset = { x: 0.3, y: 0 };
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const target = firstItem(this.world.category(Bike));
        if (target) {
            target.cycle(0); // Cheat to force the camera to be locked

            const ground = firstItem(this.world.category(Ground));
            const altitude = ground.curveAt(target.position.x) - target.position.y;
            this.extraOffsetY += (interpolate(0, 0.8, altitude / 2000) - this.extraOffsetY) * elapsed * 4;

            this.position.x = target.position.x + CANVAS_WIDTH * this.offset.x / this.zoom;
            this.position.y = target.position.y + CANVAS_HEIGHT * (this.extraOffsetY + this.offset.y) / this.zoom;
        }
    }

    render(elapsed) {
        if (DEBUG) {
            const target = firstItem(this.world.category(Bike));
            if (!target) return;

            ctx.fillStyle = '#0f0';
            ctx.fillRect(this.position.x - CANVAS_WIDTH / 2, this.position.y, CANVAS_WIDTH, 1);

            ctx.fillStyle = '#00f';
            ctx.fillRect(this.position.x - CANVAS_WIDTH / 2, target.position.y, CANVAS_WIDTH, 1);
        }
    }
}
