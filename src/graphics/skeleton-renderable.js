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

lineRenderable = (from, to, thickness = 2) => () => {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = '#fff';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

circleRenderable = (center, radius, thickness = 2) => () => {
    ctx.lineWidth = thickness;
    ctx.strokeStyle = ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, PI * 2);
    if (thickness) ctx.stroke(); else ctx.fill();
}

