
class Segment {
    constructor(p1, p2) {
        this.p1 = p1 || new Point();
        this.p2 = p2 || new Point();
    }

    render() {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#f00';
        ctx.fillRect(this.p1.x - 2, this.p1.y - 2, 4, 4);
        ctx.fillRect(this.p2.x - 2, this.p2.y - 2, 4, 4);
    }

    collidesWith(hitbox) {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const fx = hitbox.position.x - this.p1.x;
        const fy = hitbox.position.y - this.p1.y;
        const lenSq = dx * dx + dy * dy;
        const t = lenSq > 0 ? Math.max(0, Math.min(1, (fx * dx + fy * dy) / lenSq)) : 0;
        const closestX = this.p1.x + t * dx;
        const closestY = this.p1.y + t * dy;
        const distX = hitbox.position.x - closestX;
        const distY = hitbox.position.y - closestY;
        return distX * distX + distY * distY <= hitbox.radius * hitbox.radius;
    }

    readjust(hitbox, out) {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const fx = hitbox.position.x - this.p1.x;
        const fy = hitbox.position.y - this.p1.y;
        const lenSq = dx * dx + dy * dy;
        const t = lenSq > 0 ? Math.max(0, Math.min(1, (fx * dx + fy * dy) / lenSq)) : 0;
        const closestX = this.p1.x + t * dx;
        const closestY = this.p1.y + t * dy;
        const distX = hitbox.position.x - closestX;
        const distY = hitbox.position.y - closestY;
        const dist = Math.sqrt(distX * distX + distY * distY);
        if (dist > 0) {
            const penetration = hitbox.radius - dist;
            out.x = (distX / dist) * penetration;
            out.y = (distY / dist) * penetration;
        } else {
            // Circle center exactly on segment: push along segment normal
            const len = Math.sqrt(lenSq);
            out.x = (dy / len) * hitbox.radius;
            out.y = (-dx / len) * hitbox.radius;
        }

        return out;
    }
}
