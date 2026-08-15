class Item extends Entity {

    constructor() {
        super();
        this.categories.push('item');
    }

    render() {
        ctx.translate(this.position.x, this.position.y);
        ctx.fillStyle = '#fff';
        ctx.fillRect(-10, -10, 20, 20);
    }

    cycle(elapsed) {
        for (const bike of this.world.category('bike')) {
            if (distance(this.position, bike.position) < 50) {
                this.world.remove(this);
                // bike.power = min(1, bike.power + 0.1);

                // TODO use slope momentum instead
                bike.momentum.position.x += cos(bike.rotation) * 50;
                bike.momentum.position.y += sin(bike.rotation) * 50;

                dustCloud({
                    world: this.world,
                    position: this.position,
                    radius: 5,
                    density: 1 / (5 * 5),
                    duration: [0.25, 1],
                    x: [-20, 20],
                    y: [-20, 20],
                    size: 10,
                });
            }
        }
    }
}
