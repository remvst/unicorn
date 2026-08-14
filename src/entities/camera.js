class Camera extends Entity {
    constructor() {
        super();
        this.categories.push('camera');
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        // TODO follow player
        // console.log('I follow player')


        let x = 0, y = 0;
        if (downKeys[37]) x = -1;
        if (downKeys[39]) x = 1;
        if (downKeys[38]) y = -1;
        if (downKeys[40]) y = 1;

        if (x || y) {
            const angle = Math.atan2(y, x);
            this.position.x += cos(angle) * 100 * elapsed;
            this.position.y += sin(angle) * 100 * elapsed;
        }
    }

    render(elapsed) {
        if (DEBUG) {
            ctx.fillStyle = '#fff';
            ctx.fillRect(this.position.x, this.position.y, 10, 10);
        }
    }
}
