function* allLevels() {
    // const allObjectives = [
    //     new Objective('DO A BACKFLIP'.toUpperCase(), 3, (world) => awaitTrick(world, backflip)),
    //     new Objective('COMBO BACKFLIP + FRONTFLIP'.toUpperCase(), 3, (world) => awaitCombo(world, comboMust(
    //         haveDistinctLandedTricks(
    //             backflip,
    //             frontflip,
    //         ),
    //     ))),
    //     new Objective('COMBO BACKFLIP + BACKFLIP'.toUpperCase(), 3, (world) => awaitCombo(world, comboMust(
    //         haveDistinctLandedTricks(
    //             ...repeatedTrick(2, backflip),
    //         )
    //     ))),
    //     new Objective('GET AIR TIME', 3, (world) => awaitTrick(world, anyAir)),
    // ];

    // Single trick: tricks that the user only needs to perform once, in front of unicorns
    const singleTricksObjectives = [
        //     single trick: frontflip
        //     single trick: double backflip
        //     single trick: double frontflip
        //     single trick: triple backflip
    ];

    // Combo size: number of tricks in a combo
    const comboSizeObjectives = [
        //     combo size: 5X combo
        //     combo size: 10X combo
        //     combo size: 15X combo
        //     combo size: 20X combo
        //     combo size: 30X combo
        //     combo size: 40X combo
        //     combo size: 50X combo
    ];

    const comboTricksObjectives = [
        //     combo: 3 flips
        //     combo: wheelie + backflip
        //     combo: backflip + frontflip
        //     combo: 3 wheelies
        //     combo: double backflip + wheelie
        //     combo: nosewheelie + frontflip combo
        //     combo: 3 frontflips
        //     combo: 5 wheelies
        //     combo: 10 flips
        //     combo: 5 backflips + 5 frontflips
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
