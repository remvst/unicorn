class IntroLevel extends Level {
    async setup() {
        this.transitionIntoCurve(new PerlinCurve({ plus: [
            // new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 2000, amplitude: 100 }),
            // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ] }));

        const uc = this.world.add(new AudienceUnicorn());
        uc.position.x = 200;

        const { camera } = this.basics();
        camera.zoom = 1.5;
        camera.offset = 0;

        const { ground } = this.basics();

        // ground.render = () => {};

        const bike = this.world.add(new AutopilotBike());
        bike.position.y = ground.curveAt(bike.position.x) -
            bike.backWheel.position.y - bike.backWheel.radius; // TODO eventually hardcode this?

        await new Promise((r) => {});
    }
}
