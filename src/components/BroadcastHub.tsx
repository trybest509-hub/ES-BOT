import React, { useState } from "react";
import { Send, Users, Sparkles, CheckCircle2, Megaphone, Tag, Smartphone, AlertCircle } from "lucide-react";
import { Conversation } from "../types";

interface BroadcastHubProps {
  conversations: Conversation[];
  onBroadcast: (messageText: string, targetFilter: string) => Promise<any>;
  onGoToConversations: () => void;
}

export const BroadcastHub: React.FC<BroadcastHubProps> = ({
  conversations,
  onBroadcast,
  onGoToConversations,
}) => {
  const [messageText, setMessageText] = useState(
    "Bonswa [PSEUDO]! 🌟 Bèl nouvèl sou esrecharge.com: Nouvo bonis 10% sou tout Dyaman Free Fire ak Followers TikTok/Instagram! Fè kòmand ou sou sit web la oswa reponn mesaj sa a kounye a."
  );
  const [targetFilter, setTargetFilter] = useState("all");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<any>(null);

  const samplePseudo = conversations[0]?.clientPseudo || "Jean509";
  const previewText = messageText.replace(/\[PSEUDO\]/gi, samplePseudo);

  const targetCount =
    targetFilter === "all"
      ? conversations.length
      : targetFilter === "pozitif"
      ? conversations.filter((c) => c.sentimentSummary === "pozitif" || c.sentimentSummary === "rekonesan").length
      : conversations.filter((c) => c.sentimentSummary === "frustre" || c.sentimentSummary === "konfizyon").length;

  const handleSendBroadcast = async () => {
    if (!messageText.trim()) return;
    setIsBroadcasting(true);
    try {
      const res = await onBroadcast(messageText, targetFilter);
      setBroadcastResult(res);
    } catch (err) {
      console.error("Broadcast failed:", err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const templates = [
    {
      title: "🎁 Pwomosyon Dyaman Free Fire & Followers",
      text: "Bonjou [PSEUDO]! 🚀 Pwomo sou esrecharge.com: Pou chak acha Dyaman Free Fire oswa Followers TikTok/IG, jwenn bonis imedyat! Kòmande kounye a sou esrecharge.com oswa peye pa MonCash: +509 3788-9900.",
    },
    {
      title: "🌍 Nimewo Entènasyonal Vityèl (USA/France)",
      text: "Bonswa [PSEUDO]! Nou gen nouvo nimewo vityèl USA (+1) ak France (+33) disponib pou verifye WhatsApp, Telegram, PayPal ak ChatGPT. Tape *3* oswa vizite esrecharge.com.",
    },
    {
      title: "💵 Sèvis USDT Crypto & Rechaj Meru",
      text: "Alo [PSEUDO]! Acha ak vann USDT (TRC20/BEP20) ak rechaj balans Meru disponib 24/7 sou esrecharge.com. Pi bon to sou mache a!",
    },
  ];

  return (
    <div id="broadcast-hub-container" className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-emerald-800 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Megaphone className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Mesaj Masiv WhatsApp
              </span>
              <h1 className="text-2xl font-bold mt-1">Voye Mesaj Bay Kliyan Yo</h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                Voye anons, pwomosyon, ak nouvèl sèvis bay tout kliyan ES TOPUP ak pèsonalizasyon pseudo otomatik.
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Target Audience Segment Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                Chwazi Gwoup Kliyan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTargetFilter("all")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    targetFilter === "all"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>Tout Kliyan</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    {conversations.length} kontak
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetFilter("pozitif")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    targetFilter === "pozitif"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>😊 Kliyan Fidèl</span>
                    <Sparkles className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    {conversations.filter((c) => c.sentimentSummary === "pozitif" || c.sentimentSummary === "rekonesan").length} kontak
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetFilter("frustre")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    targetFilter === "frustre"
                      ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                    <span>⚠️ Swivi Asirans</span>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-1">
                    {conversations.filter((c) => c.sentimentSummary === "frustre" || c.sentimentSummary === "konfizyon").length} kontak
                  </div>
                </button>
              </div>
            </div>

            {/* Message Composer */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kontni Mesaj la:
                </label>
                <button
                  type="button"
                  onClick={() => setMessageText((prev) => prev + " [PSEUDO]")}
                  className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  <span>Mete [PSEUDO]</span>
                </button>
              </div>

              <textarea
                id="textarea-broadcast-message"
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Ekri mesaj ou a isit la..."
                className="w-full p-3.5 text-sm border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Baliz <strong>[PSEUDO]</strong> la ap ranplase otomatikman pa vrè non oswa pseudo chak kliyan WhatsApp.
              </p>
            </div>

            {/* Templates Quick Load */}
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Modèl Mesaj Pwopoze:
              </span>
              <div className="space-y-2">
                {templates.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMessageText(tpl.text)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50 hover:bg-emerald-50/50 text-xs text-slate-700 transition"
                  >
                    <div className="font-bold text-slate-800">{tpl.title}</div>
                    <div className="truncate text-slate-500 mt-0.5">{tpl.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="btn-trigger-broadcast"
              disabled={isBroadcasting || !messageText.trim() || targetCount === 0}
              onClick={handleSendBroadcast}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBroadcasting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Ap voye mesaj bay {targetCount} kliyan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Voye Mesaj Masiv la Kounye a ({targetCount} Kliyan)</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Phone Live Preview & Success confirmation */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Aperçu sou WhatsApp Kliyan an:</span>
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 bg-[#ece5dd] shadow-inner space-y-2">
                <div className="text-center">
                  <span className="text-[10px] bg-white/90 text-slate-500 px-2 py-0.5 rounded-full">
                    Aperçu pou: <strong>{samplePseudo}</strong>
                  </span>
                </div>

                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-[95%] text-xs space-y-1">
                    <div className="font-bold text-[11px] text-emerald-700 flex items-center gap-1">
                      <span>ES TOPUP Ofisyèl</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
                    </div>
                    <p className="whitespace-pre-line text-slate-800 leading-relaxed font-normal">
                      {previewText}
                    </p>
                    <div className="text-[9px] text-slate-400 text-right">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {broadcastResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Mesaj Masiv la Pase Avèk Siksè!</span>
                </div>
                <p className="text-xs text-emerald-700">
                  Mesaj la voye bay <strong>{broadcastResult.sentCount}</strong> kliyan sou WhatsApp. Tout mesaj yo anrejistre nan bwat konvèsasyon yo.
                </p>
                <button
                  onClick={onGoToConversations}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow transition"
                >
                  Ale wè konvèsasyon yo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
