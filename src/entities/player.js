class Player extends Bike {
    constructor() {
        super();
        this.categories.push('player');
    }

    die() {
        super.die();
        this.world.add(new LevelOutcome(false));
    }
}
