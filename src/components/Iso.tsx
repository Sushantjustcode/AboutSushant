import type { CSSProperties, ReactNode } from "react";

/**
 * Tiny CSS-3D toolkit. Coordinates follow a "floor" plane:
 *   x → right, y → toward the viewer (front), z → up.
 * A parent applies rotateX(~58deg) rotateZ(~-38deg) to make it isometric.
 * Only the three faces the camera can see (top, front, left) are rendered.
 */
type BoxProps = {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  color: string;
  topColor?: string;
  top?: ReactNode;
  front?: ReactNode;
  left?: ReactNode;
  shadow?: boolean;
  style?: CSSProperties;
  className?: string;
};

const face: CSSProperties = { position: "absolute", overflow: "hidden" };

export function Box({ x, y, z = 0, w, d, h, color, topColor, top, front, left, shadow, style, className }: BoxProps) {
  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: d,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px)`,
        ...style,
      }}
    >
      {shadow && (
        <div
          style={{
            position: "absolute",
            left: h * 0.15,
            top: h * 0.15,
            width: w + h * 0.35,
            height: d + h * 0.35,
            background: "rgba(40,30,50,.28)",
            filter: "blur(7px)",
            transform: "translateZ(0.5px)",
            borderRadius: 6,
          }}
        />
      )}
      {/* top */}
      <div style={{ ...face, left: 0, top: 0, width: w, height: d, background: topColor ?? color, transform: `translateZ(${h}px)` }}>{top}</div>
      {/* front (+y) */}
      <div
        style={{
          ...face,
          left: 0,
          top: d - h,
          width: w,
          height: h,
          background: color,
          boxShadow: "inset 0 0 0 999px rgba(35,25,55,.2)",
          transformOrigin: "50% 100%",
          transform: "rotateX(-90deg)",
        }}
      >
        {front}
      </div>
      {/* left (-x) */}
      <div
        style={{
          ...face,
          left: 0,
          top: -h,
          width: d,
          height: h,
          background: color,
          boxShadow: "inset 0 0 0 999px rgba(35,25,55,.09)",
          transformOrigin: "0 100%",
          transform: "rotateZ(90deg) rotateX(-90deg)",
        }}
      >
        {left}
      </div>
    </div>
  );
}

/** A voxel-style low-poly pine, built from stacked boxes. */
export function Pine({ x, y, s = 1, tone = "#587349" }: { x: number; y: number; s?: number; tone?: string }) {
  const layers = [
    { w: 46, h: 20, c: tone },
    { w: 34, h: 20, c: tone },
    { w: 22, h: 20, c: tone },
    { w: 10, h: 14, c: tone },
  ];
  return (
    <div className="preserve" style={{ position: "absolute", left: x, top: y, transform: `scale3d(${s},${s},${s})`, transformOrigin: "0 0" }}>
      <Box x={-5} y={-5} w={10} d={10} h={14} color="#8a6a4b" />
      {layers.map((l, i) => (
        <Box key={i} x={-l.w / 2} y={-l.w / 2} z={14 + i * 18} w={l.w} d={l.w} h={l.h} color={l.c} topColor={i === layers.length - 1 ? "#dfe9d0" : undefined} />
      ))}
    </div>
  );
}

/** Six-faced cube centred on its own origin. faces: [top, front, right, back, left, bottom]. */
export function Cube({
  size,
  faces,
  colors,
  faceStyle,
  className,
}: {
  size: number;
  faces?: ReactNode[];
  colors?: string[];
  faceStyle?: (i: number) => CSSProperties;
  className?: string;
}) {
  const h = size / 2;
  const T = [
    `translateZ(${h}px)`,
    `rotateX(-90deg) translateZ(${h}px)`,
    `rotateZ(-90deg) rotateX(-90deg) translateZ(${h}px)`,
    `rotateX(90deg) translateZ(${h}px)`,
    `rotateZ(90deg) rotateX(-90deg) translateZ(${h}px)`,
    `rotateX(180deg) translateZ(${h}px)`,
  ];
  const shade = [0, 0.14, 0.08, 0.2, 0.1, 0.28];
  return (
    <div className={`preserve ${className ?? ""}`} style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0 }}>
      {T.map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -h,
            top: -h,
            width: size,
            height: size,
            transform: t,
            background: colors?.[i % colors.length] ?? "#ddd",
            boxShadow: `inset 0 0 0 999px rgba(35,25,55,${shade[i]})`,
            display: "grid",
            placeItems: "center",
            backfaceVisibility: "hidden",
            ...faceStyle?.(i),
          }}
        >
          {faces?.[i]}
        </div>
      ))}
    </div>
  );
}

export function SectionHead({ num, label, title, kicker, tone = "var(--color-lav)", dark = false }: { num: string; label: string; title: ReactNode; kicker?: ReactNode; tone?: string; dark?: boolean }) {
  return (
    <header className="max-w-3xl" data-reveal>
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md text-ink" style={{ background: tone, boxShadow: "0 2px 0 rgba(42,40,49,.25), inset 0 1px 0 rgba(255,255,255,.6)" }}>
          {num}
        </span>
        <span className={`eyebrow ${dark ? "!text-ivory/70" : ""}`}>{label}</span>
      </div>
      <h2 className="font-display text-[clamp(2.3rem,6vw,4.6rem)] leading-[0.98] tracking-tight font-semibold">{title}</h2>
      {kicker && <p className={`mt-5 text-lg max-w-xl leading-relaxed ${dark ? "text-ivory/75" : "text-ink-soft"}`}>{kicker}</p>}
    </header>
  );
}
