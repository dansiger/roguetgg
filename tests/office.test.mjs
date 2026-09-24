import test from "node:test";
import assert from "node:assert/strict";
import {
  resumeInterruption,
  INTERRUPTIONS,
  ROUNDS,
  newSession,
  makeRound,
  advanceTime,
  interact,
  startPour,
  stopPour,
  nextRound,
  resultProfile,
  finish,
} from "../src/office/game.js";
test("eight short rounds contain two of each interaction", () => {
  assert.equal(ROUNDS.length, 8);
  for (const type of ["scope", "align", "coffee", "alarms"])
    assert.equal(ROUNDS.filter((r) => r.type === type).length, 2);
});
test("seeded challenges reproduce labels and directions", () => {
  assert.deepEqual(newSession(5), newSession(5));
  assert.notDeepEqual(makeRound(0, 1).notes, makeRound(0, 7).notes);
});
test("clock does not run while the player reads the instruction", () => {
  const r = makeRound(0, 1);
  advanceTime(r, 100);
  assert.equal(r.status, "ready");
  assert.equal(r.elapsed, 0);
});
test("shredder requires distinct requests; invalid targets do not start timer", () => {
  const r = makeRound(0, 1);
  assert.equal(interact(r, -1), "ignored");
  assert.equal(r.status, "ready");
  interact(r, 0);
  interact(r, 0);
  assert.equal(r.hits, 1);
  for (let i = 1; i < r.goal; i++) interact(r, i);
  assert.equal(r.status, "won");
  assert.equal(interact(r, 0), "ignored");
});
test("leadership starts misaligned and every boss must point right", () => {
  const r = makeRound(1, 1);
  assert.ok(r.directions.every((x) => x !== 0));
  for (let i = 0; i < r.goal; i++) while (r.directions[i] !== 0) interact(r, i);
  assert.equal(r.status, "won");
  assert.equal(r.hits, r.goal);
});
test("wrong dashboard targets do not count; red flags move after a hit", () => {
  const r = makeRound(3, 1),
    old = r.alarm;
  interact(r, (old + 1) % 9);
  assert.equal(r.hits, 0);
  assert.equal(r.misfires, 1);
  interact(r, old);
  assert.notEqual(r.alarm, old);
  assert.equal(r.hits, 1);
  while (r.status === "active") interact(r, r.alarm);
  assert.equal(r.status, "won");
});
test("releasing coffee in target band succeeds; hold alone is not success", () => {
  const r = makeRound(2, 1);
  startPour(r);
  advanceTime(r, 72 / r.rate);
  assert.equal(r.status, "active");
  assert.equal(stopPour(r), "hit");
  assert.equal(r.status, "won");
});
test("a short pour can be retried within the same countdown", () => {
  const r = makeRound(2, 1);
  startPour(r);
  advanceTime(r, 0.5);
  assert.equal(stopPour(r), "short");
  assert.equal(r.fill, 0);
  assert.equal(r.status, "active");
  assert.equal(r.elapsed, 0.5);
  assert.equal(r.attempts, 1);
});
test("overfilling and timing out produce a funny failure, not a blocked session", () => {
  const r = makeRound(2, 1);
  startPour(r);
  advanceTime(r, 3);
  assert.equal(r.status, "lost");
  const q = makeRound(0, 1);
  interact(q, 0);
  advanceTime(q, q.seconds);
  assert.equal(q.status, "lost");
});
test("no-timer mode disables deadlines but preserves coffee timing", () => {
  const r = makeRound(0, 1);
  interact(r, 0);
  advanceTime(r, 100, true);
  assert.equal(r.status, "active");
  assert.equal(r.elapsed, 0);
  const q = makeRound(2, 1);
  startPour(q);
  advanceTime(q, 2, true);
  assert.equal(q.fill, 68);
  assert.equal(q.elapsed, 0);
  assert.equal(stopPour(q), "hit");
});
test("completed rounds cannot be scored twice or advance past final results", () => {
  const s = newSession(1);
  assert.equal(nextRound(s), false);
  for (let i = 0; i < 8; i++) {
    finish(s.round, i % 2 === 0);
    assert.equal(nextRound(s), true);
  }
  assert.equal(s.results.length, 8);
  assert.equal(nextRound(s), false);
  assert.equal(resultProfile(s).score, 4);
});
test("a full perfect session earns a positive result without persistent progress", () => {
  const s = newSession(17);
  for (let i = 0; i < 8; i++) {
    const r = s.round;
    while (["ready", "active"].includes(r.status)) {
      if (r.interruption) resumeInterruption(r);
      if (r.type === "scope")
        interact(
          r,
          r.notes.findIndex((_, n) => !r.removed.includes(n)),
        );
      else if (r.type === "align")
        interact(
          r,
          r.directions.findIndex((d) => d !== 0),
        );
      else if (r.type === "coffee") {
        startPour(r);
        advanceTime(r, (85 - r.fill) / r.rate);
        if (!r.interruption) {
          r.fill = (r.min + r.max) / 2;
          stopPour(r);
        }
      } else interact(r, r.alarm);
    }
    assert.equal(r.status, "won");
    nextRound(s);
  }
  assert.equal(resultProfile(s).title, "Director of Somehow");
  assert.equal(resultProfile(s).score, 8);
});

test("scope waits for the final shred, then resurrects an earlier request once", () => {
  const r = makeRound(4, 9);
  for (let i = 0; i < r.goal - 1; i++) {
    interact(r, i);
    assert.equal(r.interruption, null);
    assert.equal(r.returnedNote, null);
  }
  interact(r, r.goal - 1);
  assert.equal(r.returnedNote, 0);
  assert.equal(r.hits, r.goal - 1);
  assert.equal(r.status, "active");
  assert.ok(r.interruption);
  const snapshot = structuredClone(r);
  assert.equal(interact(r, 0), "ignored");
  advanceTime(r, 100, true);
  assert.deepEqual(r, snapshot);
  resumeInterruption(r);
  interact(r, 0);
  assert.equal(r.interruption, null);
  assert.equal(r.status, "won");
});
test("the final alignment derails an earlier boss, regardless of click order", () => {
  for (let last = 0; last < 4; last++) {
    const r = makeRound(6, last + 9);
    const order = [0, 1, 2, 3].filter((i) => i !== last).concat(last);
    for (const i of order) {
      while (r.directions[i] !== 0) interact(r, i);
      if (i !== last) assert.equal(r.interruption, null);
    }
    assert.equal(r.hits, r.goal - 1);
    assert.equal(r.status, "active");
    assert.ok(r.interruption);
    assert.notEqual(r.distractedPerson, last);
    assert.equal(r.directions[last], 0);
    assert.notEqual(r.directions[r.distractedPerson], 0);
    resumeInterruption(r);
    while (r.status === "active") interact(r, r.distractedPerson);
    assert.equal(r.status, "won");
    assert.equal(r.interruption, null);
  }
});
test("coffee growth freezes both liquids and clock, then allows a generous refill", () => {
  const r = makeRound(5, 9);
  startPour(r);
  advanceTime(r, 63 / r.rate);
  assert.equal(r.interruption, null);
  assert.equal(r.tall, false);
  assert.equal(r.fill, 63);
  // Even a delayed frame must stop just below the original 68% target.
  advanceTime(r, 10);
  assert.ok(r.interruption);
  assert.equal(r.fill, 64 * 0.8);
  assert.equal(r.pouring, false);
  assert.equal(r.tall, true);
  assert.equal(r.max - r.min, 22);
  const elapsed = r.elapsed;
  startPour(r);
  assert.equal(r.pouring, false);
  assert.equal(stopPour(r), "ignored");
  advanceTime(r, 4);
  assert.equal(r.elapsed, elapsed);
  assert.equal(r.fill, 64 * 0.8);
  advanceTime(r, 1);
  assert.equal(r.interruption, null);
  assert.equal(r.elapsed, elapsed);
  startPour(r);
  advanceTime(r, (85 - r.fill) / r.rate);
  assert.equal(stopPour(r), "hit");
});
test("CYA sticker needs peeling and then a separate red-flag action", () => {
  const r = makeRound(7, 19);
  for (let i = 0; i < r.goal - 2; i++) {
    interact(r, r.alarm);
    assert.equal(r.interruption, null);
    assert.equal(r.covered, false);
  }
  interact(r, r.alarm);
  assert.ok(r.covered);
  resumeInterruption(r);
  const alarm = r.alarm;
  assert.equal(interact(r, alarm), "peeled");
  assert.equal(r.alarm, alarm);
  assert.equal(r.hits, r.goal - 1);
  assert.equal(r.covered, false);
  interact(r, alarm);
  assert.equal(r.hits, r.goal);
  assert.equal(r.status, "won");
  assert.equal(r.interruption, null);
});
test("jokes vary across sessions and the opening four rounds have no twists", () => {
  for (const index of [4, 5, 6, 7]) {
    const jokes = new Set(
      Array.from({ length: 40 }, (_, seed) => makeRound(index, seed).joke),
    );
    assert.ok(jokes.size > 1);
    assert.ok(
      [...jokes].every((j) => INTERRUPTIONS[ROUNDS[index].type].includes(j)),
    );
  }
  for (let i = 0; i < 4; i++) {
    const r = makeRound(i, 1);
    if (r.type === "coffee") {
      startPour(r);
      advanceTime(r, 2);
    } else if (r.type === "align") {
      for (let n = 0; n < 2; n++) while (r.directions[n] !== 0) interact(r, n);
    } else {
      interact(r, r.type === "alarms" ? r.alarm : 0);
      interact(r, r.type === "alarms" ? r.alarm : 1);
    }
    assert.equal(r.interruption, null);
    assert.equal(r.twistDone, false);
  }
});
