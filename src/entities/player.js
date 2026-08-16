class Player extends Bike {
    constructor() {
        super();
        this.categories.push('player');
        this.controllable = true;
    }

    render() {
        super.render();

        if (DEBUG_TRICKS) ctx.wrap(() => {
            // const momentumAngle = 0;
            const momentumAngle = atan2(this.momentum.position.y, this.momentum.position.x);

            ctx.lineWidth = 10;
            ctx.strokeStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(momentumAngle) * 100, this.position.y + sin(momentumAngle) * 100)
            ctx.stroke();

            const ground = firstItem(this.world.category('ground'));
            const slope = ground.curve.slopeFor(this.backWheel.absolute.position.x);
            const idealAngle = atan2(slope, 1);

            ctx.lineWidth = 10;
            ctx.strokeStyle = '#f00';
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(idealAngle) * 100, this.position.y + sin(idealAngle) * 100)
            ctx.stroke();
        });
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
