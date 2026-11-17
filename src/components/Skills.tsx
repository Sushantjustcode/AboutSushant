import { useRef, useState } from "react";
import { SKILLS } from "../data/profile";
import { revealAll, useScrollScope, gsap } from "../lib/motion";
import { sfx } from "../lib/sfx";
import { SectionHead } from "./Iso";

export function Skills() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Set<string>>(new Set(["fe", "be"]));

  useScrollScope(root, ({ root }) => {
    revealAll(root);
    gsap.from("[data-drawer]", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: { trigger: "[data-cabinet]", start: "top 80%", once: true },
    });
  });

  const toggle = (id: string) => {
    setOpen((s) => {
      const n = new Set(s);
      const was = n.has(id);
      was ? n.delete(id) : n.add(id);
      sfx.drawer(!was);
      return n;
    });
  };

  const allOpen = open.size === SKILLS.length;

  const toggleAll = () => {
    const nextOpen = allOpen ? new Set<string>() : new Set(SKILLS.map((s) => s.id));
    setOpen(nextOpen);
    sfx.drawer(!allOpen);
  };

  return (
    <section ref={root} id="skills" aria-labelledby="skills-title" className="relative px-5 md:px-10 py-24 md:py-32">
      <div className="mx-auto max-w-[1040px]">
        {/* Section Header */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
          <SectionHead
            num="02"
            label="Skills & Tools"
            tone="var(--color-butter)"
            title={
              <span id="skills-title">
                My Tech Stack &amp; <em className="font-light text-lav-deep">Toolkit.</em>
              </span>
            }
            kicker="Full-stack engineering, 3D modeling, and creative game development."
          />
          <button
            data-reveal
            type="button"
            className="key key-sm"
            onClick={toggleAll}
          >
            {allOpen ? "▲ Collapse All" : "▼ Expand All"}
          </button>
        </div>

        {/* Clean, Elegant Drawer Cabinet */}
        <div data-cabinet className="grid sm:grid-cols-2 gap-3.5 sm:gap-4">
          {SKILLS.map((g, i) => {
            const isOpen = open.has(g.id);

            return (
              <div
                key={g.id}
                data-drawer
                className={`paper !rounded-2xl overflow-hidden transition-shadow duration-200 border border-ink/10 ${
                  isOpen ? "shadow-md ring-1 ring-lav-deep/20" : "shadow-xs"
                } ${SKILLS.length % 2 && i === SKILLS.length - 1 ? "sm:col-span-2" : ""}`}
              >
                {/* Drawer Front / Handle Header */}
                <button
                  type="button"
                  onClick={() => toggle(g.id)}
                  aria-expanded={isOpen}
                  aria-controls={`drawer-${g.id}`}
                  className="w-full text-left p-3.5 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Index badge */}
                    <span className="font-mono text-xs font-bold text-ink-soft/70 w-5 sm:w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    {/* Color dot indicator */}
                    <span
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 shadow-xs"
                      style={{ background: g.tone }}
                      aria-hidden
                    />

                    {/* Title and Note */}
                    <div className="min-w-0">
                      <h3 className="font-display text-base sm:text-lg font-bold text-ink leading-tight">
                        {g.label}
                      </h3>
                      <p className="eyebrow !text-[0.62rem] text-ink-soft mt-0.5">
                        {g.note} · {g.items.length} tools
                      </p>
                    </div>
                  </div>

                  {/* Clean Skeuomorphic Pull Handle */}
                  <div className="flex items-center gap-2">
                    <span
                      className="font-mono text-[0.68rem] text-ink-soft/70 hidden sm:inline"
                    >
                      {isOpen ? "Close" : "Open"}
                    </span>
                    <span
                      className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full flex items-center justify-center border transition-colors duration-200 ${
                        isOpen
                          ? "bg-ink text-ivory border-ink shadow-inner"
                          : "bg-cream/80 text-ink border-ink/20 shadow-xs"
                      }`}
                    >
                      <span
                        className={`text-[0.65rem] sm:text-xs transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </span>
                  </div>
                </button>

                {/* Drawer Slide-Out Contents with smooth grid animation */}
                <div
                  id={`drawer-${g.id}`}
                  className="grid overflow-hidden"
                  style={{
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    transition: "grid-template-rows 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease",
                  }}
                >
                  <div className="overflow-hidden min-h-0">
                    <div className="p-3.5 pt-1 sm:p-5 sm:pt-1 border-t border-ink/5 bg-cream/35">
                      <ul className="flex flex-wrap gap-1.5 sm:gap-2 pt-2" aria-hidden={!isOpen}>
                        {g.items.map((it) => (
                          <li key={it}>
                            <span
                              className="chip !text-[0.76rem] !py-1 !px-2.5 shadow-xs"
                              style={{
                                ["--chip" as string]: g.tone,
                              }}
                            >
                              {it}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
