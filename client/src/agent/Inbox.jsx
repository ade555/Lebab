import { useEffect, useState } from "react";
import { fetchConversations } from "../api";
import Conversation from "./Conversation";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, []);

  async function load() {
    const data = await fetchConversations();
    setConversations(data);
    if (!activeId && data.length) {
      setActiveId(data[0].id);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, borderRight: "1px solid #ddd", padding: 12 }}>
        <h4>Inbox</h4>
        {conversations.map((c) => (
          <div
            key={c.id}
            onClick={() => setActiveId(c.id)}
            style={{
              padding: 8,
              cursor: "pointer",
              background: c.id === activeId ? "#f0f0f0" : "transparent",
            }}
          >
            <div>
              <strong>[ {c.language.toUpperCase()} → EN ]</strong>
            </div>
            <div style={{ fontSize: 13 }}>{c.lastMessage}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {activeId && <Conversation conversationId={activeId} />}
      </div>
    </div>
  );
}
