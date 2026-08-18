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

        // Background color
        ctx.fillStyle = this.gradient;
        ctx.wrap(() => {
            ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2)
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        });

        const { rng } = this;

        const {
            centerX: layerCameraX,
            centerY: layerCameraY,
            toScreenX,
            toScreenY,
        } = parallaxLayer(camera, 0.1);

        // Stars
        surfaceSweep(
            this.world,
            this.rng,
            100,
            ({ x, y }) => {
                const period = interpolate(2, 4, this.rng.floating());
                const s = this.rng.floating();
                ctx.globalAlpha = interpolate(
                    s / 4,
                    s / 2,
                    sin(this.rng.floating() + this.age * PI * 2 / period) / 2 + 0.5
                );
                ctx.fillStyle = '#fff';
                ctx.translate(toScreenX(x), toScreenY(y));
                ctx.scale(s, s);
                starShape(4, 20, 2);
                ctx.fill();
            },
            layerCameraX,
            layerCameraY,
        );

        // Background parallaxes
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
    centerY: camera.position.y * factor,
    toScreenX: x => x + camera.position.x * (1 - factor),
    toScreenY: y => y + camera.position.y * (1 - factor),
});

// NOTE: opts.x/opts.y/opts.groundY are in the sweep's own space (centerX/centerY),
// *before* any parallax offset. A populate() drawing at a parallaxed screen position
// (e.g. via parallaxLayer's toScreenX/toScreenY) should re-sample groundY at that
// screen x itself if it needs to line up with the real ground, rather than trust
// opts.groundY (which is only accurate for factor=1, un-parallaxed callers).
surfaceSweep = (
    world,
    rng,
    density,
    populate,
    centerX,
    centerY,
) => {
    const ground = firstItem(world.category('ground'));
    const camera = firstItem(world.category('camera'));
    const opts = { ground, camera };

    centerX ??= camera.position.x;
    centerY ??= camera.position.y;

    const fromTileX = floorToNearest(centerX - CANVAS_WIDTH / 2, CANVAS_WIDTH);
    const fromTileY = floorToNearest(centerY - CANVAS_HEIGHT / 2, CANVAS_HEIGHT);
    const toTileX = centerX + CANVAS_WIDTH / 2;
    const toTileY = centerY + CANVAS_HEIGHT / 2;

    for (let tileX = fromTileX ; tileX < toTileX ; tileX += CANVAS_WIDTH) {
        for (let tileY = fromTileY ; tileY < toTileY ; tileY += CANVAS_HEIGHT) {
            rng.reset();

            for (let i = 0 ; i < density ; i++) {
                opts.x = tileX + rng.floating() * CANVAS_WIDTH;
                opts.y = tileY + rng.floating() * CANVAS_HEIGHT;
                opts.groundY = ground.curveAt(opts.x);
                ctx.wrap(() => populate(opts));
            }
        }
    }
}

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
        backward && x > centerX - CANVAS_WIDTH / 2 - step ;
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
