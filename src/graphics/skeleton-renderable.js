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

setColor = (color) => () => {
    ctx.strokeStyle = ctx.fillStyle = color;
    ctx.strokeStyle = color;
}

lineRenderable = (from, to, thickness = 2, cap = 'round') => () => {
    ctx.lineWidth = thickness;
    ctx.lineCap = cap;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

circleRenderable = (center, radius, thickness = 2) => () => {
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, PI * 2);
    if (thickness) ctx.stroke(); else ctx.fill();
}

