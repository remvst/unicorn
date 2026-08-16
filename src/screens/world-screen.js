class WorldScreen extends Screen {
    constructor(level) {
        super();

        this.level = level;
        this.level.initialize();

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

        const index = ALL_LEVELS.indexOf(this.level.constructor);
        console.log('success?', index, outcome.success);

        if (outcome.success) {
            const nextLevel = ALL_LEVELS[index + 1];
            if (!nextLevel) {
                // TODO end of the game
            } else {
                const { world } = this.level;
                this.level = new nextLevel();
                this.level.world = world;
                this.level.initialize();
            }
        } else {
            // TODO reset level
        }

    }
}
