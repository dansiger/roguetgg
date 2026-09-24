# Everything Is Fine.

**Eight minor emergencies. One completely normal workday.**

The current MVP is a tiny office arcade: shred surprise requests, rotate
leadership toward the exit, pour the office coffee, and chase red flags across
a dashboard that insists it is green. Four interactions repeat with escalating
absurdity across eight rounds. Every ending produces a comic survival report.

The earlier **Critical Path** tactical prototype remains available at
[`tactical.html`](tactical.html). Its source is preserved for comparison.

## Run

Requires Node.js 20+. No runtime dependencies or API keys.

```sh
git clone https://github.com/dansiger/roguetgg.git
cd roguetgg
npm start
```

Open http://localhost:5173 for the office arcade, or
http://localhost:5173/tactical.html for the previous game.
Use an HTTP server rather than opening the HTML files directly.

## Play

Click **Clock in**. Each challenge explains itself in one sentence and starts its
clock only when you act. Missed challenges still move forward, with a different
punchline. **Pause** or Escape freezes the game. **No-timer mode** removes time
pressure and lets you advance each punchline yourself.

Tap/click notes, bosses, and alarms. For coffee, hold POUR, then release inside
the striped band. Keyboard users can Tab to targets and use Enter/Space; hold
Space/Enter to pour. Sound is optional and starts off.

Download the final result as a PNG or use native sharing where supported.
The game sends no analytics or personal information.

## Build and test

```sh
npm ci
npm test
npm run check
npm run build
npx playwright install chromium
npm run test:browser
```

`npm run test:office` runs only the new arcade's browser checks.
`npm run format` formats source. Built files are in ignored `dist/`.
Run `node scripts/serve.mjs --dist` to preview the build.
Set `CHROMIUM_PATH` for an existing Chromium binary.

All authored code, tests, assets, and documentation are in this repo.
No deployment is performed by the build or test scripts.

## Project map

| Path | Contents |
| --- | --- |
| `src/office/` | Office arcade rules, UI, and styling |
| `index.html` | Current office arcade entry |
| `tactical.html`, `src/game.js`, `src/app.js` | Previous tactical MVP |
| `assets/` | Original art and official TGG logo |
| `tests/` | Rule and browser tests for both prototypes |
| [Office arcade notes](docs/OFFICE_ARCADE.md) | Concept, controls, test status, playtest questions |
| [Product brief](PRODUCT_BRIEF.md) | Product history and current direction |
| [Original brand/content research](docs/CONTENT_AND_BRAND.md) | Source links and asset provenance |

The new MVP tests whether the interaction and joke land. Human playtesting is
still needed for timing, replay interest, and the marketing reveal. No accounts,
persistent saves, analytics vendor, or live hosting are configured.
