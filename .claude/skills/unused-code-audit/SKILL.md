---
name: unused-code-audit
description: Finds dead code in this repo's src/**/*.js — top-level classes, functions, and globals that are defined but never referenced anywhere else — since there's no bundler/tree-shaking to remove it automatically. Use when asked to find unused code, dead code, or shrink the codebase before minification.
---

# Unused code audit

This project (see CLAUDE.md) has **no bundler and no ES modules**: `src/**/*.js`
are plain scripts concatenated by `build-game.ts` in `JS_FILES` order, all
sharing one global scope. Nothing here gets tree-shaken — a class or global
function that nothing calls anymore just sits in the output forever, costing
real bytes even after Terser/Roadroller, until a human deletes it.

This skill runs `scripts/find-unused.mts`, which:

1. Reads `JS_FILES` out of `build-game.ts` and loads each file in that order.
2. Finds top-level definitions (statements starting at column 0, per this
   codebase's indentation convention): `class Foo { ... }`, `function foo(...)`,
   and the bare-global assignment style used throughout (`foo = (a, b) => {...}`).
3. Strips comments, then counts every occurrence of each defined name across
   the whole concatenated source.
4. Reports any name whose total occurrence count doesn't exceed its own
   definition count — i.e. nothing anywhere *reads* it, only (re)defines it.

It only reports **top-level/global** definitions — not local `const`/`let`/
params inside a function body. Read-only: it never edits any file.

## Known false-positive categories — check before deleting

- **Implicit browser-invoked globals**: `onload`, `onblur`, `onresize`, and
  similar `window.on*`-style bare globals are called by the runtime, not
  referenced by name anywhere in our source — they will always show up here
  and are *not* dead. Recognize the pattern (`on` + DOM event name assigned
  once, at top level) and skip it.
- **Dynamic/indirect references**: a class only ever passed by reference
  (`Entity.recycle(SomeClass)`, stored in a lookup table/array, passed as a
  callback) still counts as "used" by this script since it tokenizes the
  whole source — but double check anything passed as a *string* (e.g. a
  category name) since that won't token-match the definition at all and
  would misreport as used when it's actually unrelated, or vice versa.
- **`nomangle()`-wrapped or templated strings**: also just tokenized as text,
  so a name that only appears inside a string literal (not real code) can
  make something look "used" that isn't. Grep the reported name's other
  occurrences (`grep -rn '\b<name>\b' src/`) whenever it's not obviously a
  small, self-contained helper before deleting.
- **`if (DEBUG)`-gated code**: still real code (dead-code-eliminated only in
  prod by `hardcodeConstants` + Terser), so debug-only helpers are legitimate
  unless *also* unreferenced even in debug builds.

## Workflow

1. Run the script from the repo root:
   ```
   npx tsx .claude/skills/unused-code-audit/scripts/find-unused.mts
   ```
2. For each entry in `unused`, sanity-check it's not one of the false-positive
   categories above. For genuinely dead entries, confirm with a targeted grep
   (`grep -rn '\b<name>\b' src/`) before removing — the script's heuristic is
   conservative but not a real parser.
3. Delete confirmed-dead classes/functions/globals entirely (not just their
   body) — including any now-orphaned helpers they alone called (re-run the
   script after deleting to catch these transitively).
4. **Local unused vars** (out of this script's scope): after a debug build,
   a quick Terser dry-run compress catches unused local `const`/`let`/nested
   functions via its warnings:
   ```
   npx tsx build-game.ts --debug --html=/tmp/unicorn-debug.html
   node -e "
     const terser = require('terser');
     const fs = require('fs');
     const html = fs.readFileSync('/tmp/unicorn-debug.html', 'utf-8');
     const js = html.match(/<script>([\s\S]*?)<\/script>/)[1];
     terser.minify(js, { compress: { unused: true, dead_code: true, toplevel: true, warnings: true }, mangle: false })
       .then(r => console.log(r.error ? r.error : (r.warnings || []).join('\n')));
   "
   ```
   Cross-reference any `Dropping unused ...` warning against the source to
   decide whether to remove it by hand (Terser only *warns* here; it isn't
   asked to output the compressed result).
5. Rebuild and re-run `npx tsx .claude/skills/unused-code-audit/scripts/find-unused.mts`
   to confirm the removed names are gone and nothing new broke loose.
6. Run `npm run sizecheck` to confirm the build still succeeds and report the
   size delta.
