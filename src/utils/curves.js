tinyBumps = () => new PerlinCurve({ step: 400, amplitude: 100, });
simpleBumps = () => new PerlinCurve({ step: 500, amplitude: 250 });
extraBumps = () => new PerlinCurve({ step: 1000, amplitude: 200 });
mountains = () => new PerlinCurve({ step: 2000, amplitude: 800 });
plains = () => new PerlinCurve({ step: 2000, amplitude: 200 });

regularLevel = () => new PerlinCurve({
    plus: [
        mountains(),
        simpleBumps(),
        extraBumps(),
    ],
});

// Bad curve but keeping it for testing
// new PerlinCurve({ plus: [
//     new PerlinCurve({ step: 1000, amplitude: 100 }),
//     new PerlinCurve({ step: 500, amplitude: 300 }),
//     new PerlinCurve({ step: 200, amplitude: 100 }),
//     // new PerlinCurve({ step: 200, amplitude: 80, multiplier: x => abs(sin(x / 2000)) }),
// ] })
