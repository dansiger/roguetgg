import test from "node:test";
import assert from "node:assert/strict";
import {
  newRun,
  act,
  planIntents,
  promote,
  upgradeChoices,
  gateOpen,
  distance,
  neighbors,
  CELLS,
  canTarget,
  key,
  setupStage,
} from "../src/game.js";
import { STAGES, THREATS } from "../src/content.js";
function clean() {
  const s = newRun(42);
  s.stage = 5;
  s.foes = [];
  s.player = { q: 0, r: 0 };
  return s;
}
function foe(s, type, q, r, hp = THREATS[type].hp) {
  s.foes.push({ id: s.nextId++, type, q, r, hp, paused: 0, returned: false });
  planIntents(s);
  return s.foes.at(-1);
}
test("hex map has 37 unique cells and symmetric neighbor distances", () => {
  assert.equal(CELLS.length, 37);
  assert.equal(new Set(CELLS.map(key)).size, 37);
  for (const c of CELLS)
    for (const n of neighbors(c)) {
      assert.equal(distance(c, n), 1);
      assert.ok(neighbors(n).some((p) => key(p) === key(c)));
    }
});
test("seeded encounters are repeatable, unique and leave a safe start", () => {
  for (let seed = 0; seed < 100; seed++) {
    const a = newRun(seed),
      b = newRun(seed);
    assert.deepEqual(a.foes, b.foes);
    for (let i = 0; i < 6; i++) {
      a.stage = i;
      setupStage(a);
      assert.equal(new Set(a.foes.map(key)).size, a.foes.length);
      assert.ok(
        a.foes.every(
          (f) =>
            (i === 0 || distance(f, a.player) > 2) && key(f) !== key(a.gate),
        ),
      );
    }
  }
});
test("invalid actions never advance time or consume influence", () => {
  const s = clean(),
    before = structuredClone(s);
  assert.equal(act(s, "insight", { q: 1, r: 0 }), false);
  assert.equal(s.turn, before.turn);
  assert.equal(s.energy, before.energy);
  assert.equal(act(s, "bogus"), false);
  assert.equal(act(s, "move", { q: 20, r: 0 }), false);
});
test("telegraphed attacks target original cells, not the moving player", () => {
  const s = clean();
  foe(s, "silo", 2, 0);
  assert.equal(s.foes[0].intent.kind, "attack");
  act(s, "move", { q: 0, r: 1 });
  assert.equal(s.hp, 10);
});
test("overlapping attacks stack, capacity floors at zero, and end state locks", () => {
  const s = clean();
  foe(s, "silo", 2, 0);
  foe(s, "imp", 0, 2);
  s.hp = 1;
  act(s, "wait");
  assert.equal(s.hp, 0);
  assert.equal(s.status, "stalled");
  assert.equal(act(s, "wait"), false);
});
test("resolving creates an artifact and collecting it restores influence", () => {
  const s = clean();
  s.energy = 0;
  foe(s, "scope", 1, 0);
  act(s, "move", { q: 1, r: 0 });
  assert.equal(s.resolved, 1);
  assert.equal(s.energy, 1);
  assert.equal(s.artifacts.length, 1);
  act(s, "move", { q: 1, r: 0 });
  assert.equal(s.energy, 2);
  assert.equal(s.artifacts.length, 0);
});
test("facilitation suppresses two enemy responses including casting turn", () => {
  const s = clean();
  foe(s, "hydra", 1, 0);
  act(s, "align");
  assert.equal(s.hp, 10);
  act(s, "wait");
  assert.equal(s.hp, 10);
  act(s, "wait");
  assert.equal(s.hp, 9);
});
test("adoption wraith returns once but change leadership prevents return", () => {
  const s = clean();
  foe(s, "wraith", 1, 0, 1);
  act(s, "move", { q: 1, r: 0 });
  assert.equal(s.resolved, 0);
  assert.equal(s.foes[0].hp, 1);
  act(s, "move", { q: 1, r: 0 });
  assert.equal(s.resolved, 1);
  const b = clean();
  foe(b, "wraith", 1, 0);
  act(b, "change", { q: 1, r: 0 });
  assert.equal(b.resolved, 1);
  assert.equal(b.foes.length, 0);
});
test("scope creeps reproduce without overlap or spawning on Kit or gate", () => {
  const s = clean();
  foe(s, "scope", 2, 0);
  s.turn = 3;
  act(s, "wait");
  assert.equal(s.foes.length, 2);
  assert.equal(new Set(s.foes.map(key)).size, 2);
  assert.ok(
    s.foes.every((f) => key(f) !== key(s.player) && key(f) !== key(s.gate)),
  );
});
test("locked gate is traversable but cannot advance campaign", () => {
  const s = clean();
  s.player = { q: 2, r: -2 };
  act(s, "move", s.gate);
  assert.equal(s.status, "playing");
  assert.equal(gateOpen(s), false);
});
test("open gate ends stage before enemy attacks; upgrades persist and restore", () => {
  const s = clean();
  s.player = { q: 2, r: -2 };
  s.stage = 0;
  s.resolved = 2;
  s.hp = 4;
  s.energy = 0;
  foe(s, "gap", 0, 0);
  act(s, "move", s.gate);
  assert.equal(s.status, "upgrade");
  assert.equal(s.hp, 4);
  assert.equal(promote(s, "invalid"), false);
  const choice = upgradeChoices(s)[0];
  assert.equal(promote(s, choice.id), true);
  assert.equal(s.stage, 1);
  assert.ok(s.hp >= 7);
  assert.equal(s.energy, s.maxEnergy);
  assert.deepEqual(s.upgrades, [choice.id]);
});
test("final gate requires resolving the Value Realization Gap", () => {
  const s = clean();
  s.stage = 5;
  s.resolved = 10;
  assert.equal(gateOpen(s), false);
  s.bossResolved = true;
  assert.equal(gateOpen(s), true);
  s.player = { q: 2, r: -2 };
  act(s, "move", s.gate);
  assert.equal(s.status, "won");
});
test("recovery is capped and once per stage; full capacity cannot waste a turn", () => {
  const s = clean();
  assert.equal(act(s, "recover"), false);
  s.hp = 9;
  act(s, "recover");
  assert.equal(s.hp, 10);
  s.hp = 5;
  assert.equal(act(s, "recover"), false);
  assert.equal(s.hp, 5);
});
test("moving never enters an occupied hex, even on planned movement collisions", () => {
  const s = clean();
  foe(s, "scope", 2, -1);
  foe(s, "scope", 1, 1);
  for (let i = 0; i < 8 && s.status === "playing"; i++) {
    act(s, "wait");
    assert.equal(new Set(s.foes.map(key)).size, s.foes.length);
    assert.ok(s.foes.every((f) => key(f) !== key(s.player)));
  }
});
test("all stages can complete and reach the win flow", () => {
  const s = newRun(17);
  for (let i = 0; i < 6; i++) {
    assert.equal(s.stage, i);
    s.resolved = STAGES[i].quota;
    s.bossResolved = i === 5;
    s.player = { q: s.gate.q - 1, r: s.gate.r };
    s.foes = [];
    act(s, "move", s.gate);
    if (i < 5) {
      assert.equal(s.status, "upgrade");
      promote(s, upgradeChoices(s)[0].id);
    } else assert.equal(s.status, "won");
  }
});
test("capabilities enforce distance and influence", () => {
  const s = clean();
  foe(s, "silo", 3, 0);
  assert.equal(canTarget(s, "move", { q: 3, r: 0 }), false);
  assert.equal(canTarget(s, "insight", { q: 3, r: 0 }), true);
  s.energy = 0;
  assert.equal(canTarget(s, "insight", { q: 3, r: 0 }), false);
  assert.equal(canTarget(s, "dash", { q: 1, r: 0 }), false);
});

test("opening is fixed across seeds; first risk wakes the second and dodge is recognized", () => {
  const s = newRun(1),
    other = newRun(99);
  assert.deepEqual(s.foes, other.foes);
  assert.equal(s.foes.find((f) => f.type === "imp").intent.kind, "hold");
  act(s, "move", { q: -2, r: 2 });
  assert.equal(s.lesson.moved, true);
  act(s, "move", { q: -2, r: 1 });
  assert.equal(s.resolved, 1);
  assert.equal(s.foes[0].intent.kind, "attack");
  act(s, "move", { q: -1, r: 2 });
  assert.equal(s.lesson.dodged, true);
  assert.equal(s.hp, 10);
});
test("tools are locked in the engine until the corresponding promotion", () => {
  const s = newRun(1);
  for (const id of ["align", "dash", "insight", "change", "recover"])
    assert.equal(act(s, id, { q: -2, r: 2 }), false);
  assert.equal(s.turn, 0);
  assert.equal(s.energy, 4);
  s.status = "upgrade";
  assert.deepEqual(
    upgradeChoices(s).map((u) => u.id),
    ["first-tool"],
  );
  promote(s, "first-tool");
  assert.equal(s.stage, 1);
  assert.equal(act(s, "align"), true);
  assert.equal(canTarget(s, "dash", { q: -2, r: 2 }), false);
});
test("opening Scope Creep does not multiply while a beginner experiments", () => {
  const s = newRun(1);
  for (let i = 0; i < 4; i++) act(s, "wait");
  assert.equal(s.foes.filter((f) => f.type === "scope").length, 1);
});
