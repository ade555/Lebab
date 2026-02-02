import { useEffect, useState } from "react";
import { sendReply } from "../api";
import ReplyBox from "./ReplyBox";

export default function Conversation({ conversationId }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch(
        `http://localhost:3001/api/conversations/${conversationId}`,
      );
      const data = await res.json();
      setMessages(data.messages);
    }
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, [conversationId]);

  return (
    <div style={{ padding: 20 }}>
      <h4>Conversation</h4>

      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <strong>{m.role === "agent" ? "Agent" : "Customer"}</strong>
          <div>{m.translated_text}</div>
          {m.original_text !== m.translated_text && (
            <div style={{ fontSize: 12, opacity: 0.6 }}>
              Original: {m.original_text}
            </div>
          )}
        </div>
      ))}

      <ReplyBox conversationId={conversationId} />
    </div>
  );
}
