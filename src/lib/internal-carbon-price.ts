// Internal Carbon Pricing (ICP) module
// Supports shadow price, internal fee, and implicit price mechanisms

export type ICPMechanism = "shadow_price" | "internal_fee" | "implicit_price";

export interface ICPConfig {
  mechanism: ICPMechanism;
  pricePerTonneCO2e: number; // USD per tCO2e
  currency: string;
  effectiveYear: number;
  escalationRatePct: number; // annual % increase
  applyToScopes: (1 | 2 | 3)[];
}

export interface ICPResult {
  scope1Cost: number;
  scope2Cost: number;
  scope3Cost: number;
  totalCost: number;
  priceUsed: number;
}

export function calculateICP(
  emissions: { scope1: number; scope2: number; scope3: number },
  config: ICPConfig,
  year: number
): ICPResult {
  const yearsElapsed = Math.max(0, year - config.effectiveYear);
  const priceUsed =
    config.pricePerTonneCO2e * Math.pow(1 + config.escalationRatePct / 100, yearsElapsed);

  const scope1Cost = config.applyToScopes.includes(1) ? emissions.scope1 * priceUsed : 0;
  const scope2Cost = config.applyToScopes.includes(2) ? emissions.scope2 * priceUsed : 0;
  const scope3Cost = config.applyToScopes.includes(3) ? emissions.scope3 * priceUsed : 0;

  return {
    scope1Cost,
    scope2Cost,
    scope3Cost,
    totalCost: scope1Cost + scope2Cost + scope3Cost,
    priceUsed,
  };
}

// World Bank Carbon Pricing Reference levels for benchmarking
export const CARBON_PRICE_BENCHMARKS = {
  EU_ETS_2024: 65, // EUR/tCO2e (approximate)
  UK_ETS_2024: 35, // GBP/tCO2e
  REDD_VOLUNTARY: 12, // USD/tCO2e (voluntary market average)
  SBTi_SHADOW_PRICE_2030: 50, // USD/tCO2e (Science Based Target initiative guidance)
  HIGH_LEVEL_COMMISSION_2030: 100, // USD/tCO2e (High-Level Commission on Carbon Prices)
  HIGH_LEVEL_COMMISSION_2050: 200, // USD/tCO2e
};

export type BenchmarkKey = keyof typeof CARBON_PRICE_BENCHMARKS;
