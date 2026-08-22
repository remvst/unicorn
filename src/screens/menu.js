RAINBOW_PATTERN = (() => {
    const tmp = document.createElement('canvas');
    tmp.width = 400;
    tmp.height = 1;

    const ctx = tmp.getContext('2d');

    const rainbowGradient = ctx.createLinearGradient(0, 0, tmp.width, 0);
    for (let i = 0; i <= RAINBOW_COLORS.length; i++) {
        const ratio = i / (RAINBOW_COLORS.length + 1);
        rainbowGradient.addColorStop(ratio, RAINBOW_COLORS[i % RAINBOW_COLORS.length]);
        rainbowGradient.addColorStop((ratio + 0.05), RAINBOW_COLORS[i % RAINBOW_COLORS.length]);
    }

    ctx.fillStyle = rainbowGradient;
    ctx.fillRect(0, 0, 400, 1);

    return ctx.createPattern(tmp, 'repeat');
})();

class Menu extends Screen {
    renderTitle(lines, subtitle) {
        ctx.lineWidth = 20;
        ctx.strokeStyle = '#000';

        ctx.wrap(() => {
            ctx.strokeStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.translate(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

            let y = 0;

            ctx.font = 'bold 24pt Impact';
            ctx.fillStyle = '#5ca5c7';
            if (subtitle) {
                y -= epicText(subtitle, 0, 0).h;
            }

            ctx.font = 'bold 64pt Impact';
            for (let i = lines.length - 1; i >= 0; i--) {
                ctx.fillStyle = i % 2 ? RAINBOW_PATTERN : '#fff';
                const idx = lines[i].indexOf(nomangle('RAINBOWS'));
                const colorChanges = i % 2
                    ? [
                        [0, RAINBOW_PATTERN],
                        [8, '#fff']
                    ] : null;
                y -= epicText(lines[i], 0, y, this.age * 400, colorChanges).h;
            }
        });
    }

    renderButton(l) {
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = '#000';
        ctx.font = 'bold 24pt Impact';
        if (this.age % 2 > 0.5) epicText(l, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.7);
    }
}
