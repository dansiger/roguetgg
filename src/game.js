import { STAGES, THREATS, ABILITIES, UPGRADES } from "./content.js";
export const DIRECTIONS = [
  [1, 0],
  [1, -1],
  [0, -1],
  [-1, 0],
  [-1, 1],
  [0, 1],
];
export const key = (p) => `${p.q},${p.r}`;
export const distance = (a, b) =>
  (Math.abs(a.q - b.q) +
    Math.abs(a.r - b.r) +
    Math.abs(a.q + a.r - b.q - b.r)) /
  2;
export const CELLS = [];
for (let r = -3; r <= 3; r++)
  for (let q = -3; q <= 3; q++) if (Math.abs(q + r) <= 3) CELLS.push({ q, r });
export const inside = (p) => CELLS.some((c) => key(c) === key(p));
export const neighbors = (p) =>
  DIRECTIONS.map(([q, r]) => ({ q: p.q + q, r: p.r + r })).filter(inside);
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function newRun(seed = Date.now()) {
  const s = {
    seed: seed >>> 0,
    stage: 0,
    turn: 0,
    totalTurns: 0,
    hp: 10,
    maxHp: 10,
    energy: 4,
    maxEnergy: 4,
    power: 1,
    range: 3,
    insight: 2,
    stride: 2,
    alignCost: 2,
    restBonus: 0,
    harvest: false,
    resolved: 0,
    totalResolved: 0,
    artifacts: [],
    foes: [],
    upgrades: [],
    uses: {},
    history: [],
    nextId: 0,
    status: "playing",
    startedAt: Date.now(),
    bossResolved: false,
  };
  setupStage(s);
  return s;
}
export function setupStage(s) {
  s.player = { q: -3, r: 2 };
  s.gate = { q: 3, r: -2 };
  s.turn = 0;
  s.resolved = 0;
  s.artifacts = [];
  s.recovered = false;
  const rng = random(s.seed + s.stage * 7919);
  const pool = CELLS.filter(
    (c) => distance(c, s.player) > 2 && distance(c, s.gate) > 0,
  );
  // Seeded Fisher–Yates: stable across engines and repeatable for debugging.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  s.foes = STAGES[s.stage].types.map((type, i) => ({
    id: s.nextId++,
    type,
    ...pool[i],
    hp: THREATS[type].hp,
    paused: 0,
    returned: false,
  }));
  s.status = "playing";
  s.message = STAGES[s.stage].quote;
  s.history = [s.message];
  planIntents(s);
}
export function gateOpen(s) {
  return (
    s.resolved >= STAGES[s.stage].quota && (s.stage !== 5 || s.bossResolved)
  );
}
export function cost(s, id) {
  return id === "align"
    ? s.alignCost
    : ABILITIES.find((a) => a.id === id)?.cost || 0;
}
export function planIntents(s) {
  for (const f of s.foes) {
    const d = distance(f, s.player);
    if (f.paused > 0) {
      f.intent = { kind: "paused", cells: [] };
      continue;
    }
    if (f.type === "gap") {
      f.intent = {
        kind: "attack",
        cells: [{ ...s.player }, ...neighbors(s.player)],
      };
      continue;
    }
    if ((f.type === "silo" || f.type === "imp") && d <= 2) {
      f.intent = { kind: "attack", cells: [{ ...s.player }] };
      continue;
    }
    if (d <= 1 || (f.type === "mimic" && d <= 2)) {
      f.intent = { kind: "attack", cells: neighbors(f) };
      continue;
    }
    if (f.type === "silo" || f.type === "mimic") {
      f.intent = { kind: "hold", cells: [] };
      continue;
    }
    const choices = neighbors(f).filter(
      (c) =>
        key(c) !== key(s.gate) &&
        key(c) !== key(s.player) &&
        !s.foes.some((e) => e.id !== f.id && key(e) === key(c)),
    );
    choices.sort((a, b) => distance(a, s.player) - distance(b, s.player));
    const target = choices[0];
    f.intent = target
      ? { kind: "move", cells: [target] }
      : { kind: "hold", cells: [] };
  }
}
export function dangerAt(s, p) {
  return s.foes.filter(
    (f) =>
      f.intent?.kind === "attack" &&
      f.intent.cells.some((c) => key(c) === key(p)),
  ).length;
}
function log(s, text) {
  s.message = text;
  s.history.unshift(text);
  s.history = s.history.slice(0, 8);
}
function hit(s, f, amount, permanent = false) {
  f.hp -= amount;
  if (f.hp > 0) {
    log(
      s,
      `${THREATS[f.type].name}: ${f.hp} point${f.hp === 1 ? "" : "s"} left to resolve.`,
    );
    return;
  }
  if (f.type === "wraith" && !f.returned && !permanent) {
    f.hp = 1;
    f.returned = true;
    f.paused = 1;
    log(s, "The Adoption Wraith returns once. Attendance was not adoption.");
    return;
  }
  s.foes = s.foes.filter((e) => e.id !== f.id);
  s.resolved++;
  s.totalResolved++;
  s.energy = Math.min(s.maxEnergy, s.energy + 1);
  s.artifacts.push({ q: f.q, r: f.r, name: THREATS[f.type].artifact });
  if (f.type === "gap") s.bossResolved = true;
  log(
    s,
    `${THREATS[f.type].name} → ${THREATS[f.type].artifact}. +1 influence.`,
  );
}
export function canTarget(s, id, p) {
  if (s.status !== "playing" || !inside(p) || s.energy < cost(s, id))
    return false;
  const d = distance(s.player, p),
    f = s.foes.find((e) => key(e) === key(p));
  if (id === "move") return d === 1;
  if (id === "dash") return d > 0 && d <= s.stride && !f;
  if (id === "insight") return !!f && d <= s.range;
  if (id === "change") return !!f && d === 1;
  return false;
}
export function act(s, id, target) {
  if (s.status !== "playing") return false;
  if (!["wait", ...ABILITIES.map((a) => a.id)].includes(id)) return false;
  const fee = cost(s, id);
  if (s.energy < fee) {
    log(
      s,
      "Not enough influence. Resolve a risk, collect an artifact, or wait to regain 1.",
    );
    return false;
  }
  if (
    ["move", "dash", "insight", "change"].includes(id) &&
    (!target || !canTarget(s, id, target))
  ) {
    log(s, "Choose a highlighted hex in range.");
    return false;
  }
  if (id === "recover" && s.recovered) {
    log(s, "Recovery plan has already been used this stage.");
    return false;
  }
  if (id === "recover" && s.hp === s.maxHp) {
    log(s, "Leadership capacity is already full.");
    return false;
  }
  s.energy -= fee;
  s.uses[id] = (s.uses[id] || 0) + 1;
  const foe = target && s.foes.find((f) => key(f) === key(target));
  if (id === "move" && foe) hit(s, foe, s.power);
  else if (id === "move" || id === "dash") {
    s.player = { ...target };
    log(
      s,
      id === "dash"
        ? "A clear delivery plan creates room to move."
        : "Kit repositions. The meeting follows.",
    );
    const artifact = s.artifacts.find((a) => key(a) === key(target));
    if (artifact) {
      s.artifacts = s.artifacts.filter((a) => a !== artifact);
      s.energy = Math.min(s.maxEnergy, s.energy + 1);
      if (s.harvest) s.hp = Math.min(s.maxHp, s.hp + 1);
      log(
        s,
        `Collected ${artifact.name}. +1 influence${s.harvest ? ", +1 capacity" : ""}.`,
      );
    }
  } else if (id === "insight") hit(s, foe, s.insight);
  else if (id === "change") hit(s, foe, foe.type === "gap" ? 2 : foe.hp, true);
  else if (id === "align") {
    for (const f of s.foes) if (distance(f, s.player) <= 2) f.paused = 2;
    log(s, "Shared decisions create breathing room. Nearby risks are paused.");
  } else if (id === "recover") {
    s.hp = Math.min(s.maxHp, s.hp + 3);
    s.recovered = true;
    log(s, "Recovery plan restores 3 leadership capacity.");
  } else if (id === "wait") {
    s.energy = Math.min(s.maxEnergy, s.energy + 1);
    log(s, "Regained 1 influence. Risks take their turn.");
  }
  s.turn++;
  s.totalTurns++;
  // Reaching an open gate ends the stage before risks act.
  if (key(s.player) === key(s.gate) && gateOpen(s)) {
    s.status = s.stage === 5 ? "won" : "upgrade";
    log(
      s,
      s.status === "won"
        ? "Value realized. The work keeps working."
        : "Decision Gate cleared. Your next chapter awaits.",
    );
    return true;
  }
  let damage = 0;
  for (const f of [...s.foes]) {
    if (f.paused > 0) {
      f.paused--;
      continue;
    }
    const intent = f.intent;
    if (
      intent.kind === "attack" &&
      intent.cells.some((c) => key(c) === key(s.player))
    )
      damage++;
    else if (intent.kind === "move") {
      const p = intent.cells[0];
      if (
        key(p) !== key(s.player) &&
        !s.foes.some((e) => e.id !== f.id && key(e) === key(p))
      )
        Object.assign(f, p);
    }
    if (f.type === "scope" && s.turn % 4 === 0 && s.foes.length < 8) {
      const p = neighbors(f).find(
        (c) =>
          key(c) !== key(s.player) &&
          key(c) !== key(s.gate) &&
          !s.foes.some((e) => key(e) === key(c)),
      );
      if (p)
        s.foes.push({
          id: s.nextId++,
          type: "scope",
          ...p,
          hp: 1,
          paused: 0,
          returned: false,
        });
    }
  }
  s.hp = Math.max(0, s.hp - damage);
  if (damage)
    log(
      s,
      `${damage} risk${damage === 1 ? "" : "s"} disrupted the initiative. −${damage} capacity.`,
    );
  if (s.hp === 0) {
    s.status = "stalled";
    log(s, "The initiative pauses. Your progress still matters.");
  }
  planIntents(s);
  return true;
}
export function upgradeChoices(s) {
  const rng = random(s.seed + s.stage * 31 + 101);
  const available = UPGRADES.filter(
    (u) =>
      (u.id !== "harvest" || !s.harvest) &&
      (u.id !== "power" || s.power < 3) &&
      (u.id !== "economy" || s.alignCost > 1),
  );
  for (let i = available.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [available[i], available[j]] = [available[j], available[i]];
  }
  return available.slice(0, 3);
}
export function promote(s, id) {
  if (s.status !== "upgrade" || !upgradeChoices(s).some((u) => u.id === id))
    return false;
  if (id === "capacity") {
    s.maxHp += 2;
    s.hp += 2;
  }
  if (id === "influence") s.maxEnergy++;
  if (id === "power") s.power = Math.min(3, s.power + 1);
  if (id === "range") {
    s.range++;
    s.insight++;
  }
  if (id === "economy") s.alignCost = Math.max(1, s.alignCost - 1);
  if (id === "recovery") s.restBonus += 2;
  if (id === "stride") s.stride++;
  if (id === "harvest") s.harvest = true;
  s.upgrades.push(id);
  s.hp = Math.min(s.maxHp, s.hp + 3 + s.restBonus);
  s.energy = s.maxEnergy;
  s.stage++;
  setupStage(s);
  return true;
}
export function profile(s) {
  const ranked = Object.entries(s.uses)
    .filter(([id]) => !["move", "wait", "recover"].includes(id))
    .sort((a, b) => b[1] - a[1]);
  const signature =
    ABILITIES.find((a) => a.id === ranked[0]?.[0])?.name ||
    "Practical leadership";
  return {
    title:
      s.status === "won"
        ? "The Transformation Architect"
        : s.stage >= 3
          ? "The Resilient Operator"
          : "The Momentum Maker",
    signature,
    rank: STAGES[s.stage].rank,
  };
}
