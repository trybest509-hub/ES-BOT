import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  Phone,
  Clock,
  Zap,
  MessageCircle,
  AlertTriangle,
  ShieldCheck,
  PlusCircle,
  MoreVertical,
  Smile,
  Activity,
  Power,
  Edit3,
  QrCode,
} from "lucide-react";
import { Conversation, Message, SentimentType, BotConfig } from "../types";
import { SentimentBadge, getSentimentMeta } from "./SentimentBadge";

interface LiveChatDashboardProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
  onSendManualMessage: (conversationId: string, text: string) => Promise<void>;
  onToggleAutoReply: (conversationId: string) => Promise<void>;
  onMarkAsRead: (conversationId: string) => Promise<void>;
  onOpenNewChat: () => void;
  botConfig: BotConfig;
  onGenerateAiDraft: (conversationId: string) => Promise<string | null>;
  onOpenQR?: () => void;
}

export const LiveChatDashboard: React.FC<LiveChatDashboardProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onSendManualMessage,
  onToggleAutoReply,
  onMarkAsRead,
  onOpenNewChat,
  botConfig,
  onGenerateAiDraft,
  onOpenQR,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConv = conversations.find((c) => c.id === selectedId) || conversations[0] || null;

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages.length, selectedConv?.id]);

  // Mark as read when opened
  useEffect(() => {
    if (selectedConv && selectedConv.unreadCount > 0) {
      onMarkAsRead(selectedConv.id);
    }
  }, [selectedConv?.id]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.clientPseudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientNumber.includes(searchTerm) ||
      c.messages.some((m) => m.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSentiment =
      sentimentFilter === "all" || c.sentimentSummary === sentimentFilter;

    return matchesSearch && matchesSentiment;
  });

  const handleSend = async () => {
    if (!inputText.trim() || !selectedConv) return;
    setIsSending(true);
    try {
      await onSendManualMessage(selectedConv.id, inputText);
      setInputText("");
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickInsert = (text: string) => {
    if (!selectedConv) return;
    const personalized = text.replace(/\[PSEUDO\]/gi, selectedConv.clientPseudo);
    setInputText(personalized);
  };

  const handleAskGeminiToDraft = async () => {
    if (!selectedConv) return;
    setIsDraftingAi(true);
    try {
      const draft = await onGenerateAiDraft(selectedConv.id);
      if (draft) {
        setInputText(draft);
      }
    } catch (err) {
      console.error("AI drafting error:", err);
    } finally {
      setIsDraftingAi(false);
    }
  };

  // Avatar color generator based on pseudo
  const getAvatarColor = (pseudo: string) => {
    const colors = [
      "bg-orange-100 text-orange-600",
      "bg-blue-100 text-blue-600",
      "bg-purple-100 text-purple-600",
      "bg-emerald-100 text-emerald-600",
      "bg-teal-100 text-teal-600",
      "bg-indigo-100 text-indigo-600",
    ];
    let hash = 0;
    for (let i = 0; i < pseudo.length; i++) hash += pseudo.charCodeAt(i);
    return colors[hash % colors.length];
  };

  const sentimentMeta = selectedConv ? getSentimentMeta(selectedConv.sentimentSummary) : null;
  const sentimentScorePct =
    selectedConv && typeof selectedConv.sentimentScore === "number"
      ? Math.max(10, Math.min(100, Math.round(((selectedConv.sentimentScore + 1) / 2) * 100)))
      : 85;

  return (
    <div id="sleek-chat-dashboard" className="flex-1 flex h-full overflow-hidden bg-[#F0F2F5]">
      {/* 1. Left Conversations Sidebar (320px) */}
      <section className="w-full sm:w-[320px] lg:w-[340px] bg-white border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Konvèsasyon Yo</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Mizajou an tan reyèl • ES TOPUP</p>
            </div>
            <button
              id="btn-new-chat"
              onClick={onOpenNewChat}
              className="p-2 text-[#075E54] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="Kòmanse Nouvo Konvèsasyon"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="mt-3.5 relative">
            <input
              id="input-search-conversations"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Chache kliyan..."
              className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-lg text-xs border-none outline-none focus:ring-1 focus:ring-[#128C7E] transition-all"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>

        {/* QR Connection Banner Pill (Clickable to open QR Scanner Screen) */}
        <div
          onClick={onOpenQR}
          className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/90 border-b border-emerald-200/80 flex items-center justify-between cursor-pointer transition-colors group"
          title="Klike pou wè kòd QR la epi eskane li"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-900 font-semibold truncate flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-[#075E54]" />
              Kòd QR WhatsApp: <strong className="text-[#075E54]">Klike pou Eskane</strong>
            </span>
          </div>
          <span className="text-[10px] bg-[#075E54] text-white px-2 py-0.5 rounded-full font-bold group-hover:bg-[#128C7E] transition-colors shadow-2xs">
            Ouvri QR
          </span>
        </div>

        {/* Sentiment Filter Sub-bar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 overflow-x-auto scrollbar-none text-[11px] bg-gray-50/50">
          <button
            onClick={() => setSentimentFilter("all")}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
              sentimentFilter === "all"
                ? "bg-[#075E54] text-white shadow-2xs"
                : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            Tout ({conversations.length})
          </button>
          <button
            onClick={() => setSentimentFilter("pozitif")}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
              sentimentFilter === "pozitif"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            😊 Pozitif
          </button>
          <button
            onClick={() => setSentimentFilter("frustre")}
            className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
              sentimentFilter === "frustre"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            ⚠️ Fristre
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">
              Pa gen konvèsasyon ki koresponn.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              const timeStr = lastMsg
                ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";
              const avatarBg = getAvatarColor(conv.clientPseudo);

              return (
                <div
                  key={conv.id}
                  id={`conv-item-${conv.id}`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    if (conv.unreadCount > 0) onMarkAsRead(conv.id);
                  }}
                  className={`hover:bg-gray-50 p-3.5 border-b border-gray-100 cursor-pointer flex gap-3 transition-colors ${
                    isSelected ? "bg-blue-50/40 border-l-4 border-[#075E54]" : ""
                  }`}
                >
                  {/* Initials Avatar */}
                  <div className={`w-11 h-11 rounded-full ${avatarBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                    {conv.clientPseudo.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-1">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {conv.clientPseudo}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">{timeStr}</span>
                    </div>

                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {lastMsg ? (
                        <>
                          {lastMsg.sender === "bot" && <span className="text-[#128C7E] font-medium">ES Bot: </span>}
                          {lastMsg.sender === "agent" && <span className="text-teal-700 font-medium">Ou: </span>}
                          {lastMsg.text}
                        </>
                      ) : (
                        "Nouvo konvèsasyon..."
                      )}
                    </p>

                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] font-mono text-gray-400">{conv.clientNumber}</span>
                      {conv.unreadCount > 0 && (
                        <span className="bg-[#25D366] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 2. Main Middle Chat Window */}
      {selectedConv ? (
        <main className="flex-1 flex flex-col bg-[#E5DDD5] relative min-w-0">
          {/* Sleek Top Header Bar */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-xs z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-full ${getAvatarColor(selectedConv.clientPseudo)} flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs`}>
                {selectedConv.clientPseudo.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-gray-900 truncate">
                  {selectedConv.clientPseudo} <span className="text-gray-400 font-normal text-xs">(Pseudo: {selectedConv.clientPseudo})</span>
                </h3>
                <p className="text-[11px] text-green-600 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  {selectedConv.autoReplyEnabled ? "Bot la ap reponn (AI Aktif)..." : "Mòd Manyèl Ajan"}
                </p>
              </div>
            </div>

            {/* Badges & Actions */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full border border-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span>Gemini Pro Engine</span>
              </div>

              <button
                id="btn-toggle-conv-autoreply"
                onClick={() => onToggleAutoReply(selectedConv.id)}
                className={`p-2 rounded-lg text-xs font-semibold border transition-all ${
                  selectedConv.autoReplyEnabled
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                    : "bg-gray-100 text-gray-700 border-gray-200"
                }`}
                title="Aktive/Dezaktive AI Bot pou chat sa a"
              >
                <Bot className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Stream Area */}
          <div className="flex-1 p-6 flex flex-col gap-3.5 overflow-y-auto">
            <div className="text-center my-1">
              <span className="text-[10px] bg-white/90 text-gray-500 px-3 py-1 rounded-full shadow-2xs border border-gray-200 font-medium">
                Kòmansman konvèsasyon WhatsApp • ES TOPUP
              </span>
            </div>

            {selectedConv.messages.map((msg) => {
              const isClient = msg.sender === "client";
              const isBot = msg.sender === "bot";
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              if (isClient) {
                return (
                  <div key={msg.id} className="self-start bg-white p-3.5 rounded-2xl rounded-tl-none shadow-xs max-w-[85%] sm:max-w-[70%] border border-gray-100">
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block font-mono">{timeStr}</span>
                  </div>
                );
              }

              // AI Bot or Agent Message
              return (
                <div
                  key={msg.id}
                  className={`self-end p-3.5 rounded-2xl rounded-tr-none shadow-xs max-w-[85%] sm:max-w-[70%] ${
                    isBot ? "bg-[#DCF8C6] border border-emerald-200/60" : "bg-[#E1F5FE] border border-blue-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-black/5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[9px] font-bold text-purple-700 uppercase tracking-tight">
                      {isBot ? "AI Assistant (ES TOPUP)" : "Ajan Imèn ES TOPUP"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line font-normal">
                    {msg.text}
                  </p>
                  <div className="flex items-center justify-end gap-1 text-[10px] text-gray-500 mt-1 font-mono">
                    <span>{timeStr}</span>
                    <CheckCheck className="w-3.5 h-3.5 text-sky-500 inline" />
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Chips Bar */}
          <div className="bg-white/90 backdrop-blur-xs px-4 py-2 border-t border-gray-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Kòmand:
            </span>
            <button
              onClick={() =>
                handleQuickInsert(
                  "🌟 *BYENVENI SOU ES RECHARGE (esrecharge.com)* 🌟\nBonjou *[PSEUDO]*! Mwen se asistan entèlijan WhatsApp ES RECHARGE.\n\nChwazi yon sèvis anba a (tape nimewo a oswa non sèvis la):\n\n1️⃣ *Followers & Rezo Sosyal* (TikTok, Instagram, Facebook, YouTube)\n2️⃣ *Dyaman Free Fire* (Livrezon rapid sou UID)\n3️⃣ *Nimewo Entènasyonal Vityèl* (USA, France, Chili... pou SMS)\n4️⃣ *Rechaj USDT* (Crypto TRC20 / BEP20)\n5️⃣ *Rechaj Meru* (Topup & Balans)\n6️⃣ *Verifye Estati Kòmand / Pale ak yon Ajan*\n\n💡 *Konsèy*: Tape yon chif (egz: *1*, *2*, *3*, *4*, *5*, *6*) oswa vizite sit nou an: *esrecharge.com*!"
                )
              }
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#075E54] border border-emerald-300 rounded-full font-bold transition cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>*MENU* Prensipal</span>
            </button>
            <button
              onClick={() =>
                handleQuickInsert(
                  "👥 *FOLLOWERS & BOOM REZO SOSYAL (esrecharge.com)*\nBonjou *[PSEUDO]*! Nou gen followers, likes, views pou TikTok, Instagram, Facebook, YouTube ak Telegram. Voye lyen pwofil ou a ak kantite w bezwen an."
                )
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-full font-medium transition cursor-pointer whitespace-nowrap text-xs shrink-0"
            >
              👥 1. Followers
            </button>
            <button
              onClick={() =>
                handleQuickInsert(
                  "💎 *DYAMAN FREE FIRE SOU UID (esrecharge.com)*\nBonjou *[PSEUDO]*! Nou livre Dyaman Free Fire nan 30 segonn sou ID ou (UID). Voye UID ou a ak pake ou vle a (100, 310, 520, 1060, 2180 dyaman)."
                )
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-full font-medium transition cursor-pointer whitespace-nowrap text-xs shrink-0"
            >
              💎 2. Free Fire
            </button>
            <button
              onClick={() =>
                handleQuickInsert(
                  "🌍 *NIMEWO ENTÈNASYONAL VITYÈL (esrecharge.com)*\nBonjou *[PSEUDO]*! Nimewo vityèl disponib pou USA (+1), France (+33), Chili (+56), elatriye pou verifye WhatsApp, Telegram, PayPal ak TikTok."
                )
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-full font-medium transition cursor-pointer whitespace-nowrap text-xs shrink-0"
            >
              🌍 3. Nimewo USA
            </button>
            <button
              onClick={() =>
                handleQuickInsert(
                  "💵 *RECHAJ USDT CRYPTO (esrecharge.com)*\nBonjou *[PSEUDO]*! Acha ak vann USDT (TRC20 / BEP20) fasil pa MonCash oswa Natcash (+509 3788-9900)."
                )
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-full font-medium transition cursor-pointer whitespace-nowrap text-xs shrink-0"
            >
              💵 4. USDT
            </button>
            <button
              onClick={() =>
                handleQuickInsert(
                  "⚡ *RECHAJ MERU (esrecharge.com)*\nBonjou *[PSEUDO]*! Rechaj ak balans kont Meru an tan reyèl pa MonCash/Natcash: +509 3788-9900."
                )
              }
              className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 rounded-full font-medium transition cursor-pointer whitespace-nowrap text-xs shrink-0"
            >
              ⚡ 5. Meru
            </button>
            <button
              onClick={handleAskGeminiToDraft}
              disabled={isDraftingAi}
              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-full font-bold transition cursor-pointer whitespace-nowrap text-xs flex items-center gap-1 shrink-0"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isDraftingAi ? "Ap prepare..." : "Gemini AI Draft"}</span>
            </button>
          </div>

          {/* Sleek Input Footer */}
          <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-3">
            <input
              id="input-manual-chat-message"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tape yon mesaj pou entèvni manuèlman..."
              className="flex-1 py-3 px-4 bg-gray-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#128C7E] transition-all"
            />
            <button
              id="btn-send-manual-message"
              disabled={isSending || !inputText.trim()}
              onClick={handleSend}
              className="w-10 h-10 bg-[#128C7E] hover:bg-[#075E54] active:scale-95 disabled:opacity-40 rounded-full flex items-center justify-center text-white shadow-md transition-all shrink-0 cursor-pointer"
              title="Voye mesaj bay kliyan an"
            >
              <Send className="w-5 h-5 translate-x-0.5" />
            </button>
          </div>
        </main>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50 text-gray-400">
          <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
          <h3 className="text-base font-bold text-gray-700">Chwazi yon konvèsasyon</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Klike sou yon kontak sou bò gòch la pou kòmanse gade ak jere repons Gemini AI yo.
          </p>
        </div>
      )}

      {/* 3. Right AI Insights Aside Panel (250px) */}
      <aside className="w-[260px] lg:w-[280px] bg-white border-l border-gray-200 hidden md:flex flex-col p-6 overflow-y-auto">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          AI Insights
        </h4>

        <div className="space-y-6">
          {/* Sentiment Card */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Santiman Kliyan</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{sentimentMeta?.emoji || "😊"}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    selectedConv?.sentimentSummary === "frustre"
                      ? "bg-rose-500"
                      : selectedConv?.sentimentSummary === "ijans"
                      ? "bg-amber-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${sentimentScorePct}%` }}
                />
              </div>
              <span className="text-xs font-bold text-green-600">{sentimentScorePct}%</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">
              "{sentimentMeta?.description || "Pozitif ak Amikal"}"
            </p>
          </div>

          {/* Bot Metrics */}
          <div className="space-y-3.5">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Metrik Bot (@Gemini)</p>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Tan repons</span>
              <span className="font-bold text-gray-900">1.2s</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Konfyans AI</span>
              <span className="font-bold text-gray-900">98.4%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Mesaj jodi a</span>
              <span className="font-bold text-gray-900">
                {conversations.reduce((acc, c) => acc + c.messages.length, 0)}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Aksyon Rapid</p>
            {selectedConv && (
              <button
                onClick={() => onToggleAutoReply(selectedConv.id)}
                className={`w-full py-2 text-xs font-bold rounded-lg border transition-all ${
                  selectedConv.autoReplyEnabled
                    ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                {selectedConv.autoReplyEnabled ? "Dezaktive Bot (Mòd Manyèl)" : "Aktive Repons Bot"}
              </button>
            )}
            <button
              onClick={() => handleQuickInsert("Bonjou [PSEUDO]! Kòman nou ka ede w jodi a sou ES TOPUP?")}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg border border-gray-200 transition-all"
            >
              Modifye Script AI
            </button>
          </div>

          {/* Info Card */}
          <div className="mt-auto pt-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
              <p className="text-[10px] text-purple-700 leading-tight">
                <span className="font-bold uppercase">Info:</span> Bot la ap itilize pseudo Kliyan an otomatikman pou rann sèvis la plis pèsonalize.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
