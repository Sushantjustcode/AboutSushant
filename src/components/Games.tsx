import { lazy, Suspense, useRef, useState } from "react";
import { SectionHead } from "./Iso";
import { gsap, revealAll, useScrollScope } from "../lib/motion";
import { sfx } from "../lib/sfx";

const TowerStack = lazy(() => import("./games/TowerStack").then((m) => ({ default: m.TowerStack })));
const Reaction = lazy(() => import("./games/Reaction").then((m) => ({ default: m.Reaction })));
const Puzzle = lazy(() => import("./games/Puzzle").then((m) => ({ default: m.Puzzle })));

const CARTS = [
  { id: "stack", n: "01", name: "Tower Stack", kind: "Precision Stack", tone: "var(--color-sage)" },
  { id: "tap", n: "02", name: "Tap Switch", kind: "Reaction", tone: "var(--color-butter)" },
  { id: "mend", n: "03", name: "Circuit Mend", kind: "Puzzle", tone: "var(--color-peach)" },
] as const;

export function Games() {
  const root = useRef<HTMLElement>(null);
  const [cart, setCart] = useState<(typeof CARTS)[number]["id"]>("stack");

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
    <section ref={root} id="play" aria-labelledby="play-title" className="relative px-4 sm:px-6 md:px-10 py-16 sm:py-24 md:py-32" style={{ background: "linear-gradient(180deg, transparent, rgba(189,182,217,.28) 30%, rgba(189,182,217,.28) 80%, transparent)" }}>
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

        <div data-console className="mt-8 sm:mt-12 plastic p-3.5 sm:p-6 md:p-7 shadow-2xl border-2 border-white/50" style={{ ["--tone" as string]: "#cfc7e6", borderRadius: 32 }}>
          {/* Cartridges Selection Row */}
          <div role="tablist" aria-label="Choose a game" className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-5">
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

          {/* Screen Console Frame */}
          <div className="rounded-[20px] sm:rounded-[24px] p-2.5 sm:p-4" style={{ background: "#2e2b38", boxShadow: "inset 0 4px 12px rgba(0,0,0,.7), 0 1px 0 rgba(255,255,255,.5)" }}>
            <div id="game-panel" role="tabpanel" aria-labelledby={`tab-${cart}`} className="rounded-xl sm:rounded-2xl p-3 sm:p-6 bg-paper min-h-[360px] sm:min-h-[420px] flex flex-col justify-center shadow-inner overflow-hidden" style={{ boxShadow: "inset 0 0 0 1px rgba(42,40,49,.1)" }}>
              <Suspense
                fallback={
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <span className="w-8 h-8 border-3 border-ink/20 border-t-lav-deep rounded-full animate-spin" />
                    <span className="font-mono text-xs text-ink-soft">Inserting Cartridge...</span>
                  </div>
                }
              >
                {cart === "stack" && <TowerStack />}
                {cart === "tap" && <Reaction />}
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
