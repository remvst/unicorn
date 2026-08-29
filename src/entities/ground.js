class Ground extends Entity {

    constructor() {
        super();
        this.curve = new PerlinCurve({});
    }

    render() {
        const camera = firstItem(this.world.category(Camera));

        ctx.fillStyle = '#88ca9f';
        ctx.beginPath();
        xSweep(
            this.world,
            GROUND_CURVE_STEP,
            ({ x, groundY }) => ctx.lineTo(x, groundY),
        );
        ctx.lineTo(camera.position.x + CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
        ctx.lineTo(camera.position.x - CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
        ctx.fill();

        if (DEBUG) {
            // for (const x of this.curve.peaks(camera.position.x - CANVAS_WIDTH / 2, camera.position.x + CANVAS_WIDTH / 2)) {
            //     ctx.fillStyle = '#f0f';
            //     ctx.fillRect(x, this.curveAt(x) - 50, 2, 100);
            // }

            // for (const x of this.curve.valleys(camera.position.x - CANVAS_WIDTH / 2, camera.position.x + CANVAS_WIDTH / 2)) {
            //     ctx.fillStyle = '#ff0';
            //     ctx.fillRect(x, this.curveAt(x) - 50, 2, 100);
            // }
        }
    }

    curveAt(x) {
        return this.curve.yFor(x);
    }
}
