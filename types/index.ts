export type Country =
  | "Germany"
  | "France"
  | "Italy"
  | "Belgium"
  | "Netherlands"
  | "USA"
  | "UAE"
  | "Japan"
  | "Korea";

export type ImportType = "EU" | "NonEU";

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
  importType?: ImportType;
  originCountry: Country;
  carPrice: number;
  officialFiscalValue: number;
  carAge?: CarAge;
  registrationDate?: string;
  isNewCondition?: boolean;
  co2Emissions: number;
  sellerType: "dealer" | "private";
  transportCost?: number;
  insuranceCost?: number;
  itpRate?: number;
  spanishRegion?: string;
  customsAgentFee?: number;
  needsHomologation?: boolean;
  brand?: string;
  model?: string;
}

export type ItpExemptReasonCode =
  | "special_territory"
  | "cat_zero_emissions"
  | "cat_old_low_value"
  | "and_zero_emissions";

export interface CalculationResult {
  purchasePrice: number;
  taxBase: number;
  marketValue: number;
  registrationTax: number;
  itpTax: number;
  itpRateApplied: number;
  itpExemptReason?: ItpExemptReasonCode;
  duty?: number;
  vat?: number;
  customsAgentFee?: number;
  homologationFee?: number;
  dgtFee: number;
  itvFee: number;
  platesFee: number;
  transportCost: number;
  totalImportTaxes: number;
  totalCost: number;
  taxRateApplied: number;
  depreciationPercentage: number;
  auditRisk: "low" | "medium" | "high";
  auditRiskRatio: number;
}
