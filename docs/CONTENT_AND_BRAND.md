# Content and brand validation

Reviewed September 22, 2026. These findings informed the first playable prototype;
prototype choices are reversible and do not represent final marketing approval.

## Sources and encounter design

| Official source | Relevant finding | Original game interpretation |
| --- | --- | --- |
| [How We Help](https://guntergroup.com/how-we-help/) | Strategy, People, Technology, and Execution address connected business problems. | One campaign combines practice families rather than offering four unrelated games. |
| [Strategy](https://guntergroup.com/service/strategy/) | Governance, shared direction, and effective facilitation connect strategy to execution. | Decision Hydra; Facilitate pauses nearby risks. |
| [Execution](https://guntergroup.com/service/execution/) | Delivery, recovery, and operating models help initiatives make progress. | Delivery plan repositions Kit; Recovery plan restores capacity. |
| [People](https://guntergroup.com/service/people/) | Organizational change is a distinct practice focus. | Adoption Wraith returns unless its underlying condition is addressed. |
| [Technology](https://guntergroup.com/service/technology/) | Technology supports business needs. | Data insight exposes and resolves threats at range. |
| [Portfolio transformation](https://guntergroup.com/a-stronger-pmo-that-scaled-with-the-organization/) | Inconsistent reporting and governance obscured priorities; shared delivery practices and adoption supported an enterprise platform change. | Confirms the enterprise-transformation premise; informs Scope Creep and the six-stage journey. |
| [Reporting modernization](https://guntergroup.com/replacing-hundreds-of-disconnected-reports-with-one-dashboard/) | Technically functioning dashboards missed user needs; stakeholder involvement changed priorities. | Data Silo, Readiness Mimic, and the distinction between launch and realized value. |

The creatures, dialogue, statistics, artifacts, and tactical effects are fictional.
They are not descriptions of named clients or claims about quantified TGG outcomes.
The UI uses shorter capability labels; `src/content.js` records their published
service counterparts. A third case-study page reviewed had a permitting title
and payroll body; it is deliberately not used as an encounter source.

## Brand treatment

The installed `tgg-brander` skill was read before implementation. The prototype
uses a restrained editorial layout, modern sans-serif fallback, spacious warm
neutral fields, dark headers, plain language, and the original official white
logo on dark backgrounds. No logo recoloring or redrawing is used.

- Official logo: https://guntergroup.com/wp-content/uploads/2026/07/logo-white-footer.svg
- Live theme CSS: https://guntergroup.com/wp-content/themes/the-gunter-group-new/dist/theme-D4zUdU_q.css
- The live stylesheet defines green `#007960` and text `#303030`; these are used
  for selected interface accents and text. Board and character colors are
  original illustrative neutrals, not asserted to be an official brand palette.
- Kit is an original vector illustration kept as editable source in the repo.
- Risk illustrations are original SVG geometry in `src/app.js`.
- Risk codes, numerical markers, stripes, text descriptions, and focus outlines
  convey meaning without requiring color alone.
- Mobile layout stacks panels, uses large board hexes and touch controls, and
  keeps essential instructions in HTML. Reduced motion is respected.

## Prototype decisions following authorization to start coding

- Retain the working title **Critical Path** and working hero name **Kit Vale**.
- Build one six-stage enterprise-transformation campaign with mixed practices.
- Use a dependency-free web application, original SVG artwork, and a pure
  JavaScript engine separated from rendering. It can be hosted under a subpath.
- Use six active capabilities and eight possible between-stage upgrades. Expand
  the active set only after testing the first-run learning burden.
- Prioritize PNG result download; use native file sharing when supported.
- Use the current public [contact page](https://guntergroup.com/lets-talk/).
- Keep analytics as local CustomEvents with no collection service attached.
- Defer final public naming, campaign copy, illustration approval, and external
  analytics integration to the production review. No hosting deployment occurs
  as part of this repository implementation.

## Playtest next

Watch someone complete a first run without coaching. Check whether intentions,
resolve points, influence, artifact collection, and the gate requirement are
understood. Tune difficulty and session length from human play rather than the
smoke-test player's win rate. Consider bringing the controls closer to the
board on small phones if scrolling interrupts planning.
