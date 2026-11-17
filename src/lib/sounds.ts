let ctx: AudioContext | null = null;
let muted = false;

function audio() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType, gainValue: number, when = 0) {
  if (muted) return;
  const a = audio();
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + when;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainValue, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(gain);
  gain.connect(a.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function buzz() {
  if (muted) return;
  const a = audio();
  const buffer = a.createBuffer(1, a.sampleRate * 0.35, a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.35, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.35);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(a.destination);
  src.start();
}

export const sounds = {
  unlock() {
    audio();
  },
  reveal() {
    tone(880, 0.16, "sine", 0.28);
    tone(1175, 0.32, "sine", 0.22, 0.06);
  },
  strike() {
    tone(110, 0.42, "sawtooth", 0.22);
    tone(78, 0.4, "square", 0.12);
    buzz();
  },
  points() {
    [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.26, "triangle", 0.22, i * 0.07));
  },
  next() {
    tone(320, 0.14, "sine", 0.12);
    tone(480, 0.18, "sine", 0.1, 0.08);
  },
  toggleMute() {
    muted = !muted;
    return muted;
  },
  isMuted() {
    return muted;
  },
};
