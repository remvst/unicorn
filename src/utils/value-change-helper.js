class ValueChangeHelper {
    change(x) {
        this.initted ||= (this.x = x) || 1;

        const res = [this.x, x];
        this.x = x;
        return res;
    }
}

changeDiff = (change) => change[1] - change[0];
