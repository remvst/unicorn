class Waiter extends Entity {
    awaitResolution(predicate) {
        this.predicate = predicate
        return new Promise(resolve => this.resolve = resolve);
    }

    cycle(elapsed) {
        super.cycle(elapsed);
        if (this.predicate(elapsed)) {
            this.world.remove(this);
            this.resolve();
        }
    }
}

waitFor = (world, predicate) => world.add(new Waiter()).awaitResolution(predicate);
waitForDuration = (world, duration) => {
    let total = 0;
    return world.add(new Waiter()).awaitResolution((elapsed) => {
        total += elapsed;
        return total > duration;
    });
}
