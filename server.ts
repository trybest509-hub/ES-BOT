import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  baileysState,
  initBaileysSocket,
  registerBaileysCallbacks,
  sendWhatsAppMessageViaBaileys,
} from "./src/lib/baileys-bridge.js";

dotenv.config();

// Shared Gemini client with lazy initialization and telemetry header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (err) {
      console.warn("Gemini client init warning:", err);
    }
  }
  return aiClient;
}

interface Message {
  id: string;
  sender: "client" | "bot" | "agent";
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "read";
  sentiment?: "pozitif" | "net" | "frustre" | "konfizyon" | "ijans" | "rekonesan";
  sentimentScore?: number; // -1 to 1
  detectedPseudo?: string;
  intent?: string;
}

interface Conversation {
  id: string;
  clientNumber: string;
  clientPseudo: string;
  avatarUrl?: string;
  isNewClient: boolean;
  autoReplyEnabled: boolean;
  lastMessageTimestamp: number;
  unreadCount: number;
  sentimentSummary: "pozitif" | "net" | "frustre" | "konfizyon" | "ijans" | "rekonesan";
  sentimentScore: number;
  lastIntent: string;
  messages: Message[];
}

interface BotConfig {
  businessName: string;
  welcomeTemplate: string;
  moncashNumber: string;
  natcashNumber: string;
  customerCareNumber: string;
  businessHours: string;
  tone: "amikal_pwofesyonel" | "trè_amikal" | "fòmel" | "kout_dirèk";
  alwaysMentionPseudo: boolean;
  servicesCatalog: string;
  autoReplyGlobal: boolean;
  typingDelayMs: number;
}

export interface SystemLog {
  id: string;
  timestamp: number;
  level: "info" | "success" | "warning" | "ai" | "error";
  category: "WHATSAPP" | "GEMINI_AI" | "SENTIMENT" | "SYSTEM" | "WEBHOOK";
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

const systemLogs: SystemLog[] = [
  {
    id: "log-init-1",
    timestamp: Date.now() - 15000,
    level: "success",
    category: "SYSTEM",
    title: "Sèvè ES TOPUP Demare",
    message: "Sistèm WhatsApp AI Bot ak Gemini 3.7 pare sou pò 3000.",
  },
  {
    id: "log-init-2",
    timestamp: Date.now() - 10000,
    level: "ai",
    category: "GEMINI_AI",
    title: "Modèl Gemini 3.7 Flash Inisyalize",
    message: "Katalòg Digicel, Natcom ak MonCash chaje pou repons Kreyòl pèsonalize.",
  },
  {
    id: "log-init-3",
    timestamp: Date.now() - 5000,
    level: "info",
    category: "WHATSAPP",
    title: "Eskanè QR Pare",
    message: "Kòd QR WhatsApp afiche sou ekran an pou lye nimewo ak resevwa mesaj kliyan.",
  },
];

function addLog(
  level: SystemLog["level"],
  category: SystemLog["category"],
  title: string,
  message: string,
  metadata?: Record<string, any>
) {
  const logItem: SystemLog = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    timestamp: Date.now(),
    level,
    category,
    title,
    message,
    metadata,
  };
  systemLogs.unshift(logItem);
  if (systemLogs.length > 200) {
    systemLogs.pop();
  }
  return logItem;
}

// Initial in-memory data store for ES TOPUP / esrecharge.com
let botConfig: BotConfig = {
  businessName: "ES TOPUP (esrecharge.com)",
  welcomeTemplate: "Bonswa / Bonjou [PSEUDO]! Mwen se asistan vityèl ES TOPUP (esrecharge.com) ki la pou ede w ak tout sèvis nou yo: Followers rezo sosyal, Dyaman Free Fire, Nimewo Entènasyonal vityèl, Rechaj USDT, ak Rechaj Meru. Kòman mwen ka ede w jodi a?",
  moncashNumber: "+509 3788-9900 (Non: ES TOPUP / esrecharge.com)",
  natcashNumber: "+509 4422-3344 (Non: ES TOPUP Sèvis)",
  customerCareNumber: "+509 3788-9900",
  businessHours: "Sèvis Disponib 24/7 sou sit web esrecharge.com ak sou WhatsApp",
  tone: "amikal_pwofesyonel",
  alwaysMentionPseudo: true,
  servicesCatalog: `
👑 SIT WEB OFISYÈL: esrecharge.com

SERVIS OFISYÈL ES RECHARGE:
1. 👥 FOLLOWERS & BOOM REZO SOSYAL:
   - Followers, Likes, Views pou TikTok, Instagram, Facebook, YouTube, Telegram.
   - Livrezon rapid ak garanti san pèt.
   - Pake kòmanse depi 1,000 followers jiska 100,000+ followers.

2. 💎 DYAMAN FREE FIRE (DIRECT PLAYER ID):
   - Rechaj Dyaman Free Fire dirèkteman sou ID jwè ou (UID).
   - Livrezon nan 30 segonn:
     • 100 + 10 Dyaman Bonus
     • 310 + 31 Dyaman Bonus
     • 520 + 52 Dyaman Bonus
     • 1,060 + 106 Dyaman Bonus
     • 2,180 + 218 Dyaman Bonus
     • Kat Semèn / Kat Mwa (Weekly & Monthly Membership)

3. 🌍 NIMEWO ENTÈNASYONAL VITYÈL (SMS ACTIVATION):
   - Nimewo vityèl pou verifye WhatsApp, Telegram, TikTok, PayPal, Google, ChatGPT, elatriye.
   - Peyi disponib: USA (+1), Canada (+1), France (+33), UK (+44), Chili (+56), Brezil (+55), ak 50+ lòt peyi.
   - Resevwa kòd SMS imedyatman.

4. 💵 RECHAJ USDT (CRYPTO TRC20 / BEP20):
   - Acha ak Vann USDT dirèkteman an Goud (HTG) oswa Dola (USD).
   - Peman pa MonCash, Natcash, oswa Transfè Bankè.
   - Livrezon USDT sou adrès Crypto ou (TRC20, BEP20, Polygon) nan kèk minit.

5. ⚡ RECHAJ MERU (MERU TOPUP & WALLET):
   - Rechaj kont ak balans Meru an tan reyèl.
   - Peman rapid ak to ki pi ba sou mache a.

💳 METÒD PEMAN AKSEPTAB SOU ESRECHARGE.COM:
- MonCash: +509 3788-9900
- Natcash: +509 4422-3344
- USDT (TRC20 / BEP20)
- Kat Kredi / Debi sou sit web la: esrecharge.com
`,
  autoReplyGlobal: true,
  typingDelayMs: 800,
};

let qrStatus: {
  connected: boolean;
  phoneNumber?: string;
  deviceBattery?: number;
  lastConnectedAt?: number;
  qrCodeSeed: string;
} = {
  connected: false,
  phoneNumber: undefined,
  deviceBattery: 94,
  lastConnectedAt: undefined,
  qrCodeSeed: "es_topup_auth_token_live_session_509",
};

// Seed initial realistic conversations
let conversations: Conversation[] = [
  {
    id: "conv-1",
    clientNumber: "+509 3612-4455",
    clientPseudo: "Mackenson",
    isNewClient: false,
    autoReplyEnabled: true,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 12,
    unreadCount: 0,
    sentimentSummary: "pozitif",
    sentimentScore: 0.85,
    lastIntent: "rechaj_digicel",
    messages: [
      {
        id: "m-101",
        sender: "client",
        text: "Bonswa, mwen se Mackenson. Mwen ta renmen konnen ki plan data 7 jou ou genyen pou Digicel?",
        timestamp: Date.now() - 1000 * 60 * 15,
        status: "read",
        sentiment: "pozitif",
        sentimentScore: 0.6,
        detectedPseudo: "Mackenson",
        intent: "rechaj_digicel",
      },
      {
        id: "m-102",
        sender: "bot",
        text: "Bonswa Mackenson! Mwen se asistan vityèl ES TOPUP. Pou Digicel 7 jou a, nou gen bèl plan 8GB + Apèl la pou sèlman 350 HTG. Ou ka peye fasil pa MonCash sou 3788-9900. Èske ou ta renmen m pase lòd sa a pou ou kounye a Mackenson?",
        timestamp: Date.now() - 1000 * 60 * 14,
        status: "read",
        sentiment: "pozitif",
        sentimentScore: 0.9,
        detectedPseudo: "Mackenson",
      },
      {
        id: "m-103",
        sender: "client",
        text: "Wi mwen fèk voye 350 goud la sou MonCash la wi. Nimewo m se 3612-4455.",
        timestamp: Date.now() - 1000 * 60 * 12,
        status: "read",
        sentiment: "pozitif",
        sentimentScore: 0.85,
        detectedPseudo: "Mackenson",
        intent: "konfimasyon_peman",
      },
    ],
  },
  {
    id: "conv-2",
    clientNumber: "+509 4899-2211",
    clientPseudo: "Sarah",
    isNewClient: false,
    autoReplyEnabled: true,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 35,
    unreadCount: 1,
    sentimentSummary: "frustre",
    sentimentScore: -0.65,
    lastIntent: "pwoblèm_tranzaksyon",
    messages: [
      {
        id: "m-201",
        sender: "client",
        text: "Bonjou, m rele Sarah. Sa fè 15 minit mwen voye 500 goud pou rechaj Natcom mwen an epi m poko wè mesaj la tonbe sou telefòn mwen!",
        timestamp: Date.now() - 1000 * 60 * 35,
        status: "delivered",
        sentiment: "frustre",
        sentimentScore: -0.7,
        detectedPseudo: "Sarah",
        intent: "pwoblèm_tranzaksyon",
      },
      {
        id: "m-202",
        sender: "bot",
        text: "Bonjou Sarah! Mwen vrèman eskize m pou ti reta sa a. Pa enkyete w ditou Sarah, lajan w an sekirite avèk ES TOPUP. Tanpri voye referans SMS MonCash oswa Natcash ou te resevwa a pou m ka verifye epi livre rechaj Natcom ou a touswit!",
        timestamp: Date.now() - 1000 * 60 * 34,
        status: "read",
        sentiment: "frustre",
        sentimentScore: 0.2,
        detectedPseudo: "Sarah",
      },
    ],
  },
  {
    id: "conv-3",
    clientNumber: "+509 3100-7788",
    clientPseudo: "Jean_Paul",
    isNewClient: true,
    autoReplyEnabled: true,
    lastMessageTimestamp: Date.now() - 1000 * 60 * 65,
    unreadCount: 0,
    sentimentSummary: "rekonesan",
    sentimentScore: 0.95,
    lastIntent: "salitasyon",
    messages: [
      {
        id: "m-301",
        sender: "client",
        text: "Alo bonswa, m se Jean_Paul, mwen se yon nouvo kliyan. Kijan sistèm rechaj nou an mache?",
        timestamp: Date.now() - 1000 * 60 * 70,
        status: "read",
        sentiment: "pozitif",
        sentimentScore: 0.5,
        detectedPseudo: "Jean_Paul",
        intent: "salitasyon",
      },
      {
        id: "m-302",
        sender: "bot",
        text: "Bonswa Jean_Paul! Byenvini nan fanmi ES TOPUP! Mwen se asistan vityèl ES TOPUP ki la pou ede w ak nenpòt enfòmasyon. Kijan mwen ka ede w jodi a Jean_Paul? Nou fè rechaj Digicel, Natcom, transfè MonCash, ak plan entènèt rapidman.",
        timestamp: Date.now() - 1000 * 60 * 68,
        status: "read",
        sentiment: "pozitif",
        sentimentScore: 0.9,
        detectedPseudo: "Jean_Paul",
      },
      {
        id: "m-303",
        sender: "client",
        text: "Mèsi anpil asistan ES TOPUP, sèvis nou an vrèman rapid e klè!",
        timestamp: Date.now() - 1000 * 60 * 65,
        status: "read",
        sentiment: "rekonesan",
        sentimentScore: 0.95,
        detectedPseudo: "Jean_Paul",
        intent: "remer سیمan",
      },
    ],
  },
];

// Helper: AI generation logic with Gemini API
async function generateAiBotResponse(
  clientMessage: string,
  clientPseudo: string,
  clientNumber: string,
  isNewClient: boolean,
  conversationHistory: Message[]
) {
  const systemInstruction = `
Ou se asistan entèlijan ofisyèl WhatsApp pou sit web "${botConfig.businessName}" (Sit ofisyèl: esrecharge.com).
Biznis sa a PA vann GB/data Digicel/Natcom. Li ofri 5 sèvis prensipal sa yo:
1. Followers & Rezo Sosyal (TikTok, Instagram, Facebook, YouTube, Telegram)
2. Dyaman Free Fire (Livrezon rapid dirèkteman sou UID / ID jwè a)
3. Nimewo Entènasyonal Vityèl (USA, France, Chili, Brezil pou verifye WhatsApp/Telegram/PayPal)
4. Rechaj USDT (Crypto TRC20 / BEP20 an Goud oswa Dola)
5. Rechaj Meru (Balans & Topup Meru)

RÈG OBLIGATWA AK MENI INTERAKTIF:
1. GESTYON KÒMAND *MENU* OUBYEN SALITASYON:
   - Si kliyan an ekri "menu", "*menu*", "opsyon", "kòmanse", oswa yon premye salitasyon ("bonjou", "bonswa", "alo"):
     Ou DWE retounen MENI OFISYÈL esrecharge.com sa a avèk fòma WhatsApp:
     "🌟 *BYENVENI SOU ES RECHARGE (esrecharge.com)* 🌟\\nBonjou *${clientPseudo || "Chè Kliyan"}*! Mwen se asistan entèlijan WhatsApp ES RECHARGE.\\n\\nChwazi yon sèvis anba a (tape nimewo a oswa non sèvis la):\\n\\n1️⃣ *Followers & Rezo Sosyal* (TikTok, Instagram, Facebook, YouTube)\\n2️⃣ *Dyaman Free Fire* (Livrezon rapid sou UID)\\n3️⃣ *Nimewo Entènasyonal Vityèl* (USA, France, Chili... pou SMS)\\n4️⃣ *Rechaj USDT* (Crypto TRC20 / BEP20)\\n5️⃣ *Rechaj Meru* (Topup & Balans)\\n6️⃣ *Verifye Estati / Pale ak yon Ajan*\\n\\n💡 *Konsèy*: Tape yon chif (egz: *1*, *2*, *3*, *4*, *5*, *6*) oswa vizite sit nou an dirèkteman: *esrecharge.com*!"

2. GESTYON OPSYON CHIF YO (1 a 6):
   - Si kliyan an tape "1" oswa mansyone "Followers": Bay detay sou pake followers TikTok, Instagram, Facebook, YouTube, mande lyen kont lan ak peman pa MonCash (+509 3788-9900) oswa sou esrecharge.com.
   - Si kliyan an tape "2" oswa mansyone "Free Fire": Bay detay sou pake Dyaman yo (100, 310, 520, 1060, 2180 dyaman + bonis) epi mande ID jwè (UID) a pou livre l nan 30 segonn.
   - Si kliyan an tape "3" oswa mansyone "Nimewo Entènasyonal": Eksplike kijan nimewo USA (+1), France (+33), Chili (+56) yo fonksyone pou resevwa kòd SMS WhatsApp/Telegram/PayPal.
   - Si kliyan an tape "4" oswa mansyone "USDT": Bay to aktyèl la, nimewo MonCash/Natcash pou peye, epi mande adrès bous TRC20/BEP20 li.
   - Si kliyan an tape "5" oswa mansyone "Meru": Bay detay sou rechaj ak balans Meru.
   - Si kliyan an tape "6" oswa mande "Ajan / Verifye": Mande nimewo kòmand lan oswa konekte l ak sipò imèn nan.

3. PÈSONALIZASYON AK PSEUDO (TRÈ ENPÒTAN):
   - Ou dwe toujou sèvi ak pseudo "${clientPseudo || "Chè Kliyan"}" nan repons ou a.

4. ANALIZ SANTIMAN:
   - "pozitif", "net", "frustre", "konfizyon", "ijans", "rekonesan".

5. RETOUNEN JSON:
   - "replyText": Tèks repons WhatsApp la.
   - "sentiment": "pozitif" | "net" | "frustre" | "konfizyon" | "ijans" | "rekonesan"
   - "sentimentScore": ant -1.0 ak 1.0
   - "detectedPseudo": non oswa pseudo
   - "intent": "menu_prensipal" | "followers" | "free_fire" | "nimewo_entènasyonal" | "usdt_crypto" | "rechaj_meru" | "verifikasyon_estati" | "sipò_ajan" | "salitasyon" | "èd_jeneral"
   - "suggestedQuickReplies": 2-3 repons rapid (e.g. ["1. Followers", "2. Dyaman Free Fire", "3. Nimewo USA", "4. USDT", "5. Meru"])
`;

  const historyContext = conversationHistory
    .slice(-6)
    .map((m) => `${m.sender.toUpperCase()}: ${m.text}`)
    .join("\n");

  const promptText = `
ISTWA KONVÈSASYON RESAN:
${historyContext || "Pa gen istwa anvan."}

MESAJ AKTYÈL KLIYAN AN:
Nimewo: ${clientNumber}
Pseudo Enskri: ${clientPseudo}
Mesaj: "${clientMessage}"

Tanpri bay repons ofisyèl AI WhatsApp ES TOPUP la an fòma JSON.`;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Local intelligent response generator when Gemini API Key is not yet configured
      return getLocalFallbackResponse(clientMessage, clientPseudo, isNewClient);
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description: "Mesaj repons WhatsApp la ki gen meni an oswa repons detaye a.",
            },
            sentiment: {
              type: Type.STRING,
              description: "Santiman: pozitif, net, frustre, konfizyon, ijans, rekonesan",
            },
            sentimentScore: {
              type: Type.NUMBER,
              description: "Nòt santiman ant -1.0 ak 1.0",
            },
            detectedPseudo: {
              type: Type.STRING,
              description: "Non oswa pseudo moun nan",
            },
            intent: {
              type: Type.STRING,
              description: "Entansyon kliyan an",
            },
            suggestedQuickReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 oswa 3 bouton oswa sijesyon rapid",
            },
          },
          required: ["replyText", "sentiment", "sentimentScore", "detectedPseudo", "intent"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      replyText: parsed.replyText || getLocalFallbackResponse(clientMessage, clientPseudo, isNewClient).replyText,
      sentiment: parsed.sentiment || "net",
      sentimentScore: typeof parsed.sentimentScore === "number" ? parsed.sentimentScore : 0.5,
      detectedPseudo: parsed.detectedPseudo || clientPseudo || "Kliyan",
      intent: parsed.intent || "èd_jeneral",
      suggestedQuickReplies: parsed.suggestedQuickReplies || ["1. Plan Digicel", "2. Plan Natcom", "3. MonCash"],
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getLocalFallbackResponse(clientMessage, clientPseudo, isNewClient);
  }
}

// Local smart fallback generator in Creole with full Interactive Menu support for esrecharge.com
function getLocalFallbackResponse(clientMessage: string, clientPseudo: string, isNewClient: boolean) {
  const clean = clientMessage.trim().toLowerCase().replace(/[*_~`]/g, "");
  const name = clientPseudo && clientPseudo !== "Kliyan" ? clientPseudo : "Chè Kliyan";
  
  // 1. Check for "menu", "*menu*", greetings, or starting command
  if (
    clean === "menu" ||
    clean === "*menu*" ||
    clean.includes("meniu") ||
    clean.includes("opsyon") ||
    clean === "help" ||
    clean === "komanse" ||
    clean === "start" ||
    clean === "hi" ||
    clean === "bonjou" ||
    clean === "bonswa" ||
    clean === "alo" ||
    isNewClient
  ) {
    return {
      replyText: `🌟 *BYENVENI SOU ES RECHARGE (esrecharge.com)* 🌟\nBonjou *${name}*! Mwen se asistan entèlijan WhatsApp ES RECHARGE.\n\nChwazi yon sèvis anba a (tape nimewo a oswa non sèvis la):\n\n1️⃣ *Followers & Rezo Sosyal* (TikTok, Instagram, Facebook, YouTube)\n2️⃣ *Dyaman Free Fire* (Livrezon rapid sou UID)\n3️⃣ *Nimewo Entènasyonal Vityèl* (USA, France, Chili... pou SMS)\n4️⃣ *Rechaj USDT* (Crypto TRC20 / BEP20)\n5️⃣ *Rechaj Meru* (Topup & Balans)\n6️⃣ *Verifye Estati Kòmand / Pale ak yon Ajan*\n\n💡 *Konsèy*: Tape yon chif (egz: *1*, *2*, *3*, *4*, *5*, *6*) oswa vizite sit nou an dirèkteman: *esrecharge.com*!`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.9,
      detectedPseudo: name,
      intent: "menu_prensipal",
      suggestedQuickReplies: ["1. Followers", "2. Dyaman Free Fire", "3. Nimewo USA", "4. USDT", "5. Meru"],
    };
  }

  // 2. Option 1: Followers & Social Media
  if (clean === "1" || clean.includes("follower") || clean.includes("like") || clean.includes("view") || clean.includes("tiktok") || clean.includes("instagram") || clean.includes("facebook") || clean.includes("youtube")) {
    return {
      replyText: `👥 *FOLLOWERS & BOOM REZO SOSYAL (esrecharge.com)*\nBonjou *${name}*! Men sèvis rezo sosyal nou ofri yo:\n\n• *TikTok*: Followers, Likes, Views, Kòmantè\n• *Instagram*: Followers garanti san pèt, Likes, Story Views\n• *Facebook*: Followers Paj & Pwofil, Likes pòs\n• *YouTube*: Abonnés & Heures de visionnage\n• *Telegram*: Manb pou Gwoup & Chèn\n\n👉 *Kijan pou w kòmande*:\n1. Chwazi kantite w bezwen an (egz: 1,000 / 5,000 / 10,000 followers)\n2. Voye lyen pwofil ou a oswa ale sou sit la: *esrecharge.com*\n3. Peye sou MonCash: *+509 3788-9900*\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.85,
      detectedPseudo: name,
      intent: "followers",
      suggestedQuickReplies: ["1,000 Followers TikTok", "5,000 Followers IG", "Peye sou MonCash"],
    };
  }

  // 3. Option 2: Free Fire Diamonds
  if (clean === "2" || clean.includes("free fire") || clean.includes("dyaman") || clean.includes("diamond") || clean.includes("diaman") || clean.includes("ff") || clean.includes("uid")) {
    return {
      replyText: `💎 *DYAMAN FREE FIRE (LIVREZON SOU ID / UID)*\nBonjou *${name}*! Men pake Dyaman Free Fire ki disponib sou *esrecharge.com*:\n\n• *100 + 10 Dyaman* ➔ Livrezon imedyat\n• *310 + 31 Dyaman*\n• *520 + 52 Dyaman* (🔥 Pi Popilè)\n• *1,060 + 106 Dyaman*\n• *2,180 + 218 Dyaman*\n• *Kat Semèn (Weekly)* & *Kat Mwa (Monthly)*\n\n👉 *Kijan pou w achte l*:\n1. Voye *ID Jwè (UID)* ou a isit la\n2. Fè peman an sou MonCash/Natcash: *+509 3788-9900*\n3. Dyaman yo ap tonbe sou kont Free Fire ou a nan mwens pase 30 segonn!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.9,
      detectedPseudo: name,
      intent: "free_fire",
      suggestedQuickReplies: ["520 Dyaman", "Weekly Pass", "Voye ID Jwè"],
    };
  }

  // 4. Option 3: Virtual International Numbers (SMS Activation)
  if (clean === "3" || clean.includes("numero") || clean.includes("nimewo") || clean.includes("usa") || clean.includes("chili") || clean.includes("france") || clean.includes("sms") || clean.includes("virtual")) {
    return {
      replyText: `🌍 *NIMEWO ENTÈNASYONAL VITYÈL (SMS ACTIVATION)*\nBonjou *${name}*! Nou gen nimewo vityèl pou tout peyi pou resevwa kòd SMS:\n\n• 🇺🇸 *USA (+1)*: Pou verifye WhatsApp, Telegram, PayPal, TikTok, ChatGPT\n• 🇫🇷 *France (+33)*: Pou tout aplikasyon ak sèvis Ewopeyen\n• 🇨🇱 *Chili (+56)* & 🇧🇷 *Brezil (+55)*\n• 🇨🇦 *Canada (+1)* & 50+ lòt peyi\n\n👉 *Kijan li mache*:\n1. Chwazi peyi a ak aplikasyon ou vle verifye a\n2. Nou ba w nimewo a touswit, ou mete l nan app la\n3. Nou ba w kòd SMS la imedyatman pou w valide kont ou!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.85,
      detectedPseudo: name,
      intent: "nimewo_entènasyonal",
      suggestedQuickReplies: ["Nimewo USA WhatsApp", "Nimewo France", "Peye sou MonCash"],
    };
  }

  // 5. Option 4: USDT Crypto
  if (clean === "4" || clean.includes("usdt") || clean.includes("crypto") || clean.includes("trc20") || clean.includes("bep20") || clean.includes("binance")) {
    return {
      replyText: `💵 *RECHAJ & ACHTE USDT (CRYPTO TRC20 / BEP20)*\nBonjou *${name}*!\nSou *esrecharge.com*, ou ka achte oswa vann USDT fasil:\n\n• *Rezo sipòte*: TRC20 (Tron), BEP20 (BNB Smart Chain), Polygon\n• *Metòd Peman*: MonCash, Natcash, oswa Transfè Bankè\n• *Sekirite*: Livrezon rapid sou adrès bous ou nan mwens pase 5 minit\n\n👉 Tanpri voye kantite USDT ou vle a ak adrès bous ou a pou nou ba w to egzak la kounye a!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.85,
      detectedPseudo: name,
      intent: "usdt_crypto",
      suggestedQuickReplies: ["To USDT Jodi a", "Achte 50 USDT", "Vann USDT"],
    };
  }

  // 6. Option 5: Meru Recharge
  if (clean === "5" || clean.includes("meru") || clean.includes("recharge meru") || clean.includes("balans meru")) {
    return {
      replyText: `⚡ *RECHAJ MERU (TOPUP & BALANS)*\nBonjou *${name}*!\nNou fè rechaj kont Meru an tan reyèl avèk pi bon to sou mache a.\n\n👉 Tanpri voye nimewo oswa ID kont Meru ou a ak kantite ou ta renmen rechaje a.\nPeman akseptab pa MonCash & Natcash sou: *+509 3788-9900*.\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "pozitif" as const,
      sentimentScore: 0.8,
      detectedPseudo: name,
      intent: "rechaj_meru",
      suggestedQuickReplies: ["Rechaj Meru", "Nimewo Peman", "Pale ak Ajan"],
    };
  }

  // 7. Option 6: Status & Support Agent
  if (clean === "6" || clean.includes("estati") || clean.includes("verifye") || clean.includes("ajan") || clean.includes("sipò") || clean.includes("moun") || clean.includes("pwoblem")) {
    return {
      replyText: `🔍 *SIPÒ & VERIFIKASYON KÒMAND ES RECHARGE*\nBonjou *${name}*!\n\n• Si se yon verifikasyon kòmand: Tanpri voye *ID kòmand* oswa *referans MonCash/Natcash* ou a.\n• Si se yon èd espesyal: Mwen konekte w ak yon ajan imèn nan ekip teknik *esrecharge.com* kounye a!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`,
      sentiment: "net" as const,
      sentimentScore: 0.6,
      detectedPseudo: name,
      intent: "sipò_ajan",
      suggestedQuickReplies: ["Voye Referans", "Meni Prensipal", "Visite esrecharge.com"],
    };
  }

  // Fallback with friendly response guiding towards esrecharge.com
  return {
    replyText: `Bonjou *${name}*! Mwen resevwa mesaj ou a: "${clientMessage}".\n\nSou *esrecharge.com*, nou ofri:\n👥 Followers Rezo Sosyal (TikTok, IG, FB)\n💎 Dyaman Free Fire sou UID\n🌍 Nimewo Entènasyonal Vityèl (USA, France...)\n💵 Rechaj USDT Crypto\n⚡ Rechaj Meru\n\n👉 Tape *MENU* nenpòt lè pou wè tout opsyon yo oswa vizite sit nou an: *esrecharge.com*!`,
    sentiment: "net" as const,
    sentimentScore: 0.5,
    detectedPseudo: name,
    intent: "èd_jeneral",
    suggestedQuickReplies: ["*MENU*", "1. Followers", "2. Dyaman Free Fire", "3. Nimewo USA"],
  };
}

export async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "ES TOPUP WhatsApp AI Bot", timestamp: Date.now() });
  });

  // Register Baileys Real WhatsApp Web callbacks
  registerBaileysCallbacks({
    onQR: (qr) => {
      qrStatus.qrCodeSeed = qr;
      qrStatus.connected = false;
      addLog("info", "WHATSAPP", "Nouvo Kòd QR WhatsApp Web Pare", "WhatsApp voye yon nouvo kòd QR ofisyèl pou eskanè.");
    },
    onConnect: (connected, phone) => {
      qrStatus.connected = connected;
      if (connected && phone) {
        qrStatus.phoneNumber = phone;
        qrStatus.lastConnectedAt = Date.now();
        addLog("success", "WHATSAPP", "WhatsApp Konekte avèk Siksè!", `Aparèy lye: ${phone}. Bot la kounye a ap reponn an dirèk.`);
      } else {
        qrStatus.connected = false;
        qrStatus.phoneNumber = undefined;
        addLog("warning", "WHATSAPP", "WhatsApp Dekonekte", "Sesyon an fèmen oswa telefòn nan dekonekte.");
      }
    },
    onMessage: async (fromNumber, messageBody, senderName) => {
      try {
        let conv = conversations.find((c) => c.clientNumber.replace(/[^0-9]/g, "") === fromNumber.replace(/[^0-9]/g, ""));
        const isNew = !conv || conv.messages.length === 0;

        if (!conv) {
          conv = {
            id: "conv-" + Date.now(),
            clientNumber: fromNumber,
            clientPseudo: senderName || "Kliyan " + fromNumber.slice(-4),
            isNewClient: isNew,
            autoReplyEnabled: true,
            lastMessageTimestamp: Date.now(),
            unreadCount: 1,
            sentimentSummary: "net",
            sentimentScore: 0,
            lastIntent: "salitasyon",
            messages: [],
          };
          conversations.unshift(conv);
        } else {
          conv.unreadCount += 1;
          conv.lastMessageTimestamp = Date.now();
        }

        const userMsg: Message = {
          id: "msg-" + Date.now(),
          sender: "client",
          text: messageBody,
          timestamp: Date.now(),
          status: "delivered",
          detectedPseudo: senderName || conv.clientPseudo,
        };
        conv.messages.push(userMsg);

        addLog("info", "WHATSAPP", `Nouvo Mesaj Resevwa soti nan ${fromNumber}`, `"${messageBody}"`, { from: fromNumber, sender: senderName });

        if (botConfig.autoReplyGlobal && conv.autoReplyEnabled) {
          const aiAnalysis = await generateAiBotResponse(
            messageBody,
            conv.clientPseudo,
            conv.clientNumber,
            conv.isNewClient,
            conv.messages
          );

          conv.sentimentSummary = aiAnalysis.sentiment;
          conv.sentimentScore = aiAnalysis.sentimentScore;
          conv.lastIntent = aiAnalysis.intent;
          if (aiAnalysis.detectedPseudo && aiAnalysis.detectedPseudo !== "Kliyan") {
            conv.clientPseudo = aiAnalysis.detectedPseudo;
          }
          conv.isNewClient = false;

          const botMsg: Message = {
            id: "bot-" + Date.now(),
            sender: "bot",
            text: aiAnalysis.replyText,
            timestamp: Date.now() + 500,
            status: "sent",
            sentiment: aiAnalysis.sentiment,
            sentimentScore: aiAnalysis.sentimentScore,
            detectedPseudo: conv.clientPseudo,
            intent: aiAnalysis.intent,
          };
          conv.messages.push(botMsg);
          conv.lastMessageTimestamp = Date.now() + 500;

          // Send real reply back through WhatsApp socket
          await sendWhatsAppMessageViaBaileys(fromNumber, aiAnalysis.replyText);

          addLog("ai", "GEMINI_AI", `Repons Otomatik Voye bay ${conv.clientPseudo}`, `"${aiAnalysis.replyText}"`, { to: fromNumber });
        }
      } catch (err) {
        console.error("Error handling incoming Baileys WhatsApp message:", err);
      }
    },
  });

  // Start Baileys socket asynchronously
  initBaileysSocket().catch((err) => console.warn("Baileys start notice:", err));

  // Unified WhatsApp API endpoint supporting action=status, action=qr, action=send, and default
  app.all("/api/whatsapp", async (req, res) => {
    try {
      const action = req.query.action || req.body?.action;
      const isReady = qrStatus.connected;
      const allMsgs: Message[] = [];
      conversations.forEach((c) => allMsgs.push(...c.messages));
      allMsgs.sort((a, b) => a.timestamp - b.timestamp);

      // 1. Status action
      if (action === "status") {
        return res.json({
          status: isReady ? "online" : "offline",
          qrCode: qrStatus.qrCodeSeed,
          phoneNumber: qrStatus.phoneNumber,
          messagesCount: allMsgs.length,
          lastMessages: allMsgs.slice(-5),
        });
      }

      // 2. Send message action
      if (action === "send" && req.body?.to && req.body?.message) {
        if (!isReady) {
          return res.status(503).json({ error: "Bot pa konekte" });
        }

        const numero = req.body.to.includes("@") ? req.body.to : `${req.body.to}@c.us`;
        const pureNumber = req.body.to.replace(/[^0-9+]/g, "");

        let conv = conversations.find((c) => c.clientNumber.replace(/[^0-9+]/g, "") === pureNumber);
        if (!conv) {
          conv = {
            id: "conv-" + Date.now(),
            clientNumber: req.body.to,
            clientPseudo: "Kliyan " + pureNumber.slice(-4),
            isNewClient: false,
            autoReplyEnabled: true,
            lastMessageTimestamp: Date.now(),
            unreadCount: 0,
            sentimentSummary: "net",
            sentimentScore: 0.5,
            lastIntent: "èd_jeneral",
            messages: [],
          };
          conversations.unshift(conv);
        }

        const sentMsg: Message = {
          id: "msg-sent-" + Date.now(),
          sender: "agent",
          text: req.body.message,
          timestamp: Date.now(),
          status: "sent",
          detectedPseudo: conv.clientPseudo,
        };

        conv.messages.push(sentMsg);
        conv.lastMessageTimestamp = Date.now();

        addLog(
          "success",
          "WHATSAPP",
          `Mesaj Voye bay ${numero}`,
          `"${req.body.message}"`,
          { to: numero }
        );

        return res.json({
          success: true,
          message: "Mesaj voye",
          to: numero,
          timestamp: Date.now(),
        });
      }

      // 3. QR code action
      if (action === "qr") {
        return res.json({
          qrCode: qrStatus.qrCodeSeed,
          instructions: "Skane QR kòd sa a ak WhatsApp ou (Meni > Aparèy Lye > Lye yon aparèy)",
          connected: qrStatus.connected,
          phoneNumber: qrStatus.phoneNumber,
        });
      }

      // 4. Default action - bot info
      return res.json({
        name: "WhatsApp Bot - ES RECHARGE Assistant",
        website: "esrecharge.com",
        version: "2.0.0",
        status: isReady ? "🟢 Online" : "🔴 Offline",
        connectedNumber: qrStatus.phoneNumber || "Poko konekte",
        catalog: [
          "1. Followers & Rezo Sosyal (TikTok, IG, FB, YouTube)",
          "2. Dyaman Free Fire sou UID (Livrezon 30s)",
          "3. Nimewo Entènasyonal Vityèl (USA +1, France +33, Chili...)",
          "4. Rechaj USDT (Crypto TRC20 / BEP20)",
          "5. Rechaj Meru (Balans & Topup)"
        ],
        instructions: "Skane QR kòd la ak WhatsApp ou pou konekte (WhatsApp > Linked Devices)",
        endpoints: {
          status: "/api/whatsapp?action=status",
          qr: "/api/whatsapp?action=qr",
          send: "/api/whatsapp?action=send (POST)"
        }
      });
    } catch (error: any) {
      console.error("❌ Erè API:", error);
      return res.status(500).json({
        error: "Erè sèvè",
        message: error?.message || "Erè enkoni",
      });
    }
  });

  // Get WhatsApp connection status
  app.get("/api/whatsapp/status", (_req, res) => {
    res.json(qrStatus);
  });

  // Webhook verification endpoint (WhatsApp Cloud API / Meta Webhooks standard)
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // Default verification token or accept
    if (mode === "subscribe" || token) {
      return res.status(200).send(challenge || "VERIFIED");
    }
    res.json({ status: "ready", service: "ES TOPUP WhatsApp Webhook" });
  });

  // Webhook receiver for incoming WhatsApp messages
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const body = req.body;
      let fromNumber = body.From || body.from || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || "+509 3000-0000";
      let messageBody = body.Body || body.body || body.text || body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || "";
      let profileName = body.ProfileName || body.profileName || body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.profile?.name || "";

      if (messageBody) {
        // Process message through conversational engine
        let conv = conversations.find((c) => c.clientNumber === fromNumber);
        const isNew = !conv || conv.messages.length === 0;

        if (!conv) {
          conv = {
            id: "conv-" + Date.now(),
            clientNumber: fromNumber,
            clientPseudo: profileName || "Kliyan " + fromNumber.slice(-4),
            isNewClient: isNew,
            autoReplyEnabled: true,
            lastMessageTimestamp: Date.now(),
            unreadCount: 1,
            sentimentSummary: "net",
            sentimentScore: 0,
            lastIntent: "salitasyon",
            messages: [],
          };
          conversations.unshift(conv);
        } else {
          conv.unreadCount += 1;
          conv.lastMessageTimestamp = Date.now();
        }

        const userMsg: Message = {
          id: "msg-" + Date.now(),
          sender: "client",
          text: messageBody,
          timestamp: Date.now(),
          status: "delivered",
          detectedPseudo: profileName || conv.clientPseudo,
        };
        conv.messages.push(userMsg);

        if (botConfig.autoReplyGlobal && conv.autoReplyEnabled) {
          const aiAnalysis = await generateAiBotResponse(
            messageBody,
            conv.clientPseudo,
            conv.clientNumber,
            conv.isNewClient,
            conv.messages
          );

          conv.sentimentSummary = aiAnalysis.sentiment;
          conv.sentimentScore = aiAnalysis.sentimentScore;
          conv.lastIntent = aiAnalysis.intent;
          if (aiAnalysis.detectedPseudo && aiAnalysis.detectedPseudo !== "Kliyan") {
            conv.clientPseudo = aiAnalysis.detectedPseudo;
          }
          conv.isNewClient = false;

          const botMsg: Message = {
            id: "bot-" + Date.now(),
            sender: "bot",
            text: aiAnalysis.replyText,
            timestamp: Date.now() + 500,
            status: "sent",
            sentiment: aiAnalysis.sentiment,
            sentimentScore: aiAnalysis.sentimentScore,
            detectedPseudo: conv.clientPseudo,
            intent: aiAnalysis.intent,
          };
          conv.messages.push(botMsg);
          conv.lastMessageTimestamp = Date.now() + 500;
        }
      }
      res.status(200).json({ status: "success", received: true });
    } catch (e) {
      console.error("Webhook processing error:", e);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Get logs endpoint
  app.get("/api/logs", (_req, res) => {
    res.json({ logs: systemLogs, count: systemLogs.length });
  });

  // Clear logs endpoint
  app.post("/api/logs/clear", (_req, res) => {
    systemLogs.length = 0;
    addLog("info", "SYSTEM", "Jounal Efase", "Tout ansyen log yo te reyinisyalize.");
    res.json({ success: true, logs: systemLogs });
  });

  // Simulate scanning / reconnecting QR code
  app.post("/api/whatsapp/connect-simulate", (req, res) => {
    const { phoneNumber } = req.body;
    const phone = phoneNumber || "+509 3788-9900";
    qrStatus = {
      connected: true,
      phoneNumber: phone,
      deviceBattery: Math.floor(Math.random() * 25) + 75,
      lastConnectedAt: Date.now(),
      qrCodeSeed: "es_topup_auth_token_" + Date.now(),
    };

    addLog(
      "success",
      "WHATSAPP",
      "Kòd QR Eskane & WhatsApp Lye",
      `Aparèy WhatsApp biznis la (${phone}) lye avèk siksè. Bot AI ap koute tout mesaj k ap rantre.`,
      { phoneNumber: phone, battery: qrStatus.deviceBattery }
    );

    res.json({ success: true, status: qrStatus });
  });

  // Disconnect WhatsApp session
  app.post("/api/whatsapp/disconnect", (_req, res) => {
    const prevPhone = qrStatus.phoneNumber;
    qrStatus.connected = false;
    qrStatus.phoneNumber = undefined;
    qrStatus.qrCodeSeed = "es_topup_auth_token_refresh_" + Date.now();

    addLog(
      "warning",
      "WHATSAPP",
      "WhatsApp Dekonekte",
      `Sesyon pou ${prevPhone || "biznis la"} te dekonekte. Kòd QR la pare pou re-eskane.`,
      { prevPhone }
    );

    res.json({ success: true, status: qrStatus });
  });

  // Get all conversations
  app.get("/api/conversations", (_req, res) => {
    // Sort by most recent message
    const sorted = [...conversations].sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp);
    res.json({ conversations: sorted, count: sorted.length });
  });

  // Post incoming customer message (from WhatsApp Web or Simulator)
  app.post("/api/conversations/message", async (req, res) => {
    const {
      clientNumber,
      clientPseudo,
      messageText,
      simulateNewUser,
    } = req.body;

    if (!messageText || !clientNumber) {
      return res.status(400).json({ error: "clientNumber and messageText are required." });
    }

    const pseudo = clientPseudo || "Kliyan " + clientNumber.slice(-4);
    let conv = conversations.find((c) => c.clientNumber === clientNumber);
    const isNew = simulateNewUser || !conv || conv.messages.length === 0;

    if (!conv) {
      conv = {
        id: "conv-" + Date.now(),
        clientNumber,
        clientPseudo: pseudo,
        isNewClient: isNew,
        autoReplyEnabled: true,
        lastMessageTimestamp: Date.now(),
        unreadCount: 1,
        sentimentSummary: "net",
        sentimentScore: 0,
        lastIntent: "salitasyon",
        messages: [],
      };
      conversations.unshift(conv);
    } else {
      if (clientPseudo && clientPseudo !== conv.clientPseudo) {
        conv.clientPseudo = clientPseudo;
      }
      conv.unreadCount += 1;
      conv.lastMessageTimestamp = Date.now();
    }

    const userMsgId = "msg-" + Date.now();
    const userMessage: Message = {
      id: userMsgId,
      sender: "client",
      text: messageText,
      timestamp: Date.now(),
      status: "delivered",
      detectedPseudo: conv.clientPseudo,
    };

    conv.messages.push(userMessage);

    addLog(
      "info",
      "WHATSAPP",
      `Mesaj Resevwa: ${conv.clientPseudo} (${clientNumber})`,
      `"${messageText}"`,
      { clientNumber, pseudo: conv.clientPseudo, isNewClient: isNew }
    );

    // If auto-reply is globally enabled and enabled for this conversation:
    let botMessage: Message | null = null;
    let aiAnalysis: any = null;

    if (botConfig.autoReplyGlobal && conv.autoReplyEnabled) {
      addLog(
        "ai",
        "GEMINI_AI",
        `Gemini 3.7 ap trete repons pou ${conv.clientPseudo}...`,
        `Kalkil santiman, entansyon ak seleksyon plan ES TOPUP ki apwopriye a.`
      );

      aiAnalysis = await generateAiBotResponse(
        messageText,
        conv.clientPseudo,
        conv.clientNumber,
        conv.isNewClient,
        conv.messages
      );

      // Update conversation metadata with AI sentiment and intent
      conv.sentimentSummary = aiAnalysis.sentiment;
      conv.sentimentScore = aiAnalysis.sentimentScore;
      conv.lastIntent = aiAnalysis.intent;
      if (aiAnalysis.detectedPseudo && aiAnalysis.detectedPseudo !== "Kliyan") {
        conv.clientPseudo = aiAnalysis.detectedPseudo;
      }
      conv.isNewClient = false; // Welcomed

      userMessage.sentiment = aiAnalysis.sentiment;
      userMessage.sentimentScore = aiAnalysis.sentimentScore;
      userMessage.intent = aiAnalysis.intent;
      userMessage.detectedPseudo = aiAnalysis.detectedPseudo;

      botMessage = {
        id: "bot-" + Date.now() + Math.floor(Math.random() * 1000),
        sender: "bot",
        text: aiAnalysis.replyText,
        timestamp: Date.now() + 500,
        status: "sent",
        sentiment: aiAnalysis.sentiment,
        sentimentScore: aiAnalysis.sentimentScore,
        detectedPseudo: conv.clientPseudo,
        intent: aiAnalysis.intent,
      };

      conv.messages.push(botMessage);
      conv.lastMessageTimestamp = Date.now() + 500;

      addLog(
        "success",
        "WHATSAPP",
        `Bot Reponn ${conv.clientPseudo} (Santiman: ${aiAnalysis.sentiment}, Entansyon: ${aiAnalysis.intent})`,
        `"${aiAnalysis.replyText}"`,
        {
          pseudo: conv.clientPseudo,
          sentiment: aiAnalysis.sentiment,
          score: aiAnalysis.sentimentScore,
          intent: aiAnalysis.intent,
        }
      );
    }

    res.json({
      success: true,
      conversation: conv,
      userMessage,
      botMessage,
      aiAnalysis,
    });
  });

  // Send manual agent message from dashboard
  app.post("/api/conversations/send-manual", (req, res) => {
    const { conversationId, text } = req.body;
    const conv = conversations.find((c) => c.id === conversationId);
    if (!conv) {
      return res.status(404).json({ error: "Konvèsasyon pa jwenn." });
    }

    const agentMsg: Message = {
      id: "agent-" + Date.now(),
      sender: "agent",
      text,
      timestamp: Date.now(),
      status: "sent",
      detectedPseudo: conv.clientPseudo,
    };

    conv.messages.push(agentMsg);
    conv.lastMessageTimestamp = Date.now();
    conv.unreadCount = 0;

    addLog(
      "info",
      "WHATSAPP",
      `Ajan Manyèl Voye Mesaj bay ${conv.clientPseudo}`,
      `"${text}"`,
      { conversationId, pseudo: conv.clientPseudo }
    );

    res.json({ success: true, message: agentMsg, conversation: conv });
  });

  // Mark conversation as read
  app.post("/api/conversations/mark-read", (req, res) => {
    const { conversationId } = req.body;
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.unreadCount = 0;
      conv.messages.forEach((m) => {
        if (m.sender === "client") m.status = "read";
      });
      return res.json({ success: true, conversation: conv });
    }
    res.status(404).json({ error: "Conversation not found" });
  });

  // Toggle auto-reply for single conversation
  app.post("/api/conversations/toggle-autoreply", (req, res) => {
    const { conversationId } = req.body;
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.autoReplyEnabled = !conv.autoReplyEnabled;
      addLog(
        "warning",
        "SYSTEM",
        `AI Auto-Reply ${conv.autoReplyEnabled ? "Aktive" : "Dezaktive"} pou ${conv.clientPseudo}`,
        `Kliyan: ${conv.clientNumber}`
      );
      return res.json({ success: true, autoReplyEnabled: conv.autoReplyEnabled });
    }
    res.status(404).json({ error: "Conversation not found" });
  });

  // Broadcast / Mass message to clients
  app.post("/api/broadcast", (req, res) => {
    const { messageText, targetFilter } = req.body;
    if (!messageText) {
      return res.status(400).json({ error: "Tèks mesaj la obligatwa." });
    }

    let targets = [...conversations];
    if (targetFilter === "pozitif") {
      targets = targets.filter((c) => c.sentimentSummary === "pozitif" || c.sentimentSummary === "rekonesan");
    } else if (targetFilter === "frustre") {
      targets = targets.filter((c) => c.sentimentSummary === "frustre" || c.sentimentSummary === "konfizyon");
    }

    let sentCount = 0;
    targets.forEach((c) => {
      // Personalize message with client's pseudo
      const personalized = messageText.replace(/\[PSEUDO\]/gi, c.clientPseudo || "Chè Kliyan");
      c.messages.push({
        id: "broadcast-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
        sender: "agent",
        text: personalized,
        timestamp: Date.now(),
        status: "sent",
        detectedPseudo: c.clientPseudo,
      });
      c.lastMessageTimestamp = Date.now();
      sentCount++;
    });

    addLog(
      "success",
      "WHATSAPP",
      `Mesaj Masiv (Broadcast) Voye bay ${sentCount} Kliyan`,
      `"${messageText}"`,
      { sentCount, targetFilter }
    );

    res.json({ success: true, sentCount, totalTargets: targets.length });
  });

  // Get and update bot configuration
  app.get("/api/config", (_req, res) => {
    res.json(botConfig);
  });

  app.post("/api/config", (req, res) => {
    botConfig = { ...botConfig, ...req.body };
    res.json({ success: true, config: botConfig });
  });

  // Sentiment Analytics summary endpoint
  app.get("/api/analytics/sentiment", (_req, res) => {
    const sentimentCounts: Record<string, number> = {
      pozitif: 0,
      net: 0,
      frustre: 0,
      konfizyon: 0,
      ijans: 0,
      rekonesan: 0,
    };

    let totalScore = 0;
    let totalMsgs = 0;

    conversations.forEach((c) => {
      c.messages.forEach((m) => {
        if (m.sentiment) {
          sentimentCounts[m.sentiment] = (sentimentCounts[m.sentiment] || 0) + 1;
          if (typeof m.sentimentScore === "number") {
            totalScore += m.sentimentScore;
            totalMsgs++;
          }
        }
      });
    });

    const averageSatisfaction = totalMsgs > 0 ? Math.round(((totalScore / totalMsgs + 1) / 2) * 100) : 85;

    res.json({
      sentimentCounts,
      averageSatisfaction,
      totalAnalyzed: totalMsgs,
      activeConversations: conversations.length,
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ES TOPUP WhatsApp Bot Server running on http://0.0.0.0:${PORT}`);
  });
}

createServer();
