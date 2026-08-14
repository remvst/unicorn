class Bike extends PhysicsObject {
    constructor() {
        super();

        // TODO
        // this.lastBackWheelOnGround = 0;
        // this.lastBackWheelSegment = null;

        const frontWheel = this.addHitbox();
        frontWheel.position.x = 20;
        frontWheel.radius = 10;

        const backWheel = this.addHitbox();
        backWheel.position.x = -20;
        backWheel.radius = 10;

        const head = this.addHitbox();
        head.position.y = -20;
        head.radius = 5;

    }
}
