class Level {
    start() {
        if (!this.world) {
            this.world = new World();
            this.world.add(new Background());
            this.world.add(new Foreground());
            this.world.add(new Camera());
            this.world.add(new HUD());// TODO could be a problem across levels
            this.world.add(new Ground());
            this.world.add(new CameraTarget());

            this.spawnPlayer();
            this.autoRespawn();
        }

        return this.setup();
    }

    spawnPlayer(x = 0) {
        const ground = firstItem(this.world.category(Ground));

        // Spawn the player with the right angle to fit on the curve
        const player = this.world.add(new Player());
        player.rotation = ground.curve.angleFor(x);

        const h = player.backWheel.position.y + player.backWheel.radius
        player.position.x = x + cos(player.rotation + PI / 2) * h;
        player.position.y = ground.curveAt(x) - sin(player.rotation + PI / 2) * h
    }

    async autoRespawn() {
        while (true) {
            const { player: oldPlayer, ground, camera, cameraTarget } = this.basics();
            await waitFor(this.world, () => !this.basics().player);
            if (oldPlayer) await this.world.wait(1);
            let x = oldPlayer?.position.x || 0;
            this.spawnPlayer(x);
        }
    }

    basics() {
        return {
            world: this.world,
            ground: firstItem(this.world.category(Ground)),
            player: firstItem(this.world.category(Bike)),
            camera: firstItem(this.world.category(Camera)),
            cameraTarget: firstItem(this.world.category(CameraTarget)),
        };
    }

    setup() {
        // override in subclasses
    }

    flattenGround() {
        return this.transitionIntoCurve(plains());
    }

    transitionIntoCurve(curve) {
        const { ground } = this.basics();
        const startX = firstItem(this.world.category(Camera)).position.x +  CANVAS_WIDTH / 2;
        const endX = startX + CANVAS_WIDTH / 2;

        ground.curve = new PerlinCurve({
            plus: [
                ground.curve.faded(
                    startX,
                    endX,
                    x => 1 - linear(x),
                ),
                curve.faded(
                    startX,
                    endX,
                    linear,
                ),
            ]
        });
        return endX;
    }

    async levelTransition({
        dialog,
        curve,
    }) {
        const { camera } = this.basics();

        // Cleanup items between levels
        this.world.clearCategory(ItemGenerator);
        for (const item of this.world.category(Item)) {
            if (abs(camera.position.x) > CANVAS_WIDTH / 2) {
                this.world.remove(item);
            }
        }

        const previousLevelEndX = this.transitionIntoCurve(plains());

        // Add a unicorn at the beginning
        const uc = this.world.add(new Unicorn());
        uc.position.x = previousLevelEndX + CANVAS_WIDTH / 2;
        uc.facing = -1;

        // Wait for the player to reach the unicorn
        await waitFor(this.world, () => this.basics().player?.position.x > uc.position.x - 400);

        // Force the player to stop and land
        this.basics().player.controlsOverride = {brake: true};
        this.basics().player.momentum.rotation = 0;
        this.basics().player.rotation = 0;
        camera.interp(camera, 'zoom', camera.zoom, 2, 0.3);

        // Give instructions
        for (const l of dialog) {
            const prompt = this.world.addUnique(new Prompt(l));
            await waitFor(this.world, () => prompt.age > 3);
        }
        this.world.clearCategory(Prompt);
        await uc.interp(uc, 's', 0, 0, 1);

        // Make the unicorn go away
        uc.facing = 1;
        uc.walking = true;
        await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH / 2, 2);
        uc.world.remove(uc);

        // Restore player control
        this.basics().player.controlsOverride = null;
        camera.interp(camera, 'zoom', camera.zoom, 1, 0.3);

        return this.transitionIntoCurve(curve);
    }

    async runObjectives({ objectives }) {
        for (const obj of objectives) this.world.add(obj);
        await Promise.all(objectives.map(obj => obj.start()));
        for (const obj of objectives) this.world.remove(obj);
    }
}
