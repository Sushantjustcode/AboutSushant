import { useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  index: number;
}

interface FallingPiece {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  borderColor: string;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
}

interface Toast {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

// Generate pleasing pastel colors matching portfolio palette
function getPastelColor(idx: number) {
  const hue = (idx * 22 + 250) % 360;
  return {
    fill: `hsl(${hue}, 68%, 74%)`,
    border: `hsl(${hue}, 52%, 58%)`,
    highlight: `hsl(${hue}, 80%, 88%)`,
  };
}

export function TowerStack() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem("sushant_stack_best") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });

  // State ref for 60fps loop
  const stateRef = useRef<{
    blocks: Block[];
    active: {
      x: number;
      y: number;
      width: number;
      height: number;
      speed: number;
      dir: number;
      color: string;
      borderColor: string;
    };
    falling: FallingPiece[];
    particles: Particle[];
    toasts: Toast[];
    cameraY: number;
    targetCameraY: number;
    score: number;
    combo: number;
    gameOver: boolean;
    blockHeight: number;
  }>({
    blocks: [],
    active: {
      x: 0,
      y: 0,
      width: 220,
      height: 32,
      speed: 260,
      dir: 1,
      color: "",
      borderColor: "",
    },
    falling: [],
    particles: [],
    toasts: [],
    cameraY: 0,
    targetCameraY: 0,
    score: 0,
    combo: 0,
    gameOver: false,
    blockHeight: 32,
  });

  // Initialize or restart the game
  const initGame = () => {
    const blockH = 32;
    const baseW = 220;
    const baseY = 380;
    const baseCol = getPastelColor(0);

    const baseBlock: Block = {
      x: 400 - baseW / 2,
      y: baseY,
      width: baseW,
      height: blockH,
      color: baseCol.fill,
      borderColor: baseCol.border,
      index: 1,
    };

    const nextCol = getPastelColor(1);

    stateRef.current = {
      blocks: [baseBlock],
      active: {
        x: 60,
        y: baseY - blockH,
        width: baseW,
        height: blockH,
        speed: 280,
        dir: 1,
        color: nextCol.fill,
        borderColor: nextCol.border,
      },
      falling: [],
      particles: [],
      toasts: [],
      cameraY: 0,
      targetCameraY: 0,
      score: 0,
      combo: 0,
      gameOver: false,
      blockHeight: blockH,
    };

    setScore(0);
    setCombo(0);
    setGameOver(false);
  };

  const spawnParticles = (x: number, y: number, width: number, col: string) => {
    for (let i = 0; i < 24; i++) {
      stateRef.current.particles.push({
        x: x + Math.random() * width,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: -Math.random() * 4 - 1.5,
        color: col,
        size: Math.random() * 4 + 2,
        alpha: 1,
      });
    }
  };

  // Place current active block
  const placeBlock = () => {
    const s = stateRef.current;
    if (s.gameOver) {
      initGame();
      sfx.click();
      return;
    }

    const prev = s.blocks[s.blocks.length - 1];
    const curr = s.active;

    const overlapX1 = Math.max(curr.x, prev.x);
    const overlapX2 = Math.min(curr.x + curr.width, prev.x + prev.width);
    const overlapWidth = overlapX2 - overlapX1;

    // Missed completely: Game Over!
    if (overlapWidth <= 0) {
      s.gameOver = true;
      setGameOver(true);
      sfx.bad();

      // Active block falls down completely
      s.falling.push({
        x: curr.x,
        y: curr.y,
        width: curr.width,
        height: curr.height,
        color: curr.color,
        borderColor: curr.borderColor,
        vx: curr.dir * 2.5,
        vy: -1.5,
        rot: 0,
        vRot: curr.dir * 0.08,
        alpha: 1,
      });

      return;
    }

    // Check for Perfect Placement (within 4 pixels)
    const diff = Math.abs(curr.x - prev.x);
    const isPerfect = diff <= 4;

    let finalX = overlapX1;
    let finalW = overlapWidth;

    if (isPerfect) {
      // Snap to exact width of previous block
      finalX = prev.x;
      finalW = prev.width;
      const nextCombo = s.combo + 1;
      s.combo = nextCombo;
      setCombo(nextCombo);

      // Reward: widen block slightly if combo streak >= 5
      if (nextCombo % 5 === 0 && finalW < 240) {
        finalW = Math.min(finalW + 12, 240);
        finalX = Math.max(finalX - 6, 20);
      }

      sfx.win();
      spawnParticles(finalX, curr.y, finalW, "#f59e0b");

      s.toasts.push({
        id: Date.now(),
        text: nextCombo > 1 ? `PERFECT x${nextCombo}! 🔥` : "PERFECT! ✨",
        x: 400,
        y: curr.y - 25,
        color: "#d97706",
        alpha: 1,
      });
    } else {
      // Imperfect: slice off overhang
      s.combo = 0;
      setCombo(0);
      sfx.thud();

      const isLeftOverhang = curr.x < prev.x;
      const sliceW = isLeftOverhang ? prev.x - curr.x : curr.x + curr.width - (prev.x + prev.width);
      const sliceX = isLeftOverhang ? curr.x : prev.x + prev.width;

      s.falling.push({
        x: sliceX,
        y: curr.y,
        width: sliceW,
        height: curr.height,
        color: curr.color,
        borderColor: curr.borderColor,
        vx: isLeftOverhang ? -3 : 3,
        vy: -1.5,
        rot: 0,
        vRot: isLeftOverhang ? -0.06 : 0.06,
        alpha: 1,
      });
    }

    // Add placed block to tower
    const nextScore = s.score + 1;
    s.score = nextScore;
    setScore(nextScore);

    if (nextScore > highScore) {
      setHighScore(nextScore);
      try {
        localStorage.setItem("sushant_stack_best", nextScore.toString());
      } catch {}
    }

    s.blocks.push({
      x: finalX,
      y: curr.y,
      width: finalW,
      height: curr.height,
      color: curr.color,
      borderColor: curr.borderColor,
      index: nextScore + 1,
    });

    // Camera follow: smoothly keep top block around screen center (y = 220)
    if (nextScore >= 5) {
      s.targetCameraY = (nextScore - 5) * s.blockHeight;
    }

    // Spawn next active moving block
    const nextCol = getPastelColor(nextScore + 1);
    const nextSpeed = Math.min(280 + nextScore * 4.5, 460); // progressive smooth speed up
    const startFromLeft = nextScore % 2 === 0;

    s.active = {
      x: startFromLeft ? 40 : 760 - finalW,
      y: curr.y - s.blockHeight,
      width: finalW,
      height: s.blockHeight,
      speed: nextSpeed,
      dir: startFromLeft ? 1 : -1,
      color: nextCol.fill,
      borderColor: nextCol.border,
    };
  };

  // Main 60fps Canvas Loop
  useEffect(() => {
    initGame();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 800;
    const H = 480;
    canvas.width = W;
    canvas.height = H;

    let animId = 0;
    let lastTime = performance.now();
    let isVisible = false;

    const loop = (now: number) => {
      if (!isVisible) return;
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      const s = stateRef.current;

      // 1. Move Active Block
      if (!s.gameOver) {
        s.active.x += s.active.dir * s.active.speed * dt;

        // Bounce on screen edges
        const minX = 20;
        const maxX = W - 20 - s.active.width;

        if (s.active.x <= minX) {
          s.active.x = minX;
          s.active.dir = 1;
        } else if (s.active.x >= maxX) {
          s.active.x = maxX;
          s.active.dir = -1;
        }
      }

      // 2. Camera Smooth Lerp
      s.cameraY += (s.targetCameraY - s.cameraY) * 0.1;

      // 3. Update Falling Slices
      for (let i = s.falling.length - 1; i >= 0; i--) {
        const f = s.falling[i];
        f.x += f.vx;
        f.y += f.vy;
        f.vy += 0.45; // gravity
        f.rot += f.vRot;
        if (f.y - s.cameraY > H + 100) {
          s.falling.splice(i, 1);
        }
      }

      // 4. Update Particles
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.alpha -= dt * 1.5;
        if (p.alpha <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // 5. Update Toasts
      for (let i = s.toasts.length - 1; i >= 0; i--) {
        const t = s.toasts[i];
        t.y -= dt * 40;
        t.alpha -= dt * 1.2;
        if (t.alpha <= 0) {
          s.toasts.splice(i, 1);
        }
      }

      // ================= RENDER =================
      ctx.clearRect(0, 0, W, H);

      // Pastel Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, "#ece7f7");
      skyGrad.addColorStop(0.5, "#f7f4fc");
      skyGrad.addColorStop(1, "#dfd8ee");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // Soft architectural grid lines
      ctx.strokeStyle = "rgba(189,182,217,0.18)";
      ctx.lineWidth = 1;
      for (let x = 40; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      ctx.save();
      // Apply Camera Offset
      ctx.translate(0, s.cameraY);

      // Draw Tower Base Platform
      const basePlatformY = 412;
      ctx.fillStyle = "#cfc7e4";
      ctx.fillRect(0, basePlatformY, W, 80);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fillRect(0, basePlatformY, W, 2);

      // Helper to draw a beveled pastel block
      const drawBlock = (b: { x: number; y: number; width: number; height: number; color: string; borderColor: string }, isMoving = false) => {
        // Drop shadow
        ctx.fillStyle = "rgba(42, 35, 60, 0.12)";
        ctx.beginPath();
        ctx.roundRect(b.x + 2, b.y + 4, b.width, b.height, 6);
        ctx.fill();

        // Block Body
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.fill();

        // Top glossy highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.beginPath();
        ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, b.height / 3, [4, 4, 1, 1]);
        ctx.fill();

        // Stroke Border
        ctx.strokeStyle = b.borderColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 6);
        ctx.stroke();

        // Subtle side edge
        if (isMoving) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x + 3, b.y + 3);
          ctx.lineTo(b.x + b.width - 3, b.y + 3);
          ctx.stroke();
        }
      };

      // Draw Placed Tower Blocks
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        // Only draw visible blocks
        if (b.y + s.cameraY > -60 && b.y + s.cameraY < H + 60) {
          drawBlock(b);

          // Block index stamp on first and milestone blocks
          if (b.index === 1 || b.index % 5 === 0) {
            ctx.fillStyle = "rgba(60, 50, 80, 0.4)";
            ctx.font = 'bold 11px "JetBrains Mono", monospace';
            ctx.textAlign = "center";
            ctx.fillText(`#${b.index}`, b.x + b.width / 2, b.y + b.height / 2 + 4);
          }
        }
      }

      // Draw Falling Slices
      for (let f of s.falling) {
        ctx.save();
        ctx.translate(f.x + f.width / 2, f.y + f.height / 2);
        ctx.rotate(f.rot);
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.roundRect(-f.width / 2, -f.height / 2, f.width, f.height, 4);
        ctx.fill();
        ctx.strokeStyle = f.borderColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // Draw Active Moving Block (if alive)
      if (!s.gameOver) {
        drawBlock(s.active, true);
      }

      // Draw Confetti Particles
      for (let p of s.particles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Draw Toast Prompts
      for (let t of s.toasts) {
        ctx.save();
        ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = t.color;
        ctx.globalAlpha = Math.max(t.alpha, 0);
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 8;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
      }

      ctx.restore(); // Restore camera translation

      // ================= HUD OVERLAY =================
      if (s.gameOver) {
        // Semi-transparent game over modal
        ctx.fillStyle = "rgba(42, 38, 55, 0.45)";
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(W / 2 - 170, H / 2 - 100, 340, 200, 24);
        ctx.fill();
        ctx.strokeStyle = "rgba(189,182,217,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = "#e11d48";
        ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillText("TOWER TOPPLED!", W / 2, H / 2 - 45);

        ctx.fillStyle = "#4a425f";
        ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(`Final Height: ${s.score} floors`, W / 2, H / 2 - 12);

        ctx.fillStyle = "#6b5c8a";
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillText(`All-Time Record: ${Math.max(s.score, highScore)}`, W / 2, H / 2 + 15);

        // Tap to restart prompt
        ctx.fillStyle = "#7c3aed";
        ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
        ctx.fillText("TAP OR PRESS SPACE TO RETRY ↻", W / 2, H / 2 + 65);
      }

      if (isVisible) {
        animId = requestAnimationFrame(loop);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextVisible = entry?.isIntersecting ?? false;
        if (nextVisible && !isVisible) {
          isVisible = true;
          lastTime = performance.now();
          animId = requestAnimationFrame(loop);
        } else if (!nextVisible && isVisible) {
          isVisible = false;
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(canvas);

    // Keyboard Space & Enter support (only when game is visible in view)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        placeBlock();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[780px] mx-auto">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between pb-3 text-ink">
        {/* Score & Streak Counters */}
        <div className="flex items-center gap-2">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl shadow-xs border border-white/60 flex items-center gap-4">
            <div>
              <span className="font-mono text-[0.62rem] text-lav-deep uppercase tracking-wider block font-semibold leading-none">Floors</span>
              <span className="font-display text-2xl font-bold text-ink leading-tight">{score}</span>
            </div>
            <div className="w-[1px] h-6 bg-lav-light" />
            <div>
              <span className="font-mono text-[0.62rem] text-lav-deep uppercase tracking-wider block font-semibold leading-none">Best</span>
              <span className="font-display text-2xl font-bold text-sage leading-tight">{highScore}</span>
            </div>
          </div>

          {combo > 1 && (
            <div className="bg-peach/25 border border-peach/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-pulse">
              <span className="text-sm">🔥</span>
              <span className="font-display text-sm font-bold text-peach-deep">COMBO x{combo}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            initGame();
            sfx.click();
          }}
          className="key !px-3 !py-1.5 text-xs font-semibold flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
        >
          <span>↻</span>
          <span>Restart</span>
        </button>
      </div>

      {/* Main Game Screen Canvas */}
      <div
        onClick={placeBlock}
        className="relative w-full aspect-[800/480] rounded-2xl overflow-hidden border-2 border-white/70 shadow-lg cursor-pointer bg-[#ece7f7]"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Dedicated Tactile Drop Button for Mobile & Mouse */}
      <div className="w-full mt-3 flex items-center justify-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            placeBlock();
          }}
          className="key w-full max-w-[340px] !py-3 !text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
          style={{ ["--tone" as string]: "var(--color-sage)" }}
        >
          <span className="text-base">⬒</span>
          <span>{gameOver ? "PLAY AGAIN" : "TAP TO DROP BLOCK"}</span>
        </button>
      </div>
    </div>
  );
}
