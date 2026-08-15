import React from "react";
import { SentimentType } from "../types";

interface SentimentBadgeProps {
  sentiment: SentimentType;
  score?: number;
  showScore?: boolean;
}

export const getSentimentMeta = (sentiment: SentimentType) => {
  switch (sentiment) {
    case "pozitif":
      return {
        label: "Pozitif",
        emoji: "😊",
        bg: "bg-emerald-100 text-emerald-800 border-emerald-300",
        pill: "bg-emerald-500",
        description: "Kliyan an satisfè epi li eksite pou l fè tranzaksyon an.",
      };
    case "rekonesan":
      return {
        label: "Rekonesan",
        emoji: "🙏",
        bg: "bg-teal-100 text-teal-800 border-teal-300",
        pill: "bg-teal-500",
        description: "Kliyan an ap remèsye ES TOPUP pou bon sèvis.",
      };
    case "frustre":
      return {
        label: "Fristre / Pwoblèm",
        emoji: "⚠️",
        bg: "bg-rose-100 text-rose-800 border-rose-300",
        pill: "bg-rose-500",
        description: "Kliyan an gen yon reta oswa yon enkyetid — bezwen empati & èd rapid.",
      };
    case "ijans":
      return {
        label: "Ijans",
        emoji: "⚡",
        bg: "bg-amber-100 text-amber-900 border-amber-300",
        pill: "bg-amber-500",
        description: "Kliyan an prese pou rechaj la pase kounye a.",
      };
    case "konfizyon":
      return {
        label: "Konfizyon",
        emoji: "🤔",
        bg: "bg-purple-100 text-purple-800 border-purple-300",
        pill: "bg-purple-500",
        description: "Kliyan an bezwen eksplikasyon etap pa etap sou pri oswa peman.",
      };
    case "net":
    default:
      return {
        label: "Nèt / Enfòmasyon",
        emoji: "💬",
        bg: "bg-slate-100 text-slate-700 border-slate-300",
        pill: "bg-slate-400",
        description: "Demann enfòmasyon nòmal sou sèvis yo.",
      };
  }
};

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment,
  score,
  showScore = false,
}) => {
  const meta = getSentimentMeta(sentiment);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${meta.bg}`}
      title={meta.description}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      {showScore && typeof score === "number" && (
        <span className="text-[10px] opacity-75 font-mono">
          ({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})
        </span>
      )}
    </span>
  );
};
