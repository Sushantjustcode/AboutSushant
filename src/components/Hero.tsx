import { useEffect, useRef, useState } from "react";
import { PROFILE } from "../data/profile";
import { Magnetic } from "./Magnetic";
import { gsap, useMotion, useScrollScope, smoothScrollTo } from "../lib/motion";
import { downloadResume } from "../lib/resume";
import { sfx } from "../lib/sfx";
import sushantAvatar1 from "../assets/sushant_1.webp";
import sushantAvatar2 from "../assets/sushant_2.webp";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { reduced } = useMotion();

  // Gentle, soothing tilt on cursor move (fine pointer only, scoped to card for high performance)
  useEffect(() => {
    const el = cardRef.current;
    if (!el || reduced || !window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        gsap.to(el, {
          rotationY: nx * 8,
          rotationX: -ny * 8,
          duration: 0.6,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      });
    };

    const leave = () => {
      cancelAnimationFrame(raf);
      gsap.to(el, {
        rotationY: 0,
        rotationX: 0,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  useScrollScope(root, () => {
    gsap.from("[data-hero-fade]", {
      y: 28,
      opacity: 0,
      duration: 1.1,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.2,
    });
    gsap.from(cardRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      delay: 0.3,
    });
  });

  return (
    <section
      ref={root}
      id="top"
      className="relative min-h-[88svh] pt-20 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 md:px-10 flex items-center overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Calm, consistent ambient aura — lightweight blur */}
      <div
        aria-hidden
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[300px] sm:w-[500px] sm:h-[450px] lg:w-[680px] lg:h-[560px] rounded-full blur-[80px] sm:blur-[120px] pointer-events-none -z-10"
        style={{
          background: "radial-gradient(circle, rgba(236,216,150,0.22) 0%, rgba(189,182,217,0.14) 50%, transparent 75%)",
        }}
      />

      <div className="mx-auto w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 lg:gap-14 items-center">
        {/* Block 1: Badges & Headline (Desktop Left Top / Mobile 1st) */}
        <div className="order-1 lg:col-start-1">
          <div data-hero-fade className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-3 sm:mb-5">
            <span className="eyebrow flex items-center gap-2 px-3 py-1 rounded-full bg-cream/70 border border-ink/10 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-sage-deep" />
              <span>THE DUAL BENCH</span>
            </span>
            <span className="chip !text-[0.72rem] !py-0.5 !px-2.5 bg-lav/20 border border-lav-deep/20 text-ink">
              🎓 BCA - AI @ Kurukshetra University
            </span>
          </div>

          <h1
            id="hero-title"
            data-hero-fade
            className="font-display font-semibold leading-[0.98] sm:leading-[0.94] tracking-tight text-[clamp(2.3rem,6.5vw,5.4rem)] text-ink"
          >
            Building with craft, <br />
            <span className="italic font-light text-lav-deep">shaping quiet worlds.</span>
          </h1>
        </div>

        {/* Block 2: Standalone Skeuomorph 3D Art Illustration (Desktop Right Column / Mobile 2nd) */}
        <div className="order-2 lg:col-start-2 lg:row-span-2 relative flex justify-center lg:justify-end items-center my-1 sm:my-3 lg:my-0">
          <div
            ref={cardRef}
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
            onClick={() => setIsHovered((v) => !v)}
            className="relative w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[420px] aspect-square flex items-center justify-center cursor-pointer select-none"
            title="Sushant Chauhan · 3D Art Illustration (Tap/Hover to transform pose)"
          >
            {/* Steady backdrop aura */}
            <div
              aria-hidden
              className="absolute inset-4 rounded-full blur-[50px] sm:blur-[70px] pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(236,216,150,0.25) 0%, rgba(189,182,217,0.18) 50%, transparent 75%)",
              }}
            />

            {/* Seamless 3D Character Sculpt Container */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                filter: "drop-shadow(0 16px 28px rgba(42, 40, 49, 0.11))",
              }}
            >
              {/* Variant 1: Calm, confident 3D sculpt developer pose (High-priority LCP) */}
              <img
                src={sushantAvatar1}
                alt="Sushant Chauhan - 3D Art Illustration"
                width={420}
                height={420}
                fetchPriority="high"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ease-in-out select-none ${isHovered ? "opacity-0" : "opacity-100"
                  }`}
              />

              {/* Variant 2: Playful 3D sculpt with wink */}
              <img
                src={sushantAvatar2}
                alt="Sushant Chauhan - Playful 3D Art Illustration"
                width={420}
                height={420}
                loading="lazy"
                decoding="async"
                className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ease-in-out select-none ${isHovered ? "opacity-100" : "opacity-0"
                  }`}
              />
            </div>
          </div>
        </div>

        {/* Block 3: Bio, Tags, and Action & Contact Buttons (Desktop Left Bottom / Mobile 3rd) */}
        <div className="order-3 lg:col-start-1">
          <p
            data-hero-fade
            className="text-[0.98rem] sm:text-[1.12rem] leading-relaxed text-ink-soft font-normal max-w-[34rem]"
          >
            Hi, I'm <strong className="text-ink font-semibold">{PROFILE.name}</strong>. Doing BCA - AI from KUK University. I design full-stack MERN applications at one bench and build atmospheric game environments and 3D assets at the other.
          </p>

          {/* Simple, peaceful tag row without click sound or hover bounce */}
          <div data-hero-fade className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2">
            <span className="chip !text-[0.76rem]" style={{ ["--chip" as string]: "var(--color-lav)" }}>
              💻 MERN Stack
            </span>
            <span className="chip !text-[0.76rem]" style={{ ["--chip" as string]: "var(--color-sage)" }}>
              🌲 3D Environment Art
            </span>
            <span className="chip !text-[0.76rem]" style={{ ["--chip" as string]: "var(--color-butter)" }}>
              ⚡ Level Design
            </span>
          </div>

          {/* Action Buttons */}
          <div data-hero-fade className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <button
                type="button"
                className="key key-ink !px-5 sm:!px-6 !py-2.5 sm:!py-3 text-sm sm:text-base"
                onClick={() => {
                  sfx.click();
                  smoothScrollTo("#about", -40);
                }}
              >
                <span>Explore Workshop</span>
                <span aria-hidden>↓</span>
              </button>
            </Magnetic>

            <Magnetic>
              <button
                type="button"
                className="key key-butter !px-5 sm:!px-6 !py-2.5 sm:!py-3 text-sm sm:text-base"
                onClick={() => {
                  sfx.coin();
                  downloadResume();
                }}
              >
                <span>⇩ Résumé</span>
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
