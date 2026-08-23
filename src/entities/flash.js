class Flash extends Entity {
    constructor() {
        super();
    }

    render() {
        this.cancelCameraTransformations();
        ctx.globalAlpha = interpolate(1, 0, this.age);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
}
