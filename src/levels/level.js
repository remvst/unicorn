class Level {
    initialize() {
        if (!this.world) {
            this.world = new World();
            this.world.add(new Background());
            this.world.add(new Camera());
            this.world.add(new HUD());
            this.world.add(new ItemGenerator()); // TODO could be a problem across levels
            this.world.add(new Ground());

            this.autoRespawn();
        }

        this.setup()
    }

    spawnPlayer(x = 0) {
        const ground = firstItem(this.world.category('ground'));

        const player = this.world.add(new Player());
        player.position.x = x;
        player.position.y = ground.curveAt(x) -
            player.backWheel.position.y - player.backWheel.radius; // TODO eventually hardcode this?
    }

    async autoRespawn() {
        while (true) {
            const oldPlayer = firstItem(this.world.category('player'));
            await waitFor(this.world, () => !firstItem(this.world.category('player')));
            if (oldPlayer) await this.world.wait(2);
            this.spawnPlayer(oldPlayer?.position.x || 0);
        }
    }

    basics() {
        return {
            world: this.world,
            ground: firstItem(this.world.category('ground')),
            player: firstItem(this.world.category('player')),
            camera: firstItem(this.world.category('camera')),
        };
    }

    setup() {
        // override in subclasses
    }

    flattenGround() {
        const { ground } = this.basics();
        let x = firstItem(this.world.category('camera')).position.x;
        ground.curve = ground.curve.faded(
            x += CANVAS_WIDTH / 2,
            x += CANVAS_WIDTH / 2,
            x => 1 - linear(x),
        );
        return x;
    }

    transitionIntoCurve(curve) {
        const { ground } = this.basics();
        let x = firstItem(this.world.category('camera')).position.x;
        ground.curve = new PerlinCurve({
            plus: [
                ground.curve,
                curve.faded(
                    x += CANVAS_WIDTH / 2,
                    x += CANVAS_WIDTH / 2,
                    linear,
                ),
            ]
        });
        return x;
    }

    async levelTransition({
        dialog,
    }) {
        const { ground, player, camera } = this.basics();

        const previousLevelEndX = this.flattenGround();

        // Add a unicorn at the beginning
        const uc = this.world.add(new Unicorn());
        uc.position.x = previousLevelEndX + CANVAS_WIDTH / 2;
        uc.facing = -1;

        // Wait for the player to reach the unicorn
        await waitFor(this.world, () => player.position.x > uc.position.x - 400);

        // Force the player to stop and land
        player.controlsOverride = {brake: true};
        player.momentum.rotation = 0;
        player.rotation = 0;
        camera.interp(camera, 'zoom', camera.zoom, 2, 0.3);

        // Give instructions
        // TODO render on screen
        for (const l of dialog) {
            console.log(l);
        }
        await uc.interp(uc.position, 'bs', 0, 0, 2);

        // Make the unicorn go away
        uc.facing = 1;
        uc.walking = true;
        await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH / 2, 2);
        uc.world.remove(uc);

        // Restore player control
        player.controlsOverride = null;
        camera.interp(camera, 'zoom', camera.zoom, 1, 0.3);

        return this.transitionIntoCurve(new PerlinCurve({ step: 500, amplitude: 200 }));
    }

    async runObjectives({ objectives }) {
        for (const obj of objectives) this.world.add(obj);
        await Promise.all(objectives.map(obj => obj.start()));
    }
}
