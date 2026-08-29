CanvasRenderingContext2D.prototype.wrap = function(f) {
    this.save();
    const res = f();
    this.restore();
    return res;
};
