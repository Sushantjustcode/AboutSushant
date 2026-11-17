import { useEffect, useRef, useState } from "react";
import { PROJECTS, type Project } from "../data/profile";
import { gsap, useMotion, useScrollScope } from "../lib/motion";
import { sfx } from "../lib/sfx";
import { SectionHead } from "./Iso";

function LinkSlot({ label, href }: { label: string; href: string }) {
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className="key key-sm" onClick={() => sfx.click()}>
        {label} <span aria-hidden>↗</span>
      </a>
    );
  return (
    <span className="key key-sm" aria-disabled="true" title="Project link will be added soon" style={{ opacity: 0.6, borderStyle: "dashed", boxShadow: "none", cursor: "not-allowed" }}>
      {label} · soon
    </span>
  );
}

function ProjectDossier({ p }: { p: Project }) {
  const isGame = p.kind === "game";
  return (
    <div className="w-full paper !rounded-2xl p-5 sm:p-7 border border-ink/10 shadow-lg relative overflow-hidden">
      {/* Top accent line */}
      <span
        aria-hidden
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ background: p.tone }}
      />

      {/* Dossier header */}
      <div className="flex items-center justify-between pb-4 border-b border-ink/10 mb-5">
        <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ink-soft">
          <span className="w-2 h-2 rounded-full bg-sage-deep" />
          <span>SPECIFICATION // {p.id.toUpperCase()}</span>
        </div>
        <span className="eyebrow !text-[0.68rem] px-2.5 py-0.5 rounded-full bg-cream border border-ink/10 font-bold">
          {isGame ? "3D & Level Art" : "Full-Stack System"}
        </span>
      </div>

      {/* Focus Tagline */}
      <p className="font-display text-lg sm:text-xl font-medium leading-snug text-ink mb-4">
        "{p.tagline}"
      </p>

      {/* Specification Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 text-[0.82rem] sm:text-[0.86rem]">
        <div className="well p-3 !rounded-xl">
          <span className="eyebrow block !text-[0.65rem] mb-1">Architecture</span>
          <span className="font-semibold text-ink">
            {isGame ? "Unreal & Blender PBR" : "MERN Architecture"}
          </span>
        </div>
        <div className="well p-3 !rounded-xl">
          <span className="eyebrow block !text-[0.65rem] mb-1">Focus</span>
          <span className="font-semibold text-ink">
            {isGame ? "Atmosphere & Tension" : "Realtime Community"}
          </span>
        </div>
      </div>

      {/* Tech Stack Overview */}
      <div className="pt-2">
        <span className="eyebrow block !text-[0.68rem] mb-2.5">Key Technologies</span>
        <div className="flex flex-wrap gap-1.5">
          {p.stack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-ivory border border-ink/10 text-ink shadow-2xs"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectPanel({ p, horizontal }: { p: Project; horizontal: boolean }) {
  return (
    <article
      data-panel
      aria-labelledby={`p-${p.id}`}
      className={`relative px-4 sm:px-6 md:px-10 ${horizontal ? "w-screen h-[100svh] shrink-0 flex items-center pt-20" : "py-12 sm:py-16"}`}
    >
      <div className="mx-auto w-full max-w-[1240px] grid lg:grid-cols-[0.85fr_1.15fr] gap-6 sm:gap-8 lg:gap-14 items-center">
        <div>
          <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <span className="font-display text-6xl sm:text-7xl lg:text-8xl font-light leading-none" style={{ color: "transparent", WebkitTextStroke: "1.5px #2a2831" }} aria-hidden>
              {p.index}
            </span>
            <span className="chip" style={{ ["--chip" as string]: p.tone }}>
              {p.kind === "game" ? "Game & 3D Modeling" : "Full-Stack Software"}
            </span>
          </div>
          <h3 id={`p-${p.id}`} className="font-display text-[clamp(1.75rem,3.4vw,3.1rem)] leading-[1.04] font-semibold tracking-tight">
            {p.title}
          </h3>
          <p className="mt-2.5 sm:mt-3 text-ink-soft leading-relaxed max-w-md text-[0.95rem] sm:text-[1.02rem]">{p.summary}</p>
          <ul className="mt-3.5 sm:mt-4 grid gap-2 text-[0.88rem] sm:text-[0.93rem]">
            {p.points.map((pt) => (
              <li key={pt} className="flex gap-2.5 items-start">
                <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--color-ink)" }} />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
          <ul className="mt-4 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2" aria-label="Technologies used">
            {p.stack.map((s) => (
              <li key={s} className="chip" style={{ ["--chip" as string]: p.tone }}>
                {s}
              </li>
            ))}
          </ul>
          <div className="mt-5 sm:mt-6 flex flex-wrap gap-2 sm:gap-2.5">
            <LinkSlot label="GitHub" href={p.links.github} />
            <LinkSlot label="Live App" href={p.links.live} />
            <LinkSlot label="Walkthrough" href={p.links.video} />
          </div>
        </div>

        <div data-pvis className="min-w-0">
          {p.image ? (
            <figure>
              <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" className="w-full rounded-2xl paper" />
            </figure>
          ) : (
            <ProjectDossier p={p} />
          )}
        </div>
      </div>
    </article>
  );
}

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const { reduced } = useMotion();
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches);
  const horizontal = wide && !reduced;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useScrollScope(
    root,
    ({ desktop, root }) => {
      if (desktop) {
        const t = track.current;
        if (!t) return;
        const dist = () => t.scrollWidth - window.innerWidth;
        const tween = gsap.to(t, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.querySelector("[data-pin]"),
            pin: true,
            scrub: 0.6,
            start: "top top",
            end: () => "+=" + dist(),
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
              if (counter.current) counter.current.textContent = String(Math.min(PROJECTS.length, Math.round(self.progress * PROJECTS.length + 0.49))).padStart(2, "0");
            },
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-panel]", root).forEach((panel) => {
          const v = panel.querySelector("[data-pvis]");
          if (!v) return;
          gsap.fromTo(
            v,
            { y: 50, rotation: 2, opacity: 0.35 },
            { y: 0, rotation: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: panel, containerAnimation: tween, start: "left 95%", end: "left 45%", scrub: true } }
          );
        });
      } else {
        // Mobile view: Clean entrance animation without touch scroll scrubbing
        gsap.utils.toArray<HTMLElement>("[data-panel]", root).forEach((el) => {
          gsap.fromTo(
            el,
            { y: 24, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.65,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            }
          );
        });
      }
    },
    [horizontal]
  );

  return (
    <section ref={root} id="work" aria-label="Projects" className="relative">
      <div data-pin className={horizontal ? "h-[100svh] overflow-hidden relative" : ""}>
        <div ref={track} className={horizontal ? "flex h-full w-max" : ""}>
          {/* Intro panel */}
          <div className={`px-5 md:px-10 ${horizontal ? "w-screen h-[100svh] shrink-0 flex items-center" : "pt-24 pb-6"}`}>
            <div className="mx-auto w-full max-w-[1240px]">
              <SectionHead
                num="03"
                label="Selected Work"
                tone="var(--color-peach)"
                title={
                  <>
                    Featured Projects,
                    <br />
                    <em className="font-light text-lav-deep">crafted with care.</em>
                  </>
                }
                kicker="Full-stack web applications, interactive systems, and atmospheric 3D game environments."
              />
              <p className="mt-8 font-mono text-xs text-ink-soft flex items-center gap-3" data-reveal>
                <span>3 featured works · 2 software · 1 horror game &amp; 3D modeling</span>
              </p>
            </div>
          </div>

          {PROJECTS.map((p) => (
            <ProjectPanel key={p.id} p={p} horizontal={horizontal} />
          ))}
        </div>

        {horizontal && (
          <div className="absolute left-0 right-0 bottom-5 px-10 pointer-events-none" aria-hidden>
            <div className="mx-auto max-w-[1240px] flex items-center gap-4">
              <span className="font-mono text-xs w-14">
                <span ref={counter}>00</span> / {String(PROJECTS.length).padStart(2, "0")}
              </span>
              <div className="flex-1 h-1.5 rounded-full well !rounded-full overflow-hidden">
                <div ref={bar} className="h-full origin-left bg-lav-deep rounded-full transition-transform duration-75" style={{ transform: "scaleX(0)" }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
