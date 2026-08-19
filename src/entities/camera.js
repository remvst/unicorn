class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
        this.zoom = 1;
        this.offset = { x: 0.3, y: 0 };
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const player = firstItem(this.world.category('bike'));
        if (!player) return;

        this.position.x = player.position.x + CANVAS_WIDTH * this.offset.x / this.zoom;
        this.position.y = player.position.y + CANVAS_HEIGHT * this.offset.y / this.zoom;
    }

    render(elapsed) {
        if (DEBUG) {
            // ctx.fillStyle = '#fff';
            // ctx.fillRect(this.position.x, this.position.y, 10, 10);
        }
    }
}
