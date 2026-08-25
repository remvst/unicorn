class TrickAttackLevel extends Level {
    async setup() {
        await this.transitionIntoCurve(regularLevel());
        await this.announceLevelTitle(0, nomangle('TRICK ATTACK'));

        this.world.addUnique(new ItemGenerator());
        this.world.addUnique(new UnicornGenerator());

        const combos = new Set();

        const totalScore = () => {
            return [...combos].filter(c => c.validated).reduce((a, combo) => a + combo.totalPoints, 0);
        };

        const obj = new Objective('', 1, async (world) => {
            const startAge = world.age;

            // For for the timer
            await waitFor(world, () => {
                const { player } = this;
                if (player) combos.add(player.comboTracker);

                const totalTime = world.age - startAge;
                const timeLeft = max(0, 120 - totalTime);
                obj.label = nomangle('TIME LEFT: ') + ~~(timeLeft);
                return !timeLeft && !player?.comboTracker.startedTricks.length;
            });
        });

        const scoreObj = new Objective('', 1, (world) => {
            return waitFor(world, () => {
                scoreObj.label = nomangle('SCORE: ') + totalScore().toLocaleString('en');
                return obj.completed
            });
        });

        await this.runObjectives({
            objectives: [scoreObj, obj],
        });

        await this.world.addUnique(new Prompt(nomangle('FINAL SCORE: ') + totalScore().toLocaleString('en'))).removeWhenAgeIs(5);
    }
}
