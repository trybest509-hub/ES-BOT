# 🚀 Gid Deplwaman Sou Render (ES TOPUP WhatsApp AI Bot)

Gid sa a montre w etap pa etap kijan pou w pibliye bot WhatsApp la sou **Render** (https://render.com) pou l kouri 24/7.

---

## 📁 1. Fichye Achitekti Render ki pare nan pwojè a:
- **`render.yaml`**: Fichye Blueprint ofisyèl Render la pou konfigire Web Service la otomatikman.
- **`Dockerfile`**: Kontenè Docker ak tout bibliyotèk Chrome/Chromium nesesè pou WhatsApp Web kouri san erè.
- **`Procfile`**: Kòmand demaraj estanda (`web: npm start`).
- **`package.json`**: Gen script `build` (Vite + esbuild) ak `start` (`node dist/server.cjs`).

---

## 🛠️ 2. Etap Deplwaman sou Render:

### Metòd A: Avèk Render Blueprint (Pi Fasil & Otomatik)
1. Pouse (Push) kòd la sou yon depo **GitHub** ou.
2. Ale sou [dashboard.render.com](https://dashboard.render.com).
3. Klike sou **"New +"** anlè a dwat, epi chwazi **"Blueprint"**.
4. Chwazi repo GitHub pwojè a.
5. Render ap detekte fichye `render.yaml` la otomatikman epi konfigire:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Port**: `3000`
   - **Health Check**: `/api/health`
6. Klike sou **"Apply"** pou lanse deplwaman an!

---

### Metòd B: Web Service Manyèl sou Render
1. Ale sou [dashboard.render.com](https://dashboard.render.com) > **"New +"** > **"Web Service"**.
2. Konekte repo GitHub ou a.
3. Rantre paramèt sa yo:
   - **Name**: `es-topup-whatsapp-bot`
   - **Runtime**: `Node` (oswa `Docker` si w vle itilize Dockerfile la)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (oswa `Starter` pou bot la pa janm dòmi)

---

## 🔑 3. Konfigirasyon Varyab Anviwònman (Environment Variables)
Nan dashboard Render la, ale nan tab **"Environment"** pou ajoute:

| Kle (Key) | Valè (Value) | Eksplikasyon |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20.12.0` | Vèsyon Node.js |
| `NODE_ENV` | `production` | Anviwònman pwodiksyon |
| `PORT` | `3000` | Pò sèvè a |
| `GEMINI_API_KEY` | *Cle Gemini ou* | Pou repons AI ak analiz santiman |

---

## 📲 4. Kijan pou w itilize Bot la sou Render:

1. Yon fwa deplwaman an fini, Render ap ba w yon lyen tankou:
   `https://es-topup-whatsapp-bot.onrender.com`
2. Ouvri lyen an nan navigatè w pou w wè Tablodbò a ak Kòd QR la.
3. Eskane Kòd QR la ak WhatsApp sou telefòn ou (**Aparèy lye > Lye yon aparèy**).
4. Bot la ap kòmanse reponn tout mesaj kliyan yo ak kòmand `*menu*` otomatikman 24/7!
