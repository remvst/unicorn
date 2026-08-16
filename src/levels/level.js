class Level {
    constructor() {
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

    initialize() {
        this.setup({
            world: this.world,
            ground: firstItem(this.world.category('ground')),
            player: firstItem(this.world.category('player')),
        })
    }

    setup({
        world,
        ground,
        player
    }) {
        // override in subclasses
    }
}
