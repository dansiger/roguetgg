# Prototype verification

Checks completed for the initial implementation:

- 16 engine regression tests passed. Coverage includes deterministic placement,
  hex adjacency, invalid input, overlapping attacks, fixed attack intentions,
  facilitation timing, Wraith return prevention, scope growth, artifacts,
  recovery limits, gate requirements, upgrades, and the six-stage win flow.
- A simple greedy simulation player completed 28 of 30 seeded runs; 2 stalled,
  and none reached the 240-step timeout. This is a flow check, not evidence of
  human difficulty or a measured 5–10 minute session length.
- Chromium completed a real UI run from kickoff through all six stages and
  five promotion choices, followed by a separate stall/restart path.
- Browser checks passed for keyboard navigation, the help dialog, result PNG
  download, required campaign events, and absence of JavaScript errors.
- No horizontal overflow at 320, 390, 768, and 1440 pixel viewports.
- Desktop and phone screenshots, promotion layouts, and the exported 1200 ×
  1200 result card were visually inspected.
- JavaScript syntax checks, static build, and Git whitespace checks passed.

The standard Chromium download failed in the implementation environment. A
separate Chromium binary from the `@sparticuz/chromium` package ran the same
committed Playwright test via `CHROMIUM_PATH`. That environment-only browser
package is not an application dependency.

Next: human playtesting, screen-reader review, and Safari/iOS sharing checks.
Native sharing is feature-detected; file download remains the primary path.
