import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orgId = "demo-org";

    const [records, targets, reports] = await Promise.all([
      prisma.emissionRecord.findMany({
        where: { organizationId: orgId, year: 2024 },
        include: { facility: true },
      }),
      prisma.emissionTarget.findMany({ where: { organizationId: orgId } }),
      prisma.report.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: "desc" } }),
    ]);

    const scope1 = records.filter((r) => r.scope === 1).reduce((s, r) => s + r.co2e, 0);
    const scope2 = records.filter((r) => r.scope === 2).reduce((s, r) => s + r.co2e, 0);
    const scope3 = records.filter((r) => r.scope === 3).reduce((s, r) => s + r.co2e, 0);
    const total = scope1 + scope2 + scope3;

    // Monthly breakdown (simulated for demo)
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2024, i).toLocaleString("default", { month: "short" }),
      scope1: +(scope1 / 12 * (0.85 + Math.sin(i * 0.5) * 0.15)).toFixed(2),
      scope2: +(scope2 / 12 * (0.9 + Math.cos(i * 0.4) * 0.1)).toFixed(2),
      scope3: +(scope3 / 12 * (0.88 + Math.sin(i * 0.6) * 0.12)).toFixed(2),
    }));

    // Category breakdown
    const byCategory = records.reduce((acc, r) => {
      const key = `${r.category}`;
      acc[key] = (acc[key] ?? 0) + r.co2e;
      return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(byCategory).map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: +value.toFixed(2),
    }));

    // Intensity (tonnes per million USD revenue - example)
    const revenueM = 150; // $150M
    const intensity = +(total / revenueM).toFixed(2);

    return NextResponse.json({
      summary: { scope1: +scope1.toFixed(2), scope2: +scope2.toFixed(2), scope3: +scope3.toFixed(2), total: +total.toFixed(2), intensity },
      monthly,
      categoryData,
      targets,
      reports: reports.slice(0, 5),
      verificationRate: +((records.filter((r) => r.verified).length / records.length) * 100).toFixed(1),
      recordCount: records.length,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
