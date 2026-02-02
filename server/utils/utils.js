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
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
export const conversations = new Map();
export const customerSessions = new Map(); // Track customer -> conversation mapping
let conversationIdCounter = 1;

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
    createdAt: new Date(),
    updatedAt: new Date(),
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
