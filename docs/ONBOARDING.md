# Play-first onboarding

Implemented September 23, 2026 after feedback that text panels and the six-tool
menu obscured the first move.

## What a new player sees

Level, capacity, one objective, a board, and one short speech bubble. No tool
menu or influence counter appears in Level 1. There is no campaign progress
strip, permanent event log, risk-card row, or repeating instruction panel.

The first board is fixed. Kit starts near a one-point Scope Creep, which does
not multiply in this teaching encounter. The Integration Imp holds until the
first risk is resolved. This gives the player space for a first success before
learning that stripes indicate the next attack. The gate is closer than in
later stages.

Guidance follows actual accomplishments: move, resolve the first risk, dodge a
marked hex, finish the second risk, reach the open gate. It does not require a
specific path, spend turns, or block legal actions. A player who resolves the
second risk without a dodge is still allowed to finish. Highlighted pieces tie
the speech bubble to its subject; the bubble sits above the playable hexes.
Skip guidance and Show guidance toggle it without resetting the encounter.

Inspect a risk is a deliberate mode: select it, then tap a risk for its details.
It costs no turn. Escape or Close exits inspection. Brief resolution/damage
messages disappear without moving focus or rebuilding the board.

## Tool introduction

| Level | New tool |
| --- | --- |
| 1 | Movement and adjacent resolution only |
| 2 | Facilitate |
| 3 | Delivery plan |
| 4 | Data insight |
| 5 | Change leadership |
| 6 | Recovery plan |

The first promotion directly awards Facilitate with one button to continue.
Later promotions also offer three artifact choices, filtered so they do not
upgrade tools that remain locked in the next level. Engine rules enforce the
locks, including keyboard actions. The Your tools dock shows available tools
and influence; locked tools are absent, not disabled cards.

Tapping a tool previews it. Targeted tools apply on a valid board target;
Facilitate and Recovery plan require an explicit Use button. Cancel returns to
movement without spending a turn or influence. A short explanation introduces
the new tool and influence until that tool is first used in the level.

## Verification

19 engine tests pass, including fixed opening placement, the second risk's
activation, recognizing a successful dodge, no introductory scope multiplication,
and unlock enforcement. Chromium checks perform the guided move/resolve/dodge
sequence, skip and restore guidance, inspect without advancing time, earn the
first tool, preview/cancel it without spending a turn, and complete all six
levels. Keyboard controls, result export, and widths 320–1440 px also pass.
Desktop and 390 px mobile screenshots were visually reviewed. The Level 1
board and its controls fit in a 390 × 844 viewport.

The proposed 45–60 second first level remains a human-playtest target, not a
measured result. Next playtest: can a new player identify the first move, read
the danger stripes, and describe what the earned tool will do without coaching?
