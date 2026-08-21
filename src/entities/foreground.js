GRASS_COLORS = [
    0.8,
    0.7,
    0.6,
].map(r => colorAsString(multiplyColor(0x88ca9f, r)));

class Foreground extends Entity {

    constructor() {
        super();

        // TODO can probably avoid creating multiple perlin curves honestly
        this.curve = new PerlinCurve({ step: 1000, amplitude: 400 });
        this.pathCurve = new PerlinCurve({ step: 500, amplitude: 400 });
    }

    render() {
        const camera = firstItem(this.world.category(Camera));

        const ground = firstItem(this.world.category(Ground));
        const { curve } = ground;

        // Path
        ctx.fillStyle = '#d0c090';
        ctx.beginPath();
        xSweep(
            this.world,
            20,
            ({ x, groundY }) => ctx.lineTo(x, max(this.pathCurve.yFor(x), groundY)),
            ({ x, groundY }) => ctx.lineTo(x, max(this.pathCurve.yFor(x) + 20, groundY)),
        );
        ctx.fill();
        ctx.beginPath();

        // Ground outline
        ctx.wrap(() => {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 10;
            ctx.globalAlpha = 0.1;
            ctx.beginPath();
            xSweep(
                this.world,
                GROUND_CURVE_STEP,
                ({ x, groundY }) => {
                    ctx.lineTo(x, groundY + ctx.lineWidth / 2)
                },
            );
            ctx.stroke();
        });

        // Darker curve deep under
        ctx.wrap(() => {
            ctx.translate(0, 400);
            ctx.fillStyle = '#000';
            ctx.globalAlpha = 0.05;
            ctx.beginPath();
            xSweep(
                this.world,
                GROUND_CURVE_STEP,
                ({ x, groundY }) => ctx.lineTo(x, groundY),
            );
            ctx.lineTo(camera.position.x + CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
            ctx.lineTo(camera.position.x - CANVAS_WIDTH / 2, camera.position.y + CANVAS_HEIGHT / 2);
            ctx.fill();
        })

        // Shade over the hills
        for (const ratio of [1, 2, 3]) {
            ctx.wrap(() => {
                ctx.fillStyle = '#fff';
                ctx.globalAlpha = 0.1;
                ctx.beginPath();
                xSweep(
                    this.world,
                    GROUND_CURVE_STEP,
                    ({ x, groundY }) => ctx.lineTo(x, groundY),
                    ({ x, groundY }) => ctx.lineTo(
                        x,
                        interpolateUnbounded(
                            groundY,
                            max(this.curve.yFor(x), groundY),
                            ratio,
                        ),
                    ),
                );
                ctx.fill();
            });
        }

        // Grass
        const { rng } = this;
        surfaceSweep(
            this.world,
            rng,
            200,
            ({ x, groundY }) => {
                const y = groundY + rng.floating() * CANVAS_HEIGHT;

                for (let i = 0 ; i < interpolate(5, 10, rng.floating()) ; i++) {
                    ctx.wrap(() => {
                        ctx.fillStyle = rng.pick(GRASS_COLORS);
                        ctx.translate(
                            x + rng.floating() * 30,
                            y + i * 5,
                        );
                        ctx.rotate(sin((this.age + rng.floating()) * PI * 2) * (rng.floating() * PI / 8));

                        ctx.fillRect(-2, 0, 4, -10);

                        if (rng.floating() < 0.1) {
                            ctx.fillStyle = rng.pick(['#fff', '#ff0', '#08f']);
                            ctx.fillRect(-2, -10, 4, 4);
                        }
                    });
                }
            },
            camera.position.x,
            camera.position.y,
        );
    }
}
