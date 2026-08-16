class Background extends Entity {

    constructor() {
        super();
        this.curves = [
            new PerlinCurve({ step: 1000, amplitude: 400 }),
            new PerlinCurve({ step: 1000, amplitude: 400 }),
        ];
    }

    render() {
        const camera = firstItem(this.world.category('camera'));

        for (let i = 0 ; i < this.curves.length ; i++) {
            const curve = this.curves[0];
            const parallaxFactor = interpolate(0.5, 0.75, i / (this.curves.length - 1));

            ctx.fillStyle = colorAsString(multiplyColor(0xff0000, parallaxFactor));
            // ctx.globalAlpha = parallaxFactor;
            ctx.beginPath();
            for (let s = -CANVAS_WIDTH / 2 ; s < CANVAS_WIDTH / 2 ; s += 10) {
                const drawX = camera.position.x + s;
                const sampleX = camera.position.x * parallaxFactor + s;
                const drawY = curve.yFor(sampleX) + camera.position.y * (1 - parallaxFactor);

                ctx.lineTo(drawX, drawY);
            }
            ctx.lineTo(camera.position.x + CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
            ctx.lineTo(camera.position.x - CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
            ctx.fill();
        }
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
