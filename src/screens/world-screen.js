class WorldScreen extends Screen {
    constructor(levelsGenerator) {
        super();

        (async () => {
            for (const level of levelsGenerator()) {
                level.world = this.level?.world;
                this.level = level;
                await this.level.start();
            }
        })();

        if (DEBUG) this.debugValues = () => {
            if (!this.level) return [];
            const vals = [`Entities: ${this.level.world.entities.size}`];
            for (const camera of this.level.world.category(Camera)) {
                vals.push([`Camera: ${camera.position.x.toFixed(0)},${camera.position.y.toFixed(0)}`]);
            }
            for (const bike of this.level.world.category(Bike)) {
                vals.push([`Player:`]);
                vals.push([`- ${bike.position.x.toFixed(0)},${bike.position.y.toFixed(0)}`]);
                vals.push([`- Momentum: ${pointDistance(0, 0, bike.momentum.position.x, bike.momentum.position.y).toFixed(0)}`]);
            }
            return vals;
        };
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        this.level?.world.cycle(elapsed);

        const [pauseBefore, pauseAfter] = this.pauseChange.change(downKeys[27]);
        if (this.isForeground && !pauseBefore && pauseAfter) {
            G.screens.push(new PauseMenu());
        }
    }

    render() {
        this.level?.world.render();
    }
}
