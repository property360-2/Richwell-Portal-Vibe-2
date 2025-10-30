import { useEffect, useState } from "react";

const KEY = "enrollment-sidebar-collapsed";

export default function Sidebar({ sections = [], current, onSelect }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem(KEY);
    if (v != null) setCollapsed(v === "1");
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <aside className={`${collapsed ? "w-12" : "w-64"} transition-[width] duration-200 bg-slate-900 border-r border-slate-800 rounded-2xl overflow-hidden`}>
      <div className="h-12 flex items-center justify-between px-3 border-b border-slate-800">
        {!collapsed && <span className="text-sm font-semibold text-purple-200">Enrollment</span>}
        <button
          aria-label="Toggle sidebar"
          onClick={() => setCollapsed((v) => !v)}
          className="text-slate-300 hover:text-purple-300"
        >
          ☰
        </button>
      </div>
      <nav className="p-2 space-y-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => onSelect(s.key)}
            className={`w-full text-left rounded-lg px-3 py-2 text-xs transition ${current === s.key ? "bg-purple-500/10 text-purple-200" : "hover:bg-slate-800 text-slate-300"}`}
            title={s.title}
          >
            {collapsed ? s.title[0] : s.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

