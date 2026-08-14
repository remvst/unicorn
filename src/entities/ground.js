class Ground extends Entity {

    constructor() {
        super();
        this.categories.push('ground');
        this.segments = new Cache();
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
        const bike = firstItem(this.world.category('bike'));

        const stepX = 20;
        const window = 200;
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
        return x > 100 && x < 500 ? 200 : Math.sin(x * PI * 2 / 400) * 50 + 100;
    }
}
