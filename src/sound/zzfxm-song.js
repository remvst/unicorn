// Synthwave/Outrun V11: Night Chase, Beat Tease
//
// v7-night-chase-bass-lift.js (the favorite), reworked per feedback:
// 1. Intro replaced entirely. Was a gradual bass-first build-up (v10) that
//    got called "boring... just a low pitch synth note" for the first
//    second. Now: 3 bars of BEAT ONLY - the exact same drum+bass pattern as
//    MAIN, but with the lead completely silent. That's "the fast repetitive
//    beat" teasing on its own for ~5.2s with zero main instrument, exactly
//    as requested. MAIN then follows immediately - same beat, lead now on
//    top - so phase 2 is literally "the same beat plus the main instrument,"
//    not a new pattern.
// 2. The v10 STOP bar (a nearly-silent bar on its own - only one hit, ~1.5s
//    of true silence) is gone. That was a bug, not a stylistic pause - "the
//    pause... there are no notes." The unison impact hit is now folded into
//    the first BREAKDOWN bar itself (kick+snare hit together on beat 1),
//    which already has hat/bass/lead content filling out the rest of the
//    bar - so there's always something sounding, never true dead air.
//
// MAIN, LIFT (the bass-driven octave-jump technique from v7), and RISER are
// unchanged. ~29s before looping.
//
// Standalone candidate - not wired into the build. To try it in-game, copy
// this file's songInstruments/songPatterns/songSequence/songData into
// src/sound/zzfxm-song.js (which sound/play-song.js reads from).
// Regenerate/tweak via scratchpad/compose-night-chase-v11.mjs rather than
// hand-editing the literal arrays below.
//
// songPatterns holds only the *unique* bars - several bars in the original
// composition (the 3x BEAT ONLY tease, and MAIN repeating at the end) were
// byte-for-byte duplicates of earlier bars. Those repeats now live purely in
// songSequence, which just replays a pattern's index instead of the pattern
// being pasted into the array again.
const songInstruments = [
    [1.35,0.1,140,,0.008,0.09,4,1.5,,,,,,3.4], // KICK
    [1.35,0.1,90,,0.015,0.26,4,1.4,,,,,,3.7], // SNARE
    [0.9,0.3,220,,0.006,0.06,4,1.6,,,,,,4.2], // HAT
    [1.3,0,65.40639,,,0.09,2,1.5,,,,,,,,,0.012], // BASS
    [0.75,0.04,65.40639,,,0.07,2,1.4], // LEAD
];

const songPatterns = [
    // 0: BEAT ONLY - E minor (the tease: full beat, zero lead)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: full four-on-the-floor, identical to MAIN
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: gated backbeat, identical to MAIN
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: busy 16ths, identical to MAIN
        [3,-0.15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16], // bass: full pulse, identical to MAIN
        [4,0.2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // lead: completely silent - just the beat teasing, no main instrument at all
    ],

    // 1: MAIN - E minor (the original v3 groove, untouched)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: four-on-the-floor pulse (unchanged from v3)
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: gated backbeat (unchanged from v3)
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: busy 16ths (unchanged from v3)
        [3,-0.15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16], // bass: relentless 16th-note pulse on E minor (unchanged from v3)
        [4,0.2,40,43,47,43,40,43,47,43,40,43,47,43,40,43,47,43], // lead: fast arpeggio on E minor (unchanged from v3)
    ],

    // 2: MAIN - C major (the original v3 groove, untouched)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: four-on-the-floor pulse (unchanged from v3)
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: gated backbeat (unchanged from v3)
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: busy 16ths (unchanged from v3)
        [3,-0.15,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12], // bass: relentless 16th-note pulse on C major (unchanged from v3)
        [4,0.2,36,40,43,40,36,40,43,40,36,40,43,40,36,40,43,40], // lead: fast arpeggio on C major (unchanged from v3)
    ],

    // 3: MAIN - G major (the original v3 groove, untouched)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: four-on-the-floor pulse (unchanged from v3)
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: gated backbeat (unchanged from v3)
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: busy 16ths (unchanged from v3)
        [3,-0.15,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19,19], // bass: relentless 16th-note pulse on G major (unchanged from v3)
        [4,0.2,43,47,50,47,43,47,50,47,43,47,50,47,43,47,50,47], // lead: fast arpeggio on G major (unchanged from v3)
    ],

    // 4: MAIN - D major (the original v3 groove, untouched)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: four-on-the-floor pulse (unchanged from v3)
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: gated backbeat (unchanged from v3)
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: busy 16ths (unchanged from v3)
        [3,-0.15,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14], // bass: relentless 16th-note pulse on D major (unchanged from v3)
        [4,0.2,38,42,45,42,38,42,45,42,38,42,45,42,38,42,45,42], // lead: fast arpeggio on D major (unchanged from v3)
    ],

    // 5: LIFT (bass-driven) - E minor
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: same as main
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: same as main
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: same as main
        [3,-0.15,16,16,28,16,16,16,28,16,16,16,28,16,16,16,28,16], // bass: octave-jumping pattern on E minor - the energy source instead of the lead
        [4,0.2,40,43,47,43,40,43,47,43,40,43,47,43,40,43,47,43], // lead: completely unchanged from MAIN on E minor
    ],

    // 6: LIFT (bass-driven) - C major
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: same as main
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: same as main
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: same as main
        [3,-0.15,12,12,24,12,12,12,24,12,12,12,24,12,12,12,24,12], // bass: octave-jumping pattern on C major - the energy source instead of the lead
        [4,0.2,36,40,43,40,36,40,43,40,36,40,43,40,36,40,43,40], // lead: completely unchanged from MAIN on C major
    ],

    // 7: LIFT (bass-driven) - G major
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: same as main
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: same as main
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: same as main
        [3,-0.15,19,19,31,19,19,19,31,19,19,19,31,19,19,19,31,19], // bass: octave-jumping pattern on G major - the energy source instead of the lead
        [4,0.2,43,47,50,47,43,47,50,47,43,47,50,47,43,47,50,47], // lead: completely unchanged from MAIN on G major
    ],

    // 8: LIFT (bass-driven) - D major
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,0,0,12,0,0,0], // kick: same as main
        [1,0,0,0,0,0,12,0,0,0,0,0,0,0,12,0,0,0], // snare: same as main
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: same as main
        [3,-0.15,14,14,26,14,14,14,26,14,14,14,26,14,14,14,26,14], // bass: octave-jumping pattern on D major - the energy source instead of the lead
        [4,0.2,38,42,45,42,38,42,45,42,38,42,45,42,38,42,45,42], // lead: completely unchanged from MAIN on D major
    ],

    // 9: BREAKDOWN - D major (with the impact hit) (hat+bass keep full pace, only kick/snare/lead thin out)
    [
        [0,0,12,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0], // kick: unison impact hit, then a half-time pulse
        [1,0,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // snare: hits together with the kick for impact, its .26s release rings out
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: FULL 16ths, identical to MAIN - this is what keeps the pace/tempo feel from collapsing
        [3,-0.15,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14,14], // bass: FULL relentless pulse on D major, identical to MAIN - a second pace anchor
        [4,0.2,38,0,0,0,42,0,0,0,45,0,0,0,42,0,0,0], // lead: thinned to a quarter-note pulse on D major - this is where the "less happening" contrast lives
    ],

    // 10: BREAKDOWN - E minor (hat+bass keep full pace, only kick/snare/lead thin out)
    [
        [0,0,12,0,0,0,0,0,0,0,12,0,0,0,0,0,0,0], // kick: half-time pulse
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // snare: silent
        [2,0.15,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3,60,60.3], // hat: FULL 16ths, identical to MAIN - this is what keeps the pace/tempo feel from collapsing
        [3,-0.15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16], // bass: FULL relentless pulse on E minor, identical to MAIN - a second pace anchor
        [4,0.2,40,0,0,0,43,0,0,0,47,0,0,0,43,0,0,0], // lead: thinned to a quarter-note pulse on E minor - this is where the "less happening" contrast lives
    ],

    // 11: RISER - E minor (building back to full energy)
    [
        [0,0,12,0,0,0,12,0,0,0,12,0,12,0,12,0,12,0], // kick: builds back up
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,12,0,12.4,0], // snare: pickup roll
        [2,0.15,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60,60], // hat: full 16th roll
        [3,-0.15,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16], // bass: back to full pulse on E minor
        [4,0.2,40,43,47,43,40,43,47,43,40,43,47,43,40,43,47,43], // lead: back to the full arpeggio
    ],
];

// Plays the 12 unique bars above in the same order as the original 18-bar
// arrangement: BEAT ONLY x3, MAIN Em/C/G/D, LIFT Em/C/G/D, BREAKDOWN D/Em,
// RISER Em, then MAIN Em/C/G/D again - by index, instead of pasting those
// repeated bars into songPatterns a second (or third) time.
const songSequence = [
    0, 0, 0,
    1, 2, 3, 4,
    5, 6, 7, 8,
    9, 10,
    11,
    1, 2, 3, 4,
];

const songData = [songInstruments, songPatterns, songSequence, 138];
