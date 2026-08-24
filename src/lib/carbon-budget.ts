// Science-based carbon budget calculator
// Based on IPCC AR6 WG1 remaining carbon budgets + SBTi sector pathways

export type TemperatureTarget = "1.5C_50pct" | "1.5C_67pct" | "2C_67pct";

// IPCC AR6 WG1 Table SPM.2 — remaining carbon budgets from 2020 (GtCO2)
// Source: IPCC AR6 WGI Chapter 5.5
export const GLOBAL_REMAINING_BUDGETS: Record<TemperatureTarget, number> = {
  "1.5C_50pct": 500,  // GtCO2 from 2020
  "1.5C_67pct": 400,
  "2C_67pct": 1150,
};

// Global CO2 emissions 2020–2023 consumed from budget (approx. 37 GtCO2/yr)
const ANNUAL_GLOBAL_EMISSIONS_GT = 37;

export interface SectorBudget {
  sectorShare: number; // % of global budget allocated to this sector
  remainingGlobal: number; // GtCO2
  remainingForSector: number; // GtCO2
  yearsBudgetLasts: number;
  impliedAnnualReductionPct: number; // % reduction needed per year from baselineYear to net-zero
}

// Sector shares of global carbon budget (approximate, based on IEA/IPCC sector decomposition)
export const SECTOR_BUDGET_SHARES: Record<string, number> = {
  manufacturing: 0.22,
  transport: 0.25,
  buildings: 0.13,
  electricity: 0.24,
  agriculture: 0.10,
  financial_services: 0.01,
  technology: 0.02,
  retail: 0.03,
};

export function calculateCompanyBudget(params: {
  target: TemperatureTarget;
  industryKey: string;
  revenueUSDm: number;
  sectorRevenueUSDbn: number; // global sector revenue
  currentCo2e: number; // tCO2e/yr
  baselineYear: number;
  currentYear: number;
  netZeroYear: number;
}): {
  globalRemainingGt: number;
  sectorRemainingGt: number;
  companyBudgetMtCO2e: number; // million tonnes
  companyBudgetTCO2e: number;
  yearsAtCurrentRate: number;
  requiredLinearReductionPctPerYear: number;
  cumulativeEmissionsToNetZero: number; // tCO2e if linear path
  budgetSurplusOrDeficit: number; // tCO2e (positive = on track)
} {
  const { target, industryKey, revenueUSDm, sectorRevenueUSDbn, currentCo2e, baselineYear, currentYear, netZeroYear } = params;

  const yearsConsumed = currentYear - 2020;
  const globalRemaining = GLOBAL_REMAINING_BUDGETS[target] - ANNUAL_GLOBAL_EMISSIONS_GT * yearsConsumed;
  const sectorShare = SECTOR_BUDGET_SHARES[industryKey] ?? 0.03;
  const sectorRemainingGt = globalRemaining * sectorShare;

  // Company revenue share of sector
  const companyRevenueShare = revenueUSDm / (sectorRevenueUSDbn * 1000);
  const companyBudgetMtCO2e = sectorRemainingGt * 1000 * companyRevenueShare; // Gt → Mt
  const companyBudgetTCO2e = companyBudgetMtCO2e * 1e6;

  const yearsAtCurrentRate = currentCo2e > 0 ? companyBudgetTCO2e / currentCo2e : Infinity;

  // Linear path from current to zero at netZeroYear
  const yearsToNetZero = netZeroYear - currentYear;
  const cumulativeEmissionsToNetZero = (currentCo2e * yearsToNetZero) / 2; // triangle
  const budgetSurplusOrDeficit = companyBudgetTCO2e - cumulativeEmissionsToNetZero;

  // Required annual % reduction on linear path
  const requiredLinearReductionPctPerYear = yearsToNetZero > 0 ? (100 / yearsToNetZero) : 100;

  return {
    globalRemainingGt: Math.round(globalRemaining),
    sectorRemainingGt: Math.round(sectorRemainingGt * 10) / 10,
    companyBudgetMtCO2e: Math.round(companyBudgetMtCO2e * 100) / 100,
    companyBudgetTCO2e: Math.round(companyBudgetTCO2e),
    yearsAtCurrentRate: Math.round(yearsAtCurrentRate * 10) / 10,
    requiredLinearReductionPctPerYear: Math.round(requiredLinearReductionPctPerYear * 10) / 10,
    cumulativeEmissionsToNetZero: Math.round(cumulativeEmissionsToNetZero),
    budgetSurplusOrDeficit: Math.round(budgetSurplusOrDeficit),
  };
}
