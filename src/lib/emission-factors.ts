// Standard emission factors based on IPCC AR5, EPA, DEFRA 2023 sources
// All factors are in kg CO2e per unit

export const EMISSION_FACTORS = {
  // Scope 1 - Stationary Combustion (kg CO2e per litre/m3/kWh)
  stationary_combustion: {
    natural_gas: { factor: 2.02404, unit: "m3", source: "DEFRA 2023", name: "Natural Gas" },
    lpg: { factor: 1.55540, unit: "litre", source: "DEFRA 2023", name: "LPG" },
    diesel: { factor: 2.68783, unit: "litre", source: "DEFRA 2023", name: "Diesel (heating)" },
    fuel_oil: { factor: 2.96002, unit: "litre", source: "DEFRA 2023", name: "Fuel Oil" },
    coal: { factor: 2.42273, unit: "kg", source: "DEFRA 2023", name: "Coal" },
    biomass: { factor: 0.01530, unit: "kg", source: "DEFRA 2023", name: "Wood/Biomass" },
  },

  // Scope 1 - Mobile Combustion
  mobile_combustion: {
    petrol: { factor: 2.31640, unit: "litre", source: "DEFRA 2023", name: "Petrol/Gasoline" },
    diesel_transport: { factor: 2.68783, unit: "litre", source: "DEFRA 2023", name: "Diesel (transport)" },
    aviation_fuel: { factor: 2.55352, unit: "litre", source: "DEFRA 2023", name: "Aviation Fuel" },
    cng: { factor: 0.44280, unit: "m3", source: "DEFRA 2023", name: "Compressed Natural Gas" },
  },

  // Scope 1 - Fugitive Emissions (GWP 100-year AR5)
  fugitive: {
    r410a: { factor: 2088, unit: "kg", source: "IPCC AR5", name: "R-410A Refrigerant" },
    r134a: { factor: 1430, unit: "kg", source: "IPCC AR5", name: "R-134a Refrigerant" },
    r22: { factor: 1810, unit: "kg", source: "IPCC AR5", name: "R-22 Refrigerant" },
    sf6: { factor: 23500, unit: "kg", source: "IPCC AR5", name: "SF6 (electrical)" },
    methane: { factor: 28, unit: "kg", source: "IPCC AR5", name: "Methane (fugitive)" },
  },

  // Scope 2 - Electricity (market-based factors by country, kg CO2e/kWh)
  electricity: {
    global_average: { factor: 0.4330, unit: "kWh", source: "IEA 2023", name: "Global Average" },
    us_average: { factor: 0.3867, unit: "kWh", source: "EPA eGRID 2022", name: "US Average" },
    uk: { factor: 0.2120, unit: "kWh", source: "DEFRA 2023", name: "UK Grid" },
    eu_average: { factor: 0.2780, unit: "kWh", source: "EEA 2023", name: "EU Average" },
    germany: { factor: 0.3850, unit: "kWh", source: "UBA 2023", name: "Germany Grid" },
    france: { factor: 0.0561, unit: "kWh", source: "ADEME 2023", name: "France Grid" },
    india: { factor: 0.7080, unit: "kWh", source: "CEA 2023", name: "India Grid" },
    china: { factor: 0.5810, unit: "kWh", source: "NDRC 2022", name: "China Grid" },
    australia: { factor: 0.7290, unit: "kWh", source: "DISER 2023", name: "Australia Grid" },
    renewable: { factor: 0.0000, unit: "kWh", source: "GHG Protocol", name: "Renewable (RECs/PPAs)" },
  },

  // Scope 3 - Upstream (kg CO2e per unit)
  scope3_upstream: {
    air_travel_short: { factor: 0.25510, unit: "km", source: "DEFRA 2023", name: "Air Travel <3700km" },
    air_travel_long: { factor: 0.19510, unit: "km", source: "DEFRA 2023", name: "Air Travel >3700km" },
    car_average: { factor: 0.17090, unit: "km", source: "DEFRA 2023", name: "Car (average)" },
    car_ev: { factor: 0.04690, unit: "km", source: "DEFRA 2023", name: "Car (electric)" },
    rail: { factor: 0.04130, unit: "km", source: "DEFRA 2023", name: "Rail travel" },
    hotel_night: { factor: 31.00, unit: "night", source: "DEFRA 2023", name: "Hotel stay" },
    purchased_goods: { factor: 0.43, unit: "USD", source: "Environmentally-Extended IO", name: "Purchased Goods (avg)" },
    waste_landfill: { factor: 467, unit: "tonne", source: "DEFRA 2023", name: "Waste to landfill" },
    waste_recycled: { factor: 21, unit: "tonne", source: "DEFRA 2023", name: "Waste recycled" },
    water: { factor: 0.000344, unit: "litre", source: "DEFRA 2023", name: "Water supply" },
  },
};

// GHG Protocol Scope 3 categories
export const SCOPE3_CATEGORIES = [
  { id: 1, name: "Purchased Goods and Services" },
  { id: 2, name: "Capital Goods" },
  { id: 3, name: "Fuel and Energy Related Activities" },
  { id: 4, name: "Upstream Transportation and Distribution" },
  { id: 5, name: "Waste Generated in Operations" },
  { id: 6, name: "Business Travel" },
  { id: 7, name: "Employee Commuting" },
  { id: 8, name: "Upstream Leased Assets" },
  { id: 9, name: "Downstream Transportation and Distribution" },
  { id: 10, name: "Processing of Sold Products" },
  { id: 11, name: "Use of Sold Products" },
  { id: 12, name: "End-of-Life Treatment of Sold Products" },
  { id: 13, name: "Downstream Leased Assets" },
  { id: 14, name: "Franchises" },
  { id: 15, name: "Investments" },
];

export function calculateCO2e(
  quantity: number,
  factorKey: string,
  categoryKey: keyof typeof EMISSION_FACTORS
): number {
  const category = EMISSION_FACTORS[categoryKey] as Record<string, { factor: number }>;
  const factor = category?.[factorKey];
  if (!factor) return 0;
  return (quantity * factor.factor) / 1000; // Convert kg to tonnes
}

export const REGULATORY_FRAMEWORKS = {
  GHG_PROTOCOL: {
    name: "GHG Protocol Corporate Standard",
    description: "The most widely used international accounting tool for GHG emissions",
    scopes: [1, 2, 3],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity"],
    reportingFrequency: "annual",
    verificationRequired: false,
    url: "https://ghgprotocol.org",
  },
  ISO_14064: {
    name: "ISO 14064-1:2018",
    description: "International standard for GHG inventories at organizational level",
    scopes: [1, 2, 3],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity", "fugitive"],
    reportingFrequency: "annual",
    verificationRequired: true,
    url: "https://www.iso.org/standard/66453.html",
  },
  TCFD: {
    name: "Task Force on Climate-related Financial Disclosures (TCFD)",
    description: "Framework for climate-related risk and opportunity disclosures",
    scopes: [1, 2, 3],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity"],
    reportingFrequency: "annual",
    verificationRequired: false,
    url: "https://www.fsb-tcfd.org",
  },
  CSRD: {
    name: "EU Corporate Sustainability Reporting Directive (CSRD)",
    description: "EU mandatory sustainability reporting under ESRS standards",
    scopes: [1, 2, 3],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity", "fugitive"],
    reportingFrequency: "annual",
    verificationRequired: true,
    url: "https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en",
  },
  SEC: {
    name: "SEC Climate Disclosure Rules",
    description: "US Securities and Exchange Commission climate risk disclosure",
    scopes: [1, 2],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity"],
    reportingFrequency: "annual",
    verificationRequired: true,
    url: "https://www.sec.gov/climate",
  },
  CDP: {
    name: "CDP Climate Change Questionnaire",
    description: "Annual disclosure to CDP investors and supply chain program",
    scopes: [1, 2, 3],
    requiredCategories: ["stationary_combustion", "mobile_combustion", "electricity", "fugitive"],
    reportingFrequency: "annual",
    verificationRequired: false,
    url: "https://www.cdp.net",
  },
};
