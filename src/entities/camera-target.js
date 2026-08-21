class CameraTarget extends Entity {


    cycle(elapsed) {
        super.cycle(elapsed);

        const bike = firstItem(this.world.category(Bike));
        if (bike) {
            this.position.x = bike.position.x;
            this.position.y = bike.position.y;
        }
    }
}
