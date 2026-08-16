class TutorialFlat extends Level {
    constructor() {
        super();
    }

    setup({
        world,
        player,
        ground
    }) {
        // ground.curve = new PerlinCurve({ step: 2000, amplitude: 100 });

        let x = player.position.x + CANVAS_WIDTH;

        ground.curve = new PerlinCurve({
            plus: [
                // Fade the previous level's curve out
                ground.curve.faded(
                    x += 1000,
                    x += 2000,
                    x => 1 - linear(x),
                ),

                // Fade in the new curve
                new PerlinCurve({ step: 2000, amplitude: 800 }).faded(
                    x += 1000,
                    x += 1000,
                    linear,
                ),
            ]
        });


        // ground.curve = fadeCurve(ground.curve, 2500, 3000, linear)
        // ground.curve = fadeCurve(ground.curve, 1500, 2000, x => 1 - linear(x))

        const uc = world.add(new Unicorn());
        uc.position.x = x - 2000;

        (async () => {
            uc.facing = -1;
            await uc.interp(uc.position, 'bs', 0, 0, 2);

            // uc.facing = 1;
            // uc.walking = true;
            // await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH, 5);

            // uc.world.remove(uc);
        })();

        this.world.add(new Objective('Start pedaling', (p) => {
            return p.position.x > 500;
        }));
    }
}
