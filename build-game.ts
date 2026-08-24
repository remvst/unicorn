import { EVALUATE, NOMANGLE, assembleHtml, hardcodeConstants, macro, mangle } from "@remvst/js13k-tools";
import CleanCSS from 'clean-css';
import { promises as fs } from 'fs';
import { minify as minifyHTML } from 'html-minifier';
import { Packer } from 'roadroller';
import * as terser from 'terser';
import yargs from 'yargs/yargs';

const JS_FILES = [
    'globals.js',

    'graphics/wrap.js',
    'graphics/skeleton-renderable.js',
    'graphics/star.js',
    'graphics/typography.js',

    'utils/math.js',
    'utils/resizer.js',
    'utils/first-item.js',
    'utils/segment.js',
    'utils/hitbox.js',
    'utils/cache.js',
    'utils/easing.js',
    'utils/perlin-curve.js',
    'utils/value-change-helper.js',
    'utils/rng.js',
    'utils/superclasses.js',
    'utils/curves.js',
    'utils/objective-helpers.js',

    'tricks/trick.js',
    'tricks/trick-tracker.js',
    'tricks/combo-tracker.js',

    'input/keyboard.js',
    'input/touch.js',

    'screens/screen.js',
    'screens/world-screen.js',
    'screens/menu.js',
    'screens/main-menu.js',
    'screens/pause-menu.js',

    'model/entity.js',
    'model/world.js',

    'entities/entity-generator.js',
    'entities/camera.js',
    'entities/ground.js',
    'entities/physics-object.js',
    'entities/bike.js',
    'entities/player.js',
    'entities/hud.js',
    'entities/particle.js',
    'entities/interpolator.js',
    'entities/unicorn.js',
    'entities/item.js',
    'entities/background.js',
    'entities/foreground.js',
    'entities/objective.js',
    'entities/waiter.js',
    'entities/rainbow.js',
    'entities/gibs.js',
    'entities/autopilot-bike.js',
    'entities/prompt.js',
    'entities/flash.js',

    'levels/level.js',
    'levels/intro-level.js',
    'levels/tutorial-pedal.js',
    'levels/tutorial-flips.js',
    'levels/tutorial-jumps.js',
    'levels/tutorial-stomp.js',
    'levels/tutorial-wheelies.js',
    'levels/main-level.js',
    'levels/level-finale.js',
    'levels/trick-attack-level.js',
    'levels/all-levels.js',

    'sound/ZzFXMicro.js',
    'sound/zzfxm.js',
    'sound/zzfxm-song.js',
    'sound/play-song.js',

    'game.js',
    'index.js',
];

const CONSTANTS = {
    "true": 1,
    "false": 0,
    "const": "let",
    "null": 0,
    "Infinity": 999,

    "SONG_VOLUME": 0.5,

    "INPUT_MODE_KEYBOARD": 0,
    "INPUT_MODE_TOUCH": 1,

    "DEBUG_INFO": 1,
    "DEBUG_COLLISIONS": 0,
    "DEBUG_TRICKS": 0,

    "GROUND_CURVE_STEP": 10,

    "BACKGROUND_COLOR_COUNT": 3,
    "BACKGROUND_CURVE_STEP": 50,
    "BACKGROUND_CURVE_COUNT": 5,

    "AUDIENCE_RADIUS": 500,

    "MOBILE_BUTTON_SIZE": 100,
};

const MANGLE_PARAMS = {
    "skip": [
        "repeat",
        "actualBoundingBoxLeft",
        "actualBoundingBoxRight",
        "actualBoundingBoxAscent",
        "actualBoundingBoxDescent",

        // DOM elements
        "canvas",

        // Font stuff
        "Impact",
        "bold",
        "Arial",

        // Text alignment stuff
        "left",
        "right",
        "center",
        "bottom",
        "top",
        "middle",
        "alphabetic",
    ],
    "force": [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "alpha",
        "background",
        "direction",
        "ended",
        "key",
        "level",
        "maxDistance",
        "remove",
        "speed",
        "item",
        "wrap",
        "angle",
        "target",
        "path",
        "step",
        "color",
        "expand",
        "label",
        "action",
        "normalize",
        "duration",
        "message",
        "name",
        "ratio",
        "index",
        "controls",
        "attack",
        "end",
        "description",
        "resolve",
        "reject",
        "category",
        "update",
        "error",
        "endTime",
        "aggressivity",
        "radiusX",
        "radiusY",
        "state",
        "rotation",
        "contains",
        "zoom",
        "object",
        "entity",
        "Entity",
        "entities",
        "timeout",
        "frame",
        "line",
        "elements",
        "text",
        "source",
        "frequency",
        "type",
        "matrix",
        "transitionProgress",
        "acceleration",
        "animate",
        "navigate",
        "position",
        "setColor",
        "setLineCap",
        "curve",
        "amplitude",
        "screenX",
        "screenY",
    ]
};

const argv = yargs(process.argv.slice(2)).options({
    debug: { type: 'boolean', default: false },
    mangle: { type: 'boolean', default: false },
    minify: { type: 'boolean', default: false },
    beautify: { type: 'boolean', default: false },
    icon: { type: 'boolean', default: false },
    'roadroll-level': { type: 'number', default: 0 },
    pack: { type: 'boolean', default: false },
    html: { type: 'string', demandOption: true },
}).parse();

(async () => {
    const constants: Record<string, string | number | boolean> = {
        DEBUG: argv.debug,
        ICON_MODE: argv.icon,
        ...CONSTANTS,
    };

    let html = await fs.readFile('src/index.html', 'utf-8');
    let css = await fs.readFile('src/style.css', 'utf-8');

    const jsFiles = [...JS_FILES];

    if (constants.DEBUG) jsFiles.push('levels/test-level.js');
    if (constants.ICON_MODE) jsFiles.push('levels/icon-level.js');

    let js = (await Promise.all(
        jsFiles.map(path => fs.readFile('src/' + path, 'utf-8')))
    ).join('\n');

    js = hardcodeConstants(js, constants);
    js = macro(js, NOMANGLE);
    js = macro(js, EVALUATE);

    if (argv.mangle) {
        console.log('Mangling...');
        js = mangle(js, MANGLE_PARAMS);
    }

    if (argv.minify) {
        console.log('Minifying...');
        js = (await terser.minify(js, {
            mangle: {
                properties: false,
                toplevel: true,
            }
        })).code!;
    }

    if (argv.beautify) {
        js = (await terser.minify(js, {
            format: {
                beautify: true
            },
        })).code!;
    }

    if (argv['roadroll-level'] > 0) {
        console.log('Roadrolling (level ' + argv['roadroll-level'] + ')...');
        const packer = new Packer([
            {
                data: js,
                type: 'js',
                action: 'eval',
            },
        ], {
            // see the Usage for available options.
        });
        await packer.optimize(argv['roadroll-level']);
        const { firstLine, secondLine } = packer.makeDecoder();
        js = firstLine + secondLine;
    }

    if (argv.minify) {
        html = minifyHTML(html, {
            collapseWhitespace: true,
            minifyCSS: false,
            minifyJS: false
        });

        css = new CleanCSS().minify(css).styles;
    }

    const finalHtml = assembleHtml({ html, css, js });

    await fs.mkdir('build/', { recursive: true });
    await fs.writeFile(argv.html, finalHtml);
})();
