"use client";

import { useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Car, Package, Trash2, BarChart3, Leaf, ChevronRight, ChevronLeft,
  CheckCircle, TrendingDown, Info,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

// ── Emission factors — DEFRA 2024, UK basis ─────────────────────────────────
const EF = {
  electricity:     0.207,   // kgCO₂e / kWh
  gas:             2.04,    // kgCO₂e / m³
  carPetrol:       0.166,   // kgCO₂e / mile
  carDiesel:       0.169,   // kgCO₂e / mile
  carEV:           0.048,   // kgCO₂e / mile (UK grid)
  flightShortKm:   0.255,   // kgCO₂e / km per passenger
  flightLongKm:    0.195,   // kgCO₂e / km per passenger
  publicTransport: 0.045,   // kgCO₂e / km
  food:            2.80,    // kgCO₂e per £100 spend
  goods:           0.90,    // kgCO₂e per £100 spend
  services:        0.35,    // kgCO₂e per £100 spend
  landfill:        0.450,   // kgCO₂e / kg
  recycling:       0.050,   // kgCO₂e / kg
  composting:      0.100,   // kgCO₂e / kg
  incineration:    0.240,   // kgCO₂e / kg
} as const;

const SHORT_FLIGHT_KM  = 1_200;
const LONG_FLIGHT_KM   = 8_000;
const UK_AVG_TCO2E     = 5.5;
const PIE_COLORS       = ["#f59e0b", "#3b82f6", "#8b5cf6", "#10b981"];

// ── Types ────────────────────────────────────────────────────────────────────
interface FormData {
  electricity: number;
  gas: number;
  renewablePercent: number;
  carMilesPetrol: number;
  carMilesDiesel: number;
  carMilesEV: number;
  flightsShort: number;
  flightsLong: number;
  publicTransportKm: number;
  foodSpend: number;
  goodsSpend: number;
  servicesSpend: number;
  landfillKg: number;
  recyclingKg: number;
  compostingKg: number;
  incinerationKg: number;
}

interface EmissionBreakdown {
  energy: number;
  transport: number;
  supplyChain: number;
  waste: number;
  total: number;
}

interface ReductionTip {
  tip: string;
  saving: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// ── Demo defaults ────────────────────────────────────────────────────────────
const DEMO: FormData = {
  electricity: 4_200, gas: 1_200, renewablePercent: 15,
  carMilesPetrol: 8_000, carMilesDiesel: 0, carMilesEV: 0,
  flightsShort: 2, flightsLong: 1, publicTransportKm: 3_000,
  foodSpend: 5_000, goodsSpend: 3_000, servicesSpend: 8_000,
  landfillKg: 200, recyclingKg: 150, compostingKg: 50, incinerationKg: 100,
};

const REDUCTION_TIPS: ReductionTip[] = [
  { tip: "Switch to 100% renewable electricity tariff",       saving: "Up to 1.2 tCO₂e/yr",   difficulty: "Easy" },
  { tip: "Replace petrol car with EV or hybrid",              saving: "Up to 2.4 tCO₂e/yr",   difficulty: "Medium" },
  { tip: "Eliminate one long-haul flight per year",           saving: "1.56 tCO₂e/trip",       difficulty: "Hard" },
  { tip: "Shift to plant-rich diet and reduce food waste",    saving: "0.4–0.8 tCO₂e/yr",     difficulty: "Easy" },
  { tip: "Insulate home + install air-source heat pump",      saving: "1.5–2.0 tCO₂e/yr",     difficulty: "Hard" },
  { tip: "Work from home 3 days per week",                    saving: "0.3–0.6 tCO₂e/yr",     difficulty: "Easy" },
];

const DIFF_COLOR: Record<string, string> = {
  Easy:   "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard:   "bg-rose-100 text-rose-700",
};

// ── Calculation ──────────────────────────────────────────────────────────────
function calcEmissions(d: FormData): EmissionBreakdown {
  const renewable   = 1 - d.renewablePercent / 100;
  const energy      = (d.electricity * EF.electricity * renewable + d.gas * EF.gas) / 1_000;
  const transport   = (
    d.carMilesPetrol * EF.carPetrol +
    d.carMilesDiesel * EF.carDiesel +
    d.carMilesEV * EF.carEV +
    d.flightsShort * SHORT_FLIGHT_KM * EF.flightShortKm +
    d.flightsLong  * LONG_FLIGHT_KM  * EF.flightLongKm  +
    d.publicTransportKm * EF.publicTransport
  ) / 1_000;
  const supplyChain = (
    (d.foodSpend    / 100) * EF.food    +
    (d.goodsSpend   / 100) * EF.goods   +
    (d.servicesSpend / 100) * EF.services
  ) / 1_000;
  const waste       = (
    d.landfillKg    * EF.landfill    +
    d.recyclingKg   * EF.recycling   +
    d.compostingKg  * EF.composting  +
    d.incinerationKg * EF.incineration
  ) / 1_000;
  return { energy, transport, supplyChain, waste, total: energy + transport + supplyChain + waste };
}

// ── Helper: numeric input ────────────────────────────────────────────────────
function NumInput({ label, unit, value, onChange, hint }: {
  label: string; unit: string; value: number;
  onChange: (v: number) => void; hint?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <input
        type="number" min={0} value={value}
        onChange={e => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
      />
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const STEPS = [
  { label: "Energy",        Icon: Zap },
  { label: "Transport",     Icon: Car },
  { label: "Supply Chain",  Icon: Package },
  { label: "Waste",         Icon: Trash2 },
  { label: "Results",       Icon: BarChart3 },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(DEMO);

  const upd = (key: keyof FormData) => (v: number) =>
    setForm(prev => ({ ...prev, [key]: v }));

  const em = calcEmissions(form);

  const pieData = [
    { name: "Energy",       value: +em.energy.toFixed(3),      fill: PIE_COLORS[0] },
    { name: "Transport",    value: +em.transport.toFixed(3),   fill: PIE_COLORS[1] },
    { name: "Supply Chain", value: +em.supplyChain.toFixed(3), fill: PIE_COLORS[2] },
    { name: "Waste",        value: +em.waste.toFixed(3),       fill: PIE_COLORS[3] },
  ];

  const barData = [
    { label: "You",          tCO2e: +em.total.toFixed(2), fill: "#6366f1" },
    { label: "UK Avg",       tCO2e: 5.5,                  fill: "#94a3b8" },
    { label: "EU Avg",       tCO2e: 7.8,                  fill: "#94a3b8" },
    { label: "World Avg",    tCO2e: 4.8,                  fill: "#94a3b8" },
    { label: "1.5°C target", tCO2e: 2.3,                  fill: "#10b981" },
  ];

  const vsUKPct = ((em.total - UK_AVG_TCO2E) / UK_AVG_TCO2E * 100);
  const offsetCost = Math.round(em.total * 12);
  const flightTCO2e = (form.flightsShort * SHORT_FLIGHT_KM * EF.flightShortKm + form.flightsLong * LONG_FLIGHT_KM * EF.flightLongKm) / 1_000;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Carbon Footprint Calculator</h1>
        <p className="text-slate-500 text-sm mt-0.5">Annual tCO₂e across energy, transport, supply chain & waste</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Step {step} / 5 — {STEPS[step - 1].label}</span>
          <span>{Math.round((step - 1) / 4 * 100)}% complete</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-1.5 bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${(step - 1) / 4 * 100}%` }} />
        </div>
        <div className="flex gap-1">
          {STEPS.map(({ label, Icon }, i) => {
            const s = i + 1;
            const active = s === step;
            const done   = s < step;
            return (
              <button key={label} onClick={() => done && setStep(s)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg transition-colors",
                  active ? "bg-emerald-50 text-emerald-700" :
                  done   ? "text-emerald-500 hover:bg-emerald-50 cursor-pointer" :
                           "text-slate-300"
                )}>
                {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                <span className="text-[9px] font-medium hidden sm:block">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Step 1: Energy ───────────────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-amber-500" /> Energy Use
            </CardTitle>
            <CardDescription>Annual household or office energy consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumInput label="Electricity" unit="kWh / year" value={form.electricity}
              onChange={upd("electricity")} hint="UK household avg: 3,100 kWh · office: 30–50 kWh/m²" />
            <NumInput label="Natural Gas" unit="m³ / year" value={form.gas}
              onChange={upd("gas")} hint="UK household avg: 1,200 m³ (heating + hot water)" />
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700">Renewable Energy Share</label>
                <span className="text-sm font-bold text-emerald-600">{form.renewablePercent}%</span>
              </div>
              <input type="range" min={0} max={100} step={5} value={form.renewablePercent}
                onChange={e => upd("renewablePercent")(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 cursor-pointer" />
              <div className="flex justify-between text-xs text-slate-400">
                <span>0% grid only</span><span>100% fully renewable</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-xs font-semibold text-amber-800">Energy footprint estimate</p>
              <p className="text-2xl font-bold text-amber-700 mt-1">
                {em.energy.toFixed(2)} <span className="text-sm font-normal text-amber-600">tCO₂e / year</span>
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Grid: {EF.electricity} kgCO₂e/kWh · Gas: {EF.gas} kgCO₂e/m³ (DEFRA 2024)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Transport ─────────────────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="w-4 h-4 text-blue-500" /> Transport
            </CardTitle>
            <CardDescription>Annual travel by car, air, and public transport</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumInput label="Petrol Car" unit="miles/yr" value={form.carMilesPetrol} onChange={upd("carMilesPetrol")} />
              <NumInput label="Diesel Car" unit="miles/yr" value={form.carMilesDiesel} onChange={upd("carMilesDiesel")} />
              <NumInput label="Electric Car" unit="miles/yr" value={form.carMilesEV}
                onChange={upd("carMilesEV")} hint={`${EF.carEV} kgCO₂e/mi`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Short-haul Flights" unit="trips/yr" value={form.flightsShort}
                onChange={upd("flightsShort")} hint="< 3 hrs · avg 1,200 km" />
              <NumInput label="Long-haul Flights" unit="trips/yr" value={form.flightsLong}
                onChange={upd("flightsLong")} hint="> 6 hrs · avg 8,000 km" />
            </div>
            <NumInput label="Public Transport" unit="km/yr" value={form.publicTransportKm}
              onChange={upd("publicTransportKm")} hint="Bus, metro, commuter rail combined" />
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-semibold text-blue-800">Transport footprint estimate</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {em.transport.toFixed(2)} <span className="text-sm font-normal text-blue-600">tCO₂e / year</span>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Flights: {flightTCO2e.toFixed(2)} tCO₂e · Car: {((form.carMilesPetrol * EF.carPetrol + form.carMilesDiesel * EF.carDiesel) / 1_000).toFixed(2)} tCO₂e
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Supply Chain ──────────────────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4 text-purple-500" /> Supply Chain — Scope 3
            </CardTitle>
            <CardDescription>Embedded carbon in purchases via EEIO spend-based factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NumInput label="Food & Hospitality" unit="£ / year" value={form.foodSpend}
              onChange={upd("foodSpend")} hint={`${EF.food} kgCO₂e per £100 — highest intensity`} />
            <NumInput label="Goods & Products" unit="£ / year" value={form.goodsSpend}
              onChange={upd("goodsSpend")} hint={`${EF.goods} kgCO₂e per £100 (EEIO Tier 1)`} />
            <NumInput label="Services & Software" unit="£ / year" value={form.servicesSpend}
              onChange={upd("servicesSpend")} hint={`${EF.services} kgCO₂e per £100 — lowest intensity`} />
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-xs font-semibold text-purple-800">Supply chain footprint</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {em.supplyChain.toFixed(2)} <span className="text-sm font-normal text-purple-600">tCO₂e / year</span>
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Total spend: £{formatNumber(form.foodSpend + form.goodsSpend + form.servicesSpend, 0)} · GHG Protocol Scope 3 Cat 1 & 2
              </p>
            </div>
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500">EEIO (Environmentally Extended Input–Output) factors attribute upstream emissions based on financial spend. More accurate methods use supplier-specific data.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Waste ─────────────────────────────────────────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trash2 className="w-4 h-4 text-green-600" /> Waste
            </CardTitle>
            <CardDescription>Annual waste generation by disposal stream (kg/yr)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <NumInput label="Landfill" unit="kg/yr" value={form.landfillKg}
                onChange={upd("landfillKg")} hint={`${EF.landfill} kgCO₂e/kg — highest impact`} />
              <NumInput label="Recycling" unit="kg/yr" value={form.recyclingKg}
                onChange={upd("recyclingKg")} hint={`${EF.recycling} kgCO₂e/kg`} />
              <NumInput label="Composting" unit="kg/yr" value={form.compostingKg}
                onChange={upd("compostingKg")} hint={`${EF.composting} kgCO₂e/kg`} />
              <NumInput label="Incineration" unit="kg/yr" value={form.incinerationKg}
                onChange={upd("incinerationKg")} hint={`${EF.incineration} kgCO₂e/kg`} />
            </div>
            <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
              <p className="text-xs font-semibold text-green-800">Waste footprint estimate</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {em.waste.toFixed(3)} <span className="text-sm font-normal text-green-600">tCO₂e / year</span>
              </p>
              <p className="text-xs text-green-600 mt-1">
                Shift 10% from landfill to composting saves {(form.landfillKg * 0.1 * (EF.landfill - EF.composting) / 1_000).toFixed(3)} tCO₂e/yr
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 5: Results ───────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-4">
          <Card className={cn("border-2", vsUKPct <= 0 ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50")}>
            <CardContent className="pt-5 pb-5 text-center">
              <p className="text-sm font-medium text-slate-600">Your Annual Carbon Footprint</p>
              <p className="text-5xl font-bold text-slate-900 mt-2 tabular-nums">{em.total.toFixed(2)}</p>
              <p className="text-slate-500 mt-1 text-sm">tCO₂e / year</p>
              <div className="mt-3">
                <Badge className={cn("text-xs", vsUKPct <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {Math.abs(vsUKPct).toFixed(1)}% {vsUKPct <= 0 ? "below" : "above"} UK average
                </Badge>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { l: "Energy",       v: em.energy,       c: PIE_COLORS[0] },
                  { l: "Transport",    v: em.transport,    c: PIE_COLORS[1] },
                  { l: "Supply Chain", v: em.supplyChain,  c: PIE_COLORS[2] },
                  { l: "Waste",        v: em.waste,        c: PIE_COLORS[3] },
                ].map(({ l, v, c }) => (
                  <div key={l} className="text-center">
                    <p className="text-lg font-bold" style={{ color: c }}>{v.toFixed(1)}</p>
                    <p className="text-[10px] text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Donut breakdown */}
          <Card>
            <CardHeader><CardTitle className="text-base">Emissions Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius="50%" outerRadius="72%"
                      paddingAngle={3} dataKey="value">
                      {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Pie>
                    <Tooltip formatter={(v: unknown) => [`${Number(v).toFixed(3)} tCO₂e`]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Global benchmark bar chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Global Benchmark</CardTitle>
              <CardDescription>tCO₂e per person per year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: unknown) => [`${formatNumber(Number(v), 1)} tCO₂e`]} />
                    <Bar dataKey="tCO2e" radius={[5, 5, 0, 0]}>
                      {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Offset recommendation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-500" /> Carbon Offset Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div>
                  <p className="text-sm font-semibold text-slate-800">To offset {em.total.toFixed(2)} tCO₂e/yr</p>
                  <p className="text-xs text-slate-500 mt-0.5">Gold Standard verified credits · £12/tCO₂e</p>
                </div>
                <p className="text-xl font-bold text-emerald-700">£{offsetCost}<span className="text-sm font-normal">/yr</span></p>
              </div>
              <p className="text-xs text-slate-500 italic">Offsetting is a last resort — prioritise direct reductions first.</p>
            </CardContent>
          </Card>

          {/* Reduction tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-blue-500" /> Top Reduction Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {REDUCTION_TIPS.map((t, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <span className="text-xs font-bold text-slate-300 w-4 shrink-0 mt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700">{t.tip}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">{t.saving}</p>
                  </div>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0", DIFF_COLOR[t.difficulty])}>
                    {t.difficulty}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-2 pb-2">
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 5 ? (
          <button onClick={() => setStep(s => s + 1)}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors">
            Next — {STEPS[step].label} <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => { setStep(1); setForm(DEMO); }}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-700 text-white text-sm font-medium hover:bg-slate-800 transition-colors">
            Reset Calculator
          </button>
        )}
      </div>
    </div>
  );
}
