class Level {
    constructor() {
        this.world = new World();

        this.world.add(new Camera());
        this.world.add(new HUD());

        this.world.add(new ItemGenerator());

        const ground = this.world.add(new Ground());

        const uc = this.world.add(new Unicorn());
        uc.position.x = 300;

        (async () => {
            uc.facing = -1;
            await uc.interp(uc.position, 'bs', 0, 0, 2);

            uc.facing = 1;
            uc.walking = true;
            await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH, 5);

            uc.world.remove(uc);
        })();

        this.player = this.world.add(new Bike());
        this.player.position.y = ground.curveAt(this.player.position.x) -
            this.player.backWheel.position.y - this.player.backWheel.radius; // TODO eventually hardcode this?
    }
}
