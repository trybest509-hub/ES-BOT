import React, { useState } from "react";
import { Send, UserCheck, Smartphone, Sparkles, HelpCircle, AlertCircle, HeartHandshake, CheckCircle } from "lucide-react";
import { SentimentBadge } from "./SentimentBadge";

interface SimulatorProps {
  onSendMessage: (data: {
    clientNumber: string;
    clientPseudo: string;
    messageText: string;
    simulateNewUser: boolean;
  }) => Promise<any>;
}

export const SimulatorSidebar: React.FC<SimulatorProps> = ({ onSendMessage }) => {
  const [clientNumber, setClientNumber] = useState("+509 3844-5566");
  const [clientPseudo, setClientPseudo] = useState("Jean_509");
  const [messageText, setMessageText] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const presets = [
    {
      title: "Nouvo Kliyan (Salitasyon & Meni)",
      pseudo: "Jean_509",
      number: "+509 3844-5566",
      isNew: true,
      text: "Alo bonswa, mwen se Jean_509, mwen fèk dekouvri esrecharge.com. Ki sèvis nou ofri egzakteman?",
      icon: Sparkles,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      title: "Followers TikTok & Instagram (Mackenson)",
      pseudo: "Mackenson",
      number: "+509 3612-4455",
      isNew: false,
      text: "Bonjou ES RECHARGE, se Mackenson. Konbyen kòb pou 5,000 followers TikTok ak Instagram garanti?",
      icon: Smartphone,
      color: "bg-blue-50 text-blue-700 border-blue-200",
    },
    {
      title: "Dyaman Free Fire sou UID (AlexGamer)",
      pseudo: "AlexGamer",
      number: "+509 4600-8811",
      isNew: false,
      text: "Bonjou, m rele AlexGamer. Men UID mwen: 2489102931. Konbyen pou 520 Dyaman Free Fire?",
      icon: HelpCircle,
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
    {
      title: "Nimewo USA pou WhatsApp (Sarah)",
      pseudo: "Sarah_Belle",
      number: "+509 4899-2211",
      isNew: false,
      text: "Bonswa, mwen bezwen yon nimewo USA (+1) vityèl pou m verifye yon nouvo kont WhatsApp ak PayPal.",
      icon: AlertCircle,
      color: "bg-rose-50 text-rose-700 border-rose-200",
    },
    {
      title: "Rechaj USDT & Meru (Boss Jude)",
      pseudo: "Boss_Jude",
      number: "+509 3211-9090",
      isNew: false,
      text: "Bonswa, se Boss_Jude. Ki to USDT jodi a? Mwen vle achte 50 USDT pa MonCash epi fè yon rechaj Meru.",
      icon: HeartHandshake,
      color: "bg-purple-50 text-purple-700 border-purple-200",
    },
  ];

  const handleSend = async (customText?: string, customPseudo?: string, customNum?: string, customNew?: boolean) => {
    const textToSend = customText !== undefined ? customText : messageText;
    const pseudoToSend = customPseudo !== undefined ? customPseudo : clientPseudo;
    const numToSend = customNum !== undefined ? customNum : clientNumber;
    const newToSend = customNew !== undefined ? customNew : isNewUser;

    if (!textToSend.trim()) return;

    setLoading(true);
    try {
      const res = await onSendMessage({
        clientNumber: numToSend,
        clientPseudo: pseudoToSend,
        messageText: textToSend,
        simulateNewUser: newToSend,
      });
      setLastResult(res);
      if (!customText) {
        setMessageText("");
      }
    } catch (err) {
      console.error("Simulator error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="client-simulator-container" className="max-w-6xl mx-auto py-6 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Sandbox */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">
                    Tès Kliyan WhatsApp Live
                  </h2>
                  <p className="text-xs text-slate-500">
                    Teste kijan Gemini detekte pseudo a, analize santiman an, epi voye repons otomatik.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pseudo Kliyan an:
                  </label>
                  <div className="relative">
                    <input
                      id="input-sim-pseudo"
                      type="text"
                      value={clientPseudo}
                      onChange={(e) => setClientPseudo(e.target.value)}
                      placeholder="e.g. Jean_509 oswa Marie"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    />
                  </div>
                  <span className="text-[11px] text-slate-500">AI la dwe mansyone non sa a nan repons li.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nimewo WhatsApp Kliyan an:
                  </label>
                  <input
                    id="input-sim-number"
                    type="text"
                    value={clientNumber}
                    onChange={(e) => setClientNumber(e.target.value)}
                    placeholder="+509 38XX-XXXX"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Is New User Checkbox */}
              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <input
                  id="checkbox-is-new"
                  type="checkbox"
                  checked={isNewUser}
                  onChange={(e) => setIsNewUser(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="checkbox-is-new" className="text-xs text-slate-700 cursor-pointer font-medium">
                  Se yon <strong>nouvo moun</strong> ki ekri pou premye fwa (AI la ap fè bèl mesaj byenvini ES TOPUP)
                </label>
              </div>

              {/* Message Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mesaj Kliyan an voye sou WhatsApp:
                </label>
                <textarea
                  id="textarea-sim-message"
                  rows={3}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Ekri mesaj kliyan an isit la..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <button
                id="btn-submit-sim-message"
                disabled={loading || !messageText.trim()}
                onClick={() => handleSend()}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Gemini AI ap trete mesaj la...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Voye Kòm Kliyan sou WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Test Scenarios */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
                Senaryo Tès Rapid (Klike pou teste imedyatman):
              </span>
              <div className="space-y-2">
                {presets.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setClientPseudo(p.pseudo);
                        setClientNumber(p.number);
                        setIsNewUser(p.isNew);
                        setMessageText(p.text);
                        handleSend(p.text, p.pseudo, p.number, p.isNew);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all hover:shadow-xs flex items-start gap-2.5 ${p.color}`}
                    >
                      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold flex items-center justify-between">
                          <span>{p.title}</span>
                          <span className="font-mono text-[10px] opacity-75">{p.pseudo}</span>
                        </div>
                        <p className="truncate opacity-85 mt-0.5 italic">"{p.text}"</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Real-time AI Analysis & Response Preview */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Rezilta AI & Analiz Santiman
                  </h3>
                  <p className="text-xs text-slate-500">Gemini 3.7 Flash sou Sèvè a</p>
                </div>
              </div>

              {lastResult?.aiAnalysis && (
                <SentimentBadge
                  sentiment={lastResult.aiAnalysis.sentiment}
                  score={lastResult.aiAnalysis.sentimentScore}
                  showScore
                />
              )}
            </div>

            {lastResult ? (
              <div className="mt-4 space-y-4 flex-1">
                {/* Sentiment & Pseudo Detection Pill Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Pseudo Detekte</span>
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      {lastResult.aiAnalysis?.detectedPseudo || clientPseudo}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Entansyon Kliyan</span>
                    <span className="text-xs font-bold text-indigo-700 mt-0.5 block truncate">
                      {lastResult.aiAnalysis?.intent || "rechaj"}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nòt Santiman</span>
                    <span className="text-xs font-bold text-teal-700 mt-0.5 block">
                      {typeof lastResult.aiAnalysis?.sentimentScore === "number"
                        ? `${Math.round(((lastResult.aiAnalysis.sentimentScore + 1) / 2) * 100)}%`
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* Simulated WhatsApp Chat Stream */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-[#ece5dd] space-y-3 shadow-inner">
                  <div className="text-center">
                    <span className="text-[10px] bg-white/80 text-slate-600 px-2 py-0.5 rounded-full shadow-xs">
                      Jodi a • WhatsApp Chat
                    </span>
                  </div>

                  {/* Customer Bubble */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-tl-xs p-3 max-w-[85%] shadow-xs text-slate-800 text-xs space-y-1">
                      <div className="font-bold text-[10px] text-emerald-700 flex items-center justify-between gap-3">
                        <span>{lastResult.userMessage?.detectedPseudo || clientPseudo}</span>
                        <span className="font-mono text-slate-400 font-normal">{clientNumber}</span>
                      </div>
                      <p className="whitespace-pre-line text-slate-800">{lastResult.userMessage?.text}</p>
                      <div className="text-[9px] text-slate-400 text-right">✓✓ Resevwa</div>
                    </div>
                  </div>

                  {/* Bot Response Bubble */}
                  {lastResult.botMessage && (
                    <div className="flex justify-end">
                      <div className="bg-[#d9fdd3] rounded-2xl rounded-tr-xs p-3 max-w-[85%] shadow-xs text-slate-800 text-xs space-y-1 border border-emerald-200">
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-emerald-200/60">
                          <span className="font-bold text-[10px] text-emerald-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-600" /> ES TOPUP (Bot AI)
                          </span>
                          <span className="text-[9px] bg-emerald-700 text-white font-bold px-1.5 py-0.2 rounded-full">
                            Otomatik
                          </span>
                        </div>
                        <p className="whitespace-pre-line text-slate-900 leading-relaxed font-medium">
                          {lastResult.botMessage.text}
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                          <span className="text-emerald-700 font-semibold">
                            Pèsonalize pou: {lastResult.aiAnalysis?.detectedPseudo}
                          </span>
                          <span>✓✓ Li</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Actions Generated by AI */}
                {lastResult.aiAnalysis?.suggestedQuickReplies && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Bouton oswa Sijesyon Rapid AI la pwopoze:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {lastResult.aiAnalysis.suggestedQuickReplies.map((q: string, i: number) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-xs rounded-lg shadow-2xs font-medium"
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex-1">
                <Sparkles className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Pa gen tès ki fèt kounye a</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Chwazi yon senaryo sou bò gòch la oswa ekri yon mesaj pou wè kijan Gemini reponn avèk pseudo kliyan an ak analiz santiman.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
