import { useState } from "react";
import Inbox from "./agent/Inbox";
import CustomerChat from "./customer/CustomerChat";

function App() {
  const path = window.location.pathname;
  const [agentLanguage, setAgentLanguage] = useState(
    localStorage.getItem("agentLanguage") || null,
  );

  // Handle language selection
  const handleLanguageSelect = (lang) => {
    setAgentLanguage(lang);
    localStorage.setItem("agentLanguage", lang);
  };

  if (path.startsWith("/agent")) {
    // Show language selector if no language selected
    if (!agentLanguage) {
      return <LanguageSelector onSelect={handleLanguageSelect} />;
    }
    return <Inbox agentLanguage={agentLanguage} />;
  }

  if (path.startsWith("/customer")) {
    return <CustomerChat />;
  }

  // Landing page (unchanged)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
      {/* ... your existing landing page code ... */}
    </div>
  );
}

export default App;
