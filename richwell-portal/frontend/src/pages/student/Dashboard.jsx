import { useEffect, useState } from "react";
import { CalendarDays, Layers, AlertTriangle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getStudentDashboard } from "../../api/student.js";

export default function StudentDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState({ studentNo: "—", program: "—", yearLevel: "—", totalSubjects: 0, hasInc: false });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try { const res = await getStudentDashboard(token); if (!cancelled) setData(res || {}); } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Student Overview</p>
        <div>
          <h1 className="text-2xl font-semibold text-yellow-400">Student No. {data.studentNo}</h1>
          <p className="text-sm text-slate-400">{data.program} • Year {data.yearLevel}</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Metric label="Current Year Level" value={`Year ${data.yearLevel || "—"}`} icon={<CalendarDays size={18} />} />
        <Metric label="Total Enrolled Subjects" value={`${data.totalSubjects || 0}`} icon={<Layers size={18} />} />
        <Metric label="INC Flag" value={data.hasInc ? "Yes" : "No"} icon={<AlertTriangle size={18} />} />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
        <p>For detailed subjects and grades, contact Admission/Registrar. This view shows your current summary.</p>
      </section>
    </div>
  );
}

function Metric({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-5 flex items-center gap-3">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-base font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

