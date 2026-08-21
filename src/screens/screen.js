class Screen {
    age = 0;

    constructor() {
        this.pauseChange = new ValueChangeHelper();

        if (DEBUG) this.debugValues = () => {
            return [
                `${this.constructor.name}: age: ${this.age}`,
            ];
        };
    }

    cycle(elapsed) {
        this.age += elapsed;
    }

    render() {

    }
}
