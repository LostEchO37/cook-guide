/** Cooking timer with Web Audio alarm */

export class CookingTimer {
  #secondsLeft = 0;
  #totalSeconds = 0;
  #intervalId = null;
  #running = false;
  #onTick = null;
  #onComplete = null;
  #audioContext = null;
  #activeNodes = [];
  soundEnabled = true;

  constructor({ onTick, onComplete, soundEnabled = true }) {
    this.#onTick = onTick;
    this.#onComplete = onComplete;
    this.soundEnabled = soundEnabled;
  }

  setDuration(seconds) {
    this.stop();
    this.#totalSeconds = seconds;
    this.#secondsLeft = seconds;
    this.#emitTick();
  }

  get secondsLeft() {
    return this.#secondsLeft;
  }

  get totalSeconds() {
    return this.#totalSeconds;
  }

  get running() {
    return this.#running;
  }

  start() {
    if (this.#secondsLeft <= 0) return;
    if (this.#running) return;

    this.#running = true;
    this.#intervalId = setInterval(() => {
      this.#secondsLeft -= 1;
      this.#emitTick();

      if (this.#secondsLeft <= 0) {
        this.stop();
        this.#onComplete?.();
        this.#playAlarm();
      }
    }, 1000);
  }

  pause() {
    if (!this.#running) return;
    this.#running = false;
    clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  stop() {
    this.pause();
  }

  reset() {
    this.stop();
    this.#secondsLeft = this.#totalSeconds;
    this.#emitTick();
  }

  stopSound() {
    for (const node of this.#activeNodes) {
      try { node.stop(); } catch { /* already stopped */ }
    }
    this.#activeNodes = [];
    if (this.#audioContext && this.#audioContext.state === 'running') {
      try { this.#audioContext.suspend(); } catch { /* ignore */ }
    }
  }

  #emitTick() {
    this.#onTick?.(this.#secondsLeft, this.#totalSeconds);
  }

  #getAudioContext() {
    if (!this.#audioContext) {
      this.#audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.#audioContext;
  }

  #playAlarm() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.#getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      this.#activeNodes = [];
      const playBeep = (startTime, freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
        osc.start(startTime);
        osc.stop(startTime + 0.3);
        this.#activeNodes.push(osc);
      };

      const now = ctx.currentTime;
      for (let i = 0; i < 6; i++) {
        playBeep(now + i * 0.5, i % 2 === 0 ? 880 : 660);
      }
    } catch {
      // Audio not available — visual alarm still shows
    }
  }

  static format(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  const result = await Notification.requestPermission();
  return result;
}

export function showNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '🍳' });
  }
}
