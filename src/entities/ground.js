class Ground extends Entity {

    constructor() {
        super();
        this.segments = new Cache();
    }

    render() {
        const camera = firstItem(this.world.category('camera'));

        ctx.strokeStyle = 'red';
        ctx.beginPath();
        for (let x = camera.x - CANVAS_WIDTH / 2 ; x < camera.x + CANVAS_WIDTH / 2 ; x += 5) {
            ctx.lineTo(x, Math.sin(x * PI * 2 / 200) * 100);
        }
        ctx.stroke();

        for (const seg of this.getSegments()) {
            seg.render();
        }
    }

    getSegments() {
        // TODO use the player as a ref
        const camera = firstItem(this.world.category('camera'));

        const stepX = 20;
        const window = 200;
        const ref = floorToNearest(camera.x, stepX);

        return this.segments.getOrCreate(
            floorToNearest(ref, stepX * 2),
            () => {
                const segments = [];
                for (let x = camera.x - window / 2 ; x < camera.x + window / 2 ; x += stepX) {
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
        return Math.sin(x * PI * 2 / 200) * 100;
    }
}
