class Prompt extends Entity {
    constructor(label) {
        super();
        this.label = label;
    }

    render() {
        this.cancelCameraTransformations();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.font = 'bold 36pt Arial';
        ctx.fillStyle = '#fff';
        epicText(this.label, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);
    }
}
