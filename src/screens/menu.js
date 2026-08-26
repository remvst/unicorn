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
    cycle(elapsed) {
        super.cycle(elapsed);
        this.nextButtonY = CANVAS_HEIGHT * 0.7;
        this.nextTitleY = CANVAS_HEIGHT / 2;
    }

    renderTitleLine(l) {
        ctx.lineWidth = 20;
        ctx.strokeStyle = '#000';

        ctx.wrap(() => {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.translate(0, this.nextTitleY);

            const x = CANVAS_WIDTH / 2 + interpolate(
                CANVAS_WIDTH,
                0,
                smoothstep(between(0, (this.age - this.nextTitleDelay) / 1, 1)),
            );
            this.nextTitleY += epicText(
                l,
                x,
                0,
                this.age * 400,
            ).t - 12;
        });
    }

    renderTitle(lines, subtitle) {
        this.nextTitleDelay = lines.length > 1 ? 0.9 : -1;

        if (subtitle) {
            ctx.font = 'bold 24pt Impact';
            ctx.fillStyle = '#5ca5c7';
            this.renderTitleLine(subtitle);
            this.nextTitleDelay -= 0.3;
        }

        ctx.font = 'bold 64pt Impact';
        for (let i = lines.length - 1; i >= 0; i--) {
            ctx.fillStyle = i % 2 ? RAINBOW_PATTERN : '#fff';
            this.renderTitleLine(lines[i]);
            this.nextTitleDelay -= 0.3;
        }
    }

    renderButton(l) {
        ctx.wrap(() => {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.strokeStyle = '#000';
            ctx.font = 'bold 24pt Impact';
            if (this.age % 2 < 0.5) ctx.globalAlpha = 0;
            this.nextButtonY = epicText(l, CANVAS_WIDTH / 2, this.nextButtonY).b + 30;
        });
    }

    renderVolumeButton() {
        this.renderButton(nomangle('[V] - VOLUME: ') + globalVolume() + '%');
    }
}
