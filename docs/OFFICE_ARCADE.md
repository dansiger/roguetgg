# Everything Is Fine — office arcade MVP

A deliberately different experiment from Critical Path. The entry page now opens eight office microgames; the original tactical game remains at `tactical.html`.

## What to try

| Challenge | Interaction | Joke |
| --- | --- | --- |
| Shred the extras | Tap sticky-note requests into a paper shredder | The shredder is labeled “Phase Two.” |
| Point them right | Rotate executive arrows toward the exit | Everyone supports a different direction. |
| Fill, don’t spill | Hold POUR and release in a visible target band | One mug is the entire wellness budget. |
| Hit the red flags | Tap a red alarm that reappears elsewhere | The dashboard insists everything is green. |

The second pass increases request counts, coffee speed, leadership size, and red flags.
There are no upgrades, capacity meters, consulting tool menus, or pre-game tutorial.
Instructions are a single sentence. Timers start with the first action. A missed
round receives its own punchline and progresses, so everyone reaches the ending.

A roughly one-minute session is a design target, not a measured human-playtest result.
Individual rounds allow 9–11 seconds of active play, plus instruction reading and
short result beats. Players can skip each punchline using Next incident, or let it
advance automatically after 3.2 seconds.

## Presentation and accessibility

Original CSS office illustrations: an unreliable status monitor, sticky notes,
a “Phase Two” shredder, executive caricatures, coffee, and a green dashboard.
No film characters, dialogue, or artwork are used.
Optional synthesized audio starts off. Reduced motion suppresses paper bursts
and motion effects. Touch targets and keyboard activation are supported.
Coffee uses press/hold/release with pointer capture or Space/Enter.

Pause freezes active time and the between-round delay. Switching browser tabs
pauses automatically. No-timer mode removes deadlines and automatic progression
while keeping the physical coffee interaction. Progress and alarm shapes/labels
supplement color. The original official white TGG logo is reused unchanged on
a dark footer and result card.

## Marketing

The TGG connection stays in the footer during play. The final survival report
awards a comic, unofficial title, supports PNG download/native file sharing,
and offers a contact link. Analytics are local CustomEvents only: no data is
sent to a service. Sharing is initiated by the player.

## Architecture and checks

- `src/office/game.js`: pure rules, seeded setup, timing, scoring, transitions.
- `src/office/app.js`: DOM, pointer/keyboard input, audio, RAF clock, export.
- `src/office/style.css`: responsive illustrated scenes and feedback.
- `tests/office.test.mjs`: twelve rule tests.
- `tests/office-browser.mjs`: full session, timeout progression, pause,
  pointer/keyboard pouring, touch, reduced motion, download, responsive checks.

The local implementation workspace disconnected during development. The twelve
new pure rule tests first passed in the available JavaScript runtime. GitHub
Actions then passed syntax checks, the static build, all 31 rule tests across
both prototypes, and both browser suites. The new browser suite exercised an
eight-win session, timed failure/automatic continuation, keyboard and pointer
pouring, pause, no-timer mode, touch, reduced motion, PNG export, and viewport
widths from 320 to 1440 pixels.

[Passing check run](https://github.com/dansiger/roguetgg/actions/runs/35953962113).
Screenshots are included in that run's browser-checks artifact. Manual visual
review of those screenshots remains pending because the local workspace was
disconnected; automated browser checks are not a substitute for a humor playtest.

## Playtest questions

1. Does the first shredded request get a reaction?
2. Do people understand the next challenge without help?
3. Which punchline, if any, would they quote to someone else?
4. Do they replay or share without being asked?
5. Does the TGG reveal feel earned rather than interruptive?

This is a humor/interaction experiment, not an approved public campaign.
