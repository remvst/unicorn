class ValueChangeHelper {
    change(x) {
        const res = [this.x, x];
        this.x = x;
        return res;
    }
}
