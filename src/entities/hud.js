class HUD extends Entity {
    render() {
        const player = firstItem(this.world.category('bike'));
        const camera = firstItem(this.world.category('camera'));
        if (!player) return;

        ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2);

        const trickString = player.comboTracker.startedTricks.map(t => t.label + `(${t.points.toFixed(0)})`).join(' + ').toUpperCase();
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
                ctx.fillText(trickString, 0, 0);

                const scoreLine = player.comboTracker.points.toFixed(0);
                ctx.fillText(scoreLine, 0, 50);
                ctx.strokeText(scoreLine, 0, 50);

                // Combo timer
                ctx.fillStyle = '#fff';
                const w = player.comboTracker.comboPower * 200;
                ctx.fillRect(-w / 2, 100, w, 10);
            });
        }



        ctx.font = 'bold 18pt Arial';

        const padding = 10;

        const objectives = [...this.world.category('objective')];
        const longest = 500;

        const metrics = ctx.measureText('1');
        const boxHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + padding * 2;

        const x = CANVAS_WIDTH - longest - padding;
        let y = padding;

        // console.log(height);

        for (const objective of objectives) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(x, y, longest, boxHeight);

            ctx.fillStyle = '#fff';
            ctx.textBaseline = 'middle';

            ctx.textAlign = 'left';
            ctx.fillText(
                objective.label,
                x + padding,
                y + boxHeight / 2,
            );

            ctx.textAlign = 'right';
            ctx.fillText(
                objective.detail,
                x + longest - padding,
                y + boxHeight / 2,
            );

            y += boxHeight + padding;
        }
    }
}
