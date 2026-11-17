/* ============================================================
   Family Feud Sound Engine
   Pure Web Audio API – no external files needed
   ============================================================ */

const Sound = (() => {
  let ctx = null;
  let muted = false;
  let masterGain = null;

  function ensureContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);
    }
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  function playTone({ freq = 440, type = 'sine', duration = 0.3, attack = 0.4, attackTime = 0.01, decay = 0.1, detune = 0 }) {
    if (muted) return;
    const audio = ensureContext();
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    if (detune) osc.detune.value = detune;

    gain.gain.setValueAtTime(0, audio.currentTime);
    gain.gain.linearRampToValueAtTime(amplitude, audio.currentTime + attackTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(audio.currentTime);
    osc.stop(audio.currentTime + duration + 0.05);
  }

  function playNoise({ duration = 0.25, amplitude = 0.3, filterFreq = 800 }) {
    if (muted) return;
    const audio = ensureContext();
    const bufferSize = audio.sampleRate * duration;
    const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * amplitude;
    }

    const noise = audio.createBufferSource();
    noise.buffer = buffer;

    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1.5;

    const gain = audio.createGain();
    gain.gain.setValueAtTime(amplitude, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start();
  }

  // ---------- Public sounds ----------

  /** Classic answer reveal "ding" / chime */
  function reveal() {
    // Two-tone bright chime
    playTone({ freq: 880, type: 'sine', duration: 0.18, amplitude: 0.35, attackTime: 0.005 });
    setTimeout(() => {
      playTone({ freq: 1174.7, type: 'sine', duration: 0.35, amplitude: 0.28, attackTime: 0.01 }); // D6
    }, 60);
  }

  /** Harsh buzzer / strike X */
  function strike() {
    // Low harsh buzz + noise
    playTone({ freq: 120, type: 'sawtooth', duration: 0.45, amplitude: 0.35, attackTime: 0.005, decay: 0.1 });
    playTone({ freq: 90, type: 'square', duration: 0.4, amplitude: 0.2, attackTime: 0.005 });
    playNoise({ duration: 0.35, amplitude: 0.25, filterFreq: 400 });
  }

  /** Points awarded – positive cash-register-ish cascade */
  function points() {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        playTone({ freq, type: 'triangle', duration: 0.28, amplitude: 0.3, attackTime: 0.01 });
      }, i * 70);
    });
  }

  /** Soft whoosh / next question */
  function next() {
    playTone({ freq: 300, type: 'sine', duration: 0.15, amplitude: 0.15, attackTime: 0.02 });
    setTimeout(() => {
      playTone({ freq: 450, type: 'sine', duration: 0.2, amplitude: 0.12, attackTime: 0.02 });
    }, 80);
  }

  /** Mute toggle */
  function toggleMute() {
    muted = !muted;
    return muted;
  }

  function isMuted() {
    return muted;
  }

  /** Call once on first user interaction to unlock audio */
  function unlock() {
    ensureContext();
  }

  return {
    reveal,
    strike,
    points,
    next,
    toggleMute,
    isMuted,
    unlock
  };
})();
