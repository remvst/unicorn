class Player extends Bike {
    constructor() {
        super();
        this.comboTracker = new ComboTracker(this);
    }

    die() {
        super.die();
        this.comboTracker.failed = true;
    }

    render() {
        super.render();

        if (DEBUG_TRICKS) ctx.wrap(() => {
            const momentumAngle = atan2(this.momentum.position.y, this.momentum.position.x);

            ctx.lineWidth = 10;
            ctx.strokeStyle = '#ff0';
            ctx.beginPath();
            ctx.moveTo(this.position.x, this.position.y);
            ctx.lineTo(this.position.x + cos(momentumAngle) * 100, this.position.y + sin(momentumAngle) * 100)
            ctx.stroke();

            const ground = firstItem(this.world.category(Ground));
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

        this.controls.raiseWheel = downKeys[37];
        this.controls.lowerWheel = downKeys[39];
        this.controls.jump = downKeys[32];
        this.controls.brake = downKeys[40];
        this.controls.accelerate = downKeys[38];

        if (this.controlsOverride) {
            for (const key in this.controls) {
                this.controls[key] = this.controlsOverride[key];
            }
        }

        this.comboTracker.cycle(elapsed);
    }
}
