import { useMemo } from "react";
import { Users, TrendingUp, GraduationCap } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DeanDashboard() {
  const { portalData } = useAuth();
  const totalStudents = useMemo(
    () => portalData.programs.reduce((total, program) => total + program.students, 0),
    [portalData.programs]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Academic performance</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Dean oversight board</h1>
        <p className="text-sm text-slate-400">Summaries of faculty coverage, enrolment volume, and curriculum health.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard icon={<Users size={18} />} label="Teaching faculty" value="18" caption="Across five programs" />
        <KpiCard icon={<GraduationCap size={18} />} label="Active students" value={totalStudents} caption="Based on program rosters" />
        <KpiCard icon={<TrendingUp size={18} />} label="Average pass rate" value="91%" caption="Current term" />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Program health summary</h2>
            <p className="text-xs text-slate-500">Monitor performance signals per college.</p>
          </div>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {portalData.programs.map((program) => (
            <article key={program.id} className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 text-sm text-slate-300">
              <p className="text-purple-200 font-semibold">{program.name}</p>
              <p>{program.students} students · {program.growth}% growth</p>
              <p className="text-xs text-slate-500 mt-2">Action: Align capstone defenses and track licensure review.</p>
            </article>
          ))}
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
          <p className="text-xl font-semibold text-yellow-300">{value}</p>
          <p className="text-xs text-slate-500">{caption}</p>
        </div>
      </div>
    </div>
  );
}
