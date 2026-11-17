import { useEffect, useRef, useState } from "react";
import { CONTACT, PROFILE } from "../data/profile";
import { revealAll, useScrollScope, smoothScrollTo } from "../lib/motion";
import { downloadResume } from "../lib/resume";
import { sfx } from "../lib/sfx";
import { Magnetic } from "./Magnetic";

type Item = { id: string; label: string; action: string; href: string; icon: string; tone: string };

export function Contact() {
  const root = useRef<HTMLElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);

  // Football game states
  const [kicks, setKicks] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(() => {
    try {
      return parseInt(localStorage.getItem("sushant_football_best") || "0", 10) || 0;
    } catch {
      return 0;
    }
  });
  const [droppedAlert, setDroppedAlert] = useState(false);

  // Pure arcade physics state for 60fps rAF loop (NO CSS transition interference)
  const physics = useRef({
    y: 0,
    x: 0,
    vy: 0,
    vx: 0,
    rotation: 0,
    vRot: 0,
    inAir: false,
    animating: false,
  });

  useScrollScope(root, ({ root }) => {
    revealAll(root);
  });

  const items: Item[] = [
    {
      id: "email",
      label: "Email",
      action: "Send a direct message",
      href: CONTACT.email ? `mailto:${CONTACT.email}` : "mailto:sushant.dev@example.com",
      icon: "✉",
      tone: "var(--color-lav)",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      action: "Connect & network",
      href: CONTACT.linkedin || "https://linkedin.com",
      icon: "in",
      tone: "var(--color-blue)",
    },
    {
      id: "github",
      label: "GitHub",
      action: "Repositories & code",
      href: CONTACT.github || "https://github.com",
      icon: "</>",
      tone: "var(--color-sage)",
    },
  ];

  // Performant physics simulation: Only runs RAF loop while ball is in motion
  const rafId = useRef(0);

  const startLoop = () => {
    if (rafId.current) return;

    const gravity = 0.36;
    const bounce = 0.3;

    const step = () => {
      const p = physics.current;
      const el = ballRef.current;

      if (p.animating && el) {
        p.vy += gravity;
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vRot;
        p.vx *= 0.985;

        // Ground collision baseline
        if (p.y >= 0) {
          p.y = 0;
          if (p.inAir) {
            p.inAir = false;
            sfx.thud();
            setStreak((curr) => {
              if (curr > 0) {
                setDroppedAlert(true);
                setTimeout(() => setDroppedAlert(false), 1800);
              }
              return 0;
            });
          }

          // Gentle ground bounce
          if (Math.abs(p.vy) > 1.8) {
            p.vy = -p.vy * bounce;
            p.vRot *= 0.4;
          } else {
            p.vy = 0;
            p.vx = 0;
            p.vRot = 0;
            p.animating = false;
          }
        }

        // Sidewall bouncing within court width (+/- 36px)
        if (Math.abs(p.x) > 36) {
          p.vx = -p.vx * 0.7;
          p.x = Math.max(-36, Math.min(36, p.x));
        }

        el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rotation}deg)`;
      }

      if (p.animating) {
        rafId.current = requestAnimationFrame(step);
      } else {
        rafId.current = 0;
      }
    };

    rafId.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const handleKick = () => {
    const p = physics.current;
    p.animating = true;
    p.inAir = true;

    // Punchy kick audio feedback
    sfx.kick();

    // Controlled upward velocity
    p.vy = -7.6 - Math.random() * 0.8;
    p.vx = (Math.random() - 0.5) * 1.8;
    p.vRot = (Math.random() - 0.5) * 16;

    // Start simulation loop if not running
    startLoop();

    // Update kick counter & streak
    setKicks((k) => k + 1);
    setStreak((s) => {
      const next = s + 1;
      setBestStreak((b) => {
        const nextBest = Math.max(b, next);
        try {
          localStorage.setItem("sushant_football_best", String(nextBest));
        } catch {}
        return nextBest;
      });

      if (next > 0 && next % 5 === 0) {
        setTimeout(() => sfx.win(), 150);
      }
      return next;
    });

    setDroppedAlert(false);
  };

  return (
    <footer
      ref={root}
      id="contact"
      aria-labelledby="contact-title"
      className="relative mt-12 text-ivory rounded-t-[36px] sm:rounded-t-[44px] md:rounded-t-[72px] px-4 sm:px-6 md:px-10 pt-16 sm:pt-24 pb-10 sm:pb-12 overflow-hidden shadow-2xl"
      style={{
        background: "radial-gradient(120% 80% at 80% 0%, #3d3a55 0%, #2a2831 55%, #18221c 100%)",
      }}
    >
      <div className="mx-auto max-w-[1100px]">
        <p data-reveal className="eyebrow !text-ivory/60 flex items-center gap-2">
          <span className="led on" aria-hidden /> 07 · Final level · Let's Connect
        </p>

        <h2 id="contact-title" data-reveal className="font-display text-[clamp(2.4rem,8vw,7rem)] leading-[0.92] tracking-tighter font-semibold mt-4">
          Let's build
          <br />
          <em className="font-light text-lav">something great.</em>
        </h2>

        <p data-reveal className="mt-5 sm:mt-6 max-w-xl text-ivory/75 text-base sm:text-lg leading-relaxed">
          Open to opportunities in full-stack MERN development, internships, and game / 3D environment art. Collaborations and conversations are always welcome.
        </p>

        <div data-reveal className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5">
          <Magnetic>
            <button
              className="key key-butter !text-sm sm:!text-base !px-6 !py-3 sm:!py-3.5"
              onClick={() => {
                sfx.win();
                downloadResume();
              }}
            >
              <span aria-hidden>▶</span> Download Résumé
            </button>
          </Magnetic>
          <p className="font-mono text-xs text-ivory/60">{PROFILE.roles.join("  ·  ")}</p>
        </div>

        {/* Contact links list */}
        <ul className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {items.map((c) => (
            <li key={c.id} data-reveal>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer noopener"
                onClick={() => sfx.click()}
                className="group flex items-center justify-between gap-3 sm:gap-4 rounded-2xl p-4 sm:p-5 border border-ivory/15 bg-ivory/[0.07] backdrop-blur-sm transition-all duration-200 hover:bg-ivory/[0.12] hover:-translate-y-0.5 shadow-xs"
              >
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                  <span
                    aria-hidden
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl grid place-items-center font-mono font-bold text-ink shrink-0 plastic !rounded-xl text-base sm:text-lg shadow-xs"
                    style={{ ["--tone" as string]: c.tone }}
                  >
                    {c.icon}
                  </span>
                  <div className="min-w-0 text-left">
                    <span className="block font-display text-base sm:text-xl font-semibold text-ivory group-hover:text-lav transition-colors">
                      {c.label}
                    </span>
                    <span className="block text-xs sm:text-[0.82rem] text-ivory/60 font-medium">
                      {c.action}
                    </span>
                  </div>
                </div>
                <span
                  aria-hidden
                  className="text-ivory/40 group-hover:text-ivory group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-xl shrink-0"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>

        {/* Clean, Responsive Footer Bar */}
        <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-ivory/15 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 text-sm text-ivory/70">
          {/* Signature */}
          <div className="flex items-center gap-4">
            <span className="font-display text-lg sm:text-xl tracking-tight text-ivory/80 font-medium">
              sushant
            </span>
          </div>

          {/* Seamless Football Illustration Mini-Game */}
          <div className="flex flex-col items-center select-none py-1">
            <div
              onClick={handleKick}
              className="relative w-32 h-20 sm:h-24 flex items-end justify-center cursor-pointer select-none touch-manipulation group"
              title="Tap to juggle the football!"
              role="button"
              tabIndex={0}
              aria-label={`Juggling football: ${kicks} kicks, ${streak} streak, ${bestStreak} best`}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  handleKick();
                  e.preventDefault();
                }
              }}
            >
              <div className="absolute bottom-0 w-16 h-1 bg-emerald-500/80 rounded-full pointer-events-none" />

              <div
                ref={ballRef}
                className="text-2xl sm:text-3xl leading-none select-none inline-block will-change-transform pb-1 pointer-events-none"
                style={{ transformOrigin: "center center" }}
              >
                ⚽
              </div>
            </div>

            <div className="font-mono text-xs text-center select-none mt-1 sm:mt-2 h-5 flex items-center justify-center min-w-[140px]">
              {droppedAlert ? (
                <span className="text-peach font-medium animate-pulse">turf! streak reset</span>
              ) : streak > 0 ? (
                <span className="text-butter font-semibold">
                  streak: {streak} {bestStreak > 1 ? `· best: ${bestStreak}` : ""}
                </span>
              ) : (
                <span className="text-ivory/50">
                  tap to kick {bestStreak > 0 ? `· best: ${bestStreak}` : ""}
                </span>
              )}
            </div>
          </div>

          {/* Single Back to top button */}
          <button
            type="button"
            className="key key-sm"
            onClick={() => {
              sfx.click();
              smoothScrollTo(0);
            }}
          >
            ↑ Top
          </button>
        </div>
      </div>
    </footer>
  );
}
