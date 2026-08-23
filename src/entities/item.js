class Item extends Entity {

    constructor() {
        super();

        this.gradient = ctx.createLinearGradient(-50, 0, 50, 0);
        this.gradient.addColorStop(0, 'rgba(255,255,255,0)');
        this.gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)');
        this.gradient.addColorStop(1, 'rgba(255,255,255,0)');
    }

    render() {
        ctx.translate(this.position.x, this.position.y);

        for (const speed of [PI, -PI / 2]) {
            ctx.wrap(() => {
                ctx.rotate(this.age * speed);
                ctx.fillStyle = this.gradient;
                ctx.fillRect(-50, -10, 100, 20);
            });
        }

        const s = 1 + sin(this.age * PI * 2) * 0.1;
        ctx.scale(s, s);

        ctx.lineWidth = 2;
        ctx.fillStyle = '#ff0';
        ctx.strokeStyle = '#fff';
        starShape(5, 15, 8);
        ctx.fill();
        ctx.stroke();
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        for (const bike of this.world.category(Bike)) {
            if (distance(this.position, bike.position) < 50) {
                this.world.remove(this);
                zzfx(...[.4,,657,.08,.11,.25,,.6,,351,,,,.3,,,,.9,.19,,511]); // Powerup 142

                const angle = firstItem(this.world.category(Ground)).curve.angleFor(this.position.x);
                bike.momentum.position.x += cos(angle) * 100;
                bike.momentum.position.y += sin(angle) * 100;

                dustCloud({
                    world: this.world,
                    position: this.position,
                    radius: 10,
                    density: 1 / (5 * 5),
                    duration: [0.25, 1],
                    x: [-40, 40],
                    y: [-40, 40],
                    size: 10,
                    color: '#ff0',
                });
            }
        }
    }
}

class ItemGenerator extends EntityGenerator {
    constructor() {
        super(Item, CANVAS_WIDTH * 4, 5, 50);
    }
}
