RAINBOW_COLORS = [
    '#f00',
    '#f80',
    '#ff0',
    '#0f0',
    '#00f',
    '#408',
    '#80f',
]

class Rainbow extends Entity {

    constructor() {
        super();
        this.categories.push('rainbow');
        this.radius = rnd(50, 200);
    }

    render() {
        ctx.translate(this.position.x, this.position.y);

        const sweep = interpolate(0, PI * 2, this.age / (0.5));

        const thickness = 10;

        let { radius } = this;
        for (const color of RAINBOW_COLORS) {

            ctx.lineWidth = thickness;
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.arc(this.radius, 0, radius + thickness, PI, PI + sweep);
            ctx.stroke();

            radius -= thickness;
        }
    }
}

spawnRainbows = async (aroundEntity) => {
    const ground = firstItem(aroundEntity.world.category('ground'));

    let x = aroundEntity.position.x;
    for (let i = 0 ; i < 5 ; i++) {
        let age = ground.age;

        x = max(aroundEntity.position.x, x + 150);

        const rainbow = Entity.recycle(Rainbow);
        rainbow.position.x = x;
        rainbow.position.y = ground.curveAt(x) + 20;
        ground.world.add(rainbow);

        await waitFor(ground.world, () => ground.age > age + 0.2);
    }
}
