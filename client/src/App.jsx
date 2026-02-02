import Inbox from "./agent/Inbox";
import CustomerPanel from "./customer/CustomerPanel";

function App() {
  const path = window.location.pathname;

  if (path.startsWith("/agent")) {
    return <Inbox />;
  }

  if (path.startsWith("/customer")) {
    return <CustomerPanel />;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Agentic Language Mediation Demo</h2>
      <ul>
        <li>
          <a href="/agent">Open Agent Workspace</a>
        </li>
        <li>
          <a href="/customer">Open Customer Panel</a>
        </li>
      </ul>
    </div>
  );
}

export default App;
