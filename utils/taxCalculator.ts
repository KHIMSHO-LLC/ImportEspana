import { CalculationInput, CalculationResult, Country } from "../types";
import { DEFAULT_ITP_RATE } from "../constants/ItpRates";

// =============================================================================
// IMPORTESPANA — TAX CALCULATOR (2026)
//
// Sources (verified 2026-04):
// - IEDMT national rates: Ley 38/1992, art. 70.
//   sede.agenciatributaria.gob.es — Tipos impositivos primera matriculación.
// - IEDMT regional overrides: ditto (epígrafe 4, top bracket).
// - Depreciation table: Orden HAC/1501/2025, de 17-dic (BOE-A-2025-26357),
//   in force from 2026-01-01 — same table used for ITP/AJD, ISD, IEDMT.
// - ITP autonomous rates 2026: regional tax agencies (verified per CCAA).
// - Customs duty: TARIC 8703 (turismos) → 10% general.
// - Import VAT: 21% on (CIF + duty).
// - DGT fees 2026: tasa 1.1 = 99,77€ (matriculación), tasa 4.6 = 4,18€ (anot. ITV).
// =============================================================================

// === DEPRECIATION TABLE ===
// % of value RETAINED by the car. Same table for IEDMT/ITP base.
export const DEPRECIATION_TABLE = {
  new: 1.0,
  "1_year": 0.84,
  "2_years": 0.67,
  "3_years": 0.56,
  "4_years": 0.47,
  "5_years": 0.39,
  "6_years": 0.34,
  "7_years": 0.28,
  "8_years": 0.24,
  "9_years": 0.19,
  "10_years": 0.17,
  "11_years": 0.13,
  "12_plus_years": 0.1,
} as const;

// === IEDMT BRACKETS ===
// Per Ley 38/1992, art. 70 — turismos (epígrafes 1º-4º).
export const IEDMT_BRACKETS = {
  bracket1: 0,        // CO₂ < 120 g/km
  bracket2: 0.0475,   // 120 ≤ CO₂ < 160 g/km
  bracket3: 0.0975,   // 160 ≤ CO₂ < 200 g/km
  bracket4: 0.1475,   // CO₂ ≥ 200 g/km
} as const;

// Regional top-bracket overrides (epígrafe 4º only).
// Other brackets remain at national rate. CCAA may raise up to 15%.
const IEDMT_TOP_BRACKET_BY_REGION: Record<string, number> = {
  Asturias: 0.16,
  Baleares: 0.16,
  "Cataluña": 0.16,
  "Comunidad Valenciana": 0.16,
  Murcia: 0.159,
};

// IGIC (Canarias) and IPSI (Ceuta/Melilla) territories: 0% IEDMT.
const IEDMT_ALL_ZERO_REGIONS = new Set(["Canarias", "Ceuta", "Melilla"]);

// === EXTERNAL TRANSPORT ESTIMATES (€) ===
// Indicative by origin. User can override.
const TRANSPORT_COSTS: Record<Country, number> = {
  Germany: 800,
  France: 600,
  Italy: 900,
  Belgium: 850,
  Netherlands: 850,
  USA: 1500,
  UAE: 1200,
  Japan: 2000,
  Korea: 2000,
};

// === DGT + ADMIN FEES (2026) ===
const FEES = {
  DGT_TASA_1_1: 99.77,
  DGT_TASA_4_6: 4.18,
  ITV_INSPECTION: 95,           // Imported-vehicle ITV (typical 80-120€ Península).
  FICHA_TECNICA_REDUCIDA: 90,   // EU mod when no COC.
  PLATES: 50,                   // 30-70€ private supplier.
  HOMOLOGATION_INDIVIDUAL: 1500,// Range 500-2500€ for Non-EU.
};

// === HELPERS ===

export function getDepreciationFactor(
  registrationDate?: string,
  carAge?: keyof typeof DEPRECIATION_TABLE,
): number {
  if (registrationDate) {
    const [yearStr, monthStr] = registrationDate.split("-");
    if (yearStr && monthStr) {
      const regYear = parseInt(yearStr, 10);
      const regMonth = parseInt(monthStr, 10);
      const today = new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth() + 1;
      let months = (todayYear - regYear) * 12 + (todayMonth - regMonth);
      if (months < 0) months = 0;
      if (months < 12) return 1.0;
      if (months < 24) return 0.84;
      if (months < 36) return 0.67;
      if (months < 48) return 0.56;
      if (months < 60) return 0.47;
      if (months < 72) return 0.39;
      if (months < 84) return 0.34;
      if (months < 96) return 0.28;
      if (months < 108) return 0.24;
      if (months < 120) return 0.19;
      if (months < 132) return 0.17;
      if (months < 144) return 0.13;
      return 0.1;
    }
  }
  return carAge && DEPRECIATION_TABLE[carAge]
    ? DEPRECIATION_TABLE[carAge]
    : 1.0;
}

export function getVehicleAgeYears(
  registrationDate?: string,
  carAge?: keyof typeof DEPRECIATION_TABLE,
): number {
  if (registrationDate) {
    const [yearStr, monthStr] = registrationDate.split("-");
    if (yearStr && monthStr) {
      const regYear = parseInt(yearStr, 10);
      const regMonth = parseInt(monthStr, 10);
      const today = new Date();
      const months =
        (today.getFullYear() - regYear) * 12 +
        (today.getMonth() + 1 - regMonth);
      return Math.max(0, Math.floor(months / 12));
    }
  }
  if (!carAge) return 0;
  if (carAge === "new") return 0;
  if (carAge === "12_plus_years") return 12;
  const m = carAge.match(/^(\d+)_year/);
  return m ? parseInt(m[1], 10) : 0;
}

export function getIedmtRate(
  co2Emissions: number,
  region?: string,
  isZeroEmission?: boolean,
): number {
  if (region && IEDMT_ALL_ZERO_REGIONS.has(region)) return 0;
  if (isZeroEmission || co2Emissions < 120) return IEDMT_BRACKETS.bracket1;
  if (co2Emissions < 160) return IEDMT_BRACKETS.bracket2;
  if (co2Emissions < 200) return IEDMT_BRACKETS.bracket3;
  if (region && IEDMT_TOP_BRACKET_BY_REGION[region] !== undefined) {
    return IEDMT_TOP_BRACKET_BY_REGION[region];
  }
  return IEDMT_BRACKETS.bracket4;
}

export type ItpExemptReason =
  | "special_territory"  // Canarias / Ceuta / Melilla (IGIC/IPSI)
  | "cat_zero_emissions" // Cataluña — 0 emisiones exento desde 2025-06-27
  | "cat_old_low_value"  // Cataluña — ≥10 años y <40.000€ valor original
  | "and_zero_emissions" // Andalucía — tipo reducido 1% para 0 emisiones
  | undefined;

export interface ItpCalc {
  rate: number;
  exempt: boolean;
  reasonCode: ItpExemptReason;
}

export function getItpCalc(opts: {
  region: string;
  defaultRate: number;
  isZeroEmission: boolean;
  vehicleAgeYears: number;
  originalValue: number;
}): ItpCalc {
  const { region, defaultRate, isZeroEmission, vehicleAgeYears, originalValue } = opts;

  if (region === "Canarias" || region === "Ceuta" || region === "Melilla") {
    return { rate: 0, exempt: true, reasonCode: "special_territory" };
  }
  // Cataluña: zero-emissions vehicles exempt since 2025-06-27 (Decreto-ley 5/2025).
  if (region === "Cataluña" && isZeroEmission) {
    return { rate: 0, exempt: true, reasonCode: "cat_zero_emissions" };
  }
  // Cataluña: ≥10 años AND valor original <40.000€ (excluye históricos).
  if (
    region === "Cataluña" &&
    vehicleAgeYears >= 10 &&
    originalValue > 0 &&
    originalValue < 40000
  ) {
    return { rate: 0, exempt: true, reasonCode: "cat_old_low_value" };
  }
  // Andalucía: tipo reducido 1% para vehículos cero emisiones.
  if (region === "Andalucía" && isZeroEmission) {
    return { rate: 0.01, exempt: false, reasonCode: "and_zero_emissions" };
  }
  return { rate: defaultRate, exempt: false, reasonCode: undefined };
}

// === MAIN ===

export function calculateImportCost(
  input: CalculationInput,
): CalculationResult {
  const depreciationFactor = getDepreciationFactor(
    input.registrationDate,
    input.carAge,
  );
  const vehicleAgeYears = getVehicleAgeYears(
    input.registrationDate,
    input.carAge,
  );
  const isNew = input.isNewCondition === true;
  const isZeroEmission = input.co2Emissions === 0;
  const region = input.spanishRegion;

  // ─── 1. TAX BASE ──────────────────────────────────────────────────────────
  // New car: invoice/transaction value (carPrice).
  // Used car: officialFiscalValue × depreciation factor (Orden HAC/1501/2025).
  const taxBase = isNew
    ? input.carPrice
    : input.officialFiscalValue * depreciationFactor;
  const marketValue = input.officialFiscalValue * depreciationFactor;

  // ─── 2. IEDMT (Impuesto Especial sobre Determinados Medios de Transporte) ─
  const iedmtRate = getIedmtRate(input.co2Emissions, region, isZeroEmission);
  const registrationTax = taxBase * iedmtRate;

  // ─── 3. ITP / VAT / DUTY ──────────────────────────────────────────────────
  let duty = 0;
  let vat = 0;
  let itpTax = 0;
  let itpRateApplied = 0;
  let itpExemptReason: ItpExemptReason = undefined;

  if (input.importType === "NonEU") {
    // CIF = transaction price + freight + insurance.
    const freight = input.transportCost ?? 0;
    const insurance =
      input.insuranceCost ?? Math.round(input.carPrice * 0.005);
    const cifValue = input.carPrice + freight + insurance;
    duty = cifValue * 0.1; // TARIC 8703 (turismos) general 10%.
    vat = (cifValue + duty) * 0.21; // Import IVA 21% on CIF + duty.
  } else {
    // EU
    if (isNew) {
      // Intracommunity new vehicle (≤6 months OR ≤6.000 km) → 21% Spanish IVA.
      vat = input.carPrice * 0.21;
    } else if (input.sellerType === "private") {
      const baseRate = input.itpRate ?? DEFAULT_ITP_RATE;
      const itp = getItpCalc({
        region: region ?? "",
        defaultRate: baseRate,
        isZeroEmission,
        vehicleAgeYears,
        originalValue: input.officialFiscalValue,
      });
      itpRateApplied = itp.rate;
      itpExemptReason = itp.reasonCode;
      itpTax = taxBase * itp.rate;
    }
    // EU dealer used: VAT settled in origin (REBU/régimen general) → no Spanish VAT, no ITP.
  }

  // ─── 4. LOGISTICS & ADMIN FEES ────────────────────────────────────────────
  const transport = input.transportCost ?? TRANSPORT_COSTS[input.originCountry];
  const dgtFee = FEES.DGT_TASA_1_1 + FEES.DGT_TASA_4_6;
  // ITV: cars without EU COC (most Non-EU + some EU) need ficha técnica reducida.
  const needsFichaReducida =
    input.importType === "NonEU" || input.needsHomologation;
  const itvFee =
    FEES.ITV_INSPECTION + (needsFichaReducida ? FEES.FICHA_TECNICA_REDUCIDA : 0);
  const platesFee = FEES.PLATES;
  const homologationFee = input.needsHomologation
    ? FEES.HOMOLOGATION_INDIVIDUAL
    : 0;
  const customsAgentFee = input.customsAgentFee ?? 0;
  const totalFees =
    dgtFee + itvFee + platesFee + homologationFee + customsAgentFee;

  // ─── 5. HACIENDA AUDIT-RISK INDICATOR ────────────────────────────────────
  // If declared price is well below market (BOE × depreciation), Hacienda may
  // issue a "liquidación complementaria" charging the difference.
  let auditRisk: "low" | "medium" | "high" = "low";
  let auditRiskRatio = 1;
  if (marketValue > 0 && input.carPrice > 0 && input.importType !== "NonEU") {
    auditRiskRatio = input.carPrice / marketValue;
    if (auditRiskRatio < 0.6) auditRisk = "high";
    else if (auditRiskRatio < 0.8) auditRisk = "medium";
  }

  // ─── 6. TOTALS ───────────────────────────────────────────────────────────
  const totalImportTaxes =
    registrationTax + itpTax + duty + vat + totalFees;
  const totalCost = input.carPrice + totalImportTaxes + transport;

  return {
    purchasePrice: input.carPrice,
    taxBase,
    marketValue,
    registrationTax,
    itpTax,
    itpRateApplied,
    itpExemptReason,
    duty,
    vat,
    customsAgentFee,
    homologationFee,
    dgtFee,
    itvFee,
    platesFee,
    transportCost: transport,
    totalImportTaxes,
    totalCost,
    taxRateApplied: iedmtRate,
    depreciationPercentage: depreciationFactor,
    auditRisk,
    auditRiskRatio,
  };
}
