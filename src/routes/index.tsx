import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowDown, Instagram, Mail, MessageCircle, Moon, Phone, Sun, X } from "lucide-react";
import { LazyRoom } from "@/components/room/LazyRoom";
import { FURNITURE, ROOMS, STYLES, type RoomKey, type StyleKey } from "@/components/room/data";
// REPLACE: swap these placeholder images with your real project photos.
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
const p5 = p1;
const p6 = p3;

const TITLE = "Dream Home Visuals — Walk through your redesigned home";
const DESC = "Interactive 3D room makeovers by @dream_homevisuals. Compare before and after, try styles, and explore our interior design portfolio.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const IG = "https://www.instagram.com/dream_homevisuals";

// REPLACE: project titles and locations.
const PROJECTS = [
  { src: p1, title: "The Green Salon", place: "Living room · Mumbai" },
  { src: p2, title: "Quiet Linen", place: "Bedroom · Pune" },
  { src: p3, title: "Brass & Marble", place: "Kitchen · Bengaluru" },
  { src: p4, title: "Golden Hour Dining", place: "Dining · Jaipur" },
  { src: p5, title: "Navy Study", place: "Home office · Delhi" },
  { src: p6, title: "Sage Retreat", place: "Bathroom · Goa" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-accent">{children}</p>;
}

function Nav({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <a href="#top" className="font-display text-lg text-foreground">Dream Home Visuals</a>
        <nav className="hidden gap-7 text-sm text-muted-foreground md:flex">
          {[["Before/After", "#compare"], ["Studio", "#studio"], ["Portfolio", "#work"], ["Contact", "#contact"]].map(([l, h]) => (
            <a key={h} href={h} className="hover:text-foreground">{l}</a>
          ))}
        </nav>
        <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <LazyRoom mode="hero" className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-20 md:justify-center md:pb-0">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-xl">
          <Eyebrow>@dream_homevisuals</Eyebrow>
          <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-7xl">See your room before it's redone</h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">Room makeovers and interior visuals you can walk through, restyle and relight — right in your browser.</p>
          <a href="#compare" className="pointer-events-auto mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Explore the room <ArrowDown size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

function BeforeAfter() {
  const [pos, setPos] = useState(50);
  return (
    <section id="compare" className="mx-auto max-w-7xl px-5 py-24">
      <Eyebrow>01 · Before / After</Eyebrow>
      <h2 className="max-w-2xl font-display text-4xl text-foreground md:text-5xl">Drag to reveal the makeover</h2>
      <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-lg border border-border md:aspect-[16/8]">
        <LazyRoom mode="static" className="absolute inset-0" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <LazyRoom mode="static" grey className="absolute inset-0" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent" style={{ left: `${pos}%` }}>
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">⇆</div>
        </div>
        <span className="absolute left-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground">Before</span>
        <span className="absolute right-4 top-4 rounded-full bg-background/80 px-3 py-1 text-xs text-foreground">After</span>
        <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Before and after slider"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0" />
      </div>
    </section>
  );
}

function Studio() {
  const [style, setStyle] = useState<StyleKey>("modern");
  const [night, setNight] = useState(false);
  const [room, setRoom] = useState<RoomKey>("living");
  const [sel, setSel] = useState<string | null>(null);
  const s = STYLES[style];
  const info = sel ? FURNITURE[sel] : null;
  return (
    <section id="studio" className="bg-muted py-24">
      <div className="mx-auto max-w-7xl px-5">
        <Eyebrow>02 · Design studio</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl font-display text-4xl text-foreground md:text-5xl">Restyle, relight and walk through</h2>
          <div role="tablist" aria-label="Rooms" className="flex rounded-full border border-border bg-background p-1">
            {(Object.keys(ROOMS) as RoomKey[]).map((k) => (
              <button key={k} role="tab" aria-selected={room === k} onClick={() => { setRoom(k); setSel(null); }}
                className={`rounded-full px-4 py-2 text-sm transition ${room === k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {ROOMS[k].label}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={room} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 max-w-2xl text-muted-foreground">
            {ROOMS[room].blurb}
          </motion.p>
        </AnimatePresence>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border lg:aspect-auto lg:h-[560px]">
            <LazyRoom mode="studio" style={style} night={night} room={room} onSelect={setSel} onMissed={() => setSel(null)} className="absolute inset-0" />
            <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">Drag to look around · click furniture</p>
            <AnimatePresence>
              {info && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-3 top-3 w-64 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-lg" role="dialog" aria-label={info.name}>
                  <button onClick={() => setSel(null)} aria-label="Close" className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"><X size={16} /></button>
                  <h3 className="font-display text-lg">{info.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-wider text-accent">{info.material}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{info.tip}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="space-y-8 rounded-lg border border-border bg-background p-6">
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Style</h3>
              <div className="grid gap-2">
                {(Object.keys(STYLES) as StyleKey[]).map((k) => (
                  <button key={k} onClick={() => setStyle(k)} aria-pressed={style === k}
                    className={`flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm transition ${style === k ? "border-accent bg-muted text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    {STYLES[k].label}
                    <span className="h-4 w-4 rounded-full border border-border" style={{ background: STYLES[k].sofa }} />
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2" aria-label="Palette swatches">
                {(["wall", "floor", "sofa", "rug", "accent"] as const).map((k) => (
                  <div key={k} className="flex-1 text-center">
                    <motion.div animate={{ backgroundColor: s[k] }} className="h-10 rounded border border-border" />
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-medium text-foreground">Lighting</h3>
              <button role="switch" aria-checked={night} onClick={() => setNight(!night)}
                className="flex w-full items-center justify-between rounded-md border border-border px-3 py-2.5 text-sm text-foreground">
                <span className="flex items-center gap-2">{night ? <Moon size={16} /> : <Sun size={16} />}{night ? "Evening" : "Daylight"}</span>
                <span className={`relative h-5 w-9 rounded-full transition ${night ? "bg-primary" : "bg-border"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${night ? "left-4" : "left-0.5"}`} />
                </span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function TiltCard({ p, onOpen }: { p: (typeof PROJECTS)[number]; onOpen: () => void }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <button onClick={onOpen} onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setT({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 }); }}
      onMouseLeave={() => setT({ x: 0, y: 0 })} className="group block text-left [perspective:900px]" aria-label={`Open ${p.title}`}>
      <div className="overflow-hidden rounded-lg transition-transform duration-200" style={{ transform: `rotateY(${t.x * 10}deg) rotateX(${-t.y * 10}deg)` }}>
        <img src={p.src} alt={p.title} loading="lazy" width={800} height={1008} className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <h3 className="mt-3 font-display text-lg text-foreground">{p.title}</h3>
      <p className="text-sm text-muted-foreground">{p.place}</p>
    </button>
  );
}

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((open + 1) % PROJECTS.length);
      if (e.key === "ArrowLeft") setOpen((open - 1 + PROJECTS.length) % PROJECTS.length);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <section id="work" className="mx-auto max-w-7xl px-5 py-24">
      <Eyebrow>03 · Portfolio</Eyebrow>
      <h2 className="font-display text-4xl text-foreground md:text-5xl">Recent makeovers</h2>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((p, i) => <TiltCard key={p.title} p={p} onOpen={() => setOpen(i)} />)}
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-foreground/85 p-5" role="dialog" aria-modal="true" aria-label={PROJECTS[open].title}>
            <button autoFocus onClick={() => setOpen(null)} aria-label="Close" className="absolute right-5 top-5 text-background"><X /></button>
            <motion.img key={open} initial={{ scale: 0.96 }} animate={{ scale: 1 }} src={PROJECTS[open].src} alt={PROJECTS[open].title}
              className="max-h-[85vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            <p className="absolute bottom-6 font-display text-background">{PROJECTS[open].title}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="bg-primary py-24 text-primary-foreground">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-accent">Let's redesign your space</p>
        <h2 className="font-display text-4xl md:text-6xl">Ready to see your room reimagined?</h2>
        <a href={IG} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 font-medium text-accent-foreground transition hover:opacity-90">
          <Instagram size={18} /> Message us on Instagram
        </a>
        {/* REPLACE: placeholder WhatsApp number, email and phone */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm opacity-80">
          <a href="https://wa.me/910000000000" className="flex items-center gap-2 hover:opacity-100"><MessageCircle size={16} /> WhatsApp</a>
          <a href="mailto:hello@dreamhomevisuals.com" className="flex items-center gap-2 hover:opacity-100"><Mail size={16} /> hello@dreamhomevisuals.com</a>
          <a href="tel:+910000000000" className="flex items-center gap-2 hover:opacity-100"><Phone size={16} /> +91 00000 00000</a>
        </div>
        <p className="mt-16 text-xs opacity-60">© {new Date().getFullYear()} Dream Home Visuals · @dream_homevisuals</p>
      </div>
    </section>
  );
}

function Index() {
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);
  return (
    <main className="bg-background">
      <Nav dark={dark} setDark={setDark} />
      <Hero />
      <BeforeAfter />
      <Studio />
      <Gallery />
      <Contact />
    </main>
  );
}
