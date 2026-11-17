import { Howl, Howler } from "howler";

// Enable automatic audio unlocking on user interaction across all browsers
if (typeof window !== "undefined") {
  Howler.autoUnlock = true;
  Howler.volume(0.85);

  // Auto-suspend WebAudio when page is in background to save battery & CPU
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      try {
        if (document.hidden) {
          Howler.ctx?.suspend?.();
        } else {
          Howler.ctx?.resume?.();
        }
      } catch {}
    });
  }
}

/**
 * Generates an in-memory 16-bit Mono PCM WAV base64 string.
 * This guarantees zero network dependencies, instant loading, and 100% reliable sound with Howler.
 */
function createWavUri(sampleRate: number, duration: number, sampleFn: (t: number) => number): string {
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(0, "RIFF");
  /* file length */
  view.setUint32(4, 36 + numSamples * 2, true);
  /* RIFF type */
  writeString(8, "WAVE");
  /* format chunk identifier */
  writeString(12, "fmt ");
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channels * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(36, "data");
  /* data chunk length */
  view.setUint32(40, numSamples * 2, true);

  // Write samples
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let s = sampleFn(t);
    s = Math.max(-1, Math.min(1, s));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  // Convert buffer to binary string and base64
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return "data:audio/wav;base64," + btoa(binary);
}

// Lazy sound cache: Only generates audio PCM data when a sound is actually played
const soundCache: Partial<Record<string, Howl>> = {};

function getSound(key: string, factory: () => Howl): Howl | null {
  if (typeof window === "undefined") return null;
  if (!soundCache[key]) {
    try {
      soundCache[key] = factory();
    } catch {
      return null;
    }
  }
  return soundCache[key] || null;
}

// Sound factories
const clickHowl = () =>
  getSound("click", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.05, (t) => {
          const env = Math.exp(-t * 90);
          return Math.sin(2 * Math.PI * 800 * t) * env * 0.7;
        }),
      ],
      volume: 0.8,
    })
  );

const flipHowl = () =>
  getSound("flip", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.09, (t) => {
          const f = 400 + (1 - t / 0.09) * 300;
          const env = Math.exp(-t * 50);
          return Math.sin(2 * Math.PI * f * t) * env;
        }),
      ],
      volume: 0.85,
    })
  );

const coinHowl = () =>
  getSound("coin", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.22, (t) => {
          if (t < 0.08) {
            return Math.sin(2 * Math.PI * 987.77 * t) * Math.exp(-t * 30);
          }
          const t2 = t - 0.08;
          return Math.sin(2 * Math.PI * 1318.51 * t2) * Math.exp(-t2 * 20);
        }),
      ],
      volume: 0.8,
    })
  );

const kickHowl = () =>
  getSound("kick", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.16, (t) => {
          const f = 180 * Math.exp(-t * 35) + 45;
          const env = Math.exp(-t * 22);
          const sub = Math.sin(2 * Math.PI * f * t);
          const punch = Math.sin(2 * Math.PI * (f * 1.5) * t) * 0.4;
          return (sub + punch) * env;
        }),
      ],
      volume: 1.0,
    })
  );

const thudHowl = () =>
  getSound("thud", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.14, (t) => {
          const f = 90 * Math.exp(-t * 25) + 30;
          const env = Math.exp(-t * 30);
          return Math.sin(2 * Math.PI * f * t) * env * 0.9;
        }),
      ],
      volume: 0.9,
    })
  );

const drawerHowl = () =>
  getSound("drawer", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.18, (t) => {
          const env = Math.sin((t / 0.18) * Math.PI);
          const noise = (Math.random() * 2 - 1) * 0.3;
          const tone = Math.sin(2 * Math.PI * 260 * t) * 0.7;
          return (tone + noise) * env;
        }),
      ],
      volume: 0.75,
    })
  );

const winHowl = () =>
  getSound("win", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.45, (t) => {
          const notes = [523.25, 659.25, 783.99, 1046.5];
          const noteIdx = Math.min(3, Math.floor(t / 0.1));
          const noteT = t - noteIdx * 0.1;
          const f = notes[noteIdx];
          const env = Math.exp(-noteT * 18);
          return Math.sin(2 * Math.PI * f * noteT) * env;
        }),
      ],
      volume: 0.85,
    })
  );

const badHowl = () =>
  getSound("bad", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.22, (t) => {
          const f = 160 - t * 100;
          const env = Math.exp(-t * 15);
          return Math.sin(2 * Math.PI * f * t) * env;
        }),
      ],
      volume: 0.7,
    })
  );

const popHowl = () =>
  getSound("pop", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.08, (t) => {
          const f = 400 + Math.sin(t * 100) * 200;
          const env = Math.exp(-t * 60);
          return Math.sin(2 * Math.PI * f * t) * env;
        }),
      ],
      volume: 0.8,
    })
  );

const clawHowl = () =>
  getSound("claw", () =>
    new Howl({
      src: [
        createWavUri(22050, 0.12, (t) => {
          const env = Math.sin((t / 0.12) * Math.PI);
          const buzz = (t * 340) % 1 > 0.5 ? 0.6 : -0.6;
          return buzz * env * 0.5;
        }),
      ],
      volume: 0.65,
    })
  );

export const sfx = {
  click() {
    try {
      clickHowl()?.play();
    } catch {}
  },
  flip(_on?: boolean) {
    try {
      flipHowl()?.play();
    } catch {}
  },
  coin() {
    try {
      coinHowl()?.play();
    } catch {}
  },
  kick() {
    try {
      kickHowl()?.play();
    } catch {}
  },
  thud() {
    try {
      thudHowl()?.play();
    } catch {}
  },
  drawer(_open = true) {
    try {
      drawerHowl()?.play();
    } catch {}
  },
  win() {
    try {
      winHowl()?.play();
    } catch {}
  },
  bad() {
    try {
      badHowl()?.play();
    } catch {}
  },
  pop() {
    try {
      popHowl()?.play();
    } catch {}
  },
  claw() {
    try {
      clawHowl()?.play();
    } catch {}
  },
  jump() {
    try {
      coinHowl()?.play();
    } catch {}
  },
  tone(_f?: number, _d?: number, _type?: string, _gain?: number) {
    try {
      clickHowl()?.play();
    } catch {}
  },
};
