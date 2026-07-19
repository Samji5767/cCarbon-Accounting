// Data quality scoring per GHG Protocol and IPCC Tier framework
// DQ score: 1 (highest) to 5 (lowest)

export type DataQualityDimension =
  | "technological_representativeness"
  | "temporal_representativeness"
  | "geographical_representativeness"
  | "completeness"
  | "reliability";

export interface DataQualityScore {
  overall: number; // 1-5
  dimensions: Record<DataQualityDimension, number>;
  tier: 1 | 2 | 3;
  uncertaintyPct: number;
}

export type DataTier = 1 | 2 | 3;

// IPCC Tier definitions
// Tier 1: Default emission factors (country/sector averages)
// Tier 2: Country-specific or technology-specific EFs
// Tier 3: Activity-specific measurements or direct monitoring

export function scoreDataQuality(params: {
  tier: DataTier;
  efYear: number;
  reportYear: number;
  isSiteSpecific: boolean;
  isMeasured: boolean; // direct measurement vs calculation
  scope3Category?: number;
}): DataQualityScore {
  const { tier, efYear, reportYear, isSiteSpecific, isMeasured, scope3Category } = params;

  const yearDiff = Math.abs(reportYear - efYear);

  const tech: number = isSiteSpecific ? 1 : tier === 3 ? 2 : tier === 2 ? 3 : 4;
  const temporal: number = yearDiff <= 1 ? 1 : yearDiff <= 3 ? 2 : yearDiff <= 5 ? 3 : 4;
  const geo: number = isSiteSpecific ? 1 : tier === 3 ? 2 : tier === 2 ? 2 : 3;
  const completeness: number = scope3Category ? (scope3Category <= 7 ? 2 : 3) : 1;
  const reliability: number = isMeasured ? 1 : tier === 3 ? 2 : tier === 2 ? 3 : 4;

  const overall = Math.round((tech + temporal + geo + completeness + reliability) / 5);

  // Uncertainty ranges based on tier and DQ (IPCC 2006 default uncertainty)
  const uncertaintyPct = tier === 3 ? 5 : tier === 2 ? 15 : 50;

  return {
    overall,
    dimensions: {
      technological_representativeness: tech,
      temporal_representativeness: temporal,
      geographical_representativeness: geo,
      completeness,
      reliability,
    },
    tier,
    uncertaintyPct,
  };
}

export function dqLabel(score: number): string {
  if (score <= 1) return "Excellent";
  if (score <= 2) return "Good";
  if (score <= 3) return "Fair";
  if (score <= 4) return "Poor";
  return "Very Poor";
}

export function dqColor(score: number): string {
  if (score <= 1) return "text-emerald-600";
  if (score <= 2) return "text-green-600";
  if (score <= 3) return "text-yellow-600";
  if (score <= 4) return "text-orange-600";
  return "text-red-600";
}
