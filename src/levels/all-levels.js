function* allLevels() {
    const allObjectives = [
        new Objective('DO A BACKFLIP'.toUpperCase(), 3, (world) => awaitTrick(world, backflip)),
        new Objective('COMBO BACKFLIP + FRONTFLIP'.toUpperCase(), 3, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(
                backflip,
                frontflip,
            ),
        ))),
        new Objective('COMBO BACKFLIP + BACKFLIP'.toUpperCase(), 3, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(
                ...repeatedTrick(2, backflip),
            )
        ))),
        new Objective('GET AIR TIME', 3, (world) => awaitTrick(world, anyAir)),
    ];

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
