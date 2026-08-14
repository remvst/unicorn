class Ground extends Entity {

    constructor() {
        super();
        this.categories.push('ground');
        this.segments = new Cache();

        this.curve = new PerlinCurve({ plus: [
            new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 500, amplitude: 200 }),
            // new PerlinCurve({ step: 200, amplitude: 20 }),
        ], shiftY: 100 });
    }

    render() {
        const camera = firstItem(this.world.category('camera'));

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let x = camera.position.x - CANVAS_WIDTH / 2 ; x < camera.position.x + CANVAS_WIDTH / 2 ; x += 5) {
            ctx.lineTo(x, this.curveAt(x));
        }
        ctx.stroke();

        for (const seg of this.getSegments()) {
            seg.render();
        }
    }

    getSegments() {
        // TODO use the player as a ref
        const bike = firstItem(this.world.category('bike')) || firstItem(this.world.category('camera'));

        const stepX = 50;
        const window = 400;
        const refX = floorToNearest(bike.position.x, stepX);

        return this.segments.getOrCreate(
            floorToNearest(refX, stepX * 2),
            () => {
                const segments = [];
                for (let x = refX - window / 2 ; x < refX + window / 2 ; x += stepX) {
                    segments.push(new Segment(
                        { x: x, y : this.curveAt(x) },
                        { x: x- stepX, y : this.curveAt(x- stepX) },
                    ))
                }
                return segments;
            }
        );
    }

    curveAt(x) {
        return this.curve.yFor(x);
    }
}
