class Prompt extends Entity {
    constructor(label) {
        super();
        this.label = label;
    }

    render() {
        if (!G || !(G.screens[G.screens.length - 1] instanceof WorldScreen)) return;

        this.cancelCameraTransformations();

        ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 4);

        const s = interpolate(0, 1, easeOutBack(this.age / 0.3))
        ctx.scale(s, s);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 20;
        ctx.font = 'bold 36pt Arial';
        ctx.fillStyle = '#fff';
        epicText(this.label, 0, 0);
    }
}
