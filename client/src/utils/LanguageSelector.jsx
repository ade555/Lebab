import React from "react";

const LanguageSelector = ({ onSelect }) => {
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "ar", name: "Arabic", flag: "🇸🇦" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
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

          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Welcome to Agent Workspace
          </h1>
          <p className="text-lg text-slate-600">
            Select your preferred language for customer messages
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Choose Your Language
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => onSelect(lang.code)}
                className="group relative bg-slate-50 hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 rounded-xl p-4 transition-all duration-200 hover:shadow-md"
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{lang.flag}</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {lang.name}
                  </div>
                  <div className="text-xs text-slate-500 uppercase mt-1">
                    {lang.code}
                  </div>
                </div>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-xl border-2 border-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              💡 All customer messages will be automatically translated to your
              selected language
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("agentLanguage");
              window.location.href = "/";
            }}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
