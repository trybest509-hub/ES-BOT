import React from "react";
import { MessageSquare, QrCode, Send, Settings, Smartphone, Sparkles, Wifi, WifiOff, Bot, Activity } from "lucide-react";
import { WhatsAppStatus } from "../types";

interface NavbarProps {
  activeTab: "dashboard" | "qr" | "broadcast" | "simulator" | "config" | "logs";
  setActiveTab: (tab: "dashboard" | "qr" | "broadcast" | "simulator" | "config" | "logs") => void;
  whatsappStatus: WhatsAppStatus;
  unreadTotal: number;
  autoReplyGlobal: boolean;
  onToggleAutoReplyGlobal: () => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  whatsappStatus,
  unreadTotal,
  autoReplyGlobal,
  onToggleAutoReplyGlobal,
  onOpenQR,
}) => {
  return (
    <aside
      id="sleek-sidebar-nav"
      className="w-16 sm:w-20 bg-[#075E54] flex flex-col items-center py-5 justify-between border-r border-[#054c44] shrink-0 z-30 select-none"
    >
      {/* Top Logo & Navigation Tabs */}
      <div className="flex flex-col gap-6 items-center w-full">
        {/* Brand Logo ES */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
          title="ES TOPUP - Tablodbò Prensipal"
        >
          <span className="text-[#075E54] font-black text-xl tracking-tight">ES</span>
        </button>

        {/* Navigation Tabs with Sleek Active Indicators */}
        <div className="flex flex-col gap-2.5 items-center w-full px-2">
          {/* 1. Conversations */}
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab("dashboard")}
            title="Konvèsasyon WhatsApp"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "dashboard"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            {unreadTotal > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full font-bold flex items-center justify-center border-2 border-[#075E54]">
                {unreadTotal}
              </span>
            )}
          </button>

          {/* 2. Simulator */}
          <button
            id="nav-tab-simulator"
            onClick={() => setActiveTab("simulator")}
            title="Tès Kliyan Live (Simulator)"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "simulator"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Smartphone className="w-5 h-5" />
          </button>

          {/* 3. Broadcast Hub */}
          <button
            id="nav-tab-broadcast"
            onClick={() => setActiveTab("broadcast")}
            title="Mesaj Masiv (Broadcast)"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "broadcast"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>

          {/* 4. QR Code Scanner */}
          <button
            id="nav-tab-qr"
            onClick={() => setActiveTab("qr")}
            title="Eskanè QR WhatsApp"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "qr"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* 5. Live Logs Terminal */}
          <button
            id="nav-tab-logs"
            onClick={() => setActiveTab("logs")}
            title="Kontwòl Log & Tranzaksyon Mesaj Live"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "logs"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Activity className="w-5 h-5" />
          </button>

          {/* 6. Configuration */}
          <button
            id="nav-tab-config"
            onClick={() => setActiveTab("config")}
            title="Paramèt & AI Knowledge"
            className={`p-3 rounded-xl transition-all relative cursor-pointer flex items-center justify-center w-11 h-11 ${
              activeTab === "config"
                ? "bg-[#128C7E] text-white shadow-sm ring-2 ring-emerald-300/30"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Status Controls: AI Engine & WhatsApp Connection */}
      <div className="flex flex-col gap-4 items-center">
        {/* AI Toggle Shortcut */}
        <button
          id="btn-toggle-auto-reply"
          onClick={onToggleAutoReplyGlobal}
          title={autoReplyGlobal ? "AI Auto-reply Aktif (Klike pou dezaktive)" : "AI Auto-reply Enaktif (Klike pou aktive)"}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            autoReplyGlobal
              ? "bg-[#128C7E] border-emerald-400/40 text-emerald-200"
              : "bg-white/10 border-white/20 text-white/50 hover:text-white"
          }`}
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* WhatsApp Online Ring Indicator */}
        <button
          id="btn-whatsapp-status"
          onClick={onOpenQR}
          title={whatsappStatus.connected ? "WhatsApp Konekte (@estopup_bot)" : "WhatsApp Dekonekte (Skane QR)"}
          className="relative cursor-pointer group flex items-center justify-center"
        >
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm transition-all ${
              whatsappStatus.connected
                ? "bg-green-400 ring-4 ring-green-400/30"
                : "bg-amber-400 ring-4 ring-amber-400/30 animate-pulse"
            }`}
          />
        </button>

        {/* Avatar Profile */}
        <div
          className="w-9 h-9 rounded-full bg-emerald-800 border-2 border-white/40 flex items-center justify-center text-white font-bold text-xs shadow-sm"
          title="ES TOPUP Admin"
        >
          ES
        </div>
      </div>
    </aside>
  );
};
