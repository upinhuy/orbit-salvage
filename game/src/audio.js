// Sound for Orbit Salvage: every effect is a short WebAudio oscillator blip,
// synthesised in the browser, no audio files and no network.
export function makeAudio() {
  let ctx = null;
  let muted = false;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function blip(freq, dur, type, gain) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.08, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  }
  return {
    toggleMute() { muted = !muted; return muted; },
    collect() { blip(880, 0.12, 'sine', 0.09); blip(1320, 0.1, 'sine', 0.05); },
    fuel() { blip(520, 0.15, 'triangle', 0.09); },
    hit() { blip(140, 0.25, 'sawtooth', 0.12); },
    level() { blip(660, 0.1, 'square', 0.06); blip(990, 0.18, 'square', 0.06); },
    win() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.22, 'triangle', 0.09), i * 120)); },
    lose() { [400, 300, 200].forEach((f, i) => setTimeout(() => blip(f, 0.25, 'sawtooth', 0.08), i * 150)); },
  };
}
