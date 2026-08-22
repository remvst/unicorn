epicText = (text, x, y, shiftX = 0, colorChanges = []) => ctx.wrap(() => {
    ctx.translate(x, y);

    // Shear the canvas a bit
    ctx.transform(1, 0, -0.25, 1, 0, 0);

    const padding = ctx.lineWidth / 2;
    const metrics = ctx.measureText(text);

    ctx.wrap(() => {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(
            -metrics.actualBoundingBoxLeft,
            -metrics.actualBoundingBoxAscent,
            metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft + padding * 2,
            ceil(metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding * 2,
        );
    });

    ctx.translate(shiftX, 0);
    // ctx.fillText(text, padding - shiftX, padding);
    charByChar(text, padding - shiftX, padding, colorChanges)

    return {
        w: metrics.width + padding * 2,
        h: (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding * 2
    };
});

charByChar = (text, x, y, colorChanges = []) => ctx.wrap(() => {
    const metrics = ctx.measureText(text);
    if (ctx.textAlign === 'center') {
        ctx.translate(-metrics.width / 2, 0);
    }
    if (ctx.textAlign === 'right') {
        ctx.translate(-metrics.width, 0);
    }

    ctx.textAlign = 'left';

    for (let i = 0; i < text.length; i++) {
        while (colorChanges.length && i >= colorChanges[0][0]) {
            ctx.fillStyle = colorChanges.shift()[1];
        }

        const c = text.charAt(i);
        const metrics = ctx.measureText(c);
        ctx.fillText(c, x, y);
        x += metrics.width;
    }
});
