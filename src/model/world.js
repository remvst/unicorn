getLayer = (entity) => {
    let i = 0;
    for (const entityClass of [
        Background,
        Rainbow,
        Unicorn,
        PhysicsObject,
        Item,
        Ground,
        Foreground,
        Particle,
        HUD,
        Entity,
    ]) {
        if (entity instanceof entityClass) return i;
        i++;
    }
}

class World {
    constructor() {
        this.entities = new Set();
        this.categories = new Map();
        this.layers = [];
        this.age = 0;
    }

    add(entity) {
        entity.world = this;
        this.entities.add(entity);
        for (const entityClass of superclassesOf(entity)) {
            if (entityClass.constructor === Entity) break; // Small optimization
            this.category(entityClass.constructor).add(entity);
        }

        entity.layer ||= getLayer(entity);

        (this.layers[entity.layer] ||= new Set()).add(entity);
        return entity;
    }

    remove(entity) {
        this.entities.delete(entity);
        for (const category of this.categories.values()) {
            category.delete(entity);
        }
        for (const layer of Object.values(this.layers)) {
            layer.delete(entity);
        }

        // Allow the entity to be reused
        entity.pool?.add(entity);
    }

    category(category) {
        if (!this.categories.has(category)) this.categories.set(category, new Set());
        return this.categories.get(category);
    }

    addUnique(entity) {
        for (const entityClass of superclassesOf(entity)) {
            this.clearCategory(entityClass.constructor);
        }
        return this.add(entity);
    }

    clearCategory(category) {
        for (const entity of [...this.category(category)]) {
            this.remove(entity);
        }
    }

    cycle(elapsed) {
        this.age += elapsed;
        for (const entity of [...this.entities]) {
            entity.cycle(elapsed);
        }
    }

    render() {
        const camera = firstItem(this.category(Camera));
        camera.cycle(0); // Cheat to force the camera to be locked

        ctx.wrap(() => {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
            ctx.scale(camera.zoom, camera.zoom);
            ctx.translate(-camera.position.x, -camera.position.y);

            for (const layer of this.layers) {
                if (!layer) continue;
                for (const entity of layer) {
                    ctx.wrap(() => entity.render());
                }
            }
        });
    }

    wait(duration) {
        const { age } = this;
        return waitFor(this, () => this.age > age + duration);
    }
}
