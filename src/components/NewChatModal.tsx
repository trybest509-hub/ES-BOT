import React, { useState } from "react";
import { X, Send, User, Phone, Sparkles } from "lucide-react";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    clientNumber: string;
    clientPseudo: string;
    messageText: string;
    simulateNewUser: boolean;
  }) => Promise<void>;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [clientPseudo, setClientPseudo] = useState("");
  const [clientNumber, setClientNumber] = useState("+509 ");
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNumber.trim() || !messageText.trim()) return;

    setIsSending(true);
    try {
      await onSubmit({
        clientNumber: clientNumber.trim(),
        clientPseudo: clientPseudo.trim() || "Kliyan",
        messageText: messageText.trim(),
        simulateNewUser: true,
      });
      onClose();
      setClientPseudo("");
      setClientNumber("+509 ");
      setMessageText("");
    } catch (err) {
      console.error("New chat error:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Kòmanse Nouvo Konvèsasyon WhatsApp</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pseudo oswa Non Kliyan an:
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={clientPseudo}
                onChange={(e) => setClientPseudo(e.target.value)}
                placeholder="e.g. Mackenson oswa Sarah"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nimewo WhatsApp (+509...):
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={clientNumber}
                onChange={(e) => setClientNumber(e.target.value)}
                placeholder="+509 3788-9900"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Premye Mesaj Kliyan an voye:
            </label>
            <textarea
              required
              rows={3}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="e.g. Bonjou mwen se [Pseudo], kijan m ka achte yon plan Digicel?"
              className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Anile
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? "Ap kreye..." : "Kòmanse Chat & Trete ak AI"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
