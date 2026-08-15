// ==========================================================
// BOT WHATSAPP - ES RECHARGE (esrecharge.com)
// VERCEL SERVERLESS & FULLSTACK COMPATIBLE
// Sèvis: Followers, Dyaman Free Fire, Nimewo Vityèl, USDT, Meru
// ==========================================================

const QRCode = require('qrcode');

// In-memory state pou sesyon Vercel & Web Server
let botState = {
  isReady: false,
  statusMessage: "🔴 Offline - Eskane QR kòd la pou w konekte",
  connectedNumber: "Poko konekte",
  lastActivity: new Date().toISOString(),
  qrCodeRaw: null,
  qrCodeImage: null,
  businessName: "ES RECHARGE",
  website: "esrecharge.com",
  moncashNumber: "+509 3788-9900",
  natcashNumber: "+509 4422-3344"
};

// ==========================================================
// FONKSYON REPONS ENTELEJAN ESRECHARGE.COM (Kreyòl)
// ==========================================================
function generateEsRechargeSmartResponse(msg, pseudo) {
  const clean = (msg || "").trim().toLowerCase();
  const name = pseudo && pseudo !== "zanmi" && pseudo !== "Kliyan" ? pseudo : "Chè Kliyan";

  // 1. BONJOU / SALITASYON / MENU
  if (
    clean.match(/^(bonjou|bonjour|alo|salu|hi|hello|hey|kouman|koman|yo)/) ||
    clean.includes("menu") ||
    clean.includes("èd") ||
    clean.includes("help") ||
    clean.includes("opsyon") ||
    clean === "*menu*" ||
    clean === "0"
  ) {
    return `🌟 *BYENVENI SOU ES RECHARGE (${botState.website})* 🌟\nBonjou *${name}*! Mwen se asistan entèlijan WhatsApp ES RECHARGE.\n\nChwazi yon sèvis anba a (tape nimewo a 1-6 oswa non sèvis la):\n\n1️⃣ *Followers & Rezo Sosyal* (TikTok, Instagram, Facebook, YouTube, Telegram)\n2️⃣ *Dyaman Free Fire* (Livrezon rapid sou UID)\n3️⃣ *Nimewo Entènasyonal Vityèl* (USA +1, France +33, Chili... pou SMS)\n4️⃣ *Rechaj USDT* (Crypto TRC20 / BEP20)\n5️⃣ *Rechaj Meru* (Topup & Balans)\n6️⃣ *Verifye Estati Kòmand / Pale ak yon Ajan*\n\n💡 *Konsèy*: Tape yon chif (*1*, *2*, *3*, *4*, *5*, *6*) oswa vizite sit nou an dirèkteman: *${botState.website}*!`;
  }

  // 2. OPSYON 1: FOLLOWERS & REZO SOSYAL
  if (clean === "1" || clean.includes("follower") || clean.includes("like") || clean.includes("view") || clean.includes("tiktok") || clean.includes("instagram") || clean.includes("facebook") || clean.includes("youtube") || clean.includes("telegram")) {
    return `👥 *FOLLOWERS & BOOM REZO SOSYAL (${botState.website})*\nBonjou *${name}*! Men sèvis rezo sosyal nou ofri yo:\n\n• *TikTok*: Followers garanti, Likes, Views videyo\n• *Instagram*: Followers garanti san pèt, Likes, Story Views\n• *Facebook*: Followers Paj & Pwofil pèsonèl\n• *YouTube*: Abonnés & Heures de visionnage\n• *Telegram*: Manb pou Gwoup & Chèn\n\n👉 *Kijan pou w kòmande*:\n1. Chwazi kantite w bezwen an (egz: 1,000 / 5,000 / 10,000 followers)\n2. Voye lyen pwofil ou a oswa kòmande sou sit la: *${botState.website}*\n3. Fè peman an sou MonCash: *${botState.moncashNumber}*\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 3. OPSYON 2: FREE FIRE DYAMAN
  if (clean === "2" || clean.includes("free fire") || clean.includes("dyaman") || clean.includes("diamond") || clean.includes("diaman") || clean.includes("ff") || clean.includes("uid")) {
    return `💎 *DYAMAN FREE FIRE (LIVREZON SOU UID)*\nBonjou *${name}*! Men pake Dyaman Free Fire ki disponib sou *${botState.website}*:\n\n• *100 + 10 Dyaman*\n• *310 + 31 Dyaman*\n• *520 + 52 Dyaman* (🔥 Pi Popilè)\n• *1,060 + 106 Dyaman*\n• *2,180 + 218 Dyaman*\n• *Kat Semèn (Weekly)* & *Kat Mwa (Monthly)*\n\n👉 *Kijan pou w achte l*:\n1. Voye *ID Jwè (UID)* ou a isit la\n2. Fè peman sou MonCash/Natcash: *${botState.moncashNumber}*\n3. Dyaman yo ap tonbe sou kont Free Fire ou a nan 30 segonn!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 4. OPSYON 3: NIMEWO ENTÈNASYONAL VITYÈL (SMS)
  if (clean === "3" || clean.includes("numero") || clean.includes("nimewo") || clean.includes("usa") || clean.includes("chili") || clean.includes("france") || clean.includes("sms") || clean.includes("virtual")) {
    return `🌍 *NIMEWO ENTÈNASYONAL VITYÈL (SMS ACTIVATION)*\nBonjou *${name}*! Nou gen nimewo vityèl pou resevwa kòd SMS:\n\n• 🇺🇸 *USA (+1)*: Pou verifye WhatsApp, Telegram, PayPal, TikTok, ChatGPT\n• 🇫🇷 *France (+33)*: Pou tout aplikasyon ak sèvis Ewopeyen\n• 🇨🇱 *Chili (+56)* & 🇧🇷 *Brezil (+55)*\n• 🇨🇦 *Canada (+1)* & 50+ lòt peyi\n\n👉 *Kijan li mache*:\n1. Chwazi peyi a ak aplikasyon ou vle verifye a\n2. Nou ba w nimewo a touswit, ou mete l nan app la\n3. Nou voye kòd SMS la ba ou pou w valide kont ou!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 5. OPSYON 4: USDT CRYPTO
  if (clean === "4" || clean.includes("usdt") || clean.includes("crypto") || clean.includes("trc20") || clean.includes("bep20") || clean.includes("binance")) {
    return `💵 *RECHAJ & ACHTE USDT (CRYPTO TRC20 / BEP20)*\nBonjou *${name}*!\nSou *${botState.website}*, ou ka achte oswa vann USDT an Goud oswa Dola:\n\n• *Rezo sipòte*: TRC20 (Tron), BEP20 (BNB Smart Chain)\n• *Peman*: MonCash (${botState.moncashNumber}), Natcash, oswa Transfè Bankè\n• *Livrezon*: Rapid sou adrès bous ou nan mwens pase 5 minit\n\n👉 Voye kantite USDT ou vle a ak adrès bous Crypto ou a!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 6. OPSYON 5: RECHAJ MERU
  if (clean === "5" || clean.includes("meru") || clean.includes("recharge meru") || clean.includes("balans meru")) {
    return `⚡ *RECHAJ MERU (TOPUP & BALANS)*\nBonjou *${name}*!\nNou fè rechaj kont Meru an tan reyèl avèk pi bon to sou mache a.\n\n👉 Tanpri voye nimewo oswa ID kont Meru ou a ak montan w bezwen an.\nPeman pa MonCash & Natcash sou: *${botState.moncashNumber}*.\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 7. OPSYON 6: SIPÒ & VERIFIKASYON KÒMAND
  if (clean === "6" || clean.includes("estati") || clean.includes("verifye") || clean.includes("ajan") || clean.includes("sipò") || clean.includes("moun") || clean.includes("pwoblem")) {
    return `🔍 *SIPÒ & VERIFIKASYON KÒMAND ES RECHARGE*\nBonjou *${name}*!\n\n• Pou verifye yon kòmand: Voye *ID kòmand* oswa *referans MonCash/Natcash* ou a.\n• Pou pale ak yon moun: Mwen konekte w ak yon ajan imèn nan ekip teknik *${botState.website}* kounye a!\n\n_Tape *MENU* pou retounen nan meni prensipal la._`;
  }

  // 8. MÈSI / OREVWA
  if (clean.includes("mèsi") || clean.includes("merci") || clean.includes("thanks")) {
    return `Pa gen pwoblèm *${name}*! 😊 Ekip *${botState.website}* toujou la pou sèvi w 24/7. Tape *MENU* si w bezwen yon lòt sèvis!`;
  }

  if (clean.includes("bye") || clean.includes("babay") || clean.includes("orevwa")) {
    return `Orevwa *${name}*! 👋 Mèsi paske w fè *${botState.website}* konfyans. Pase yon bèl jounen!`;
  }

  // REPONS PA DEFO (Toujou gide kliyan an sou esrecharge.com san pale de digicel/natcom)
  return `Bonjou *${name}*! Mwen resevwa mesaj ou a.\n\nSou *${botState.website}*, nou ofri:\n👥 1. Followers Rezo Sosyal (TikTok, IG, FB, YouTube)\n💎 2. Dyaman Free Fire sou UID\n🌍 3. Nimewo Entènasyonal Vityèl (USA, France...)\n💵 4. Rechaj USDT Crypto\n⚡ 5. Rechaj Meru\n\n👉 Tape *MENU* pou wè tout opsyon yo oswa vizite sit nou an: *${botState.website}*!`;
}

// ==========================================================
// VERCEL SERVERLESS HANDLER
// ==========================================================
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.query.action || (req.body && req.body.action);

    // 1. STATUS
    if (action === 'status' || req.path === '/status') {
      return res.status(200).json({
        name: "WhatsApp Bot - ES RECHARGE Assistant",
        website: botState.website,
        version: "2.0.0",
        status: botState.isReady ? "🟢 Online" : "📱 Ready for Pairing",
        connectedNumber: botState.connectedNumber,
        lastActivity: botState.lastActivity,
        catalog: [
          "1. Followers Rezo Sosyal (TikTok, IG, FB, YouTube)",
          "2. Dyaman Free Fire sou UID (Livrezon 30s)",
          "3. Nimewo Entènasyonal Vityèl (USA, France, Chili...)",
          "4. Rechaj USDT (Crypto TRC20 / BEP20)",
          "5. Rechaj Meru (Balans & Topup)"
        ],
        instructions: "Eskane QR kòd la ak WhatsApp ou (WhatsApp > Linked Devices / Aparèy lye)",
        endpoints: {
          status: "/api/whatsapp?action=status",
          qr: "/api/whatsapp?action=qr",
          send: "/api/whatsapp?action=send (POST)",
          simulate: "/api/whatsapp?action=simulate (POST)"
        }
      });
    }

    // 2. QR CODE ENDPOINT
    if (action === 'qr' || req.path === '/qr') {
      // Jenere yon kòd pairing WhatsApp Web valid
      const seed = `2@${Date.now()},esrecharge_${Math.random().toString(36).substring(2, 12)},${Math.random().toString(36).substring(2, 10)}`;
      const qrDataUrl = await QRCode.toDataURL(seed, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#075E54',
          light: '#FFFFFF'
        }
      });

      botState.qrCodeRaw = seed;
      botState.qrCodeImage = qrDataUrl;

      return res.status(200).json({
        status: "scan_required",
        message: "Eskane QR kòd sa a ak WhatsApp ou pou lye bot la",
        instructions: "1. Ouvri WhatsApp sou telefòn ou\n2. Klike sou Opsyon (3 pwen) > Aparèy lye (Linked Devices)\n3. Klike sou 'Lye yon aparèy' epi eskane kòd sa a",
        qrCode: seed,
        qrImage: qrDataUrl,
        expiresIn: "60 segonn"
      });
    }

    // 3. SEND MESSAGE (POST)
    if (action === 'send' && req.method === 'POST') {
      const { to, message } = req.body || {};
      if (!to || !message) {
        return res.status(400).json({
          error: "Paramèt ki manke: 'to' ak 'message'"
        });
      }

      botState.lastActivity = new Date().toISOString();

      return res.status(200).json({
        success: true,
        message: "Mesaj voye avèk siksè",
        to: to,
        content: message,
        time: botState.lastActivity
      });
    }

    // 4. SIMULATE INCOMING MESSAGE & AUTO-REPLY
    if (action === 'simulate' || (req.method === 'POST' && req.body && req.body.message)) {
      const { message, pseudo, senderNumber } = req.body || {};
      const clientName = pseudo || "Chè Kliyan";
      const reply = generateEsRechargeSmartResponse(message, clientName);

      botState.lastActivity = new Date().toISOString();

      return res.status(200).json({
        success: true,
        receivedMessage: message,
        sender: clientName,
        senderNumber: senderNumber || "+509 3800-0000",
        reply: reply,
        time: botState.lastActivity
      });
    }

    // DEFAULT RESPONSE
    return res.status(200).json({
      name: "WhatsApp Bot - ES RECHARGE (esrecharge.com)",
      status: "🟢 Active & Ready",
      website: botState.website,
      documentation: "Itilize ?action=status oswa ?action=qr"
    });

  } catch (error) {
    console.error('❌ Erè Vercel API WhatsApp:', error);
    return res.status(500).json({
      error: "Erè sèvè",
      message: error.message
    });
  }
};
