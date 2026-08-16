class Level {
    initialize() {
        if (!this.world) {
            this.world = new World();
            this.world.add(new Background());
            this.world.add(new Camera());

            this.world.add(new ItemGenerator()); // TODO could be a problem across levels

            const ground = this.world.add(new Ground());

            this.player = this.world.add(new Player());
            this.player.position.y = ground.curveAt(this.player.position.x) -
                this.player.backWheel.position.y - this.player.backWheel.radius; // TODO eventually hardcode this?

            this.world.add(new HUD());
        }

        this.setup({
            world: this.world,
            ground: firstItem(this.world.category('ground')),
            player: firstItem(this.world.category('player')),
            camera: firstItem(this.world.category('camera')),
        })
    }

    setup({
        world,
        ground,
        player
    }) {
        // override in subclasses
    }

    flattenGround(ground) {
        let x = firstItem(this.world.category('camera')).position.x;
        ground.curve = ground.curve.faded(
            x += CANVAS_WIDTH / 2,
            x += CANVAS_WIDTH / 2,
            x => 1 - linear(x),
        );
        return x;
    }

    transitionIntoCurve(ground, curve) {
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
}
