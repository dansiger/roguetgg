// Original procedural office soundtrack: swung mallets, plucked bass and desk percussion.
// No downloads or third-party recordings. The context opens only from a user gesture.
export function createOfficeAudio() {
  let ctx, master, musicBus, effectsBus, noiseBuffer, pouring;
  let enabled = true,
    musicEnabled = true,
    active = false,
    paused = false;
  let nextBeat = 0,
    step = 0,
    scheduler;
  const melody = [
    72,
    null,
    76,
    79,
    78,
    76,
    74,
    null,
    71,
    74,
    77,
    null,
    76,
    74,
    72,
    null,
    69,
    null,
    72,
    76,
    75,
    72,
    69,
    null,
    67,
    71,
    74,
    77,
    76,
    74,
    71,
    null,
  ];
  const bass = [48, 55, 47, 55, 45, 52, 43, 55];
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
  function note(
    freq,
    at,
    length,
    volume,
    type = "sine",
    bus = effectsBus,
    endFreq,
  ) {
    const source = ctx.createOscillator(),
      gain = ctx.createGain();
    source.type = type;
    source.frequency.setValueAtTime(freq, at);
    if (endFreq)
      source.frequency.exponentialRampToValueAtTime(endFreq, at + length);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(gain);
    gain.connect(bus);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
    };
    source.start(at);
    source.stop(at + length + 0.02);
  }
  function noise(at, length, volume, frequency, bus = effectsBus) {
    const source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = noiseBuffer;
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(bus);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    source.start(at);
    source.stop(at + length + 0.02);
  }
  function mix() {
    if (!ctx) return;
    master.gain.setTargetAtTime(
      enabled && !paused ? 0.65 : 0,
      ctx.currentTime,
      0.015,
    );
    musicBus.gain.setTargetAtTime(
      musicEnabled && active ? 0.23 : 0,
      ctx.currentTime,
      0.03,
    );
    if (!enabled || paused || !active) setPouring(false);
  }
  function schedule() {
    if (
      !ctx ||
      ctx.state !== "running" ||
      !enabled ||
      !musicEnabled ||
      !active ||
      paused
    ) {
      nextBeat = 0;
      return;
    }
    if (nextBeat < ctx.currentTime) nextBeat = ctx.currentTime + 0.025;
    while (nextBeat < ctx.currentTime + 0.15) {
      const i = step % melody.length,
        pitch = melody[i];
      if (pitch !== null) {
        note(hz(pitch), nextBeat, 0.19, 0.2, "sine", musicBus);
        note(hz(pitch) * 2.76, nextBeat, 0.055, 0.035, "sine", musicBus);
      }
      if (step % 4 === 0)
        note(
          hz(bass[Math.floor(i / 4)]),
          nextBeat,
          0.3,
          0.27,
          "triangle",
          musicBus,
        );
      if (step % 2 === 1) noise(nextBeat, 0.055, 0.07, 3200, musicBus);
      if (step % 4 === 2) note(140, nextBeat, 0.08, 0.12, "sine", musicBus, 65);
      nextBeat += (60 / 112 / 2) * (step % 2 === 0 ? 1.15 : 0.85);
      step++;
    }
  }
  async function unlock() {
    try {
      if (!ctx) {
        const Context =
          globalThis.AudioContext || globalThis.webkitAudioContext;
        if (!Context) return false;
        ctx = new Context();
        master = ctx.createGain();
        musicBus = ctx.createGain();
        effectsBus = ctx.createGain();
        master.gain.value = 0;
        musicBus.gain.value = 0;
        effectsBus.gain.value = 0.6;
        musicBus.connect(master);
        effectsBus.connect(master);
        master.connect(ctx.destination);
        noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        scheduler = setInterval(schedule, 60);
      }
      await ctx.resume();
      mix();
      schedule();
      return true;
    } catch {
      return false;
    }
  }
  function effect(kind = "tap") {
    if (!ctx || !enabled || paused || ctx.state !== "running") return;
    const t = ctx.currentTime;
    if (kind === "shred") {
      noise(t, 0.38, 0.28, 950);
      note(105, t, 0.32, 0.07, "sawtooth", effectsBus, 48);
      for (let i = 0; i < 4; i++) noise(t + i * 0.06, 0.045, 0.08, 1800);
    } else if (kind === "peel") {
      noise(t, 0.26, 0.2, 2300);
      note(320, t, 0.14, 0.04, "triangle", effectsBus, 700);
    } else if (kind === "alarm") {
      note(740, t, 0.09, 0.1);
      note(990, t + 0.08, 0.12, 0.08);
    } else if (kind === "align") {
      note(190, t, 0.045, 0.16, "triangle");
      note(470, t + 0.04, 0.07, 0.07);
    } else if (kind === "interrupt") {
      [76, 72, 66].forEach((n, i) =>
        note(hz(n), t + i * 0.11, 0.17, 0.1, "triangle"),
      );
    } else if (kind === "win" || kind === "lose") {
      (kind === "win" ? [72, 76, 79, 84] : [67, 64, 61]).forEach((n, i) =>
        note(hz(n), t + i * 0.09, 0.22, 0.12, "triangle"),
      );
    } else if (kind === "short") {
      note(400, t, 0.14, 0.08, "sine", effectsBus, 230);
    } else note(330, t, 0.07, 0.09, "triangle");
  }
  function setPouring(value) {
    const on = Boolean(
      value && ctx && enabled && active && !paused && ctx.state === "running",
    );
    if (on === Boolean(pouring)) return;
    if (!on) {
      if (pouring) {
        const old = pouring;
        pouring = null;
        old.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
        old.source.stop(ctx.currentTime + 0.05);
        old.wobble.stop(ctx.currentTime + 0.05);
      }
      return;
    }
    const source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    const wobble = ctx.createOscillator(),
      depth = ctx.createGain();
    source.buffer = noiseBuffer;
    source.loop = true;
    filter.type = "bandpass";
    filter.frequency.value = 750;
    filter.Q.value = 1.5;
    wobble.frequency.value = 9;
    depth.gain.value = 280;
    wobble.connect(depth);
    depth.connect(filter.frequency);
    gain.gain.value = 0.14;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(effectsBus);
    source.onended = () =>
      [source, filter, gain, wobble, depth].forEach((node) =>
        node.disconnect(),
      );
    pouring = { source, gain, wobble };
    source.start();
    wobble.start();
  }
  return {
    unlock,
    effect,
    setPouring,
    setEnabled(value) {
      enabled = value;
      mix();
    },
    setMusic(value) {
      musicEnabled = value;
      mix();
    },
    setScene(isActive, isPaused) {
      if (active === isActive && paused === isPaused) return;
      active = isActive;
      paused = isPaused;
      mix();
    },
    dispose() {
      clearInterval(scheduler);
      setPouring(false);
      ctx?.close();
    },
  };
}
