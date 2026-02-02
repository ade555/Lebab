import { useEffect, useState, useRef } from "react";
import {
  ingestMessage,
  fetchConversation,
  onNewMessage,
  initializeSocket,
  startNewConversation,
  getCurrentCustomerId,
} from "../api";

export default function CustomerChat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [customerLanguage, setCustomerLanguage] = useState("en");
  const [customerId, setCustomerId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize WebSocket
    initializeSocket();

    // Get customer ID
    const id = getCurrentCustomerId();
    setCustomerId(id);
    console.log("[Customer ID]", id);

    // Load conversation ID from localStorage (simulating a session)
    const savedConvId = localStorage.getItem("customerConversationId");
    if (savedConvId) {
      setConversationId(savedConvId);
      loadConversation(savedConvId);
    }

    // Listen for new messages (agent replies)
    const cleanup = onNewMessage(({ conversationId: msgConvId, message }) => {
      const currentConvId = localStorage.getItem("customerConversationId");
      if (msgConvId === currentConvId) {
        setMessages((prev) => [...prev, message]);
        setTimeout(scrollToBottom, 100);
      }
    });

    return cleanup;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadConversation(convId) {
    try {
      const data = await fetchConversation(convId);
      setMessages(data.messages);
      setCustomerLanguage(data.language);
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }

  async function send() {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await ingestMessage(text);

      // Save conversation ID for this session
      if (response.conversationId) {
        const newConvId = response.conversationId;
        setConversationId(newConvId);
        localStorage.setItem("customerConversationId", newConvId);
        // Note: conversationId should stay the same for subsequent messages
        // The backend tracks this by customerId
      }
      setText("");
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleStartNewConversation = async () => {
    try {
      await startNewConversation();

      // Clear local state
      localStorage.removeItem("customerConversationId");
      setConversationId(null);
      setMessages([]);
      setText("");

      console.log("[New Conversation Started]");
    } catch (error) {
      console.error("Error starting new conversation:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">
                  Support Chat
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs text-slate-500">
                    Agent available
                  </span>
                </div>
              </div>
            </div>

            {conversationId && (
              <button
                onClick={handleStartNewConversation}
                className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Start new chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Welcome to Support Chat
              </h3>
              <p className="text-slate-600 mb-6">
                Type a message in any language to get started
              </p>

              {/* Quick start buttons */}
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
                {[
                  { lang: "EN", text: "Hello, I need help with my order" },
                  { lang: "ES", text: "Hola, necesito ayuda con mi pedido" },
                  { lang: "FR", text: "Bonjour, j'ai besoin d'aide" },
                  { lang: "DE", text: "Hallo, ich brauche Hilfe" },
                ].map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setText(msg.text)}
                    className="text-sm px-4 py-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg transition-all shadow-sm"
                  >
                    <span className="font-semibold text-blue-600">
                      {msg.lang}:
                    </span>{" "}
                    <span className="text-slate-700">{msg.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => {
                const isCustomer = m.role === "customer";
                // Customers see their original text, but agent replies translated
                const displayText = isCustomer
                  ? m.original_text
                  : m.translated_text;

                return (
                  <div
                    key={i}
                    className={`flex ${isCustomer ? "justify-end" : "justify-start"} animate-[slideIn_0.3s_ease-out]`}
                  >
                    <div
                      className={`max-w-lg ${isCustomer ? "order-2" : "order-1"}`}
                    >
                      {/* Message Header */}
                      <div
                        className={`flex items-center gap-2 mb-2 ${isCustomer ? "justify-end" : "justify-start"}`}
                      >
                        {!isCustomer && (
                          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                              />
                            </svg>
                          </div>
                        )}
                        <span className="text-xs font-semibold text-slate-600">
                          {isCustomer ? "You" : "Support Agent"}
                        </span>
                        {isCustomer && (
                          <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isCustomer
                            ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
                            : "bg-white text-slate-900 border border-slate-200"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {displayText}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send)"
              className="w-full px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm leading-relaxed"
              rows={3}
              disabled={isSending}
            />

            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-500">
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-mono text-xs">
                    Enter
                  </kbd>
                  {" to send"}
                </div>

                {conversationId && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">
                      Connected
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={send}
                disabled={!text.trim() || isSending}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
              >
                {isSending ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-2 text-center">
            Messages are automatically translated for our support team
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
