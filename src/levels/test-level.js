class TestLevel extends Level {
    async setup() {
        console.log('kk');
        this.transitionIntoCurve(new PerlinCurve({ plus: [
            new PerlinCurve({ step: 1000, amplitude: 800 }),
            new PerlinCurve({ step: 500, amplitude: 200 }),
        ] }));
        await new Promise((r) => {});
    }
}
