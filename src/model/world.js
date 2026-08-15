class World {
    constructor() {
        this.entities = new Set();
        this.categories = {};

        this.add(new Camera());
        this.add(new HUD());
        this.add(new Unicorn());
        this.add(new ItemGenerator());

        const ground = this.add(new Ground());

        const player = this.add(new Bike());
        player.position.y = ground.curveAt(player.position.x) - player.backWheel.radius;
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
            category.delete(entity);
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
        camera.cycle(0); // Cheat to force the camera to be locked

        ctx.fillStyle = '#111'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.wrap(() => {
            ctx.translate(-camera.position.x + CANVAS_WIDTH / 2, -camera.position.y + CANVAS_HEIGHT / 2);

            for (const entity of this.entities) {
                ctx.wrap(() => entity.render());
            }
        });
    }
}
