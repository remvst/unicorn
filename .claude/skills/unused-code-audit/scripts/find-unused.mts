#!/usr/bin/env -S npx tsx
/**
 * Finds top-level (global-scope) identifiers defined in src/**\/*.js that are
 * never referenced anywhere else in the concatenated source: dead classes,
 * dead `name = (...) => {...}` globals, dead top-level consts.
 *
 * This project has no bundler/modules (see CLAUDE.md) - everything lives in
 * one global scope, concatenated in JS_FILES order by build-game.ts. That
 * means dead top-level code is never tree-shaken away by the build; it just
 * sits there as pure wasted bytes until someone deletes it by hand. This
 * script finds it.
 *
 * Only *top-level* definitions are considered (statements starting at column
 * 0, per this codebase's 4-space-indent convention) - local `const`/`let`/
 * params inside functions are out of scope; use a Terser unused-compress
 * pass for those instead (see the skill's SKILL.md).
 *
 * Run from the repo root: `npx tsx .claude/skills/unused-code-audit/scripts/find-unused.mts`
 *
 * Read-only: never edits any file. Prints a JSON report to stdout.
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
// Transitive dependency of @remvst/js13k-tools, already installed (also used
// by the mangle-audit skill's script). Strips comments so words that only
// appear in comments/license text don't count as "usage".
import stripComments from 'strip-comments';

const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const BUILD_GAME_TS = path.join(REPO_ROOT, 'build-game.ts');
const SRC_DIR = path.join(REPO_ROOT, 'src');

function extractJsFiles(source: string): string[] {
    const marker = 'const JS_FILES';
    const start = source.indexOf(marker);
    if (start === -1) throw new Error(`Could not find "${marker}" in build-game.ts`);
    const bracketStart = source.indexOf('[', start);
    let depth = 0;
    let i = bracketStart;
    for (; i < source.length; i++) {
        if (source[i] === '[') depth++;
        else if (source[i] === ']') {
            depth--;
            if (depth === 0) { i++; break; }
        }
    }
    const literal = source.substring(bracketStart, i);
    return new Function(`return ${literal}`)();
}

function tokenize(code: string): string[] {
    return code.match(/[A-Za-z_$][A-Za-z0-9_$]*/g) || [];
}

interface Definition {
    name: string;
    file: string;
    line: number;
    kind: 'class' | 'function' | 'assignment';
}

// Matches a definition statement starting at column 0 (this codebase's
// convention: nothing at top level is indented). Deliberately conservative -
// false negatives (missing a definition) are safe, false positives (matching
// something that isn't really a top-level definition) would misreport.
const CLASS_RE = /^class\s+([A-Za-z_$][\w$]*)/;
const FUNCTION_DECL_RE = /^function\s+([A-Za-z_$][\w$]*)/;
// Bare-global assignment style per CLAUDE.md: `foo = (a, b) => {...}`.
// Excludes `==`/`===` and compound assignment operators (`+=` etc) so we
// don't misread comparisons or accumulation as a fresh definition.
const ASSIGNMENT_RE = /^([A-Za-z_$][\w$]*)\s*=(?![=>])/;

function findDefinitions(lines: string[], file: string): Definition[] {
    const defs: Definition[] = [];
    lines.forEach((line, idx) => {
        let m = CLASS_RE.exec(line);
        if (m) { defs.push({ name: m[1], file, line: idx + 1, kind: 'class' }); return; }
        m = FUNCTION_DECL_RE.exec(line);
        if (m) { defs.push({ name: m[1], file, line: idx + 1, kind: 'function' }); return; }
        m = ASSIGNMENT_RE.exec(line);
        if (m) { defs.push({ name: m[1], file, line: idx + 1, kind: 'assignment' }); return; }
    });
    return defs;
}

async function main() {
    const buildGameSource = await fs.readFile(BUILD_GAME_TS, 'utf-8');
    const jsFiles = extractJsFiles(buildGameSource);

    const allDefs: Definition[] = [];
    const strippedByFile = new Map<string, string>();

    for (const relFile of jsFiles) {
        const raw = await fs.readFile(path.join(SRC_DIR, relFile), 'utf-8');
        const stripped = stripComments(raw);
        strippedByFile.set(relFile, stripped);
        allDefs.push(...findDefinitions(stripped.split('\n'), relFile));
    }

    const wholeSource = [...strippedByFile.values()].join('\n');
    const allTokens = tokenize(wholeSource);
    const totalCounts = new Map<string, number>();
    for (const t of allTokens) totalCounts.set(t, (totalCounts.get(t) || 0) + 1);

    // How many times each name appears as a top-level *definition* (a name
    // can legitimately be (re)defined more than once, e.g. reset patterns).
    const defCounts = new Map<string, number>();
    for (const d of allDefs) defCounts.set(d.name, (defCounts.get(d.name) || 0) + 1);

    // Keep only the first definition site per name for reporting.
    const firstDefByName = new Map<string, Definition>();
    for (const d of allDefs) if (!firstDefByName.has(d.name)) firstDefByName.set(d.name, d);

    const unused: { name: string; file: string; line: number; kind: string; definitions: number }[] = [];
    for (const [name, def] of firstDefByName.entries()) {
        const total = totalCounts.get(name) || 0;
        const definitions = defCounts.get(name)!;
        // Every occurrence of `name` in the whole source is either one of
        // its own definition statements, or a real reference. If the two
        // counts match exactly, nothing ever *reads* it.
        if (total <= definitions) {
            unused.push({ name, file: def.file, line: def.line, kind: def.kind, definitions });
        }
    }

    unused.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

    console.log(JSON.stringify({
        filesScanned: jsFiles.length,
        definitionsFound: allDefs.length,
        unused,
    }, null, 2));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
