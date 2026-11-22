// audio.js — tiny WebAudio cues for Court of Embers, synthesised on the
// spot: no audio files, no network. The context is created on the first
// user gesture, so loading the page never makes a sound.

export function createAudio() {
  const audio = {
    muted: false,
    ctx: null,
    unlock() {
      if (!this.ctx) {
        try {
          const Ctor = window.AudioContext || window.webkitAudioContext;
          if (Ctor) this.ctx = new Ctor();
        } catch {
          this.ctx = null;
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },
    toggleMute() {
      this.muted = !this.muted;
    },
    tone(freq, dur, type = 'sine', gain = 0.08, when = 0) {
      if (this.muted || !this.ctx) return;
      try {
        const t0 = this.ctx.currentTime + when;
        const osc = this.ctx.createOscillator();
        const amp = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        amp.gain.setValueAtTime(gain, t0);
        amp.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
        osc.connect(amp);
        amp.connect(this.ctx.destination);
        osc.start(t0);
        osc.stop(t0 + dur);
      } catch {
        // A headless browser may refuse audio; the game plays on silently.
      }
    },
    play(name) {
      if (name === 'select') this.tone(660, 0.08, 'triangle', 0.05);
      if (name === 'play') {
        this.tone(392, 0.1, 'triangle', 0.07);
        this.tone(523, 0.14, 'triangle', 0.07, 0.08);
      }
      if (name === 'start') {
        this.tone(523, 0.12, 'triangle', 0.07);
        this.tone(659, 0.12, 'triangle', 0.07, 0.1);
        this.tone(784, 0.2, 'triangle', 0.07, 0.2);
      }
      if (name === 'win') {
        [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.08, i * 0.13));
      }
      if (name === 'lose') {
        [392, 330, 262].forEach((f, i) => this.tone(f, 0.3, 'sine', 0.08, i * 0.16));
      }
    },
  };
  return audio;
}
