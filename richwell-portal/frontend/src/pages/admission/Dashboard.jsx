import { useEffect, useState } from "react";
import { ClipboardList, ClipboardCheck, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdmissionDashboard } from "../../api/admission.js";

export default function AdmissionDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ students: { new: 0, continuing: 0 }, latestEnrollments: [], programs: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await getAdmissionDashboard(token);
        if (!cancelled) setData(res?.data || {});
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admission Command Center</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Enrollment Overview</h1>
        <p className="text-sm text-slate-400">Track intake performance and review latest enrollment activity.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={<ClipboardList size={18} />} label="New students" value={data?.students?.new || 0} caption="First-time enrollees" />
        <KpiCard icon={<ClipboardCheck size={18} />} label="Continuing students" value={data?.students?.continuing || 0} caption="Cleared for the term" />
        <KpiCard icon={<Users size={18} />} label="Open program slots" value={data?.programs?.reduce((t, p) => t + (p.students || 0), 0) || 0} caption="Active rosters across programs" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300">Latest enrollment actions</h2>
          <p className="text-xs text-slate-500 mb-4">A quick audit of confirmations captured in the last sessions.</p>
          <div className="space-y-3">
            {(!data?.latestEnrollments || data.latestEnrollments.length === 0) && (
              <p className="text-sm text-slate-500 italic">No enrollment yet. Start by encoding a student through the enrollment form.</p>
            )}
            {data?.latestEnrollments?.map((rec) => (
              <article key={rec.id} className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-100">{rec.studentNo}</p>
                  <span className="text-xs uppercase tracking-wide text-emerald-300">{rec.status}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{rec.totalUnits || 0} total units</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300">Process reminders</h2>
          <ul className="mt-3 space-y-3 text-sm text-slate-300">
            <li className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">Validate INC resolutions before clearing prerequisites.</li>
            <li className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">Offer alternate sections when slots fall below 5.</li>
            <li className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">Auto-email new applicants once subjects are encoded.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ icon, label, value, caption }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className="text-xl font-semibold text-slate-100">{value}</p>
          <p className="text-xs text-slate-500">{caption}</p>
        </div>
      </div>
    </div>
  );
}
