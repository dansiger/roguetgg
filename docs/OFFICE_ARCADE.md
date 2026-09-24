# Everything Is Fine — office arcade MVP

A deliberately different experiment from Critical Path. The entry page now opens eight office microgames; the original tactical game remains at `tactical.html`.

## What to try

| Challenge | Interaction | Joke |
| --- | --- | --- |
| Shred the extras | Tap sticky-note requests into a paper shredder | The shredder is labeled “Phase Two.” |
| Point them right | Rotate executive arrows toward the exit | Everyone supports a different direction. |
| Fill, don’t spill | Hold POUR and release in a visible target band | One mug is the entire wellness budget. |
| Hit the red flags | Tap a red alarm that reappears elsewhere | The dashboard insists everything is green. |

The second pass adds one office interruption to each returning challenge:

- Scope: after the final original shred, one earlier request returns as a leadership priority.
- Coffee: at 64% fill, just below the original 68% target, the cup grows taller and the target rises. Pouring stops
  for the joke; hold again afterward. The wider 74–96% band, slower pour, and
  two extra seconds make this forgiving.
- ALIGN: when the last boss aligns, a different, previously aligned boss turns away during a random tangent.
- Dashboard: with four of five red flags handled, someone covers the final one with a crooked
  ON TRACK sticker. Peel it, then tap the exposed flag.

Each interruption has a seeded random explanation and pauses gameplay and the
clock for 4.5 seconds, with a Back to it button to resume sooner. In no-timer
mode, it waits for that button. Pause/tab switching also freezes the joke beat.
The first four introductory rounds retain their original rules.
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
Each ALIGN round has a seeded, shuffled mix of male and female leaders, with at
least one of each. Hairstyles and skin/jacket palettes also vary independently
of role.

Audio starts after Clock in: original swung mallets, plucked bass, and light desk
percussion beneath procedural shredder, pouring, arrow, alarm, sticker-peel,
interruption, and outcome effects. Sound toggles all audio; Music independently
mutes the backing loop. Pause and hidden tabs mute audio; music stops at results.
No external audio files or services are needed. Reduced motion suppresses paper bursts
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
- `src/office/app.js`: DOM, pointer/keyboard input, RAF clock, export.
- `src/office/audio.js`: procedural effects, original music, audio lifecycle.
- `src/office/style.css`: responsive illustrated scenes and feedback.
- `tests/office.test.mjs`: eighteen rule tests.
- `tests/office-browser.mjs`: full session, timeout progression, pause,
  pointer/keyboard pouring, touch, reduced motion, download, responsive checks.

The updated rules pass all 37 tests across both prototypes. Browser checks cover
an eight-win session with all four interruptions, frozen coffee during the joke,
timed interruption auto-resume, manual pause during a joke, timeout progression,
keyboard/pointer input, touch, reduced motion, PNG export, and responsive widths.
Mobile screenshots of each interruption are reviewed locally.

## Playtest questions

1. Does the first shredded request get a reaction?
2. Do people understand the next challenge without help?
3. Which punchline, if any, would they quote to someone else?
4. Do they replay or share without being asked?
5. Does the TGG reveal feel earned rather than interruptive?

This is a humor/interaction experiment, not an approved public campaign.
