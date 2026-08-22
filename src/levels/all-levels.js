function* allLevels() {
    const doA = nomangle('DO A ');
    const inFrontOfAUnicorn = nomangle(' IN FRONT OF A UNICORN');
    const combo = nomangle('COMBO: ');

    // Single trick: tricks that the user only needs to perform once, in front of unicorns
    const singleTricksObjectives = [
        new Objective(doA + nomangle('FRONTFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(frontflip, beInFrontOfAudience()))),
        new Objective(doA + nomangle('DOUBLE BACKFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(doubleBackflip, beInFrontOfAudience()))),
        new Objective(doA + nomangle('DOUBLE FRONTFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(doubleFrontflip, beInFrontOfAudience()))),
        new Objective(doA + nomangle('TRIPLE BACKFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(tripleBackflip, beInFrontOfAudience()))),
    ];

    // Combo size: number of tricks in a combo
    const comboSizeObjectives = [
        new Objective(doA + nomangle('5X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(5)))),
        new Objective(doA + nomangle('10X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(10)))),
        new Objective(doA + nomangle('15X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(15)))),
        new Objective(doA + nomangle('20X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(20)))),
        new Objective(doA + nomangle('30X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(30)))),
        new Objective(doA + nomangle('40X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(40)))),
        new Objective(doA + nomangle('50X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(50)))),
    ];

    const comboTricksObjectives = [
        new Objective(combo + nomangle('3 FLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, anyFlip)),
        ))),
        new Objective(combo + nomangle('WHEELIE + BACKFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(wheelie, backflip),
        ))),
        new Objective(combo + nomangle('BACKFLIP + FRONTFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(backflip, frontflip),
        ))),
        new Objective(combo + nomangle('3 WHEELIES'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, wheelie)),
        ))),
        new Objective(combo + nomangle('DOUBLE BACKFLIP + WHEELIE'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(doubleBackflip, wheelie),
        ))),
        new Objective(combo + nomangle('NOSEWHEELIE + FRONTFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(nosewheelie, frontflip),
        ))),
        new Objective(combo + nomangle('3 FRONTFLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, frontflip)),
        ))),
        new Objective(combo + nomangle('5 WHEELIES'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(5, wheelie)),
        ))),
        new Objective(combo + nomangle('10 FLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(10, anyFlip)),
        ))),
        new Objective(combo + nomangle('5 BACKFLIPS + 5 FRONTFLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(5, backflip), ...repeatedTrick(5, frontflip)),
        ))),
    ];

    const allObjectives = [];
    while (singleTricksObjectives.length + comboSizeObjectives.length + comboTricksObjectives.length) {
        allObjectives.push(...[
            singleTricksObjectives.shift(),
            comboSizeObjectives.shift(),
            comboTricksObjectives.shift(),
        ].filter(Boolean));
    }

    function pickNextMainObjectives() {
        return allObjectives.filter(o => !o.completed).slice(0, 3);
    }

    yield new TutorialPedal();
    yield new TutorialFlips();
    yield new TutorialJumps();
    yield new MainLevel(pickNextMainObjectives())
    yield new TutorialStomp();
    yield new MainLevel(pickNextMainObjectives())
    yield new TutorialWheelies();
    while (true) {
        const objectives = pickNextMainObjectives();
        if (!objectives.length) break;
        yield new MainLevel(objectives);
    }
    yield new LevelFinale();
}
