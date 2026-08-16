class TestLevel extends Level {
    async setup() {
        this.transitionIntoCurve(new PerlinCurve({ plus: [
            new PerlinCurve({ step: 2000, amplitude: 800 }),
            new PerlinCurve({ step: 500, amplitude: 200 }),
            new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
        ] }));
        await new Promise((r) => {});
    }
}
