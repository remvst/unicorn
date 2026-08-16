class LevelOutcome extends Entity {
    constructor(success) {
        super();
        this.success = success;
        this.categories.push('outcome');
    }
}
