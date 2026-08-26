class Entity {

    static pools = new Map();

    static poolFor(entityClass) {
        if (!Entity.pools.has(entityClass)) {
            Entity.pools.set(entityClass, new Set());
        }
        return Entity.pools.get(entityClass);
    }

    static recycle(entityClass) {
        const pool = Entity.poolFor(entityClass);
        const entity = firstItem(pool) || new entityClass();
        (entity.pool = pool).delete(entity);
        entity.reset();
        return entity;
    }

    constructor() {
        this.position = {};
        this.reset();
    }

    reset() {
        this.age = 0;
        this.position = {x: 0, y: 0};
        this.rng = createNumberGenerator((random() * 0xffffff));
    }

    cycle(elapsed) {
        this.age += elapsed;
        this.rng.reset();
    }

    cancelCameraTransformations() {
        const camera = firstItem(this.world.category(Camera));
        ctx.translate(camera.position.x, camera.position.y);
        ctx.scale(1 / camera.zoom, 1 / camera.zoom);
        ctx.translate(-CANVAS_WIDTH / 2, -CANVAS_HEIGHT / 2);
    }

    render() {

    }

    async removeWhenAgeIs(maxAge) {
        await waitFor(this.world, () => this.age > maxAge);
        this.world.remove(this);
    }

    interp(
        owner,
        interpProperty,
        fromValue,
        toValue,
        interpDuration,
        easing = linear,
    ) {
        const interpolator = Entity.recycle(Interpolator)
        interpolator.configure(
            owner,
            interpProperty,
            fromValue,
            toValue,
            interpDuration,
            easing,
        );
        return this.world.add(interpolator).awaitCompletion();
    }
}
