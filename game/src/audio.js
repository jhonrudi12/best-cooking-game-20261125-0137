// Ember & Thyme — Bistro Rush: all sound is synthesized with WebAudio, so the game ships
// no audio files at all. A short sizzle loop rides under play; dings, thuds and buzzes mark
// serves, mistakes and the grill. Nothing plays until the first click or key, per browser rules.
export function createAudio() {
  let context = null;
  let sizzle = null;
  let muted = false;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  function tone(frequency, seconds, type = 'sine', gainValue = 0.12, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    click() {
      tone(660, 0.07, 'triangle', 0.08);
    },
    add() {
      tone(520, 0.08, 'triangle', 0.09);
      tone(780, 0.1, 'triangle', 0.07, 0.05);
    },
    pattyDone() {
      tone(880, 0.12, 'sine', 0.1);
      tone(1174, 0.16, 'sine', 0.09, 0.09);
    },
    served() {
      tone(523, 0.12, 'triangle', 0.11);
      tone(659, 0.12, 'triangle', 0.11, 0.09);
      tone(784, 0.22, 'triangle', 0.12, 0.18);
    },
    failed() {
      tone(180, 0.22, 'sawtooth', 0.07);
      tone(140, 0.28, 'sawtooth', 0.07, 0.1);
    },
    lost() {
      tone(392, 0.16, 'triangle', 0.1);
      tone(311, 0.3, 'triangle', 0.1, 0.14);
    },
    over() {
      tone(523, 0.18, 'triangle', 0.1);
      tone(392, 0.18, 'triangle', 0.1, 0.16);
      tone(330, 0.34, 'triangle', 0.11, 0.32);
    },
    startSizzle() {
      const ctx = ensure();
      if (!ctx || muted || sizzle) return;
      try {
        const length = ctx.sampleRate * 1.2;
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * 0.25;
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3200;
        const gain = ctx.createGain();
        gain.gain.value = 0.05;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start();
        sizzle = source;
      } catch {
        sizzle = null;
      }
    },
    stopSizzle() {
      if (sizzle) {
        try {
          sizzle.stop();
        } catch {
          // Already stopped.
        }
        sizzle = null;
      }
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
  };
}
