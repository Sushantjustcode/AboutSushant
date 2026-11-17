import { useRef } from "react";
import { PROFILE } from "../data/profile";
import { gsap, useScrollScope } from "../lib/motion";

function Doodle() {
  return (
    <svg viewBox="0 0 320 130" className="w-full max-h-[120px]" fill="none" stroke="#2a2831" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {/* laptop */}
      <rect x="14" y="30" width="96" height="60" rx="6" fill="#bdb6d9" />
      <path d="M4 98h116l-8 8H12z" fill="#eee4d0" />
      <path d="M44 52l-12 12 12 12M80 52l12 12-12 12M66 48l-8 32" />
      {/* seam */}
      <path d="M148 14v108" strokeDasharray="3 7" opacity=".5" />
      {/* tree */}
      <path d="M205 100l-26 0 20-28h-12l18-26h-10l20-30 20 30h-10l18 26h-12l20 28z" fill="#bccbad" transform="translate(-10 4)" />
      <path d="M205 100v14" />
      {/* controller */}
      <rect x="236" y="62" width="70" height="38" rx="18" fill="#f1c9aa" />
      <path d="M254 74v14M247 81h14" />
      <circle cx="285" cy="76" r="2.5" fill="#2a2831" />
      <circle cx="292" cy="84" r="2.5" fill="#2a2831" />
    </svg>
  );
}

function LeftPage() {
  return (
    <div className="h-full p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col justify-between gap-3 overflow-hidden">
      <div>
        <p className="eyebrow">Page 01 · Who I Am</p>
        <h3 className="font-display text-xl sm:text-2xl md:text-[1.75rem] leading-[1.1] font-semibold mt-1">
          Two benches,
          <br />
          <em className="font-light text-lav-deep">one craftsman desk.</em>
        </h3>
      </div>
      <Doodle />
      <dl className="grid gap-2.5 text-[0.85rem] sm:text-[0.88rem]">
        <div>
          <dt className="eyebrow">Education & University</dt>
          <dd className="font-semibold text-ink">BCA — Artificial Intelligence (BCA - AI)</dd>
          <dd className="text-ink-soft text-xs">Kurukshetra University (KUK)</dd>
        </div>
        <div>
          <dt className="eyebrow">Current Focus</dt>
          <dd className="font-semibold">MERN Stack Engineering & 3D Level Art</dd>
          <dd className="text-xs text-ink-soft">Internship at JC Software Solutions, Mohali</dd>
        </div>
        <div>
          <dt className="eyebrow">Off-screen Interests</dt>
          <dd className="flex flex-wrap gap-1.5 mt-1">
            {["Football", "Basketball", "Game Modding", "Synthesizers"].map((t, i) => (
              <span key={t} className="chip !text-[0.7rem] !py-0.5 !px-2" style={{ ["--chip" as string]: ["var(--color-sage)", "var(--color-peach)", "var(--color-lav)", "var(--color-butter)"][i % 4] }}>
                {t}
              </span>
            ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function About() {
  const root = useRef<HTMLElement>(null);
  const book = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);

  useScrollScope(root, ({ desktop, root }) => {
    if (!desktop) {
      // Mobile view: Clean, instant entrance animation (no scroll scrubbing)
      gsap.utils.toArray<HTMLElement>("[data-about-in]", root).forEach((el) => {
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
      return;
    }
    // Desktop view only: 3D Book Cover scroll scrubbing
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: root, start: "top top", end: "+=120%", pin: true, scrub: 0.7, anticipatePin: 1 },
    });
    gsap.set(cover.current, { rotationY: 0 });
    gsap.set(book.current, { xPercent: -25, rotationX: 14 });
    gsap.set("[data-page-in]", { opacity: 0, y: 14 });
    tl.to(cover.current, { rotationY: -180, duration: 1 }, 0.1)
      .to(book.current, { xPercent: 0, rotationX: 0, duration: 1 }, 0.1)
      .to("[data-page-in]", { opacity: 1, y: 0, stagger: 0.08, duration: 0.35, ease: "power2.out" }, 0.75)
      .to({}, { duration: 0.3 });
  });

  return (
    <section ref={root} id="about" aria-labelledby="about-title" className="relative px-4 sm:px-6 md:px-10 py-16 sm:py-20 min-[900px]:py-0 min-[900px]:h-[100svh] flex items-center">
      <div className="mx-auto w-full max-w-[1100px]">
        <div className="min-[900px]:flex items-end justify-between mb-5 min-[900px]:mb-5">
          <div data-about-in>
            <div className="flex items-center gap-3 mb-2.5 sm:mb-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-lav shadow-[0_2px_0_rgba(42,40,49,.25),inset_0_1px_0_rgba(255,255,255,.6)]">01</span>
              <span className="eyebrow">About Sushant</span>
            </div>
            <h2 id="about-title" className="font-display text-[clamp(2rem,5vw,3.8rem)] leading-none font-semibold tracking-tight">
              Background, craft &amp; <em className="font-light text-lav-deep">philosophy.</em>
            </h2>
          </div>
        </div>

        <div className="min-[900px]:[perspective:2400px]">
          <div ref={book} className="relative min-[900px]:h-[min(540px,calc(100svh-15rem))] preserve grid gap-4 sm:gap-5 min-[900px]:block">
            {/* left page — mobile only */}
            <div data-about-in className="paper min-[900px]:hidden">
              <LeftPage />
            </div>

            {/* right page */}
            <div className="paper min-[900px]:absolute min-[900px]:left-1/2 min-[900px]:w-1/2 min-[900px]:h-full !rounded-l-md min-[900px]:!rounded-l-none" data-about-in>
              <div className="h-full p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col justify-between gap-3 text-[0.88rem] md:text-[0.91rem] leading-relaxed overflow-hidden">
                <div className="flex flex-col gap-2.5">
                  <p className="eyebrow" data-page-in>
                    Page 02 · Story & Introduction
                  </p>
                  <p data-page-in className="font-display text-[1.28rem] md:text-[1.35rem] leading-snug font-semibold text-ink">
                    Hi, I'm {PROFILE.name.split(" ")[0]}. Doing <b>BCA - AI</b> at Kurukshetra University.
                  </p>
                  <p data-page-in>
                    At the <b>code bench</b>, I build full-stack web applications using the MERN stack (MongoDB, Express, React, Node.js) and modern Tailwind CSS. Creator of <b>Findit</b> — a lost-and-found community platform connecting people and reuniting belongings.
                  </p>
                  <p data-page-in>
                    At the <b>world bench</b>, I construct atmospheric horror forest environments and game-ready 3D assets in Blender and Unreal Engine with PBR texturing.
                  </p>
                  <p data-page-in className="text-[0.86rem] text-ink-soft">
                    Passionate about clean architecture, responsive micro-interactions, and immersive 3D craft.
                  </p>
                </div>
                <div data-page-in className="pt-2 flex flex-wrap gap-1.5 border-t border-ink/10">
                  <span className="chip !text-[0.72rem] !py-0.5 !px-2" style={{ ["--chip" as string]: "var(--color-blue)" }}>
                    MERN stack
                  </span>
                  <span className="chip !text-[0.72rem] !py-0.5 !px-2" style={{ ["--chip" as string]: "var(--color-sage)" }}>
                    Horror Level Art
                  </span>
                  <span className="chip !text-[0.72rem] !py-0.5 !px-2" style={{ ["--chip" as string]: "var(--color-butter)" }}>
                    BCA - AI @ KUK
                  </span>
                </div>
              </div>
            </div>

            {/* cover (desktop) */}
            <div
              ref={cover}
              className="hidden min-[900px]:block absolute left-1/2 top-0 w-1/2 h-full preserve"
              style={{ transformOrigin: "left center", transform: "rotateY(-180deg)" }}
            >
              {/* front */}
              <div
                className="plastic absolute inset-0 !rounded-l-md !rounded-r-2xl p-8 flex flex-col justify-between"
                style={{ ["--tone" as string]: "var(--color-blue)", backfaceVisibility: "hidden", backgroundImage: "linear-gradient(160deg, rgba(255,255,255,.5), rgba(255,255,255,0) 45%), var(--noise)", backgroundBlendMode: "multiply" }}
              >
                <span className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/25 to-transparent rounded-l-md" aria-hidden />
                <p className="eyebrow !text-ink/70">Vol. 01 · Dual Bench</p>
                <div className="emboss">
                  <p className="font-display text-5xl leading-none font-semibold text-ink/80">Field</p>
                  <p className="font-display text-5xl leading-none italic font-light text-ink/80">Notes</p>
                  <div className="mt-5 h-px w-24 bg-ink/40" />
                  <p className="mt-3 font-mono text-xs tracking-widest uppercase text-ink/70">{PROFILE.name}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span className="deboss font-mono text-[0.7rem]">BCA - AI · KUK · MERN</span>
                  <span className="w-10 h-14 rounded-sm bg-peach shadow-[0_2px_4px_rgba(0,0,0,.3)]" aria-hidden />
                </div>
              </div>
              {/* back = left page */}
              <div className="paper absolute inset-0 !rounded-r-none" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
                <LeftPage />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
