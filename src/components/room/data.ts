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
  sofa: { name: "Three-seat sofa", material: "Performance velvet, oak legs", tip: "Float the sofa off the wall — even 20 cm makes a room feel bigger." },
  table: { name: "Coffee table", material: "Solid oak, oiled finish", tip: "Keep it about two-thirds the length of your sofa." },
  lamp: { name: "Floor lamp", material: "Brushed brass, linen shade", tip: "Use warm 2700K bulbs in living spaces for a softer glow." },
  plant: { name: "Fiddle-leaf fig", material: "Terracotta planter", tip: "One tall plant in a corner draws the eye up and softens hard edges." },
  rug: { name: "Wool rug", material: "Hand-tufted New Zealand wool", tip: "Front legs of every seat should rest on the rug." },
  bed: { name: "Upholstered bed", material: "Boucle headboard, linen bedding", tip: "Layer three textures on the bed: crisp, soft and knitted." },
  nightstand: { name: "Nightstand", material: "Walnut veneer", tip: "Match nightstand height to the top of your mattress." },
  island: { name: "Kitchen island", material: "Honed marble top, painted base", tip: "Leave at least 100 cm of walkway around an island." },
  stool: { name: "Counter stool", material: "Oak and leather", tip: "Allow about 60 cm of counter width per stool." },
  pendant: { name: "Pendant light", material: "Brass dome", tip: "Hang pendants 75–85 cm above the counter." },
};
