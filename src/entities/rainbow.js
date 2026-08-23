class Rainbow extends Entity {

    constructor() {
        super();
        this.radius = rnd(50, 200);
    }

    cycle(elapsed) {
        super.cycle(elapsed);

        const camera = firstItem(this.world.category(Camera));
        if (this.position.x < camera.position.x - CANVAS_WIDTH) {
            this.world.remove(this);
        }
    }

    render() {
        ctx.translate(this.position.x, this.position.y);

        const sweep = interpolate(0, PI * 2, this.age / (0.5));

        const thickness = 10;

        ctx.globalAlpha = 0.5;

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
    const ground = firstItem(aroundEntity.world.category(Ground));

    let x = aroundEntity.position.x;
    for (let i = 0 ; i < 5 ; i++) {
        let age = ground.age;

        x = max(aroundEntity.position.x, x + 150);

        const rainbow = Entity.recycle(Rainbow);
        rainbow.position.x = x;
        rainbow.position.y = ground.curveAt(x) + 20;
        ground.world.add(rainbow);

        zzfx(...[.2,,657,.08,.11,.25,,.6,,351,,,,.3,,,,.9,.19,,511]); // Powerup 142

        await waitFor(ground.world, () => ground.age > age + 0.2);
    }
}
