import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? "2024");
  const scope = searchParams.get("scope");
  const orgId = "demo-org";

  const where = {
    organizationId: orgId,
    year,
    ...(scope ? { scope: parseInt(scope) } : {}),
  };

  const records = await prisma.emissionRecord.findMany({
    where,
    include: { facility: true, emissionFactor: true },
    orderBy: [{ scope: "asc" }, { category: "asc" }],
  });

  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orgId = "demo-org";

  const record = await prisma.emissionRecord.create({
    data: {
      organizationId: orgId,
      year: body.year,
      month: body.month ?? null,
      scope: body.scope,
      category: body.category,
      subcategory: body.subcategory ?? null,
      activityType: body.activityType,
      quantity: parseFloat(body.quantity),
      unit: body.unit,
      co2e: parseFloat(body.co2e),
      co2: body.co2 ? parseFloat(body.co2) : null,
      facilityId: body.facilityId ?? null,
      emissionFactorId: body.emissionFactorId ?? null,
      dataSource: body.dataSource ?? null,
      notes: body.notes ?? null,
      verified: false,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
