class HUD extends Entity {
    render() {
        const player = firstItem(this.world.category('bike'));
        const camera = firstItem(this.world.category('camera'));
        if (!player) return;

        ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2);

        const trickString = player.comboTracker.tricks.map(t => t.label + `(${t.points.toFixed(0)})`).join(' + ').toUpperCase();
        if (trickString) {
            ctx.wrap(() => {
                ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6);

                // Tricks
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 18pt Arial';
                ctx.textBaseline = 'top';
                ctx.textAlign = 'center';
                ctx.lineWidth = 1;
                ctx.strokeStyle = '#000';
                ctx.fillText(
                    trickString,
                    0,
                    0,
                );
                ctx.strokeText(
                    trickString,
                    0,
                    0,
                );

                const scoreLine = player.comboTracker.points.toFixed(0);
                ctx.fillText(scoreLine, 0, 50);
                ctx.strokeText(scoreLine, 0, 50);

                // Combo timer
                ctx.fillStyle = '#fff';
                const w = player.comboTracker.comboPower * 200;
                ctx.fillRect(-w / 2, 100, w, 10);
            });
        }
    }
}
