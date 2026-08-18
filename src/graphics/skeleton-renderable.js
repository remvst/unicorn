class SkeletonRenderable {

    constructor() {
        this.pieces = [];
    }

    add(renderer) {
        this.pieces.push(renderer);
        return this;
    }

    render() {
        for (const renderer of this.pieces) {
            renderer();
        }
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

