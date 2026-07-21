"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ChevronRight, Bell, Moon, Globe2, Shield, Download, Users, CreditCard, HelpCircle, LogOut, Mail, Smartphone, Key, Building2, Leaf } from "lucide-react";

function SettingToggle({ label, icon: Icon, iconColor, value, onChange, description }: {
  label: string; icon: any; iconColor: string; value: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] text-slate-800 font-medium">{label}</p>
        {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button onClick={() => onChange(!value)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${value ? "bg-emerald-500" : "bg-slate-200"}`}>
        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function SettingLink({ label, icon: Icon, iconColor, value, onClick }: {
  label: string; icon: any; iconColor: string; value?: string; onClick?: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-4 py-3.5 w-full text-left active:bg-slate-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <p className="text-[15px] text-slate-800 font-medium flex-1">{label}</p>
      {value && <span className="text-[14px] text-slate-400 mr-1">{value}</span>}
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-semibold text-slate-400 uppercase tracking-widest px-1 mb-1.5">{title}</p>
      <Card className="overflow-hidden divide-y divide-slate-100/80">{children}</Card>
    </div>
  );
}

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [twoFA, setTwoFA] = useState(false);

  return (
    <div className="p-4 space-y-5 pb-24 md:pb-6">
      <PageHeader title="Settings" />

      {/* Profile card */}
      <Card className="p-4 flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold shrink-0">A</div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-slate-900">Alex Admin</p>
          <p className="text-[13px] text-slate-500">admin@acme.com</p>
          <p className="text-[12px] text-emerald-600 font-medium mt-0.5">Professional Plan · 14 days left</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300" />
      </Card>

      <Section title="Organisation">
        <SettingLink label="Company Profile" icon={Building2} iconColor="bg-slate-500" value="Acme Corp" />
        <SettingLink label="Team Members" icon={Users} iconColor="bg-sky-500" value="5 members" />
        <SettingLink label="Billing & Plans" icon={CreditCard} iconColor="bg-violet-500" value="Professional" />
        <SettingLink label="Reporting Framework" icon={Leaf} iconColor="bg-emerald-500" value="CSRD, CDP" />
      </Section>

      <Section title="Notifications">
        <SettingToggle label="Push Notifications" icon={Bell} iconColor="bg-rose-500" value={notifications} onChange={setNotifications} description="Deadlines, emissions alerts" />
        <SettingToggle label="Email Alerts" icon={Mail} iconColor="bg-amber-500" value={emailAlerts} onChange={setEmailAlerts} description="Weekly summaries, reports" />
        <SettingLink label="Notification Schedule" icon={Bell} iconColor="bg-orange-500" value="Business hours" />
      </Section>

      <Section title="Appearance">
        <SettingToggle label="Dark Mode" icon={Moon} iconColor="bg-indigo-500" value={darkMode} onChange={setDarkMode} description="Follows system setting" />
        <SettingLink label="Language" icon={Globe2} iconColor="bg-teal-500" value="English (UK)" />
        <SettingLink label="Units" icon={Globe2} iconColor="bg-cyan-500" value="Metric / tCO₂e" />
      </Section>

      <Section title="Security">
        <SettingToggle label="Biometric Login" icon={Smartphone} iconColor="bg-emerald-600" value={biometric} onChange={setBiometric} description="Face ID / Touch ID" />
        <SettingToggle label="Two-Factor Auth" icon={Shield} iconColor="bg-rose-600" value={twoFA} onChange={setTwoFA} />
        <SettingLink label="Change Password" icon={Key} iconColor="bg-slate-600" />
        <SettingLink label="Privacy Policy" icon={Shield} iconColor="bg-slate-400" />
      </Section>

      <Section title="Data">
        <SettingToggle label="Auto-Sync" icon={Download} iconColor="bg-blue-500" value={autoSync} onChange={setAutoSync} description="Background data refresh" />
        <SettingLink label="Export All Data" icon={Download} iconColor="bg-green-600" value="CSV / PDF" />
        <SettingLink label="Data Retention" icon={Shield} iconColor="bg-slate-500" value="7 years" />
      </Section>

      <Section title="Support">
        <SettingLink label="Help Centre" icon={HelpCircle} iconColor="bg-sky-500" />
        <SettingLink label="Contact Support" icon={Mail} iconColor="bg-violet-500" />
        <SettingLink label="What's New" icon={Leaf} iconColor="bg-emerald-500" value="v3.2" />
      </Section>

      <Card className="overflow-hidden">
        <button className="flex items-center gap-3 px-4 py-4 w-full text-left active:bg-rose-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
            <LogOut className="w-4 h-4 text-white" />
          </div>
          <p className="text-[15px] text-rose-600 font-semibold">Sign Out</p>
        </button>
      </Card>

      <p className="text-center text-[11px] text-slate-300 pb-2">cCarbon v3.2.0 · © 2025 cCarbon Ltd</p>
    </div>
  );
}
