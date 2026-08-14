class Cache {
    getOrCreate(key, create) {
        if (!this.cached || this.lastKey !== key) {
            this.cached = create();
            this.lastKey = key;
        }
        return this.cached;
    }
}
