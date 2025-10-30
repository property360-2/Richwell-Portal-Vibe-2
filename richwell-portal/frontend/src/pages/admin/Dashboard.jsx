import { useEffect, useMemo, useState } from "react";
import { Users, Layers, FileText, Building2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdminDashboard } from "../../api/admin.js";

const cards = [
  {
    key: "users",
    title: "Active system users",
    icon: <Users size={18} />,
    tone: "text-yellow-300",
  },
  {
    key: "programs",
    title: "Programs",
    icon: <Layers size={18} />,
    tone: "text-purple-300",
  },
  {
    key: "curriculums",
    title: "Curriculums",
    icon: <FileText size={18} />,
    tone: "text-emerald-300",
  },
  {
    key: "terms",
    title: "Academic terms",
    icon: <Building2 size={18} />,
    tone: "text-blue-300",
  },
];

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({ users: 0, programs: 0, curriculums: 0, terms: 0 });

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      if (!token) return;
      try {
        const res = await getAdminDashboard(token);
        const d = res?.data || {};
        if (!cancelled) setStats({ users: d.users || 0, programs: d.programs || 0, curriculums: d.curriculums || 0, terms: d.departments || 0 });
      } catch {
        // ignore
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">System administration</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Command dashboard</h1>
        <p className="text-sm text-slate-400">Monitor modules, launch updates, and keep the campus data engine humming.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.key} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">
                {card.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{card.title}</p>
                <p className={`text-xl font-semibold ${card.tone}`}>{stats[card.key]}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 text-sm text-slate-300">
        <h2 className="text-lg font-semibold text-purple-300">What’s new</h2>
        <ul className="space-y-2">
          <li>✅ Local role-based routing with persistent sessions via localStorage.</li>
          <li>✅ Dummy datasets seeded for enrolment, grade workflow, and analytics.</li>
          <li>✅ Interactive dashboards styled with the Richwell yellow/purple palette.</li>
        </ul>
      </section>
    </div>
  );
}
