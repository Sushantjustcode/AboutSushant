import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { SectionHead } from "./Iso";
import { gsap, revealAll, useScrollScope } from "../lib/motion";
import { sfx } from "../lib/sfx";

const TowerStack = lazy(() => import("./games/TowerStack").then((m) => ({ default: m.TowerStack })));
const AppleOfDestiny = lazy(() => import("./games/AppleOfDestiny").then((m) => ({ default: m.AppleOfDestiny })));
const Puzzle = lazy(() => import("./games/Puzzle").then((m) => ({ default: m.Puzzle })));

const CARTS = [
  { id: "stack", n: "01", name: "Tower Stack", kind: "Precision Stack", tone: "var(--color-sage)" },
  { id: "destiny", n: "02", name: "Apple Destiny", kind: "Spear Physics", tone: "var(--color-butter)" },
  { id: "mend", n: "03", name: "Circuit Mend", kind: "Puzzle", tone: "var(--color-peach)" },
] as const;

export function Games() {
  const root = useRef<HTMLElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<(typeof CARTS)[number]["id"]>("stack");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    sfx.click();
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (consoleRef.current && !document.fullscreenElement) {
          if (consoleRef.current.requestFullscreen) {
            consoleRef.current.requestFullscreen().catch(() => {});
          }
        }
      } catch {}
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
        } catch {}
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  // Lock body scroll in fullscreen to prevent page jumping during play
  useEffect(() => {
    if (isFullscreen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isFullscreen]);

  useScrollScope(root, ({ root }) => {
    revealAll(root);
    gsap.from("[data-console]", {
      y: 80,
      rotationX: 14,
      transformPerspective: 1200,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      scrollTrigger: { trigger: "[data-console]", start: "top 85%", once: true },
    });
  });

  return (
    <section ref={root} id="play" aria-labelledby="play-title" className="relative px-2.5 sm:px-6 md:px-10 py-16 sm:py-24 md:py-32" style={{ background: "linear-gradient(180deg, transparent, rgba(189,182,217,.28) 30%, rgba(189,182,217,.28) 80%, transparent)" }}>
      <div className="mx-auto max-w-[1000px]">
        <SectionHead
          num="06"
          label="Pocket Lab"
          tone="var(--color-sage)"
          title={
            <span id="play-title">
              Mini Games &amp; <em className="font-light text-lav-deep">Creative Lab.</em>
            </span>
          }
          kicker="Small rules, clear tactile feedback, and interactive mechanics built from scratch with Canvas and React."
        />

        <div data-console className="mt-8 sm:mt-12 plastic p-2 sm:p-6 md:p-7 shadow-2xl border-2 border-white/50" style={{ ["--tone" as string]: "#cfc7e6", borderRadius: 32 }}>
          {/* Cartridges Selection Row + Lil Fullscreen Button */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 sm:mb-5">
            <div role="tablist" aria-label="Choose a game" className="flex flex-wrap gap-2 sm:gap-3">
              {CARTS.map((c) => (
                <button
                  key={c.id}
                  role="tab"
                  id={`tab-${c.id}`}
                  aria-selected={cart === c.id}
                  aria-controls="game-panel"
                  onClick={() => {
                    setCart(c.id);
                    sfx.click();
                  }}
                  className={`key !items-start !flex-col !gap-0 text-left !px-3.5 sm:!px-4 !py-2 sm:!py-2.5 transition-all duration-150 ${
                    cart === c.id ? "scale-[1.02] shadow-sm" : "opacity-80"
                  }`}
                  style={{ ["--tone" as string]: cart === c.id ? c.tone : "var(--color-paper)" }}
                >
                  <span className="font-mono text-[0.62rem] opacity-60">CART {c.n}</span>
                  <span className="font-display text-base sm:text-lg font-semibold leading-tight">{c.name}</span>
                  <span className="eyebrow !text-[0.58rem]">{c.kind}</span>
                </button>
              ))}
            </div>

            {/* A lil fullscreen button - minimal, elegant, non-disturbing */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand to Fullscreen"}
              className="key !py-2 !px-2.5 sm:!py-2 sm:!px-3 text-xs flex items-center gap-1.5 self-center ml-auto transition-transform hover:scale-105 active:scale-95 opacity-85 hover:opacity-100"
              style={{ ["--tone" as string]: "var(--color-paper)" }}
            >
              <svg
                className="w-3.5 h-3.5 text-ink"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {isFullscreen ? (
                  <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                ) : (
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                )}
              </svg>
              <span className="font-mono text-[0.68rem] font-bold uppercase tracking-wider text-ink hidden xs:inline sm:inline">
                {isFullscreen ? "Exit" : "Fullscreen"}
              </span>
            </button>
          </div>

          {/* Screen Console Frame */}
          <div
            ref={consoleRef}
            className={`transition-all duration-300 ${
              isFullscreen
                ? "fixed inset-0 z-[9999] bg-[#1a1824]/98 backdrop-blur-md p-2.5 sm:p-5 md:p-8 flex flex-col justify-center items-center overflow-y-auto"
                : "rounded-[20px] sm:rounded-[24px] p-1.5 sm:p-4"
            }`}
            style={
              isFullscreen
                ? { background: "#1b1926" }
                : {
                    background: "#2e2b38",
                    boxShadow: "inset 0 4px 12px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.5)",
                  }
            }
          >
            {/* Top Bar when in Fullscreen */}
            {isFullscreen && (
              <div className="w-full max-w-[960px] flex items-center justify-between mb-2 sm:mb-3 px-1 text-white shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white">
                    {CARTS.find((c) => c.id === cart)?.name}
                  </span>
                  <span className="chip !text-[0.62rem] !py-0.5 !px-2 font-mono bg-white/10 text-white/90 border border-white/20">
                    ESC TO EXIT
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex gap-1.5">
                    {CARTS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setCart(c.id);
                          sfx.click();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[0.68rem] font-mono transition-colors ${
                          cart === c.id
                            ? "bg-white text-ink font-bold shadow-sm"
                            : "bg-white/10 text-white/80 hover:bg-white/20"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={toggleFullscreen}
                    className="key !py-1 !px-2.5 sm:!py-1.5 sm:!px-3 text-xs flex items-center gap-1 font-bold hover:scale-105 active:scale-95"
                    style={{ ["--tone" as string]: "var(--color-peach)" }}
                    title="Exit Fullscreen (Esc)"
                  >
                    <span>✕</span>
                    <span className="font-mono text-[0.68rem] uppercase">Exit</span>
                  </button>
                </div>
              </div>
            )}

            <div
              id="game-panel"
              role="tabpanel"
              aria-labelledby={`tab-${cart}`}
              className={`rounded-xl sm:rounded-2xl p-1.5 sm:p-5 md:p-6 bg-paper flex flex-col justify-center shadow-inner overflow-hidden transition-all duration-300 ${
                isFullscreen
                  ? "w-full max-w-[960px] max-h-[90vh] sm:max-h-[86vh] flex-1 border-2 border-white/25 shadow-2xl overflow-y-auto"
                  : "min-h-[360px] sm:min-h-[420px]"
              }`}
              style={{ boxShadow: "inset 0 0 0 1px rgba(42,40,49,.1)" }}
            >
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <span className="w-8 h-8 border-3 border-ink/20 border-t-lav-deep rounded-full animate-spin" />
                    <span className="font-mono text-xs text-ink-soft">Inserting Cartridge...</span>
                  </div>
                }
              >
                {cart === "stack" && <TowerStack />}
                {cart === "destiny" && <AppleOfDestiny />}
                {cart === "mend" && <Puzzle />}
              </Suspense>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex gap-1.5" aria-hidden>
              {[...Array(6)].map((_, i) => (
                <span key={i} className="w-1.5 h-8 rounded-full" style={{ background: "rgba(42,40,49,.25)", boxShadow: "inset 0 1px 2px rgba(0,0,0,.4), 0 1px 0 rgba(255,255,255,.5)" }} />
              ))}
            </div>
            <p className="deboss font-mono text-[0.68rem] tracking-widest font-bold">POCKET LAB · SC-01 ARCADE</p>
          </div>
        </div>
      </div>
    </section>
  );
}
