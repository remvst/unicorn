class Camera extends Entity {
    constructor() {
        super();
        this.zoom = 1;
        this.offset = { x: 0.3, y: 0 };
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const target = firstItem(this.world.category(Bike));
        if (target) {
            target.cycle(0); // Cheat to force the camera to be locked
            this.position.x = target.position.x + CANVAS_WIDTH * this.offset.x / this.zoom;
            this.position.y = target.position.y + CANVAS_HEIGHT * this.offset.y / this.zoom;
        }
    }

    render(elapsed) {
        if (DEBUG) {
            // ctx.fillStyle = '#fff';
            // ctx.fillRect(this.position.x, this.position.y, 10, 10);
        }
    }
}
