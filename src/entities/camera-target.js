class CameraTarget extends Entity {
    constructor() {
        super();
        this.categories.push('cameratarget');
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const bike = firstItem(this.world.category('bike'));
        if (bike) {
            this.position.x = bike.position.x;
            this.position.y = bike.position.y;
        }
    }
}
