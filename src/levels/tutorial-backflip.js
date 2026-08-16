class TutorialBackflip extends Level {
    setup({
        world,
        player,
        ground,
        camera,
    }) {
        (async () => {
            const previousLevelEndX = this.flattenGround(ground);

            // Add a unicorn at the beginning
            const uc = world.add(new Unicorn());
            uc.position.x = previousLevelEndX + CANVAS_WIDTH / 2;
            uc.facing = -1;

            // Wait for the player to reach the unicorn
            await waitFor(world, () => player.position.x > uc.position.x - 400);
            player.controlsOverride = {brake: true};

            // Force the player to land
            camera.interp(camera, 'zoom', camera.zoom, 2, 0.3);
            await waitFor(world, (elapsed) => {
                player.rotation += between(-elapsed * PI / 4, -player.rotation, elapsed * PI / 4);
                return player.rotation === 0;
            });

            // Give instructions
            console.log('Wow, you\'re really good at it!');
            console.log('(in case you couldn\'t tell, that was sarcasm)');
            console.log('Anyway do you think you can backflip over those hills?');
            await uc.interp(uc.position, 'bs', 0, 0, 2);

            // Make the unicorn go away
            uc.facing = 1;
            uc.walking = true;
            await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH / 2, 2);
            uc.world.remove(uc);

            // Restore player control
            player.controlsOverride = null;
            camera.interp(camera, 'zoom', camera.zoom, 1, 0.3);

            const levelStartX = this.transitionIntoCurve(ground, new PerlinCurve({ step: 500, amplitude: 200 }));

            this.world.add(new Objective('Do a backflip', (p) => {
                return p.position.x > levelStartX + 500; // TODO fix predicate
            }));
        })();
    }
}
