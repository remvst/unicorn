class LevelFrontflip extends Level {
    async setup() {
        const levelStartX = await this.levelTransition({
            dialog: [
                'Yooo that was pretty gnarly',
                'Did you know sick combos created rainbows?',
                'More rainbows = happier unicorns',
                'Happier unicorns = more magic in the world',
                'So anyway, go make some rainbows!',
            ],
            curve: regularLevel(),
        });

        this.world.add(new AudienceUnicorn()).position.x = levelStartX + 400;
        this.world.add(new AudienceUnicorn()).position.x = levelStartX + 600;

        await this.runObjectives({
            objectives: [
                new Objective('frontflip in front of unicorns'.toUpperCase(), 1, () => awaitTrick(this.world, t => t.label === 'frontflip' && t.inFrontOfAudience)),
                new Objective(`3 FLIPS IN ONE COMBO`.toUpperCase(), 1, () => awaitCombo(this.world, [
                    t => t.label.includes('flip'),
                    t => t.label.includes('flip'),
                    t => t.label.includes('flip'),
                ])),
            ],
        });
    }
}
