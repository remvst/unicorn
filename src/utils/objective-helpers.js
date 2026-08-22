
awaitTrick = async (world, predicate) => {
    const player = firstItem(world.category(Player));
    const exludeTricks = new Set(player?.comboTracker.landedTricks || []);

    await waitFor(world, () => {
        const player = firstItem(world.category(Player));
        if (!player) return;

        for (const trick of player.comboTracker.landedTricks) {
            if (predicate(trick) && !exludeTricks.has(trick)) {
                exludeTricks.add(trick);
                return true;
            }
        }
    });
}

awaitChange = async (world, valueGetter) => {
    const value = valueGetter();
    await waitFor(world, () => valueGetter() !== value);
}

awaitCombo = async (world, predicate) => {
    await awaitChange(world, () => firstItem(world.category(Player))?.comboTracker.startedTricks.length === 0);
    await waitFor(world, () => {
        const player = firstItem(world.category(Player));
        return player && predicate(player.comboTracker);
    });
}

// Trick matchers
trickMustContainLabel = label => (trick) => trick.label.includes(label);
trickMustHaveLabel = label => (trick) => trick.label.includes(label);

anyFlip = trickMustContainLabel(nomangle('FL'));
anyWheelie = trickMustContainLabel(nomangle('WH'));
anyAir = trickMustContainLabel(nomangle('AIR'));

backflip = trickMustHaveLabel(nomangle('BACKFLIP'));
frontflip = trickMustHaveLabel(nomangle('FRONTFLIP'));
wheelie = trickMustHaveLabel(nomangle('WHEELIE'));
nosewheelie = trickMustContainLabel(nomangle('NOSEWH'));

// Combo matchers
comboMustNot = predicate => {
    return (comboTracker) => !predicate(comboTracker)
}

repeat = (x, obj) => {
    const res = [];
    while (x--) res.push(obj);
    return res;
}

comboSizeMustBe = size => comboTracker => comboTracker.startedTricks.length >= size;

comboMustHaveAll = predicates => (comboTracker) => !predicates.some((p) => !p(comboTracker));

comboMustHaveTricks = predicates => {
    const matchingTricks = new Set();
    return (comboTracker) => {
        matchingTricks.clear();

        predicateLoop: for (const predicate of predicates) {
            for (const trick of comboTracker.landedTricks) {
                if (!matchingTricks.has(trick) && predicate(trick)) {
                    matchingTricks.add(trick);
                    continue predicateLoop;
                }
            }
            return; // one predicate didn't match, stop here and return false
        }

        return true;
    }
}
