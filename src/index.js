onload = () => {
    if (WAVEDASH && !ICON_MODE) {
        Wavedash.updateLoadProgressZeroToOne(0);
    }

    can = nomangle(g);
    ctx = can.getContext('2d');

    onresize();

    G = new Game();

    if (WAVEDASH && !ICON_MODE) {
        Wavedash.updateLoadProgressZeroToOne(1);
        Wavedash.init({ debug: true });
    }
}

onclick = () => playSong();
