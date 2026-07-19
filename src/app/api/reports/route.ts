import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reports = await prisma.report.findMany({
    where: { organizationId: "demo-org" },
    include: { organization: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reports);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orgId = "demo-org";

  // Calculate totals from emission records
  const records = await prisma.emissionRecord.findMany({
    where: { organizationId: orgId, year: body.year },
  });

  const scope1 = records.filter((r) => r.scope === 1).reduce((s, r) => s + r.co2e, 0);
  const scope2 = records.filter((r) => r.scope === 2).reduce((s, r) => s + r.co2e, 0);
  const scope3 = records.filter((r) => r.scope === 3).reduce((s, r) => s + r.co2e, 0);

  const report = await prisma.report.create({
    data: {
      organizationId: orgId,
      name: body.name,
      type: body.type ?? "annual",
      framework: body.framework ?? "GHG_PROTOCOL",
      year: body.year,
      status: "draft",
      totalScope1: +scope1.toFixed(2),
      totalScope2: +scope2.toFixed(2),
      totalScope3: +scope3.toFixed(2),
      totalCo2e: +(scope1 + scope2 + scope3).toFixed(2),
    },
  });

  return NextResponse.json(report, { status: 201 });
}
