"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot, Send, User, CheckCircle, AlertCircle, Leaf, FileText, Globe, Zap,
  ChevronRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type CardType = "scope3" | "csrd" | "offsets" | "sbti" | "cbam" | null;

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
  cardType?: CardType;
  chips?: string[];
}

interface ScriptedResponse {
  text: string;
  cardType?: CardType;
  chips: string[];
}

// ── Pre-scripted AI responses ─────────────────────────────────────────────────
const RESPONSES: Record<string, ScriptedResponse> = {
  scope3: {
    text: "Scope 3 covers all indirect emissions across your value chain — typically 70–90% of a company's total footprint. It includes 15 categories defined by the GHG Protocol, from purchased goods (Cat 1) to use of sold products (Cat 11) and investments (Cat 15). The biggest challenge is data quality: most companies rely on spend-based EEIO factors for early estimates, then shift to supplier-specific data as engagement matures.",
    cardType: "scope3",
    chips: ["How do I collect supplier data?", "Which Scope 3 categories matter most?", "Explain Category 15 investments"],
  },
  csrd: {
    text: "The CSRD (Corporate Sustainability Reporting Directive) applies to ~50,000 EU companies from 2025–2028. It requires reporting under ESRS E1 (Climate) covering GHG inventory, transition plan, climate risk, and financial materiality. Key difference from TCFD: CSRD mandates double materiality — both impact and financial perspectives. Third-party limited assurance is required from the first reporting year.",
    cardType: "csrd",
    chips: ["What is double materiality?", "When does CSRD apply to me?", "Explain ESRS E1-6 metrics"],
  },
  offsets: {
    text: "Not all carbon offsets are equal. Quality criteria to assess include: additionality (would emissions have reduced anyway?), permanence (is the sequestration durable?), leakage (are emissions displaced?), verification (Gold Standard, VCS/Verra), and vintage (how recently was it generated?). Nature-based solutions like REDD+ carry higher permanence risk than engineered CDR. The Oxford Principles recommend transitioning to durable CDR over time.",
    cardType: "offsets",
    chips: ["What's the difference between avoidance and removal?", "Recommend offset registries", "Explain Article 6 Paris offsets"],
  },
  sbti: {
    text: "Setting an SBTi target requires submitting a commitment letter, then within 24 months providing targets aligned to 1.5°C warming scenarios. Near-term targets (5–10 years) require 4.2% Scope 1+2 reduction per year. Long-term net-zero targets must cover Scope 1, 2 & 3 and reach 90%+ reduction by 2050 at the latest. Residual emissions must be neutralised with CDR, not offsets.",
    cardType: null,
    chips: ["How do I set a Scope 3 SBTi target?", "What counts as residual emissions?", "Show me the FLAG target methodology"],
  },
  cbam: {
    text: "The Carbon Border Adjustment Mechanism (CBAM) entered its transitional phase in October 2023, requiring EU importers to report embedded carbon in steel, cement, aluminium, fertilisers, electricity, hydrogen, and certain downstream products. From 2026, importers must purchase CBAM certificates. The price tracks the EU ETS carbon price (~€60–80/tCO₂e). UK CBAM is expected in 2027.",
    cardType: "cbam",
    chips: ["Which products are in scope for CBAM?", "How do I calculate embedded carbon?", "When does CBAM financial obligation start?"],
  },
  biggestSource: {
    text: "Based on your inventory data, Scope 3 Value Chain is your largest emission source at 58.6% of total — primarily purchased goods (Cat 1) and use of sold products (Cat 11). This is typical for manufacturing companies. Your Scope 1 direct emissions are 26.1%, dominated by process heat and fleet. I'd recommend prioritising supply chain engagement for maximum abatement potential.",
    cardType: null,
    chips: ["How do I reduce Scope 3 Cat 1?", "Show my emissions breakdown", "Set a supply chain target"],
  },
  ghgProtocol: {
    text: "The GHG Protocol is the most widely used carbon accounting standard, developed by WRI and WBCSD. It defines three scopes of emissions, the operational boundary (equity share, financial control, or operational control), and base year recalculation policies. The Corporate Standard (2004) covers Scopes 1 & 2; the Scope 3 Standard (2011) covers value chain emissions. It underpins SBTi, CDP, CSRD, and most regulatory frameworks.",
    cardType: null,
    chips: ["What's the difference between Scope 1 and 2?", "Explain consolidation approaches", "How do I set a base year?"],
  },
  reduction: {
    text: "A credible decarbonisation strategy should follow the mitigation hierarchy: (1) Avoid — design out emissions at source. (2) Reduce — improve efficiency, switch fuels, renewable energy. (3) Substitute — electrification, green hydrogen, bioenergy. (4) Remove — nature-based solutions and engineered CDR. (5) Offset — as a last resort for unavoidable residuals. Short-term wins: renewable electricity procurement (PPAs or REGOs), fleet electrification, and supplier engagement programmes.",
    cardType: null,
    chips: ["Prioritise my abatement options", "Explain PPAs vs REGOs", "What is a credible net-zero plan?"],
  },
  tcfd: {
    text: "TCFD (Task Force on Climate-related Financial Disclosures) requires disclosure across four pillars: Governance, Strategy, Risk Management, and Metrics & Targets. The Strategy pillar requires scenario analysis using at least 1.5°C and 3–4°C pathways to identify physical and transition risks. Physical risks (floods, heat stress, water scarcity) and transition risks (carbon pricing, regulatory change, stranded assets) must be quantified where material.",
    cardType: null,
    chips: ["What climate scenarios should I use?", "Quantify my physical climate risks", "TCFD vs CSRD: what's different?"],
  },
  default: {
    text: "I can help you with GHG accounting, regulatory compliance, decarbonisation strategy, and carbon market topics. I'm trained on GHG Protocol, CSRD/ESRS, SBTi, TCFD, CDP, EU ETS, CBAM, and ISO 14064 frameworks. Try asking about your biggest emission sources, how to set science-based targets, or what the CSRD requires.",
    cardType: null,
    chips: ["What's my biggest emission source?", "How do I set an SBTi target?", "Explain CSRD to me"],
  },
};

function matchResponse(input: string): ScriptedResponse {
  const q = input.toLowerCase();
  if (q.includes("scope 3") || q.includes("scope3") || q.includes("value chain") || q.includes("category")) return RESPONSES.scope3;
  if (q.includes("csrd") || q.includes("esrs") || q.includes("european sustainability")) return RESPONSES.csrd;
  if (q.includes("offset") || q.includes("credits") || q.includes("sequestration") || q.includes("removal")) return RESPONSES.offsets;
  if (q.includes("sbti") || q.includes("science based") || q.includes("1.5") || q.includes("net zero target")) return RESPONSES.sbti;
  if (q.includes("cbam") || q.includes("carbon border") || q.includes("border adjustment")) return RESPONSES.cbam;
  if (q.includes("biggest") || q.includes("main source") || q.includes("largest") || q.includes("most")) return RESPONSES.biggestSource;
  if (q.includes("ghg protocol") || q.includes("protocol") || q.includes("scope 1") || q.includes("scope 2")) return RESPONSES.ghgProtocol;
  if (q.includes("reduce") || q.includes("reduction") || q.includes("abatement") || q.includes("cut")) return RESPONSES.reduction;
  if (q.includes("tcfd") || q.includes("climate risk") || q.includes("scenario") || q.includes("physical risk")) return RESPONSES.tcfd;
  return RESPONSES.default;
}

// ── Rich response cards ───────────────────────────────────────────────────────
function Scope3Card() {
  const cats = [
    { n: "Cat 1",  label: "Purchased goods & services",  pct: 42 },
    { n: "Cat 11", label: "Use of sold products",         pct: 28 },
    { n: "Cat 4",  label: "Upstream transport",           pct: 12 },
    { n: "Cat 6",  label: "Business travel",              pct: 8  },
    { n: "Other",  label: "12 remaining categories",      pct: 10 },
  ];
  return (
    <div className="mt-2 p-3 bg-slate-800 rounded-xl space-y-2">
      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Scope 3 Categories — typical manufacturing split</p>
      {cats.map(c => (
        <div key={c.n} className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400 w-10 shrink-0">{c.n}</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${c.pct}%` }} />
          </div>
          <span className="text-[10px] text-slate-400 w-8 text-right">{c.pct}%</span>
          <span className="text-[10px] text-slate-300 hidden sm:block">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

function CSRDCard() {
  const items = [
    { done: true,  text: "GHG inventory (E1-6) — Scope 1, 2 & 3" },
    { done: true,  text: "Double materiality assessment" },
    { done: false, text: "Climate transition plan with milestones" },
    { done: false, text: "Physical risk scenario analysis (1.5°C & 3°C)" },
    { done: false, text: "Financial effects quantification" },
    { done: true,  text: "Governance — board climate oversight" },
  ];
  return (
    <div className="mt-2 p-3 bg-slate-800 rounded-xl space-y-1.5">
      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">ESRS E1 Checklist — Climate</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          {item.done
            ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            : <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />}
          <span className="text-xs text-slate-300">{item.text}</span>
        </div>
      ))}
    </div>
  );
}

function OffsetsCard() {
  const criteria = [
    { icon: "✓", label: "Additionality",  desc: "Wouldn't happen anyway", color: "text-emerald-400" },
    { icon: "✓", label: "Permanence",     desc: "Durable ≥ 100 years",    color: "text-emerald-400" },
    { icon: "✓", label: "Verification",   desc: "Gold Standard or VCS",   color: "text-emerald-400" },
    { icon: "✗", label: "REDD+",          desc: "High leakage risk",       color: "text-rose-400"    },
    { icon: "✗", label: "Old vintages",   desc: "Avoid pre-2020",          color: "text-rose-400"    },
  ];
  return (
    <div className="mt-2 p-3 bg-slate-800 rounded-xl">
      <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">Offset Quality Criteria</p>
      <div className="grid grid-cols-1 gap-1.5">
        {criteria.map(c => (
          <div key={c.label} className="flex items-center gap-2">
            <span className={cn("text-xs font-bold w-4 shrink-0", c.color)}>{c.icon}</span>
            <span className="text-xs font-medium text-slate-200 w-24 shrink-0">{c.label}</span>
            <span className="text-xs text-slate-400">{c.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CBAMCard() {
  const sectors = ["Steel", "Cement", "Aluminium", "Fertilisers", "Electricity", "Hydrogen"];
  return (
    <div className="mt-2 p-3 bg-slate-800 rounded-xl">
      <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">CBAM In-Scope Sectors (Phase 1)</p>
      <div className="flex flex-wrap gap-1.5">
        {sectors.map(s => (
          <span key={s} className="text-xs bg-orange-950/60 text-orange-300 border border-orange-800/40 px-2 py-0.5 rounded-lg">{s}</span>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-2">Financial obligation begins Jan 2026 · EU ETS price tracking</p>
    </div>
  );
}

// ── Starter prompts ───────────────────────────────────────────────────────────
const STARTERS = [
  "What's my biggest emission source?",
  "How do I set an SBTi target?",
  "Explain CBAM to me",
  "What offsets should I buy?",
];

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "ai",
  text: "Hello! I'm your AI Decarbonisation Advisor, trained on GHG Protocol, CSRD/ESRS, SBTi, TCFD, CDP, EU ETS, and CBAM. Ask me anything about carbon accounting, regulatory compliance, or net-zero strategy.",
  time: "09:00",
  chips: STARTERS,
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const send = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim(), time: formatTime(new Date()) };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const resp = matchResponse(text);
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: resp.text,
        time: formatTime(new Date()),
        cardType: resp.cardType,
        chips: resp.chips,
      };
      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              AI Decarbonisation Advisor
              <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                <Sparkles className="w-2.5 h-2.5 mr-1" /> Live
              </Badge>
            </h1>
            <p className="text-xs text-slate-500">GHG Protocol · CSRD · SBTi · TCFD · CDP · CBAM</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex gap-2.5", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            {/* Avatar */}
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
              msg.role === "ai" ? "bg-slate-800" : "bg-emerald-500"
            )}>
              {msg.role === "ai"
                ? <Bot className="w-3.5 h-3.5 text-emerald-400" />
                : <User className="w-3.5 h-3.5 text-white" />}
            </div>

            {/* Bubble + meta */}
            <div className={cn("flex flex-col gap-1 max-w-[82%]", msg.role === "user" ? "items-end" : "items-start")}>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.role === "ai"
                  ? "bg-slate-100 text-slate-800 rounded-tl-sm"
                  : "bg-emerald-500 text-white rounded-tr-sm"
              )}>
                {msg.text}
                {msg.cardType === "scope3"  && <Scope3Card />}
                {msg.cardType === "csrd"    && <CSRDCard />}
                {msg.cardType === "offsets" && <OffsetsCard />}
                {msg.cardType === "cbam"    && <CBAMCard />}
              </div>
              <span className="text-[10px] text-slate-400 px-1">{msg.time}</span>

              {/* Quick reply chips */}
              {msg.chips && msg.chips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {msg.chips.map((chip) => (
                    <button key={chip} onClick={() => send(chip)}
                      className="flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors">
                      {chip} <ChevronRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 px-4 py-3 border-t border-slate-100 bg-white">
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder="Ask about GHG accounting, CSRD, SBTi, CBAM…"
            rows={1}
            className="flex-1 resize-none border border-slate-200 rounded-2xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-slate-50 placeholder:text-slate-400"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {STARTERS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
