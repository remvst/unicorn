class MainMenu extends Screen {

    constructor() {
        super();
        this.absorb = false;
    }

    render() {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 72pt Impact';
        ctx.textAlign = 'center';

        const [title, subtitle] = document.title.split(':');

        ctx.font = 'bold 64pt Impact';
        ctx.fillText(title.trim(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);

        ctx.font = 'bold 24pt Impact';
        ctx.fillText(subtitle.trim(), CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3 + 50);
    }
}
