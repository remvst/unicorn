class Level {
    constructor() {
        this.world = new World();

        this.world.add(new Camera());
        this.world.add(new HUD());
        this.world.add(new Unicorn());
        this.world.add(new ItemGenerator());

        const ground = this.world.add(new Ground());

        this.player = this.world.add(new Bike());
        this.player.position.y = ground.curveAt(this.player.position.x) -
            this.player.backWheel.position.y - this.player.backWheel.radius; // TODO eventually hardcode this?
    }
}
