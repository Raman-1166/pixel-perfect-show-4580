import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Instagram,
  Mail,
  MessageCircle,
  Moon,
  Phone,
  Sun,
  X,
} from "lucide-react";
import { DreamHomeViewer } from "@/components/room/DreamHomeViewer";
import livingRoomImg from "@/assets/living-room.jpg";
import bedroomSuiteImg from "@/assets/bedroom-suite.jpg";
import vanityDressingImg from "@/assets/vanity-dressing.jpg";
import kitchenCourtyardImg from "@/assets/kitchen-courtyard.jpg";
import kitchenIslandImg from "@/assets/kitchen-island.jpg";
import kitchenSuiteImg from "@/assets/kitchen-suite.jpg";
import technicalElevationImg from "@/assets/technical-elevation.jpg";

const TITLE = "Dream Home Visuals – 3D Room Makeovers";
const DESC =
  "Interactive 3D interior design and luxury room makeovers by Dream Home Visuals. Compare bare spaces against bespoke transformations in real time.";

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
const WHATSAPP = "https://wa.me/916378095273";

export interface ProjectItem {
  id: string;
  src: string;
  title: string;
  filter: "living" | "bedroom" | "kitchen" | "technical";
  category: string;
  place: string;
  description: string;
  specs: string[];
}

const PROJECTS: ProjectItem[] = [
  {
    id: "living-room",
    src: livingRoomImg,
    title: "The Grand Marble Salon",
    filter: "living",
    category: "Living Room",
    place: "Bespoke Residence · Formal Lounge",
    description:
      "Symmetrical luxury seating with dual ivory sectionals, bookmatched Italian marble floor, fluted walnut architectural accents, crystal ring chandelier, and ambient vertical sconces.",
    specs: ["Bookmatched Marble", "Fluted Wall Paneling", "Brass Sconces", "Dual Cocktail Tables", "Gold Accents"],
  },
  {
    id: "bedroom-suite",
    src: bedroomSuiteImg,
    title: "Master Suite & Backlit Headboard",
    filter: "bedroom",
    category: "Master Bedroom",
    place: "Private Wing · Master Chamber",
    description:
      "Floor-to-ceiling fluted acoustic paneling with warm recessed LED perimeter wash, geometric vertical padded headboard, designer layered suspension pendant, and full-height wardrobe.",
    specs: ["Fluted Accent Wall", "Recessed Cove LED", "Channel-Tufted Bed", "Designer Pendant", "Glass Wardrobe"],
  },
  {
    id: "vanity-dressing",
    src: vanityDressingImg,
    title: "Illuminated Arched Vanity Console",
    filter: "bedroom",
    category: "Vanity & Dressing",
    place: "Dressing Suite · Custom Joinery",
    description:
      "Bespoke wardrobe ensemble with an illuminated pill-shaped arch vanity mirror, warm vertical fluted display niche with LED glass shelving, soft-close drawers, and curved bouclé puff.",
    specs: ["PU Ivory Paint", "Backlit 6mm Arched Mirror", "Fluted Back Panel", "Soft-Close Drawers", "LED Display Niche"],
  },
  {
    id: "kitchen-courtyard",
    src: kitchenCourtyardImg,
    title: "Courtyard Garden View Kitchen",
    filter: "kitchen",
    category: "Architectural Kitchen",
    place: "Culinary Wing · Lightwell Atrium",
    description:
      "Parallel minimalist kitchen anchored by a natural fluted oak island facing full-height architectural glazing into a lush private courtyard with recessed magnetic track luminaires.",
    specs: ["Atrium Garden View", "Natural Oak Island", "Quartz Countertops", "Magnetic Track Lighting", "Parallel Prep"],
  },
  {
    id: "kitchen-island",
    src: kitchenIslandImg,
    title: "Curved Fluted Oak Island Detail",
    filter: "kitchen",
    category: "Kitchen Island",
    place: "Island Centerpiece · Detail Study",
    description:
      "Sculpted radius corners with vertical oak fluting, warm under-counter shadowline LED ribbon, seamless stone surface, and upper display niche with soft backlighting.",
    specs: ["Curved Radius Corners", "Shadowline LED Ribbon", "Seamless Quartz Top", "Under-Cabinet Wash", "Recessed Niche"],
  },
  {
    id: "kitchen-suite",
    src: kitchenSuiteImg,
    title: "Full-Height Modular Pantry & Prep",
    filter: "kitchen",
    category: "Modular Kitchen",
    place: "Chef's Kitchen · Joinery Suite",
    description:
      "Floor-to-ceiling textured oak cabinetry seamlessly enclosing built-in black glass refrigeration, undermount sink with matte gooseneck faucet, and two-tone matte ivory cabinetry.",
    specs: ["Integrated Refrigerator", "Undermount Sink", "Two-Tone Cabinets", "Hidden Push Catches", "Warm Glow Reveal"],
  },
  {
    id: "technical-elevation",
    src: technicalElevationImg,
    title: "Architectural Elevations & Specifications",
    filter: "technical",
    category: "Technical Drawings",
    place: "19'-6\" Wall Package · Working Drawings",
    description:
      "Detailed fabrication blueprint specifying 11' wardrobe layout, 5' dressing unit with 4'-6\"x6'-0\" LED backlit mirror, PU painted ivory finish with gold line classic molding, and brass hardware schedule.",
    specs: ["19'-6\" Wall Elevation", "Internal Wardrobe Layout", "Material & Finish Schedule", "Dimensioned Cross Sections"],
  },
];

interface StudioRoom {
  id: string;
  name: string;
  category: string;
  src: string;
  blurb: string;
  highlights: { title: string; desc: string }[];
  palette: { name: string; color: string }[];
}

const STUDIO_ROOMS: Record<string, StudioRoom> = {
  living: {
    id: "living",
    name: "Living Salon",
    category: "Formal Living",
    src: livingRoomImg,
    blurb:
      "Symmetrical luxury seating with dual ivory sectionals, bookmatched Italian marble floor, fluted walnut architectural accents, and crystal ring chandelier.",
    highlights: [
      { title: "Bookmatched Marble", desc: "Hand-selected Italian marble slabs with mirror bookmatch veining" },
      { title: "Fluted Joinery", desc: "Custom vertical walnut wall paneling with concealed ambient cove LEDs" },
      { title: "Crystal Ring Sconces", desc: "Dual ring suspended luminaire with dimmable warm 2700K driver" },
    ],
    palette: [
      { name: "Alabaster", color: "#F5F3EC" },
      { name: "Emerald", color: "#1F4A3C" },
      { name: "Walnut", color: "#B9793F" },
      { name: "Brass", color: "#D9A83F" },
    ],
  },
  bedroom: {
    id: "bedroom",
    name: "Master Suite",
    category: "Private Chamber",
    src: bedroomSuiteImg,
    blurb:
      "Floor-to-ceiling acoustic paneling with warm recessed LED wash, vertical channel-tufted headboard, and layered designer pendants.",
    highlights: [
      { title: "Acoustic Wall", desc: "Slatted acoustic oak panels damping echo while bathing the bed in soft light" },
      { title: "Channel-Tufted Bed", desc: "Textured bouclé upholstery with integrated floating nightstand cantilevers" },
      { title: "Suspension Pendant", desc: "Dual brass drop ring luminaire providing intimate bedside reading glow" },
    ],
    palette: [
      { name: "Warm Taupe", color: "#D9D3C3" },
      { name: "Deep Charcoal", color: "#2B2F33" },
      { name: "Rich Gold", color: "#E8CA6E" },
      { name: "Natural Oak", color: "#A8764B" },
    ],
  },
  kitchen: {
    id: "kitchen",
    name: "Courtyard Kitchen",
    category: "Culinary Wing",
    src: kitchenCourtyardImg,
    blurb:
      "Parallel minimalist kitchen anchored by a sculpted fluted oak island facing full-height architectural glazing into a lush private courtyard.",
    highlights: [
      { title: "Atrium View", desc: "Full-height floor-to-ceiling glass wall integrating exterior courtyard foliage" },
      { title: "Fluted Oak Island", desc: "Curved radius countertop with vertical fluting and shadowline LED accent" },
      { title: "Magnetic Track", desc: "Recessed architectural ceiling track luminaires with adjustable focal heads" },
    ],
    palette: [
      { name: "Quartz White", color: "#F3EFE6" },
      { name: "Natural Oak", color: "#B9793F" },
      { name: "Courtyard Green", color: "#2F6544" },
      { name: "Matte Black", color: "#22252A" },
    ],
  },
  vanity: {
    id: "vanity",
    name: "Vanity Dressing",
    category: "Dressing Suite",
    src: vanityDressingImg,
    blurb:
      "Bespoke wardrobe ensemble with illuminated pill-shaped arch vanity mirror, vertical fluted display niche, and soft-close cosmetic drawers.",
    highlights: [
      { title: "Arched Backlit Mirror", desc: "6mm copper-free arch mirror with seamless 360-degree LED halo glow" },
      { title: "Display Niche", desc: "Vertical fluted joinery with tempered glass shelves for perfumes & watches" },
      { title: "Bouclé Vanity Puff", desc: "Ergonomic curved bouclé seat tucked under soft-close cosmetic drawers" },
    ],
    palette: [
      { name: "PU Ivory", color: "#F7F5F0" },
      { name: "Soft Champagne", color: "#E9DFC8" },
      { name: "Warm Gold", color: "#D4AF5A" },
      { name: "Deep Espresso", color: "#3A2E25" },
    ],
  },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A14A]">
      {children}
    </p>
  );
}

function Nav({ dark, setDark }: { dark: boolean; setDark: (v: boolean) => void }) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        <a href="#top" className="flex items-center gap-3 group">
          <img
            src="/favicon.svg"
            alt="Dream Home Visuals Logo"
            className="h-9 w-9 rounded-xl shadow-sm border border-[#C9A14A]/40 transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif text-base md:text-lg font-bold tracking-wider leading-none text-foreground">
              DREAM HOME VISUALS
            </span>
            <span className="font-sans text-[9px] uppercase tracking-[0.24em] text-[#C9A14A] font-semibold mt-0.5">
              3D Room Makeovers &amp; Interiors
            </span>
          </div>
        </a>
        <nav className="hidden gap-7 text-sm font-sans text-muted-foreground md:flex">
          {[
            ["Before / After", "#compare"],
            ["Studio", "#studio"],
            ["Portfolio", "#work"],
            ["Contact", "#contact"],
          ].map(([l, h]) => (
            <a key={h} href={h} className="transition-colors hover:text-foreground">
              {l}
            </a>
          ))}
        </nav>
        <button
          onClick={() => setDark(!dark)}
          aria-label="Toggle dark mode"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background/70 text-foreground backdrop-blur cursor-pointer hover:border-[#C9A14A] transition-colors"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

// Ultra-fast loading Image Hero: Instant first paint, zero WebGL latency
function Hero() {
  return (
    <section id="top" className="relative h-[92vh] min-h-[560px] max-h-[880px] overflow-hidden">
      <img
        src={livingRoomImg}
        alt="Dream Home Visuals Luxury Interior"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 md:via-background/75 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 md:justify-center md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <Eyebrow>Dream Home Visuals · Luxury Interiors</Eyebrow>
          <h1 className="font-serif text-4xl leading-[1.08] text-foreground sm:text-5xl md:text-6xl">
            Your home, <span className="text-[#C9A14A] italic">before &amp; after</span>.
          </h1>
          <p className="mt-4 max-w-lg text-base md:text-lg text-muted-foreground leading-relaxed font-sans">
            Room makeovers and bespoke architectural interiors. Drag our real-time interactive 3D comparison below to reveal your home's transformation.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <a
              href="#compare"
              className="inline-flex items-center gap-2 rounded-full bg-[#C9A14A] px-7 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 shadow-lg shadow-[#C9A14A]/25"
            >
              Explore 3D Makeover <ArrowDown size={16} />
            </a>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Centerpiece 3D Before & After Section (the ONLY 3D Canvas on the page for maximum speed)
function BeforeAfter() {
  return (
    <section id="compare" className="py-12 md:py-16 bg-background transition-colors">
      <DreamHomeViewer />
    </section>
  );
}

// Interactive Image-Based Design Studio: Fast, instant load, zero WebGL overhead
function Studio() {
  const [roomKey, setRoomKey] = useState<string>("living");
  const [evening, setEvening] = useState<boolean>(false);
  const cur = STUDIO_ROOMS[roomKey] || STUDIO_ROOMS.living;

  return (
    <section id="studio" className="py-20 md:py-24 bg-card/60 border-y border-border/40">
      <div className="mx-auto max-w-7xl px-5">
        <Eyebrow>02 · Design Studio Showcase</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="max-w-xl font-serif text-3xl md:text-4xl text-foreground">
            Curated Spaces &amp; Joinery
          </h2>
          {/* Room Selector Tabs */}
          <div
            role="tablist"
            aria-label="Studio Rooms"
            className="flex flex-wrap rounded-full border border-border bg-background p-1 shadow-sm"
          >
            {Object.keys(STUDIO_ROOMS).map((k) => (
              <button
                key={k}
                role="tab"
                aria-selected={roomKey === k}
                onClick={() => setRoomKey(k)}
                className={`rounded-full px-4 py-2 text-xs md:text-sm font-sans font-medium transition-all cursor-pointer ${
                  roomKey === k
                    ? "bg-[#C9A14A] text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {STUDIO_ROOMS[k].name}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground font-sans">
          {cur.blurb}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Photo Viewer with Lighting Filter */}
          <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-black shadow-xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={cur.id}
                src={cur.src}
                alt={cur.name}
                loading="lazy"
                initial={{ opacity: 0.3, scale: 1.01 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.3 }}
                transition={{ duration: 0.35 }}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  evening
                    ? "brightness-[0.82] contrast-[1.12] sepia-[0.25] hue-rotate-[-10deg]"
                    : "brightness-100 contrast-100"
                }`}
              />
            </AnimatePresence>

            {/* Ambient Lighting Atmosphere Overlay */}
            {evening && (
              <div className="pointer-events-none absolute inset-0 bg-amber-500/10 mix-blend-color-burn" />
            )}

            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-black/65 backdrop-blur-md border border-white/20 px-3 py-1 text-xs font-semibold text-white font-sans">
                {cur.category}
              </span>
              <span className="rounded-full bg-[#C9A14A]/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-[#141A18] font-sans shadow">
                {evening ? "Evening Warm Cove Glow" : "Daylight Architectural Wash"}
              </span>
            </div>
          </div>

          {/* Side Controls & Specs */}
          <aside className="space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground font-sans uppercase tracking-wider mb-3">
                Architectural Highlights
              </h3>
              <div className="space-y-3">
                {cur.highlights.map((h, i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-background/60 p-3.5">
                    <p className="text-xs font-bold text-[#C9A14A] font-sans">{h.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-sans">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground font-sans uppercase tracking-wider mb-2.5">
                Lighting Atmosphere
              </h3>
              <button
                role="switch"
                aria-checked={evening}
                onClick={() => setEvening(!evening)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground transition hover:border-[#C9A14A] cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium font-sans">
                  {evening ? <Moon size={16} className="text-[#E8CA6E]" /> : <Sun size={16} className="text-[#C9A14A]" />}
                  {evening ? "Evening Warm Ambiance" : "Daylight Mode"}
                </span>
                <span className={`relative h-5 w-10 rounded-full transition-colors ${evening ? "bg-[#C9A14A]" : "bg-border"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all ${evening ? "left-5" : "left-0.5"}`} />
                </span>
              </button>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-sans mb-2">
                Material &amp; Color Palette
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {cur.palette.map((p, idx) => (
                  <div key={idx}>
                    <div className="h-8 rounded-lg border border-border shadow-inner" style={{ backgroundColor: p.color }} />
                    <p className="mt-1 text-[9px] font-medium text-muted-foreground truncate font-sans">{p.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function TiltCard({ p, onOpen }: { p: ProjectItem; onOpen: () => void }) {
  const [t, setT] = useState({ x: 0, y: 0 });
  return (
    <button
      onClick={onOpen}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setT({
          x: (e.clientX - r.left) / r.width - 0.5,
          y: (e.clientY - r.top) / r.height - 0.5,
        });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      className="group flex flex-col text-left [perspective:1000px] focus:outline-none cursor-pointer"
      aria-label={`Open project: ${p.title}`}
    >
      <div
        className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border/60 bg-muted transition-all duration-300 group-hover:border-[#C9A14A]/50 group-hover:shadow-xl"
        style={{
          transform: `rotateY(${t.x * 8}deg) rotateX(${-t.y * 8}deg)`,
        }}
      >
        <img
          src={p.src}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md font-sans">
          {p.category}
        </span>
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white font-sans">
          <span className="text-xs font-medium tracking-wide opacity-90">{p.place}</span>
          <span className="text-xs font-semibold text-[#E8CA6E] opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center gap-1">
            View Details &rarr;
          </span>
        </div>
      </div>
      <h3 className="mt-3.5 font-serif text-lg font-semibold text-foreground transition-colors group-hover:text-[#C9A14A]">
        {p.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed font-sans">
        {p.description}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5 font-sans">
        {p.specs.slice(0, 3).map((spec) => (
          <span
            key={spec}
            className="rounded bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
          >
            {spec}
          </span>
        ))}
        {p.specs.length > 3 && (
          <span className="rounded bg-secondary/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            +{p.specs.length - 3}
          </span>
        )}
      </div>
    </button>
  );
}

const FILTERS = [
  { id: "all", label: "All Spaces" },
  { id: "living", label: "Living Room" },
  { id: "bedroom", label: "Master Suite & Vanity" },
  { id: "kitchen", label: "Kitchen & Island" },
  { id: "technical", label: "Working Blueprints" },
] as const;

function Gallery() {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState<number | null>(null);

  const filteredProjects = filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.filter === filter);
  const activeProject = open !== null ? PROJECTS[open] : null;

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Eyebrow>03 · Portfolio</Eyebrow>
          <h2 className="font-serif text-3xl md:text-5xl text-foreground">Recent Makeovers</h2>
          <p className="mt-2 max-w-xl text-muted-foreground text-sm font-sans">
            Explore completed residential transformations — from marble living salons and fluted master suites to architectural courtyard kitchens and working blueprints.
          </p>
        </div>
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-sans font-medium transition-all cursor-pointer ${
                filter === f.id
                  ? "bg-[#C9A14A] text-white shadow-sm"
                  : "border border-border bg-background text-muted-foreground hover:border-[#C9A14A] hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((p) => {
          const originalIndex = PROJECTS.findIndex((item) => item.id === p.id);
          return <TiltCard key={p.id} p={p} onOpen={() => setOpen(originalIndex)} />;
        })}
      </div>

      {/* Modal Lightbox */}
      <AnimatePresence>
        {activeProject && open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label={activeProject.title}
          >
            {/* Close Button */}
            <button
              autoFocus
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="absolute right-5 top-5 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Prev / Next Buttons */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open - 1 + PROJECTS.length) % PROJECTS.length);
              }}
              aria-label="Previous project"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 hidden md:grid cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen((open + 1) % PROJECTS.length);
              }}
              aria-label="Next project"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 hidden md:grid cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>

            {/* Modal Content Container */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#141C1A] text-white shadow-2xl"
            >
              {/* Image viewer */}
              <div className="relative flex min-h-[300px] max-h-[62vh] items-center justify-center overflow-hidden bg-black/40 p-2">
                <motion.img
                  key={open}
                  initial={{ scale: 0.96, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  src={activeProject.src}
                  alt={activeProject.title}
                  className="max-h-[58vh] w-auto max-w-full rounded-lg object-contain shadow-lg"
                />
              </div>

              {/* Detail Footer */}
              <div className="border-t border-white/10 bg-[#1A2623] p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-full bg-[#E8CA6E]/20 px-3 py-1 text-xs font-semibold text-[#E8CA6E] font-sans">
                      {activeProject.category}
                    </span>
                    <span className="text-xs text-white/60 font-sans">{activeProject.place}</span>
                  </div>
                  <span className="text-xs text-white/50 font-mono">
                    {open + 1} of {PROJECTS.length}
                  </span>
                </div>

                <h3 className="mt-2.5 font-serif text-xl md:text-2xl font-semibold text-white">
                  {activeProject.title}
                </h3>
                <p className="mt-1.5 text-xs md:text-sm text-white/75 leading-relaxed font-sans">
                  {activeProject.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 font-sans">
                  {activeProject.specs.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/90"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function Contact() {
  const phone = "+916378095273";
  const email = "gp039962@gmail.com";
  const portfolio = "https://visual-echo-software.vercel.app/";

  return (
    <section id="contact" className="bg-[#141A18] py-24 text-white border-t border-white/10">
      <div className="mx-auto max-w-4xl px-5 text-center flex flex-col items-center">
        <img
          src="/favicon.svg"
          alt="Dream Home Visuals Logo"
          className="h-16 w-16 mb-6 rounded-2xl border border-[#C9A14A]/40 shadow-xl"
        />
        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-[#C9A14A] font-sans font-semibold">
          Let's redesign your space
        </p>
        <h2 className="font-serif text-3xl md:text-5xl text-white">
          Ready to see your room reimagined?
        </h2>

        {/* Primary CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 font-sans">
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-7 py-3.5 font-semibold text-white transition hover:opacity-90 shadow-md"
          >
            <MessageCircle size={18} /> WhatsApp Us
          </a>
          <a
            href={IG}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full border border-[#C9A14A]/50 bg-white/5 px-7 py-3.5 font-medium text-white/90 transition hover:bg-white/10"
          >
            <Instagram size={18} /> Instagram
          </a>
        </div>

        {/* Contact Details */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-white/75 font-sans">
          <a href={`mailto:${email}`} className="flex items-center gap-2 transition hover:text-[#C9A14A]">
            <Mail size={15} />
            <span>{email}</span>
          </a>
          <a href={`tel:${phone}`} className="flex items-center gap-2 transition hover:text-[#C9A14A]">
            <Phone size={15} />
            <span>+91 63780 95273</span>
          </a>
          <a href={portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-[#C9A14A]">
            <ExternalLink size={15} />
            <span>Portfolio</span>
          </a>
        </div>

        <div className="mt-14 flex items-center gap-4 w-full max-w-xs">
          <div className="flex-1 h-px bg-[#C9A14A]/20" />
          <img src="/favicon.svg" alt="" className="h-5 w-5 opacity-40" />
          <div className="flex-1 h-px bg-[#C9A14A]/20" />
        </div>

        <p className="mt-6 text-xs text-white/40 tracking-wider font-sans">
          © {new Date().getFullYear()} Dream Home Visuals · Luxury Interiors &amp; 3D Visuals
        </p>
      </div>
    </section>
  );
}

function Index() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <main className="bg-background text-foreground transition-colors min-h-screen">
      <Nav dark={dark} setDark={setDark} />
      <Hero />
      <BeforeAfter />
      <Studio />
      <Gallery />
      <Contact />
    </main>
  );
}
