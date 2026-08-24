class TestLevel extends Level {
    async setup() {
        this.transitionIntoCurve(simpleBumps());

        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 200;
        }
        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 300;
        }
        {
            const uc = this.world.add(new AudienceUnicorn());
            uc.position.x = 400;
        }

        const allObjectives =
            [
                new Objective('DO A BACKFLIP'.toUpperCase(), 3, () => awaitTrick(this.world, backflip)),
                new Objective('COMBO BACKFLIP + FRONTFLIP'.toUpperCase(), 3, () => awaitCombo(this.world, comboMust(
                    haveDistinctLandedTricks(
                        backflip,
                        frontflip,
                    ),
                ))),
                new Objective('COMBO BACKFLIP + BACKFLIP'.toUpperCase(), 3, () => awaitCombo(this.world, comboMust(
                    haveDistinctLandedTricks(
                        ...repeatedTrick(2, backflip),
                    )
                ))),
                new Objective('GET AIR TIME', 3, () => awaitTrick(this.world, anyAir)),
            ];

        const remainingObjectives = allObjectives;

        for (let i = 0; ; i++) {
            await this.levelTransition({
                curve: regularLevel(),
                transition: (x) => this.announceLevelTitle(x, 'ENTERING:\nSUNNY HILLS')
            });

            this.world.clearCategory(Objective);

            const newObjectives = remainingObjectives.slice(0, 2);
            await this.runObjectives({
                objectives: newObjectives,
            });

            for (const obj of [...this.world.category(Objective)]) {
                if (obj.completed) {
                    this.world.remove(obj);

                    const index = remainingObjectives.indexOf(obj);
                    if (index >= 0) remainingObjectives.splice(index, 1);
                }
            }
        }

        await this.runObjectives({
            objectives: [
                new Objective('DO A BACKFLIP'.toUpperCase(), 3, () => awaitTrick(this.world, backflip)),
                new Objective('COMBO BACKFLIP + FRONTFLIP'.toUpperCase(), 3, () => awaitCombo(this.world, comboMust(
                    haveDistinctLandedTricks(
                        backflip,
                        frontflip,
                    ),
                ))),
                new Objective('COMBO BACKFLIP + BACKFLIP'.toUpperCase(), 3, () => awaitCombo(this.world, comboMust(
                    haveDistinctLandedTricks(
                        ...repeatedTrick(2, backflip),
                    )
                ))),
                new Objective('GET AIR TIME', 3, () => awaitTrick(this.world, anyAir)),

                // new Objective('COMBO 5X'.toUpperCase(), 3, () => awaitCombo(this.world, comboMust(beOfSize(5)))),
                // new Objective('COMBO 5X WITHOUT BACKFLIP'.toUpperCase(), 3, () => awaitCombo(this.world,
                //     comboMustHaveAll([
                //         comboMustNot(comboMustHaveTricks([backflip])),
                //         comboSizeMustBe(5),
                //     ]),
                // )),
                // new Objective('2 BACKFLIPS SAME COMBO'.toUpperCase(), 3, () => awaitCombo(this.world, [
                //     t => t.label.includes('backflip'),
                //     t => t.label.includes('backflip'),
                // ])),
                // new Objective('10,000 SCORE'.toUpperCase(), 1, () => new Promise(() => {})),
                // new Objective('WHEELIE IN FRONT OF UNICORNS'.toUpperCase(), 1, () => new Promise(() => {})),
            ]
        })

        await new Promise((r) => {});
    }
}
