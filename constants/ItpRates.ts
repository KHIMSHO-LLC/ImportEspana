// ITP rates for second-hand vehicles per Spanish Autonomous Community (2026).
// Sources: regional tax-agency portals + Decreto-ley 5/2025 (Cataluña).
//
// Notes:
// - Canarias uses IGIC (not ITP) — 0% effective.
// - Ceuta and Melilla use IPSI (not ITP) — 0% effective.
// - Cataluña: zero-emissions exempt since 2025-06-27 (handled in calculator).
// - Andalucía: reduced 1% for zero-emissions (handled in calculator).

export interface SpanishRegion {
  name: string;
  rate: number;
  label: string;       // Compact label for narrow viewports (≤375px).
  labelLong: string;   // Verbose label for wider screens.
}

export const SPANISH_REGIONS: SpanishRegion[] = [
  { name: "Andalucía",            rate: 0.04, label: "Andalucía · 4%",    labelLong: "Andalucía (4%)" },
  { name: "Aragón",               rate: 0.04, label: "Aragón · 4%",       labelLong: "Aragón (4%)" },
  { name: "Asturias",             rate: 0.08, label: "Asturias · 8%",     labelLong: "Asturias (8%)" },
  { name: "Baleares",             rate: 0.04, label: "Baleares · 4%",     labelLong: "Islas Baleares (4%)" },
  { name: "Canarias",             rate: 0.0,  label: "Canarias · IGIC",   labelLong: "Canarias (IGIC — no ITP)" },
  { name: "Cantabria",            rate: 0.08, label: "Cantabria · 8%",    labelLong: "Cantabria (8%)" },
  { name: "Castilla y León",      rate: 0.05, label: "Castilla y L. · 5%",labelLong: "Castilla y León (5%)" },
  { name: "Castilla-La Mancha",   rate: 0.06, label: "C-La Mancha · 6%",  labelLong: "Castilla-La Mancha (6%)" },
  { name: "Cataluña",             rate: 0.05, label: "Cataluña · 5%",     labelLong: "Cataluña (5%)" },
  { name: "Ceuta",                rate: 0.0,  label: "Ceuta · IPSI",      labelLong: "Ceuta (IPSI — no ITP)" },
  { name: "Comunidad Valenciana", rate: 0.06, label: "C. Valenciana · 6%",labelLong: "C. Valenciana (6%)" },
  { name: "Extremadura",          rate: 0.06, label: "Extremadura · 6%",  labelLong: "Extremadura (6%)" },
  { name: "Galicia",              rate: 0.08, label: "Galicia · 8%",      labelLong: "Galicia (8%)" },
  { name: "Madrid",               rate: 0.04, label: "Madrid · 4%",       labelLong: "Madrid (4%)" },
  { name: "Melilla",              rate: 0.0,  label: "Melilla · IPSI",    labelLong: "Melilla (IPSI — no ITP)" },
  { name: "Murcia",               rate: 0.04, label: "Murcia · 4%",       labelLong: "Murcia (4%)" },
  { name: "Navarra",              rate: 0.04, label: "Navarra · 4%",      labelLong: "Navarra (4%)" },
  { name: "País Vasco",           rate: 0.04, label: "País Vasco · 4%",   labelLong: "País Vasco (4%)" },
  { name: "La Rioja",             rate: 0.04, label: "La Rioja · 4%",     labelLong: "La Rioja (4%)" },
];

export const DEFAULT_ITP_RATE = 0.04;
