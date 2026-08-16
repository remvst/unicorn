class Player extends Bike {
    constructor() {
        super();
        this.categories.push('player');
        this.controllable = true;
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        this.controls.raiseWheel = this.controllable && downKeys[37];
        this.controls.lowerWheel = this.controllable && downKeys[39];
        this.controls.jump = this.controllable && downKeys[32];
        this.controls.brake = this.controllable && downKeys[40];
        this.controls.accelerate = this.controllable && downKeys[38];

        if (this.controlsOverride) {
            for (const key in this.controls) {
                this.controls[key] = this.controlsOverride[key];
            }
        }
    }

    die() {
        super.die();
        this.world.add(new LevelOutcome(false));
    }
}
