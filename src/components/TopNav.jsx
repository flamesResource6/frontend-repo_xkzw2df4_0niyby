import { useState } from "react";

export default function TopNav({ currentTab, onChange }) {
  const tabs = [
    { key: "home", label: "Home" },
    { key: "roster", label: "My Shifts" },
    { key: "stats", label: "Statistics" },
  ];
  return (
    <div className="w-full flex items-center justify-between py-4">
      <div className="text-xl font-semibold text-white">ProdTracker</div>
      <div className="flex items-center gap-2 bg-slate-800/60 p-1 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              currentTab === t.key
                ? "bg-blue-500 text-white"
                : "text-blue-200 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
