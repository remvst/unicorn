class TutorialFlat extends Level {
    constructor() {
        super();
    }

    setup({
        world,
        player,
        ground
    }) {
        // TODO make it flat
        ground.curve = new PerlinCurve({ step: 2000, amplitude: 100 });

        const uc = world.add(new Unicorn());
        uc.position.x = 300;

        (async () => {
            uc.facing = -1;
            await uc.interp(uc.position, 'bs', 0, 0, 2);

            uc.facing = 1;
            uc.walking = true;
            await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH, 5);

            uc.world.remove(uc);
        })();

        this.world.add(new Objective('Start pedaling', (p) => {
            return p.position.x > 500;
        }));
    }
}
