import { CalculationInput, CalculationResult } from "../types";

// Official Hacienda Depreciation Table (BOE)
// Represents the % of value RETAINED by the car.
const DEPRECIATION_TABLE = {
  new: 1.0, // Less than 1 year: 100%
  "1_year": 0.84, // 1-2 years: 84%
  "2_years": 0.67, // 2-3 years: 67%
  "3_years": 0.56, // 3-4 years: 56%
  "4_years": 0.47, // 4-5 years: 47%
  "5_years": 0.39, // 5-6 years: 39%
  "6_years": 0.34, // 6-7 years: 34%
  "7_years": 0.28, // 7-8 years: 28%
  "8_years": 0.24, // 8-9 years: 24%
  "9_years": 0.19, // 9-10 years: 19%
  "10_years": 0.17, // 10-11 years: 17%
  "11_years": 0.13, // 11-12 years: 13%
  "12_plus_years": 0.1, // More than 12 years: 10%
};

const TRANSPORT_COSTS = {
  Germany: 800,
  France: 600,
  Italy: 900,
  Belgium: 850,
  Netherlands: 850,
};

const FEES = {
  DGT: 99.77,
  ITV: 80.0,
  PLATES: 200.0,
};

export function calculateImportCost(
  input: CalculationInput,
): CalculationResult {
  // 1. Determine Tax Base (Base Imponible)
  // Logic: Official BOE Value * Depreciation Factor
  const depreciationFactor = DEPRECIATION_TABLE[input.carAge];
  const taxBase = input.officialFiscalValue * depreciationFactor;

  // 2. Registration Tax (Impuesto de Matriculación)
  let taxRate = 0;
  if (input.co2Emissions <= 120) taxRate = 0;
  else if (input.co2Emissions < 160) taxRate = 0.0475;
  else if (input.co2Emissions < 200) taxRate = 0.0975;
  else taxRate = 0.1475;

  const registrationTax = taxBase * taxRate;

  // 3. ITP (Impuesto de Transmisiones Patrimoniales)
  // Only for Private Sellers. Uses the Tax Base (not purchase price) in most regions,
  // though some argue Purchase Price. Hacienda standard is usually the higher of the two,
  // but for import calculation, `taxBase` (Tablas Hacienda) is the standard reference.
  const rateITP = input.itpRate ?? 0.04; // Default 4%
  const itpTax = input.sellerType === "private" ? taxBase * rateITP : 0;

  // 4. Logistics & Fees
  const transport = input.transportCost ?? TRANSPORT_COSTS[input.originCountry];
  const totalFees = FEES.DGT + FEES.ITV + FEES.PLATES;

  // 5. Totals
  const totalImportTaxes = registrationTax + itpTax + totalFees;
  const totalCost = input.carPrice + totalImportTaxes + transport;

  return {
    purchasePrice: input.carPrice,
    taxBase,
    registrationTax,
    itpTax,
    dgtFee: FEES.DGT,
    itvFee: FEES.ITV,
    platesFee: FEES.PLATES,
    transportCost: transport,
    totalImportTaxes,
    totalCost,
    taxRateApplied: taxRate,
    depreciationPercentage: depreciationFactor,
  };
}
