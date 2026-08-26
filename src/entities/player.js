class Player extends Bike {
    constructor() {
        super();
        this.comboTracker = new ComboTracker(this);
    }

    onWheelLanded(wheel, momentumYBefore) {
        zzfx(...[.5,,29,.01,.03,.02,3,2,,-24,-181,.22,,.8,,,,.7,.01,,-1362]); // Blip 79

        dustCloud({
            world: this.world,
            position: {
                x: wheel.absolute.position.x,
                y: wheel.absolute.position.y + wheel.radius,
            },
            radius: interpolate(5, 15, abs(momentumYBefore) / 1000),
            density: 1 / (5 * 5),
            duration: [0.25, 1],
            x: [-40, 0],
            y: [-20, 0],
            size: 5,
        });
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

        updateControls(this.controls);

        if (this.controlsOverride) {
            for (const key in this.controls) {
                this.controls[key] = this.controlsOverride[key];
            }
        }

        this.comboTracker.cycle(elapsed);
    }
}
