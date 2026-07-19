// Scope 2 dual reporting: market-based vs location-based
// per GHG Protocol Scope 2 Guidance (2015)

export interface Scope2Inputs {
  electricityKwh: number;
  // Market-based instruments
  recCertificates?: number; // kWh covered by RECs/GOs
  ppaFactor?: number; // kg CO2e/kWh from PPA contract
  supplierSpecificFactor?: number; // kg CO2e/kWh from supplier disclosure
  // Location-based
  gridFactor: number; // kg CO2e/kWh from national/regional grid
  residualMixFactor?: number; // kg CO2e/kWh residual mix (preferred for market-based)
}

export interface Scope2Result {
  locationBased: number; // tCO2e
  marketBased: number; // tCO2e
  instrumentType: "REC" | "PPA" | "SupplierSpecific" | "ResidualMix" | "GridFallback";
  coverageRatio: number; // 0-1 fraction covered by instruments
}

export function calculateScope2Dual(inputs: Scope2Inputs): Scope2Result {
  const {
    electricityKwh,
    recCertificates = 0,
    ppaFactor,
    supplierSpecificFactor,
    gridFactor,
    residualMixFactor,
  } = inputs;

  // Location-based: always use grid factor
  const locationBased = (electricityKwh * gridFactor) / 1000; // kg → tonnes

  // Market-based hierarchy per GHG Protocol:
  // 1. Supplier-specific (highest quality)
  // 2. PPA contractual
  // 3. RECs/GOs (zeroed for covered kWh, residual mix for remainder)
  // 4. Residual mix factor
  // 5. Grid average as fallback

  let marketBased = 0;
  let instrumentType: Scope2Result["instrumentType"] = "GridFallback";
  let coverageRatio = 0;

  if (supplierSpecificFactor !== undefined) {
    marketBased = (electricityKwh * supplierSpecificFactor) / 1000;
    instrumentType = "SupplierSpecific";
    coverageRatio = 1;
  } else if (ppaFactor !== undefined) {
    marketBased = (electricityKwh * ppaFactor) / 1000;
    instrumentType = "PPA";
    coverageRatio = 1;
  } else if (recCertificates > 0) {
    const coveredKwh = Math.min(recCertificates, electricityKwh);
    const uncoveredKwh = electricityKwh - coveredKwh;
    const uncoveredFactor = residualMixFactor ?? gridFactor;
    // RECs make covered portion zero-emission; remainder uses residual mix
    marketBased = (uncoveredKwh * uncoveredFactor) / 1000;
    instrumentType = "REC";
    coverageRatio = coveredKwh / electricityKwh;
  } else if (residualMixFactor !== undefined) {
    marketBased = (electricityKwh * residualMixFactor) / 1000;
    instrumentType = "ResidualMix";
    coverageRatio = 0;
  } else {
    // Fallback: use grid factor (same as location-based)
    marketBased = locationBased;
    instrumentType = "GridFallback";
    coverageRatio = 0;
  }

  return { locationBased, marketBased, instrumentType, coverageRatio };
}
