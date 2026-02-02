import { useState } from "react";
import { ingestMessage } from "../api";

export default function CustomerPanel() {
  const [text, setText] = useState("");
  const [log, setLog] = useState([]);

  async function send() {
    if (!text.trim()) return;
    await ingestMessage(text);
    setLog((l) => [...l, text]);
    setText("");
  }

  return (
    <div style={{ padding: 24 }}>
      <h3>Customer Panel</h3>

      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message in any language…"
        style={{ width: "100%" }}
      />

      <button onClick={send} style={{ marginTop: 8 }}>
        Send
      </button>

      <div style={{ marginTop: 20 }}>
        <strong>Sent messages</strong>
        {log.map((m, i) => (
          <div key={i} style={{ opacity: 0.7 }}>
            {m}
          </div>
        ))}
      </div>
    </div>
  );
}
