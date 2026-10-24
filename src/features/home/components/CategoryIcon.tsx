const LINES: Record<string, string> = {
  suv: "Height, stance, and room.",
  sedan: "A long, quiet line.",
  sports: "Low, immediate, precise.",
  coupe: "Two doors, one silhouette.",
  luxury: "Presence before pace.",
  electric: "Silence, with intent.",
};

export function categoryLine(slug: string) {
  return LINES[slug] ?? "From the catalogue.";
}
