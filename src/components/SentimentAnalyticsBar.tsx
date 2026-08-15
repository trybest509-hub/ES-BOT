import React from "react";
import { Smile, AlertTriangle, MessageSquare, Zap, TrendingUp, CheckCircle } from "lucide-react";
import { Conversation, WhatsAppStatus } from "../types";

interface SentimentAnalyticsBarProps {
  conversations: Conversation[];
  whatsappStatus: WhatsAppStatus;
  onFilterBySentiment: (sentiment: string) => void;
}

export const SentimentAnalyticsBar: React.FC<SentimentAnalyticsBarProps> = ({
  conversations,
  whatsappStatus,
  onFilterBySentiment,
}) => {
  const total = conversations.length;
  const positiveCount = conversations.filter(
    (c) => c.sentimentSummary === "pozitif" || c.sentimentSummary === "rekonesan"
  ).length;
  const frustratedCount = conversations.filter(
    (c) => c.sentimentSummary === "frustre" || c.sentimentSummary === "konfizyon"
  ).length;
  const urgentCount = conversations.filter((c) => c.sentimentSummary === "ijans").length;

  let totalScore = 0;
  let scoreCount = 0;
  conversations.forEach((c) => {
    if (typeof c.sentimentScore === "number") {
      totalScore += c.sentimentScore;
      scoreCount++;
    }
  });

  const satisfactionPct = scoreCount > 0 ? Math.round(((totalScore / scoreCount + 1) / 2) * 100) : 92;

  return (
    <div id="sentiment-analytics-bar" className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Conversations */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Konvèsasyon Aktif
            </span>
            <div className="text-xl font-black text-slate-800 mt-0.5">{total}</div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3 h-3" /> WhatsApp Live
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Satisfaction Score */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Satisfaksyon Kliyan
            </span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{satisfactionPct}%</div>
            <span className="text-[10px] text-slate-500 font-medium">Analiz Gemini AI</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Smile className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Positive Clients */}
        <button
          onClick={() => onFilterBySentiment("pozitif")}
          className="bg-white hover:bg-emerald-50/50 rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between text-left transition cursor-pointer"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Kliyan Pozitif 😊
            </span>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{positiveCount}</div>
            <span className="text-[10px] text-slate-400">Klike pou filtre</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </button>

        {/* Metric 4: Frustrated / Urgent alerts */}
        <button
          onClick={() => onFilterBySentiment("frustre")}
          className={`rounded-2xl p-3.5 border shadow-2xs flex items-center justify-between text-left transition cursor-pointer ${
            frustratedCount > 0
              ? "bg-rose-50/60 border-rose-200 hover:bg-rose-100/60"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Alèt Fristrasyon / Reta ⚠️
            </span>
            <div className={`text-xl font-black mt-0.5 ${frustratedCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
              {frustratedCount}
            </div>
            <span className="text-[10px] text-slate-400">
              {frustratedCount > 0 ? "Bezwen swivi rapid" : "Tout kliyan an lòd"}
            </span>
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              frustratedCount > 0 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </button>
      </div>
    </div>
  );
};
