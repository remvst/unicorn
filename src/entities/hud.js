class HUD extends Entity {
    renderCombo(player, ongoing) {
        ctx.lineWidth = 20;

        if (player.comboTracker.startedTricks.length) ctx.wrap(() => {
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7);
            ctx.fillStyle = ongoing ? '#fff' : '#900';
            ctx.strokeStyle = ongoing ? '#000' : '#400';
            ctx.font = 'bold 24pt Impact';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'center';

            const comboNumber = `${player.comboTracker.points}   X ${player.comboTracker.startedTricks.length}`;
            const comboNumberSize = ctx.wrap(() => {
                if (ongoing) ctx.globalAlpha = 0.5;
                return epicText(comboNumber, 0, 0);
            });

            if (ongoing) ctx.wrap(() => {
                const w = comboNumberSize.w + 50;
                ctx.beginPath();
                ctx.rect(-w / 2, -50, w * player.comboTracker.comboPower, 100);
                ctx.clip();

                const z = ctx.fillStyle;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.strokeStyle = z;
                epicText(comboNumber, 0, 0);
            });

            let y = comboNumberSize.h;

            ctx.font = 'bold 18pt Impact';

            const lines = [[]];
            for (const trick of player.comboTracker.startedTricks) {
                const l = lines[lines.length - 1];
                if (l.length > 5) lines.push([trick]);
                else l.push(trick)
            }
            for (const l of lines) {
                const colorChanges = [];
                let acc = '';
                for (const trick of l) {
                    if (acc.length) acc += ' + ';
                    if (trick.inFrontOfAudience && ongoing) colorChanges.push([acc.length, RAINBOW_PATTERN], [acc.length + trick.label.length, '#fff']);
                    acc += trick.label;
                }

                if (l.length) y += epicText(acc, 0, y, this.age * 100, colorChanges).h;
            }
        });
    }

    render() {
        if (!G || !(G.screens[G.screens.length - 1] instanceof WorldScreen)) return;

        this.cancelCameraTransformations();

        const player = firstItem(this.world.category(Player));
        if (player) this.comboAnimateOutAge = this.age;
        this.lastPlayer = player || this.lastPlayer;
        this.renderCombo(this.lastPlayer, !!player);

        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 20;

        if (firstItem(this.world.category(Objective))) {
            ctx.wrap(() => {
                ctx.translate(CANVAS_WIDTH - 40, 40);
                ctx.textAlign = 'right';

                let y = 0;

                ctx.font = 'bold 36pt Arial';
                ctx.fillStyle = '#5ca5c7';
                y += epicText(nomangle('GOALS:'), 0, y).h + 15;

                ctx.font = 'bold 18pt Arial';
                ctx.fillStyle = '#fff';
                for (const objective of this.world.category(Objective)) {
                    ctx.globalAlpha = objective.completed ? 0.5 : 1;
                    const { w, h } = epicText(objective.label + (objective.detail ? ':   ' + objective.detail : ''), 0, y);

                    if (objective.completed) {
                        ctx.fillRect(-w + ctx.lineWidth, y + h / 2, w, 2);
                    }
                    y += h + 15;
                }
            });
        }

        if (G.bestCombo) ctx.wrap(() => {
            ctx.translate(40, 40);
            ctx.textAlign = 'left';

            let y = 0;

            ctx.font = 'bold 36pt Arial';
            ctx.fillStyle = '#5ca5c7';
            y += epicText(nomangle('BEST COMBO:'), 0, y).h + 15;

            ctx.font = 'bold 18pt Arial';
            ctx.fillStyle = '#fff';
            y += epicText(G.bestCombo.toLocaleString('en'), 0, y).h + 15;
        });
    }
}
