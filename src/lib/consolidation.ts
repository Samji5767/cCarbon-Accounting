// Multi-entity GHG consolidation per GHG Protocol Corporate Standard Chapter 3
// Three approaches: operational control, financial control, equity share

export type ConsolidationApproach = "operational_control" | "financial_control" | "equity_share";

export interface Entity {
  id: string;
  name: string;
  type: "parent" | "subsidiary" | "joint_venture" | "associate" | "franchise";
  ownershipPct: number; // 0–100
  operationalControl: boolean;
  financialControl: boolean;
  scope1Co2e: number; // tCO2e (100% basis)
  scope2Co2e: number;
  scope3Co2e: number;
  country: string;
  acquisitionDate?: string; // for M&A proration
  disposalDate?: string;
  reportingYear: number;
}

export interface ConsolidatedResult {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  includedEntities: string[];
  excludedEntities: string[];
  prorationNotes: string[];
}

function prorateForPartialYear(value: number, acquisitionDate?: string, disposalDate?: string, year?: number): { value: number; note?: string } {
  if (!year) return { value };
  const startOfYear = new Date(`${year}-01-01`);
  const endOfYear = new Date(`${year}-12-31`);

  let start = startOfYear;
  let end = endOfYear;
  let note: string | undefined;

  if (acquisitionDate) {
    const acqDate = new Date(acquisitionDate);
    if (acqDate > startOfYear && acqDate.getFullYear() === year) {
      start = acqDate;
      note = `Acquired mid-year (${acquisitionDate})`;
    }
  }
  if (disposalDate) {
    const dispDate = new Date(disposalDate);
    if (dispDate < endOfYear && dispDate.getFullYear() === year) {
      end = dispDate;
      note = (note ? note + "; " : "") + `Disposed mid-year (${disposalDate})`;
    }
  }

  const totalDays = (endOfYear.getTime() - startOfYear.getTime()) / 86400000 + 1;
  const activeDays = (end.getTime() - start.getTime()) / 86400000 + 1;
  const fraction = activeDays / totalDays;

  return { value: value * fraction, note };
}

export function consolidate(entities: Entity[], approach: ConsolidationApproach): ConsolidatedResult {
  let scope1 = 0, scope2 = 0, scope3 = 0;
  const included: string[] = [];
  const excluded: string[] = [];
  const notes: string[] = [];

  for (const entity of entities) {
    let include = false;
    let factor = 1;

    if (approach === "operational_control") {
      include = entity.operationalControl;
      factor = 1;
    } else if (approach === "financial_control") {
      include = entity.financialControl;
      factor = 1;
    } else {
      // equity share
      include = entity.ownershipPct > 0;
      factor = entity.ownershipPct / 100;
    }

    if (!include) {
      excluded.push(entity.name);
      continue;
    }

    const { value: s1, note: n1 } = prorateForPartialYear(entity.scope1Co2e * factor, entity.acquisitionDate, entity.disposalDate, entity.reportingYear);
    const { value: s2 } = prorateForPartialYear(entity.scope2Co2e * factor, entity.acquisitionDate, entity.disposalDate, entity.reportingYear);
    const { value: s3 } = prorateForPartialYear(entity.scope3Co2e * factor, entity.acquisitionDate, entity.disposalDate, entity.reportingYear);

    scope1 += s1;
    scope2 += s2;
    scope3 += s3;
    included.push(entity.name);
    if (n1) notes.push(`${entity.name}: ${n1}`);
  }

  return {
    scope1: Math.round(scope1),
    scope2: Math.round(scope2),
    scope3: Math.round(scope3),
    total: Math.round(scope1 + scope2 + scope3),
    includedEntities: included,
    excludedEntities: excluded,
    prorationNotes: notes,
  };
}
