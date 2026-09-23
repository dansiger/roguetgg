import {
  STAGES,
  THREATS,
  ABILITIES,
  UPGRADES,
  CONFIG,
  TOOL_UNLOCKS,
} from "./content.js";
import {
  newRun,
  act,
  promote,
  profile,
  upgradeChoices,
  CELLS,
  key,
  distance,
  canTarget,
  dangerAt,
  gateOpen,
  cost,
} from "./game.js";
import { lessonHint } from "./onboarding.js";
import { track } from "./analytics.js";
const main = document.querySelector("main");
let state = newRun(4217),
  screen = "intro",
  selected = "move",
  inspect = null,
  sound = false,
  audio,
  guidance = true,
  inspecting = false,
  toolUsed = false,
  feedback = "",
  feedbackTimer,
  focusCell = key(state.player);
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const point = (p) => ({
  x: 300 + Math.sqrt(3) * 48 * (p.q + p.r / 2),
  y: 268 + 72 * p.r,
});
const hex = (x, y) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 30) * Math.PI) / 180;
    return `${x + 46 * Math.cos(a)},${y + 46 * Math.sin(a)}`;
  }).join(" ");
function beep() {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.frequency.value = 330 + state.stage * 55;
    g.gain.setValueAtTime(0.025, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
    o.connect(g);
    g.connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.12);
  } catch {
    sound = false;
  }
}
function threatArt(f, x, y) {
  const common = `stroke="#292f2b" stroke-width="2.5" stroke-linejoin="round"`;
  const art = {
    scope: `<path d="M-22 11Q-24-14-9-13Q-7-28 4-15Q26-20 22 9L15 18L6 13L-4 19L-12 13Z" fill="#c3c5ad" ${common}/><path d="M-10-3H-5M7-3H12M-5 7H7" ${common}/><path d="M-21-7L-29-17M20-7L29-17" ${common}/>`,
    hydra: `<path d="M-17 17Q-23-1-16-9M0 18V-11M15 17Q24 0 17-10" fill="none" ${common}/><path d="M-25-10L-17-22L-8-10L-17-4ZM-8-16L0-28L8-16L0-10ZM9-11L18-23L27-11L18-5Z" fill="#c4b8a1" ${common}/><path d="M-21 18H22" ${common}/>`,
    silo: `<path d="M-19 16V-21H-10V-14H-3V-21H5V-14H12V-21H20V16Z" fill="#afb7b3" ${common}/><path d="M-19-4H20M-19 7H20M-7-14V-4M8-4V7M-4 7V16" fill="none" stroke="#555f59" stroke-width="2"/>`,
    wraith: `<path d="M-20 20V-6Q-18-26 0-26Q20-23 20-6V20L10 13L0 20L-10 13Z" fill="#d2cec0" ${common}/><path d="M-9-8L-5-3M9-8L5-3M-4 7H4" ${common}/>`,
    imp: `<path d="M-21-20L-7-13L0-19L8-13L22-20L17 0L24 12L6 10L0 19L-6 10L-24 12L-17 0Z" fill="#b4bfb6" ${common}/><path d="M-9-3L-4 0M9-3L4 0" ${common}/>`,
    mimic: `<rect x="-20" y="-23" width="40" height="43" rx="4" fill="#d9d3b9" ${common}/><path d="M-10-12L-5-6L8-15M-17 6L-9 1L0 8L8 1L17 6" fill="none" ${common}/>`,
    gap: `<path d="M0-29L26-14V14L0 29L-26 14V-14Z" fill="#535d52" ${common}/><path d="M-6-22L5-9L-5 0L8 10L-1 22" fill="none" stroke="#f3eddf" stroke-width="5"/>`,
  };
  return `<g transform="translate(${x} ${y - 2})">${art[f.type]}</g>`;
}
function board(preview = false) {
  const active = !preview && state.status === "playing";
  const hint = active && guidance ? lessonHint(state) : null;
  const shapes = CELLS.map((c) => {
    const { x, y } = point(c),
      f = state.foes.find((e) => key(e) === key(c)),
      player = key(c) === key(state.player),
      gate = key(c) === key(state.gate),
      artifact = state.artifacts.find((a) => key(a) === key(c)),
      danger = dangerAt(state, c);
    const valid = active && !inspecting && canTarget(state, selected, c);
    const label = `${player ? "Kit Vale. " : ""}${f ? THREATS[f.type].name + ", " + f.hp + " resolve points. " : ""}${gate ? "Decision Gate, " + (gateOpen(state) ? "open" : "locked") + ". " : ""}${artifact ? artifact.name + ". " : ""}Hex ${c.q}, ${c.r}.${danger ? " " + danger + " incoming disruption." : ""}${valid ? " Available target." : ""}`;
    return `<g class="tile ${valid ? "available" : ""} ${player ? "player" : ""} ${gate ? "gate" : ""} ${gate && gateOpen(state) ? "gate-open" : ""} ${hint?.target && key(c) === key(hint.target) ? "lesson-target" : ""} ${inspect === f?.id ? "inspected" : ""}" ${active ? `role="button" tabindex="${key(c) === focusCell ? 0 : -1}" data-cell="${key(c)}" aria-label="${esc(label)}"` : ""}><polygon points="${hex(x, y)}" class="hex"/>${danger ? `<polygon points="${hex(x, y)}" fill="url(#hazard)" class="hazard"/>` : ""}${gate ? `<path d="M${x} ${y - 25}L${x + 21} ${y}L${x} ${y + 25}L${x - 21} ${y}Z" fill="${gateOpen(state) ? "#414f40" : "none"}" stroke="#596453" stroke-width="3"/><text x="${x}" y="${y + 5}" class="gate-label">${gateOpen(state) ? "↗" : "◇"}</text>` : ""}${artifact ? `<rect x="${x - 12}" y="${y - 15}" width="24" height="30" rx="3" fill="#edf0e4" stroke="#58654f" stroke-width="2"/><text x="${x}" y="${y + 5}" class="check">✓</text>` : ""}${f ? threatArt(f, x, y) : ""}${f ? `<text x="${x}" y="${y + 32}" class="foe-label">${THREATS[f.type].symbol} · ${f.hp}${f.paused ? " ⏸" : ""}</text>` : ""}${player ? `<image href="assets/kit.svg" x="${x - 29}" y="${y - 40}" width="58" height="67"/><circle cx="${x}" cy="${y + 32}" r="3" fill="#262e29"/>` : ""}${danger ? `<rect x="${x + 19}" y="${y - 34}" width="18" height="18" rx="9" fill="#574b39"/><text x="${x + 28}" y="${y - 21}" class="danger-number">${danger}</text>` : ""}</g>`;
  }).join("");
  const arrows = state.foes
    .filter((f) => f.intent.kind === "move")
    .map((f) => {
      const a = point(f),
        b = point(f.intent.cells[0]);
      return `<path d="M${a.x + (b.x - a.x) * 0.48} ${a.y + (b.y - a.y) * 0.48}L${a.x + (b.x - a.x) * 0.77} ${a.y + (b.y - a.y) * 0.77}" stroke="#737865" stroke-width="2" marker-end="url(#arrow)"/>`;
    })
    .join("");
  return `<svg class="board" viewBox="0 0 600 538" role="group" aria-label="Tactical board. Stripes mark incoming disruption. Use arrow keys to browse hexes."><defs><pattern id="hazard" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0V10" stroke="#a68c64" stroke-width="2" opacity=".42"/></pattern><marker id="arrow" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto"><path d="M0 0L5 2.5L0 5" fill="none" stroke="#737865"/></marker></defs>${shapes}<g pointer-events="none">${arrows}</g></svg>`;
}
function intro() {
  return `<section class="landing"><div class="intro-copy"><div class="eyebrow"><span class="tiny-diamond">◇</span> A TACTICAL CORPORATE FANTASY</div><h1>Big initiative.<br>Small fox.<br><em>Your move.</em></h1><p class="intro-description">Lead a transformation through scope creeps, data silos, and decisions that grow extra heads.</p><p>Meet Kit Vale. Rising leader. Practical blazer.<br>Absolutely no time for another alignment meeting.</p><button class="primary start" data-action="start">Start your initiative <span>↗</span></button><div class="intro-meta"><span>6 stages</span><span>5–10 minutes</span><span>Every move matters</span></div></div><div class="preview"><div class="preview-label">THE ROAD TO THE C-SUITE <span>01 / 06</span></div>${board(true)}<div class="preview-caption"><span class="line"></span> Turn organizational chaos into forward momentum.</div></div></section><section class="principles"><div><span>01 / READ THE ROOM</span><h3>No surprises. Just consequences.</h3><p>See what risks will do next. Think for as long as you like.</p></div><div><span>02 / MAKE YOUR MOVE</span><h3>Clarity is a superpower.</h3><p>Turn project problems into plans, decisions, and useful artifacts.</p></div><div><span>03 / KEEP IT MOVING</span><h3>From kickoff to lasting value.</h3><p>Build your capabilities. Earn your next title. Bring the team along.</p></div></section>`;
}
function game() {
  const stage = STAGES[state.stage],
    f = state.foes.find((e) => e.id === inspect);
  const hint = guidance ? lessonHint(state) : null;
  const tools = ABILITIES.filter(
    (a) => a.id !== "move" && TOOL_UNLOCKS[a.id] <= state.stage,
  );
  const freshTool = ABILITIES.find(
    (a) => a.id !== "move" && TOOL_UNLOCKS[a.id] === state.stage,
  );
  const objective = gateOpen(state)
    ? "Reach the Decision Gate"
    : `Resolve ${Math.max(0, stage.quota - state.resolved)} more risk${stage.quota - state.resolved === 1 ? "" : "s"}`;
  const toolText =
    selected === "align"
      ? "Pause every risk within 2 hexes for two turns."
      : selected === "recover"
        ? "Restore 3 capacity. Risks still act."
        : selected === "insight"
          ? `Resolve ${state.insight} points of a risk up to ${state.range} hexes away.`
          : selected === "dash"
            ? `Reposition to an empty hex up to ${state.stride} away.`
            : ABILITIES.find((a) => a.id === selected)?.description;
  return `<section class="play-shell">
    <header class="play-heading"><div><span class="eyebrow">LEVEL ${state.stage + 1} / 6 · ${stage.rank}</span><h1>${stage.name}</h1></div><div class="compact-health"><span>Capacity <strong>${state.hp}/${state.maxHp}</strong></span><div class="meter" role="meter" aria-label="Leadership capacity" aria-valuenow="${state.hp}" aria-valuemin="0" aria-valuemax="${state.maxHp}"><div style="width:${(state.hp / state.maxHp) * 100}%"></div></div></div></header>
    <section class="play-board" aria-label="Encounter"><div class="play-objective"><strong>${objective}${state.stage === 5 && !state.bossResolved ? " · close the Value Gap" : ""}</strong><span>Turn ${state.turn + 1}</span></div>
    ${hint ? `<div class="coach-space"><div class="coach-bubble" role="status" data-lesson="${hint.id}"><strong>${hint.title}</strong><p>${hint.text}</p></div><button class="skip-guide" data-action="skip-guide">Skip guidance</button></div>` : ""}
    <div class="board-scene">${board()}</div>
    ${f ? `<div class="inspect-popover" role="status"><button data-action="close-inspect" aria-label="Close risk details">×</button><strong>${THREATS[f.type].name} · ${f.hp} to resolve</strong><p>${state.stage === 0 && f.type === "scope" ? "Move beside it, then tap it to turn it into a controlled backlog." : THREATS[f.type].behavior}</p></div>` : ""}
    ${feedback ? `<div class="play-feedback" role="status">${esc(feedback)}</div>` : ""}
    </section>
    ${tools.length ? `<section class="tool-dock" aria-label="Tools to use on the board"><div class="dock-heading"><strong>Your tools</strong><span>Influence <b>${state.energy}/${state.maxEnergy}</b></span></div>${!toolUsed && freshTool ? `<p class="new-tool-hint">New: <strong>${freshTool.name}</strong>. Tap the tool to see how to use it. Tools spend influence; resolving risks earns it back.</p>` : ""}<div class="tool-buttons">${tools.map((a) => `<button data-ability="${a.id}" class="tool-button ${selected === a.id ? "selected" : ""}" aria-pressed="${selected === a.id}" ${state.energy < cost(state, a.id) || (a.id === "recover" && (state.recovered || state.hp === state.maxHp)) ? "disabled" : ""}><span>${a.icon}</span> ${a.name}<small>${cost(state, a.id)} influence</small></button>`).join("")}</div>${selected !== "move" ? `<div class="tool-instruction" role="status"><p>${toolText}</p>${["align", "recover"].includes(selected) ? `<button class="primary" data-action="use-tool">Use ${ABILITIES.find((a) => a.id === selected).name}</button>` : ""}<button class="text-button" data-action="cancel-tool">Cancel · move instead</button></div>` : ""}</section>` : ""}
    <div class="play-controls"><button data-action="inspect-mode" aria-pressed="${inspecting}">${inspecting ? "Cancel inspect" : "Inspect a risk"}</button>${state.stage > 0 ? '<button data-action="wait">Wait · +1 influence</button>' : ""}${state.stage === 0 && !guidance ? '<button data-action="show-guide">Show guidance</button>' : ""}<button data-action="restart">Restart</button></div>
    ${inspecting ? '<p class="inspect-hint" role="status">Tap a risk on the board to read its next action. Inspecting does not use a turn.</p>' : ""}
  </section>`;
}
function upgradeView() {
  const next = STAGES[state.stage + 1];
  if (state.stage === 0)
    return `<section class="first-promotion"><img src="assets/kit.svg" alt="Kit Vale" width="110" height="128"><div class="eyebrow">PROMOTED TO VICE PRESIDENT</div><h1>You made room<br>for progress.</h1><p>Two risks transformed. Your next move comes with a new tool.</p><div class="earned-tool"><span>◎</span><div><small>YOUR FIRST TOOL</small><h2>Facilitate</h2><p>Pause nearby risks for two turns.<br>A good conversation buys breathing room.</p></div></div><button class="primary" data-upgrade="first-tool">Try it in Level 2 <span>↗</span></button><p class="promotion-recovery">Capacity restored. Influence refilled.</p></section>`;
  return `<section class="interlude"><div class="eyebrow">DECISION GATE CLEARED / STAGE ${state.stage + 1}</div><h1>A little more influence.<br>A larger remit.</h1><div class="promotion"><img src="assets/kit.svg" alt="Kit Vale" width="100" height="117"><div><span class="eyebrow">PROMOTED TO</span><h2>${next.rank}</h2><p>${next.quote}</p></div></div><p class="promotion-tool">New tool unlocked: <strong>${ABILITIES.find((a) => a.id !== "move" && TOOL_UNLOCKS[a.id] === state.stage + 1)?.name}</strong></p><div class="section-label"><h2>What will you bring into ${next.name.toLowerCase()}?</h2><p>Choose one artifact. Restore ${3 + state.restBonus} capacity and refill influence.</p></div><div class="upgrade-grid">${upgradeChoices(
    state,
  )
    .map(
      (u) =>
        `<button class="upgrade-card" data-upgrade="${u.id}"><span class="eyebrow">${u.type}</span><span class="artifact-icon">◇</span><h3>${u.name}</h3><p>${u.description}</p><span class="choose">Take this forward ↗</span></button>`,
    )
    .join("")}</div></section>`;
}
function results() {
  const p = profile(state),
    won = state.status === "won";
  return `<section class="results"><div class="result-card"><div class="eyebrow">CRITICAL PATH / ${won ? "VALUE REALIZED" : "PROGRESS WORTH BUILDING ON"}</div><img class="result-fox" src="assets/kit.svg" alt="Kit Vale" width="145" height="169"><h1>${p.title}</h1><p>${won ? "You turned competing priorities into coordinated action. The initiative is delivering value—and it has an owner." : `Your initiative paused during ${STAGES[state.stage].name.toLowerCase()}, but the next chapter starts with a clearer path because of your work.`}</p><div class="result-stats"><div><strong>${state.totalResolved}</strong><span>risks transformed</span></div><div><strong>${state.totalTurns}</strong><span>decisions made</span></div><div><strong>${state.stage + 1}/6</strong><span>stages reached</span></div></div><div class="signature"><span>HIGHEST TITLE</span><strong>${p.rank}</strong><span>SIGNATURE CAPABILITY</span><strong>${p.signature}</strong></div><p class="result-joke">The steering committee has requested a copy of this result.</p><div class="result-brand"><img src="assets/tgg-logo.svg" alt="The Gunter Group" width="100" height="49"><span>CRITICAL PATH<br>Enterprise transformation</span></div></div><div class="result-actions"><span class="eyebrow">GOOD WORK TRAVELS.</span><h2>Give your progress<br>a little visibility.</h2><button class="primary" data-action="download">Download your result <span>↓</span></button><button class="secondary" data-action="share">Share your result ↗</button><p id="share-status" role="status"></p><div class="cta"><h3>Complex initiatives don’t need a hero working alone.</h3><p>See how The Gunter Group helps leaders turn strategy into outcomes.</p><a class="cta-link" data-track="contact" href="${CONFIG.contact}" target="_blank" rel="noopener">Talk with TGG ↗</a><a class="explore" href="${CONFIG.explore}" target="_blank" rel="noopener">Explore how TGG works</a></div><button class="text-button" data-action="start">Try another initiative ↻</button><p class="muted">New layout. New choices. Same practical blazer.</p></div></section>`;
}
function render() {
  const previous = document.activeElement;
  const focus = previous?.dataset?.cell;
  main.innerHTML =
    screen === "intro"
      ? intro()
      : state.status === "upgrade"
        ? upgradeView()
        : ["won", "stalled"].includes(state.status)
          ? results()
          : game();
  if (focus)
    main
      .querySelector(`[data-cell="${focus}"]`)
      ?.focus({ preventScroll: true });
}
function start() {
  state = newRun(crypto.getRandomValues(new Uint32Array(1))[0]);
  screen = "game";
  selected = "move";
  inspect = null;
  inspecting = false;
  guidance = true;
  toolUsed = false;
  feedback = "";
  clearTimeout(feedbackTimer);
  focusCell = key(state.player);
  track("run_started", { seed: state.seed });
  render();
  main.focus();
  window.scrollTo(0, 0);
}
function execute(id, p) {
  const beforeResolved = state.totalResolved,
    beforeHp = state.hp;
  const old = state.status,
    stage = state.stage;
  if (act(state, id, p)) {
    beep();
    selected = "move";
    inspecting = false;
    inspect = null;
    track("action_taken", { action: id, stage });
    if (id !== "move" && TOOL_UNLOCKS[id] === state.stage) toolUsed = true;
    if (stage === 0 && state.status === "upgrade") track("tutorial_completed");
    if (state.status !== old) {
      if (state.status === "upgrade" || state.status === "won")
        track("stage_completed", { stage });
      if (state.status === "won") track("campaign_completed");
      if (["won", "stalled"].includes(state.status))
        track("run_ended", {
          outcome: state.status,
          stage,
          durationSeconds: Math.round((Date.now() - state.startedAt) / 1000),
        });
      window.scrollTo(0, 0);
    }
  }
  feedback =
    state.hp < beforeHp
      ? `−${beforeHp - state.hp} capacity. Watch the striped hexes.`
      : state.totalResolved > beforeResolved
        ? state.stage === 0
          ? "Risk transformed. Progress made."
          : state.message
        : state.message.startsWith("Choose") ||
            state.message.startsWith("Not enough")
          ? state.message
          : "";
  clearTimeout(feedbackTimer);
  if (feedback)
    feedbackTimer = setTimeout(() => {
      feedback = "";
      main.querySelector(".play-feedback")?.remove();
    }, 2400);
  render();
  document.querySelector("#announcement").textContent = state.message;
  if (state.status !== old) main.focus();
}
main.addEventListener("click", async (e) => {
  const b = e.target.closest("button,a,[data-cell]");
  if (!b) return;
  if (b.dataset.track) track("contact_cta_clicked");
  if (b.dataset.action === "start") start();
  if (b.dataset.action === "restart") {
    if (confirm("Start a fresh initiative? This run will end.")) start();
  }
  if (b.dataset.action === "wait") execute("wait");
  if (b.dataset.action === "download") await downloadResult();
  if (b.dataset.action === "share") await shareResult();
  if (b.dataset.action === "skip-guide" || b.dataset.action === "show-guide") {
    guidance = b.dataset.action === "show-guide";
    track(guidance ? "tutorial_resumed" : "tutorial_skipped");
    render();
    main
      .querySelector(
        guidance ? '[data-action="skip-guide"]' : '[data-action="show-guide"]',
      )
      ?.focus({ preventScroll: true });
  }
  if (b.dataset.action === "inspect-mode") {
    inspecting = !inspecting;
    inspect = null;
    selected = "move";
    render();
    main
      .querySelector('[data-action="inspect-mode"]')
      ?.focus({ preventScroll: true });
  }
  if (b.dataset.action === "close-inspect") {
    inspect = null;
    inspecting = false;
    render();
    main
      .querySelector('[data-action="inspect-mode"]')
      ?.focus({ preventScroll: true });
  }
  if (b.dataset.action === "cancel-tool") {
    selected = "move";
    render();
    main.querySelector("[data-ability]")?.focus({ preventScroll: true });
  }
  if (b.dataset.action === "use-tool") execute(selected);
  if (b.dataset.ability) {
    selected = selected === b.dataset.ability ? "move" : b.dataset.ability;
    inspecting = false;
    inspect = null;
    render();
    main
      .querySelector(`[data-ability="${b.dataset.ability}"]`)
      ?.focus({ preventScroll: true });
  }
  if (b.dataset.cell) {
    const [q, r] = b.dataset.cell.split(",").map(Number);
    focusCell = b.dataset.cell;
    if (inspecting) {
      inspect = state.foes.find((f) => f.q === q && f.r === r)?.id ?? null;
      render();
    } else execute(selected, { q, r });
  }
  if (b.dataset.inspect) {
    inspect = Number(b.dataset.inspect);
    render();
    main
      .querySelector(`[data-inspect="${inspect}"]`)
      ?.focus({ preventScroll: true });
  }
  if (b.dataset.upgrade) {
    const id = b.dataset.upgrade;
    if (promote(state, id)) {
      track("upgrade_selected", { id });
      track("promotion_earned", { stage: state.stage });
      inspect = null;
      inspecting = false;
      toolUsed = false;
      feedback = "";
      clearTimeout(feedbackTimer);
      focusCell = key(state.player);
      render();
      main.focus();
      window.scrollTo(0, 0);
    }
  }
});
main.addEventListener("keydown", (e) => {
  const cell = e.target.closest("[data-cell]");
  if (!cell) return;
  if (["Enter", " "].includes(e.key)) {
    e.preventDefault();
    cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    return;
  }
  if (e.key.startsWith("Arrow")) {
    e.preventDefault();
    const [q, r] = cell.dataset.cell.split(",").map(Number);
    const a = point({ q, r });
    const axis = e.key === "ArrowLeft" || e.key === "ArrowRight" ? "x" : "y";
    const sign = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 1;
    const other = axis === "x" ? "y" : "x";
    const candidates = CELLS.filter(
      (c) => (point(c)[axis] - a[axis]) * sign > 1,
    ).sort((c, d) => {
      const score = (p) =>
        Math.abs(point(p)[axis] - a[axis]) +
        Math.abs(point(p)[other] - a[other]) * 2;
      return score(c) - score(d);
    });
    if (candidates[0]) {
      focusCell = key(candidates[0]);
      for (const tile of main.querySelectorAll("[data-cell]"))
        tile.setAttribute(
          "tabindex",
          tile.dataset.cell === focusCell ? "0" : "-1",
        );
      main.querySelector(`[data-cell="${focusCell}"]`).focus();
    }
  }
});
document.addEventListener("keydown", (e) => {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.repeat ||
    document.querySelector("dialog[open]") ||
    screen !== "game" ||
    state.status !== "playing"
  )
    return;
  if (e.key === "Escape") {
    selected = "move";
    inspecting = false;
    inspect = null;
    render();
  }
  const a = ABILITIES.find((a) => a.key === e.key);
  if (a) {
    e.preventDefault();
    if (a.id === "move") {
      selected = "move";
      inspecting = false;
      inspect = null;
      render();
      return;
    }
    main.querySelector(`[data-ability="${a.id}"]`)?.click();
  }
  if (e.key.toLowerCase() === "w" && state.stage > 0) {
    e.preventDefault();
    execute("wait");
  }
});
document.querySelector("#sound").onclick = (e) => {
  sound = !sound;
  e.currentTarget.textContent = sound ? "Sound on" : "Sound off";
  e.currentTarget.setAttribute("aria-pressed", sound);
  beep();
};
document.querySelector("#help").onclick = () =>
  document.querySelector("#help-dialog").showModal();
document.querySelector("#close-help").onclick = () =>
  document.querySelector("#help-dialog").close();
async function resultBlob() {
  const p = profile(state),
    canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 1200;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#eeeae0";
  ctx.fillRect(0, 0, 1200, 1200);
  ctx.fillStyle = "#252c29";
  ctx.fillRect(0, 1000, 1200, 200);
  const img = async (src) => {
    const i = new Image();
    i.src = src;
    await i.decode();
    return i;
  };
  const [fox, logo] = await Promise.all([
    img("assets/kit.svg"),
    img("assets/tgg-logo.svg"),
  ]);
  ctx.fillStyle = "#515b50";
  ctx.font = "20px Arial";
  ctx.fillText(
    "CRITICAL PATH / " +
      (state.status === "won"
        ? "VALUE REALIZED"
        : "PROGRESS WORTH BUILDING ON"),
    80,
    90,
  );
  ctx.drawImage(fox, 490, 140, 220, 257);
  ctx.textAlign = "center";
  ctx.fillStyle = "#252c29";
  ctx.font = "bold 64px Arial";
  ctx.fillText(p.title, 600, 485);
  ctx.font = "28px Arial";
  ctx.fillText(p.rank + " · Enterprise transformation", 600, 540);
  ctx.font = "bold 76px Arial";
  ctx.fillText(String(state.totalResolved), 330, 685);
  ctx.fillText(String(state.totalTurns), 870, 685);
  ctx.font = "24px Arial";
  ctx.fillText("risks transformed", 330, 730);
  ctx.fillText("decisions made", 870, 730);
  ctx.font = "20px Arial";
  ctx.fillText("SIGNATURE CAPABILITY", 600, 830);
  ctx.font = "bold 36px Arial";
  ctx.fillText(p.signature, 600, 885);
  ctx.font = "22px Arial";
  ctx.fillText("The steering committee has requested a copy.", 600, 955);
  ctx.drawImage(logo, 80, 1050, 162, 80);
  ctx.textAlign = "right";
  ctx.fillStyle = "#fff";
  ctx.font = "30px Arial";
  ctx.fillText("A little strategy goes a long way.", 1120, 1090);
  ctx.font = "22px Arial";
  ctx.fillText("guntergroup.com", 1120, 1130);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw Error("Could not create image");
  track("result_card_generated");
  return blob;
}
async function downloadResult() {
  try {
    const blob = await resultBlob(),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "critical-path-result.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    document.querySelector("#share-status").textContent =
      "Your result card is ready.";
  } catch {
    document.querySelector("#share-status").textContent =
      "The image could not be created. Please try again.";
  }
}
async function shareResult() {
  track("share_initiated");
  try {
    const file = new File([await resultBlob()], "critical-path-result.png", {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        title: "Critical Path",
        text: `${profile(state).title} — ${state.totalResolved} risks transformed.`,
        files: [file],
      });
    } else {
      await downloadResult();
      document.querySelector("#share-status").textContent =
        "Result downloaded. Attach it to a message or post to share.";
    }
  } catch (e) {
    document.querySelector("#share-status").textContent =
      e.name === "AbortError"
        ? "Sharing canceled. Your result is still here."
        : "Sharing is unavailable. Use Download your result.";
  }
}
track("game_loaded");
render();
