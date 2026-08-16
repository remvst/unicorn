class IntroLevel extends Level {
    async setup() {
        this.transitionIntoCurve(new PerlinCurve({ plus: [
            // new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 700, amplitude: 400 }),
            // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ] }));

        const { camera } = this.basics();
        camera.zoom = 1.5;
        camera.offset = 0;

        // this.world.remove(firstItem(this.world.category('player')));
        // this.world.remove(firstItem(this.world.category('hud')));

        // const { ground } = this.basics();

        // const bike = this.world.add(new AutopilotBike());
        // bike.position.y = ground.curveAt(bike.position.x) -
        //     bike.backWheel.position.y - bike.backWheel.radius; // TODO eventually hardcode this?

        await new Promise((r) => {});
    }
}
