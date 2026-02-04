import { useEffect, useState } from "react";
import {
  fetchConversations,
  initializeAgentSocket,
  onConversationUpdated,
} from "../api";
import Conversation from "./Conversation";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize WebSocket connection
    initializeAgentSocket();

    // Initial load
    loadConversations();

    // Listen for real-time updates
    const cleanup = onConversationUpdated((updatedConv) => {
      setConversations((prev) => {
        const existing = prev.find((c) => c.id === updatedConv.id);

        if (existing) {
          // Update existing conversation
          return prev
            .map((c) =>
              c.id === updatedConv.id ? { ...c, ...updatedConv } : c,
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        } else {
          // Add new conversation
          return [updatedConv, ...prev];
        }
      });

      // Auto-select first conversation if none selected
      if (!activeId) {
        setActiveId(updatedConv.id);
      }
    });

    return cleanup;
  }, [activeId]);

  async function loadConversations() {
    setIsLoading(true);
    const data = await fetchConversations();
    setConversations(data);
    setIsLoading(false);
  }
  const handleCloseConversation = () => {
    setActiveId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
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
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Lebab</h1>
              <p className="text-xs text-slate-500">Agent Workspace</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3 px-2">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tickets
              </h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                {conversations.length}
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 px-4">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-slate-600">
                  Loading conversations...
                </p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">
                  No conversations yet
                </p>
                <p className="text-xs text-slate-500">
                  New messages will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveId(c.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                      c.id === activeId
                        ? "bg-indigo-50 border-l-2 border-indigo-500"
                        : "hover:bg-slate-50 border-l-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${c.id === activeId ? "bg-indigo-500" : "bg-slate-300"}`}
                        />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            c.id === activeId
                              ? "bg-indigo-100 text-indigo-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {c.language.toUpperCase()} → EN
                        </span>
                        {/* Status badge */}
                        {c.status !== "active" && (
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded ${
                              c.status === "escalated"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {c.status}
                          </span>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 transition-colors ${
                          c.id === activeId
                            ? "text-indigo-400"
                            : "text-slate-300 group-hover:text-slate-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                    <p
                      className={`text-sm line-clamp-2 ${
                        c.id === activeId
                          ? "text-slate-900 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {c.lastMessage}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-slate-700">AG</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Agent
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <svg
                className="w-4 h-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeId ? (
          <Conversation
            conversationId={activeId}
            onClose={handleCloseConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-slate-400"
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
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-slate-500">
                Choose a chat from the sidebar to view messages
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
