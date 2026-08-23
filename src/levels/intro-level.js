class IntroLevel extends Level {
    async setup() {
        const { camera, ground } = this;

        camera.zoom = 1.5;
        camera.offset.x = 0;
        camera.offset.y = -0.1;

        ground.curve = plains();

        this.world.clearCategory(Bike);
        const bike = this.world.add(new AutopilotBike());
        bike.position.y = ground.curveAt(bike.position.x) -
            bike.backWheel.position.y - bike.backWheel.radius; // TODO eventually hardcode this?

        await new Promise((r) => {});
    }
}
