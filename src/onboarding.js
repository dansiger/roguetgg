import { distance, dangerAt, gateOpen } from "./game.js";
// Guidance follows accomplishments, never elapsed turns or a blocking modal.
export function lessonHint(s) {
  if (s.stage !== 0 || s.status !== "playing") return null;
  if (gateOpen(s))
    return {
      id: "gate",
      title: "Two risks. One clear path.",
      text: "A decision was made. Reach the glowing gate before someone reopens it.",
      target: s.gate,
    };
  if (!s.lesson.moved)
    return {
      id: "move",
      title: "Meet Kit. Your move.",
      text: "Tap an outlined neighboring hex to move. Nothing happens until you act.",
      target: s.player,
    };
  if (s.resolved === 0) {
    const scope = s.foes.find((f) => f.type === "scope");
    return {
      id: "resolve",
      title: "“Just one small enhancement.”",
      text:
        distance(s.player, scope) === 1
          ? "Tap the Scope Creep beside you to turn it into a controlled backlog."
          : "Move next to the Scope Creep. Then tap it to bring scope under control.",
      target: scope,
    };
  }
  if (!s.lesson.dodged && dangerAt(s, s.player) > 0)
    return {
      id: "dodge",
      title: "One risk resolved. Nicely done.",
      text: "The striped hex gets hit after your next action. Step onto a clear neighboring hex.",
      target: s.player,
    };
  return {
    id: "finish",
    title: s.lesson.dodged
      ? "Good read. Your turn."
      : "One more risk. You’ve got this.",
    text: "Move beside the remaining risk and tap it to resolve it. Keep clear of the stripes.",
    target: s.foes[0],
  };
}
