"use client";

import { Building2, MapPin, Factory, Briefcase, Server } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

const FACILITIES = [
  {
    id: "facility-1",
    name: "Main Manufacturing Plant",
    type: "manufacturing",
    address: "123 Industrial Blvd, Detroit, MI",
    country: "US",
    scope1: 151.95,
    scope2: 967.5,
    scope3: 21.0,
    records: 5,
  },
  {
    id: "facility-2",
    name: "Corporate Headquarters",
    type: "office",
    address: "456 Business Ave, New York, NY",
    country: "US",
    scope1: 16.19,
    scope2: 309.6,
    scope3: 0,
    records: 3,
  },
];

const TYPE_ICONS = {
  manufacturing: Factory,
  office: Briefcase,
  data_center: Server,
  warehouse: Building2,
};

export default function FacilitiesPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Facilities</h1>
        <p className="text-gray-500 text-sm mt-1">Organizational boundary – operational control approach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FACILITIES.map((f) => {
          const Icon = TYPE_ICONS[f.type as keyof typeof TYPE_ICONS] ?? Building2;
          const total = f.scope1 + f.scope2 + f.scope3;
          return (
            <Card key={f.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-800">{f.name}</p>
                      <Badge variant="secondary">{f.type}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      {f.address} · {f.country}
                    </div>
                    <div className="grid grid-cols-4 gap-2 mt-4 text-center">
                      <div className="bg-red-50 rounded-lg p-2">
                        <p className="text-[10px] text-red-400">Scope 1</p>
                        <p className="text-sm font-bold text-red-600">{formatNumber(f.scope1)}t</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-2">
                        <p className="text-[10px] text-orange-400">Scope 2</p>
                        <p className="text-sm font-bold text-orange-600">{formatNumber(f.scope2)}t</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-2">
                        <p className="text-[10px] text-yellow-500">Scope 3</p>
                        <p className="text-sm font-bold text-yellow-600">{formatNumber(f.scope3)}t</p>
                      </div>
                      <div className="bg-emerald-50 rounded-lg p-2">
                        <p className="text-[10px] text-emerald-400">Total</p>
                        <p className="text-sm font-bold text-emerald-600">{formatNumber(total)}t</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{f.records} emission records</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Organizational Boundary Methods (GHG Protocol)</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <p className="font-medium text-gray-700 mb-1">Operational Control</p>
              <p>Account for 100% of emissions from operations over which the company has operational control. Used in this inventory.</p>
            </div>
            <div>
              <p className="font-medium text-gray-700 mb-1">Equity Share</p>
              <p>Account for emissions based on the company's share of equity in the operation. Used for joint ventures and subsidiaries.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
