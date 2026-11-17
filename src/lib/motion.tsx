import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return globalLenis;
}

export function smoothScrollTo(target: string | HTMLElement | number, offset = 0) {
  if (globalLenis) {
    globalLenis.scrollTo(target, {
      offset,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
  } else if (typeof target === "string") {
    const el = document.querySelector(target);
    el?.scrollIntoView({ behavior: "smooth" });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

export type PerformanceTier = "high" | "balanced" | "low";

function detectPerformanceTier(): PerformanceTier {
  if (typeof window === "undefined") return "high";

  // Respect reduced motion explicitly
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low";
  }

  // Check Save-Data / network hints
  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData || conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") {
    return "low";
  }

  // Hardware heuristics
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 8;

  if (cores <= 2 || memory <= 2) {
    return "low";
  }

  if (cores <= 4 || memory <= 4) {
    return "balanced";
  }

  return "high";
}

type MotionState = {
  reduced: boolean;
  userOff: boolean;
  tier: PerformanceTier;
  toggle: () => void;
  lenis: Lenis | null;
};

const Ctx = createContext<MotionState>({
  reduced: false,
  userOff: false,
  tier: "high",
  toggle: () => {},
  lenis: null,
});

export function MotionProvider({ children }: { children: ReactNode }) {
  const [tier, setTier] = useState<PerformanceTier>(detectPerformanceTier);
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  // Monitor prefers-reduced-motion changes dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      const isReduced = mq.matches;
      setReduced(isReduced);
      if (isReduced) setTier("low");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Adaptive Ultra-Smooth 60/120fps Lenis Smooth Scrolling Engine
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia("(max-width: 899px)").matches;
    const isLow = tier === "low" || reduced;
    const isBalanced = tier === "balanced";

    const lenis = new Lenis({
      duration: isMobile ? 0.6 : isLow ? 0.8 : isBalanced ? 1.0 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: isMobile ? 1.0 : 1.15,
      infinite: false,
    });

    globalLenis = lenis;
    setLenisInstance(lenis);

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Intercept in-page anchor clicks for smooth scroll
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, {
            offset: -60,
            duration: isLow ? 0.6 : 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      }
    };
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      globalLenis = null;
      setLenisInstance(null);
    };
  }, [tier, reduced]);

  useEffect(() => {
    document.documentElement.classList.remove("no-motion");
  }, []);

  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 800);
    return () => window.clearTimeout(t);
  }, []);

  const value = useMemo(
    () => ({ reduced, userOff: false, tier, toggle: () => {}, lenis: lenisInstance }),
    [reduced, tier, lenisInstance]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMotion = () => useContext(Ctx);
export const usePerformance = () => useContext(Ctx).tier;

export function useScrollScope(
  scope: RefObject<HTMLElement | null>,
  setup: (info: { desktop: boolean; root: HTMLElement }) => void | (() => void),
  deps: unknown[] = []
) {
  const { reduced } = useMotion();
  useEffect(() => {
    const root = scope.current;
    if (!root || reduced) return;
    const mm = gsap.matchMedia(root);
    mm.add({ desktop: "(min-width: 900px)", mobile: "(max-width: 899px)" }, (ctx) => {
      const { desktop } = ctx.conditions as { desktop: boolean };
      return setup({ desktop, root });
    });
    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, ...deps]);
}

export function revealAll(root: HTMLElement, selector = "[data-reveal]") {
  const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
  if (!els.length) return;
  gsap.set(els, { opacity: 0, y: 30 });
  ScrollTrigger.batch(els, {
    start: "top 90%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power2.out",
        overwrite: true,
      }),
  });
}

export { gsap, ScrollTrigger };
