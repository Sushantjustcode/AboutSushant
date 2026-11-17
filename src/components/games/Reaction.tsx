import { useEffect, useRef, useState } from "react";
import { sfx } from "../../lib/sfx";

type Phase = "idle" | "wait" | "go" | "result" | "early";

export function Reaction() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const timer = useRef<number | undefined>(undefined);
  const t0 = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const press = () => {
    if (phase === "idle" || phase === "result" || phase === "early") {
      setPhase("wait");
      sfx.click();
      timer.current = window.setTimeout(() => {
        t0.current = performance.now();
        setPhase("go");
        sfx.tone(660, 0.1, "square", 0.04);
      }, 1500 + Math.random() * 2800);
    } else if (phase === "wait") {
      window.clearTimeout(timer.current);
      setPhase("early");
      sfx.bad();
    } else if (phase === "go") {
      const t = Math.round(performance.now() - t0.current);
      setMs(t);
      setBest((b) => (b === null ? t : Math.min(b, t)));
      setHistory((h) => [t, ...h].slice(0, 5));
      setPhase("result");
      sfx.coin();
    }
  };

  const look = {
    idle: { tone: "var(--color-lav)", label: "START", sub: "Press the button, then wait for green." },
    wait: { tone: "var(--color-butter)", label: "WAIT…", sub: "Don't press yet…" },
    go: { tone: "var(--color-sage)", label: "TAP!", sub: "Now!" },
    result: { tone: "var(--color-lav)", label: "AGAIN", sub: `${ms} ms` },
    early: { tone: "var(--color-peach)", label: "RETRY", sub: "Too soon. Wait for green." },
  }[phase];

  const verdict = phase === "result" ? (ms < 220 ? "Quick hands." : ms < 320 ? "Solid." : "Warming up. Go again.") : "";

  return (
    <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
      <div className="grid place-items-center py-4">
        {/* arcade button */}
        <div className="relative w-[210px] h-[210px] rounded-full grid place-items-center" style={{ background: "radial-gradient(circle at 50% 30%, #fff, #d9cfba)", boxShadow: "inset 0 6px 14px rgba(42,40,49,.35), 0 2px 0 #fff" }}>
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              press();
            }}
            onKeyDown={(e) => {
              if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                e.preventDefault();
                press();
              }
            }}
            aria-label={`Reaction button: ${look.label}. ${look.sub}`}
            className="w-[170px] h-[170px] rounded-full font-mono font-bold text-xl tracking-widest text-ink transition-all duration-75 active:translate-y-2 cursor-pointer select-none touch-manipulation"
            style={{
              background: `radial-gradient(circle at 35% 25%, rgba(255,255,255,.7), rgba(255,255,255,0) 55%), ${look.tone}`,
              boxShadow: "0 12px 0 rgba(42,40,49,.35), 0 22px 24px -6px rgba(42,40,49,.45), inset 0 -8px 14px rgba(42,40,49,.18), inset 0 2px 0 rgba(255,255,255,.8)",
              border: "1px solid rgba(42,40,49,.2)",
            }}
          >
            {look.label}
          </button>
        </div>
      </div>

      <div className="min-w-[210px]" aria-live="polite">
        <p className="eyebrow">Reaction test</p>
        <p className="font-display text-5xl font-semibold mt-1 leading-none">{phase === "result" ? `${ms}` : "—"}<span className="text-lg font-mono ml-1">ms</span></p>
        <p className="text-sm text-ink-soft mt-2 min-h-[2.6rem]">{phase === "result" ? verdict : look.sub}</p>
        <dl className="mt-3 grid grid-cols-2 gap-3">
          <div className="well px-3 py-2">
            <dt className="eyebrow !text-[0.6rem]">Best</dt>
            <dd className="font-mono font-bold">{best ?? "—"}</dd>
          </div>
          <div className="well px-3 py-2">
            <dt className="eyebrow !text-[0.6rem]">Tries</dt>
            <dd className="font-mono font-bold">{history.length ? history.join(" · ") : "—"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
