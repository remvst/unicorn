onload = () => {
    if (WAVEDASH) {
        Wavedash.updateLoadProgressZeroToOne(0);
    }

    can = nomangle(g);
    ctx = can.getContext('2d');

    onresize();

    G = new Game();

    if (WAVEDASH) {
        Wavedash.updateLoadProgressZeroToOne(1);
        Wavedash.init({ debug: true });
    }
}

onclick = () => playSong();
