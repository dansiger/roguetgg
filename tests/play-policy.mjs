import { act, canTarget, CELLS, gateOpen, distance, key } from "../src/game.js";
// A simple one-turn greedy player for repeatable smoke tests; not a game AI.
export function chooseAction(s, visits = new Map()) {
  const candidates = [{ id: "wait" }, { id: "align" }, { id: "recover" }];
  for (const id of ["move", "dash", "insight", "change"])
    for (const p of CELLS) if (canTarget(s, id, p)) candidates.push({ id, p });
  let best;
  for (const c of candidates) {
    const next = structuredClone(s);
    if (!act(next, c.id, c.p)) continue;
    let value =
      (next.totalResolved - s.totalResolved) * 35 +
      (next.hp - s.hp) * 16 +
      (next.energy - s.energy) * 2;
    value +=
      (s.foes.reduce((n, f) => n + f.hp, 0) -
        next.foes.reduce((n, f) => n + f.hp, 0)) *
      3;
    if (next.status === "stalled") value -= 1000;
    if (["upgrade", "won"].includes(next.status)) value += 1000;
    const goals = gateOpen(next) ? [next.gate] : next.foes;
    const dist = goals.length
      ? Math.min(...goals.map((f) => distance(next.player, f)))
      : 0;
    value -= dist * 2;
    value -= (visits.get(`${next.stage}:${key(next.player)}`) || 0) * 1.2;
    if (c.id === "align") value -= 3;
    if (c.id === "wait") value -= 2;
    if (!best || value > best.value) best = { ...c, value };
  }
  return best;
}
