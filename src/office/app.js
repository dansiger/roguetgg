import {
  resumeInterruption,
  ROUNDS,
  newSession,
  advanceTime,
  interact,
  startPour,
  stopPour,
  nextRound,
  resultProfile,
} from "./game.js";
const main = document.querySelector("#main"),
  announcer = document.querySelector("#announcer");
let session = newSession(),
  screen = "intro",
  paused = false,
  sound = false,
  audio,
  last = performance.now(),
  feedbackRemaining = 0,
  reported = false,
  pointerId = null;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const say = (text) => (announcer.textContent = text);
function event(name, detail = {}) {
  window.dispatchEvent(
    new CustomEvent("office:analytics", { detail: { name, ...detail } }),
  );
}
function tone(kind = "tap") {
  if (!sound) return;
  try {
    audio ??= new AudioContext();
    audio.resume();
    const time = audio.currentTime;
    const notes =
      kind === "win"
        ? [440, 554, 660]
        : kind === "lose"
          ? [180, 140]
          : kind === "shred"
            ? [120, 75, 45]
            : [330];
    notes.forEach((freq, i) => {
      const o = audio.createOscillator(),
        g = audio.createGain();
      o.type = kind === "shred" ? "sawtooth" : "sine";
      o.frequency.setValueAtTime(freq, time + i * 0.075);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.setValueAtTime(0.045, time + i * 0.075);
      g.gain.exponentialRampToValueAtTime(0.0001, time + i * 0.075 + 0.12);
      o.connect(g);
      g.connect(audio.destination);
      o.start(time + i * 0.075);
      o.stop(time + i * 0.075 + 0.14);
    });
  } catch {
    sound = false;
  }
}
function mugArt() {
  return `<div class="coffee-machine"><span>TEAM WELLNESS DISPENSER</span><div class="spout"></div></div><div class="coffee-stream"></div><div class="mug-handle"></div><div class="mug"><div class="coffee-fill"></div><div class="target-band" style="bottom:${session.round.min}%;height:${session.round.max - session.round.min}%"><span>STOP HERE</span></div><div class="mug-print">WORLD’S<br><b>OKAYEST</b><br>BENEFITS</div><div class="mug-shine"></div></div><div class="coffee-shadow"></div>`;
}
function manager(i, dir) {
  const names = ["CEO", "CFO", "VP", "SVP"];
  return `<button class="manager ${dir === 0 ? "aligned" : ""}" data-person="${i}" aria-label="Turn ${names[i]}, currently pointing ${["right, aligned", "down", "left", "up"][dir]}"><span class="manager-role">${names[i]}</span><span class="manager-head"><i class="hair hair-${i}"></i><i class="eyes"></i><i class="mouth"></i></span><span class="manager-body"><i class="tie"></i></span><span class="direction" style="--angle:${dir * 90}deg">➜</span><span class="aligned-check">${dir === 0 ? "✓" : "↻"}</span></button>`;
}
function intro() {
  return `<section class="intro"><div class="intro-text"><span class="eyebrow">THE TINY OFFICE ARCADE</span><h1>Everything<br>is <em>fine.</em><span class="asterisk">*</span></h1><p class="intro-sub">Eight minor emergencies.<br>One completely normal workday.</p><button class="primary" data-action="start">Clock in <span>→</span></button><p class="intro-detail">About a minute. No actual work required.</p><p class="asterisk-note">*This statement has been approved by management.</p></div><div class="intro-scene" aria-hidden="true"><div class="scene-label">BUSINESS AS USUAL / 09:00</div><div class="wall-clock"><i></i><b></b></div><div class="poster">STAY<br>POSITIVE.<small>THE NUMBERS ARE OPTIONAL.</small></div><div class="monitor"><div class="monitor-screen"><span class="status-label">COMPANY STATUS</span><strong>ALL<br>GOOD<span>✓</span></strong><div class="chart-bars"><i></i><i></i><i></i><i></i><i></i></div></div><div class="monitor-foot"></div></div><div class="desk"></div><div class="sticky sticky-a">just one<br>tiny change :)</div><div class="sticky sticky-b">URGENT<small>(again)</small></div><div class="intro-mug">this is<br><b>fine.</b><i></i></div><div class="paper-stack"></div><div class="scene-caption">PLEASE IGNORE THE SOUND FROM FINANCE.</div></div></section><div class="intro-strip"><span>SHRED THE EXTRAS</span><b>✳</b><span>ALIGN THE BOSSES</span><b>✳</b><span>CAFFEINATE RESPONSIBLY</span><b>✳</b><span>QUESTION THE DASHBOARD</span></div>`;
}
function arena() {
  const r = session.round;
  if (r.type === "scope")
    return `<div class="scope-arena"><div class="note-field ${r.goal > 4 ? "many" : ""}">${r.notes.map((label, i) => `<button class="request-note note-${i % 4}" data-note="${i}" style="--tilt:${[-5, 4, 3, -4, 6, -3, 2][i]}deg"><small>SMALL REQUEST #${i + 1}</small><strong>${esc(label)}</strong><span>“Should be easy.”</span></button>`).join("")}</div><div class="shredder"><div class="shred-slot"></div><div class="shred-teeth"></div><span>PHASE TWO</span><small>STRATEGIC REQUEST STORAGE</small><i class="power-light"></i></div></div>`;
  if (r.type === "align")
    return `<div class="alignment-arena"><div class="exit-sign">EXIT →</div><div class="conference-table"><span>QUICK<br>SYNC<small>EST. 2019</small></span></div><div class="managers managers-${r.goal}">${r.directions.map((d, i) => manager(i, d)).join("")}</div><span class="table-note">We’re all on the same page.<br>Different documents.</span></div>`;
  if (r.type === "coffee")
    return `<div class="coffee-arena">${mugArt()}<div class="coffee-controls"><button class="pour-button" data-pour="true" aria-label="Hold to pour coffee, release in the target band">HOLD TO POUR <span>↓</span></button><p class="coffee-tip" role="status">Release inside the striped band.</p></div></div>`;
  return `<div class="alarm-arena"><div class="dashboard-banner"><span class="dashboard-light"></span> ALL SYSTEMS GREEN <small>we checked*</small></div><div class="alarm-grid">${Array.from({ length: 9 }, (_, i) => `<button class="alarm-cell ${i === r.alarm ? "red" : ""}" data-alarm="${i}" aria-label="${i === r.alarm ? "Red flag. Tap to expose." : "Green status. No alarm."}"><span class="alarm-icon">${i === r.alarm ? "!" : "✓"}</span><span class="alarm-label">${i === r.alarm ? "ACTUAL PROBLEM" : "LOOKS FINE"}</span></button>`).join("")}</div><span class="dashboard-footnote">*we checked that the dashboard was green</span></div>`;
}
function gameView() {
  const r = session.round;
  return `<section class="game-shell"><div class="shift-bar"><span>INCIDENT ${session.index + 1} / ${ROUNDS.length}</span><div class="shift-dots" aria-label="${session.results.filter((x) => x.won).length} incidents handled">${ROUNDS.map((_, i) => `<i class="${i === session.index ? "current" : i < session.index ? (session.results[i].won ? "done" : "oops") : ""}"></i>`).join("")}</div><button class="slow-toggle" data-action="untimed" aria-pressed="${session.untimed}">${session.untimed ? "No timer" : "No-timer mode"}</button></div><div class="challenge-heading"><p class="eyebrow">${r.context}</p><h1 id="challenge-title">${r.title}</h1><p id="challenge-instruction">${r.instruction}</p></div><div class="game-frame" data-type="${r.type}" aria-labelledby="challenge-title" aria-describedby="challenge-instruction"><div class="timer-track"><div id="timer-fill"></div></div><div class="frame-status"><span id="timer-label">Take a look. Timer starts when you act.</span><span id="round-progress">${r.type === "coffee" ? "STEADY HANDS." : "0 / " + r.goal}</span></div><div class="arena">${arena()}</div><div class="punchline" hidden></div></div><p class="keyboard-note">${r.type === "coffee" ? "Keyboard: Tab to POUR, then hold Space or Enter." : "Keyboard: Tab to a target, then Enter or Space."} <span>Nothing leaves this browser.</span></p></section>`;
}
function results() {
  const p = resultProfile(session);
  return `<section class="results"><div class="result-sheet"><span class="paper-hole hole-one"></span><span class="paper-hole hole-two"></span><div class="result-top"><span>DEPARTMENT OF GETTING THROUGH IT</span><span>FORM: OOF-008</span></div><div class="result-stamp">STILL<br>EMPLOYED ✓</div><p class="eyebrow">END OF DAY / SOMEHOW</p><h1>You made it<br>to <em>5:00.</em></h1><p class="result-copy">${p.line}</p><div class="result-score"><strong>${p.score}<span>/8</span></strong><p>minor emergencies<br>made someone else’s problem</p></div><div class="promotion-title"><span>YOUR COMPLETELY UNOFFICIAL TITLE</span><h2>${p.title}</h2></div><p class="fine-print">No meetings were meaningfully shortened in the making of this game.</p></div><aside class="result-aside"><span class="eyebrow">TOMORROW, WE DO IT AGAIN.</span><h2>Send this to your<br>favorite coworker.</h2><button class="primary" data-action="share">Share your survival report <span>↗</span></button><button class="secondary" data-action="download">Download result card ↓</button><p class="share-status" role="status"></p><button class="text-button" data-action="start">Another completely normal day ↻</button><div class="tgg-cta"><h3>The game is absurd.<br>The problems are familiar.</h3><p>The Gunter Group helps teams make real progress through the messy parts of business.</p><a href="https://guntergroup.com/lets-talk/" target="_blank" rel="noopener" data-contact="true">Fewer fires. Better work. Let’s talk. ↗</a></div><a class="old-game" href="tactical.html">Compare with the tactical prototype</a></aside></section>`;
}
function render() {
  main.innerHTML =
    screen === "intro"
      ? intro()
      : screen === "results"
        ? results()
        : gameView();
  document.querySelector("#pause").hidden = screen !== "game";
}
function start() {
  session = newSession(crypto.getRandomValues(new Uint32Array(1))[0]);
  screen = "game";
  paused = false;
  reported = false;
  feedbackRemaining = 0;
  pointerId = null;
  document.body.classList.remove("is-paused");
  document.querySelector("#pause").textContent = "Pause";
  last = performance.now();
  render();
  main.focus();
  window.scrollTo(0, 0);
  event("session_started");
  say(ROUNDS[0].title + " " + ROUNDS[0].instruction);
}
function burst(target, kind) {
  if (reduced.matches) return;
  const rect = target.getBoundingClientRect();
  for (let i = 0; i < 12; i++) {
    const bit = document.createElement("i");
    bit.className = "paper-bit";
    bit.style.cssText = `left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;--dx:${(Math.random() - 0.5) * 200}px;--dy:${80 + Math.random() * 200}px;--rot:${Math.random() * 500}deg;background:${kind === "shred" ? ["#f2d675", "#e8a187", "#e0e7cf"][i % 3] : ["#f5cd60", "#81b49b", "#e98e69"][i % 3]}`;
    document.body.append(bit);
    bit.addEventListener("animationend", () => bit.remove(), { once: true });
    setTimeout(() => bit.remove(), 1500);
  }
}
function syncBoard(kind, value, target) {
  const r = session.round;
  if (kind === "note") {
    target.classList.add("shredded");
    target.disabled = true;
    target.setAttribute("aria-label", "Request shredded");
    const shredder = document.querySelector(".shredder");
    shredder.classList.remove("chomp");
    void shredder.offsetWidth;
    shredder.classList.add("chomp");
    burst(target, "shred");
    tone("shred");
    if (document.activeElement === target)
      document
        .querySelector("[data-note]:not(:disabled)")
        ?.focus({ preventScroll: true });
  }
  if (r.type === "scope")
    document.querySelectorAll("[data-note]").forEach((b) => {
      const i = Number(b.dataset.note),
        removed = r.removed.includes(i);
      b.disabled = removed;
      b.classList.toggle("shredded", removed);
      b.classList.toggle("returned", i === r.returnedNote);
      if (!removed) b.removeAttribute("aria-label");
      if (i === r.returnedNote)
        b.querySelector("small").textContent = "LEADERSHIP PRIORITY";
    });
  if (kind === "person") {
    document.querySelectorAll("[data-person]").forEach((target) => {
      const value = Number(target.dataset.person);
      const d = r.directions[value];
      target.classList.toggle("aligned", d === 0);
      target
        .querySelector(".direction")
        .style.setProperty("--angle", `${d * 90}deg`);
      target.querySelector(".aligned-check").textContent = d === 0 ? "✓" : "↻";
      target.setAttribute(
        "aria-label",
        `Turn ${target.querySelector(".manager-role").textContent}, currently pointing ${["right, aligned", "down", "left", "up"][d]}`,
      );
      target.classList.toggle(
        "distracted",
        value === r.distractedPerson && d !== 0,
      );
    });
    tone();
  }
  if (kind === "alarm") {
    document.querySelectorAll("[data-alarm]").forEach((button) => {
      const red = Number(button.dataset.alarm) === r.alarm;
      button.classList.toggle("red", red);
      button.querySelector(".cya-sticker")?.remove();
      if (red && r.covered) {
        const sticker = document.createElement("span");
        sticker.className = "cya-sticker";
        sticker.innerHTML = "ON TRACK<small>APPROVED ✓</small>";
        button.append(sticker);
      }
      button.querySelector(".alarm-icon").textContent = red ? "!" : "✓";
      button.querySelector(".alarm-label").textContent = red
        ? "ACTUAL PROBLEM"
        : "LOOKS FINE";
      button.setAttribute(
        "aria-label",
        red && r.covered
          ? "ON TRACK sticker covering a red flag. Tap to peel."
          : red
            ? "Red flag. Tap to expose."
            : "Green status. No alarm.",
      );
    });
    burst(target, "confetti");
    tone();
  }
  document.querySelector("#round-progress").textContent =
    `${r.hits} / ${r.goal}`;
}
function syncInterruption() {
  const r = session.round,
    existing = document.querySelector(".interruption");
  if (!r.interruption) {
    if (existing) {
      const hadFocus = existing.contains(document.activeElement);
      existing.remove();
      document.querySelector(".arena").inert = reported;
      if (hadFocus)
        (
          document.querySelector(
            "[data-pour], .request-note:not(:disabled), .manager.distracted, .alarm-cell.red",
          ) || main
        ).focus({ preventScroll: true });
    }
    return;
  }
  if (existing) return;
  const pour = document.querySelector("[data-pour]");
  if (pointerId !== null && pour?.hasPointerCapture(pointerId))
    pour.releasePointerCapture(pointerId);
  pointerId = null;
  document.querySelector(".coffee-arena")?.classList.remove("pouring");
  if (r.tall) {
    document.querySelector(".coffee-arena").classList.add("tall-cup");
    const band = document.querySelector(".target-band");
    band.style.bottom = `${r.min}%`;
    band.style.height = `${r.max - r.min}%`;
    document.querySelector(".coffee-tip").textContent =
      "Hold POUR again. The meeting got longer.";
  }
  const box = document.createElement("div");
  box.className = "interruption";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-labelledby", "interruption-title");
  box.setAttribute("aria-describedby", "interruption-message");
  box.innerHTML = `<span class="eyebrow">CLOCK PAUSED · OFFICE NONSENSE</span><h2 id="interruption-title">${esc(r.interruption.title)}</h2><p id="interruption-message">${esc(r.interruption.message)}</p><p class="twist-instruction">${esc(r.interruption.instruction)}</p><button data-action="dismiss-interruption">Back to it →</button>`;
  document.querySelector(".game-frame").append(box);
  document.querySelector(".arena").inert = true;
  box.querySelector("button").focus({ preventScroll: true });
  say(`${r.interruption.message} ${r.interruption.instruction} Clock paused.`);
  event("office_interruption", { index: session.index, type: r.type });
}
function conclude() {
  if (reported || !["won", "lost"].includes(session.round.status)) return;
  reported = true;
  const r = session.round,
    won = r.status === "won";
  feedbackRemaining = 3.2;
  const box = document.querySelector(".punchline");
  box.hidden = false;
  box.className = `punchline ${won ? "success" : "failure"}`;
  box.innerHTML = `<span class="outcome-seal">${won ? "✓" : "↗"}</span><span class="eyebrow">${won ? "INCIDENT CONTAINED" : "ESCALATED. NATURALLY."}</span><h2>${won ? r.win : r.lose}</h2><button data-action="continue">${session.index === ROUNDS.length - 1 ? "Clock out" : "Next incident"} →</button>`;
  document.querySelector(".arena").inert = true;
  box.querySelector("button").focus({ preventScroll: true });
  tone(won ? "win" : "lose");
  say(won ? r.win : r.lose);
  event("challenge_ended", {
    index: session.index,
    type: r.type,
    won,
    elapsed: r.elapsed,
    untimed: session.untimed,
  });
}
function next() {
  if (!reported || paused) return;
  if (!nextRound(session)) return;
  reported = false;
  feedbackRemaining = 0;
  pointerId = null;
  if (session.index >= ROUNDS.length) {
    screen = "results";
    event("session_ended", {
      score: resultProfile(session).score,
      untimed: session.untimed,
    });
  }
  render();
  main.focus();
  window.scrollTo(0, 0);
  if (screen === "game")
    say(session.round.title + " " + session.round.instruction);
}
function togglePause(force) {
  if (screen !== "game") return;
  paused = typeof force === "boolean" ? force : !paused;
  session.round.pouring = false;
  pointerId = null;
  document.querySelector(".coffee-arena")?.classList.remove("pouring");
  document.querySelector("#pause").textContent = paused ? "Resume" : "Pause";
  document.body.classList.toggle("is-paused", paused);
  document.querySelector(".pause-overlay")?.remove();
  document.querySelector(".game-frame").inert = paused;
  if (paused) {
    const overlay = document.createElement("div");
    overlay.className = "pause-overlay";
    overlay.innerHTML =
      '<div><span class="eyebrow">AN UNSCHEDULED BREAK</span><h2>Take your time.</h2><p>The office will remain ridiculous.</p><button class="primary" data-action="resume">Back to it →</button></div>';
    main.append(overlay);
    overlay.querySelector("button").focus();
  } else {
    main.focus();
    last = performance.now();
  }
}
function pourRelease() {
  if (screen !== "game" || paused) return;
  const result = stopPour(session.round);
  pointerId = null;
  document.querySelector(".coffee-arena")?.classList.remove("pouring");
  if (result === "short") {
    document.querySelector(".coffee-tip").textContent =
      "A sip? For the whole team? Try a little more.";
    say("Too little. Hold POUR longer.");
  }
  conclude();
}
main.addEventListener("click", async (e) => {
  const b = e.target.closest("button,a");
  if (!b) return;
  const action = b.dataset.action;
  if (action === "start") {
    start();
    return;
  }
  if (action === "resume") {
    togglePause(false);
    return;
  }
  if (action === "share") {
    await share();
    return;
  }
  if (action === "download") {
    await download();
    return;
  }
  if (b.dataset.contact) event("contact_clicked");
  if (screen !== "game" || paused) return;
  if (action === "dismiss-interruption") {
    resumeInterruption(session.round);
    syncInterruption();
    last = performance.now();
    return;
  }
  if (action === "continue") {
    next();
    return;
  }
  if (action === "untimed") {
    session.untimed = !session.untimed;
    b.textContent = session.untimed ? "No timer" : "No-timer mode";
    b.setAttribute("aria-pressed", session.untimed);
    return;
  }
  for (const kind of ["note", "person", "alarm"]) {
    if (b.dataset[kind] !== undefined) {
      const value = Number(b.dataset[kind]),
        result = interact(session.round, value);
      if (result === "hit" || result === "peeled") syncBoard(kind, value, b);
      else if (result === "miss") {
        b.classList.remove("wrong");
        void b.offsetWidth;
        b.classList.add("wrong");
        say("That one is green. Find the red exclamation mark.");
      }
      syncInterruption();
      conclude();
      break;
    }
  }
});
main.addEventListener("pointerdown", (e) => {
  const b = e.target.closest("[data-pour]");
  if (
    !b ||
    paused ||
    reported ||
    session.round.interruption ||
    e.button !== 0 ||
    pointerId !== null
  )
    return;
  e.preventDefault();
  b.focus({ preventScroll: true });
  pointerId = e.pointerId;
  b.setPointerCapture(e.pointerId);
  startPour(session.round);
  document.querySelector(".coffee-arena").classList.add("pouring");
});
main.addEventListener("pointerup", (e) => {
  if (e.pointerId === pointerId) pourRelease();
});
main.addEventListener("pointercancel", (e) => {
  if (e.pointerId === pointerId) {
    session.round.pouring = false;
    pointerId = null;
    document.querySelector(".coffee-arena")?.classList.remove("pouring");
  }
});
main.addEventListener("keydown", (e) => {
  if (e.target.matches("[data-pour]") && [" ", "Enter"].includes(e.key)) {
    e.preventDefault();
    if (!e.repeat && !paused && !reported && !session.round.interruption) {
      startPour(session.round);
      document.querySelector(".coffee-arena").classList.add("pouring");
    }
  }
});
main.addEventListener("keyup", (e) => {
  if (e.target.matches("[data-pour]") && [" ", "Enter"].includes(e.key)) {
    e.preventDefault();
    pourRelease();
  }
});
main.addEventListener("focusout", (e) => {
  if (e.target.matches("[data-pour]") && session.round.pouring) {
    session.round.pouring = false;
    document.querySelector(".coffee-arena")?.classList.remove("pouring");
  }
});
document.querySelector("#pause").onclick = () => togglePause();
document.querySelector("#sound").onclick = (e) => {
  sound = !sound;
  e.currentTarget.textContent = sound ? "Sound on" : "Sound off";
  e.currentTarget.setAttribute("aria-pressed", sound);
  e.currentTarget.setAttribute(
    "aria-label",
    sound ? "Turn sound off" : "Turn sound on",
  );
  tone();
};
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && screen === "game") togglePause();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && screen === "game" && !paused) togglePause(true);
});
function tick(now) {
  const delta = Math.max(0, (now - last) / 1000);
  last = now;
  if (screen === "game" && !paused) {
    const r = session.round;
    if (!reported) {
      advanceTime(r, delta, session.untimed);
      syncInterruption();
      const remaining = Math.max(0, r.seconds - r.elapsed);
      document.querySelector("#timer-fill").style.width =
        `${session.untimed ? 100 : (remaining / r.seconds) * 100}%`;
      document
        .querySelector("#timer-fill")
        .classList.toggle("urgent", remaining < 3 && !session.untimed);
      document.querySelector("#timer-label").textContent = r.interruption
        ? "Clock paused. Take in the nonsense."
        : session.untimed
          ? "Take your time. The nonsense can wait."
          : r.status === "ready"
            ? "Take a look. Timer starts when you act."
            : `${Math.ceil(remaining)} seconds · ${r.type === "coffee" ? "steady hands" : "you’ve got this"}`;
      if (r.type === "coffee") {
        document.querySelector(".coffee-fill").style.height = `${r.fill}%`;
        document
          .querySelector(".coffee-arena")
          .classList.toggle("on-target", r.fill >= r.min && r.fill <= r.max);
        document
          .querySelector(".coffee-arena")
          .classList.toggle("too-full", r.fill > r.max);
      }
      conclude();
    } else if (!session.untimed) {
      feedbackRemaining -= delta;
      if (feedbackRemaining <= 0) next();
    }
  }
  requestAnimationFrame(tick);
}
async function card() {
  const p = resultProfile(session),
    c = document.createElement("canvas");
  c.width = 1200;
  c.height = 1200;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f6f0df";
  ctx.fillRect(0, 0, 1200, 1200);
  ctx.fillStyle = "#203d35";
  ctx.fillRect(0, 0, 1200, 110);
  ctx.fillStyle = "#f6f0df";
  ctx.font = "bold 26px Arial";
  ctx.fillText("EVERYTHING IS FINE. / SURVIVAL REPORT", 70, 69);
  ctx.fillStyle = "#203d35";
  ctx.font = "bold 90px Arial";
  ctx.fillText("You made it to 5:00.", 70, 265);
  ctx.font = "28px Arial";
  ctx.fillText(p.line, 70, 330);
  ctx.font = "bold 200px Arial";
  ctx.fillText(`${p.score}/8`, 70, 600);
  ctx.font = "30px Arial";
  ctx.fillText("minor emergencies handled", 70, 660);
  ctx.fillStyle = "#b75439";
  ctx.font = "bold 23px Arial";
  ctx.fillText("YOUR COMPLETELY UNOFFICIAL TITLE", 70, 790);
  ctx.fillStyle = "#203d35";
  ctx.font = "bold 42px Arial";
  const words = p.title.split(" ");
  let line = "",
    y = 860;
  for (const word of words) {
    if (ctx.measureText(line + word).width > 1060) {
      ctx.fillText(line, 70, y);
      y += 55;
      line = "";
    }
    line += word + " ";
  }
  ctx.fillText(line, 70, y);
  ctx.fillStyle = "#203d35";
  ctx.fillRect(0, 1020, 1200, 180);
  const img = new Image();
  img.src = "assets/tgg-logo.svg";
  await img.decode();
  ctx.drawImage(img, 70, 1060, 150, 74);
  ctx.fillStyle = "#f6f0df";
  ctx.font = "26px Arial";
  ctx.fillText("The game is absurd. The problems are familiar.", 290, 1100);
  ctx.font = "22px Arial";
  ctx.fillText("guntergroup.com", 290, 1140);
  const blob = await new Promise((r) => c.toBlob(r, "image/png"));
  if (!blob) throw Error("Image export failed");
  return blob;
}
async function download() {
  try {
    const blob = await card(),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = "everything-is-fine.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    document.querySelector(".share-status").textContent =
      "Your survival report is ready.";
    event("result_downloaded");
  } catch {
    document.querySelector(".share-status").textContent =
      "Could not create the image. Please try again.";
  }
}
async function share() {
  try {
    const file = new File([await card()], "everything-is-fine.png", {
      type: "image/png",
    });
    if (navigator.canShare?.({ files: [file] }))
      await navigator.share({
        title: "Everything Is Fine.",
        text: "A completely normal day at work.",
        files: [file],
      });
    else {
      await download();
      document.querySelector(".share-status").textContent =
        "Downloaded. Attach the card to a message or post.";
    }
    event("share_initiated");
  } catch (e) {
    document.querySelector(".share-status").textContent =
      e.name === "AbortError"
        ? "Sharing canceled. Your report is still here."
        : "Use Download result card to share the image.";
  }
}
render();
requestAnimationFrame(tick);
event("game_loaded");
