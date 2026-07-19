"use client";

import { Settings, Building2, Shield, Bell, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Organization configuration and compliance settings</p>
      </div>

      {/* Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Organization</CardTitle>
          <CardDescription>Company profile and reporting configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Company Name", value: "Acme Manufacturing Corp" },
              { label: "Industry", value: "Manufacturing (NAICS 33)" },
              { label: "Country", value: "United States" },
              { label: "Fiscal Year Start", value: "January 1" },
              { label: "Reporting Year", value: "2024" },
              { label: "Baseline Year", value: "2020" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs font-medium text-gray-500 mb-1 block">{f.label}</label>
                <input defaultValue={f.value} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
          <Button size="sm">Save Organization</Button>
        </CardContent>
      </Card>

      {/* Regulatory Frameworks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="w-4 h-4" /> Active Frameworks</CardTitle>
          <CardDescription>Enable frameworks to track compliance requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { key: "GHG_PROTOCOL", name: "GHG Protocol Corporate Standard", enabled: true, mandatory: false },
              { key: "ISO_14064", name: "ISO 14064-1:2018", enabled: true, mandatory: false },
              { key: "TCFD", name: "TCFD – Task Force on Climate Disclosures", enabled: true, mandatory: false },
              { key: "CSRD", name: "EU CSRD / ESRS E1", enabled: false, mandatory: false },
              { key: "SEC", name: "SEC Climate Disclosure Rules", enabled: false, mandatory: false },
              { key: "CDP", name: "CDP Climate Change", enabled: true, mandatory: false },
            ].map((fw) => (
              <div key={fw.key} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{fw.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{fw.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  {fw.mandatory && <Badge variant="warning">Mandatory</Badge>}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={fw.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Third-Party Verification</CardTitle>
          <CardDescription>Required for ISO 14064, CSRD, and SEC frameworks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Verification Body</label>
              <input defaultValue="Bureau Veritas" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Assurance Level</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                <option>Limited assurance</option>
                <option>Reasonable assurance</option>
              </select>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <p className="font-medium mb-1">ISO 14064-3 Verification Requirements</p>
            <p>Third-party verification under ISO 14064-3 requires a qualified GHG verifier to provide limited or reasonable assurance over your GHG inventory. Evidence must include source data, emission factor documentation, and calculation methodology.</p>
          </div>
          <Button size="sm">Save Verification Settings</Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              "Reporting deadline reminders (30, 14, 7 days)",
              "Verification status changes",
              "Target milestone alerts",
              "Data quality issues detected",
              "New regulatory updates",
            ].map((n) => (
              <label key={n} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-emerald-600" />
                <span className="text-sm text-gray-700">{n}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
