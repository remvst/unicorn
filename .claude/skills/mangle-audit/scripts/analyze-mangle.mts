#!/usr/bin/env -S npx tsx
/**
 * Analyzes the *mangled* (but not minified/roadrolled) build output and
 * compares it against the unmangled build + the current MANGLE_PARAMS in
 * build-game.ts, to find:
 *
 *   - words that survive mangling only because they collide with a
 *     protected DOM/keyword name (`PROTECTED_NAMES.dom`, from the
 *     js13k-tools package already installed in this repo) and aren't yet
 *     in MANGLE_PARAMS.force -> "candidates" to add to force, PENDING a
 *     manual check that they aren't a real API call in this codebase
 *   - words that survive mangling for some other, unexplained reason (e.g.
 *     wrapped in nomangle(), or only present in string/template content)
 *     -> "unexplained", investigate before touching MANGLE_PARAMS
 *   - entries already in MANGLE_PARAMS.force/skip that are dead weight:
 *     either unused in the source entirely, or "ineffective" (were never
 *     actually protected in the first place, so forcing them is a no-op)
 *
 * Run from the repo root: `npx tsx .claude/skills/mangle-audit/scripts/analyze-mangle.mts`
 *
 * This script is read-only: it never edits build-game.ts. It prints a
 * JSON report to stdout for a human (or the mangle-audit skill) to act on.
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
// strip-comments is a transitive dependency of @remvst/js13k-tools, already
// installed. The library's own analyze()/mangle() strip comments before
// looking for identifiers (see mangle.ts's cleanString/hasMatch), so do the
// same here to avoid flagging words that only appear in comments/license text.
import stripComments from 'strip-comments';

const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const BUILD_GAME_TS = path.join(REPO_ROOT, 'build-game.ts');

// The package's "exports" map only publishes the root entry point, which
// doesn't re-export PROTECTED_NAMES. Import the compiled file directly by
// path (not by bare specifier) to sidestep that restriction.
const protectedNamesPath = path.join(REPO_ROOT, 'node_modules/@remvst/js13k-tools/lib/esm/protected-names.js');
const { PROTECTED_NAMES } = await import(pathToFileURL(protectedNamesPath).href) as {
    PROTECTED_NAMES: { keywords: string[]; dom: string[] };
};

function extractScript(html: string): string {
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    if (!match) throw new Error('Could not find <script> tag in build output');
    return match[1];
}

function extractBalancedObjectLiteral(source: string, marker: string): string {
    const start = source.indexOf(marker);
    if (start === -1) throw new Error(`Could not find "${marker}" in build-game.ts`);
    const braceStart = source.indexOf('{', start);
    let depth = 0;
    let i = braceStart;
    for (; i < source.length; i++) {
        if (source[i] === '{') depth++;
        else if (source[i] === '}') {
            depth--;
            if (depth === 0) { i++; break; }
        }
    }
    return source.substring(braceStart, i);
}

function tokenize(code: string): string[] {
    return code.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || [];
}

// PROTECTED_NAMES.keywords (from the js13k-tools package) is not a complete
// ECMAScript reserved-word list, and a few real reserved words (e.g.
// "continue", "of") also happen to appear in PROTECTED_NAMES.dom (probably
// because they coincide with some DOM/Intl API name). Forcing an actual
// language keyword would rename JS syntax itself and break the build, so
// this full list is checked unconditionally, independent of what the
// package ships or how a word is otherwise classified.
const RESERVED_WORDS = new Set([
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
    'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
    'function', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'let',
    'new', 'null', 'of', 'package', 'private', 'protected', 'public', 'return',
    'static', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'undefined',
    'var', 'void', 'while', 'with', 'yield', 'async', 'await',
]);

function countOccurrences(tokens: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
    return counts;
}

async function main() {
    const buildGameSource = await fs.readFile(BUILD_GAME_TS, 'utf-8');

    const mangleParamsLiteral = extractBalancedObjectLiteral(buildGameSource, 'const MANGLE_PARAMS');
    const MANGLE_PARAMS: { skip: string[]; force: string[] } =
        new Function('return ' + mangleParamsLiteral)();

    const tmpDir = os.tmpdir();
    const unmangledPath = path.join(tmpDir, 'mangle-audit-unmangled.html');
    const mangledPath = path.join(tmpDir, 'mangle-audit-mangled.html');

    console.error('Building unmangled reference...');
    execSync(`npx tsx build-game.ts --debug --html=${JSON.stringify(unmangledPath)}`, { cwd: REPO_ROOT, stdio: 'ignore' });

    console.error('Building mangled (unminified) output...');
    execSync(`npx tsx build-game.ts --debug --mangle --html=${JSON.stringify(mangledPath)}`, { cwd: REPO_ROOT, stdio: 'ignore' });

    const unmangledJs = extractScript(await fs.readFile(unmangledPath, 'utf-8'));
    const mangledJs = extractScript(await fs.readFile(mangledPath, 'utf-8'));

    const unmangledTokenSet = new Set(tokenize(stripComments(unmangledJs)));
    const mangledCounts = countOccurrences(tokenize(stripComments(mangledJs)));

    const domSet = new Set(PROTECTED_NAMES.dom);
    const keywordSet = new Set(PROTECTED_NAMES.keywords);
    const skipSet = new Set(MANGLE_PARAMS.skip);
    const forceSet = new Set(MANGLE_PARAMS.force);

    // Candidates: words the mangler left alone only because they collide
    // with a PROTECTED_NAMES.dom entry, and that aren't already in force
    // or skip. Every one of these still needs a human/Claude sanity check
    // (grep its real usage) before being added to force - PROTECTED_NAMES.dom
    // lists names that *could* be a browser API, not names that *are* one
    // in this codebase, so it errs on the side of over-protecting.
    const candidates: { word: string; occurrences: number }[] = [];
    const unexplained: { word: string; occurrences: number }[] = [];
    const anomalies: { word: string; occurrences: number }[] = [];

    for (const [word, occurrences] of mangledCounts.entries()) {
        if (word.length < 3) continue; // real mangled names are 1-2 chars for this codebase's size
        if (!unmangledTokenSet.has(word)) continue; // wasn't in our source to begin with
        if (RESERVED_WORDS.has(word) || keywordSet.has(word)) continue; // never force real JS keywords

        const isDomProtected = domSet.has(word);
        const inSkip = skipSet.has(word);
        const inForce = forceSet.has(word);

        if (inSkip) continue; // intentionally protected, nothing to report

        if (isDomProtected && inForce) {
            // it's forced, but still leaking -> something else is protecting it
            // (e.g. only appears inside a /*nomangle*/ block or a string)
            anomalies.push({ word, occurrences });
        } else if (isDomProtected) {
            candidates.push({ word, occurrences });
        } else {
            // survived mangling but we can't explain why via PROTECTED_NAMES
            // (e.g. wrapped in nomangle(), or only present in string/template content)
            unexplained.push({ word, occurrences });
        }
    }

    const removeFromForceUnused: string[] = [];
    const removeFromForceIneffective: string[] = [];
    for (const word of MANGLE_PARAMS.force) {
        if (!unmangledTokenSet.has(word)) {
            removeFromForceUnused.push(word);
        } else if (!domSet.has(word) && !keywordSet.has(word) && !skipSet.has(word)) {
            // forcing it is a no-op: it was never going to be protected anyway
            removeFromForceIneffective.push(word);
        }
    }

    const removeFromSkipUnused: string[] = [];
    for (const word of MANGLE_PARAMS.skip) {
        if (!unmangledTokenSet.has(word)) {
            removeFromSkipUnused.push(word);
        }
    }

    const sortByWord = <T extends { word: string }>(a: T, b: T) => a.word.localeCompare(b.word);

    const report = {
        candidates: candidates.sort(sortByWord),
        unexplained: unexplained.sort(sortByWord),
        anomalies: anomalies.sort(sortByWord),
        removeFromForce: {
            unused: removeFromForceUnused.sort(),
            ineffective: removeFromForceIneffective.sort(),
        },
        removeFromSkip: {
            unused: removeFromSkipUnused.sort(),
        },
    };

    console.log(JSON.stringify(report, null, 2));

    await fs.unlink(unmangledPath).catch(() => {});
    await fs.unlink(mangledPath).catch(() => {});
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
