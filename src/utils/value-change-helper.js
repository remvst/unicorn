class ValueChangeHelper {
    change(x) {
        const res = [this.x ?? x, x];
        this.x = x;
        return res;
    }
}

changeDiff = (change) => change[1] - change[0];
