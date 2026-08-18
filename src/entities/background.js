class Background extends Entity {

    constructor() {
        super();
        this.curve = new PerlinCurve({ step: 400, amplitude: 400 });

        this.gradient = ctx.createLinearGradient(0, CANVAS_HEIGHT, CANVAS_WIDTH, 0);
        this.gradient.addColorStop(0, '#aba3da');
        this.gradient.addColorStop(0.5, '#d862a9');
        this.gradient.addColorStop(1, '#da88cc');
    }

    render() {
        const camera = firstItem(this.world.category('camera'));

        ctx.fillStyle = this.gradient;
        ctx.wrap(() => {
            ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2)
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        });

        for (let i = 0 ; i < BACKGROUND_CURVE_COUNT ; i++) {
            const parallaxFactor = interpolate(0.5, 0.75, i / (BACKGROUND_CURVE_COUNT - 1));

            ctx.fillStyle = colorAsString(multiplyColor(0xbab6f3, parallaxFactor));
            ctx.beginPath();

            const { centerX: layerCameraX, toScreenX, toScreenY } = parallaxLayer(camera, parallaxFactor);

            xSweep(
                this.world,
                BACKGROUND_CURVE_STEP,
                ({ x: sampleX }) => ctx.lineTo(
                    toScreenX(sampleX),
                    toScreenY(this.curve.yFor(
                        sampleX +
                            i * CANVAS_WIDTH // Add an offset so the curves don't line up
                    )),
                ),
                ({ x: sampleX }) => ctx.lineTo(toScreenX(sampleX), camera.position.y + CANVAS_HEIGHT / 2),
                layerCameraX,
            );

            ctx.fill();
        }
    }
}

parallaxLayer = (camera, factor) => ({
    centerX: camera.position.x * factor,
    toScreenX: x => x + camera.position.x * (1 - factor),
    toScreenY: y => y + camera.position.y * (1 - factor),
});

xSweep = (
    world,
    step,
    forward,
    backward,
    centerX, // Sweep is grid-aligned around this x instead of the camera, e.g. for parallax layers
) => {
    const ground = firstItem(world.category('ground'));
    const camera = firstItem(world.category('camera'));
    const opts = { ground, camera };

    centerX ??= camera.position.x;

    for (
        let x = floorToNearest(centerX - CANVAS_WIDTH / 2, step) ;
        x < centerX + CANVAS_WIDTH / 2 + step ;
        x += step
    ) {
        opts.x = x;
        opts.groundY = ground.curveAt(x);
        forward(opts);
    }
    for (
        let x = ceilToNearest(centerX + CANVAS_WIDTH / 2, step) ;
        x > centerX - CANVAS_WIDTH / 2 - step ;
        x -= step
    ) {
        opts.x = x;
        opts.groundY = ground.curveAt(x);
        backward(opts);
    }
}

function multiplyColor(color, factor) {
    const [r, g, b] = getRGB(color);
    return buildColor(r * factor, g * factor, b * factor);
}

function getRGB(color) {
    return [
        (color >> (8 * 2)) % 256,
        (color >> (8 * 1)) % 256,
        (color >> (8 * 0)) % 256,
    ];
}


function buildColor(r, g, b) {
    r = min(r, 255);
    g = min(g, 255);
    b = min(b, 255);

    return (r << (8 * 2)) | (g << (8 * 1)) | (b << (8  * 0));
}

function colorAsString(color) {
    return '#' + color.toString(16).padStart(6, '0');
}
