import express from "express";
import {
  findOrCreateConversation,
  getLastMessagePreview,
  conversations,
  customerSessions,
  saveConversations,
  currentAgentLanguage,
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
      status: conversation.status,
    });
  });

  /**
   * POST /api/conversations/:id/reply
   * Agent sends a reply in their language
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

      if (conversation.status === "resolved") {
        // Allow replies on escalated conversations
        return res.status(403).json({
          error: "Conversation is closed",
          status: conversation.status,
        });
      }

      console.log("[Agent Reply Received]", text);
      console.log("[Agent Language]", currentAgentLanguage);

      // Translate agent's language reply to customer's language
      const translationResult = await lingoDotDev.localizeText(text, {
        sourceLocale: currentAgentLanguage,
        targetLocale: conversation.customerLocale,
      });
      const translatedText = translationResult;
      console.log(
        `[Translated to ${conversation.customerLocale}]`,
        translatedText,
      );

      // Add message to conversation
      const message = {
        role: "agent",
        original_text: text,
        translated_text: translatedText, // For customer to see
        timestamp: new Date(),
      };

      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      await saveConversations();

      // Emit to connected clients
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
   * POST /api/conversations/:id/end-customer
   * Customer ends the conversation
   */
  router.post("/conversations/:id/end-customer", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const conversation = conversations.get(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // Update conversation
      conversation.status = "resolved"; // Mark as resloved for simplicity. Use an appropriate status in real app
      conversation.closedAt = new Date();
      conversation.closedBy = "customer";
      conversation.updatedAt = new Date();

      // Save to file
      await saveConversations();

      // Notify agent
      io.to("agents").emit("conversation_ended", {
        conversationId: conversation.id,
        status: conversation.status,
        closedBy: conversation.closedBy,
      });

      console.log("[Conversation Ended by Customer]", conversationId);

      res.json({
        success: true,
        status: conversation.status,
      });
    } catch (error) {
      console.error("[Error Ending Conversation]", error);
      res.status(500).json({
        error: "Failed to end conversation",
        details: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/:id/resolve
   * Agent marks conversation as resolved
   */
  router.post("/conversations/:id/resolve", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const conversation = conversations.get(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      conversation.status = "resolved";
      conversation.closedAt = new Date();
      conversation.closedBy = "agent";
      conversation.updatedAt = new Date();

      await saveConversations();

      // Notify customer
      io.to(`customer-${conversation.customerId}`).emit("conversation_ended", {
        conversationId: conversation.id,
        status: conversation.status,
        closedBy: conversation.closedBy,
      });

      console.log("[Conversation Resolved by Agent]", conversationId);

      res.json({
        success: true,
        status: conversation.status,
      });
    } catch (error) {
      console.error("[Error Resolving Conversation]", error);
      res.status(500).json({
        error: "Failed to resolve conversation",
        details: error.message,
      });
    }
  });

  /**
   * POST /api/conversations/:id/escalate
   * Agent escalates the conversation
   */
  router.post("/conversations/:id/escalate", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const { reason } = req.body; // Optional escalation reason
      const conversation = conversations.get(conversationId);

      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      conversation.status = "escalated";
      conversation.escalatedAt = new Date();
      conversation.escalationReason = reason || "";
      conversation.updatedAt = new Date();

      await saveConversations();

      // Notify customer
      io.to(`customer-${conversation.customerId}`).emit(
        "conversation_escalated",
        {
          conversationId: conversation.id,
          status: conversation.status,
        },
      );

      console.log("[Conversation Escalated]", conversationId);

      res.json({
        success: true,
        status: conversation.status,
      });
    } catch (error) {
      console.error("[Error Escalating Conversation]", error);
      res.status(500).json({
        error: "Failed to escalate conversation",
        details: error.message,
      });
    }
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

      // Detect the customer's language
      const detectedLocale = await lingoDotDev.recognizeLocale(text);
      console.log("[Language Detected]", detectedLocale);

      // Translate to agent's preferred language
      const translationResult = await lingoDotDev.localizeText(text, {
        sourceLocale: detectedLocale,
        targetLocale: currentAgentLanguage,
      });
      console.log("[Translation Result]", translationResult);
      const translatedText = translationResult;
      console.log("[Translated to agent's language]", translatedText);

      // Find or create conversation
      const conversation = findOrCreateConversation(
        effectiveCustomerId,
        detectedLocale,
      );

      if (conversation.status !== "active") {
        return res.status(403).json({
          error: "Conversation is closed",
          status: conversation.status,
        });
      }

      // Add message to conversation
      const message = {
        role: "customer",
        original_text: text,
        translated_text: translatedText,
        timestamp: new Date(),
      };

      conversation.messages.push(message);
      conversation.updatedAt = new Date();

      await saveConversations();

      // Emit to connected agent clients via WebSocket
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
   * GET api/agent-language
   * Returns the agent's language
   */
  router.get("/agent-language", (req, res) => {
    res.json({ language: currentAgentLanguage });
  });

  return router;
}
