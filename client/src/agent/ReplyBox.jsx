import { useState } from "react";
import { sendReply } from "../api";

export default function ReplyBox({ conversationId, onReplySent }) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function send() {
    if (!text.trim() || isSending) return;

    setIsSending(true);
    try {
      const response = await sendReply(conversationId, text);
      if (response.message && onReplySent) {
        onReplySent(response.message);
      }
      setText("");
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

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <div className="bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your reply in English... (Press Enter to send, Shift+Enter for new line)"
          className="w-full px-4 py-3 bg-transparent text-slate-900 placeholder-slate-400 resize-none focus:outline-none text-sm leading-relaxed"
          rows={3}
          disabled={isSending}
        />

        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSending}
              title="Attach file"
            >
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>

            <button
              type="button"
              className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              disabled={isSending}
              title="Insert emoji"
            >
              <svg
                className="w-5 h-5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>

            <div className="h-5 w-px bg-slate-300" />
          </div>

          <button
            onClick={send}
            disabled={!text.trim() || isSending}
            className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg font-medium text-sm hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
                  className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
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
        Your reply will be automatically translated to the customer's language
        before delivery
      </p>
    </div>
  );
}
