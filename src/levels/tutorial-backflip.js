class TutorialBackflip extends Level {
    setup({
        world,
        player,
        ground
    }) {
        (async () => {
            const previousLevelEndX = this.flattenGround(ground);

            // Add a unicorn at the beginning
            const uc = world.add(new Unicorn());
            uc.position.x = previousLevelEndX + CANVAS_WIDTH / 2;
            uc.facing = -1;

            // Wait for the player to reach the unicorn
            await waitFor(world, () => player.position.x > uc.position.x);
            // TODO disable controls

            // Make the unicorn go away
            uc.facing = 1;
            uc.walking = true;
            await uc.interp(uc.position, 'x', uc.position.x, uc.position.x + CANVAS_WIDTH, 5);
            uc.world.remove(uc);

            // TODO enable controls

            const levelStartX = this.transitionIntoCurve(ground, new PerlinCurve({ step: 500, amplitude: 200 }));

            this.world.add(new Objective('Do a backflip', (p) => {
                return p.position.x > levelStartX + 500; // TODO fix predicate
            }));
        })();
    }
}
