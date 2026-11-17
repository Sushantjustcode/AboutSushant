import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Cube } from "./Iso";
import { sfx } from "../lib/sfx";

function Frame({ url, children, note }: { url: string; children: ReactNode; note: string }) {
  return (
    <div className="w-full">
      <div className="paper !rounded-2xl overflow-hidden shadow-xl border border-ink/10">
        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-ink/10 bg-cream/70 backdrop-blur-sm">
          <span className="flex gap-1.5" aria-hidden>
            <i className="w-2.5 h-2.5 rounded-full bg-peach shadow-sm" />
            <i className="w-2.5 h-2.5 rounded-full bg-butter shadow-sm" />
            <i className="w-2.5 h-2.5 rounded-full bg-sage shadow-sm" />
          </span>
          <span className="flex-1 mx-2 font-mono text-[0.7rem] px-3 py-1 rounded-lg well !rounded-lg truncate text-ink font-semibold">
            {url}
          </span>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
      <p className="mt-3 font-mono text-[0.7rem] text-ink-soft">{note}</p>
    </div>
  );
}

/* ───────────── 01 · Findit: Lost & Found Community Platform (Clean Product Showcase) ───────────── */
type LostFoundItem = {
  id: number;
  title: string;
  category: "Lost" | "Found";
  location: string;
  tag: string;
  time: string;
};

export function FinditDemo() {
  const [filter, setFilter] = useState<"All" | "Lost" | "Found">("All");
  const [query, setQuery] = useState("");
  const [connectedId, setConnectedId] = useState<number | null>(null);

  const items: LostFoundItem[] = [
    { id: 1, title: "Vintage Leather Wallet (Brown)", category: "Lost", location: "Campus Cafeteria", tag: "Wallet & IDs", time: "2h ago" },
    { id: 2, title: "Car Remote Key Fob (Toyota)", category: "Found", location: "Library 2nd Floor", tag: "Keys", time: "Yesterday" },
    { id: 3, title: "Sony Wireless Earbuds & Case", category: "Lost", location: "Sports Complex", tag: "Electronics", time: "3d ago" },
    { id: 4, title: "Scientific Calculator & Notes", category: "Found", location: "Room 204 Desk", tag: "Stationery", time: "5h ago" },
  ];

  const filtered = items.filter((it) => {
    const matchCat = filter === "All" || it.category === filter;
    const matchQuery =
      it.title.toLowerCase().includes(query.toLowerCase()) ||
      it.location.toLowerCase().includes(query.toLowerCase()) ||
      it.tag.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleConnect = (id: number) => {
    sfx.coin();
    setConnectedId(id);
    setTimeout(() => setConnectedId(null), 3000);
  };

  return (
    <Frame
      url="findit.community / live-feed"
      note="Product preview of Findit: a community lost and found platform built with the MERN stack."
    >
      {/* Category Pills & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl well !rounded-xl">
          {(["All", "Lost", "Found"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setFilter(tab);
                sfx.click();
              }}
              className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                filter === tab ? "bg-ink text-ivory shadow-sm" : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-[220px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items…"
            className="w-full px-3 py-1.5 rounded-lg well !rounded-lg text-xs outline-none focus:ring-2 ring-lav-deep"
          />
        </div>
      </div>

      {/* Listing Feed */}
      <div className="grid gap-2.5 max-h-[300px] overflow-y-auto thin-scroll pr-1">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/80 border border-ink/10 shadow-sm transition-all hover:bg-white hover:shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`px-2 py-1 rounded-md font-mono text-[0.65rem] font-bold tracking-wider shrink-0 ${
                  item.category === "Lost"
                    ? "bg-peach text-peach-deep border border-peach-deep/30"
                    : "bg-sage text-sage-deep border border-sage-deep/30"
                }`}
              >
                {item.category.toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="font-display font-semibold text-sm text-ink truncate leading-tight">
                  {item.title}
                </p>
                <p className="font-mono text-[0.68rem] text-ink-soft mt-0.5">
                  📍 {item.location} · {item.time}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleConnect(item.id)}
              className="key key-sm !py-1 !px-2.5 !text-xs key-lav shrink-0"
            >
              {connectedId === item.id ? "Connected ✓" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ───────────── 02 · Responsive layout lab ───────────── */
export function ResponsiveDemo() {
  const [w, setW] = useState(520);
  const label = w < 448 ? "Phone layout" : w < 512 ? "Tablet layout" : "Desktop layout";
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-4">
        <label htmlFor="vw" className="eyebrow whitespace-nowrap">
          Viewport · {w}px
        </label>
        <input
          id="vw"
          type="range"
          min={300}
          max={560}
          step={4}
          value={w}
          onChange={(e) => setW(+e.target.value)}
          className="flex-1 accent-[#6f66a3]"
          aria-valuetext={`${w} pixels, ${label}`}
        />
        <span className="chip" style={{ ["--chip" as string]: "var(--color-butter)" }}>
          {label}
        </span>
      </div>
      <div className="well p-3 grid grid-cols-[minmax(0,1fr)] justify-items-center items-center min-h-[340px]">
        <div className="paper !rounded-xl overflow-hidden max-w-full transition-[width] duration-150" style={{ width: w, containerType: "inline-size" }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-ink/10 bg-cream/60">
            <span className="font-display font-semibold text-sm">sushant.portfolio</span>
            <span className="hidden @md:flex gap-3 text-xs font-semibold text-ink-soft">
              <span>Work</span>
              <span>Play</span>
              <span>Awards</span>
            </span>
            <span className="@md:hidden text-sm" aria-hidden>
              ☰
            </span>
          </div>
          <div className="p-3.5 grid gap-3">
            <div className="rounded-xl p-4 @md:p-6" style={{ background: "linear-gradient(135deg,var(--color-lav),var(--color-butter))" }}>
              <div className="h-3 w-2/3 rounded-full bg-ink/70 mb-2" />
              <div className="h-2 w-1/2 rounded-full bg-ink/30" />
            </div>
            <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-3">
              {["var(--color-sage)", "var(--color-blue)", "var(--color-peach)"].map((c, i) => (
                <div key={i} className="rounded-xl p-3 border border-ink/10" style={{ background: c }}>
                  <div className="h-8 rounded-lg bg-white/50 mb-2" />
                  <div className="h-2 w-3/4 rounded-full bg-ink/40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-3 font-mono text-[0.7rem] text-ink-soft">Responsive interface with fluid container queries.</p>
    </div>
  );
}

/* ───────────── 03 · Horror Game Design & 3D Modeling (Full-Frame Darkness Fixed) ───────────── */
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
function pine(x: number, base: number, h: number, w: number) {
  return `M${x} ${base - h} L${x + w * 0.38} ${base - h * 0.6} L${x + w * 0.2} ${base - h * 0.6} L${x + w * 0.52} ${base - h * 0.3} L${x + w * 0.3} ${base - h * 0.3} L${x + w * 0.7} ${base} L${x - w * 0.7} ${base} L${x - w * 0.3} ${base - h * 0.3} L${x - w * 0.52} ${base - h * 0.3} L${x - w * 0.2} ${base - h * 0.6} L${x - w * 0.38} ${base - h * 0.6}Z`;
}
function layer(seed: number, n: number, min: number, max: number, base: number) {
  const r = rng(seed);
  let d = "";
  for (let i = 0; i < n; i++) {
    const h = min + r() * (max - min);
    d += pine(-20 + (i / (n - 1)) * 840 + (r() - 0.5) * 40, base, h, h * 0.34);
  }
  return d;
}

type TabMode = "forest" | "assets3d";
type AssetShading = "wire" | "clay" | "tex";

export function HorrorAnd3DVisual() {
  const [tab, setTab] = useState<TabMode>("forest");
  const [design, setDesign] = useState(false);
  const [assetMode, setAssetMode] = useState<AssetShading>("tex");
  const box = useRef<HTMLDivElement>(null);
  const holder = useRef<HTMLDivElement>(null);
  const model = useRef<HTMLDivElement>(null);
  const state = useRef({ a: 28, tilt: 62, drag: false, x: 0, y: 0, vis: true });

  const far = useMemo(() => layer(7, 20, 150, 230, 390), []);
  const mid = useMemo(() => layer(13, 14, 220, 320, 440), []);
  const near = useMemo(() => layer(29, 8, 330, 460, 520), []);

  // Flashlight interaction
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width;
        const ny = (e.clientY - r.top) / r.height;
        el.style.setProperty("--lx", `${nx * 100}%`);
        el.style.setProperty("--ly", `${ny * 100}%`);
        el.style.setProperty("--mx", `${(nx - 0.5) * 2}`);
      });
    };
    el.addEventListener("pointermove", move as unknown as EventListener);
    return () => {
      el.removeEventListener("pointermove", move as unknown as EventListener);
      cancelAnimationFrame(raf);
    };
  }, [tab]);

  // 3D Model rotation (only ticks when in view)
  useEffect(() => {
    if (tab !== "assets3d") return;
    const el = holder.current;
    const m = model.current;
    if (!el || !m) return;
    const s = state.current;
    const apply = () => (m.style.transform = `rotateX(${s.tilt}deg) rotateZ(${s.a}deg)`);
    let raf = 0;
    let isVisible = true;

    const loop = () => {
      if (!isVisible) return;
      if (!s.drag && s.vis) s.a += 0.35;
      apply();
      raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    const down = (e: PointerEvent) => {
      s.drag = true;
      s.x = e.clientX;
      s.y = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!s.drag) return;
      s.a -= (e.clientX - s.x) * 0.6;
      s.tilt = Math.max(30, Math.min(88, s.tilt - (e.clientY - s.y) * 0.4));
      s.x = e.clientX;
      s.y = e.clientY;
    };
    const up = () => (s.drag = false);
    el.addEventListener("pointerdown", down as unknown as EventListener);
    el.addEventListener("pointermove", move as unknown as EventListener);
    el.addEventListener("pointerup", up as unknown as EventListener);
    raf = requestAnimationFrame(loop);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerdown", down as unknown as EventListener);
      el.removeEventListener("pointermove", move as unknown as EventListener);
      el.removeEventListener("pointerup", up as unknown as EventListener);
    };
  }, [tab]);

  const par = (k: number) => ({ transform: `translateX(calc(var(--mx, 0) * ${k}px)) scale(1.06)`, transition: "transform .25s ease-out" });

  const faceStyle = (i: number): CSSProperties => {
    if (assetMode === "wire")
      return {
        background: "transparent",
        boxShadow: "none",
        border: "2px solid #587349",
        backfaceVisibility: "visible",
        backgroundImage: "linear-gradient(to top right, transparent calc(50% - 1px), #587349 50%, transparent calc(50% + 1px)), linear-gradient(rgba(88,115,73,.45) 1px, transparent 1px), linear-gradient(90deg, rgba(88,115,73,.45) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 50% 50%, 50% 50%",
      };
    if (assetMode === "tex")
      return {
        backgroundImage:
          "linear-gradient(45deg, transparent 46%, rgba(80,50,30,.55) 46% 54%, transparent 54%), linear-gradient(-45deg, transparent 46%, rgba(80,50,30,.55) 46% 54%, transparent 54%), repeating-linear-gradient(90deg, rgba(90,60,35,.0) 0 17px, rgba(90,60,35,.35) 17px 19px)",
        border: "7px solid #8a5f3a",
        boxSizing: "border-box",
        ...(i === 0 ? { backgroundImage: "repeating-linear-gradient(90deg, rgba(90,60,35,0) 0 17px, rgba(90,60,35,.35) 17px 19px)" } : {}),
      };
    return { background: "#d9cbb4", border: "1px solid #baa990" };
  };

  return (
    <div className="w-full">
      {/* Visual Mode Selector */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl well !rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTab("forest");
              sfx.click();
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              tab === "forest" ? "bg-ink text-ivory shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            🌲 Horror Forest Level
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("assets3d");
              sfx.click();
            }}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              tab === "assets3d" ? "bg-ink text-ivory shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            📦 3D Asset Inspector
          </button>
        </div>

        {tab === "forest" ? (
          <button
            type="button"
            className="key key-sm key-sage"
            onClick={() => {
              setDesign(!design);
              sfx.flip(!design);
            }}
          >
            {design ? "Hide Sightlines" : "Show Sightlines"}
          </button>
        ) : (
          <div className="flex gap-1">
            {(["wire", "clay", "tex"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`key key-sm ${assetMode === m ? "key-butter" : ""}`}
                onClick={() => {
                  setAssetMode(m);
                  sfx.click();
                }}
              >
                {m === "wire" ? "Wire" : m === "clay" ? "Clay" : "PBR"}
              </button>
            ))}
          </div>
        )}
      </div>

      {tab === "forest" ? (
        <div
          ref={box}
          className="relative rounded-2xl overflow-hidden h-[340px] md:h-[400px] select-none shadow-2xl border border-black/40"
          style={{ touchAction: "pan-y", background: "#050706" }}
          role="img"
          aria-label="Interactive dark horror forest level design. Move cursor to sweep flashlight."
        >
          <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1e2438" />
                <stop offset="1" stopColor="#0d1410" />
              </linearGradient>
              <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#cfd8e6" stopOpacity="0" />
                <stop offset="1" stopColor="#cfd8e6" stopOpacity=".16" />
              </linearGradient>
            </defs>
            <rect width="800" height="500" fill="url(#skyGrad)" />
            <circle cx="610" cy="90" r="30" fill="#e8e6f7" opacity=".7" />
            <g style={par(6)}>
              <path d={far} fill="#18231e" />
            </g>
            <rect y="300" width="800" height="120" fill="url(#fogGrad)" />
            <g style={par(14)}>
              <path d={mid} fill="#0f1915" />
            </g>
            <rect y="360" width="800" height="110" fill="url(#fogGrad)" />
            <g style={par(26)}>
              <path d={near} fill="#080e0c" />
            </g>
            <rect y="420" width="800" height="80" fill="#040605" />
            <circle cx="470" cy="352" r="38" fill="#ecd896" opacity={design ? 0.35 : 0.08} />
            <circle cx="470" cy="352" r="4" fill="#fff3b0" />

            {design && (
              <g fontFamily="JetBrains Mono, monospace" fontSize="13" fill="#fbf7ee">
                <polygon points="60,470 470,300 470,400" fill="#bdb6d9" opacity=".22" />
                <polygon points="470,352 740,235 740,285" fill="#ecd896" opacity=".2" />
                <path d="M60 470 C 220 440, 300 410, 420 388 S 620 310, 740 260" stroke="#ecd896" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" fill="none" />
                {[
                  { x: 60, y: 470, t: "01 Approach" },
                  { x: 360, y: 400, t: "02 Landmark Moonlight" },
                  { x: 585, y: 322, t: "03 Pinch Point" },
                  { x: 740, y: 260, t: "04 Cabin Reveal" },
                ].map((m) => (
                  <g key={m.t}>
                    <circle cx={m.x} cy={m.y} r="7" fill="#bccbad" stroke="#1f2a26" strokeWidth="2" />
                    <text x={Math.min(m.x + 12, 640)} y={m.y - 14} stroke="#1f2a26" strokeWidth="4" paintOrder="stroke">
                      {m.t}
                    </text>
                  </g>
                ))}
              </g>
            )}
          </svg>

          {/* TOTAL FRAME DARKNESS: Solid 100% black darkness covering the ENTIRE frame with circular flashlight beam */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: design ? 0.25 : 1,
              background:
                "radial-gradient(circle 170px at var(--lx, 50%) var(--ly, 50%), rgba(255, 255, 235, 0.04) 0%, rgba(5, 8, 6, 0.2) 40%, rgba(5, 8, 6, 0.88) 75%, #050806 100%)",
            }}
          />

          <div className="absolute left-3 top-3 chip !bg-black/80 !text-ivory text-xs border border-white/20">
            {design ? "Sightline & pacing overlay" : "🔦 Move cursor to illuminate the dark"}
          </div>
        </div>
      ) : (
        <div
          ref={holder}
          className="well relative h-[340px] md:h-[400px] grid place-items-center cursor-grab active:cursor-grabbing select-none overflow-hidden rounded-2xl shadow-xl"
          style={{ touchAction: "pan-y", perspective: 900 }}
          role="img"
          aria-label="Interactive 3D game crate modeled in Blender. Drag to inspect."
        >
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(77,110,138,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(77,110,138,.15) 1px,transparent 1px)", backgroundSize: "28px 28px" }} aria-hidden />
          <div ref={model} className="preserve relative" style={{ width: 0, height: 0 }}>
            <Cube size={150} colors={assetMode === "tex" ? ["#c99a68", "#c99a68", "#c99a68", "#c99a68", "#c99a68", "#c99a68"] : ["#f1c9aa", "#f1c9aa", "#f1c9aa", "#f1c9aa", "#f1c9aa", "#f1c9aa"]} faceStyle={faceStyle} />
          </div>
          <span className="absolute left-3 top-3 chip !bg-ivory/90 text-xs">Drag to spin 3D asset</span>
          <span className="absolute right-3 top-3 chip" style={{ ["--chip" as string]: "var(--color-sage)" }}>
            Blender → Unreal 5 Pipeline
          </span>
        </div>
      )}

      <p className="mt-3 font-mono text-[0.7rem] text-ink-soft">
        {tab === "forest"
          ? "Atmospheric horror level design: Pitch-black woods cut only by player flashlight beam."
          : "Game-ready 3D asset pipeline: low-poly topology, UV unwrapping, and PBR texturing."}
      </p>
    </div>
  );
}
