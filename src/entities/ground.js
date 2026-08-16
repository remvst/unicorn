class Ground extends Entity {

    constructor() {
        super();
        this.categories.push('ground');
        this.segments = new Cache();

        this.curve = new PerlinCurve({ plus: [
            new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 500, amplitude: 200 }),
            // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ], multiplier: x => between(0, linear(x / 1000), 1) });
    }

    render() {
        const camera = firstItem(this.world.category('camera'));

        ctx.fillStyle = 'red';
        ctx.beginPath();
        for (let x = camera.position.x - CANVAS_WIDTH / 2 ; x < camera.position.x + CANVAS_WIDTH / 2 + GROUND_CURVE_STEP ; x += GROUND_CURVE_STEP) {
            ctx.lineTo(x, this.curveAt(x));
        }
        ctx.lineTo(camera.position.x + CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
        ctx.lineTo(camera.position.x - CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
        ctx.fill();

        if (DEBUG) {
            // for (const x of this.peaks(camera.position.x - CANVAS_WIDTH / 2, camera.position.x + CANVAS_WIDTH / 2)) {
            //     ctx.fillStyle = '#f0f';
            //     ctx.fillRect(x, this.curveAt(x) - 50, 2, 100);
            // }

            // for (const x of this.valleys(camera.position.x - CANVAS_WIDTH / 2, camera.position.x + CANVAS_WIDTH / 2)) {
            //     ctx.fillStyle = '#ff0';
            //     ctx.fillRect(x, this.curveAt(x) - 50, 2, 100);
            // }
        }
    }

    curveAt(x) {
        return this.curve.yFor(x);
    }

    * peaks(fromX, toX) {
        yield* this.slopeChanges(fromX, toX, 1);
    }

    * valleys(fromX, toX) {
        yield* this.slopeChanges(fromX, toX, -1);
    }

    * slopeChanges(fromX, toX, sign) {
        const step = 5;
        let slopeBefore = 0;
        for (let x = fromX ; x < toX ; x += step) {
            const slope = Math.sign(this.curveAt(x) - this.curveAt(x - step));

            if (slope !== slopeBefore && slope === sign) {
                yield x;
            }

            slopeBefore = slope;
        }
    }
}
