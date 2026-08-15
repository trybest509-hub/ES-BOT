import React, { useState } from "react";
import { Settings, Save, Sparkles, CheckCircle2, Phone, Clock, MessageSquare, BookOpen, Shield } from "lucide-react";
import { BotConfig } from "../types";

interface BotConfigPanelProps {
  config: BotConfig;
  onSaveConfig: (updated: BotConfig) => Promise<void>;
}

export const BotConfigPanel: React.FC<BotConfigPanelProps> = ({ config, onSaveConfig }) => {
  const [formData, setFormData] = useState<BotConfig>({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveConfig(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Save config error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="bot-config-container" className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Settings className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Paramèt & Konesans ES TOPUP</h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
                  Konfigire kijan Gemini AI ap reponn kliyan yo, tarif ofisyèl yo, ak nimewo peman yo.
                </p>
              </div>
            </div>

            <button
              id="btn-save-bot-config-top"
              type="submit"
              disabled={isSaving}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow transition"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Ap anrejistre..." : "Anrejistre Modifikasyon"}</span>
            </button>
          </div>
        </div>

        {/* Content Form */}
        <div className="p-6 sm:p-8 space-y-6">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl p-4 flex items-center gap-3 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Paramèt yo ak konesans ES TOPUP la anrejistre avèk siksè nan AI la!</span>
            </div>
          )}

          {/* Section 1: Business Identity & Welcome Message */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>1. Idantite & Mesaj Byenvini Nouvo Moun</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Non Biznis la:
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tòn Repons AI la:
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="amikal_pwofesyonel">Amikal & Pwofesyonèl (Rekòmande)</option>
                  <option value="trè_amikal">Trè Amikal & Cho</option>
                  <option value="fòmel">Fòmel & Ransèyman</option>
                  <option value="kout_dirèk">Kout & Dirèk</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Modèl Mesaj Byenvini (Pou yon nouvo moun ki ekri):
              </label>
              <textarea
                rows={3}
                value={formData.welcomeTemplate}
                onChange={(e) => setFormData({ ...formData, welcomeTemplate: e.target.value })}
                className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Itilize baliz <strong>[PSEUDO]</strong> pou AI la mansyone non moun nan.
              </p>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Payment & Support Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>2. Kont Peman & Èdtan Sèvis</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nimewo MonCash Ofisyèl:
                </label>
                <input
                  type="text"
                  value={formData.moncashNumber}
                  onChange={(e) => setFormData({ ...formData, moncashNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nimewo Natcash Ofisyèl:
                </label>
                <input
                  type="text"
                  value={formData.natcashNumber}
                  onChange={(e) => setFormData({ ...formData, natcashNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Èdtan Ouvèti & Sèvis:
                </label>
                <input
                  type="text"
                  value={formData.businessHours}
                  onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nimewo Sipò Kliyan / Apèl Dirèk:
                </label>
                <input
                  type="text"
                  value={formData.customerCareNumber}
                  onChange={(e) => setFormData({ ...formData, customerCareNumber: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Services Catalog / Knowledge Base */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>3. Katalòg Sèvis & Tarif (Baz Konesans AI)</span>
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 3.7 Li Sa A
              </span>
            </div>

            <textarea
              rows={8}
              value={formData.servicesCatalog}
              onChange={(e) => setFormData({ ...formData, servicesCatalog: e.target.value })}
              placeholder="Mete tout plan Digicel, Natcom, pri, ak règ biznis ou yo isit la..."
              className="w-full p-3.5 text-xs sm:text-sm font-mono border border-slate-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed bg-slate-50/50"
            />
          </div>

          <hr className="border-slate-200" />

          {/* Section 4: Rules & AI Personalization Checkboxes */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>4. Règleman Pèsonalizasyon & Otomatizasyon</span>
            </h2>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.alwaysMentionPseudo}
                  onChange={(e) => setFormData({ ...formData, alwaysMentionPseudo: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-semibold">
                  Toujou mansyone pseudo kliyan an nan chak repons pou fè l pèsonalize (OBLIGATWA)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoReplyGlobal}
                  onChange={(e) => setFormData({ ...formData, autoReplyGlobal: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-semibold">
                  Aktive Repons Otomatik Gemini AI pou tout nouvo mesaj kap rantre
                </span>
              </label>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 flex justify-end">
            <button
              id="btn-save-bot-config-bottom"
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? "Ap anrejistre..." : "Anrejistre Tout Paramèt Yo"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
