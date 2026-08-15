import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar";
import { LiveChatDashboard } from "./components/LiveChatDashboard";
import { WhatsAppQRScanner } from "./components/WhatsAppQRScanner";
import { BroadcastHub } from "./components/BroadcastHub";
import { SimulatorSidebar } from "./components/SimulatorSidebar";
import { BotConfigPanel } from "./components/BotConfigPanel";
import { LiveLogViewer } from "./components/LiveLogViewer";
import { NewChatModal } from "./components/NewChatModal";
import { SentimentAnalyticsBar } from "./components/SentimentAnalyticsBar";
import { Conversation, BotConfig, WhatsAppStatus, SystemLog } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "qr" | "broadcast" | "simulator" | "config" | "logs">("qr");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus>({
    connected: false,
    phoneNumber: undefined,
    deviceBattery: 94,
    qrCodeSeed: "es_topup_auth_token_init",
  });
  const [botConfig, setBotConfig] = useState<BotConfig>({
    businessName: "ES TOPUP",
    welcomeTemplate: "Bonswa / Bonjou [PSEUDO]! Mwen se asistan vityèl ES TOPUP ki la pou ede w ak tout sèvis rechaj, plan Digicel & Natcom, ak transfè MonCash/Natcash. Kòman mwen ka ede w jodi a?",
    moncashNumber: "+509 3788-9900 (Non: ES TOPUP Sèvis)",
    natcashNumber: "+509 4422-3344 (Non: ES TOPUP Sèvis)",
    customerCareNumber: "+509 3788-9900",
    businessHours: "Lendi rive Dimanch: 7:00 AM - 11:00 PM (24/7 pou rechaj otomatik)",
    tone: "amikal_pwofesyonel",
    alwaysMentionPseudo: true,
    servicesCatalog: `1. RECHAJ DIGICEL:\n- 1.5GB (1 Jou) = 75 HTG\n- 3.5GB (3 Jou) = 175 HTG\n- 8GB + Apèl (7 Jou) = 350 HTG\n- 25GB (30 Jou) = 1,250 HTG\n2. RECHAJ NATCOM:\n- 2GB (1 Jou) = 60 HTG\n- 10GB (7 Jou) = 300 HTG\n- 30GB (30 Jou) = 1,000 HTG\n3. MONCASH & NATCASH: Transfè 24/7 sou +509 3788-9900`,
    autoReplyGlobal: true,
    typingDelayMs: 800,
  });
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [sentimentQuickFilter, setSentimentQuickFilter] = useState<string | null>(null);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          if (!selectedConvId && data.conversations.length > 0) {
            setSelectedConvId(data.conversations[0].id);
          }
        }
      }
    } catch (err) {
      // Resilient fallback when dev server is restarting or initializing
    }
  }, [selectedConvId]);

  // Fetch WhatsApp status
  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setWhatsappStatus(data);
        }
      }
    } catch (err) {
      // Resilient fallback
    }
  }, []);

  // Fetch bot config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        if (data && data.businessName) {
          setBotConfig(data);
        }
      }
    } catch (err) {
      // Resilient fallback
    }
  }, []);

  // Fetch System Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      // Resilient fallback
    }
  }, []);

  // Clear Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch("/api/logs/clear", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchWhatsAppStatus();
    fetchConfig();
    fetchLogs();

    // Live polling for real-time messages & logs
    const interval = setInterval(() => {
      fetchConversations();
      fetchLogs();
      fetchWhatsAppStatus();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchConversations, fetchWhatsAppStatus, fetchConfig, fetchLogs]);

  // Send message as a customer (from Simulator or New Chat)
  const handleIncomingMessage = async (data: {
    clientNumber: string;
    clientPseudo: string;
    messageText: string;
    simulateNewUser: boolean;
  }) => {
    const res = await fetch("/api/conversations/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    await fetchConversations();
    if (result.conversation) {
      setSelectedConvId(result.conversation.id);
    }
    return result;
  };

  // Send manual agent message
  const handleSendManualMessage = async (conversationId: string, text: string) => {
    const res = await fetch("/api/conversations/send-manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, text }),
    });
    if (res.ok) {
      await fetchConversations();
    }
  };

  // Toggle Auto-reply for single conversation
  const handleToggleAutoReply = async (conversationId: string) => {
    const res = await fetch("/api/conversations/toggle-autoreply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    if (res.ok) {
      await fetchConversations();
    }
  };

  // Toggle global auto-reply
  const handleToggleAutoReplyGlobal = async () => {
    const newGlobal = !botConfig.autoReplyGlobal;
    const updated = { ...botConfig, autoReplyGlobal: newGlobal };
    setBotConfig(updated);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  // Mark as read
  const handleMarkAsRead = async (conversationId: string) => {
    await fetch("/api/conversations/mark-read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId }),
    });
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Broadcast
  const handleBroadcast = async (messageText: string, targetFilter: string) => {
    const res = await fetch("/api/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageText, targetFilter }),
    });
    const result = await res.json();
    await fetchConversations();
    return result;
  };

  // Connect WhatsApp QR
  const handleConnectWhatsApp = async (phoneNumber: string) => {
    const res = await fetch("/api/whatsapp/connect-simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    const data = await res.json();
    if (data.status) {
      setWhatsappStatus(data.status);
    }
  };

  // Disconnect WhatsApp
  const handleDisconnectWhatsApp = async () => {
    const res = await fetch("/api/whatsapp/disconnect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (data.status) {
      setWhatsappStatus(data.status);
    }
  };

  // Save Bot Config
  const handleSaveConfig = async (updated: BotConfig) => {
    setBotConfig(updated);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  // Generate Gemini AI Draft on demand for manual agent
  const handleGenerateAiDraft = async (conversationId: string): Promise<string | null> => {
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) return null;

    const lastClientMsg = [...conv.messages].reverse().find((m) => m.sender === "client");
    const textPrompt = lastClientMsg ? lastClientMsg.text : "Bonjou, m bezwen enfòmasyon.";

    const res = await fetch("/api/conversations/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientNumber: conv.clientNumber,
        clientPseudo: conv.clientPseudo,
        messageText: textPrompt,
        simulateNewUser: false,
      }),
    });

    const data = await res.json();
    if (data.botMessage?.text) {
      return data.botMessage.text;
    }
    return null;
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <div id="app-root-container" className="flex h-screen w-full bg-[#F0F2F5] font-sans text-gray-800 antialiased overflow-hidden">
      {/* Sleek Dark Teal Left Sidebar Nav */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        whatsappStatus={whatsappStatus}
        unreadTotal={totalUnread}
        autoReplyGlobal={botConfig.autoReplyGlobal}
        onToggleAutoReplyGlobal={handleToggleAutoReplyGlobal}
        onOpenQR={() => setActiveTab("qr")}
      />

      {/* Main Viewport Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {activeTab === "dashboard" && (
          <LiveChatDashboard
            conversations={conversations}
            selectedId={selectedConvId}
            onSelectConversation={(id) => setSelectedConvId(id)}
            onSendManualMessage={handleSendManualMessage}
            onToggleAutoReply={handleToggleAutoReply}
            onMarkAsRead={handleMarkAsRead}
            onOpenNewChat={() => setIsNewChatModalOpen(true)}
            botConfig={botConfig}
            onGenerateAiDraft={handleGenerateAiDraft}
            onOpenQR={() => setActiveTab("qr")}
          />
        )}

        {activeTab === "simulator" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F2F5]">
            <SimulatorSidebar onSendMessage={handleIncomingMessage} />
          </div>
        )}

        {activeTab === "broadcast" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F2F5]">
            <BroadcastHub
              conversations={conversations}
              onBroadcast={handleBroadcast}
              onGoToConversations={() => setActiveTab("dashboard")}
            />
          </div>
        )}

        {activeTab === "qr" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F2F5]">
            <WhatsAppQRScanner
              status={whatsappStatus}
              onConnect={handleConnectWhatsApp}
              onDisconnect={handleDisconnectWhatsApp}
              onGoToDashboard={() => setActiveTab("dashboard")}
              logs={logs}
              onClearLogs={handleClearLogs}
              onRefreshLogs={fetchLogs}
              onSendTestMessage={async (text, pseudo) => {
                return handleIncomingMessage({
                  clientNumber: "+509 3788-9900",
                  clientPseudo: pseudo || "Kliyan",
                  messageText: text,
                  simulateNewUser: false,
                });
              }}
            />
          </div>
        )}

        {activeTab === "logs" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F2F5]">
            <LiveLogViewer
              logs={logs}
              onClearLogs={handleClearLogs}
              onRefreshLogs={fetchLogs}
              onSendTestMessage={async (text, pseudo) => {
                return handleIncomingMessage({
                  clientNumber: "+509 3788-9900",
                  clientPseudo: pseudo || "Kliyan",
                  messageText: text,
                  simulateNewUser: false,
                });
              }}
            />
          </div>
        )}

        {activeTab === "config" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F0F2F5]">
            <BotConfigPanel config={botConfig} onSaveConfig={handleSaveConfig} />
          </div>
        )}
      </div>

      {/* New Direct Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onSubmit={handleIncomingMessage}
      />
    </div>
  );
}
