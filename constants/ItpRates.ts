// ITP (Impuesto de Transmisiones Patrimoniales) rates for used vehicles
// by Spanish Autonomous Community (Comunidad Autónoma)
// Source: Official regional tax agencies, 2024/2025

export interface SpanishRegion {
  name: string;
  rate: number; // e.g. 0.04 = 4%
  label: string; // Display label with rate
}

export const SPANISH_REGIONS: SpanishRegion[] = [
  { name: "Andalucía", rate: 0.04, label: "Andalucía (4%)" },
  { name: "Aragón", rate: 0.04, label: "Aragón (4%)" },
  { name: "Asturias", rate: 0.04, label: "Asturias (4%)" },
  { name: "Baleares", rate: 0.04, label: "Islas Baleares (4%)" },
  { name: "Canarias", rate: 0.055, label: "Canarias (5.5%)" },
  { name: "Cantabria", rate: 0.08, label: "Cantabria (8%)" },
  { name: "Castilla y León", rate: 0.05, label: "Castilla y León (5%)" },
  { name: "Castilla-La Mancha", rate: 0.06, label: "Castilla-La Mancha (6%)" },
  { name: "Cataluña", rate: 0.05, label: "Cataluña (5%)" },
  { name: "Ceuta", rate: 0.04, label: "Ceuta (4%)" },
  { name: "Comunidad Valenciana", rate: 0.06, label: "C. Valenciana (6%)" },
  { name: "Extremadura", rate: 0.06, label: "Extremadura (6%)" },
  { name: "Galicia", rate: 0.03, label: "Galicia (3%)" },
  { name: "Madrid", rate: 0.04, label: "Madrid (4%)" },
  { name: "Melilla", rate: 0.04, label: "Melilla (4%)" },
  { name: "Murcia", rate: 0.04, label: "Murcia (4%)" },
  { name: "Navarra", rate: 0.04, label: "Navarra (4%)" },
  { name: "País Vasco", rate: 0.04, label: "País Vasco (4%)" },
  { name: "La Rioja", rate: 0.04, label: "La Rioja (4%)" },
];

export const DEFAULT_ITP_RATE = 0.04;
