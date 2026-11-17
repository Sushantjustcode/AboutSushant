import { MotionProvider } from "./lib/motion";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Games } from "./components/Games";
import { Path } from "./components/Path";
import { Awards } from "./components/Awards";
import { Contact } from "./components/Contact";

export default function App() {
  return (
    <MotionProvider>
      <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 10% 8%, rgba(189,182,217,.35), transparent 70%), radial-gradient(50% 45% at 92% 30%, rgba(241,201,170,.32), transparent 70%), radial-gradient(55% 50% at 20% 85%, rgba(188,203,173,.35), transparent 70%)" }} />
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Path />
        <Awards />
        <Games />
      </main>
      <Contact />
    </MotionProvider>
  );
}
