import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import path from "path";
import fs from "fs";

export interface BaileysState {
  connected: boolean;
  phoneNumber?: string;
  qrCodeRaw?: string;
  lastConnectedAt?: number;
  sock: any | null;
}

export const baileysState: BaileysState = {
  connected: false,
  phoneNumber: undefined,
  qrCodeRaw: undefined,
  lastConnectedAt: undefined,
  sock: null,
};

type MessageCallback = (fromNumber: string, messageBody: string, senderName: string) => Promise<void>;
type QRCallback = (qr: string) => void;
type ConnectionCallback = (connected: boolean, phone?: string) => void;

let onMessageReceived: MessageCallback | null = null;
let onQRCodeGenerated: QRCallback | null = null;
let onConnectionUpdate: ConnectionCallback | null = null;

export function registerBaileysCallbacks(callbacks: {
  onMessage?: MessageCallback;
  onQR?: QRCallback;
  onConnect?: ConnectionCallback;
}) {
  if (callbacks.onMessage) onMessageReceived = callbacks.onMessage;
  if (callbacks.onQR) onQRCodeGenerated = callbacks.onQR;
  if (callbacks.onConnect) onConnectionUpdate = callbacks.onConnect;
}

export async function initBaileysSocket(): Promise<void> {
  try {
    const authFolder = path.join(process.cwd(), "auth_info_baileys");
    if (!fs.existsSync(authFolder)) {
      fs.mkdirSync(authFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] as [number, number, number] }));

    const sock = makeWASocket({
      version,
      logger: pino({ level: "silent" }),
      auth: state,
      printQRInTerminal: false,
      browser: ["ES RECHARGE Bot", "Chrome", "1.0.0"],
      syncFullHistory: false,
      generateHighQualityLinkPreview: false,
    });

    baileysState.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Official Real WhatsApp Web Raw QR Code Matrix
        baileysState.qrCodeRaw = qr;
        baileysState.connected = false;
        if (onQRCodeGenerated) {
          onQRCodeGenerated(qr);
        }
      }

      if (connection === "close") {
        const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut;
        baileysState.connected = false;
        baileysState.phoneNumber = undefined;
        if (onConnectionUpdate) {
          onConnectionUpdate(false);
        }

        if (shouldReconnect) {
          setTimeout(() => {
            initBaileysSocket().catch(console.error);
          }, 3000);
        }
      } else if (connection === "open") {
        const userJid = sock.user?.id || "";
        const cleanNumber = userJid.split(":")[0]?.split("@")[0] || "+509 3788-9900";
        baileysState.connected = true;
        baileysState.phoneNumber = cleanNumber.startsWith("+") ? cleanNumber : `+${cleanNumber}`;
        baileysState.lastConnectedAt = Date.now();
        baileysState.qrCodeRaw = undefined;

        if (onConnectionUpdate) {
          onConnectionUpdate(true, baileysState.phoneNumber);
        }
      }
    });

    // Listen for incoming WhatsApp messages in real-time
    sock.ev.on("messages.upsert", async (m) => {
      if (m.type !== "notify") return;

      for (const msg of m.messages) {
        if (!msg.key.fromMe && msg.message) {
          const fromNumber = msg.key.remoteJid?.split("@")[0] || "";
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            "";
          const senderName = msg.pushName || "Kliyan WhatsApp";

          if (text && fromNumber && onMessageReceived) {
            const formattedNumber = fromNumber.startsWith("+") ? fromNumber : `+${fromNumber}`;
            await onMessageReceived(formattedNumber, text, senderName);
          }
        }
      }
    });
  } catch (err) {
    console.error("Baileys initialization warning:", err);
  }
}

export async function sendWhatsAppMessageViaBaileys(to: string, message: string): Promise<boolean> {
  try {
    if (!baileysState.sock || !baileysState.connected) {
      return false;
    }

    const cleanNum = to.replace(/[^0-9]/g, "");
    const jid = `${cleanNum}@s.whatsapp.net`;

    await baileysState.sock.sendMessage(jid, { text: message });
    return true;
  } catch (err) {
    console.error("Erè voye mesaj via Baileys:", err);
    return false;
  }
}
