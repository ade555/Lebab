import fs from "fs/promises";
import path from "path";

const CONVERSATIONS_FILE = path.join(
  process.cwd(),
  "data",
  "conversations.json",
);

/**
 * Conversation structure:
 * {
 *   id: string,
 *   language: string,        // Customer's detected language code
 *   customerLocale: string,  // Full locale identifier
 *   messages: [
 *     {
 *       role: 'customer' | 'agent',
 *       original_text: string,
 *       translated_text: string,
 *       timestamp: Date
 *     }
 *   ],
 *   status: 'active' | 'resolves' | 'escalated',
 *   createdAt: Date,
 *   updatedAt: Date,
 *   closedAt: Date | null,
 *   closedBy: 'agent' | 'customer' | null
 * }
 */
export const conversations = new Map();
export const customerSessions = new Map(); // Track customer -> conversation mapping
export let conversationIdCounter = 1;

/**
 * Load conversations from file on server start
 */
export async function loadConversations() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir(path.dirname(CONVERSATIONS_FILE), { recursive: true });

    const data = await fs.readFile(CONVERSATIONS_FILE, "utf-8");
    const saved = JSON.parse(data);

    // Restore conversations to Map
    saved.conversations.forEach((conv) => {
      // Convert date strings back to Date objects
      conv.createdAt = new Date(conv.createdAt);
      conv.updatedAt = new Date(conv.updatedAt);
      conv.messages.forEach((msg) => {
        msg.timestamp = new Date(msg.timestamp);
      });

      conversations.set(conv.id, conv);
    });

    // Restore customer sessions
    Object.entries(saved.customerSessions).forEach(([customerId, convId]) => {
      customerSessions.set(customerId, convId);
    });

    // Restore counter
    if (saved.conversationIdCounter) {
      conversationIdCounter = saved.conversationIdCounter;
    }

    console.log(
      `[Persistence] Loaded ${conversations.size} conversations from disk`,
    );
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("[Persistence] No saved conversations found, starting fresh");
    } else {
      console.error("[Persistence] Error loading conversations:", error);
    }
  }
}

/**
 * Save conversations to file
 */
export async function saveConversations() {
  try {
    const data = {
      conversations: Array.from(conversations.values()),
      customerSessions: Object.fromEntries(customerSessions),
      conversationIdCounter: conversationIdCounter,
      savedAt: new Date().toISOString(),
    };

    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(data, null, 2));
    console.log(
      `[Persistence] Saved ${conversations.size} conversations to disk`,
    );
  } catch (error) {
    console.error("[Persistence] Error saving conversations:", error);
  }
}

// Helper function to find or create conversation for a customer
export function findOrCreateConversation(customerId, detectedLocale) {
  // Check if customer already has an active conversation
  const existingConvId = customerSessions.get(customerId);
  if (existingConvId && conversations.has(existingConvId)) {
    // Return existing conversation
    return conversations.get(existingConvId);
  }
  // Create new conversation
  const id = `conv_${conversationIdCounter++}`;
  const languageCode = detectedLocale.split("-")[0]; // e.g., 'en-US' -> 'en'

  const conversation = {
    id,
    customerId,
    language: languageCode,
    customerLocale: detectedLocale,
    messages: [],
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
    closedAt: null,
    closedBy: null,
  };

  conversations.set(id, conversation);
  customerSessions.set(customerId, id); // Map customer to this conversation
  return conversation;
}

/**
 * Get the last message preview for inbox display
 */
export function getLastMessagePreview(conversation) {
  if (conversation.messages.length === 0) return "";
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return lastMessage.translated_text.substring(0, 80);
}
