class World {
    constructor() {
        this.entities = new Set();
        this.categories = {};

        this.add(new Camera());
        this.add(new HUD());

        const ground = this.add(new Ground());

        const bike = this.add(new Bike());
        bike.position.y = ground.curveAt(bike.position.x) - 50;
    }

    add(entity) {
        entity.world = this;
        this.entities.add(entity);
        for (const category of entity.categories) {
            this.category(category).add(entity);
        }
        return entity;
    }

    remove(entity) {
        this.entities.delete(entity);
        for (const category of Object.values(this.categories)) {
            category.remove(entity);
        }
    }

    category(id) {
        this.categories[id] = this.categories[id] || new Set();
        return this.categories[id];
    }

    cycle(elapsed) {
        for (const entity of [...this.entities]) {
            entity.cycle(elapsed);
        }
    }

    render() {
        const camera = firstItem(this.category('camera'));

        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.wrap(() => {
            ctx.translate(-camera.position.x + CANVAS_WIDTH / 2, -camera.position.y + CANVAS_HEIGHT / 2);

            for (const entity of this.entities) {
                ctx.wrap(() => entity.render());
            }
        })
    }
}
