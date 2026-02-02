import { useState } from "react";
import { sendReply } from "../api";

export default function ReplyBox({ conversationId }) {
  const [text, setText] = useState("");

  async function send() {
    if (!text.trim()) return;
    await sendReply(conversationId, text);
    setText("");
  }

  return (
    <div style={{ marginTop: 20 }}>
      <textarea
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Reply in English…"
        style={{ width: "100%" }}
      />
      <button onClick={send} style={{ marginTop: 6 }}>
        Send Reply
      </button>
    </div>
  );
}
