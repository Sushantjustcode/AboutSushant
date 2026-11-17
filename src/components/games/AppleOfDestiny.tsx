import { useCallback, useEffect, useRef, useState } from "react";

// Canvas virtual dimensions
const W = 800;
const H = 460;
const GRAVITY = 580;

// Sound synthesizer using Web Audio API for 100% reliability and zero asset latency
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private getCtx(): AudioContext | null {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Whoosh on throw
  throw() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  // Crunchy, satisfying apple slice / pop hit
  appleHit() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Crisp high pop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);

    // Chime overtone
    const chime = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chime.type = "sine";
    chime.frequency.setValueAtTime(1760, now + 0.05);
    chimeGain.gain.setValueAtTime(0.35, now + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    chime.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chime.start(now + 0.05);
    chime.stop(now + 0.35);
  }

  // Comical realistic body impact thud
  bodyHit() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.26);

    gain.gain.setValueAtTime(0.48, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // Ground embed thud
  groundHit() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Soft organic pop/thud when apple drops and bounces on grass
  appleBounce() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // Victory Fanfare
  victory() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }
}

const sounds = new SoundEngine();

// Procedural Terrain Props
interface GroundProp {
  x: number;
  y: number;
  type: "grass" | "flower" | "stone";
  height: number;
  color: string;
}

// Particle interface
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  rotation: number;
  vRot: number;
}

// Anatomical Verlet Ragdoll Node
interface RagdollNode {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  radius: number;
  mass: number;
}

// Rigid Anatomical Bone Constraint
interface RagdollBone {
  a: number;
  b: number;
  len: number;
  width: number;
  isSpine?: boolean;
}

// Spear impaled in ragdoll bone
interface ImpaledSpear {
  nodeIdx: number;
  offsetX: number;
  offsetY: number;
  angle: number;
}

// Helper to draw a razor-sharp, pointed steel spear
function drawSharpSpear(ctx: CanvasRenderingContext2D, tipX: number, tipY: number, angle: number, spearLen = 48) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const nx = -sin;
  const ny = cos;

  const tailX = tipX - cos * spearLen;
  const tailY = tipY - sin * spearLen;

  // 1. Wooden shaft
  ctx.strokeStyle = "#8b5a2b";
  ctx.lineWidth = 2.4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tipX - cos * 6, tipY - sin * 6);
  ctx.stroke();

  // 2. Leather grip wrap
  const midX = tailX + cos * (spearLen * 0.45);
  const midY = tailY + sin * (spearLen * 0.45);
  ctx.strokeStyle = "#5a3d28";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(midX - cos * 5, midY - sin * 5);
  ctx.lineTo(midX + cos * 5, midY + sin * 5);
  ctx.stroke();

  // 3. Razor-sharp, pointed steel spearhead
  const sharpTipX = tipX + cos * 5;
  const sharpTipY = tipY + sin * 5;
  const headBaseX = tipX - cos * 13;
  const headBaseY = tipY - sin * 13;
  const barbL_X = headBaseX + nx * 5;
  const barbL_Y = headBaseY + ny * 5;
  const barbR_X = headBaseX - nx * 5;
  const barbR_Y = headBaseY - ny * 5;
  const notchX = headBaseX + cos * 3;
  const notchY = headBaseY + sin * 3;

  ctx.fillStyle = "#1d1c24";
  ctx.strokeStyle = "#383644";
  ctx.lineWidth = 1.0;
  ctx.lineJoin = "miter";
  ctx.beginPath();
  ctx.moveTo(sharpTipX, sharpTipY); // needle-sharp point
  ctx.lineTo(barbL_X, barbL_Y);
  ctx.lineTo(notchX, notchY);
  ctx.lineTo(barbR_X, barbR_Y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Steel blade spine glint
  ctx.strokeStyle = "#e8e5f0";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(sharpTipX, sharpTipY);
  ctx.lineTo(headBaseX + cos * 2, headBaseY + sin * 2);
  ctx.stroke();

  // 4. Crimson feather fletching at tail
  ctx.strokeStyle = "#d64532";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tailX - Math.cos(angle - 0.45) * 8, tailY - Math.sin(angle - 0.45) * 8);
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(tailX - Math.cos(angle + 0.45) * 8, tailY - Math.sin(angle + 0.45) * 8);
  ctx.stroke();
}

// Procedural Distorted "M" Cloud in the Sky
interface MCloudPuff {
  relX: number;
  relY: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  driftAmp: number;
}

interface MCloud {
  x: number;
  y: number;
  vx: number;
  scale: number;
  tilt: number;
  puffs: MCloudPuff[];
}

function createDistortedMCloud(): MCloud {
  const puffs: MCloudPuff[] = [];
  const scale = 0.92 + Math.random() * 0.32;
  const tilt = (Math.random() - 0.5) * 0.15;
  const vx = 2.2 + Math.random() * 0.6; // gentle drifting px/s
  const cloudX = 160 + Math.random() * 320;
  const cloudY = 46 + Math.random() * 30;

  // Asymmetric and subtly distorted "M" skeleton control points
  const leftX = -40 - Math.random() * 10;
  const rightX = 40 + Math.random() * 10;
  const peakLeftY = -24 - Math.random() * 10;
  const peakRightY = -22 - Math.random() * 12;
  const peakLeftX = -20 - Math.random() * 5;
  const peakRightX = 20 + Math.random() * 5;
  const dipY = 5 + Math.random() * 9;
  const dipX = (Math.random() - 0.5) * 7;
  const bottomY = 16 + Math.random() * 8;

  const addStrokePuffs = (x1: number, y1: number, x2: number, y2: number, count: number, radiusBase: number) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const rx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 4;
      const ry = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 4;
      puffs.push({
        relX: rx,
        relY: ry,
        radius: (radiusBase + (Math.random() - 0.5) * 4) * scale,
        baseAlpha: 0.48 + Math.random() * 0.24,
        phase: Math.random() * Math.PI * 2,
        speed: 1.1 + Math.random() * 1.5,
        driftAmp: 1.2 + Math.random() * 2.0,
      });
    }
  };

  // 1. Left outer pillar (dense fluffy puffs)
  addStrokePuffs(leftX, bottomY, peakLeftX, peakLeftY, 4, 15);
  // 2. Left inner slope to central dip
  addStrokePuffs(peakLeftX, peakLeftY, dipX, dipY, 3, 14);
  // 3. Right inner slope from central dip to right peak
  addStrokePuffs(dipX, dipY, peakRightX, peakRightY, 3, 14);
  // 4. Right outer pillar
  addStrokePuffs(peakRightX, peakRightY, rightX, bottomY, 4, 15);

  // Extra crown puffs on both peaks to give plush cumulus domes
  [-2, 2].forEach((offset) => {
    puffs.push({
      relX: peakLeftX + offset * 3,
      relY: peakLeftY - 5 + (Math.random() - 0.5) * 3,
      radius: (15 + Math.random() * 5) * scale,
      baseAlpha: 0.52 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 1.0 + Math.random() * 1.2,
      driftAmp: 1.2 + Math.random() * 1.5,
    });
    puffs.push({
      relX: peakRightX + offset * 3,
      relY: peakRightY - 5 + (Math.random() - 0.5) * 3,
      radius: (15 + Math.random() * 5) * scale,
      baseAlpha: 0.52 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 1.0 + Math.random() * 1.2,
      driftAmp: 1.2 + Math.random() * 1.5,
    });
  });

  // Soft atmospheric wisps/fluff to make it look like a rich, living cumulus cloud
  const fluffCount = 8 + Math.floor(Math.random() * 4);
  for (let k = 0; k < fluffCount; k++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 10 + Math.random() * 26;
    puffs.push({
      relX: Math.cos(angle) * dist,
      relY: Math.sin(angle) * dist * 0.55,
      radius: (11 + Math.random() * 7) * scale,
      baseAlpha: 0.24 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
      driftAmp: 1.0 + Math.random() * 1.8,
    });
  }

  return { x: cloudX, y: cloudY, vx, scale, tilt, puffs };
}

// Procedural Simple Ambient Clouds
interface AmbientCloudPuff {
  relX: number;
  relY: number;
  radius: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  driftAmp: number;
}

interface AmbientCloud {
  x: number;
  y: number;
  scale: number;
  tilt: number;
  puffs: AmbientCloudPuff[];
}

function createAmbientCloud(x: number, y: number, scale = 1.0): AmbientCloud {
  const puffs: AmbientCloudPuff[] = [];
  const tilt = (Math.random() - 0.5) * 0.08;

  // A natural cumulus cloud: base puff row + top billowing domes
  const baseCount = 5 + Math.floor(Math.random() * 2);
  const cloudWidth = 52 + Math.random() * 26;
  for (let i = 0; i < baseCount; i++) {
    const rx = -cloudWidth * 0.5 + (i / (baseCount - 1)) * cloudWidth;
    const ry = (Math.random() - 0.5) * 4;
    puffs.push({
      relX: rx,
      relY: ry,
      radius: (11 + Math.random() * 5) * scale,
      baseAlpha: 0.36 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.9 + Math.random() * 1.2,
      driftAmp: 1.0 + Math.random() * 1.5,
    });
  }

  // Top domes
  const domeCount = 3 + Math.floor(Math.random() * 2);
  for (let j = 0; j < domeCount; j++) {
    const rx = (j - 1) * 13 + (Math.random() - 0.5) * 6;
    const ry = -7 - Math.random() * 7;
    puffs.push({
      relX: rx,
      relY: ry,
      radius: (13 + Math.random() * 6) * scale,
      baseAlpha: 0.42 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 1.0 + Math.random() * 1.3,
      driftAmp: 1.1 + Math.random() * 1.5,
    });
  }

  // Soft edge wisps
  for (let k = 0; k < 3; k++) {
    const rx = (Math.random() - 0.5) * (cloudWidth + 14);
    const ry = (Math.random() - 0.5) * 14;
    puffs.push({
      relX: rx,
      relY: ry,
      radius: (8 + Math.random() * 5) * scale,
      baseAlpha: 0.18 + Math.random() * 0.16,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.0,
      driftAmp: 0.9 + Math.random() * 1.2,
    });
  }

  return { x, y, scale, tilt, puffs };
}

function drawAmbientCloud(ctx: CanvasRenderingContext2D, cloud: AmbientCloud, time: number) {
  ctx.save();
  ctx.translate(cloud.x, cloud.y);
  ctx.rotate(cloud.tilt);

  // Soft atmospheric pastel cloud shadow
  ctx.fillStyle = "rgba(224, 216, 238, 0.32)";
  cloud.puffs.forEach((p) => {
    const dy = Math.sin(time * 0.001 * p.speed + p.phase) * p.driftAmp;
    const dx = Math.cos(time * 0.0008 * p.speed + p.phase) * (p.driftAmp * 0.7);
    ctx.beginPath();
    ctx.arc(p.relX + dx, p.relY + dy + 2.5, p.radius * 1.05, 0, Math.PI * 2);
    ctx.fill();
  });

  // Luminous cumulus puffs
  cloud.puffs.forEach((p) => {
    const dy = Math.sin(time * 0.001 * p.speed + p.phase) * p.driftAmp;
    const dx = Math.cos(time * 0.0008 * p.speed + p.phase) * (p.driftAmp * 0.7);
    const rad = p.radius + Math.sin(time * 0.0012 * p.speed + p.phase) * 1.0;

    const grad = ctx.createRadialGradient(
      p.relX + dx - rad * 0.25,
      p.relY + dy - rad * 0.25,
      rad * 0.1,
      p.relX + dx,
      p.relY + dy,
      rad
    );
    grad.addColorStop(0, `rgba(255, 255, 255, ${p.baseAlpha})`);
    grad.addColorStop(0.75, `rgba(255, 252, 246, ${p.baseAlpha * 0.8})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.relX + dx, p.relY + dy, rad, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawDistortedMCloud(ctx: CanvasRenderingContext2D, cloud: MCloud, time: number) {
  ctx.save();
  ctx.translate(cloud.x, cloud.y);
  ctx.rotate(cloud.tilt);

  // 1. Soft atmospheric pastel cloud shadow
  ctx.fillStyle = "rgba(224, 216, 238, 0.42)";
  cloud.puffs.forEach((p) => {
    const dy = Math.sin(time * 0.001 * p.speed + p.phase) * p.driftAmp;
    const dx = Math.cos(time * 0.0008 * p.speed + p.phase) * (p.driftAmp * 0.7);
    ctx.beginPath();
    ctx.arc(p.relX + dx, p.relY + dy + 3, p.radius * 1.05, 0, Math.PI * 2);
    ctx.fill();
  });

  // 2. Luminous fluffy cumulus puffs
  cloud.puffs.forEach((p) => {
    const dy = Math.sin(time * 0.001 * p.speed + p.phase) * p.driftAmp;
    const dx = Math.cos(time * 0.0008 * p.speed + p.phase) * (p.driftAmp * 0.7);
    const rad = p.radius + Math.sin(time * 0.0012 * p.speed + p.phase) * 1.1;

    const grad = ctx.createRadialGradient(
      p.relX + dx - rad * 0.25,
      p.relY + dy - rad * 0.25,
      rad * 0.1,
      p.relX + dx,
      p.relY + dy,
      rad
    );
    grad.addColorStop(0, `rgba(255, 255, 255, ${p.baseAlpha})`);
    grad.addColorStop(0.75, `rgba(255, 252, 246, ${p.baseAlpha * 0.8})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(p.relX + dx, p.relY + dy, rad, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// Solid Apple Renderer
function drawApple(ctx: CanvasRenderingContext2D, ax: number, ay: number, rot = 0) {
  ctx.save();
  ctx.translate(ax, ay);
  if (rot !== 0) ctx.rotate(rot);

  // Apple body
  ctx.fillStyle = "#e14c38";
  ctx.beginPath();
  ctx.arc(-2.5, 0, 6, 0, Math.PI * 2);
  ctx.arc(2.5, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.beginPath();
  ctx.arc(-3, -2.5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Stem
  ctx.strokeStyle = "#5a3d28";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -5);
  ctx.quadraticCurveTo(1, -11, 3, -12);
  ctx.stroke();

  // Leaf
  ctx.fillStyle = "#587349";
  ctx.beginPath();
  ctx.ellipse(4, -10, 3.5, 1.8, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function AppleOfDestiny() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // HUD state
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("sushant_apple_destiny_best") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });
  const [windDisplay, setWindDisplay] = useState(0);
  const [aimInfo, setAimInfo] = useState<{ angle: number; power: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; sub: string; success: boolean } | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // Simulation engine state in ref for 60/120fps rAF loop
  const sim = useRef<{
    terrain: number[];
    props: GroundProp[];
    player: { x: number; y: number; throwPhase: number };
    target: { x: number; y: number; appleY: number; appleHit: boolean; bodyHit: boolean };
    wind: number;
    isAiming: boolean;
    aimStart: { x: number; y: number } | null;
    aimCurrent: { x: number; y: number } | null;
    spear: {
      active: boolean;
      x: number;
      y: number;
      vx: number;
      vy: number;
      angle: number;
      stuck: boolean;
    } | null;
    stuckSpears: Array<{ x: number; y: number; angle: number }>;
    apple: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vRot: number;
      falling: boolean;
      grounded: boolean;
    } | null;
    mCloud: MCloud | null;
    ambientClouds: AmbientCloud[];
    ragdoll: {
      active: boolean;
      nodes: RagdollNode[];
      bones: RagdollBone[];
      spear: ImpaledSpear | null;
    } | null;
    particles: Particle[];
    shake: number;
    status: "aiming" | "flight" | "success" | "fail";
  }>({
    terrain: [],
    props: [],
    player: { x: 95, y: 350, throwPhase: 0 },
    target: { x: 620, y: 350, appleY: 290, appleHit: false, bodyHit: false },
    wind: 0,
    isAiming: false,
    aimStart: null,
    aimCurrent: null,
    spear: null,
    stuckSpears: [],
    apple: null,
    mCloud: null,
    ambientClouds: [],
    ragdoll: null,
    particles: [],
    shake: 0,
    status: "aiming",
  });

  const toggleSound = () => {
    setSoundOn((s) => {
      sounds.enabled = !s;
      return !s;
    });
  };

  // Build genuine procedural terrain
  const buildTerrain = useCallback((targetDistance?: number) => {
    const s = sim.current;
    const terrain = new Array<number>(W);

    const f1 = 0.006 + Math.random() * 0.004;
    const f2 = 0.016 + Math.random() * 0.008;
    const phi1 = Math.random() * Math.PI * 2;
    const phi2 = Math.random() * Math.PI * 2;
    const amp1 = 28 + Math.random() * 22;
    const amp2 = 12 + Math.random() * 10;
    const baseY = H - 95;

    const targetX = targetDistance ?? Math.floor(510 + Math.random() * 210);
    const playerX = 95;

    for (let x = 0; x < W; x++) {
      let y = baseY + Math.sin(x * f1 + phi1) * amp1 + Math.cos(x * f2 + phi2) * amp2;

      // Flatten player pedestal
      const pDist = Math.abs(x - playerX);
      if (pDist < 55) {
        const factor = Math.cos((pDist / 55) * (Math.PI / 2));
        y = y * (1 - factor) + (baseY + 5) * factor;
      }

      // Flatten target pedestal
      const tDist = Math.abs(x - targetX);
      if (tDist < 50) {
        const factor = Math.cos((tDist / 50) * (Math.PI / 2));
        y = y * (1 - factor) + (baseY - 10) * factor;
      }

      terrain[x] = y;
    }

    s.terrain = terrain;
    s.player.x = playerX;
    s.player.y = terrain[playerX];
    s.player.throwPhase = 0;

    s.target.x = targetX;
    s.target.y = terrain[targetX];
    s.target.appleY = s.target.y - 70;
    s.target.appleHit = false;
    s.target.bodyHit = false;

    const windVal = Math.round((Math.random() * 5 - 2.5) * 10) / 10;
    s.wind = windVal * 28;
    setWindDisplay(windVal);

    // Procedural terrain props
    const props: GroundProp[] = [];
    for (let x = 20; x < W - 20; x += 18 + Math.random() * 22) {
      if (Math.abs(x - playerX) < 30 || Math.abs(x - targetX) < 25) continue;
      const py = terrain[Math.floor(x)];
      const rand = Math.random();
      if (rand < 0.55) {
        props.push({
          x,
          y: py,
          type: "grass",
          height: 6 + Math.random() * 8,
          color: Math.random() > 0.5 ? "#587349" : "#4a633c",
        });
      } else if (rand < 0.75) {
        props.push({
          x,
          y: py + 1,
          type: "stone",
          height: 3 + Math.random() * 4,
          color: "#8a867c",
        });
      } else {
        props.push({
          x,
          y: py,
          type: "flower",
          height: 7 + Math.random() * 6,
          color: ["#e14c38", "#ecd896", "#bdb6d9"][Math.floor(Math.random() * 3)],
        });
      }
    }
    s.props = props;

    s.spear = null;
    s.stuckSpears = [];
    s.apple = null;
    const m = createDistortedMCloud();
    s.mCloud = m;
    // Generate 3 simple natural ambient clouds with comfortable gaps around the secret M-cloud
    s.ambientClouds = [
      createAmbientCloud((m.x - 240 + W * 2) % W, 36 + Math.random() * 24, 0.9 + Math.random() * 0.25),
      createAmbientCloud((m.x + 220) % W, 44 + Math.random() * 26, 0.85 + Math.random() * 0.25),
      createAmbientCloud((m.x + 460) % W, 32 + Math.random() * 24, 0.8 + Math.random() * 0.2),
    ];
    s.ragdoll = null;
    s.particles = [];
    s.shake = 0;
    s.status = "aiming";
    setFeedback(null);
    setAimInfo(null);
  }, []);

  useEffect(() => {
    buildTerrain();
  }, [buildTerrain]);

  // MAJOR FEATURE: Full 16-node Anatomical Human Skeleton Ragdoll
  const createAnatomicalRagdoll = (hitX: number, hitY: number, vx: number, vy: number) => {
    const s = sim.current;
    const tx = s.target.x;
    const ty = s.target.y;

    // Impulse scaling
    const impX = vx * 0.038;
    const impY = vy * 0.038;

    // 16 anatomical bone nodes:
    // 0: Head, 1: Neck, 2: L Shoulder, 3: R Shoulder, 4: Chest, 5: Pelvis
    // 6: L Elbow, 7: L Hand, 8: R Elbow, 9: R Hand
    // 10: L Hip, 11: L Knee, 12: L Foot, 13: R Hip, 14: R Knee, 15: R Foot
    const nodes: RagdollNode[] = [
      { x: tx, y: ty - 58, oldX: tx - impX * 0.35, oldY: ty - 58 - impY * 0.35, radius: 9, mass: 1.0 }, // 0: Head
      { x: tx, y: ty - 48, oldX: tx - impX * 0.45, oldY: ty - 48 - impY * 0.45, radius: 3.5, mass: 1.0 }, // 1: Neck
      { x: tx - 9, y: ty - 45, oldX: tx - 9 - impX * 0.4, oldY: ty - 45 - impY * 0.4, radius: 3, mass: 0.9 }, // 2: L Shoulder
      { x: tx + 9, y: ty - 45, oldX: tx + 9 - impX * 0.4, oldY: ty - 45 - impY * 0.4, radius: 3, mass: 0.9 }, // 3: R Shoulder
      { x: tx, y: ty - 34, oldX: tx - impX * 0.5, oldY: ty - 34 - impY * 0.5, radius: 4.5, mass: 2.0 }, // 4: Chest
      { x: tx, y: ty - 21, oldX: tx - impX * 0.35, oldY: ty - 21 - impY * 0.35, radius: 5.5, mass: 2.2 }, // 5: Pelvis
      { x: tx - 13, y: ty - 32, oldX: tx - 13 - impX * 0.25, oldY: ty - 32, radius: 3, mass: 0.7 }, // 6: L Elbow
      { x: tx - 16, y: ty - 20, oldX: tx - 16 - impX * 0.2, oldY: ty - 20, radius: 2.5, mass: 0.5 }, // 7: L Hand
      { x: tx + 13, y: ty - 32, oldX: tx + 13 - impX * 0.25, oldY: ty - 32, radius: 3, mass: 0.7 }, // 8: R Elbow
      { x: tx + 16, y: ty - 20, oldX: tx + 16 - impX * 0.2, oldY: ty - 20, radius: 2.5, mass: 0.5 }, // 9: R Hand
      { x: tx - 6, y: ty - 20, oldX: tx - 6, oldY: ty - 20, radius: 3.5, mass: 1.2 }, // 10: L Hip
      { x: tx - 8, y: ty - 10, oldX: tx - 8, oldY: ty - 10, radius: 3.5, mass: 1.0 }, // 11: L Knee
      { x: tx - 9, y: ty, oldX: tx - 9, oldY: ty, radius: 3, mass: 0.8 }, // 12: L Foot
      { x: tx + 6, y: ty - 20, oldX: tx + 6, oldY: ty - 20, radius: 3.5, mass: 1.2 }, // 13: R Hip
      { x: tx + 8, y: ty - 10, oldX: tx + 8, oldY: ty - 10, radius: 3.5, mass: 1.0 }, // 14: R Knee
      { x: tx + 9, y: ty, oldX: tx + 9, oldY: ty, radius: 3, mass: 0.8 }, // 15: R Foot
    ];

    // Find closest node to spear hit location to apply localized direct impulse & attach spear
    let closestNode = 4; // default chest
    let minDist = 999;
    nodes.forEach((n, idx) => {
      const d = Math.hypot(n.x - hitX, n.y - hitY);
      if (d < minDist) {
        minDist = d;
        closestNode = idx;
      }
    });

    // Localized impact blast on the hit bone node
    nodes[closestNode].oldX = nodes[closestNode].x - impX * 0.85;
    nodes[closestNode].oldY = nodes[closestNode].y - impY * 0.85;

    // Helper for resting distance
    const dist = (i: number, j: number) => Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);

    // Rigid skeletal bone constraints
    const bones: RagdollBone[] = [
      // Spine & Head
      { a: 0, b: 1, len: dist(0, 1), width: 3.2, isSpine: true }, // Head - Neck
      { a: 1, b: 4, len: dist(1, 4), width: 3.8, isSpine: true }, // Neck - Chest
      { a: 4, b: 5, len: dist(4, 5), width: 3.6, isSpine: true }, // Chest - Pelvis
      // Clavicle & Shoulders
      { a: 2, b: 3, len: dist(2, 3), width: 2.8 }, // Clavicle bar (keeps shoulders wide)
      { a: 1, b: 2, len: dist(1, 2), width: 2.8 },
      { a: 1, b: 3, len: dist(1, 3), width: 2.8 },
      // Pelvic Girdle
      { a: 10, b: 13, len: dist(10, 13), width: 3.0 }, // Hips bar
      { a: 5, b: 10, len: dist(5, 10), width: 3.0 },
      { a: 5, b: 13, len: dist(5, 13), width: 3.0 },
      // Ribcage Cross-bracing (prevents torso noodle collapse)
      { a: 2, b: 5, len: dist(2, 5), width: 0.5 },
      { a: 3, b: 5, len: dist(3, 5), width: 0.5 },
      // Left Arm
      { a: 2, b: 6, len: dist(2, 6), width: 2.6 }, // L Upper Arm
      { a: 6, b: 7, len: dist(6, 7), width: 2.2 }, // L Forearm
      // Right Arm
      { a: 3, b: 8, len: dist(3, 8), width: 2.6 }, // R Upper Arm
      { a: 8, b: 9, len: dist(8, 9), width: 2.2 }, // R Forearm
      // Left Leg
      { a: 10, b: 11, len: dist(10, 11), width: 3.0 }, // L Thigh
      { a: 11, b: 12, len: dist(11, 12), width: 2.4 }, // L Shin
      // Right Leg
      { a: 13, b: 14, len: dist(13, 14), width: 3.0 }, // R Thigh
      { a: 14, b: 15, len: dist(14, 15), width: 2.4 }, // R Shin
    ];

    // Impaled spear sticks in the body part and falls with the ragdoll!
    const spearAngle = s.spear ? s.spear.angle : Math.atan2(vy, vx);
    const impaledSpear: ImpaledSpear = {
      nodeIdx: closestNode,
      offsetX: hitX - nodes[closestNode].x,
      offsetY: hitY - nodes[closestNode].y,
      angle: spearAngle,
    };

    s.ragdoll = { active: true, nodes, bones, spear: impaledSpear };
  };

  const explodeApple = (ax: number, ay: number, vx: number, vy: number) => {
    const s = sim.current;
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 220;
      s.particles.push({
        x: ax,
        y: ay,
        vx: vx * 0.35 + Math.cos(angle) * speed,
        vy: vy * 0.35 + Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? "#e14c38" : Math.random() > 0.5 ? "#fbf7ee" : "#89b36a",
        size: 2.5 + Math.random() * 3.5,
        alpha: 1,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 12,
      });
    }
  };

  const burstDirt = (x: number, y: number) => {
    const s = sim.current;
    for (let i = 0; i < 14; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const speed = 40 + Math.random() * 120;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? "#587349" : "#b3a890",
        size: 2 + Math.random() * 2.5,
        alpha: 1,
        rotation: 0,
        vRot: 0,
      });
    }
  };

  const fireSpear = (angle: number, power: number) => {
    const s = sim.current;
    if (s.status !== "aiming") return;

    const speed = 320 + (power / 100) * 440;
    const vx = Math.cos(angle) * speed;
    const vy = -Math.sin(angle) * speed;

    const startX = s.player.x + 14;
    const startY = s.player.y - 38;

    s.spear = {
      active: true,
      x: startX,
      y: startY,
      vx,
      vy,
      angle,
      stuck: false,
    };

    s.player.throwPhase = 1;
    s.status = "flight";
    sounds.throw();
  };

  // 60/120fps Main Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const s = sim.current;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(targetW / W, targetH / H);

      // Camera shake decay
      if (s.shake > 0) {
        const sx = (Math.random() - 0.5) * s.shake * 8;
        const sy = (Math.random() - 0.5) * s.shake * 8;
        ctx.translate(sx, sy);
        s.shake = Math.max(0, s.shake - dt * 2.5);
      }

      // ─── 1. SIMULATION UPDATES ───

      // Player throw follow-through
      if (s.player.throwPhase > 0) {
        s.player.throwPhase += dt * 4;
        if (s.player.throwPhase > 1.5) s.player.throwPhase = 0;
      }

      // Spear flight physics
      if (s.spear && s.spear.active && !s.spear.stuck) {
        const subSteps = 4;
        const subDt = dt / subSteps;

        for (let step = 0; step < subSteps; step++) {
          s.spear.vy += GRAVITY * subDt;
          s.spear.vx += s.wind * subDt;
          s.spear.x += s.spear.vx * subDt;
          s.spear.y += s.spear.vy * subDt;

          s.spear.angle = Math.atan2(s.spear.vy, s.spear.vx);

          const tipX = s.spear.x;
          const tipY = s.spear.y;

          // A. Apple Collision
          if (!s.target.appleHit && !s.target.bodyHit) {
            const ax = s.target.x;
            const ay = s.target.appleY;
            const distApple = Math.hypot(tipX - ax, tipY - ay);

            if (distApple <= 14) {
              s.target.appleHit = true;
              s.spear.active = false;
              s.shake = 0.8;
              sounds.appleHit();
              sounds.victory();
              explodeApple(ax, ay, s.spear.vx, s.spear.vy);

              s.status = "success";
              setScore((sc) => sc + 100);
              setStreak((st) => {
                const n = st + 1;
                setBestStreak((b) => {
                  const nb = Math.max(b, n);
                  try {
                    localStorage.setItem("sushant_apple_destiny_best", String(nb));
                  } catch {}
                  return nb;
                });
                return n;
              });

              const praises = ["BULLSEYE!", "LEGENDARY!", "WILLIAM TELL!", "CRISP SHOT!", "SURGICAL!"];
              const chosenPraise = praises[Math.floor(Math.random() * praises.length)];
              if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
              feedbackTimerRef.current = window.setTimeout(() => {
                setFeedback({
                  text: chosenPraise,
                  sub: "Apple destroyed! Target safe and sound.",
                  success: true,
                });
              }, 400);
              break;
            }
          }

          // B. Target Body Collision -> triggers Anatomical Human Ragdoll
          if (!s.target.bodyHit && !s.target.appleHit) {
            const tx = s.target.x;
            const ty = s.target.y;
            const headY = ty - 56;

            const distHead = Math.hypot(tipX - tx, tipY - headY);
            const inBodyX = Math.abs(tipX - tx) < 16;
            const inBodyY = tipY >= headY + 8 && tipY <= ty + 4;

            if (distHead < 11 || (inBodyX && inBodyY)) {
              s.target.bodyHit = true;
              s.spear.active = false;
              s.shake = 1.0;
              sounds.bodyHit();
              createAnatomicalRagdoll(tipX, tipY, s.spear.vx, s.spear.vy);

              // Apple loses its balance and falls directly to the ground!
              s.apple = {
                x: s.target.x,
                y: s.target.appleY,
                vx: (Math.random() - 0.5) * 16 + s.spear.vx * 0.04,
                vy: -15, // small pop off the head
                rotation: 0,
                vRot: (Math.random() - 0.5) * 5,
                falling: true,
                grounded: false,
              };

              s.status = "fail";
              setStreak(0);
              const fails = ["OUCH!", "TOO LOW!", "NOT THE STEVE!", "MEDIC!", "HE HAD A FAMILY!"];
              const chosenFail = fails[Math.floor(Math.random() * fails.length)];

              // Give player time to enjoy the ragdoll tumbling AND the apple falling and rolling to the ground
              if (feedbackTimerRef.current !== null) clearTimeout(feedbackTimerRef.current);
              feedbackTimerRef.current = window.setTimeout(() => {
                setFeedback({
                  text: chosenFail,
                  sub: "You struck the stickman instead of the apple!",
                  success: false,
                });
              }, 1100);
              break;
            }
          }

          // C. Terrain Collision
          const clampedX = Math.max(0, Math.min(W - 1, Math.floor(tipX)));
          const groundY = s.terrain[clampedX] ?? H - 90;

          if (tipY >= groundY) {
            s.spear.stuck = true;
            s.spear.y = groundY + 4;
            s.shake = 0.3;
            sounds.groundHit();
            burstDirt(tipX, groundY);

            if (!s.target.appleHit && !s.target.bodyHit) {
              // Missed shot: DO NOT RESTART! CONTINUE!
              s.stuckSpears.push({ x: tipX, y: groundY + 4, angle: s.spear.angle });
              s.spear = null;
              setStreak(0);

              // Seamlessly allow player to aim and throw another spear
              setTimeout(() => {
                if (sim.current.status === "flight") {
                  sim.current.status = "aiming";
                  sim.current.player.throwPhase = 0;
                }
              }, 200);
            }
            break;
          }

          if (tipX > W + 80 || tipY > H + 80 || tipX < -80) {
            s.spear.active = false;
            s.spear = null;
            if (!s.target.appleHit && !s.target.bodyHit) {
              // Out of bounds: DO NOT RESTART! CONTINUE!
              setStreak(0);
              setTimeout(() => {
                if (sim.current.status === "flight") {
                  sim.current.status = "aiming";
                  sim.current.player.throwPhase = 0;
                }
              }, 150);
            }
            break;
          }
        }
      }

      // Anatomical Human Ragdoll Physics Simulation (Verlet + Human Skeletal Constraints)
      if (s.ragdoll && s.ragdoll.active) {
        const rag = s.ragdoll;
        const rDt = Math.min(0.02, dt);

        // 1. Verlet Integration on all skeletal joints
        rag.nodes.forEach((n) => {
          const vx = (n.x - n.oldX) * 0.985;
          const vy = (n.y - n.oldY) * 0.985 + GRAVITY * rDt * rDt;
          n.oldX = n.x;
          n.oldY = n.y;
          n.x += vx;
          n.y += vy;

          // Terrain collision & ground friction
          const cx = Math.max(0, Math.min(W - 1, Math.floor(n.x)));
          const gy = (s.terrain[cx] ?? H - 90) - n.radius;
          if (n.y > gy) {
            n.y = gy;
            n.oldX = n.x + (n.oldX - n.x) * 0.68; // realistic ground sliding friction
            n.oldY = n.y - (n.y - n.oldY) * 0.2; // soft ground absorption
          }
        });

        // 2. Bone relaxation (8 iterations for rigid human skeletal stability)
        for (let pass = 0; pass < 8; pass++) {
          rag.bones.forEach((b) => {
            if (b.width <= 0.5) return; // skip invisible braces
            const na = rag.nodes[b.a];
            const nb = rag.nodes[b.b];
            const dx = nb.x - na.x;
            const dy = nb.y - na.y;
            const currentDist = Math.hypot(dx, dy) || 1;
            const diff = (currentDist - b.len) / currentDist;
            const totalMass = na.mass + nb.mass;
            const factorA = nb.mass / totalMass;
            const factorB = na.mass / totalMass;

            na.x += dx * factorA * diff;
            na.y += dy * factorA * diff;
            nb.x -= dx * factorB * diff;
            nb.y -= dy * factorB * diff;
          });
        }
      }

      // Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.vy += GRAVITY * 0.5 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rotation += p.vRot * dt;
        p.alpha -= dt * 0.95;

        const cx = Math.max(0, Math.min(W - 1, Math.floor(p.x)));
        const gy = s.terrain[cx] ?? H - 90;
        if (p.y >= gy) {
          p.y = gy;
          p.vy = -p.vy * 0.35;
          p.vx *= 0.65;
        }

        if (p.alpha <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Update Distorted "M" Cloud and Ambient Clouds (synchronized sky drift)
      const cloudVx = s.mCloud ? s.mCloud.vx : 2.4;
      if (s.mCloud) {
        s.mCloud.x += cloudVx * dt;
        if (s.mCloud.x > W + 90) s.mCloud.x = -90;
      }
      s.ambientClouds.forEach((ac) => {
        ac.x += cloudVx * dt;
        if (ac.x > W + 90) ac.x = -90;
      });

      // Update Falling Apple Physics (when stickman is hit, apple falls directly to ground)
      if (s.apple && s.apple.falling) {
        s.apple.vy += GRAVITY * dt;
        s.apple.x += s.apple.vx * dt;
        s.apple.y += s.apple.vy * dt;
        s.apple.rotation += s.apple.vRot * dt;

        const cx = Math.max(0, Math.min(W - 1, Math.floor(s.apple.x)));
        const gy = (s.terrain[cx] ?? H - 90) - 7;
        if (s.apple.y >= gy) {
          s.apple.y = gy;
          if (Math.abs(s.apple.vy) > 35) {
            sounds.appleBounce();
            s.apple.vy = -s.apple.vy * 0.35;
            s.apple.vx *= 0.72;
            s.apple.vRot *= 0.65;
          } else {
            s.apple.vy = 0;
            s.apple.vx *= 0.88;
            s.apple.vRot *= 0.88;
            s.apple.grounded = true;
          }
        }
      }

      // ─── 2. RENDERING ───

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#ece4f7");
      skyGrad.addColorStop(0.55, "#f6f0e3");
      skyGrad.addColorStop(1, "#ecd896");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Ambient Clouds in the sky (with clear gap to keep M-cloud distinct)
      s.ambientClouds.forEach((ac) => {
        drawAmbientCloud(ctx, ac, now);
      });

      // Distorted "M" Cloud in the Sky (alive, non-static, with clear spacing from other clouds!)
      if (s.mCloud) {
        drawDistortedMCloud(ctx, s.mCloud, now);
      }

      // Distant rolling mountain silhouette (Parallax background)
      ctx.fillStyle = "rgba(189,182,217,0.35)";
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 30) {
        const my = H - 170 + Math.sin(x * 0.005 + 1.2) * 35 + Math.cos(x * 0.012) * 15;
        ctx.lineTo(x, my);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();

      // Main Procedural Terrain Surface
      if (s.terrain.length > 0) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x < W; x += 4) {
          ctx.lineTo(x, s.terrain[x]);
        }
        ctx.lineTo(W, s.terrain[W - 1]);
        ctx.lineTo(W, H);
        ctx.closePath();

        const earthGrad = ctx.createLinearGradient(0, H - 140, 0, H);
        earthGrad.addColorStop(0, "#9ab384");
        earthGrad.addColorStop(0.12, "#7d9766");
        earthGrad.addColorStop(0.35, "#c8beaa");
        earthGrad.addColorStop(1, "#9e9480");
        ctx.fillStyle = earthGrad;
        ctx.fill();

        ctx.strokeStyle = "#4a633c";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Terrain props
        s.props.forEach((prop) => {
          if (prop.type === "grass") {
            ctx.strokeStyle = prop.color;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(prop.x, prop.y);
            ctx.quadraticCurveTo(prop.x - 3, prop.y - prop.height, prop.x - 5, prop.y - prop.height);
            ctx.moveTo(prop.x, prop.y);
            ctx.quadraticCurveTo(prop.x + 3, prop.y - prop.height * 1.1, prop.x + 4, prop.y - prop.height * 1.1);
            ctx.stroke();
          } else if (prop.type === "stone") {
            ctx.fillStyle = prop.color;
            ctx.beginPath();
            ctx.ellipse(prop.x, prop.y, prop.height * 1.4, prop.height * 0.8, 0, 0, Math.PI * 2);
            ctx.fill();
          } else if (prop.type === "flower") {
            ctx.strokeStyle = "#587349";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(prop.x, prop.y);
            ctx.lineTo(prop.x, prop.y - prop.height);
            ctx.stroke();
            ctx.fillStyle = prop.color;
            ctx.beginPath();
            ctx.arc(prop.x, prop.y - prop.height, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // ─── 3. DRAW CHARACTERS ───

      // A. PLAYER STICKMAN (Left)
      const px = s.player.x;
      const py = s.player.y;

      ctx.strokeStyle = "#2a2831";
      ctx.fillStyle = "#2a2831";
      ctx.lineWidth = 2.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      let leanX = 0;
      let handAngle = 0.4;
      if (s.isAiming && s.aimStart && s.aimCurrent) {
        const dx = s.aimStart.x - s.aimCurrent.x;
        const dy = s.aimStart.y - s.aimCurrent.y;
        const pwr = Math.min(100, Math.hypot(dx, dy) / 1.5);
        leanX = -(pwr / 100) * 12;
        handAngle = Math.atan2(-dy, dx);
      }

      // Legs
      ctx.beginPath();
      ctx.moveTo(px + leanX * 0.5, py - 20);
      ctx.lineTo(px - 10, py);
      ctx.moveTo(px + leanX * 0.5, py - 20);
      ctx.lineTo(px + 10, py);
      ctx.stroke();

      // Torso & Neck
      ctx.beginPath();
      ctx.moveTo(px + leanX * 0.5, py - 20);
      ctx.lineTo(px + leanX, py - 42);
      ctx.stroke();

      // Head
      ctx.beginPath();
      ctx.arc(px + leanX * 1.1, py - 52, 9, 0, Math.PI * 2);
      ctx.fill();

      // Arms & Spear in hand
      if (s.status === "aiming" || s.player.throwPhase > 0) {
        const neckX = px + leanX;
        const neckY = py - 42;

        if (s.player.throwPhase > 0) {
          ctx.beginPath();
          ctx.moveTo(neckX, neckY);
          ctx.lineTo(neckX + 16, neckY - 6);
          ctx.lineTo(neckX + 26, neckY + 2);
          ctx.stroke();
        } else if (s.isAiming) {
          const armBackX = neckX - Math.cos(handAngle) * 16;
          const armBackY = neckY - Math.sin(handAngle) * 16;
          ctx.beginPath();
          ctx.moveTo(neckX, neckY);
          ctx.lineTo(armBackX, armBackY);
          ctx.stroke();

          // Render sharp spear ready in hand
          const spearTipX = armBackX + Math.cos(handAngle) * 36;
          const spearTipY = armBackY + Math.sin(handAngle) * 36;
          drawSharpSpear(ctx, spearTipX, spearTipY, handAngle, 48);
        } else {
          ctx.beginPath();
          ctx.moveTo(neckX, neckY);
          ctx.lineTo(neckX + 10, neckY + 12);
          ctx.stroke();

          // Held vertically
          drawSharpSpear(ctx, neckX + 10, py - 58, -Math.PI / 2, 48);
        }
      }

      // B. TARGET STICKMAN (Right)
      const tx = s.target.x;
      const ty = s.target.y;

      if (!s.ragdoll) {
        // Natural standing anatomical skeleton before impact
        ctx.strokeStyle = "#2a2831";
        ctx.fillStyle = "#2a2831";
        ctx.lineWidth = 2.8;

        // Legs (Femur + Tibia with slight knee flex)
        ctx.beginPath();
        ctx.moveTo(tx - 6, ty - 21); // L Hip
        ctx.lineTo(tx - 8, ty - 10); // L Knee
        ctx.lineTo(tx - 9, ty); // L Foot
        ctx.moveTo(tx + 6, ty - 21); // R Hip
        ctx.lineTo(tx + 8, ty - 10); // R Knee
        ctx.lineTo(tx + 9, ty); // R Foot
        ctx.stroke();

        // Pelvis & Spine
        ctx.beginPath();
        ctx.moveTo(tx - 6, ty - 21);
        ctx.lineTo(tx + 6, ty - 21); // Hips bar
        ctx.moveTo(tx, ty - 21);
        ctx.lineTo(tx, ty - 34); // Lower spine
        ctx.lineTo(tx, ty - 47); // Upper spine / Neck
        ctx.stroke();

        // Clavicle & Arms
        ctx.beginPath();
        ctx.moveTo(tx - 9, ty - 45);
        ctx.lineTo(tx + 9, ty - 45); // Shoulders
        ctx.moveTo(tx - 9, ty - 45);
        ctx.lineTo(tx - 13, ty - 32); // L Bicep
        ctx.lineTo(tx - 16, ty - 20); // L Forearm
        ctx.moveTo(tx + 9, ty - 45);
        ctx.lineTo(tx + 13, ty - 32); // R Bicep
        ctx.lineTo(tx + 16, ty - 20); // R Forearm
        ctx.stroke();

        // Head
        ctx.beginPath();
        ctx.arc(tx, ty - 57, 9, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (blinking / nervous)
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(tx - 3, ty - 58, 1.6, 0, Math.PI * 2);
        ctx.arc(tx + 3, ty - 58, 1.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // DRAW FULL ANATOMICAL BONE RAGDOLL
        const rag = s.ragdoll;
        ctx.strokeStyle = "#2a2831";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // Render each bone according to anatomical width
        rag.bones.forEach((b) => {
          if (b.width <= 0.5) return;
          const na = rag.nodes[b.a];
          const nb = rag.nodes[b.b];
          ctx.lineWidth = b.width;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        });

        // Joint nodes (subtle anatomical joints)
        ctx.fillStyle = "#2a2831";
        [2, 3, 4, 5, 6, 8, 10, 11, 13, 14].forEach((idx) => {
          const n = rag.nodes[idx];
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 0.7, 0, Math.PI * 2);
          ctx.fill();
        });

        // Head with crossed dizzy eyes
        const head = rag.nodes[0];
        ctx.fillStyle = "#2a2831";
        ctx.beginPath();
        ctx.arc(head.x, head.y, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(head.x - 5, head.y - 2);
        ctx.lineTo(head.x - 1, head.y + 2);
        ctx.moveTo(head.x - 1, head.y - 2);
        ctx.lineTo(head.x - 5, head.y + 2);
        ctx.moveTo(head.x + 1, head.y - 2);
        ctx.lineTo(head.x + 5, head.y + 2);
        ctx.moveTo(head.x + 5, head.y - 2);
        ctx.lineTo(head.x + 1, head.y + 2);
        ctx.stroke();

        // Impaled spear moves and rotates with the ragdoll bone!
        if (rag.spear) {
          const impNode = rag.nodes[rag.spear.nodeIdx];
          const spTipX = impNode.x + rag.spear.offsetX;
          const spTipY = impNode.y + rag.spear.offsetY;
          drawSharpSpear(ctx, spTipX, spTipY, rag.spear.angle, 48);
        }
      }

      // C. THE APPLE OF DESTINY
      if (!s.target.appleHit) {
        if (s.apple && s.apple.falling) {
          drawApple(ctx, s.apple.x, s.apple.y, s.apple.rotation);
        } else if (!s.target.bodyHit) {
          drawApple(ctx, tx, s.target.appleY, 0);
        }
      }

      // D. PREVIOUS STUCK SPEARS IN TERRAIN (missed shots remain lodged in the dirt)
      s.stuckSpears.forEach((stuck) => {
        drawSharpSpear(ctx, stuck.x, stuck.y, stuck.angle, 48);
      });

      // E. FLYING / CURRENT EMBEDDED SPEAR
      if (s.spear && !s.ragdoll?.spear) {
        drawSharpSpear(ctx, s.spear.x, s.spear.y, s.spear.angle, 48);
      }

      // E. PARTICLES
      s.particles.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // F. SHORTENED / LIMITED TRAJECTORY LINE (Skill-based guide, not a full-screen cheatcode!)
      if (s.isAiming && s.aimStart && s.aimCurrent) {
        const dx = s.aimStart.x - s.aimCurrent.x;
        const dy = s.aimStart.y - s.aimCurrent.y;
        const pwr = Math.min(100, Math.hypot(dx, dy) / 1.5);
        const ang = Math.atan2(-dy, dx);

        if (pwr > 6) {
          const speed = 320 + (pwr / 100) * 440;
          let simX = px + 14;
          let simY = py - 38;
          let simVx = Math.cos(ang) * speed;
          let simVy = -Math.sin(ang) * speed;
          const arcDt = 0.035;

          // Shortened guide arc: only 7 short dots (~70px length) to guide initial launch angle
          const maxGuideSteps = 7;
          for (let step = 0; step < maxGuideSteps; step++) {
            simVy += GRAVITY * arcDt;
            simVx += s.wind * arcDt;
            simX += simVx * arcDt;
            simY += simVy * arcDt;

            const alpha = 0.65 * (1 - step / maxGuideSteps);
            ctx.fillStyle = `rgba(42, 40, 49, ${alpha})`;
            ctx.beginPath();
            ctx.arc(simX, simY, Math.max(1.4, 2.8 - step * 0.2), 0, Math.PI * 2);
            ctx.fill();

            const cx = Math.max(0, Math.min(W - 1, Math.floor(simX)));
            if (simY >= (s.terrain[cx] ?? H)) break;
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      if (feedbackTimerRef.current !== null) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, []);

  // ─── POINTER / TOUCH DRAG CONTROLS ───
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    return { x, y };
  };

  const restartRound = useCallback(() => {
    if (feedbackTimerRef.current !== null) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setFeedback(null);
    setAimInfo(null);
    buildTerrain();
  }, [buildTerrain]);

  // Keyboard shortcut to restart/retry on terminal result
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (feedback || sim.current.status === "fail" || sim.current.status === "success") {
          restartRound();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, restartRound]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = sim.current;
    // Tap anywhere to restart if round ended in fail or success
    if (feedback || s.status === "fail" || s.status === "success") {
      restartRound();
      return;
    }
    if (s.status !== "aiming") return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pt = getCanvasCoords(e);
    s.isAiming = true;
    s.aimStart = pt;
    s.aimCurrent = pt;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = sim.current;
    if (!s.isAiming || !s.aimStart) return;

    const pt = getCanvasCoords(e);
    s.aimCurrent = pt;

    const dx = s.aimStart.x - pt.x;
    const dy = s.aimStart.y - pt.y;
    const pwr = Math.min(100, Math.round(Math.hypot(dx, dy) / 1.5));
    const ang = Math.round((Math.atan2(-dy, dx) * 180) / Math.PI);

    setAimInfo({ angle: ang, power: pwr });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = sim.current;
    if (!s.isAiming || !s.aimStart || !s.aimCurrent) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const dx = s.aimStart.x - s.aimCurrent.x;
    const dy = s.aimStart.y - s.aimCurrent.y;
    const pwr = Math.min(100, Math.hypot(dx, dy) / 1.5);
    const ang = Math.atan2(-dy, dx);

    s.isAiming = false;
    s.aimStart = null;
    s.aimCurrent = null;
    setAimInfo(null);

    if (pwr > 8) {
      fireSpear(ang, pwr);
    }
  };

  const targetDistanceMeters = Math.round((sim.current.target.x - sim.current.player.x) / 7);

  return (
    <div className="w-full flex flex-col items-center select-none font-sans">
      {/* Arcade Header HUD: Ultra-compact, single-line on mobile to maximize canvas height */}
      {/* Mobile Bar (< sm): Strict 1-row, beautifully organized layout maximizing canvas height */}
      <div className="w-full flex items-center justify-between gap-1 mb-1.5 px-0.5 sm:hidden text-xs">
        {/* Left: Distance & Wind in tight chips */}
        <div className="flex items-center gap-1 min-w-0">
          <span className="chip !text-[0.62rem] !py-0.5 !px-1.5 font-mono bg-lav/30 border border-lav-deep/20 font-bold shrink-0">
            🎯 {targetDistanceMeters}m
          </span>
          <div
            className="chip !text-[0.62rem] !py-0.5 !px-1.5 font-mono bg-butter/30 border border-butter-deep/20 font-bold shrink-0"
            title="Crosswind velocity"
          >
            💨 {windDisplay > 0 ? `▶${windDisplay}` : windDisplay < 0 ? `◀${Math.abs(windDisplay)}` : "CALM"}
          </div>
        </div>

        {/* Center: Streak & Score */}
        <div className="flex items-center gap-1 font-mono text-[0.68rem] font-bold text-ink shrink-0">
          <span className="text-lav-deep">{streak}🔥</span>
          <span className="opacity-30">|</span>
          <span className="text-sage-deep">{score}★</span>
        </div>

        {/* Right: Sound & New Range */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleSound}
            className="key !p-1 text-xs leading-none"
            title={soundOn ? "Mute" : "Unmute"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>
          <button
            onClick={restartRound}
            className="key !py-1 !px-2 text-[0.68rem] font-bold flex items-center gap-0.5 leading-none"
            title="Generate new landscape"
          >
            <span>↻</span>
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Desktop / Tablet Header (>= sm) */}
      <div className="w-full hidden sm:flex items-center justify-between gap-2.5 mb-2.5 px-1 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-base sm:text-lg text-ink tracking-tight flex items-center gap-1.5">
            <span>🎯</span> Apple of Destiny
          </span>
          <span className="chip !text-[0.68rem] !py-0.5 !px-2 font-mono bg-lav/30 border border-lav-deep/20 font-bold">
            Distance: {targetDistanceMeters}m
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wind indicator */}
          <div
            className="flex items-center gap-1 font-mono text-xs px-2.5 py-1 rounded-lg well"
            title="Current crosswind velocity"
          >
            <span className="text-[0.7rem] text-ink-soft">WIND</span>
            <span className="font-bold">
              {windDisplay > 0 ? `▶ ${windDisplay}` : windDisplay < 0 ? `◀ ${Math.abs(windDisplay)}` : "CALM"}
            </span>
          </div>

          {/* Streak & Score */}
          <div className="flex items-center gap-1 font-mono text-xs font-bold text-ink">
            <span className="text-lav-deep">STREAK: {streak}</span>
            <span className="opacity-40">|</span>
            <span className="text-sage-deep">SCORE: {score}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="key !px-2 !py-1 text-xs"
            title={soundOn ? "Mute Game Sound" : "Enable Game Sound"}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>

          {/* Next / Reset Round */}
          <button
            onClick={restartRound}
            className="key !px-3 !py-1 text-xs font-bold flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
          >
            <span>↻</span>
            <span>New Range</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Screen Frame */}
      <div className="relative w-full aspect-[800/460] rounded-2xl overflow-hidden border-2 border-white/70 shadow-lg cursor-crosshair bg-[#ece7f7] touch-none">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block"
        />

        {/* Live Aiming HUD overlay during drag */}
        {aimInfo && (
          <div className="absolute top-3 left-3 pointer-events-none bg-ink/75 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3 shadow-md">
            <span>
              ANGLE: <strong className="text-butter">{aimInfo.angle}°</strong>
            </span>
            <span>
              POWER: <strong className="text-sage">{aimInfo.power}%</strong>
            </span>
          </div>
        )}

        {/* Floating Non-Obstructive Arcade Result Pill Banner - NO screen blur, NO background dimming, 100% crystal clear */}
        {feedback && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[94%] sm:max-w-md w-full px-2">
            <div
              className={`paper !rounded-xl px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 shadow-xl border-2 transform animate-in slide-in-from-top-3 duration-200 ${
                feedback.success
                  ? "border-sage-deep/60 ring-2 ring-sage/30 bg-[#f7fbf3]"
                  : "border-peach-deep/60 ring-2 ring-peach/30 bg-[#fff5f2]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">
                  {feedback.success ? "🍎✨" : "💀🩹"}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-xs sm:text-sm font-bold text-ink leading-tight truncate">
                    {feedback.text}
                  </div>
                  <div className="text-[0.68rem] sm:text-xs text-ink-soft truncate">
                    {feedback.sub}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restartRound();
                }}
                className={`key !py-1 !px-3 sm:!py-1.5 sm:!px-3.5 text-xs font-bold shrink-0 shadow-sm ${
                  feedback.success ? "key-sage" : "key-peach"
                } hover:scale-105 active:scale-95 transition-transform`}
              >
                {feedback.success ? "Next Apple ➔" : "Retry Shot ↻"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tactile Bottom Controls Bar */}
      <div className="w-full mt-1.5 sm:mt-2.5 flex items-center justify-between sm:justify-end px-1 text-[0.68rem] sm:text-xs text-ink-soft">
        <span className="sm:hidden font-mono text-[0.65rem] text-ink-soft/80">🏹 Pull back to aim · release</span>
        <div className="font-mono text-[0.68rem] sm:text-xs font-bold text-ink">
          RECORD: <span className="text-lav-deep">{bestStreak} STREAK</span>
        </div>
      </div>
    </div>
  );
}
