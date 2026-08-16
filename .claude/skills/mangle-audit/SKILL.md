---
name: mangle-audit
description: Analyzes this repo's mangled (js13k) build output and updates MANGLE_PARAMS in build-game.ts to mangle names that aren't being mangled yet, while also removing dead/ineffective entries so the list doesn't bloat. Use when asked to shrink the mangled build further, audit MANGLE_PARAMS, or "mangle anything that isn't being mangled yet".
---

# Mangle audit

This project (`build-game.ts`) runs a custom identifier mangler (`mangle()` from
`@remvst/js13k-tools`) before minifying/roadrolling, controlled by the
`MANGLE_PARAMS` constant (`skip` / `force` arrays). Any identifier that collides
with a name in the package's `PROTECTED_NAMES` list (JS keywords + ~5600 DOM/Web
API names) is left alone by default, *unless* it's listed in `force`. Over time
this list drifts: new code introduces names that collide with a protected name
and never get added to `force`, and old `force`/`skip` entries become dead once
the code that needed them is refactored away.

This skill runs `scripts/analyze-mangle.mts`, which builds the project twice
(once unmangled, once mangled-but-not-minified via `--debug --mangle`) and
diffs the two to report:

- **`candidates`** — words still readable in the mangled output solely because
  they collide with a `PROTECTED_NAMES.dom` entry, and aren't in `force` or
  `skip` yet.
- **`unexplained`** — words that survived mangling for some other reason
  (usually text wrapped in `nomangle()`, e.g. trick names, license/UI strings).
  Not actionable via `MANGLE_PARAMS` — just sanity-check nothing surprising is
  in there.
- **`anomalies`** — words already in `force` that are still leaking. Investigate
  (likely only appear inside a `nomangle()` block or a string).
- **`removeFromForce.unused`** / **`removeFromSkip.unused`** — entries that no
  longer appear anywhere in the current source. Safe to delete outright.
- **`removeFromForce.ineffective`** — entries that were never actually
  protected in the first place (not a keyword, not in `PROTECTED_NAMES.dom`,
  not in `skip`), so forcing them is a no-op. Safe to delete outright.

The script only ever reads the repo and prints a JSON report — it never edits
`build-game.ts` itself. **Do not blindly add every `candidates` entry to
`force`.** `PROTECTED_NAMES.dom` is a broad, generic catalog of *possible*
browser API names; most `candidates` entries in this game are genuinely live
API calls (e.g. `cos`/`sin`/`atan2`/`sqrt` on `Math`, `beginPath`/`fillRect`/
`strokeStyle`/`lineTo` on the canvas 2D context, `createBuffer`/`createGain`/
`connect` on the Web Audio API, `push`/`map`/`filter`/`forEach`/`length` on
Array/String prototypes, `document`/`window`/`addEventListener`/`style`).
Forcing one of those renames every occurrence of that word in the whole
codebase — including the real API call — and silently breaks the game at
runtime with no build error.

## Workflow

1. Run the analysis script from the repo root:
   ```
   npx tsx .claude/skills/mangle-audit/scripts/analyze-mangle.mts
   ```
2. **Cleanup pass first** (unambiguous, do this every time): delete every
   entry listed under `removeFromForce.unused`, `removeFromForce.ineffective`,
   and `removeFromSkip.unused` from the `MANGLE_PARAMS.force`/`.skip` arrays
   in `build-game.ts`. These have zero effect on the current build either way.
3. **Candidates pass** (needs judgment, do this per entry): for each word in
   `candidates`, decide from its name and, when not obvious, a quick
   `grep -rn '\b<word>\b' src/` whether every occurrence is:
   - our own code's identifier (object property, local var, function/class
     member, param name) → safe to add to `force`.
   - a real call/property on a native object (Math, the canvas 2D context,
     an `AudioContext`/`AudioNode`, `document`/`window`/DOM elements, Array/
     String/Object/Function prototype methods, global constructors like
     `Array`/`Map`/`Set`/`Date`/`Promise`) → leave it out, do not force it.
   Names that are unmistakably a native API by themselves (e.g. `atan2`,
   `beginPath`, `createBufferSource`, `requestAnimationFrame`) don't need a
   grep — skip them on sight. Reserve the grep for genuinely ambiguous short
   or generic words (e.g. `close`, `set`, `mode`, `width`, `which`, `self`).
   Add the confirmed-safe words to `MANGLE_PARAMS.force`, keeping the
   existing one-string-per-line style.
4. Skim `unexplained` and `anomalies` — normally just `nomangle()`-wrapped
   display text (trick names, fonts, colors) and safe to ignore; only chase
   these further if something looks like a real missed identifier.
5. Rebuild and re-run the script to confirm: the words you added no longer
   appear in `candidates`/leak in the mangled output, and no new anomalies
   appeared.
   ```
   npm run build:debug:mangled
   npx tsx .claude/skills/mangle-audit/scripts/analyze-mangle.mts
   ```
6. Run `npm run sizecheck` (or at least `npm run build:preprod`) to confirm
   the full mangle+minify+roadroll+zip pipeline still succeeds, and report
   the resulting size.
7. Because forcing a name can silently break a real API call, treat this as a
   risky change: recommend the user actually play the game
   (`npm run build:debug:mangled` then open it, or via the `run`/`verify`
   skills) before trusting the result, especially if any `force` additions
   were on ambiguous/short names.
