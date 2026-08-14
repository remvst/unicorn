class WorldScreen extends Screen {
    constructor() {
        super();
        this.world = new World();
    }

    cycle(elapsed) {
        this.world.cycle(elapsed);
    }

    render() {
        this.world.render();
    }
}
