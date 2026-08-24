class SkeletonRenderable {

    constructor() {
        this.pieces = [];
    }

    prepend(...pieces) {
        this.pieces.unshift(...pieces);
        return this;
    }

    add(...pieces) {
        this.pieces.push(...pieces);
        return this;
    }

    render() {
        for (const renderer of this.pieces) {
            renderer();
        }
    }

    prependShadow() {
        this.prepend(...[
            () => {
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
            },
            ...this.pieces,
            () => {
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            },
        ]);
    }
}

setColor = (x) => () => {
    ctx.strokeStyle = ctx.fillStyle = x;
}

setThickness = (x) => () => {
    ctx.lineWidth = x;
}

setLineCap = (x) => () => {
    ctx.lineCap = x;
}

lineRenderable = (from, to) => () => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

circleRenderable = (center, radius, fill = false) => () => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, PI * 2);
    if (fill) ctx.fill(); else ctx.stroke();
}
