
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
trickMust = (...predicates) => trick => !predicates.some(p => !p(trick))
haveLabel = label => (trick) => trick.label.includes(label);
containLabel = label => (trick) => trick.label.includes(label);
beInFrontOfAudience = () => (trick) => trick.inFrontOfAudience;

anyFlip = containLabel(nomangle('FL'));
anyWheelie = containLabel(nomangle('WH'));
anyAir = containLabel(nomangle('AIR'));

backflip = haveLabel(nomangle('BACKFLIP'));
frontflip = haveLabel(nomangle('FRONTFLIP'));
wheelie = haveLabel(nomangle('WHEELIE'));
nosewheelie = containLabel(nomangle('NOSEWH'));

// Combo matchers
comboMust = (...predicates) => (comboTracker) => !predicates.some((p) => !p(comboTracker));

beOfSize = size => comboTracker => comboTracker.startedTricks.length >= size;

repeatedTrick = (x, predicate) => {
    const res = [];
    while (x--) res.push(predicate);
    return res;
}
haveDistinctLandedTricks = (...predicates) => {
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
