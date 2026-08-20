class HUD extends Entity {
    render() {
        const player = firstItem(this.world.category('player'));
        const camera = firstItem(this.world.category('camera'));
        if (!player) return;

        ctx.translate(camera.position.x - CANVAS_WIDTH / 2, camera.position.y - CANVAS_HEIGHT / 2);

        if (player.comboTracker.startedTricks.length) ctx.wrap(() => {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18pt Arial';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';
            ctx.strokeStyle = '#000';

            let y = 0;

            y += epicText(`${player.comboTracker.points}   X ${player.comboTracker.startedTricks.length}`, 0, y) + 15;

            const lines = [[]];
            for (const trick of player.comboTracker.startedTricks) {
                const l = lines[lines.length - 1];
                l.push(trick.label);
                if (l.length > 3) lines.push([]);
            }
            for (const l of lines) {
                if (l.length) y += epicText(l.join(' + '), 0, y) + 15;
            }

            ctx.fillStyle = '#fff';
            ctx.fillRect(-200 / 2, y, player.comboTracker.comboPower * 200, 5);
        });

        ctx.translate(CANVAS_WIDTH - 20, 20);

        ctx.font = 'bold 18pt Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';

        let y = 0;

        ctx.font = 'bold 36pt Arial';
        ctx.fillStyle = '#5ca5c7';
        y += epicText(nomangle('GOALS:'), 0, y) + 30;

        ctx.font = 'bold 18pt Arial';
        ctx.fillStyle = '#fff';
        for (const objective of this.world.category('objective')) {
            const deet = objective.detail ? ':   ' + objective.detail : '';
            y += epicText(objective.label + deet, 0, y) + 30;
        }
    }
}
