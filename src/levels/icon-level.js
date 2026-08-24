class IconLevel extends Level {
    async setup() {
        this.world.clearCategory(Flash);
        this.world.clearCategory(Foreground);

        const background = firstItem(this.world.category(Background));
        background.rng.seed(7);

        const { camera, ground, player } = this;

        camera.zoom = 8;
        camera.offset.x = 0;
        camera.offset.y = 0.05;

        player.position.y = -1000;
        player.rotation = -PI / 6;
        player.renderable.balance = 0.5;

        const rainbow = this.world.add(new Rainbow());
        rainbow.position.x = player.position.x + -80;
        rainbow.position.y = player.position.y + 210;
        rainbow.age = 20;
        rainbow.radius = 200;

        const originalRender = player.render;
        player.render = () => {
            const distFromRainbow = pointDistance(rainbow.position.x + rainbow.radius, rainbow.position.y, player.position.x, player.position.y);
            const originalAngle = atan2(
                player.position.y - rainbow.position.y,
                player.position.x - (rainbow.position.x + rainbow.radius),
            );

            const origX = player.position.x;
            const origY = player.position.y;
            const origRotation = player.rotation;

            for (let ratio = 0; ratio < 1; ratio += 0.01) {
                ctx.wrap(() => {
                    ctx.globalAlpha = interpolate(0.02, 0, ratio);

                    const a = originalAngle - ratio * PI / 8;
                    player.position.x = rainbow.position.x + rainbow.radius + cos(a) * distFromRainbow;
                    player.position.y = rainbow.position.y + sin(a) * distFromRainbow;
                    originalRender.call(player);
                    player.position.x = origX;
                    player.position.y = origY;
                    player.rotation = origRotation;
                });
            }

            originalRender.call(player);
        };

        this.world.remove(ground);

        await new Promise((r) => {});
    }
}
