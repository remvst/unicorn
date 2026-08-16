class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
        this.zoom = 1;
        this.offset = 0.3;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const player = firstItem(this.world.category('bike'));
        if (!player) return;

        this.position.x = player.position.x + CANVAS_WIDTH * this.offset / this.zoom;
        this.position.y = player.position.y;
    }

    render(elapsed) {
        if (DEBUG) {
            // ctx.fillStyle = '#fff';
            // ctx.fillRect(this.position.x, this.position.y, 10, 10);
        }
    }
}
