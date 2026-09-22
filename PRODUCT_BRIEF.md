# Critical Path — Product Brief

## Purpose of this document

This brief records the product discovery completed before implementation. It is
intended to let a new contributor continue the project without access to the
original conversation.

Before writing application code, the next contributor must:

1. Review The Gunter Group (TGG) website, especially its four practices and
   relevant case studies.
2. Use the installed `tgg-brander` skill for all branding decisions.
3. Validate the proposed service, case-study, and practice language against
   TGG's published material rather than relying only on the working examples in
   this brief.
4. Resolve the open product decisions listed at the end of this document.

## Access verification — completed September 22, 2026

- **TGG website access: complete.** Successfully opened and read the live
  [TGG homepage](https://guntergroup.com/), including its overview of Strategy,
  Execution, People, and Technology.
- **`tgg-brander` skill access and reading: complete.** Successfully opened and
  read the installed skill in full, including its official-source references,
  visual and editorial guidance, logo rules, and mobile rendering requirements.

These access checks are complete. Detailed practice and case-study validation,
application of the brand guidance to the game, and the open product decisions
below remain outstanding.

## Product summary

**Critical Path** is a short, responsive-web tactical roguelite inspired by the
accessible, turn-based, hex-grid play of *Hoplite*. It is an original parody
about leading complex corporate initiatives, not a clone of *Hoplite*'s
creative assets, world, text, or exact content.

The player guides a rising corporate leader through a transformation beset by
recognizable project problems rendered as fantasy monsters. TGG capabilities
help the player transform those monsters into useful business artifacts,
deliver the initiative, and rise from Senior Director to CEO.

The product is an advertisement before it is a deep game. It must nevertheless
be genuinely fun: TGG's relevance should emerge naturally from useful game
mechanics rather than interruptive marketing copy.

### Elevator pitch

> Guide a rising corporate leader through a transformation beset by Scope
> Creeps, Data Silos, Alignment Wraiths, and other familiar organizational
> monsters. Apply practical consulting capabilities to regain control, deliver
> results, and rise from Senior Director to CEO—all in a ten-minute tactical
> run.

## Confirmed product decisions

| Area | Decision |
| --- | --- |
| Working title | **Critical Path** |
| Initial platform | Responsive web, architected so it could later be packaged for iOS |
| Primary objective | TGG brand awareness |
| Conversion objective | A strong, clear contact-TGG call to action at the end |
| Primary audience | Senior corporate leaders familiar with consulting and consulting humor |
| Tone | Clever, optimistic, polished, and executive-friendly—not cynical |
| Core play | Compact, deterministic, turn-based tactics on a hex grid |
| Session target | Approximately 5–10 minutes |
| Expected engagement | Most players try one run and may replay two or three times |
| Campaign scope | One campaign with enough stages to progress from Senior Director to CEO |
| Content families | Strategy, Execution, People, and Technology—the four TGG practices |
| Hero | A named, gender-neutral anthropomorphic fox with a defined personality |
| Visual world | Corporate fantasy |
| Conflict metaphor | Monsters are transformed into useful project artifacts, not killed |
| Result experience | Positive, optimistic summary regardless of how far the player gets |
| Sharing | A polished, shareable result card is essential |
| Measurement | Anonymous gameplay metrics are valuable but secondary to a compelling demo |
| Primary success criterion | Positive feedback from TGG leadership and clients |

## Product principles

### 1. Entertaining before promotional

- The experience must not feel like a brochure disguised as a game.
- TGG capabilities should be useful tactical choices, not banner ads.
- The strongest marketing message is that disciplined consulting turns messy,
  recognizable conditions into forward momentum.

### 2. Specific rather than generic

- Experienced leaders should recognize situations they have lived through.
- Prefer issues such as bad source-data assumptions, unclear decision rights,
  unavailable subject-matter experts, weak cutover planning, misleading
  readiness indicators, and steering committees without actionable decisions.
- Use TGG case studies and published services to make the scenarios authentic.

### 3. Warm satire rather than cynicism

- Make fun of shared organizational problems, not clients or employees.
- Personify conditions and risks as monsters; do not cast ordinary workers as
  villains.
- The player should finish feeling capable, understood, and optimistic.

### 4. Immediate comprehension

- Begin meaningful play within seconds.
- Do not place a character creator or long story introduction before the game.
- Teach mechanics through the first moves instead of relying on a long tutorial.
- Keep outcomes deterministic and enemy intentions readable.

### 5. Designed to be shared

- Every ending should produce an attractive, affirming result.
- Results should resemble playful leadership profiles and be worth sending to a
  colleague.
- Sharing and the contact-TGG CTA should be prominent without obstructing play.

## Hero

### Working character

- **Name:** Kit Vale
- **Species:** Fox
- **Starting title:** Senior Director, Enterprise Transformation
- **Identity:** Gender-neutral
- **Role in the experience:** A clever, adaptable leader who succeeds through
  planning, positioning, and practical interventions rather than brute force

The fox direction is confirmed. The name `Kit Vale` is a working proposal and
should be validated before final production copy.

### Personality

Kit is:

- Competent but not superhuman
- Calm amid absurd situations
- Dryly funny
- Empathetic toward teams affected by transformation
- Skeptical of jargon but fluent in it when needed

Example voice:

> The steering committee requested a clearer escalation path. It has also
> become the escalation path.

### Visual trappings

- A polo combined with a practical blazer, vest, or other polished layer
- A mobile phone used as a tactical tool
- A messenger bag containing consulting artifacts
- A badge or lanyard that becomes increasingly elaborate with promotions
- A reusable coffee tumbler as character detail, not a conventional health
  potion

## World and visual direction

The confirmed direction is **corporate fantasy**: a polished fantasy realm
constructed from recognizable corporate environments, diagrams, dashboards,
conference rooms, and office artifacts.

Examples include:

- A Data Silo presented as a literal stone tower
- A Strategic Roadmap presented as a magical scroll or illuminated path
- A Steering Committee presented as a council chamber
- Project gates represented as imposing portals
- Resolved threats dissolving into checked decisions, aligned arrows, clean
  information flows, roadmaps, or other productive artifacts

All visual branding must be guided by `tgg-brander` and current TGG assets.

## Campaign structure

The MVP contains one transformation campaign. An enterprise platform
transformation is the current recommended frame because it naturally brings
together strategy, execution, people, and technology. The final premise should
be validated against TGG's case studies.

### Proposed six-stage journey

| Stage | Player rank | Project phase | Central challenge |
| --- | --- | --- | --- |
| 1 | Senior Director | Mobilize | Establish ownership and a shared view of reality |
| 2 | Vice President | Align | Resolve competing objectives and decision rights |
| 3 | Senior Vice President | Design | Prevent requirement and operating-model failures |
| 4 | Executive Vice President | Prepare | Achieve organizational and technical readiness |
| 5 | Chief Transformation Officer | Launch | Navigate cutover, adoption, and escalation |
| 6 | CEO | Sustain | Demonstrate value and institutionalize the change |

Promotions should be quick, celebratory, and gently satirical. For example:

> **PROMOTED: VICE PRESIDENT**
>
> You converted ambiguity into a roadmap. Leadership has rewarded you with
> greater ambiguity.

Each stage should take roughly one to two minutes. Later stages should become
more tactically dense rather than substantially longer.

### Proposed final threat

**The Value Realization Gap** is the working final boss. It is composed of weak
adoption, unowned benefits, unresolved process exceptions, post-launch fatigue,
and vanishing executive attention. This reinforces that go-live is not the same
as realizing value.

## Four-practice content system

The MVP should contain four thematic content families, one for each TGG
practice:

1. Strategy
2. Execution
3. People
4. Technology

These are not four separately engineered games. Critical Path has one shared
tactical ruleset and a manageable collection of reusable behavioral
archetypes. Each practice provides an appropriate name, illustration, flavor
text, transformation artifact, and—where beneficial—a small gameplay modifier
for an archetype.

### Working content matrix

The following examples are placeholders pending website and case-study review:

| Tactical behavior | Strategy | Execution | People | Technology |
| --- | --- | --- | --- | --- |
| Replicates if ignored | Priority Proliferation | Scope Creep | Change Fatigue | Integration Defect |
| Blocks connections | Strategic Disconnect | Dependency Deadlock | Communication Barrier | Data Silo |
| Delays actions | Decision Paralysis | Approval Bottleneck | Capacity Constraint | Environment Delay |
| Appears safe until approached | Unsupported Assumption | False Green Status | Readiness Mirage | Legacy Dependency |
| Pulls Kit off course | Shifting Mandate | Executive Escalation | Competing Commitments | Production Incident |
| Returns unless fully resolved | Strategy Drift | Unowned Action | Adoption Resistance | Recurring Defect |

Resolving a monster transforms it into something useful. Examples:

- Priority Proliferation becomes a Prioritized Portfolio.
- Scope Creep becomes a Controlled Backlog.
- Change Fatigue becomes an Adoption Coalition.
- An Integration Defect becomes a Validated Interface.

### Recommended randomization

The current recommendation is for each stage to have one dominant practice and
one secondary practice. A sample run might begin with Strategy, move through
People and Execution, confront Technology readiness, and combine all four
practices during launch and value realization. Replays can vary the order,
composition, and tactical layout.

To the player, the four practices should feel like interconnected dimensions of
one transformation—not visible implementation “skins.”

## Core gameplay

The intended qualities are the simplicity, clarity, and tactical engagement of
*Hoplite*:

- A compact hex grid
- Turn-based movement
- Threats act after Kit acts
- Visible or readily understandable threat intent
- Positioning and planning over random chance
- Short stages with a clear objective or exit tile
- Meaningful ability choices and lightweight run variation

The project should create original rules, balance, content, visuals, copy, and
progression. Inspiration from a proven interaction model is not permission to
copy protected creative expression.

### Working vocabulary

| Familiar game concept | Critical Path term |
| --- | --- |
| Health | Leadership Capacity |
| Energy or mana | Influence |
| Armor | Executive Sponsorship |
| Weapon | Delivery Capability |
| Spell | Intervention |
| Exit | Decision Gate |
| Upgrade | Engagement Artifact |
| Enemy | Project Risk or Threat |
| Boss | Transformation Threat |
| Death | Initiative Stalled |
| Victory | Value Realized |

Not every familiar term needs to be replaced by jargon. Tooltips should remain
plain, concise, and easy to understand.

## Threat concepts

All threats are manifestations of project conditions rather than depictions of
bad employees.

| Threat | Working tactical behavior | Flavor direction |
| --- | --- | --- |
| Scope Creep | Reproduces when not addressed quickly | “It was described as a small enhancement.” |
| Data Silo | Blocks lines of effect or information | “Technically, the data exists.” |
| Decision Hydra | Gains options or actions when ignored | “Each answer generated two follow-up questions.” |
| SME Bottleneck | Immobilizes nearby objectives | “The only person who knows is double-booked.” |
| Integration Imp | Leaps between systems and creates defects | “It worked in the test environment.” |
| Readiness Mimic | Appears complete until approached | “The tracker was green.” |
| Governance Golem | Creates excessive gates | “A subcommittee will review the recommendation.” |
| Adoption Wraith | Returns unless behavior changes | “Attendance is not adoption.” |
| Vendor Chimera | Changes behavior with its active contract head | “That dependency is outside the statement of work.” |
| Technical Debt Dragon | Sleeps initially and dominates later turns | “Modernization awakened something ancient.” |
| Escalation Harpy | Pulls Kit away from the main objective | “Adding visibility.” |
| Initiative Fatigue Fog | Gradually reduces movement or influence | “The organization remains excited about transformation.” |

This roster must be refined after reviewing TGG's real case studies so that the
issues are credible, specific, and connected to services TGG provides.

## TGG capabilities as player tools

Working translations include:

| Capability | Proposed tactical effect |
| --- | --- |
| Stakeholder Alignment | Rotate or redirect a threat's next action |
| Strategic Roadmap | Preview upcoming encounters and select a route |
| Program Governance | Create a zone where threats cannot multiply temporarily |
| Change Leadership | Remove resistance and prevent an Adoption Wraith from returning |
| Executive Facilitation | Pause escalation-type threats for one turn |
| Risk Register | Mark threats so later interventions have greater impact |
| Operating Model | Permanently reduce the cost of an ability category |
| Program Leadership | Reposition Kit and nearby objectives |
| Data & Analytics | Reveal hidden threats, dependencies, or false status |
| Readiness Assessment | Expose weak launch conditions before activation |
| Decision Framework | Force a Decision Hydra to commit to one path |
| Recovery Plan | Restore Leadership Capacity and clear a delayed milestone |

These labels and descriptions are provisional. The implementation team must
map them to TGG's current, approved service language.

### Capability design rule

TGG capabilities create clarity, alignment, momentum, and sustainable outcomes.
They should not merely be swords and fireballs with consulting labels.

## Progression and replayability

- A complete run promotes Kit from Senior Director to CEO.
- Promotion is compressed deliberately to fit the short marketing experience.
- Between stages, the player should choose from a small set of capability or
  artifact upgrades.
- Layouts, threat composition, practice emphasis, and upgrade choices create
  replayability.
- The MVP should optimize the first run and first two replays, not long-term
  retention or a large metagame.
- Avoid implying that consulting automatically earns a real-world promotion;
  the exaggerated progression is part of the fantasy parody.

## Results, sharing, and conversion

Every result contains:

1. A positive leadership archetype
2. A specific account of what happened during the run
3. A polished shareable card
4. A clear invitation to contact TGG

Do not use “failed,” “lost,” or “died” on the share card.

### Example successful result

> **The Alignment Architect**
>
> You reached the C-suite by turning competing priorities into executable
> decisions. You contained 8 Scope Creeps, dismantled 4 Data Silos, and
> survived a steering committee that scheduled itself.
>
> **Signature capability:** Stakeholder Alignment
>
> **Value realized:** Enterprise momentum restored

### Example incomplete result

> **The Resilient Operator**
>
> Your initiative stalled during launch, but you exposed three readiness risks
> before they reached production. The next leader begins with a far clearer
> path because of your work.
>
> **Signature capability:** Readiness Assessment
>
> **Next challenge:** Convert insight into coordinated action

### Share card contents

- Kit's portrait
- Leadership archetype
- Highest title reached
- Signature capability
- One amusing run statistic
- Campaign or initiative title
- TGG logo
- Short game URL or QR code where appropriate

### CTA direction

Working copy:

> **Complex initiatives don't need a hero working alone.**
>
> See how The Gunter Group helps leaders turn strategy into outcomes.

Primary action: **Talk with TGG**

Secondary action: **Explore how TGG works**

The final destination and wording require approval. Do not gate results or the
game behind a contact form.

## Analytics

Analytics are secondary to creating a compelling leadership demo, but the
application should provide a vendor-neutral event abstraction for:

- Game loaded
- Run started
- Tutorial completed
- Stage completed
- Promotion earned
- Upgrade selected
- Run ended
- Run restarted
- Campaign completed
- Result card generated
- Share initiated
- Contact-TGG CTA clicked
- Approximate session duration

Avoid collecting personally identifiable information unless a later approved
marketing workflow explicitly requires it. Select the actual analytics provider
separately.

## Recommended MVP boundary

- One transformation campaign
- Six short stages
- One hero
- Four practice content families
- A shared set of approximately 6–8 tactical threat behaviors
- Practice-specific names, art, flavor, and transformation artifacts
- Approximately 8–12 player capabilities
- One integrated final threat
- A complete success/stall loop
- Lightweight procedural encounter variation
- Upgrade choices between stages
- Embedded first-run instruction
- Responsive mobile and desktop layouts
- Sound controls
- Positive result profiles
- Shareable result-card generation
- Configurable TGG CTA
- Vendor-neutral analytics hooks

Features such as multiple heroes, multiple campaigns, accounts, daily
challenges, a large persistent unlock tree, and competitive leaderboards should
remain outside the first demo unless user testing reveals a strong need.

## Accessibility and quality expectations

- Keyboard and touch input should both be supported.
- Do not rely on color alone to communicate threat intent or practice family.
- Respect reduced-motion preferences.
- Provide readable text and sufficient contrast under TGG brand constraints.
- Include a sound toggle and do not require audio for comprehension.
- Optimize the initial load and interaction path for a campaign link opened on
  a mobile phone.
- Keep marketing links and data collection transparent.

## Open decisions and required research

The next product/design pass must resolve:

1. **Randomization unit:** confirm the recommended mixed-encounter approach
   (dominant and secondary practices per stage), or instead choose one practice
   per stage or one practice per entire run.
2. **Hero name:** approve `Kit Vale` or select another name; the fox species and
   gender-neutral direction are confirmed.
3. **Campaign authenticity:** use TGG's website and case studies to validate the
   enterprise-platform-transformation frame and stage content.
4. **Practice taxonomy:** replace provisional service language with TGG's exact
   Strategy, Execution, People, and Technology positioning.
5. **Brand direction:** run `tgg-brander` and apply its guidance before selecting
   colors, typography, logo usage, illustration details, or public-facing voice.
6. **CTA destination:** identify the approved contact or campaign landing-page
   URL and final CTA copy.
7. **Share mechanism:** determine whether the MVP should prioritize image
   download, native Web Share API, LinkedIn sharing, or a combination.
8. **Analytics provider:** decide whether the demo will use an existing TGG
   platform or only a provider-neutral adapter initially.
9. **Public title clearance:** conduct appropriate legal/domain/trademark review
   before treating `Critical Path` as a final public product name.

## Required next step

Do not begin by inventing a visual system or expanding generic consulting jokes.
First, review TGG's current public materials and the `tgg-brander` skill. Then
produce a concise content-and-brand validation update describing:

- The authentic TGG language that will shape the four practices
- Case-study situations suitable for encounters
- Capabilities suitable for player tools
- Approved or recommended brand treatment
- Any corrections needed to this brief

After those findings and the open decisions are confirmed, implementation of
the web MVP can begin.
