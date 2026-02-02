export type Country =
  | "Germany"
  | "France"
  | "Italy"
  | "Belgium"
  | "Netherlands";

export type CarAge =
  | "new"
  | "1_year"
  | "2_years"
  | "3_years"
  | "4_years"
  | "5_years"
  | "6_years"
  | "7_years"
  | "8_years"
  | "9_years"
  | "10_years"
  | "11_years"
  | "12_plus_years";

export interface CalculationInput {
  originCountry: Country;
  carPrice: number; // Purchase Price (Market Value)
  officialFiscalValue: number; // BOE Value (Brand new value according to Hacienda)
  carAge: CarAge;
  co2Emissions: number;
  sellerType: "dealer" | "private";
  transportCost?: number;
  itpRate?: number; // Regional Transfer Tax Rate (Default 0.04)
}

export interface CalculationResult {
  purchasePrice: number;
  taxBase: number; // Base Imponible (Fiscal Value * Depreciation)
  registrationTax: number; // IEDMT
  itpTax: number; // ITP (if private)
  dgtFee: number;
  itvFee: number;
  platesFee: number;
  transportCost: number;
  totalImportTaxes: number; // Sum of taxes/fees (excluding car price)
  totalCost: number; // Final Check to write
  taxRateApplied: number;
  depreciationPercentage: number; // The % value RETAINED (e.g., 0.84)
}
