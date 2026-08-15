import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Activity,
  Sparkles,
  RefreshCw,
  Trash2,
  Filter,
  ArrowDownCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Zap,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldCheck,
} from "lucide-react";
import { SystemLog } from "../types";

interface LiveLogViewerProps {
  logs: SystemLog[];
  onClearLogs: () => Promise<void>;
  onRefreshLogs: () => Promise<void>;
  onSendTestMessage: (text: string, pseudo?: string) => Promise<any>;
}

export const LiveLogViewer: React.FC<LiveLogViewerProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
  onSendTestMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  const [testText, setTestText] = useState("Bonjou, mwen bezwen 350 HTG Digicel pa MonCash");
  const [testPseudo, setTestPseudo] = useState("Jean-Paul");
  const [isSending, setIsSending] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedCategory !== "ALL" && log.category !== selectedCategory) return false;
    if (selectedLevel !== "ALL" && log.level !== selectedLevel) return false;
    return true;
  });

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0; // Since it's sorted newest first, or we can scroll
    }
  }, [logs, autoScroll]);

  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testText.trim() || isSending) return;
    setIsSending(true);
    try {
      await onSendTestMessage(testText, testPseudo);
      setTestText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getLevelBadge = (level: SystemLog["level"]) => {
    switch (level) {
      case "ai":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-900/80 text-teal-300 border border-teal-500/40 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> GEMINI AI
          </span>
        );
      case "success":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> SIKSÈ
          </span>
        );
      case "warning":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/80 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> AVÈTISMAN
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-900/80 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> ERÈ
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Info className="w-2.5 h-2.5" /> INFO
          </span>
        );
    }
  };

  return (
    <div id="live-logs-terminal" className="flex flex-col h-full bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              Kontwòl Log & Tranzaksyon Mesaj Live (ES TOPUP Engine)
            </h2>
          </div>
          <span className="text-[11px] font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-600/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            {logs.length} Evènman
          </span>
        </div>

        {/* Action Buttons & Filters */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === "ALL" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Tout ({logs.length})
            </button>
            <button
              onClick={() => setSelectedCategory("WHATSAPP")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === "WHATSAPP" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setSelectedCategory("GEMINI_AI")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === "GEMINI_AI" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Gemini AI
            </button>
            <button
              onClick={() => setSelectedCategory("SENTIMENT")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                selectedCategory === "SENTIMENT" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Santiman
            </button>
          </div>

          <button
            onClick={onRefreshLogs}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
            title="Rafrechi Log yo"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-lg transition cursor-pointer"
            title="Efase tout Log yo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Log Stream Body */}
      <div
        ref={logContainerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 text-slate-700" />
            <p>Pa gen okenn log anrejistre pou filtè sa a.</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 rounded-xl transition-all space-y-1.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                  {getLevelBadge(log.level)}
                  <span className="text-slate-400 text-[11px] font-bold">[{log.category}]</span>
                  <span className="text-slate-200 font-bold text-xs">{log.title}</span>
                </div>
              </div>

              <p className="text-slate-300 font-sans text-xs sm:text-sm pl-2 border-l-2 border-slate-700 leading-relaxed whitespace-pre-wrap">
                {log.message}
              </p>

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div className="bg-slate-950/70 p-2 rounded-lg text-[11px] text-emerald-400/90 font-mono overflow-x-auto">
                  <span className="text-slate-500">Payload: </span>
                  {JSON.stringify(log.metadata)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Instant Interactive Message Tester Footer */}
      <div className="bg-slate-900 p-3.5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Tès An Tan Reyèl (Voye yon mesaj kliyan pou gade kijan Bot la ap reponn epi jenere log)
          </span>
          <span className="text-[11px] text-slate-400">Gemini 3.7 Auto-Trigger</span>
        </div>

        <form onSubmit={handleQuickSend} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="w-full sm:w-40 shrink-0">
            <input
              type="text"
              value={testPseudo}
              onChange={(e) => setTestPseudo(e.target.value)}
              placeholder="Pseudo (egz. Mackenson)"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="w-full flex-1 relative">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Antre mesaj kliyan an..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 pr-10"
            />
          </div>

          <button
            type="submit"
            disabled={!testText.trim() || isSending}
            className="w-full sm:w-auto px-4 py-2 bg-[#075E54] hover:bg-[#128C7E] disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            {isSending ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isSending ? "Ap Trete..." : "Teste Repons Bot"}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
