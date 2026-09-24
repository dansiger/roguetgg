const REQUESTS = [
  "Add AI?",
  "Quick rebrand",
  "Also, an app",
  "One tiny pivot",
  "Make it viral",
  "CEO’s nephew",
  "Blockchain?",
  "Just a chatbot",
  "Launch Friday",
  "New logo?",
];
const INTERRUPTIONS = {
  scope: [
    "The CEO’s spouse really likes the color fuchsia.",
    "Sales already promised it. In writing. With a smiley face.",
    "The person who requested this has just returned from vacation.",
    "It was rejected, but then someone put it in a nicer slide deck.",
  ],
  coffee: [
    "Senior leadership is having an all-day operational planning meeting.",
    "The strategy offsite has been moved onsite. All day. Outside your desk.",
    "Today’s planning meeting includes a pre-meeting and a post-meeting.",
  ],
  align: [
    "Gary has pictures of the brisket. All 46 of them.",
    "Brenda’s kitchen renovation has entered discovery.",
    "Someone asked how the boat project is going.",
    "Quick tangent: has anyone tried beekeeping?",
    "The weekend story now requires a map and three supporting characters.",
  ],
  alarms: [
    "The project owner covered this up. ‘This version goes to the board.’",
    "The sponsor applied a green sticker. ‘We agreed to focus on the positives.’",
    "The report author hid the warning. ‘My performance review is tomorrow.’",
    "The project lead covered the red. ‘Technically, no one asked about that.’",
  ],
};
const ROUNDS = [
  {
    type: "scope",
    title: "SHRED THE EXTRAS.",
    instruction: "Tap the surprise requests. Feed the shredder.",
    context: "09:01 · The scope was signed off at 09:00.",
    seconds: 10,
    goal: 4,
    win: "Scope controlled. Please do not tell Sales.",
    lose: "The small enhancement is now a subsidiary.",
  },
  {
    type: "align",
    title: "POINT THEM RIGHT.",
    instruction: "Tap each boss to turn their arrow toward the exit →",
    context: "09:14 · Everyone fully supports a different direction.",
    seconds: 11,
    goal: 3,
    win: "Alignment achieved. Nobody remembers agreeing.",
    lose: "The committee has formed a smaller committee.",
  },
  {
    type: "coffee",
    title: "FILL. DON’T SPILL.",
    instruction: "Hold POUR. Release inside the striped band.",
    context: "10:32 · The entire wellness budget has arrived.",
    seconds: 10,
    goal: 1,
    min: 64,
    max: 84,
    rate: 34,
    win: "Wellness delivered. Benefits enrollment is now closed.",
    lose: "The wellness program has breached containment.",
  },
  {
    type: "alarms",
    title: "HIT THE RED FLAGS.",
    instruction: "Tap each red alarm. Yes, the dashboard says it’s fine.",
    context: "11:59 · Our dashboard has never reported a problem.",
    seconds: 10,
    goal: 3,
    win: "Three risks found. The dashboard would like a word.",
    lose: "All remaining risks have been renamed “opportunities.”",
  },
  {
    type: "scope",
    title: "THEY SENT MORE.",
    instruction: "Tap every new request before the scope escapes.",
    context: "13:02 · Someone replied all.",
    seconds: 9,
    goal: 7,
    win: "Inbox zero. For a deeply suspicious moment.",
    lose: "Your project now includes a podcast network.",
  },
  {
    type: "coffee",
    title: "ONE MORE CUP.",
    instruction: "Hold POUR. Release inside the striped band.",
    context: "14:17 · Your coffee has been invited to a meeting.",
    seconds: 9,
    goal: 1,
    min: 68,
    max: 84,
    rate: 43,
    win: "You are now the organization’s single point of caffeine.",
    lose: "An incident report has been filed against the mug.",
  },
  {
    type: "align",
    title: "ALIGN. AGAIN.",
    instruction: "Turn every arrow toward the exit →",
    context: "15:46 · Leadership has revisited the alignment.",
    seconds: 10,
    goal: 4,
    win: "A shared direction. Quick, leave before it changes.",
    lose: "The exit has been referred to the strategy committee.",
  },
  {
    type: "alarms",
    title: "STILL “ALL GREEN.”",
    instruction: "Find every red alarm. Someone keeps moving the problem.",
    context: "16:59 · Good news: the report has been “improved.”",
    seconds: 9,
    goal: 5,
    win: "Reality acknowledged. A bold strategic departure.",
    lose: "Reality has been removed from the executive summary.",
  },
];
function rng(seed) {
  let n = seed >>> 0;
  return () => {
    n = (Math.imul(n, 1664525) + 1013904223) >>> 0;
    return n / 4294967296;
  };
}
function newSession(seed = Date.now()) {
  return {
    seed: seed >>> 0,
    index: 0,
    results: [],
    untimed: false,
    round: makeRound(0, seed),
  };
}
function makeRound(index, seed) {
  const config = ROUNDS[index],
    random = rng(seed + index * 809),
    labels = [...REQUESTS];
  for (let i = labels.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  return {
    ...config,
    index,
    status: "ready",
    elapsed: 0,
    hits: 0,
    misfires: 0,
    fill: 0,
    pouring: false,
    attempts: 0,
    notes: labels.slice(0, config.goal),
    removed: [],
    directions: Array.from(
      { length: config.goal },
      () => 1 + Math.floor(random() * 3),
    ),
    alarm: Math.floor(random() * 9),
    sequence: 0,
    twistDone: false,
    interruption: null,
    joke:
      config &&
      INTERRUPTIONS[config.type][
        Math.floor(random() * INTERRUPTIONS[config.type].length)
      ],
    twistChoice: random(),
    returnedNote: null,
    covered: false,
    tall: false,
  };
}
function interrupt(r, title, instruction) {
  r.twistDone = true;
  r.pouring = false;
  r.interruption = { title, message: r.joke, instruction, remaining: 4.5 };
}
function resumeInterruption(r) {
  r.interruption = null;
}
function applyTwist(r) {
  if (r.index < 4 || r.twistDone) return;
  if (r.type === "scope" && r.hits === 2) {
    r.returnedNote = r.removed.shift();
    r.hits--;
    interrupt(
      r,
      "LEADERSHIP PRIORITY",
      "It’s back. Shred the returned request, too.",
    );
  } else if (r.type === "align" && r.hits === 2) {
    const aligned = r.directions
      .map((d, i) => (d === 0 ? i : -1))
      .filter((i) => i >= 0);
    r.distractedPerson = aligned[Math.floor(r.twistChoice * aligned.length)];
    r.directions[r.distractedPerson] = 1 + Math.floor(r.twistChoice * 3);
    r.hits--;
    interrupt(
      r,
      "MEETING OFF THE RAILS",
      "Turn the distracted boss back toward the exit →",
    );
  } else if (r.type === "alarms" && r.hits === 1) {
    r.covered = true;
    interrupt(
      r,
      "REPORTING HAS BEEN IMPROVED",
      "Peel off the ON TRACK sticker. Then tap the red flag underneath.",
    );
  } else if (r.type === "coffee" && r.fill >= 35) {
    r.tall = true;
    r.fill *= 0.8;
    r.min = 74;
    r.max = 96;
    r.rate = 30;
    r.seconds += 2;
    interrupt(
      r,
      "A LARGER WELLNESS BUDGET",
      "Bigger cup. More coffee. Hold POUR again, then release in the new band.",
    );
  }
}
function begin(r) {
  if (r.status === "ready") r.status = "active";
}
function finish(r, success) {
  if (["won", "lost"].includes(r.status)) return false;
  r.status = success ? "won" : "lost";
  r.pouring = false;
  return true;
}
function advanceTime(r, seconds, untimed = false) {
  if (r.status !== "active" || !Number.isFinite(seconds) || seconds <= 0)
    return;
  if (r.interruption) {
    if (!untimed) {
      r.interruption.remaining -= seconds;
      if (r.interruption.remaining <= 0) resumeInterruption(r);
    }
    return;
  }
  // Stop exactly at the coffee interruption, even after a delayed animation frame.
  if (r.type === "coffee" && r.index >= 4 && !r.twistDone && r.pouring)
    seconds = Math.min(seconds, Math.max(0, (35 - r.fill) / r.rate));
  if (!untimed) r.elapsed += seconds;
  if (r.type === "coffee" && r.pouring) {
    r.fill = Math.min(105, r.fill + r.rate * seconds);
    applyTwist(r);
    if (r.fill >= 100) finish(r, false);
  }
  if (!untimed && r.elapsed >= r.seconds) finish(r, false);
}
function interact(r, value) {
  if (r.interruption || !["ready", "active"].includes(r.status))
    return "ignored";
  if (r.type === "scope") {
    if (
      !Number.isInteger(value) ||
      value < 0 ||
      value >= r.notes.length ||
      r.removed.includes(value)
    )
      return "ignored";
    begin(r);
    r.removed.push(value);
    r.hits++;
  } else if (r.type === "align") {
    if (!Number.isInteger(value) || value < 0 || value >= r.directions.length)
      return "ignored";
    begin(r);
    r.directions[value] = (r.directions[value] + 1) % 4;
    r.hits = r.directions.filter((x) => x === 0).length;
  } else if (r.type === "alarms") {
    if (!Number.isInteger(value) || value < 0 || value > 8) return "ignored";
    begin(r);
    if (value !== r.alarm) {
      r.misfires++;
      return "miss";
    }
    if (r.covered) {
      r.covered = false;
      return "peeled";
    }
    r.hits++;
    r.sequence++;
    r.alarm = (r.alarm + 1 + ((r.sequence * 3) % 8)) % 9;
  } else return "ignored";
  applyTwist(r);
  if (r.hits >= r.goal) finish(r, true);
  return "hit";
}
function startPour(r) {
  if (
    r.interruption ||
    r.type !== "coffee" ||
    !["ready", "active"].includes(r.status)
  )
    return;
  begin(r);
  r.pouring = true;
}
function stopPour(r) {
  if (r.type !== "coffee" || r.status !== "active" || !r.pouring)
    return "ignored";
  r.pouring = false;
  if (r.fill >= r.min && r.fill <= r.max) {
    r.hits = 1;
    finish(r, true);
    return "hit";
  }
  if (r.fill > r.max) {
    finish(r, false);
    return "spill";
  }
  r.fill = 0;
  r.attempts++;
  return "short";
}
function nextRound(s) {
  if (!["won", "lost"].includes(s.round.status) || s.index >= ROUNDS.length)
    return false;
  s.results.push({
    type: s.round.type,
    won: s.round.status === "won",
    seconds: Math.round(s.round.elapsed * 10) / 10,
  });
  s.index++;
  if (s.index < ROUNDS.length) s.round = makeRound(s.index, s.seed);
  return true;
}
function resultProfile(s) {
  const score = s.results.filter((r) => r.won).length;
  return {
    score,
    title:
      score >= 7
        ? "Director of Somehow"
        : score >= 4
          ? "Chief Getting-Through-It Officer"
          : "Senior Vice President of Tomorrow",
    line:
      score >= 7
        ? "You prevented a surprising amount of business."
        : score >= 4
          ? "Things happened. You happened back."
          : "You correctly identified that this could have been an email.",
  };
}

export {
  INTERRUPTIONS,
  resumeInterruption,
  ROUNDS,
  REQUESTS,
  rng,
  newSession,
  makeRound,
  begin,
  finish,
  advanceTime,
  interact,
  startPour,
  stopPour,
  nextRound,
  resultProfile,
};
