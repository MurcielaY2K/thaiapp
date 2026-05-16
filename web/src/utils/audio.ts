let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.connect(g);
    g.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch { /* AudioContext not available */ }
}

export const sfx = {
  correct: () => { beep(523, 0.08); setTimeout(() => beep(784, 0.12), 80); },
  wrong:   () => { beep(220, 0.18, 'sawtooth', 0.12); },
  flip:    () => beep(1200, 0.03, 'sine', 0.06),
  tap:     () => beep(800, 0.04, 'sine', 0.05),
  complete:() => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15), i * 90));
  },
};
