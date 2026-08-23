class EntityGenerator extends Entity {

    constructor(entityClass, interval, count, spacing) {
        super();
        this.entityClass = entityClass;
        this.interval = interval;
        this.count = count;
        this.spacing = spacing;
        this.offset = random() * this.interval;
    }

    cycle(elapsed) {
        const camera = firstItem(this.world.category(Camera));
        this.cache ||= new Cache();
        this.cache.getOrCreate(
            ~~(camera.position.x / this.interval),
            () => {
                for (const existing of this.world.category(this.entityClass)) {
                    if (existing.position.x < camera.position.x - CANVAS_WIDTH) {
                        this.world.remove(existing);
                    }
                }

                const ground = firstItem(this.world.category(Ground));
                const valleyX = firstItem(ground.curve.valleys(camera.position.x + CANVAS_WIDTH + this.offset, camera.position.x + CANVAS_WIDTH + 20000));

                for (let x = valleyX, i = 0 ; i < this.count ; x += this.spacing, i++) {
                    const entity = this.world.add(Entity.recycle(this.entityClass));
                    entity.position.x = x;
                    entity.position.y = ground.curveAt(x) - 20;
                }
                return true;
            }
        )
    }
}
