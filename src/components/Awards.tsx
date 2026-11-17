import { useEffect, useRef, type PointerEvent } from "react";
import { ACHIEVEMENTS } from "../data/profile";
import { revealAll, useScrollScope } from "../lib/motion";
import { SectionHead } from "./Iso";

function Trophy({ kind, tone, glyph }: { kind: string; tone: string; glyph: string }) {
  return (
    <svg viewBox="0 0 120 150" className="w-20 h-24 mx-auto drop-shadow-[0_8px_6px_rgba(42,40,49,.25)]" aria-hidden>
      <defs>
        <radialGradient id={`g-${kind}-${glyph}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset=".6" stopColor={tone} />
          <stop offset="1" stopColor={tone} />
        </radialGradient>
      </defs>
      {kind === "ribbon" && (
        <>
          <path d="M42 70 L30 140 L52 126 L60 148 L66 78Z" fill={tone} stroke="#2a2831" strokeWidth="2" />
          <path d="M78 70 L90 140 L68 126 L60 148 L54 78Z" fill={tone} stroke="#2a2831" strokeWidth="2" opacity=".85" />
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx="60" cy="42" rx="9" ry="22" fill={tone} stroke="#2a2831" strokeWidth="1.5" transform={`rotate(${i * 30} 60 42)`} />
          ))}
        </>
      )}
      {kind === "badge" && (
        <path d="M60 8 L104 30 V76 C104 104 84 124 60 140 C36 124 16 104 16 76 V30Z" fill={`url(#g-${kind}-${glyph})`} stroke="#2a2831" strokeWidth="3" />
      )}
      <circle cx="60" cy={42} r={24} fill={`url(#g-${kind}-${glyph})`} stroke="#2a2831" strokeWidth="3" />
      <text x="60" y={51} textAnchor="middle" fontSize={26}>
        {glyph}
      </text>
    </svg>
  );
}

const GLYPH: Record<string, string> = { hw: "★", cm: "★", wh: "🎮" };

export function Awards() {
  const root = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const leftStringRefs = useRef<(SVGLineElement | null)[]>([]);
  const rightStringRefs = useRef<(SVGLineElement | null)[]>([]);

  // Independent physics state for each hanging award
  const physicsRef = useRef(
    ACHIEVEMENTS.map(() => ({
      angle: 0,
      vel: 0,
      dx: 0,
      dy: 0,
    }))
  );

  useScrollScope(root, ({ root }) => {
    revealAll(root, "[data-reveal]");
  });

  // Optimized physics simulation: Only ticks when section is visible in viewport and active
  useEffect(() => {
    let animId = 0;
    let lastTime = performance.now();
    let isVisible = false;
    let isRunning = false;

    const gravity = 130;
    const ropeLength = 60;
    const damping = 0.96;

    // Cache dimensions to eliminate forced synchronous layout (layout thrashing) during animation
    const cachedDims: { colCenter: number; spread: number }[] = [];

    const measureDims = () => {
      colRefs.current.forEach((col, i) => {
        const card = cardRefs.current[i];
        const colW = col?.clientWidth || 300;
        const cardW = card?.clientWidth || 250;
        cachedDims[i] = {
          colCenter: colW / 2,
          spread: (cardW - 64) / 2,
        };
      });
    };

    window.addEventListener("resize", measureDims, { passive: true });
    measureDims();

    const loop = (now: number) => {
      if (!isVisible) {
        isRunning = false;
        return;
      }

      const dt = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      const physics = physicsRef.current;
      let hasMovement = false;

      physics.forEach((p, i) => {
        const accel = -(gravity / ropeLength) * Math.sin(p.angle);
        p.vel = (p.vel + accel * dt) * Math.pow(damping, dt * 60);
        p.angle += p.vel * dt;

        if (Math.abs(p.vel) > 0.0005 || Math.abs(p.angle) > 0.0005) {
          hasMovement = true;
        }

        p.dx = Math.sin(p.angle) * ropeLength;
        p.dy = (1 - Math.cos(p.angle)) * (ropeLength * 0.4);

        const card = cardRefs.current[i];
        const strLeft = leftStringRefs.current[i];
        const strRight = rightStringRefs.current[i];

        if (!card || !strLeft || !strRight) return;

        const dims = cachedDims[i] || { colCenter: 150, spread: 93 };
        const colCenter = dims.colCenter;
        const spread = dims.spread;
        const stringTopY = 8;
        const cardTopY = 64;

        const rad = p.angle;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const pLeftX = colCenter + p.dx - spread * cos;
        const pLeftY = cardTopY + p.dy - spread * sin;

        const pRightX = colCenter + p.dx + spread * cos;
        const pRightY = cardTopY + p.dy + spread * sin;

        strLeft.setAttribute("x1", `${colCenter - 14}`);
        strLeft.setAttribute("y1", `${stringTopY}`);
        strLeft.setAttribute("x2", `${pLeftX}`);
        strLeft.setAttribute("y2", `${pLeftY}`);

        strRight.setAttribute("x1", `${colCenter + 14}`);
        strRight.setAttribute("y1", `${stringTopY}`);
        strRight.setAttribute("x2", `${pRightX}`);
        strRight.setAttribute("y2", `${pRightY}`);

        const deg = (rad * 180) / Math.PI;
        card.style.transform = `translate3d(${p.dx}px, ${p.dy}px, 0) rotate(${deg}deg)`;
      });

      // If cards have practically come to rest, sleep the loop to save CPU
      if (hasMovement) {
        animId = requestAnimationFrame(loop);
      } else {
        isRunning = false;
      }
    };

    const wakeUp = () => {
      if (isVisible && !isRunning) {
        isRunning = true;
        lastTime = performance.now();
        animId = requestAnimationFrame(loop);
      }
    };

    // IntersectionObserver to pause entirely when scrolled away
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          measureDims();
          wakeUp();
        } else {
          isRunning = false;
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.1 }
    );

    if (root.current) {
      observer.observe(root.current);
    }

    // Scroll reaction only when visible
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      if (!isVisible) return;
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (Math.abs(delta) > 2) {
        physicsRef.current.forEach((p, i) => {
          const factor = i % 2 === 0 ? 0.0015 : -0.0012;
          p.vel += delta * factor;
        });
        wakeUp();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureDims);
    };
  }, []);

  // Tap or drag to swing card (subtle, no annoying coin sound)
  const handleCardPush = (index: number, e: PointerEvent) => {
    const p = physicsRef.current[index];
    if (!p) return;
    const pushDir = e.clientX % 2 === 0 ? 1 : -1;
    p.vel += pushDir * 0.2;
    // Wake up physics loop if sleeping
    const col = colRefs.current[index];
    if (col) {
      p.angle += pushDir * 0.05;
    }
  };

  return (
    <section ref={root} id="awards" aria-labelledby="awards-title" className="relative px-5 md:px-10 py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1100px]">
        <SectionHead
          num="05"
          label="Achievements"
          tone="var(--color-butter)"
          title={
            <span id="awards-title">
              Honors, Hackathons &amp; <em className="font-light text-lav-deep">Milestones.</em>
            </span>
          }
          kicker="Competitive hackathons, technical achievements, and milestones along my journey."
        />

        {/* Physics Shelf Stage */}
        <div ref={containerRef} className="relative mt-16 select-none">
          {/* Wooden / Brass Shelf Rail spanning the top */}
          <div
            aria-hidden
            className="h-5 rounded-full relative z-30 shadow-lg border border-black/20"
            style={{
              background: "linear-gradient(180deg, #d4be94 0%, #aa9368 50%, #7d6842 100%)",
              boxShadow: "0 10px 18px -4px rgba(42,40,49,.4), inset 0 2px 0 rgba(255,255,255,.5)",
            }}
          >
            {/* Brass brackets on the shelf */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
              <span className="w-3 h-3 rounded-full bg-[#3c301c] shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-[#3c301c] shadow-inner" />
              <span className="w-3 h-3 rounded-full bg-[#3c301c] shadow-inner" />
            </div>
          </div>

          {/* Hanging Cards Grid: Each award has its own self-contained suspension mount */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2 relative z-20">
            {ACHIEVEMENTS.map((a, i) => (
              <div
                key={a.id}
                ref={(el) => {
                  colRefs.current[i] = el;
                }}
                className="relative flex flex-col items-center min-h-[380px]"
              >
                {/* Brass hanging eyelet pin at top of column */}
                <div
                  aria-hidden
                  className="w-4 h-4 rounded-full bg-gradient-to-b from-[#e6c88b] to-[#8c703b] shadow-md border border-[#523e1b] z-20 -mt-1.5"
                />

                {/* SVG Suspension Strings: Mathematically locked to the card eyelets */}
                <svg
                  className="absolute inset-x-0 top-0 w-full h-[75px] overflow-visible pointer-events-none z-10"
                  aria-hidden
                >
                  <line
                    ref={(el) => {
                      leftStringRefs.current[i] = el;
                    }}
                    stroke="#5a4e3b"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <line
                    ref={(el) => {
                      rightStringRefs.current[i] = el;
                    }}
                    stroke="#5a4e3b"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                </svg>

                {/* Hanging Card */}
                <div
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  onPointerDown={(e) => handleCardPush(i, e)}
                  style={{
                    transformOrigin: "50% 0%",
                    willChange: "transform",
                    borderRadius: 22,
                  }}
                  className="w-full max-w-[270px] mt-[48px] paper p-5 text-center cursor-default border-2 border-ink/10 shadow-lg"
                >
                  {/* Hanging Eyelet Pins: Where strings attach */}
                  <div className="flex justify-between px-6 -mt-2.5 mb-2" aria-hidden>
                    <span className="w-3 h-3 rounded-full bg-ink/30 border-2 border-ink/60 shadow-inner" />
                    <span className="w-3 h-3 rounded-full bg-ink/30 border-2 border-ink/60 shadow-inner" />
                  </div>

                  <Trophy kind={a.kind} tone={a.tone} glyph={GLYPH[a.id]} />

                  <p className="eyebrow !text-[0.68rem] mt-3 font-bold text-ink-soft">
                    {a.where}
                  </p>
                  <h3 className="font-display text-[1.12rem] font-bold leading-tight mt-1 text-ink">
                    {a.title}
                  </h3>
                  <p className="chip mt-3 !text-[0.74rem] font-mono shadow-xs" style={{ ["--chip" as string]: a.tone }}>
                    {a.result}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
