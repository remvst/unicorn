createNumberGenerator = seed => {
    const ints = new Uint32Array(2);

    const generateFloat = () => {
        const s0 = ints[0];
        const s1 = ints[1] ^ s0;
        ints[0] = (s0 << 26 | s0 >> 8) ^ s1 ^ s1 << 9;
        ints[1] = s1 << 13 | s1 >> 19;
        return (imul(s0, 0x9e3779bb) >>> 0) / 0xffffffff;
    };

    const rng = {
        'seed': (x) => {
            seed = x;
            rng.reset();
        },
        'reset': () => {
            ints[0] = imul(seed, 0x85ebca6b);
            ints[1] = imul(seed, 0xc2b2ae35);
        },
        'pick': a => a[~~(generateFloat() * a.length)],
        'between': (a, b) => generateFloat() * (b - a) + a,
        'floating': generateFloat,
    };
    rng.reset();
    return rng;
};
