let can,
    ctx,
    G, // world
    canvasPrototype = CanvasRenderingContext2D.prototype,
    CANVAS_WIDTH = 1600,
    CANVAS_HEIGHT = 900;

inputMode = navigator.userAgent.match(nomangle(/andro|ipho|ipa|ipo/i)) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ? INPUT_MODE_TOUCH
    : INPUT_MODE_KEYBOARD;

RAINBOW_COLORS = [
    '#f66',
    '#f96',
    '#ff6',
    '#6f6',
    '#6cf',
    '#66f',
    '#c6f',
];
