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

    get isForeground() {
        return G && G.screens[G.screens.length - 1] === this
    }
}
