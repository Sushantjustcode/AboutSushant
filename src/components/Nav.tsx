import { useEffect, useRef, useState } from "react";
import { NAV } from "../data/profile";
import { smoothScrollTo } from "../lib/motion";
import { downloadResume } from "../lib/resume";
import { sfx } from "../lib/sfx";

export function Nav() {
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const hero = document.getElementById("top");
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(""), { rootMargin: "-45% 0px -50% 0px" });
    if (hero) heroIo.observe(hero);

    let max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const updateMax = () => {
      max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    };
    window.addEventListener("resize", updateMax, { passive: true });

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / max))})`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      heroIo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateMax);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleNavClick = (id: string) => {
    sfx.click();
    setOpen(false);
    smoothScrollTo(`#${id}`, -40);
  };

  return (
    <>
      <a href="#main" className="skip key key-butter">
        Skip to content
      </a>
      <nav aria-label="Primary" className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-[980px]">
        <div className="paper !rounded-2xl px-3 py-2 flex items-center gap-2 relative overflow-hidden backdrop-blur-md shadow-lg border border-white/50" style={{ background: "rgba(251,247,238,.94)" }}>
          <a
            href="#top"
            className="key key-sm key-lav font-display !text-base group transition-all duration-300 hover:scale-110 active:scale-95"
            aria-label="Sushant Chauhan — back to top"
            onClick={(e) => {
              e.preventDefault();
              sfx.click();
              smoothScrollTo(0);
            }}
          >
            <span className="group-hover:rotate-6 inline-block transition-transform duration-300">SC</span>
          </a>

          {/* Desktop navigation - centered */}
          <ul className="hidden md:flex items-center gap-1.5 mx-auto">
            {NAV.map((n) => {
              const isCurrent = active === n.id;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => handleNavClick(n.id)}
                    className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-[0.84rem] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 ${
                      isCurrent
                        ? "bg-ink text-ivory shadow-[inset_0_2px_4px_rgba(0,0,0,.4),0_2px_6px_rgba(42,40,49,.2)] scale-105"
                        : "text-ink-soft hover:bg-cream hover:text-ink hover:shadow-sm"
                    }`}
                  >
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 ml-auto md:ml-0">
            {/* Audio Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sage/35 text-[0.72rem] font-mono font-medium text-ink/80 select-none">
              <span className="w-2 h-2 rounded-full bg-sage-deep animate-pulse" />
              <span>SFX ON</span>
            </div>

            <button
              className="key key-sm key-butter hidden sm:inline-flex hover:scale-105 transition-all duration-200"
              onClick={() => {
                sfx.coin();
                downloadResume();
              }}
            >
              <span className="inline-block transition-transform hover:-translate-y-0.5 duration-200">⇩</span> Resume
            </button>

            {/* Mobile menu button */}
            <button
              className="key key-sm block md:!hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => {
                sfx.click();
                setOpen((v) => !v);
              }}
            >
              {open ? "✕ Close" : "☰ Menu"}
            </button>
          </div>

          <div aria-hidden className="absolute left-0 right-0 bottom-0 h-[3px] bg-ink/10">
            <div ref={bar} className="h-full origin-left bg-lav-deep transition-transform duration-75" style={{ transform: "scaleX(0)" }} />
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {open && (
          <div id="mobile-menu" className="md:!hidden paper !rounded-2xl mt-2 p-3 grid grid-cols-2 gap-2 shadow-2xl border border-white/50 animate-in fade-in slide-in-from-top-2 duration-300">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                className={`key w-full text-center transition-all duration-200 ${active === n.id ? "key-lav font-bold" : ""}`}
                onClick={() => handleNavClick(n.id)}
              >
                {n.label}
              </button>
            ))}
            <div className="col-span-2 pt-1 border-t border-ink/10 flex gap-2">
              <button
                className="key key-butter w-full justify-center transition-all duration-200"
                onClick={() => {
                  sfx.coin();
                  downloadResume();
                }}
              >
                ⇩ Download Resume
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
