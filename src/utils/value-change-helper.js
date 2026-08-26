class ValueChangeHelper {
    change(x) {
        this.initted ||= (this.x = x) || 1;

        this.res ||= [];
        this.res[0] = this.x;
        this.res[1] = x;
        this.x = x;
        return this.res;
    }
}

changeDiff = (change) => change[1] - change[0];
