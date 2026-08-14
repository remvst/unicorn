class World {
    constructor() {
        this.entities = new Set();
        this.categories = {};
    }

    add(entity) {
        entity.world = this;
        this.entities.add(entity);
        for (const category of entity.categories) {
            this.category(category).add(entity);
        }
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
        for (const entity of this.entities) {
            entity.render();
        }
    }
}
