import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  QrCode,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  Zap,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Camera,
  Bot,
  MessageSquare,
  Sparkles,
  KeyRound,
  Download,
  Terminal,
  Send,
  Eye,
} from "lucide-react";
import { WhatsAppStatus, SystemLog } from "../types";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface WhatsAppQRScannerProps {
  status: WhatsAppStatus;
  onConnect: (phoneNumber: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
  onGoToDashboard: () => void;
  logs?: SystemLog[];
  onClearLogs?: () => Promise<void>;
  onRefreshLogs?: () => Promise<void>;
  onSendTestMessage?: (text: string, pseudo?: string) => Promise<any>;
}

export const WhatsAppQRScanner: React.FC<WhatsAppQRScannerProps> = ({
  status,
  onConnect,
  onDisconnect,
  onGoToDashboard,
  logs = [],
  onClearLogs,
  onRefreshLogs,
  onSendTestMessage,
}) => {
  const [phoneNumberInput, setPhoneNumberInput] = useState("+509 3788-9900");
  const [isScanning, setIsScanning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [qrType, setQrType] = useState<"direct_chat" | "web_pairing">("direct_chat");
  const [pairingCode, setPairingCode] = useState("ES50-9900");
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(true);

  // Quick test message inputs
  const [quickMsgText, setQuickMsgText] = useState("Bonswa, mwen vle achte plan 8GB 7 jou a pou Digicel");
  const [quickPseudo, setQuickPseudo] = useState("Jean-Robert");
  const [isSendingQuick, setIsSendingQuick] = useState(false);

  // Clean phone number for WhatsApp link
  const cleanPhone = phoneNumberInput.replace(/[^0-9]/g, "") || "50937889900";
  const defaultPreFilledMsg = encodeURIComponent(
    "Bonjou ES TOPUP! Mwen se yon nouvo kliyan, mwen bezwen enfòmasyon sou plan rechaj Digicel ak Natcom yo."
  );

  // The actual scannable QR content
  const qrDirectLink = `https://wa.me/${cleanPhone}?text=${defaultPreFilledMsg}`;
  const qrWebPairingPayload = `2@${Date.now()},${status.qrCodeSeed || "es_auth_key_live"},${cleanPhone},ES_TOPUP_AI_BOT`;

  const currentQrValue = qrType === "direct_chat" ? qrDirectLink : qrWebPairingPayload;

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          setPairingCode(`ES50-${randomSuffix}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateScan = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      await onConnect(phoneNumberInput);
      setIsScanning(false);
    }, 1000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrDirectLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pairingCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendQuickTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickMsgText.trim() || isSendingQuick || !onSendTestMessage) return;
    setIsSendingQuick(true);
    try {
      await onSendTestMessage(quickMsgText, quickPseudo);
      setQuickMsgText("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingQuick(false);
    }
  };

  return (
    <div id="whatsapp-qr-container" className="max-w-6xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#075E54] p-6 sm:p-8 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider bg-white/20 px-3 py-1 rounded-full border border-white/30 flex items-center gap-1.5 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" /> WhatsApp Live Gateway & Eskanè QR
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-white tracking-tight">
                Eskanè Kòd QR & Koneksyon WhatsApp ES TOPUP
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Eskane kòd QR ki parèt sou ekran an pou lye nimewo biznis la. Bot Gemini 3.7 la ap koute, reponn kliyan yo an Kreyòl, epi anrejistre tout log ak mesaj an tan reyèl.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-inner ${
                  status.connected
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-400/40"
                    : "bg-amber-950/80 text-amber-300 border border-amber-400/40"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    status.connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400 animate-ping"
                  }`}
                />
                {status.connected ? "Sesyon WhatsApp Lye & Aktif" : "Kòd QR Pare Pou Eskane"}
              </div>
            </div>
          </div>
        </div>

        {/* Main QR Presentation Box (Always Visible On Screen) */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Instructions & Controls */}
            <div className="lg:col-span-7 space-y-5">
              {/* Connected Status Alert if connected */}
              {status.connected && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">WhatsApp Lye avèk Siksè</h4>
                      <p className="text-xs text-emerald-800">
                        Nimewo: <span className="font-mono font-semibold">{status.phoneNumber || "+509 3788-9900"}</span> • Bot Gemini 3.7 ap reponn otomatikman.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  >
                    Dekonekte / Re-eskane
                  </button>
                </div>
              )}

              {/* Mode Tabs */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setQrType("direct_chat")}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    qrType === "direct_chat"
                      ? "bg-white text-[#075E54] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>1. Eskane ak Kamera Telefòn (wa.me)</span>
                </button>
                <button
                  onClick={() => setQrType("web_pairing")}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    qrType === "web_pairing"
                      ? "bg-white text-[#075E54] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>2. Kòd WhatsApp Web (8 Chif)</span>
                </button>
              </div>

              {/* Step By Step Instructions */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-800">
                  {qrType === "direct_chat"
                    ? "Etap fasil pou w eskane kòd la:"
                    : "Lye WhatsApp Web avèk Kòd Pairing:"}
                </h3>

                {qrType === "direct_chat" ? (
                  <ol className="space-y-2.5 text-slate-700 text-xs sm:text-sm">
                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <span className="w-6 h-6 rounded-full bg-[#075E54] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">Pran telefòn ou epi louvri Kamera oswa WhatsApp</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Lonje kamera a dirèkteman sou gwo kòd QR vèt ki sou bò dwat la.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <span className="w-6 h-6 rounded-full bg-[#075E54] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">Klike sou lyen WhatsApp ki parèt la</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Sa ap louvri konvèsasyon an sou nimewo biznis <strong>{phoneNumberInput}</strong>.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <span className="w-6 h-6 rounded-full bg-[#075E54] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">Voye mesaj la & Gade kijan Bot la ap reponn</p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          Gemini 3.7 ap detekte pseudo w epi ba w tout plan Digicel/Natcom yo otomatikman nan log anba a!
                        </p>
                      </div>
                    </li>
                  </ol>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Sou WhatsApp telefòn ou: Ale nan <strong>Meni (⋮) &gt; Aparèy Lyen &gt; Lyen avèk nimewo telefòn</strong>, epi antre kòd 8 chif sa a:
                    </p>

                    <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl flex items-center justify-between font-mono font-bold text-xl tracking-widest border border-emerald-500/30">
                      <span>{pairingCode}</span>
                      <button
                        onClick={handleCopyCode}
                        className="text-xs font-sans px-3 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? "Kopye!" : "Kopye Kòd"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Number Configuration */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nimewo WhatsApp ES TOPUP:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-business-phone"
                    type="text"
                    value={phoneNumberInput}
                    onChange={(e) => setPhoneNumberInput(e.target.value)}
                    placeholder="+509 3788-9900"
                    className="px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#075E54] focus:outline-none w-full max-w-xs font-mono font-semibold"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copiedLink ? "Kopye!" : "Kopye Lyen"}</span>
                  </button>
                </div>
              </div>

              {/* Direct Open Link */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Zap className="w-4 h-4 text-[#075E54] shrink-0" />
                  <p className="text-xs text-emerald-900 truncate">
                    Lyen Dirèk WhatsApp: <span className="font-mono font-medium">{qrDirectLink}</span>
                  </p>
                </div>
                <a
                  href={qrDirectLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#075E54] hover:bg-[#128C7E] text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
                >
                  <span>Louvri Sou WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right QR Code Display (Real High-Res ISO Code) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-50 border-2 border-dashed border-[#128C7E]/40 rounded-3xl">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#075E54] bg-emerald-100 px-3.5 py-1 rounded-full">
                  Kòd QR WhatsApp Otantik (Eskanè Dirèk)
                </span>
              </div>

              {/* Scannable Real QR Code Container */}
              <div className="relative group">
                <QRCodeDisplay value={currentQrValue} size={260} showLogo />

                {isScanning && (
                  <div className="absolute inset-0 bg-[#075E54]/90 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 text-center">
                    <RefreshCw className="w-10 h-10 animate-spin text-emerald-300 mb-2" />
                    <span className="text-xs font-bold tracking-wide">
                      Ap Lye Sesyon WhatsApp ES TOPUP...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mt-3 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#075E54]" />
                <span>Kòd la ap renouvle nan {secondsLeft}s</span>
              </div>

              {/* Confirm Scan & Link Button */}
              <div className="w-full mt-4 space-y-2">
                <button
                  id="btn-scan-qr-now"
                  disabled={isScanning}
                  onClick={handleSimulateScan}
                  className="w-full py-3 px-4 bg-[#075E54] hover:bg-[#128C7E] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  <span>{isScanning ? "Otantifikasyon an kour..." : "Klike Pou Konfime Eskanè QR la"}</span>
                </button>

                <button
                  onClick={onGoToDashboard}
                  className="w-full py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Ale nan Tablodbò Chat Live la</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Logs & Message Transaction Inspector Integrated Directly */}
        <div className="p-6 sm:p-8 bg-slate-950 text-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Kontwòl Log & Tranzaksyon Mesaj Live (Mesaj Kliyan & Repons Bot)
              </h3>
              <span className="text-[11px] font-mono bg-emerald-950 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-600/40">
                {logs.length} Evènman
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {onRefreshLogs && (
                <button
                  onClick={onRefreshLogs}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Rafrechi Log</span>
                </button>
              )}
              {onClearLogs && (
                <button
                  onClick={onClearLogs}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-400 rounded-xl transition cursor-pointer"
                >
                  Efase Log
                </button>
              )}
            </div>
          </div>

          {/* Log Stream Box */}
          <div className="h-64 overflow-y-auto font-mono text-xs space-y-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800 scrollbar-thin scrollbar-thumb-slate-800">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-1">
                <Terminal className="w-6 h-6 text-slate-700" />
                <p>Pa gen okenn log anrejistre pou kounye a.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.level === "ai"
                            ? "bg-teal-900 text-teal-300"
                            : log.level === "success"
                            ? "bg-emerald-900 text-emerald-300"
                            : log.level === "warning"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-slate-400 text-[10px]">[{log.category}]</span>
                      <span className="text-slate-200 font-bold text-[11px]">{log.title}</span>
                    </div>
                  </div>
                  <p className="text-slate-300 font-sans text-xs pl-2 border-l-2 border-slate-700">
                    {log.message}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Quick Message Test Input inside Log Section */}
          {onSendTestMessage && (
            <div className="mt-4 space-y-2.5">
              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Tès Kòmand:</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("*menu*");
                  }}
                  className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>*menu*</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("1");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  1. Followers
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("2");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  2. Dyaman Free Fire
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("3");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  3. Nimewo USA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("4");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  4. USDT Crypto
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("5");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  5. Rechaj Meru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMsgText("6");
                  }}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg transition cursor-pointer"
                >
                  6. Ajan / Estati
                </button>
              </div>

              <form onSubmit={handleSendQuickTest} className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={quickPseudo}
                  onChange={(e) => setQuickPseudo(e.target.value)}
                  placeholder="Pseudo (egz. Mackenson)"
                  className="w-full sm:w-44 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                />
                <input
                  type="text"
                  value={quickMsgText}
                  onChange={(e) => setQuickMsgText(e.target.value)}
                  placeholder="Tape *menu* oswa yon kesyon..."
                  className="w-full flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!quickMsgText.trim() || isSendingQuick}
                  className="w-full sm:w-auto px-4 py-2 bg-[#075E54] hover:bg-[#128C7E] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                >
                  {isSendingQuick ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{isSendingQuick ? "Ap Voye..." : "Teste Repons Bot"}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
