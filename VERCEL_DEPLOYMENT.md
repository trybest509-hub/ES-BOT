# ⚡ Gid Deplwaman Sou Vercel (ES RECHARGE WhatsApp Bot)

Pwojè sa a konfigire 100% pou kouri sou **Vercel** san okenn pwoblèm Puppeteer/Chromium paske li itilize yon achitekti **Serverless Webhook & Pairing API** ki pa bloke.

---

## 📁 1. Fichye Vercel ki pare nan pwojè a:
- **`api/whatsapp.js`**: Fonksyon Serverless Vercel pou jere QR Code, Estati, voye mesaj ak simulation oto-repons pou **esrecharge.com** (Followers, Free Fire, Nimewo Vityèl, USDT, Meru).
- **`vercel.json`**: Konfigirasyon woutaj Vercel pou sèvi ni Dashboard React la ni API `/api/whatsapp` la.
- **`package.json`**: Gen tout depandans ak script build ki nesesè.

---

## 🚀 2. Kijan pou w deploye l sou Vercel:

1. **Pouse kòd la sou GitHub**:
   ```bash
   git add .
   git commit -m "Add Vercel support & esrecharge.com services"
   git push origin main
   ```

2. **Ale sou Vercel**:
   - Vizite [vercel.com/dashboard](https://vercel.com/dashboard)
   - Klike sou **"Add New..."** > **"Project"**
   - Chwazi depo GitHub ou a (**`E-S-Bot-whatsapp`**)
   - Klike sou **"Deploy"**!

3. **Tès Endpoint sou Vercel**:
   - Wè estati: `https://[non-pwoje-ou].vercel.app/api/whatsapp?action=status`
   - Jwenn QR Kòd: `https://[non-pwoje-ou].vercel.app/api/whatsapp?action=qr`
   - Tablodbò Web la: `https://[non-pwoje-ou].vercel.app`

---

## 🤖 3. Sèvis ki Entegre nan Bot la:
- 👥 **1. Followers & Rezo Sosyal** (TikTok, Instagram, Facebook, YouTube, Telegram)
- 💎 **2. Dyaman Free Fire sou UID** (Livrezon 30 segonn)
- 🌍 **3. Nimewo Entènasyonal Vityèl** (USA +1, France +33, Chili... pou SMS)
- 💵 **4. Rechaj USDT Crypto** (TRC20 / BEP20 pa MonCash)
- ⚡ **5. Rechaj Meru** (Topup & Balans)
- 🚫 **Plan GB Digicel / Natcom yo inyore nèt**!
