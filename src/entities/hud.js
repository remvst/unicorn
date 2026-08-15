class HUD extends Entity {

    constructor() {
        super();
    }

    render() {
        const player = firstItem(this.world.category('bike'));
        const camera = firstItem(this.world.category('camera'));
        if (!player) return;


        ctx.fillStyle = '#fff';
        ctx.font = '24pt Arial';

        let y = camera.position.y;
        for (const trick of player.comboTracker.tricks) {
            ctx.fillText(
                trick.label,
                camera.position.x,
                y,
            );
            y += 20;
        }
    }
}
