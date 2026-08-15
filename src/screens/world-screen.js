class WorldScreen extends Screen {
    constructor() {
        super();
        this.world = new World();

        if (DEBUG) {
            this.debugValues = () => {
                const vals = [`Entities: ${this.world.entities.size}`];
                for (const camera of this.world.category('camera')) {
                    vals.push([`Camera: ${camera.position.x.toFixed(0)},${camera.position.y.toFixed(0)}`]);
                }
                for (const bike of this.world.category('bike')) {
                    vals.push([`Player:`]);
                    vals.push([`- ${bike.position.x.toFixed(0)},${bike.position.y.toFixed(0)}`]);
                    vals.push([`- Momentum: ${pointDistance(0, 0, bike.momentum.position.x, bike.momentum.position.y).toFixed(0)}`]);
                }
                return vals;
            };
        }
    }

    cycle(elapsed) {
        this.world.cycle(elapsed);
    }

    render() {
        this.world.render();
    }
}
