epicText = (text, x, y, shiftX = 0) => ctx.wrap(() => {
    ctx.translate(x, y);

    // Shear the canvas a bit
    ctx.transform(1, 0, -0.25, 1, 0, 0);

    const padding = ctx.lineWidth / 2;
    const metrics = ctx.measureText(text);

    ctx.wrap(() => {
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fillRect(
            -metrics.actualBoundingBoxLeft - padding,
            -metrics.actualBoundingBoxAscent - padding,
            metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft + padding * 2,
            (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding * 2,
        );
    });

    ctx.translate(shiftX, 0);
    ctx.fillText(text, -shiftX, 0);

    return {
        w: metrics.actualBoundingBoxRight + metrics.actualBoundingBoxLeft + padding * 2,
        h: (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + padding,

        t: y - (metrics.actualBoundingBoxAscent),
        b: y + metrics.actualBoundingBoxDescent,
    };
});
