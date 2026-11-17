import { useRef } from "react";
import { EXPERIENCE } from "../data/profile";
import { gsap, revealAll, useScrollScope } from "../lib/motion";
import { SectionHead } from "./Iso";

export function Path() {
  const root = useRef<HTMLElement>(null);

  useScrollScope(root, ({ desktop, root }) => {
    revealAll(root, "[data-reveal]");

    if (desktop) {
      // Desktop view only: Timeline path draws itself on scroll scrubbing
      gsap.fromTo(
        "[data-line]",
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-timeline]", start: "top 70%", end: "bottom 60%", scrub: 0.5 } }
      );
      gsap.utils.toArray<HTMLElement>("[data-node]", root).forEach((n) => {
        gsap.fromTo(
          n,
          { scale: 0.4, backgroundColor: "#cfc8ba" },
          { scale: 1, backgroundColor: "#2a2831", duration: 0.4, ease: "back.out(3)", scrollTrigger: { trigger: n, start: "top 68%", toggleActions: "play none none reverse" } }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-ticket]", root).forEach((t, i) => {
        gsap.from(t, {
          x: (i % 2 ? 1 : -1) * 60,
          opacity: 0,
          rotate: (i % 2 ? 1 : -1) * 2,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: t, start: "top 85%", once: true },
        });
      });
    } else {
      // Mobile view: Clean entrance animations without touch scroll scrub
      gsap.set("[data-line]", { scaleY: 1 });
      gsap.utils.toArray<HTMLElement>("[data-ticket]", root).forEach((t) => {
        gsap.fromTo(
          t,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            ease: "power2.out",
            scrollTrigger: { trigger: t, start: "top 88%", once: true },
          }
        );
      });
    }
  });

  return (
    <section ref={root} id="path" aria-labelledby="path-title" className="relative px-4 sm:px-6 md:px-10 py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-[1000px]">
        <SectionHead
          num="04"
          label="The Path"
          tone="var(--color-blue)"
          title={
            <span id="path-title">
              Experience & <em className="font-light text-lav-deep">milestones.</em>
            </span>
          }
          kicker="MERN stack internship in Mohali, specialized backend engineering training, and industrial software development."
        />

        <ol data-timeline className="relative mt-12 sm:mt-16 grid gap-8 sm:gap-10">
          <div aria-hidden className="absolute left-[15px] md:left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded bg-ink/10" />
          <div aria-hidden data-line className="absolute left-[15px] md:left-1/2 top-2 bottom-2 w-[3px] -translate-x-1/2 rounded bg-ink origin-top" />
          {EXPERIENCE.map((e, i) => (
            <li key={e.id} className="relative grid md:grid-cols-2 md:gap-16 pl-10 sm:pl-12 md:pl-0">
              <span data-node aria-hidden className="absolute left-[15px] md:left-1/2 top-8 w-5 h-5 -translate-x-1/2 rounded-full border-4 border-ivory z-10 shadow-xs" />
              <div
                data-ticket
                className={`paper p-5 sm:p-6 relative transition-shadow duration-200 hover:shadow-md ${i % 2 ? "md:col-start-2" : "md:col-start-1"
                  }`}
              >
                <span aria-hidden className="absolute left-0 top-0 bottom-0 w-2 rounded-l-[14px]" style={{ background: e.tone }} />
                {/* ticket notches */}
                <span aria-hidden className="absolute -left-2 top-1/2 w-4 h-4 rounded-full bg-[var(--bg)] shadow-[inset_-2px_0_3px_rgba(0,0,0,.15)] md:hidden" />
                <p className="eyebrow flex items-center gap-1.5">
                  <span>Stop {String(i + 1).padStart(2, "0")}</span>
                  {e.period ? <span className="font-bold text-ink">· {e.period}</span> : ""}
                </p>
                <h3 className="font-display text-2xl font-semibold leading-tight mt-1.5">{e.role}</h3>
                <p className="font-mono text-[0.82rem] font-bold text-lav-deep mt-1">{e.org}</p>
                {e.points && e.points.length > 0 ? (
                  <ul className="mt-3.5 space-y-2 text-[0.92rem] text-ink-soft">
                    {e.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <span className="text-lav-deep font-bold leading-none mt-1 select-none text-[0.7rem]">●</span>
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 leading-relaxed text-[0.97rem] text-ink-soft">{e.detail}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
