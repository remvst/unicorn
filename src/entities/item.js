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
        const bike = firstItem(this.world.category('bike'));
        if (distance(this.position, bike.position) < 50) {
            this.world.remove(this);
            // bike.power = min(1, bike.power + 0.1);

            bike.momentum.position.x += Math.cos(bike.rotation) * 50;
            bike.momentum.position.y += Math.sin(bike.rotation) * 50;
        }
    }
}
