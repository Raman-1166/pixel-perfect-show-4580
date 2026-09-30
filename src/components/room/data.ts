// Shared, browser-safe data for the 3D rooms. Edit names, tips and palettes here.

export type StyleKey = "modern" | "wood" | "navy";
export type RoomKey = "living" | "bedroom" | "kitchen";

export const STYLES: Record<
  StyleKey,
  { label: string; wall: string; floor: string; sofa: string; rug: string; accent: string }
> = {
  modern: { label: "Modern Green", wall: "#E4E8E1", floor: "#B89F7E", sofa: "#1F3A34", rug: "#A9B8A5", accent: "#B08D57" },
  wood: { label: "Warm Wood", wall: "#EFE4D4", floor: "#8A5A36", sofa: "#C9A37A", rug: "#E7D6BD", accent: "#6B4226" },
  navy: { label: "Classic Navy", wall: "#ECEAE4", floor: "#6B5845", sofa: "#1E2D4F", rug: "#C9C3B5", accent: "#B08D57" },
};

export const GREY = { wall: "#BDBDBD", floor: "#9A9A9A", sofa: "#8C8C8C", rug: "#A6A6A6", accent: "#999999" };

// Each room sits at a different x offset in one shared world.
export const ROOMS: Record<RoomKey, { label: string; x: number; blurb: string }> = {
  living: {
    label: "Living Room",
    x: 0,
    blurb: "Layered seating, a low oak table, a statement rug and warm lamp light — built for slow evenings.",
  },
  bedroom: {
    label: "Bedroom",
    x: 40,
    blurb: "A calm upholstered bed, soft bedside lighting and a restrained palette that helps you switch off.",
  },
  kitchen: {
    label: "Kitchen",
    x: 80,
    blurb: "A stone-topped island, brass pendants and hidden storage for a kitchen that feels like furniture.",
  },
};

export type FurnitureInfo = { name: string; material: string; tip: string };

export const FURNITURE: Record<string, FurnitureInfo> = {
  sofa: { name: "L-shaped / 3-seater sofa", material: "Performance linen velvet, oak legs", tip: "Float the sofa slightly off the wall to create breathing space and depth." },
  table: { name: "Round wood coffee table", material: "Solid white oak, beveled rim", tip: "Style with a balance of vertical height (vase) and low horizontal accents (art books)." },
  armchair: { name: "Accent armchair", material: "Bouclé upholstery, tapered brass legs", tip: "Angle your armchair at 45 degrees towards the coffee table to foster conversation." },
  bookshelf: { name: "Tall architectural bookshelf", material: "Natural oak frame, brass inlays", tip: "Alternate vertical book sets with sculptural ceramics for an editorial rhythm." },
  mediaConsole: { name: "Console table & tray", material: "Fluted oak, honed marble tray", tip: "Keep surface styling uncluttered with tactile natural objects and ambient lighting." },
  lamp: { name: "Arched floor lamp", material: "Brushed brass, linen drum shade", tip: "Position near reading zones for soft, glare-free indirect warmth." },
  plant: { name: "Ficus Lyrata & potted monstera", material: "Fluted ceramic & terracotta planters", tip: "Curved, broad leaves bring life and organic softness to architectural lines." },
  pouf: { name: "Round bouclé pouf", material: "Chunky ribbed wool", tip: "Provides versatile secondary seating without blocking sightlines." },
  gallery: { name: "Framed art gallery & mirror", material: "Matted gallery frames, brass wall mirror", tip: "Hang artwork so the optical center sits at average standing eye level (~145 cm)." },
  chandelier: { name: "Modern brass chandelier", material: "Brushed brass, frosted glass globes", tip: "Diffused warm globes ground the room and create an inviting focal point." },
  rug: { name: "Geometric woven rug", material: "Hand-tufted New Zealand wool", tip: "Anchor the front legs of all seating on the rug to unify the conversation area." },
  bed: { name: "Upholstered bed", material: "Boucle headboard, linen bedding", tip: "Layer three textures on the bed: crisp, soft and knitted." },
  nightstand: { name: "Nightstand", material: "Walnut veneer", tip: "Match nightstand height to the top of your mattress." },
  island: { name: "Kitchen island", material: "Honed marble top, painted base", tip: "Leave at least 100 cm of walkway around an island." },
  stool: { name: "Counter stool", material: "Oak and leather", tip: "Allow about 60 cm of counter width per stool." },
  pendant: { name: "Pendant light", material: "Brass dome", tip: "Hang pendants 75–85 cm above the counter." },
};

