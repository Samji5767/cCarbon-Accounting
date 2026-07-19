import { createClient } from "@libsql/client";
import { randomUUID } from "crypto";

const db = createClient({ url: "file:///home/user/cCarbon-Accounting/dev.db" });

async function run(sql, args = []) {
  return db.execute({ sql, args });
}

async function main() {
  // Emission factors
  const factors = [
    ["ef_natural_gas", "Natural Gas (Stationary)", "DEFRA", "2023", 2023, null, "natural_gas", "m3", 2.02404, 2.02404],
    ["ef_lpg", "LPG", "DEFRA", "2023", 2023, null, "lpg", "litre", 1.5554, 1.5554],
    ["ef_diesel_heat", "Diesel (Heating)", "DEFRA", "2023", 2023, null, "diesel", "litre", 2.68783, 2.68783],
    ["ef_petrol", "Petrol", "DEFRA", "2023", 2023, null, "petrol", "litre", 2.3164, 2.3164],
    ["ef_diesel_trans", "Diesel (Transport)", "DEFRA", "2023", 2023, null, "diesel_transport", "litre", 2.68783, 2.68783],
    ["ef_elec_uk", "UK Grid Electricity", "DEFRA", "2023", 2023, "GB", "electricity", "kWh", 0.212, 0.212],
    ["ef_elec_us", "US Average Electricity", "EPA eGRID", "2022", 2022, "US", "electricity", "kWh", 0.3867, 0.3867],
    ["ef_elec_global", "Global Average Electricity", "IEA", "2023", 2023, null, "electricity", "kWh", 0.433, 0.433],
    ["ef_r410a", "R-410A Refrigerant", "IPCC AR5", "AR5", 2014, null, "r410a", "kg", 2088, 2088],
    ["ef_air_short", "Air Travel Short Haul", "DEFRA", "2023", 2023, null, "air_travel_short", "km", 0.2551, 0.2551],
    ["ef_air_long", "Air Travel Long Haul", "DEFRA", "2023", 2023, null, "air_travel_long", "km", 0.1951, 0.1951],
    ["ef_car_avg", "Business Car", "DEFRA", "2023", 2023, null, "car_average", "km", 0.1709, 0.1709],
    ["ef_waste_landfill", "Waste to Landfill", "DEFRA", "2023", 2023, null, "waste_landfill", "tonne", 467, 467],
  ];

  for (const [id, name, source, version, year, country, activityType, unit, co2Factor, co2eTotal] of factors) {
    await run(
      `INSERT OR IGNORE INTO EmissionFactor (id, name, source, version, year, country, activityType, unit, co2Factor, co2eTotal, gwp100_co2, gwp100_ch4, gwp100_n2o, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 28, 265, datetime('now'), datetime('now'))`,
      [id, name, source, version, year, country, activityType, unit, co2Factor, co2eTotal]
    );
  }

  // Organization
  await run(
    `INSERT OR IGNORE INTO Organization (id, name, industry, country, reportingYear, baselineYear, targetYear, reductionTarget, framework, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ["demo-org", "Acme Manufacturing Corp", "Manufacturing", "US", 2024, 2020, 2030, 50.0, "GHG_PROTOCOL"]
  );

  // User
  await run(
    `INSERT OR IGNORE INTO User (id, email, name, role, organizationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ["demo-user", "admin@acme.com", "Alex Admin", "admin", "demo-org"]
  );

  // Facilities
  await run(
    `INSERT OR IGNORE INTO Facility (id, name, type, address, country, organizationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ["facility-1", "Main Manufacturing Plant", "manufacturing", "123 Industrial Blvd, Detroit, MI", "US", "demo-org"]
  );
  await run(
    `INSERT OR IGNORE INTO Facility (id, name, type, address, country, organizationId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ["facility-2", "Corporate Headquarters", "office", "456 Business Ave, New York, NY", "US", "demo-org"]
  );

  // Emission records
  const records = [
    ["rec-0", 1, "stationary_combustion", "natural_gas", 50000, "m3", 101.2, "facility-1", "ef_natural_gas", true],
    ["rec-1", 1, "stationary_combustion", "natural_gas", 8000, "m3", 16.19, "facility-2", "ef_natural_gas", true],
    ["rec-2", 1, "mobile_combustion", "diesel_transport", 15000, "litre", 40.32, "facility-1", "ef_diesel_trans", true],
    ["rec-3", 1, "fugitive", "r410a", 5, "kg", 10.44, "facility-1", "ef_r410a", true],
    ["rec-4", 2, "electricity", "electricity", 2500000, "kWh", 967.5, "facility-1", "ef_elec_us", true],
    ["rec-5", 2, "electricity", "electricity", 800000, "kWh", 309.6, "facility-2", "ef_elec_us", true],
    ["rec-6", 3, "business_travel", "air_travel_long", 120000, "km", 23.41, null, "ef_air_long", false],
    ["rec-7", 3, "business_travel", "car_average", 85000, "km", 14.53, null, "ef_car_avg", false],
    ["rec-8", 3, "waste", "waste_landfill", 45, "tonne", 21.0, "facility-1", "ef_waste_landfill", false],
    ["rec-9", 3, "employee_commuting", "car_average", 500000, "km", 85.45, null, "ef_car_avg", false],
  ];

  for (const [id, scope, category, activityType, quantity, unit, co2e, facilityId, efId, verified] of records) {
    await run(
      `INSERT OR IGNORE INTO EmissionRecord (id, organizationId, facilityId, year, scope, category, activityType, quantity, unit, emissionFactorId, co2e, verified, dataSource, createdAt, updatedAt)
       VALUES (?, 'demo-org', ?, 2024, ?, ?, ?, ?, ?, ?, ?, ?, 'Internal metering', datetime('now'), datetime('now'))`,
      [id, facilityId, scope, category, activityType, quantity, unit, efId, co2e, verified ? 1 : 0]
    );
  }

  // Targets
  await run(
    `INSERT OR IGNORE INTO EmissionTarget (id, organizationId, name, type, baselineYear, targetYear, baselineCo2e, targetCo2e, reductionPct, scope, status, createdAt, updatedAt)
     VALUES (?, 'demo-org', ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
    ["target-1", "Net Zero by 2030 (Scope 1+2)", "absolute", 2020, 2030, 2000, 0, 100, "scope1_2"]
  );
  await run(
    `INSERT OR IGNORE INTO EmissionTarget (id, organizationId, name, type, baselineYear, targetYear, baselineCo2e, targetCo2e, reductionPct, scope, status, createdAt, updatedAt)
     VALUES (?, 'demo-org', ?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))`,
    ["target-2", "50% Scope 3 Reduction by 2030", "absolute", 2020, 2030, 300, 150, 50, "scope3"]
  );

  // Report
  await run(
    `INSERT OR IGNORE INTO Report (id, organizationId, name, type, framework, year, status, totalScope1, totalScope2, totalScope3, totalCo2e, createdAt, updatedAt)
     VALUES (?, 'demo-org', ?, ?, ?, ?, 'draft', ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    ["report-2024", "2024 GHG Inventory Report", "annual", "GHG_PROTOCOL", 2024, 168.15, 1277.1, 144.39, 1589.64]
  );

  console.log("✓ Seed complete");
  await db.close();
}

main().catch(e => { console.error(e); process.exit(1); });
