class Level {
    start() {
        if (!this.world) {
            this.world = new World();
            this.world.add(new Background());
            this.world.add(new Foreground());
            this.world.add(new Camera());
            this.world.add(new HUD());
            this.world.add(new Ground());

            this.spawnPlayer();
            this.autoRespawn();
        }

        return this.setup();
    }

    spawnPlayer(x = 0) {
        const ground = firstItem(this.world.category(Ground));

        // Spawn the player with the right angle to fit on the curve
        const player = this.world.add(new Player());
        const theta = player.rotation = ground.curve.angleFor(x);

        const bw = player.backWheel;
        const relativeAngle = atan2(bw.position.y, bw.position.x);
        const relativeDist = hypot(bw.position.x, bw.position.y);

        const nx = -sin(theta), ny = -cos(theta);

        player.position.x = x + nx * bw.radius - cos(relativeAngle + theta) * relativeDist;
        player.position.y = ground.curveAt(x) + ny * bw.radius - sin(relativeAngle + theta) * relativeDist;
    }

    async autoRespawn() {
        while (true) {
            const { player: oldPlayer } = this.basics();
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
        transition,
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
        await transition(previousLevelEndX + CANVAS_WIDTH / 2)

        return this.transitionIntoCurve(curve);
    }

    async announceLevelTitle(x, announcement) {
        await waitFor(this.world, () => this.basics().player?.position.x > x);
        this.world.addUnique(new Prompt(announcement)).removeWhenAgeIs(3);
    }

    async runUnicornDialog(x, dialog) {
        const { camera } = this.basics();

        // Wait for the player to reach the transition
        await waitFor(this.world, () => this.basics().player?.position.x > x);

        // Force them to stop and land
        this.basics().player.controlsOverride = {brake: true};
        this.basics().player.momentum.rotation = 0;
        this.basics().player.rotation = 0;
        await waitFor(this.world, () => this.basics().player?.momentum.position.x <= 10);
        await camera.interp(camera, 'zoom', camera.zoom, 2, 0.3);

        this.world.clearCategory(Objective);

        // Bring the unicorn
        const uc = this.world.add(new Unicorn());
        uc.facing = -1;
        uc.walking = true;
        await uc.interp(uc.position, 'x', this.basics().player.position.x + CANVAS_WIDTH / 2, this.basics().player.position.x + 200, 2);
        uc.walking = false;

        // Give instructions
        for (const l of dialog) {
            const prompt = this.world.addUnique(new Prompt(l));
            await waitFor(this.world, () => prompt.age > 3);
        }
        this.world.clearCategory(Prompt);

        // Make the unicorn go away
        uc.facing = 1;
        uc.walking = true;
        await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH / 2, 2);
        uc.world.remove(uc);

        // Restore player control
        this.basics().player.controlsOverride = null;
        camera.interp(camera, 'zoom', camera.zoom, 1, 0.3);
    }

    async runObjectives({ objectives, requiredCount }) {
        this.world.clearCategory(Objective);

        requiredCount ??= objectives.length;

        let completedCount = 0;
        for (const obj of objectives) {
            this.world.add(obj).start().then(() => completedCount++);
        }

        await waitFor(this.world, () => completedCount >= requiredCount);
    }
}
