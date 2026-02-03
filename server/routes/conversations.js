import express from "express";
import {
  findOrCreateConversation,
  getLastMessagePreview,
  conversations,
  customerSessions,
  saveConversations,
} from "../utils/utils.js";

const router = express.Router();

export default function conversationsRoutes({ io, lingoDotDev }) {
  /**
   * GET /api/conversations
   * Returns list of all conversations for agent inbox
   */
  router.get("/conversations", (req, res) => {
    const conversationList = Array.from(conversations.values())
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((conv) => ({
        id: conv.id,
        language: conv.language,
        lastMessage: getLastMessagePreview(conv),
        updatedAt: conv.updatedAt,
        customerId: conv.customerId,
      }));

    res.json(conversationList);
  });

  /**
   * GET /api/conversations/:id
   * Returns full conversation with all messages
   */
  router.get("/conversations/:id", (req, res) => {
    const conversation = conversations.get(req.params.id);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({
      id: conversation.id,
      customerId: conversation.customerId,
      language: conversation.language,
      messages: conversation.messages,
    });
  });

  /**
   * POST /api/messages
   * Ingests a new customer message
   *
   * Body: { text: string }
   */
  router.post("/messages", async (req, res) => {
    try {
      const { text, customerId } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Message text is required" });
      }

      // Generate a customer ID if not provided (from session/cookie in production)
      const effectiveCustomerId =
        customerId || req.headers["x-customer-id"] || "anonymous";

      console.log("[Customer Message Received]", text);
      console.log("[Customer ID]", effectiveCustomerId);

      // Step 1: Detect the customer's language
      const detectedLocale = await lingoDotDev.recognizeLocale(text);
      console.log("[Language Detected]", detectedLocale);

      // Step 2: Translate to English for agent
      const translationResult = await lingoDotDev.localizeText(text, {
        sourceLocale: detectedLocale,
        targetLocale: "en",
      });
      console.log("[Translation Result]", translationResult);
      const translatedText = translationResult;
      console.log("[Translated to English]", translatedText);

      // Step 3: Find or create conversation
      // Find or create conversation for this customer
      const conversation = findOrCreateConversation(
        effectiveCustomerId,
        detectedLocale,
      );

      // Step 4: Add message to conversation
      const message = {
        role: "customer",
        original_text: text,
        translated_text: translatedText,
        timestamp: new Date(),
      };

      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      await saveConversations();

      // Step 5: Emit to connected agent clients via WebSocket
      io.to("agents").emit("new_message", {
        conversationId: conversation.id,
        message,
      });

      io.to("agents").emit("conversation_updated", {
        id: conversation.id,
        language: conversation.language,
        lastMessage: getLastMessagePreview(conversation),
        updatedAt: conversation.updatedAt,
        customerId: conversation.customerId,
      });

      console.log("[Message Added to Conversation]", conversation.id);

      res.json({
        success: true,
        conversationId: conversation.id,
        customerId: effectiveCustomerId,
        message,
      });
    } catch (error) {
      console.error("[Error Processing Message]", error);
      res.status(500).json({
        error: "Failed to process message",
        details: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/:id/reply
   * Agent sends a reply in English
   *
   * Body: { text: string }
   */
  router.post("/conversations/:id/reply", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { text } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({ error: "Reply text is required" });
      }

      const conversation = conversations.get(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      console.log("[Agent Reply Received]", text);

      // Step 1: Translate agent's English reply to customer's language
      const translationResult = await lingoDotDev.localizeText(text, {
        sourceLocale: "en",
        targetLocale: conversation.customerLocale,
      });
      const translatedText = translationResult;
      console.log(
        `[Translated to ${conversation.customerLocale}]`,
        translatedText,
      );

      // Step 2: Add message to conversation
      const message = {
        role: "agent",
        original_text: text,
        translated_text: translatedText, // For customer to see
        timestamp: new Date(),
      };

      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      await saveConversations();

      // Step 3: Emit to connected clients
      io.to(`customer-${conversation.customerId}`).emit("agent_reply", {
        conversationId: conversation.id,
        message,
      });

      // In a real app, you'd send the translated text to the customer
      // via their channel (chat widget, email, SMS, etc.)
      console.log("[Agent Reply Sent]", conversationId);

      res.json({
        success: true,
        message,
        translatedForCustomer: translatedText,
      });
    } catch (error) {
      console.error("[Error Processing Reply]", error);
      res.status(500).json({
        error: "Failed to process reply",
        details: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/new
   * Start a new conversation (customer initiated)
   *
   * Body: { text: string }
   */
  router.post("/conversations/new", (req, res) => {
    const { customerId } = req.body;
    const effectiveCustomerId =
      customerId || req.headers["x-customer-id"] || "anonymous";

    // Remove existing session mapping
    const existingConvId = customerSessions.get(effectiveCustomerId);
    if (existingConvId) {
      customerSessions.delete(effectiveCustomerId);
      console.log(
        "[New Conversation] Cleared previous session for customer",
        effectiveCustomerId,
      );
    }

    res.json({
      success: true,
      message: "Ready for new conversation",
      customerId: effectiveCustomerId,
    });
  });

  /**
   * DELETE /api/conversations/:id
   * Ends a conversation
   */
  router.delete("/conversations/:id", (req, res) => {
    const conversationId = req.params.id;
    const conversation = conversations.get(conversationId);

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Remove from sessions
    customerSessions.delete(conversation.customerId);

    console.log("[Conversation Ended]", conversationId);

    res.json({ success: true });
  });

  return router;
}
