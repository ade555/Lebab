import { useState } from "react";
import Inbox from "./agent/Inbox";
import CustomerChat from "./customer/CustomerChat";
import LanguageSelector from "./utils/LanguageSelector";

const App = () => {
  const path = window.location.pathname;
  const [agentLanguage, setAgentLanguage] = useState(
    localStorage.getItem("agentLanguage") || null,
  );

  const handleLanguageSelect = (lang) => {
    setAgentLanguage(lang);
    localStorage.setItem("agentLanguage", lang);
  };

  if (path.startsWith("/agent")) {
    if (!agentLanguage) {
      return <LanguageSelector onSelect={handleLanguageSelect} />;
    }
    return <Inbox agentLanguage={agentLanguage} />;
  }

  if (path.startsWith("/customer")) {
    return <CustomerChat />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8 sm:p-8">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-10 sm:mb-12 animate-[fadeIn_0.6s_ease-out]">
          <div className="inline-block mb-5 sm:mb-6">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-lg border border-indigo-100">
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600"
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
              <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Lebab
              </span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-4 tracking-tight leading-tight">
            Language Mediation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 mt-2">
              Made Seamless
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed px-2">
            Enable your support team to work entirely in English while
            seamlessly handling customer messages in any language
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 animate-[slideUp_0.8s_ease-out_0.2s_both]">
          <a
            href="/agent"
            className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-indigo-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
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

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                Agent Workspace
              </h3>

              <p className="text-sm sm:text-base text-slate-600 mb-4 leading-relaxed">
                Access the unified inbox where all customer conversations are
                automatically translated into English
              </p>

              <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Open Workspace
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </a>

          <a
            href="/customer"
            className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 hover:border-blue-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-white"
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

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
                Customer Panel
              </h3>

              <p className="text-sm sm:text-base text-slate-600 mb-4 leading-relaxed">
                Simulate customer messages in any language to test the
                translation and mediation workflow
              </p>

              <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                Open Panel
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-10 sm:mt-12 text-center animate-[fadeIn_1s_ease-out_0.4s_both]">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Demo Environment Active
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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

export default App;
