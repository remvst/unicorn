class Entity {
    constructor() {
        this.age = 0;
        this.position = {x: 0, y: 0};
        this.categories = [];
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

    render() {

    }
}
