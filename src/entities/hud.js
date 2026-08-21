class HUD extends Entity {
    render() {
        const player = firstItem(this.world.category(Player));
        if (!player) return;

        this.cancelCameraTransformations();

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
                l.push(trick.label.toUpperCase()); // TODO these should all be uppercase in the first place so we don't need to call toUpperCase()
                if (l.length > 3) lines.push([]);
            }
            for (const l of lines) {
                if (l.length) y += epicText(l.join(' + '), 0, y) + 15;
            }

            const w = player.comboTracker.comboPower * 200
            ctx.fillStyle = '#fff';
            ctx.fillRect(-w / 2, y, w, 5);
        });

        if (firstItem(this.world.category(Objective))) {
            ctx.wrap(() => {
                ctx.translate(CANVAS_WIDTH - 20, 20);
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                ctx.strokeStyle = '#000';

                let y = 0;

                ctx.font = 'bold 36pt Arial';
                ctx.fillStyle = '#5ca5c7';
                y += epicText(nomangle('GOALS:'), 0, y) + 30;

                ctx.font = 'bold 18pt Arial';
                ctx.fillStyle = '#fff';
                for (const objective of this.world.category(Objective)) {
                    const deet = objective.detail ? ':   ' + objective.detail : '';
                    y += epicText(objective.label + deet, 0, y) + 30;
                }
            });
        }

        if (G.bestCombo) ctx.wrap(() => {
            ctx.translate(20, 20);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.strokeStyle = '#000';

            let y = 0;

            ctx.font = 'bold 36pt Arial';
            ctx.fillStyle = '#5ca5c7';
            y += epicText(nomangle('BEST COMBO:'), 0, y) + 30;

            ctx.font = 'bold 18pt Arial';
            ctx.fillStyle = '#fff';
            y += epicText(G.bestCombo.toLocaleString('en'), 0, y) + 30;
        });
    }
}
