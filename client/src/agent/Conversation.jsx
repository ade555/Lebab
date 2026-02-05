import { useEffect, useState, useRef } from "react";
import {
  fetchConversation,
  onNewMessage,
  getAgentSocket,
  resolveConversation,
  escalateConversation,
} from "../api";
import ReplyBox from "./ReplyBox";

const Conversation = ({ conversationId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [showOriginal, setShowOriginal] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [conversationStatus, setConversationStatus] = useState("active");
  const [conversationData, setConversationData] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const socket = getAgentSocket();
    // Load conversation messages
    async function load() {
      setIsLoading(true);
      try {
        const data = await fetchConversation(conversationId);
        setMessages(data.messages);
        setConversationStatus(data.status || "active");
        setConversationData(data);
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();

    // Listen for customer ending conversation
    socket.on("conversation_ended", ({ conversationId: endedId, closedBy }) => {
      if (endedId === conversationId && closedBy === "customer") {
        setConversationStatus("resolved");
        alert("Customer has ended this conversation.");
      }
    });

    // Listen for real-time new messages
    const cleanup = onNewMessage(
      socket,
      ({ conversationId: msgConvId, message }) => {
        if (msgConvId === conversationId) {
          setMessages((prev) => [...prev, message]);
          setTimeout(scrollToBottom, 100);
        }
      },
    );

    return () => {
      cleanup();
      socket.off("conversation_ended");
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleOriginal = (index) => {
    setShowOriginal((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleResolve = async () => {
    const confirmed = window.confirm("Mark this conversation as resolved?");
    if (!confirmed) return;

    try {
      await resolveConversation(conversationId);
      setConversationStatus("resolved");
    } catch (error) {
      console.error("Error resolving conversation:", error);
      alert("Failed to resolve conversation.");
    }
  };

  const handleEscalate = async () => {
    const reason = prompt("Enter escalation reason (optional):");

    try {
      await escalateConversation(conversationId, reason);
      setConversationStatus("escalated");
    } catch (error) {
      console.error("Error escalating conversation:", error);
      alert("Failed to escalate conversation.");
    }
  };

  const handleReplySent = (message) => {
    setMessages((prev) => [...prev, message]);
    setTimeout(scrollToBottom, 100);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between mb-2 md:mb-0">
          <div className="flex items-center gap-2 md:gap-0">
            {/* Back button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors md:hidden"
              title="Back to inbox"
            >
              <svg
                className="w-5 h-5 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-slate-900">
                Conversation
              </h2>
              <p className="text-xs md:text-sm text-slate-500 hidden md:block">
                All messages automatically translated
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border ${
                conversationStatus === "active"
                  ? "bg-green-50 border-green-200"
                  : conversationStatus === "escalated"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-slate-100 border-slate-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  conversationStatus === "active"
                    ? "bg-green-500 animate-pulse"
                    : conversationStatus === "escalated"
                      ? "bg-yellow-500"
                      : "bg-slate-400"
                }`}
              />
              <span
                className={`text-xs font-medium capitalize ${
                  conversationStatus === "active"
                    ? "text-green-700"
                    : conversationStatus === "escalated"
                      ? "text-yellow-700"
                      : "text-slate-700"
                }`}
              >
                <span className="hidden sm:inline">
                  {conversationStatus === "active" && "Active query"}
                  {conversationStatus === "escalated" && "Escalated"}
                  {conversationStatus === "resolved" && "Resolved"}
                </span>
                <span className="sm:hidden">
                  {conversationStatus === "active" && "Active"}
                  {conversationStatus === "escalated" && "Escalated"}
                  {conversationStatus === "resolved" && "Resolved"}
                </span>
              </span>
            </div>

            {/* Action Buttons - Hidden on small screens, shown in dropdown or kept visible */}
            {conversationStatus === "active" && (
              <>
                <button
                  onClick={handleEscalate}
                  className="hidden sm:block text-xs px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-lg font-medium transition-colors"
                >
                  Escalate
                </button>
                <button
                  onClick={handleResolve}
                  className="text-xs px-2 sm:px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg font-medium transition-colors"
                >
                  <span className="hidden sm:inline">Resolve</span>
                  <span className="sm:hidden">✓</span>
                </button>
              </>
            )}

            {conversationStatus === "escalated" && (
              <button
                onClick={handleResolve}
                className="text-xs px-2 sm:px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg font-medium transition-colors"
              >
                <span className="hidden sm:inline">Mark as Resolved</span>
                <span className="sm:hidden">Resolve</span>
              </button>
            )}
          </div>
        </div>

        {/* Auto-translate badge - visible on mobile */}
        <div className="flex items-center gap-2 mt-2 md:hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              Auto-translate active
            </span>
          </div>
          {conversationStatus === "active" && (
            <button
              onClick={handleEscalate}
              className="sm:hidden text-xs px-3 py-1.5 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 text-yellow-700 rounded-lg font-medium transition-colors"
            >
              Escalate
            </button>
          )}
        </div>

        {/* Desktop back button and auto-translate */}
        <div className="hidden md:flex items-center gap-2 mt-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="Back to inbox"
          >
            <svg
              className="w-5 h-5 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">
              Auto-translate active
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 md:p-6">
        <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-slate-600">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg
                  className="w-8 h-8 text-slate-400"
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
              <p className="text-sm text-slate-600">No messages yet</p>
            </div>
          ) : (
            messages.map((m, i) => {
              const isAgent = m.role === "agent";
              const isTranslated = m.original_text !== m.translated_text;
              const showingOriginal = showOriginal[i];

              return (
                <div
                  key={i}
                  className={`flex ${isAgent ? "justify-end" : "justify-start"} animate-[slideIn_0.3s_ease-out]`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md md:max-w-xl ${isAgent ? "order-2" : "order-1"}`}
                  >
                    {/* Message Header */}
                    <div
                      className={`flex items-center gap-2 mb-1.5 md:mb-2 ${isAgent ? "justify-end" : "justify-start"}`}
                    >
                      {!isAgent && (
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-white"
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
                      <span className="text-xs font-semibold text-slate-600">
                        {isAgent ? "You" : "Customer"}
                      </span>
                      {isAgent && (
                        <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-white">
                            AG
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`relative rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${
                        isAgent
                          ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
                          : "bg-white text-slate-900 border border-slate-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {isAgent
                          ? m.original_text // agent always sees what they sent
                          : showingOriginal
                            ? m.original_text
                            : m.translated_text}
                      </p>

                      {/* Translation Toggle */}
                      {!isAgent && isTranslated && (
                        <button
                          onClick={() => toggleOriginal(i)}
                          className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-colors ${
                            isAgent
                              ? "text-indigo-100 hover:text-white"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                            />
                          </svg>
                          {showingOriginal
                            ? "Show translation"
                            : "Show original"}
                        </button>
                      )}
                    </div>

                    {/* Translation Badge */}
                    {isTranslated && !isAgent && (
                      <div className="mt-1.5 md:mt-2 flex items-center gap-1.5">
                        <div className="px-2 py-0.5 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-700">
                          Auto-translated
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Reply Box - Conditionally render based on status */}
      <div className="bg-white border-t border-slate-200">
        {conversationStatus === "resolved" ? (
          <div className="p-3 md:p-4 max-w-3xl mx-auto w-full text-center">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
              <svg
                className="w-4 md:w-5 h-4 md:h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs md:text-sm font-medium text-slate-700">
                This conversation has been resolved
              </span>
            </div>
          </div>
        ) : (
          <ReplyBox
            conversationId={conversationId}
            onReplySent={handleReplySent}
          />
        )}
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
};
export default Conversation;
