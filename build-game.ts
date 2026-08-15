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
    'utils/math.js',
    'utils/resizer.js',
    'utils/first-item.js',
    'utils/segment.js',
    'utils/hitbox.js',
    'utils/cache.js',
    'utils/easing.js',
    'utils/perlin-curve.js',
    'utils/value-change-helper.js',
    'input/keyboard.js',
    'screens/screen.js',
    'screens/world-screen.js',
    'model/entity.js',
    'model/world.js',
    'entities/camera.js',
    'entities/ground.js',
    'entities/physics-object.js',
    'entities/bike.js',
    'game.js',
    'index.js',
];

const CONSTANTS = {
    "true": 1,
    "false": 0,
    "const": "let",
    "null": 0,
    "Infinity": 999,

    "INPUT_MODE_KEYBOARD": 0,
    "INPUT_MODE_TOUCH": 1,

    "DEBUG_INFO": 0,
};

const MANGLE_PARAMS = {
    "skip": [
        "repeat",
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
        "center",
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
        "spikes",
        "type",
        "matrix",
        "transitionProgress",
        "water",
        "acceleration",
        "top",
        "left",
        "right",
        "bottom",
        "animate",
        "navigate",
    ]
};

const argv = yargs(process.argv.slice(2)).options({
    debug: { type: 'boolean', default: false },
    mangle: { type: 'boolean', default: false },
    minify: { type: 'boolean', default: false },
    'roadroll-level': { type: 'number', default: 0 },
    pack: { type: 'boolean', default: false },
    html: { type: 'string', demandOption: true },
}).parse();

const minifyMatrix = (matrix: number[][]): string => {
    return matrix.map(row => row.join('')).join('|');
}

const deminifyMatrix = (minified: string): number[][] => {
    return minified.split('|').map(row => row.split('').map(x => parseInt(x)));
}

const minifyLevel = (levelJson: any[]): string => {
    let js = '[';
    for (const entity of levelJson) {
        js += '{';
        for (const propertyKey in entity) {
            const propertyValue = entity[propertyKey];

            let value: any;
            if (propertyKey === "matrix") {
                value = 'deminifyMatrix(`' + minifyMatrix(propertyValue) + '`)';
            } else if (propertyValue === 0) {
                continue;
            } else if (propertyKey === "angle") {
                const inDegrees = Math.round(propertyValue * 180 / Math.PI);
                value = (inDegrees / 180) + ' * PI';
            } else if (propertyKey === "text") {
                value = 'nomangle(' + JSON.stringify(propertyValue) + ')';
            } else {
                value = JSON.stringify(propertyValue);
            }

            js += `${JSON.stringify(propertyKey)}: ${value},`;
        }
        js += '},';
    }
    js += ']';
    return js;
}

(async () => {
    const constants: Record<string, string | number | boolean> = {
        DEBUG: argv.debug,
        ...CONSTANTS,
    };

    let z = 0;
    for (const constant of [
        "Z_LABEL",
        "Z_MEOW",
        "Z_SPIKES",
        "Z_CAT",
        "Z_BULLET",
        "Z_PARTICLE",
        "Z_WATER",
        "Z_STRUCTURE",
        "Z_HUMAN",
        "Z_FLASH",
        "Z_HUD",
        "Z_CLAW",
    ]) {
        constants[constant] = z++;
    }

    let html = await fs.readFile('src/index.html', 'utf-8');
    let css = await fs.readFile('src/style.css', 'utf-8');

    const jsFiles = [...JS_FILES];

    let js = (await Promise.all(
        jsFiles.map(path => fs.readFile('src/' + path, 'utf-8')))
    ).join('\n');

    js += 'deminifyMatrix = ' + deminifyMatrix.toString() + ';\n\n';

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
