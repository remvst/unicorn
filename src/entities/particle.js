class Particle extends Entity {

    alpha = 1;
    size = 1;
    rotation = 0;

    render() {
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    animate(duration, values) {
        const interps = [];
        for (const [propertyKey, offset] of Object.entries(values)) {
            let owner = this;
            if (propertyKey === 'x' || propertyKey === 'y') {
                owner = this.position;
                // console.log('yaya', owner[propertyKey]);
            }
            interps.push(this.interp(owner, propertyKey, owner[propertyKey], owner[propertyKey] + offset, duration));
        }
        return Promise.all(interps)
            .then(() => this.world.remove(this));
    }
}
