function* withSavedProgress(generator) {
    let startAt = parseInt(readLocalStorage(LOCALSTORAGE_PROGRESS_KEY)) || 0;
    if (startAt && !confirm(nomangle("Resume where you left off?"))) {
        startAt = 0;
    }

    let i = 0;

    // Skip until we get the level we want
    for (; i < startAt; i++) {
        generator.next();
    }

    // Then yield levels as normal
    for (const level of generator) {
        yield level;
        writeLocalStorage(LOCALSTORAGE_PROGRESS_KEY, ++i);
    }
}

function allObjectives() {
    const doA = nomangle('DO A ');
    const getA = nomangle('GET A ');
    const landA = nomangle('LAND A ');
    const inFrontOfAUnicorn = nomangle(' IN FRONT OF UNICORNS');
    const combo = nomangle('IN ONE COMBO: ');

    return [
        new Objective(getA + nomangle('3X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(3)))),
        new Objective(doA + nomangle('FRONTFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(frontflip, beInFrontOfAudience()))),
        new Objective(landA + nomangle('DOUBLE BACKFLIP'), 1, (world) => awaitTrick(world, doubleBackflip)),

        new Objective(getA + nomangle('5X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(5)))),
        new Objective(combo + nomangle('3 FLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, anyFlip)),
        ))),
        new Objective(combo + nomangle('BACKFLIP + FRONTFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(backflip, frontflip),
        ))),

        new Objective(getA + nomangle('10X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(10)))),
        new Objective(combo + nomangle('WHEELIE + BACKFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(wheelie, backflip),
        ))),
        new Objective(doA + nomangle('DOUBLE BACKFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(doubleBackflip, beInFrontOfAudience()))),
        new Objective(combo + nomangle('NOSEWHEELIE + FRONTFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(nosewheelie, frontflip),
        ))),
        new Objective(landA + nomangle('DOUBLE FRONTFLIP'), 1, (world) => awaitTrick(world, doubleFrontflip)),

        new Objective(combo + nomangle('2 FLIPS') + inFrontOfAUnicorn, 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(2, trickMust(anyFlip, beInFrontOfAudience()))),
        ))),
        new Objective(getA + nomangle('15X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(15)))),
        new Objective(combo + nomangle('BACKFLIP AND FRONTFLIP') + inFrontOfAUnicorn, 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(
                trickMust(backflip, beInFrontOfAudience()),
                trickMust(frontflip, beInFrontOfAudience()),
            ),
        ))),
        new Objective(combo + nomangle('3 WHEELIES'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, wheelie)),
        ))),
        new Objective(combo + nomangle('DOUBLE BACKFLIP + WHEELIE'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(doubleBackflip, wheelie),
        ))),
        new Objective(landA + nomangle('TRIPLE BACKFLIP'), 1, (world) => awaitTrick(world, tripleBackflip)),
        new Objective(combo + nomangle('3 FRONTFLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(3, frontflip)),
        ))),
        new Objective(getA + nomangle('20X COMBO'), 1, (world) => awaitCombo(world, comboMust(beOfSize(20)))),
        new Objective(landA + nomangle('TRIPLE FRONTFLIP'), 1, (world) => awaitTrick(world, tripleFrontflip)),
        new Objective(combo + nomangle('10 FLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(10, anyFlip)),
        ))),
        new Objective(combo + nomangle('5 BACKFLIPS + 5 FRONTFLIPS'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(5, backflip), ...repeatedTrick(5, frontflip)),
        ))),
        new Objective(combo + nomangle('5 WHEELIES'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(...repeatedTrick(5, wheelie)),
        ))),
        new Objective(combo + nomangle('TRIPLE BACKFLIP + TRIPLE FRONTFLIP'), 1, (world) => awaitCombo(world, comboMust(
            haveDistinctLandedTricks(tripleBackflip, tripleFrontflip),
        ))),

        // new Objective(doA + nomangle('DOUBLE FRONTFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(doubleFrontflip, beInFrontOfAudience()))),
        // new Objective(doA + nomangle('TRIPLE BACKFLIP') + inFrontOfAUnicorn, 1, (world) => awaitTrick(world, trickMust(tripleBackflip, beInFrontOfAudience()))),
        //
        // TODO wheelie + nosewheelie
        // TODO backflip and frontflip in front of unicorn (same combo)
    ];
}

function* allLevels() {
    const titles = [
        nomangle('SPARKLE PLAINS'),
        nomangle('STARRY HILLS'),
        nomangle('RAINBOW MEADOWS'),
        nomangle('GLITTERING FIELDS'),
        nomangle('CELESTIAL VALLEY'),
        nomangle('MAGICAL RIDGE'),
        nomangle('TWINKLEWOOD'),
    ];

    const objectives = allObjectives();

    function pickNextMainObjectives() {
        return [
            objectives.shift(),
            objectives.shift(),
            objectives.shift(),
        ].filter(Boolean);
    }

    function pickNextTitle() {
        const title = titles.shift();
        titles.push(title);
        return title;
    }

    yield new TutorialPedal();
    yield new TutorialFlips();
    yield new TutorialJumps();
    yield new MainLevel(pickNextTitle(), pickNextMainObjectives())
    yield new TutorialStomp();
    yield new MainLevel(pickNextTitle(), pickNextMainObjectives())
    yield new TutorialWheelies();
    while (true) {
        const objectives = pickNextMainObjectives();
        if (!objectives.length) break;
        yield new MainLevel(pickNextTitle(), objectives);
    }
    yield new LevelFinale();
    yield* trickAttackMode();
}

function* trickAttackMode() {
    while (true) {
        yield new TrickAttackLevel();
    }
}
