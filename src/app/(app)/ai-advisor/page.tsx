"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Send, Sparkles, ThumbsUp, ThumbsDown, Copy } from "lucide-react";

const SUGGESTED_PROMPTS = [
  "What's my biggest emissions reduction opportunity?",
  "How do I set a Science-Based Target?",
  "Compare my Scope 2 to industry benchmarks",
  "Generate a board-level sustainability summary",
  "What CSRD disclosures do I need this year?",
  "Explain my carbon budget runway",
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const DEMO_CONVERSATION: Message[] = [
  {
    role: "assistant",
    content: "Hello! I'm your AI Carbon Advisor, trained on GHG Protocol, CSRD, SBTi, and your company's emissions data. I can help you identify reduction opportunities, prepare disclosures, and model decarbonisation scenarios.\n\nWhat would you like to explore today?",
    timestamp: "09:41",
  },
  {
    role: "user",
    content: "What's my biggest emissions reduction opportunity right now?",
    timestamp: "09:42",
  },
  {
    role: "assistant",
    content: "Based on your emissions data, here are your top 3 reduction opportunities ranked by impact:\n\n**1. Switch to renewable electricity (Scope 2)**\nPotential reduction: **2,847 tCO₂e/year** (22% of total)\nDifficulty: Low · Payback: 2.1 years\nAction: Sign a PPA or purchase RECs for your Manchester and Dublin sites.\n\n**2. Fleet electrification (Scope 1)**\nPotential reduction: **1,920 tCO₂e/year** (15% of total)\nDifficulty: Medium · Payback: 3.8 years\nAction: 12 diesel vans → EV by Q3 2025. OZEV grant covers 35% of cost.\n\n**3. Supplier engagement — top 5 (Scope 3)**\nPotential reduction: **3,100 tCO₂e/year** (24% of total)\nDifficulty: High · Timeline: 18–24 months\nAction: Require emissions disclosure from Tier 1 suppliers. I can draft the supplier questionnaire.\n\nWould you like me to build a detailed implementation roadmap for any of these?",
    timestamp: "09:42",
  },
];

const DEMO_RESPONSES: Record<string, string> = {
  default: "Based on your current emissions profile and industry benchmarks, I recommend focusing on Scope 2 electrification first — it offers the highest ROI with 22% emissions reduction potential at relatively low implementation cost. Would you like a detailed action plan?",
  sbti: "To align with SBTi, you need to commit to reducing Scope 1 & 2 emissions by at least 4.2% annually and Scope 3 by 2.5% annually, targeting net-zero by 2050. Your current trajectory shows a 3.1% reduction rate — you need to close a 1.1% annual gap. I recommend a renewable energy procurement strategy and supplier engagement program.",
  csrd: "For CSRD compliance (applicable from FY2025), you need to report under ESRS E1 covering: climate governance, strategy & business model resilience, targets & transition plan, energy consumption, GHG emissions (Scopes 1-3), carbon removal, and financial effects of climate risks. I can generate a gap analysis against your current disclosures.",
  board: "**Q3 2024 Sustainability Board Summary**\n\nTotal Emissions: 12,847 tCO₂e (↓8.3% YoY) ✅\nScope 1: 4,231 tCO₂e | Scope 2: 3,891 tCO₂e | Scope 3: 4,725 tCO₂e\nSBTi Target Progress: 71% on track\nCarbon Budget Remaining: 47,200 tCO₂e (6.2 years at current rate)\nKey Risk: Supply chain Scope 3 data quality — 34% coverage vs 80% target\nRecommended Board Action: Approve £2.1M renewable energy PPA",
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("sbti") || lower.includes("science-based")) return DEMO_RESPONSES.sbti;
  if (lower.includes("csrd") || lower.includes("disclosure")) return DEMO_RESPONSES.csrd;
  if (lower.includes("board") || lower.includes("summary")) return DEMO_RESPONSES.board;
  return DEMO_RESPONSES.default;
}

export default function AiAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>(DEMO_CONVERSATION);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  function send(text: string) {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setMessages(prev => [...prev, { role: "user", content: text, timestamp: now }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: getResponse(text),
        timestamp: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      }]);
    }, 1400);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-56px)] md:max-h-screen">
      <div className="md:hidden">
        <PageHeader title="AI Advisor" subtitle="Powered by carbon accounting intelligence" />
      </div>
      <div className="hidden md:block px-6 py-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-900">AI Carbon Advisor</h1>
        <p className="text-slate-500 text-sm mt-0.5">Powered by carbon accounting intelligence</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] flex flex-col gap-1 ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white rounded-tr-sm"
                  : "bg-white text-slate-800 rounded-tl-sm shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
              }`}>
                {msg.content}
              </div>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><ThumbsUp className="w-3 h-3" /></button>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><ThumbsDown className="w-3 h-3" /></button>
                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><Copy className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex gap-1 items-center h-5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <div className="px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SUGGESTED_PROMPTS.map(p => (
            <button key={p} onClick={() => send(p)}
              className="shrink-0 text-[12px] bg-white text-slate-600 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors whitespace-nowrap">
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <div className="px-4 pb-4 pt-1">
        <div className="flex gap-2 bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-slate-100 px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
            placeholder="Ask anything about your carbon data..."
            className="flex-1 text-[15px] text-slate-800 placeholder-slate-400 bg-transparent outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-emerald-500 text-white disabled:opacity-30 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
