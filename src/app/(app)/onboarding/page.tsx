"use client";
import { useState } from "react";
import { ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react";

const STEPS = [
  { id: "company", title: "Company Setup", subtitle: "Tell us about your organisation" },
  { id: "scope", title: "Select Scopes", subtitle: "Choose which emissions you track" },
  { id: "frameworks", title: "Frameworks", subtitle: "Which standards do you report under?" },
  { id: "team", title: "Invite Team", subtitle: "Add colleagues to collaborate" },
  { id: "targets", title: "Set Targets", subtitle: "Define your reduction ambition" },
  { id: "complete", title: "You're ready!", subtitle: "cCarbon is configured for Acme Corp" },
];

const FRAMEWORKS = ["GHG Protocol", "CSRD / ESRS", "CDP", "TCFD", "SBTi", "ISO 14064", "SFDR", "SEC Climate Rule"];
const INDUSTRIES = ["Manufacturing", "Technology", "Financial Services", "Retail", "Energy", "Transport & Logistics", "Food & Beverage", "Real Estate", "Healthcare", "Professional Services"];
const COUNTRIES = ["United Kingdom", "Germany", "France", "United States", "Netherlands", "Ireland", "Sweden", "Australia", "Canada", "Singapore"];

type DataState = {
  companyName: string;
  industry: string;
  country: string;
  employees: string;
  scopes: string[];
  frameworks: string[];
  targetYear: string;
  targetReduction: string;
  emails: string[];
};

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<DataState>({
    companyName: "Acme Corp",
    industry: "",
    country: "",
    employees: "",
    scopes: [],
    frameworks: [],
    targetYear: "2030",
    targetReduction: "50",
    emails: [""],
  });

  const progress = (step / (STEPS.length - 1)) * 100;
  const current = STEPS[step];

  function toggleItem(key: "scopes" | "frameworks", val: string) {
    setData(prev => ({
      ...prev,
      [key]: prev[key].includes(val) ? prev[key].filter(v => v !== val) : [...prev[key], val],
    }));
  }

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-700">
        <div className="h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        {step > 0 && step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-1 text-[15px] text-[#007AFF] font-medium">
            <ChevronLeft className="w-5 h-5" /> Back
          </button>
        ) : <div />}
        <span className="text-[13px] text-slate-400 font-medium">{step + 1} of {STEPS.length}</span>
        {step < STEPS.length - 2 && (
          <button onClick={() => setStep(s => s + 1)} className="text-[15px] text-slate-400 font-medium">Skip</button>
        )}
        {step >= STEPS.length - 2 && <div />}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-4 pb-8 space-y-6 overflow-y-auto">
        {step < STEPS.length - 1 && (
          <div>
            <h1 className="text-[28px] font-bold text-slate-900 dark:text-white tracking-tight">{current.title}</h1>
            <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-1">{current.subtitle}</p>
          </div>
        )}

        {/* Step 0: Company */}
        {step === 0 && (
          <div className="space-y-3">
            {(["companyName", "employees"] as const).map((key) => {
              const meta = { companyName: { label: "Company Name", placeholder: "Acme Corp" }, employees: { label: "Employees", placeholder: "e.g. 500–1000" } }[key];
              return (
                <div key={key}>
                  <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide px-1">{meta.label}</label>
                  <input
                    value={data[key]}
                    onChange={e => setData(p => ({ ...p, [key]: e.target.value }))}
                    placeholder={meta.placeholder}
                    className="w-full mt-1.5 px-4 py-3 bg-white dark:bg-[#3a3a3c] rounded-2xl text-[16px] text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              );
            })}
            <div>
              <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide px-1">Industry</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {INDUSTRIES.map(ind => (
                  <button key={ind} onClick={() => setData(p => ({ ...p, industry: ind }))}
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${data.industry === ind ? "bg-emerald-500 text-white" : "bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"}`}>
                    {ind}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide px-1">Country / HQ</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {COUNTRIES.map(c => (
                  <button key={c} onClick={() => setData(p => ({ ...p, country: c }))}
                    className={`px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${data.country === c ? "bg-emerald-500 text-white" : "bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Scopes */}
        {step === 1 && (
          <div className="space-y-3">
            {[
              { scope: "Scope 1", label: "Direct emissions", desc: "Owned vehicles, on-site combustion, industrial processes", color: "bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/40" },
              { scope: "Scope 2", label: "Purchased energy", desc: "Electricity, heat, steam, and cooling from the grid", color: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/40" },
              { scope: "Scope 3", label: "Value chain", desc: "Business travel, supply chain, product use & disposal", color: "bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800/40" },
            ].map(s => {
              const active = data.scopes.includes(s.scope);
              return (
                <button key={s.scope} onClick={() => toggleItem("scopes", s.scope)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${active ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : s.color}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${active ? "border-emerald-500 bg-emerald-500" : "border-slate-300 dark:border-slate-600"}`}>
                      {active && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-slate-900 dark:text-white">{s.scope}: {s.label}</p>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Frameworks */}
        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {FRAMEWORKS.map(f => {
              const active = data.frameworks.includes(f);
              return (
                <button key={f} onClick={() => toggleItem("frameworks", f)}
                  className={`px-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all ${active ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"}`}>
                  {f}
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: Team invite */}
        {step === 3 && (
          <div className="space-y-3">
            {data.emails.map((email, i) => (
              <input key={i} value={email}
                onChange={e => setData(p => { const emails = [...p.emails]; emails[i] = e.target.value; return { ...p, emails }; })}
                placeholder="colleague@company.com" type="email"
                className="w-full px-4 py-3 bg-white dark:bg-[#3a3a3c] rounded-2xl text-[16px] text-slate-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.08)] outline-none focus:ring-2 focus:ring-emerald-500" />
            ))}
            <button onClick={() => setData(p => ({ ...p, emails: [...p.emails, ""] }))}
              className="w-full py-3 bg-white dark:bg-[#2c2c2e] rounded-2xl text-[15px] font-semibold text-emerald-600 border border-dashed border-emerald-200 dark:border-emerald-800">
              + Add another
            </button>
          </div>
        )}

        {/* Step 4: Targets */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide px-1">Target Year</label>
              <div className="flex gap-2 mt-2">
                {["2030", "2035", "2040", "2050"].map(y => (
                  <button key={y} onClick={() => setData(p => ({ ...p, targetYear: y }))}
                    className={`flex-1 py-3 rounded-xl text-[15px] font-bold transition-all ${data.targetYear === y ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-[#2c2c2e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"}`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[13px] font-semibold text-slate-500 uppercase tracking-wide px-1">
                Reduction Target — {data.targetReduction}%
              </label>
              <input type="range" min="10" max="100" step="5" value={data.targetReduction}
                onChange={e => setData(p => ({ ...p, targetReduction: e.target.value }))}
                className="w-full mt-3 accent-emerald-500" />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-slate-400">10%</span>
                <span className="text-[11px] text-slate-400">Net Zero (100%)</span>
              </div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/40">
              <p className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">SBTi Alignment</p>
              <p className="text-[12px] text-emerald-600 dark:text-emerald-400 mt-1">
                A {data.targetReduction}% reduction by {data.targetYear} is{" "}
                {parseInt(data.targetReduction) >= 42 ? "✅ aligned with a 1.5°C pathway" : "⚠️ below the 1.5°C threshold of 42% by 2030"}
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <div className="flex flex-col items-center justify-center pt-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-slate-900 dark:text-white">You're all set!</h1>
              <p className="text-[16px] text-slate-500 dark:text-slate-400 mt-2">cCarbon is ready for {data.companyName || "your company"}</p>
            </div>
            <div className="w-full bg-white dark:bg-[#2c2c2e] rounded-2xl divide-y divide-slate-100 dark:divide-white/8 shadow-[0_1px_3px_rgba(0,0,0,0.08)] text-left">
              {[
                { label: "Company", value: data.companyName },
                { label: "Scopes", value: data.scopes.join(", ") || "None selected" },
                { label: "Frameworks", value: data.frameworks.length ? `${data.frameworks.length} selected` : "None" },
                { label: "Target", value: `${data.targetReduction}% reduction by ${data.targetYear}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3">
                  <span className="text-[14px] text-slate-500 dark:text-slate-400">{row.label}</span>
                  <span className="text-[14px] font-semibold text-slate-800 dark:text-white">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-2">
        <button
          onClick={() => step < STEPS.length - 1 ? setStep(s => s + 1) : null}
          className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[17px] font-bold shadow-lg active:scale-[0.98] transition-transform"
        >
          {step === STEPS.length - 2 ? "Finish Setup" : step === STEPS.length - 1 ? "Go to Dashboard →" : "Continue"}
          {step < STEPS.length - 1 && <ChevronRight className="inline w-5 h-5 ml-1" />}
        </button>
      </div>
    </div>
  );
}
