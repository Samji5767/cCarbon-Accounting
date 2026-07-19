// Scope 3 materiality screening per GHG Protocol Scope 3 Standard Chapter 7
// Helps identify which of the 15 categories are material for reporting

export interface MaterialityScreen {
  categoryId: number;
  categoryName: string;
  estimatedEmissions?: number; // tCO2e if known
  industryRelevance: "high" | "medium" | "low";
  isUpstream: boolean;
  screeningCriteria: {
    size: boolean; // likely large relative to total
    influence: boolean; // company has influence over
    stakeholders: boolean; // stakeholders consider important
    outsourcing: boolean; // outsourced activities
    sector: boolean; // major source in sector
  };
  materiality: "material" | "not_material" | "to_be_assessed";
  reasoning: string;
}

// Industry-specific materiality guidance per GHG Protocol supplemental guidance
const INDUSTRY_RELEVANCE: Record<string, Record<number, "high" | "medium" | "low">> = {
  manufacturing: {
    1: "high", 2: "high", 3: "high", 4: "high", 5: "high",
    6: "medium", 7: "medium", 8: "low", 9: "high", 10: "high",
    11: "high", 12: "high", 13: "low", 14: "low", 15: "low",
  },
  financial_services: {
    1: "low", 2: "medium", 3: "medium", 4: "low", 5: "low",
    6: "high", 7: "high", 8: "medium", 9: "low", 10: "low",
    11: "low", 12: "low", 13: "medium", 14: "medium", 15: "high",
  },
  retail: {
    1: "high", 2: "medium", 3: "medium", 4: "high", 5: "medium",
    6: "medium", 7: "medium", 8: "low", 9: "high", 10: "low",
    11: "high", 12: "high", 13: "medium", 14: "medium", 15: "low",
  },
  technology: {
    1: "medium", 2: "high", 3: "medium", 4: "medium", 5: "medium",
    6: "high", 7: "high", 8: "medium", 9: "medium", 10: "low",
    11: "high", 12: "medium", 13: "medium", 14: "low", 15: "medium",
  },
  transport: {
    1: "high", 2: "low", 3: "high", 4: "high", 5: "medium",
    6: "low", 7: "medium", 8: "high", 9: "high", 10: "low",
    11: "low", 12: "medium", 13: "high", 14: "medium", 15: "low",
  },
  other: {
    1: "medium", 2: "medium", 3: "medium", 4: "medium", 5: "medium",
    6: "medium", 7: "medium", 8: "medium", 9: "medium", 10: "medium",
    11: "medium", 12: "medium", 13: "medium", 14: "medium", 15: "medium",
  },
};

const SCOPE3_CATEGORY_NAMES: Record<number, string> = {
  1: "Purchased Goods and Services",
  2: "Capital Goods",
  3: "Fuel and Energy Related Activities",
  4: "Upstream Transportation and Distribution",
  5: "Waste Generated in Operations",
  6: "Business Travel",
  7: "Employee Commuting",
  8: "Upstream Leased Assets",
  9: "Downstream Transportation and Distribution",
  10: "Processing of Sold Products",
  11: "Use of Sold Products",
  12: "End-of-Life Treatment of Sold Products",
  13: "Downstream Leased Assets",
  14: "Franchises",
  15: "Investments",
};

export function screenScope3Materiality(
  industry: string,
  totalScope1And2Co2e: number,
  categoryEstimates: Partial<Record<number, number>> = {}
): MaterialityScreen[] {
  const industryKey = Object.keys(INDUSTRY_RELEVANCE).includes(industry)
    ? industry
    : "other";
  const relevance = INDUSTRY_RELEVANCE[industryKey];

  return Array.from({ length: 15 }, (_, i) => i + 1).map((catId) => {
    const estimate = categoryEstimates[catId];
    const industryRel = relevance[catId] ?? "medium";

    // Size criterion: >40% of total Scope 1+2+3 or estimated large
    const sizeCriterion = estimate
      ? estimate > totalScope1And2Co2e * 0.1
      : industryRel === "high";

    const screen: MaterialityScreen = {
      categoryId: catId,
      categoryName: SCOPE3_CATEGORY_NAMES[catId],
      estimatedEmissions: estimate,
      industryRelevance: industryRel,
      isUpstream: catId <= 8,
      screeningCriteria: {
        size: sizeCriterion,
        influence: catId <= 7, // upstream categories have more influence
        stakeholders: industryRel === "high",
        outsourcing: catId === 1 || catId === 8 || catId === 13,
        sector: industryRel === "high",
      },
      materiality: "to_be_assessed",
      reasoning: "",
    };

    const criteriaCount = Object.values(screen.screeningCriteria).filter(Boolean).length;
    screen.materiality = criteriaCount >= 3 ? "material" : criteriaCount >= 1 ? "to_be_assessed" : "not_material";
    screen.reasoning =
      criteriaCount >= 3
        ? `High industry relevance and ${criteriaCount}/5 materiality criteria met`
        : criteriaCount >= 1
        ? "Partial criteria met — further assessment required"
        : "Low likelihood of materiality for this industry";

    return screen;
  });
}
