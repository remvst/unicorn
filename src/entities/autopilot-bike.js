
class AutopilotBike extends Bike {
    cycle(elapsed) {
        super.cycle(elapsed);
        this.controls.accelerate = this.momentum.position.x < 500;
        this.rotation = this.targetAngle() - PI / 64;
    }

    targetAngle() {
        const ground = firstItem(this.world.category(Ground));
        return atan2(ground.curve.slopeFor(this.position.x), 1);
    }
}
