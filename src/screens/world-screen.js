class WorldScreen extends Screen {
    constructor() {
        super();

        this.level = new Level(); // TODO inject this

        if (DEBUG) {
            this.debugValues = () => {
                const vals = [`Entities: ${this.level.world.entities.size}`];
                for (const camera of this.level.world.category('camera')) {
                    vals.push([`Camera: ${camera.position.x.toFixed(0)},${camera.position.y.toFixed(0)}`]);
                }
                for (const bike of this.level.world.category('bike')) {
                    vals.push([`Player:`]);
                    vals.push([`- ${bike.position.x.toFixed(0)},${bike.position.y.toFixed(0)}`]);
                    vals.push([`- Momentum: ${pointDistance(0, 0, bike.momentum.position.x, bike.momentum.position.y).toFixed(0)}`]);
                }
                return vals;
            };
        }
    }

    cycle(elapsed) {
        this.level.world.cycle(elapsed);
        this.onOutcome(firstItem(this.level.world.category('outcome')));
    }

    render() {
        this.level.world.render();
    }

    onOutcome(outcome) {
        if (this.outcome || !outcome) return;
        this.outcome = outcome;

        console.log('success?', outcome.success);
    }
}
