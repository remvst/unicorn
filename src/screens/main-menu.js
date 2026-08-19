class MainMenu extends Screen {

    constructor() {
        super();
        this.absorb = false;
    }

    render() {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        const colors = [...RAINBOW_COLORS, '#FFC0CB'];
        const rainbowGradient = ctx.createLinearGradient(-200, 0, 200, 0);
        for (let i = 0; i < colors.length ; i++) {
            rainbowGradient.addColorStop(i / colors.length, colors[i]);
            rainbowGradient.addColorStop((i + 0.5) / colors.length, colors[i]);
        }

        ctx.wrap(() => {
            ctx.textBaseline = 'bottom';
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

            let y = 0;

            ctx.font = 'bold 24pt Impact';
            ctx.fillStyle = '#5ca5c7';
            y -= epicText(document.title.split(':')[1].trim(), 0, 0) + 5;

            ctx.font = 'bold 64pt Impact';
            ctx.fillStyle = '#fff';
            y -= epicText('BACKFLIPS', 0, y) + 15
            ctx.wrap(() => {
                ctx.fillStyle = rainbowGradient;
                y -= epicText('RAINBOWS \'N', 0, y) + 15;
            });
            y -= epicText('UNICORNS', 0, y) + 15;
        });

        ctx.font = 'bold 24pt Impact';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        if (this.age % 3 > 0.5) epicText('[SPACE] to start', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7);
    }
}
