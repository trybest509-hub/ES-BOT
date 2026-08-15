export type SentimentType = "pozitif" | "net" | "frustre" | "konfizyon" | "ijans" | "rekonesan";

export interface Message {
  id: string;
  sender: "client" | "bot" | "agent";
  text: string;
  timestamp: number;
  status: "sent" | "delivered" | "read";
  sentiment?: SentimentType;
  sentimentScore?: number;
  detectedPseudo?: string;
  intent?: string;
}

export interface Conversation {
  id: string;
  clientNumber: string;
  clientPseudo: string;
  avatarUrl?: string;
  isNewClient: boolean;
  autoReplyEnabled: boolean;
  lastMessageTimestamp: number;
  unreadCount: number;
  sentimentSummary: SentimentType;
  sentimentScore: number;
  lastIntent: string;
  messages: Message[];
}

export interface BotConfig {
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

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string;
  deviceBattery?: number;
  lastConnectedAt?: number;
  qrCodeSeed: string;
}

export interface SentimentAnalytics {
  sentimentCounts: Record<SentimentType, number>;
  averageSatisfaction: number;
  totalAnalyzed: number;
  activeConversations: number;
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

