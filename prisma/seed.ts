import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:///home/user/cCarbon-Accounting/dev.db" });
const prisma = new PrismaClient({ adapter } as never);

async function main() {
  // Seed emission factors
  const factors = [
    { name: "Natural Gas (Stationary)", source: "DEFRA", version: "2023", year: 2023, activityType: "natural_gas", unit: "m3", co2Factor: 2.02404, co2eTotal: 2.02404 },
    { name: "LPG (Stationary)", source: "DEFRA", version: "2023", year: 2023, activityType: "lpg", unit: "litre", co2Factor: 1.55540, co2eTotal: 1.55540 },
    { name: "Diesel (Heating)", source: "DEFRA", version: "2023", year: 2023, activityType: "diesel", unit: "litre", co2Factor: 2.68783, co2eTotal: 2.68783 },
    { name: "Petrol", source: "DEFRA", version: "2023", year: 2023, activityType: "petrol", unit: "litre", co2Factor: 2.31640, co2eTotal: 2.31640 },
    { name: "Diesel (Transport)", source: "DEFRA", version: "2023", year: 2023, activityType: "diesel_transport", unit: "litre", co2Factor: 2.68783, co2eTotal: 2.68783 },
    { name: "UK Grid Electricity", source: "DEFRA", version: "2023", year: 2023, country: "GB", activityType: "electricity", unit: "kWh", co2Factor: 0.2120, co2eTotal: 0.2120 },
    { name: "US Average Electricity", source: "EPA eGRID", version: "2022", year: 2022, country: "US", activityType: "electricity", unit: "kWh", co2Factor: 0.3867, co2eTotal: 0.3867 },
    { name: "Global Average Electricity", source: "IEA", version: "2023", year: 2023, activityType: "electricity", unit: "kWh", co2Factor: 0.4330, co2eTotal: 0.4330 },
    { name: "R-410A Refrigerant", source: "IPCC AR5", version: "AR5", year: 2014, activityType: "r410a", unit: "kg", co2Factor: 2088, co2eTotal: 2088 },
    { name: "Air Travel Short Haul", source: "DEFRA", version: "2023", year: 2023, activityType: "air_travel_short", unit: "km", co2Factor: 0.25510, co2eTotal: 0.25510 },
    { name: "Air Travel Long Haul", source: "DEFRA", version: "2023", year: 2023, activityType: "air_travel_long", unit: "km", co2Factor: 0.19510, co2eTotal: 0.19510 },
    { name: "Business Travel - Car", source: "DEFRA", version: "2023", year: 2023, activityType: "car_average", unit: "km", co2Factor: 0.17090, co2eTotal: 0.17090 },
    { name: "Waste to Landfill", source: "DEFRA", version: "2023", year: 2023, activityType: "waste_landfill", unit: "tonne", co2Factor: 467, co2eTotal: 467 },
  ];

  for (const f of factors) {
    await prisma.emissionFactor.upsert({
      where: { id: f.activityType + "_" + (f.country ?? "global") },
      update: {},
      create: { id: f.activityType + "_" + (f.country ?? "global"), ...f },
    });
  }

  // Demo organization
  const org = await prisma.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Acme Manufacturing Corp",
      industry: "Manufacturing",
      country: "US",
      reportingYear: 2024,
      baselineYear: 2020,
      targetYear: 2030,
      reductionTarget: 50,
      framework: "GHG_PROTOCOL",
    },
  });

  // Demo user
  await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      id: "demo-user",
      email: "admin@acme.com",
      name: "Alex Admin",
      role: "admin",
      organizationId: org.id,
    },
  });

  // Demo facilities
  const facility1 = await prisma.facility.upsert({
    where: { id: "facility-1" },
    update: {},
    create: {
      id: "facility-1",
      name: "Main Manufacturing Plant",
      type: "manufacturing",
      address: "123 Industrial Blvd, Detroit, MI",
      country: "US",
      organizationId: org.id,
    },
  });

  const facility2 = await prisma.facility.upsert({
    where: { id: "facility-2" },
    update: {},
    create: {
      id: "facility-2",
      name: "Corporate Headquarters",
      type: "office",
      address: "456 Business Ave, New York, NY",
      country: "US",
      organizationId: org.id,
    },
  });

  // Demo emission records for 2024
  const records = [
    // Scope 1
    { scope: 1, category: "stationary_combustion", activityType: "natural_gas", quantity: 50000, unit: "m3", co2e: 101.2, facilityId: facility1.id, month: null },
    { scope: 1, category: "stationary_combustion", activityType: "natural_gas", quantity: 8000, unit: "m3", co2e: 16.19, facilityId: facility2.id, month: null },
    { scope: 1, category: "mobile_combustion", activityType: "diesel_transport", quantity: 15000, unit: "litre", co2e: 40.32, facilityId: facility1.id, month: null },
    { scope: 1, category: "fugitive", activityType: "r410a", quantity: 5, unit: "kg", co2e: 10.44, facilityId: facility1.id, month: null },
    // Scope 2
    { scope: 2, category: "electricity", activityType: "electricity", quantity: 2500000, unit: "kWh", co2e: 967.5, facilityId: facility1.id, month: null },
    { scope: 2, category: "electricity", activityType: "electricity", quantity: 800000, unit: "kWh", co2e: 309.6, facilityId: facility2.id, month: null },
    // Scope 3
    { scope: 3, category: "business_travel", activityType: "air_travel_long", quantity: 120000, unit: "km", co2e: 23.41, facilityId: null, month: null },
    { scope: 3, category: "business_travel", activityType: "car_average", quantity: 85000, unit: "km", co2e: 14.53, facilityId: null, month: null },
    { scope: 3, category: "waste", activityType: "waste_landfill", quantity: 45, unit: "tonne", co2e: 21.0, facilityId: facility1.id, month: null },
    { scope: 3, category: "employee_commuting", activityType: "car_average", quantity: 500000, unit: "km", co2e: 85.45, facilityId: null, month: null },
  ];

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    await prisma.emissionRecord.upsert({
      where: { id: `record-${i}` },
      update: {},
      create: {
        id: `record-${i}`,
        organizationId: org.id,
        year: 2024,
        verified: i < 6,
        dataSource: "Internal metering",
        ...r,
      },
    });
  }

  // Demo targets
  await prisma.emissionTarget.upsert({
    where: { id: "target-1" },
    update: {},
    create: {
      id: "target-1",
      organizationId: org.id,
      name: "Net Zero by 2030 (Scope 1+2)",
      type: "absolute",
      baselineYear: 2020,
      targetYear: 2030,
      baselineCo2e: 2000,
      targetCo2e: 0,
      reductionPct: 100,
      scope: "scope1_2",
      status: "active",
    },
  });

  await prisma.emissionTarget.upsert({
    where: { id: "target-2" },
    update: {},
    create: {
      id: "target-2",
      organizationId: org.id,
      name: "50% Scope 3 Reduction by 2030",
      type: "absolute",
      baselineYear: 2020,
      targetYear: 2030,
      baselineCo2e: 300,
      targetCo2e: 150,
      reductionPct: 50,
      scope: "scope3",
      status: "active",
    },
  });

  // Demo report
  await prisma.report.upsert({
    where: { id: "report-2024" },
    update: {},
    create: {
      id: "report-2024",
      organizationId: org.id,
      name: "2024 GHG Inventory Report",
      type: "annual",
      framework: "GHG_PROTOCOL",
      year: 2024,
      status: "draft",
      totalScope1: 168.15,
      totalScope2: 1277.1,
      totalScope3: 144.39,
      totalCo2e: 1589.64,
    },
  });

  console.log("Seed complete ✓");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
