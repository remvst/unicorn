function * superclassesOf(cls) {
    let proto = Object.getPrototypeOf(cls);
    while (proto && proto !== Function.prototype) {
        yield proto;
        proto = Object.getPrototypeOf(proto);
    }
};
