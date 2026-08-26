
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

awaitCombo = async (world, predicate) => {
    await waitFor(world, () => {
        const player = firstItem(world.category(Player));
        return player && predicate(player.comboTracker);
    });
}

// Trick matchers
trickMust = (...predicates) => trick => !predicates.some(p => !p(trick))
haveLabel = label => (trick) => trick.label === label;
haveMultiplier = multiplier => (trick) => trick.multiplier >= multiplier;
containLabel = label => (trick) => trick.label.includes(label);
beInFrontOfAudience = () => (trick) => trick.inFrontOfAudience;

anyFlip = containLabel(nomangle('FL'));
anyWheelie = containLabel(nomangle('WH'));
anyAir = containLabel(nomangle('AIR'));
anyStomp = containLabel(nomangle('STOMP'));

backflip = containLabel(nomangle('BACKFLIP'));
frontflip = containLabel(nomangle('FRONTFLIP'));
wheelie = haveLabel(nomangle('WHEELIE'));
nosewheelie = containLabel(nomangle('NOSEWH'));

doubleBackflip = trickMust(haveLabel(nomangle('DOUBLE BACKFLIP')), haveMultiplier(2));
tripleBackflip = trickMust(haveLabel(nomangle('TRIPLE BACKFLIP')), haveMultiplier(3));
doubleFrontflip = trickMust(haveLabel(nomangle('DOUBLE FRONTFLIP')), haveMultiplier(2));
tripleFrontflip = trickMust(haveLabel(nomangle('TRIPLE FRONTFLIP')), haveMultiplier(3));

// Combo matchers
comboMust = (...predicates) => (comboTracker) => !predicates.some((p) => !p(comboTracker));

beOfSize = size => comboTracker => comboTracker.multiplier >= size;

repeatedTrick = (x, predicate) => {
    const res = [];
    while (x--) res.push(predicate);
    return res;
}
haveDistinctLandedTricks = (...predicates) => {
    const remainingTricks = new Map();
    return (comboTracker) => {
        remainingTricks.clear();
        for (const trick of comboTracker.landedTricks) {
            remainingTricks.set(trick, trick.multiplier);
        }

        predicateLoop: for (const predicate of predicates) {
            for (const [trick, count] of remainingTricks.entries()) {
                if (count > 0 && predicate(trick)) {
                    remainingTricks.set(trick, count - 1);
                    continue predicateLoop;
                }
            }
            return; // one predicate didn't match, stop here and return false
        }

        return true;
    }
}
