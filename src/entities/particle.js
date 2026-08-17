class Particle extends Entity {

    static pool = new Set();

    reset() {
        super.reset();
        this.alpha = 1;
        this.size = 1;
        this.rotation = 0;
        this.color = '#fff';
    }

    render() {
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    }

    async animate(duration, values) {
        const interps = [];
        for (const [propertyKey, offset] of Object.entries(values)) {
            let owner = this;
            if (propertyKey === 'x' || propertyKey === 'y') {
                owner = this.position;
                // console.log('yaya', owner[propertyKey]);
            }
            interps.push(this.interp(owner, propertyKey, owner[propertyKey], owner[propertyKey] + offset, duration));
        }
        await Promise.all(interps);
        this.world.remove(this);
    }
}

dustCloud = ({
    world,
    position,
    radius,
    density,
    duration,
    x,
    y,
    size,
    alpha,
    color,
}) => {
    const getValue = (x) => x.length ? rnd(x[0], x[1]) : x;

    const area = 2 * PI * radius * radius;
    const count = area * density;

    for (let i = 0 ; i < count ; i ++) {
        const angle = random() * PI * 2;
        const dist = random() * radius;

        const p = Entity.recycle(Particle);
        p.position.x = position.x + cos(angle) * dist;
        p.position.y = position.y + sin(angle) * dist;
        p.rotation = random() * PI;
        p.size = size;
        p.color = color || '#fff';
        world.add(p);

        p.animate(getValue(duration), {
            x: getValue(x || 0),
            y: getValue(y || 0),
            // size: getValue(size || 0),
            alpha: getValue(alpha || -1),
        });
    }
}
