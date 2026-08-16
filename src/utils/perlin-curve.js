class PerlinCurve {
    constructor(opts) {
        this.step = opts.step ?? 100;
        this.amplitude = opts.amplitude ?? 0;
        this.plus = opts.plus ?? [];
        this.seeds = [];
        this.multiplier = opts.multiplier ?? (() => 1);
        for (let i = 0 ; i < 50 ; i++) {
            this.seeds.push(Math.random());
        }
    }

    yFor(x) {
        // const multiplier = this.multiplier(x);
        // if (!multiplier) return 0;

        const plus = this.plus.reduce((acc, plus) => acc + plus.yFor(x), 0);

        const index = floor(x / this.step);
        const ratio = x / this.step - index;

        const before = this.seeds[((index % this.seeds.length) + this.seeds.length) % this.seeds.length];
        const after = this.seeds[(((index + 1) % this.seeds.length) + this.seeds.length) % this.seeds.length];

        const gradientBefore = (Math.cos(before * Math.PI * 2) + Math.sin(before * Math.PI * 2)) * ratio;
        const gradientAfter = (Math.cos(after * Math.PI * 2) + Math.sin(after * Math.PI * 2)) * (ratio - 1);

        return (plus + interpolate(
            gradientBefore * this.amplitude,
            gradientAfter * this.amplitude,
            smoothstep(ratio),
        )) * this.multiplier(x);
    }

    faded(
        startX,
        endX,
        easing = linear,
    ) {
        return new PerlinCurve({
            plus: [this],
            multiplier: x => {
                const ratio = (x - startX) / (endX - startX);
                return between(0, easing(ratio), 1);
            }
        });
    }
}
