class ItemGenerator extends Entity {

    constructor() {
        super();
        this.cache = new Cache();
        this.interval = CANVAS_WIDTH * 2;
    }

    cycle(elapsed) {
        const camera = firstItem(this.world.category('camera'));
        this.cache.getOrCreate(
            Math.ceil(camera.position.x / this.interval),
            () => {
                for (const item of this.world.category('item')) {
                    if (item.position.x < camera.position.x - CANVAS_WIDTH) {
                        this.world.remove(item);
                    }
                }

                const ground = firstItem(this.world.category('ground'));
                const valleyX = firstItem(ground.valleys(camera.position.x + CANVAS_WIDTH, camera.position.x + CANVAS_WIDTH + 20000));
                for (let x = valleyX, i = 0 ; i < 5 ; x += 100, i++) {
                    const item = this.world.add(new Item());
                    item.position.x = x;
                    item.position.y = ground.curveAt(x) - 20;
                }
                return true;
            }
        )
    }
}
