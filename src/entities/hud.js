class HUD extends Entity {

    constructor() {
        super();
    }

    render() {
        const player = firstItem(this.world.category('bike'));
        const camera = firstItem(this.world.category('camera'));
        if (!player) return;

        ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2);

        // Tricks
        ctx.fillStyle = '#fff';
        ctx.font = '24pt Arial';
        ctx.textBaseline = 'top';
        let y = 10;
        for (const trick of player.comboTracker.tricks) {
            ctx.fillText(
                trick.label,
                10,
                y,
            );
            y += 20;
        }

        // Power
        ctx.fillStyle = '#222';
        ctx.fillRect(0, 0, 200, 10);

        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 200 * player.power, 10);
    }
}
